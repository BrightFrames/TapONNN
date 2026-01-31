import { useEffect, useRef } from 'react';

// Hook to track analytics
// Usage: useAnalytics(profileId, { type: 'profile' | 'link', ...metadata })

export const useAnalytics = (profileId: string | undefined) => {
    const hasTrackedView = useRef(false);

    useEffect(() => {
        if (!profileId || hasTrackedView.current) return;

        const trackPageview = async () => {
            try {
                // Get or create session ID
                let sessionId = localStorage.getItem('analytics_session_id');
                if (!sessionId) {
                    sessionId = self.crypto.randomUUID();
                    localStorage.setItem('analytics_session_id', sessionId);
                }

                // Gather Metadata
                const referrer = document.referrer;
                const url = window.location.href;
                const path = window.location.pathname;
                const browser = navigator.userAgent; // Simplified, backend can parse detailed user-agent

                // Simple device detection
                const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
                const device = isMobile ? 'Mobile' : 'Desktop';

                const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

                await fetch(`${API_URL}/analytics/track`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-session-id': sessionId
                    },
                    body: JSON.stringify({
                        profile_id: profileId,
                        session_id: sessionId,
                        event_type: 'pageview',
                        url,
                        path,
                        referrer,
                        browser, // Backend should parse this for better display
                        device,
                        // os and country ideally handled by backend via IP/UA
                    })
                });

                hasTrackedView.current = true;
            } catch (error) {
                console.error("Analytics error:", error);
            }
        };

        trackPageview();

        // Heartbeat for duration tracking could go here (optional)

    }, [profileId]);

    const trackClick = async (linkId: string | null, linkUrl: string) => {
        if (!profileId) return;
        try {
            const sessionId = localStorage.getItem('analytics_session_id') || self.crypto.randomUUID();
            const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

            const body: any = {
                profile_id: profileId,
                session_id: sessionId,
                event_type: 'click',
                link_url: linkUrl,
                path: window.location.pathname
            };

            if (linkId) {
                body.link_id = linkId;
            }

            await fetch(`${API_URL}/analytics/track`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-session-id': sessionId
                },
                body: JSON.stringify(body)
            });
        } catch (error) {
            console.error("Track click error:", error);
        }
    };

    return { trackClick };
};
