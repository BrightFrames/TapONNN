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

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: User | null;
    links: Link[];
    selectedTheme: string;
    login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
    loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
    signUp: (email: string, pass: string, username: string, name: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    updateLinks: (links: Link[]) => Promise<void>;
    deleteLink: (linkId: string) => Promise<void>;
    updateTheme: (themeId: string) => Promise<void>;
    updateProfile: (data: Partial<User>) => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [user, setUser] = useState<User | null>(null);
    const [links, setLinks] = useState<Link[]>([]);
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
        if (!token) {
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
                console.warn("Token validation failed, logging out");
                await logout();
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
                email_confirmed_at: new Date().toISOString() // Assuming confirmed if logged in
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
            // Only logout if it's an auth error, not a network error
            const token = getToken();
            if (token && isTokenExpired(token)) {
                await logout();
            }
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

    const signUp = async (email: string, pass: string, username: string, name: string) => {
        try {
            const res = await fetch(`${API_URL}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password: pass, username, full_name: name })
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
                email_confirmed_at: new Date().toISOString()
            });
            setIsAuthenticated(true);

            return { success: true };
        } catch (err: any) {
            console.error("Signup unexpected error:", err);
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
            await fetchUserData(); // Refresh local state
            toast.success("Profile updated");
        } catch (err) {
            console.error("Error updating profile:", err);
            toast.error("Failed to update profile");
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
            logout,
            updateLinks,
            deleteLink,
            updateTheme,
            updateProfile,
            refreshProfile
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
