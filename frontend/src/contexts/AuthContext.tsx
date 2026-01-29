import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { toast } from "sonner";

interface User {
    id: string;
    name: string;
    username: string;
    avatar?: string;
    email?: string;
    email_confirmed_at?: string;
    social_links?: Record<string, string>;
    design_config?: any;
    // Role-based profile handling
    role?: 'super' | 'personal';
    has_store?: boolean;
    active_profile_mode?: 'personal' | 'store';
    // Gender for avatar generation
    gender?: 'male' | 'female' | 'other';
    phone_verified?: boolean;
    // Language preference for i18n
    language?: string;
    // Optimistic UI Data
    identities?: {
        personal: {
            username: string;
            full_name: string;
            bio: string;
            avatar_url: string;
            selected_theme: string;
            design_config: any;
        };
        store: {
            username: string;
            full_name: string;
            bio: string;
            avatar_url: string;
            selected_theme: string;
            design_config: any;
        };
    };
}


interface Link {
    id: string;
    title: string;
    url: string;
    isActive: boolean;
    clicks?: number;
    user_id?: string;
    position?: number;
    thumbnail?: string;
}

export interface Block {
    _id: string; // Backend uses _id
    block_type: string;
    title: string;
    content: any;
    cta_type?: string;
    cta_label?: string;
    cta_requires_login?: boolean;
    is_active: boolean;
    position: number;
    thumbnail?: string;
    user_id?: string;
}

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: User | null;
    links: Link[];
    selectedTheme: string;
    login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
    loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
    signUp: (email: string, pass: string, username: string, name: string, gender?: string, phone_number?: string) => Promise<{ success: boolean; error?: string }>;
    sendSignupOTP: (email: string, username: string) => Promise<{ success: boolean; error?: string; maskedEmail?: string }>;
    verifySignupOTP: (email: string, pass: string, username: string, name: string, gender: string, phone_number: string, otp: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    addLink: () => Promise<Link | null>;
    updateLinks: (links: Link[]) => Promise<void>;
    deleteLink: (linkId: string) => Promise<void>;
    updateTheme: (themeId: string) => Promise<void>;
    updateProfile: (data: Partial<User>) => Promise<void>;
    refreshProfile: () => Promise<void>;
    // Block methods
    blocks: Block[];
    addBlock: (blockData: Partial<Block>) => Promise<Block | null>;
    updateBlock: (blockId: string, updates: Partial<Block>) => Promise<void>;
    deleteBlock: (blockId: string) => Promise<void>;
    reorderBlocks: (blocks: Block[]) => Promise<void>;
    // Profile mode switching (Super Users)
    switchProfileMode: (mode: 'personal' | 'store') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [user, setUser] = useState<User | null>(null);
    const [links, setLinks] = useState<Link[]>([]);
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [selectedTheme, setSelectedTheme] = useState<string>("artemis");

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

    // Helper to get token
    const getToken = () => localStorage.getItem('auth_token');

    // Check if token is expired (JWT decode without verification)
    const isTokenExpired = (token: string): boolean => {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const expiry = payload.exp * 1000; // Convert to milliseconds
            return Date.now() >= expiry;
        } catch {
            return true; // Invalid token format
        }
    };

    // Validate token on mount and periodically
    const validateToken = async (): Promise<boolean> => {
        const token = getToken();
        if (!token) return false;

        if (isTokenExpired(token)) {
            await logout();
            return false;
        }
        return true;
    };

    const fetchUserData = async () => {
        const token = getToken();

        // No token - not authenticated
        if (!token) {
            setIsAuthenticated(false);
            setUser(null);
            setIsLoading(false);
            return;
        }

        // Check if token is expired before making API call
        if (isTokenExpired(token)) {
            console.warn("Token expired, clearing auth state");
            localStorage.removeItem('auth_token');
            setIsAuthenticated(false);
            setUser(null);
            setLinks([]);
            setIsLoading(false);
            return;
        }

        try {
            // 1. Fetch User Profile
            const res = await fetch(`${API_URL}/auth/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) {
                // Token invalid or expired - clear auth state
                console.warn("Token validation failed, clearing auth state");
                localStorage.removeItem('auth_token');
                setIsAuthenticated(false);
                setUser(null);
                setLinks([]);
                setIsLoading(false);
                return;
            }

            const profile = await res.json();

            setUser({
                id: profile.id,
                name: profile.full_name,
                username: profile.username,
                avatar: profile.avatar_url,
                email: profile.email,
                social_links: profile.social_links || {},
                design_config: profile.design_config || {},
                email_confirmed_at: new Date().toISOString(), // Assuming confirmed if logged in
                // Role-based profile handling
                role: profile.role || 'super',
                has_store: profile.has_store || false,
                active_profile_mode: profile.active_profile_mode || 'personal'
            });
            setSelectedTheme(profile.selected_theme || "artemis");
            setIsAuthenticated(true);

            // 2. Fetch Links
            const linksRes = await fetch(`${API_URL}/my-links`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (linksRes.ok) {
                const userLinks = await linksRes.json();
                if (Array.isArray(userLinks)) {
                    setLinks(userLinks.map((l: any) => ({
                        id: l.id,
                        title: l.title,
                        url: l.url,
                        isActive: l.is_active,
                        clicks: l.clicks,
                        user_id: l.user_id,
                        position: l.position
                    })));
                }
            }

        } catch (error) {
            console.error("Error fetching user data:", error);
            // Don't clear auth state on network error - could be temporary
            // Just stop loading
            // setIsAuthenticated(false);
            // setUser(null);
            // setLinks([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    const login = async (email: string, pass: string) => {
        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password: pass })
            });

            const data = await res.json();

            if (!res.ok) {
                return { success: false, error: data.error };
            }

            // Save token
            localStorage.setItem('auth_token', data.token);

            // Set state
            setUser({
                id: data.user.id,
                name: data.user.full_name,
                username: data.user.username,
                avatar: data.user.avatar,
                email: data.user.email,
                email_confirmed_at: new Date().toISOString()
            });
            setIsAuthenticated(true);

            // Fetch links immediately
            fetchUserData();

            return { success: true };
        } catch (err: any) {
            console.error("Login unexpected error:", err);
            return { success: false, error: "Network error" };
        }
    };

    const loginWithGoogle = async () => {
        // Placeholder - requires backend Oauth implementation
        toast.info("Google Login temporarily unavailable due to backend migration.");
        return { success: false, error: "Not implemented" };
    };

    const signUp = async (email: string, pass: string, username: string, name: string, gender?: string, phone_number?: string) => {
        try {
            const res = await fetch(`${API_URL}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    password: pass,
                    username,
                    full_name: name,
                    gender: gender || 'other',
                    phone_number: phone_number || ''
                })
            });

            const data = await res.json();

            if (!res.ok) {
                return { success: false, error: data.error };
            }

            // Save token
            localStorage.setItem('auth_token', data.token);

            // Set state
            setUser({
                id: data.user.id,
                name: data.user.full_name,
                username: data.user.username,
                email: data.user.email,
                avatar: data.user.avatar,
                gender: data.user.gender,
                email_confirmed_at: new Date().toISOString()
            });
            setIsAuthenticated(true);

            return { success: true };
        } catch (err: any) {
            console.error("Signup unexpected error:", err);
            return { success: false, error: "Network error" };
        }
    };

    // Send OTP to email for signup verification
    const sendSignupOTP = async (email: string, username: string) => {
        try {
            const res = await fetch(`${API_URL}/auth/signup/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, username })
            });

            const data = await res.json();

            if (!res.ok) {
                return { success: false, error: data.error };
            }

            return { success: true, maskedEmail: data.maskedEmail };
        } catch (err: any) {
            console.error("Send signup OTP error:", err);
            return { success: false, error: "Network error" };
        }
    };

    // Verify OTP and complete signup
    const verifySignupOTP = async (email: string, pass: string, username: string, name: string, gender: string, phone_number: string, otp: string) => {
        try {
            const res = await fetch(`${API_URL}/auth/signup/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    password: pass,
                    username,
                    full_name: name,
                    gender,
                    phone_number,
                    otp
                })
            });

            const data = await res.json();

            if (!res.ok) {
                return { success: false, error: data.error };
            }

            // Save token
            localStorage.setItem('auth_token', data.token);

            // Set state
            setUser({
                id: data.user.id,
                name: data.user.full_name,
                username: data.user.username,
                email: data.user.email,
                avatar: data.user.avatar,
                gender: data.user.gender,
                phone_verified: data.user.phone_verified,
                email_confirmed_at: new Date().toISOString()
            });
            setIsAuthenticated(true);

            return { success: true };
        } catch (err: any) {
            console.error("Verify signup OTP error:", err);
            return { success: false, error: "Network error" };
        }
    };

    const logout = async () => {
        // Clear all auth-related storage
        localStorage.removeItem('auth_token');
        sessionStorage.clear();

        // Reset all auth state
        setIsAuthenticated(false);
        setUser(null);
        setLinks([]);
        setSelectedTheme('artemis');


        toast.success("Logged out successfully");
    };

    // Add a single new link
    const addLink = async (): Promise<Link | null> => {
        const token = getToken();
        if (!token) {
            toast.error("Not authenticated");
            return null;
        }

        const newLink: Link = {
            id: '', // Will be assigned by backend
            title: 'New Link',
            url: '',
            isActive: true,
            clicks: 0,
            position: 0,
            thumbnail: ''
        };

        try {
            const res = await fetch(`${API_URL}/links/single`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newLink)
            });

            if (!res.ok) {
                const error = await res.json();
                toast.error(error.error || "Failed to add link");
                return null;
            }

            const data = await res.json();
            const createdLink: Link = {
                id: data.id,
                title: data.title,
                url: data.url,
                isActive: data.is_active,
                clicks: data.clicks,
                position: data.position,
                thumbnail: data.thumbnail
            };

            // Add to beginning and update positions
            setLinks(prev => [createdLink, ...prev.map((l, i) => ({ ...l, position: i + 1 }))]);
            return createdLink;
        } catch (err) {
            console.error("Error adding link:", err);
            toast.error("Failed to add link");
            return null;
        }
    };

    const updateLinks = async (newLinks: Link[]) => {
        setLinks(newLinks);
        const token = getToken();
        if (!token) return;

        try {
            await fetch(`${API_URL}/links`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ links: newLinks })
            });
        } catch (err) {
            console.error("Error syncing links:", err);
            toast.error("Failed to save changes");
        }
    };

    const deleteLink = async (linkId: string) => {
        const token = getToken();
        if (!token) {
            toast.error("Not authenticated");
            return;
        }

        // Optimistic update
        const previousLinks = links;
        setLinks(links.filter(l => l.id !== linkId));

        try {
            const response = await fetch(`${API_URL}/links/${linkId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                setLinks(previousLinks);
                const error = await response.json();
                toast.error(error.error || "Failed to delete link");
            } else {
                toast.success("Link deleted");
            }
        } catch (err) {
            setLinks(previousLinks);
            console.error("Error deleting link:", err);
            toast.error("Failed to delete link");
        }
    };

    const updateProfile = async (data: Partial<User>) => {
        const token = getToken();
        if (!token) return;

        try {
            await fetch(`${API_URL}/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            // Optimistic Update: Update local user state immediately
            setUser(prev => prev ? {
                ...prev,
                ...data, // This will include social_links with empty strings
                social_links: {
                    ...(prev.social_links || {}),
                    ...(data.social_links || {})
                }
            } : null);

            await fetchUserData(); // Refresh local state from server to confirm
            toast.success("Profile updated");
        } catch (err) {
            console.error("Error updating profile:", err);
            toast.error("Failed to update profile");
            // Revert on error could be implemented here if we tracked previous state
            await fetchUserData(); // Force sync on error
        }
    };

    const updateTheme = async (themeId: string) => {
        setSelectedTheme(themeId);
        const token = getToken();
        if (!token) return;

        await fetch(`${API_URL}/profile/theme`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ themeId })
        });
    };

    const refreshProfile = async () => {
        await fetchUserData();
    };

    // --- Block Methods ---

    const addBlock = async (blockData: Partial<Block>): Promise<Block | null> => {
        const token = getToken();
        if (!token) return null;

        try {
            const res = await fetch(`${API_URL}/blocks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(blockData)
            });

            if (!res.ok) {
                const error = await res.json();
                toast.error(error.message || "Failed to create block");
                return null;
            }

            const newBlock = await res.json();
            setBlocks(prev => [newBlock, ...prev]);
            toast.success("Block added successfully");
            return newBlock;
        } catch (err) {
            console.error("Error adding block:", err);
            toast.error("Failed to add block");
            return null;
        }
    };

    const updateBlock = async (blockId: string, updates: Partial<Block>) => {
        // Optimistic update
        setBlocks(prev => prev.map(b => b._id === blockId ? { ...b, ...updates } : b));

        const token = getToken();
        if (!token) return;

        try {
            await fetch(`${API_URL}/blocks/${blockId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updates)
            });
        } catch (err) {
            console.error("Error updating block:", err);
            toast.error("Failed to save changes");
            await fetchUserData(); // Revert
        }
    };

    const deleteBlock = async (blockId: string) => {
        // Optimistic
        const prevBlocks = blocks;
        setBlocks(prev => prev.filter(b => b._id !== blockId));

        const token = getToken();
        if (!token) return;

        try {
            const res = await fetch(`${API_URL}/blocks/${blockId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) throw new Error("Failed to delete");
            toast.success("Block deleted");
        } catch (err) {
            console.error("Error deleting block:", err);
            toast.error("Failed to delete block");
            setBlocks(prevBlocks); // Revert
        }
    };

    const reorderBlocks = async (reorderedBlocks: Block[]) => {
        setBlocks(reorderedBlocks); // Optimistic

        const token = getToken();
        if (!token) return;

        try {
            await fetch(`${API_URL}/blocks/reorder`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    blocks: reorderedBlocks.map((b, i) => ({ id: b._id, position: i }))
                })
            });
        } catch (err) {
            console.error("Error reordering blocks:", err);
        }
    };

    // Switch profile mode (for Super Users)
    const switchProfileMode = async (mode: 'personal' | 'store') => {
        const token = getToken();
        if (!token || !user) return;

        // --- OPTIMISTIC UPDATE START ---

        const previousUser = user; // Backup for revert

        // 1. Check if we have cached identity data to switch INSTANTLY
        if (user.identities && user.identities[mode]) {
            const nextIdentity = user.identities[mode];
            const nextUser: User = {
                ...user,
                // Update identity fields
                username: nextIdentity.username,
                name: nextIdentity.full_name, // Note: frontend uses 'name' backend uses 'full_name'
                avatar: nextIdentity.avatar_url, // Note: frontend 'avatar' vs backend 'avatar_url'
                // Update mode
                active_profile_mode: mode,
                // Update role-based flags (heuristic)
                has_store: mode === 'store' ? true : user.has_store, // If switching to store, they have it
            };

            // Apply Theme immediately
            if (nextIdentity.selected_theme) {
                setSelectedTheme(nextIdentity.selected_theme);
            }

            // Update State INSTANTLY
            setUser(nextUser);
        } else {
            // Fallback: Just update the mode flag if no full identity data (still faster than waiting)
            setUser(prev => prev ? { ...prev, active_profile_mode: mode } : null);
        }

        // --- OPTIMISTIC UPDATE END ---

        try {
            const res = await fetch(`${API_URL}/profile/switch-mode`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ mode })
            });

            if (!res.ok) {
                const error = await res.json();
                toast.error(error.error || 'Failed to switch profile mode');

                // REVERT on failure
                setUser(previousUser);
                if (previousUser?.active_profile_mode === 'personal' && previousUser.identities?.personal?.selected_theme) {
                    setSelectedTheme(previousUser.identities.personal.selected_theme);
                } else if (previousUser?.active_profile_mode === 'store' && previousUser.identities?.store?.selected_theme) {
                    setSelectedTheme(previousUser.identities.store.selected_theme);
                }

                await fetchUserData(); // Force sync
            } else {
                const data = await res.json();
                toast.success(`Switched to ${mode === 'personal' ? 'Personal Profile' : 'Store Profile'}`);

                // Update with server truth (eventual consistency)
                if (data.user) {
                    setUser(data.user);
                    // Ensure theme matches trusted server response
                    if (data.user.selected_theme) {
                        setSelectedTheme(data.user.selected_theme);
                    }
                }
            }
        } catch (err) {
            console.error('Error switching profile mode:', err);
            toast.error('Failed to switch profile mode');

            // REVERT on failure
            setUser(previousUser);
            await fetchUserData(); // Force sync
        }
    };

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            isLoading,
            user,
            links,
            selectedTheme,
            login,
            loginWithGoogle,
            signUp,
            sendSignupOTP,
            verifySignupOTP,
            logout,
            addLink,
            updateLinks,
            deleteLink,
            updateTheme,
            updateProfile,
            refreshProfile,
            blocks,
            addBlock,
            updateBlock,
            deleteBlock,
            reorderBlocks,
            switchProfileMode
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
