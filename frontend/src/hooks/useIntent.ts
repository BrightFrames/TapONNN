import { useState, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface IntentResponse {
    success: boolean;
    intent_id: string;
    flow_type: string;
    requires_login: boolean;
    cta_type: string;
    block_content: any;
}

interface UseIntentReturn {
    createIntent: (params: CreateIntentParams) => Promise<IntentResponse | null>;
    resumeIntent: (intentId: string) => Promise<IntentResponse | null>;
    completeIntent: (intentId: string, data: CompleteIntentData) => Promise<boolean>;
    failIntent: (intentId: string, reason: string) => Promise<boolean>;
    loading: boolean;
    error: string | null;
    currentIntent: IntentResponse | null;
}

interface CreateIntentParams {
    profile_id: string;
    block_id: string;
    store_id?: string;
    source?: string;
}

interface CompleteIntentData {
    linked_enquiry_id?: string;
    linked_order_id?: string;
    linked_plugin_install_id?: string;
    transaction?: {
        status: 'pending' | 'confirmed' | 'failed';
        gateway?: string;
        gateway_order_id?: string;
        gateway_payment_id?: string;
        amount?: number;
        currency?: string;
    };
}

/**
 * useIntent Hook
 * 
 * Core flow:
 * 1. createIntent() - Called when ANY CTA is clicked (no login required)
 * 2. If requires_login, show LoginToContinue modal
 * 3. After login, call resumeIntent() to continue
 * 4. After action completes, call completeIntent()
 */
export const useIntent = (): UseIntentReturn => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentIntent, setCurrentIntent] = useState<IntentResponse | null>(null);

    const getToken = () => localStorage.getItem('auth_token');

    // Generate session ID for visitor tracking
    const getSessionId = () => {
        let sessionId = sessionStorage.getItem('tap2_session_id');
        if (!sessionId) {
            sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            sessionStorage.setItem('tap2_session_id', sessionId);
        }
        return sessionId;
    };

    // Generate visitor fingerprint (simplified)
    const getVisitorFingerprint = () => {
        const fp = localStorage.getItem('tap2_visitor_fp');
        if (fp) return fp;

        const newFp = `fp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('tap2_visitor_fp', newFp);
        return newFp;
    };

    /**
     * Create Intent - Called when CTA is clicked
     * This works for BOTH visitors and logged-in users
     */
    const createIntent = useCallback(async (params: CreateIntentParams): Promise<IntentResponse | null> => {
        setLoading(true);
        setError(null);

        try {
            const token = getToken();
            const headers: Record<string, string> = {
                'Content-Type': 'application/json'
            };

            // Add auth header if logged in (optional)
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${API_URL}/intents`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    ...params,
                    session_id: getSessionId(),
                    visitor_fingerprint: getVisitorFingerprint()
                })
            });

            if (!response.ok) {
                const err = await response.json();
                if (err.details) console.error('Intent creation backend error details:', err.details);
                throw new Error(err.error || 'Failed to create intent');
            }

            const data = await response.json();
            setCurrentIntent(data);

            // Store intent ID for resumption after login
            if (data.requires_login) {
                sessionStorage.setItem('tap2_pending_intent', data.intent_id);
            }

            return data;
        } catch (err: any) {
            setError(err.message);
            console.error('Error creating intent:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Resume Intent - Called after login to continue the flow
     */
    const resumeIntent = useCallback(async (intentId: string): Promise<IntentResponse | null> => {
        setLoading(true);
        setError(null);

        try {
            const token = getToken();
            if (!token) {
                throw new Error('Login required');
            }

            const response = await fetch(`${API_URL}/intents/${intentId}/resume`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Failed to resume intent');
            }

            const data = await response.json();
            setCurrentIntent(data);

            // Clear pending intent
            sessionStorage.removeItem('tap2_pending_intent');

            return data;
        } catch (err: any) {
            setError(err.message);
            console.error('Error resuming intent:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Complete Intent - Called after action is done
     */
    const completeIntent = useCallback(async (intentId: string, data: CompleteIntentData): Promise<boolean> => {
        try {
            const token = getToken();

            const response = await fetch(`${API_URL}/intents/${intentId}/complete`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('Failed to complete intent');
            }

            setCurrentIntent(null);
            return true;
        } catch (err) {
            console.error('Error completing intent:', err);
            return false;
        }
    }, []);

    /**
     * Fail Intent - Called when action fails
     */
    const failIntent = useCallback(async (intentId: string, reason: string): Promise<boolean> => {
        try {
            const token = getToken();

            const response = await fetch(`${API_URL}/intents/${intentId}/fail`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ reason })
            });

            if (!response.ok) {
                throw new Error('Failed to fail intent');
            }

            setCurrentIntent(null);
            return true;
        } catch (err) {
            console.error('Error failing intent:', err);
            return false;
        }
    }, []);

    return {
        createIntent,
        resumeIntent,
        completeIntent,
        failIntent,
        loading,
        error,
        currentIntent
    };
};

/**
 * Get pending intent from session storage (for resuming after login)
 */
export const getPendingIntent = (): string | null => {
    return sessionStorage.getItem('tap2_pending_intent');
};

/**
 * Clear pending intent
 */
export const clearPendingIntent = (): void => {
    sessionStorage.removeItem('tap2_pending_intent');
};

export default useIntent;
