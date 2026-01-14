import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface User {
    id: string;
    name: string;
    username: string;
    avatar?: string;
    email?: string;
    email_confirmed_at?: string;
}

interface Link {
    id: string;
    title: string;
    url: string;
    isActive: boolean;
    clicks?: number;
    user_id?: string;
    position?: number;
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [user, setUser] = useState<User | null>(null);
    const [links, setLinks] = useState<Link[]>([]);
    const [selectedTheme, setSelectedTheme] = useState<string>("artemis");

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

    const fetchUserData = async (userId: string) => {
        try {
            // Fetch Profile via Supabase for Auth
            let { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();

            // Handle OAuth First Time Login (Profile creation)
            if (!profile) {
                const { data: { user: authUser } } = await supabase.auth.getUser();
                if (authUser) {
                    // Create default username from email or metadata
                    const baseName = authUser.user_metadata.full_name || authUser.email?.split('@')[0] || "user";
                    const randomSuffix = Math.floor(Math.random() * 10000);
                    const cleanName = baseName.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
                    const newUsername = `${cleanName}${randomSuffix}`;

                    const { data: newProfile, error: createError } = await supabase
                        .from('profiles')
                        .insert([{
                            id: userId,
                            username: newUsername,
                            full_name: authUser.user_metadata.full_name || "New User",
                            avatar_url: authUser.user_metadata.avatar_url,
                            email: authUser.email,
                            selected_theme: 'artemis'
                        }])
                        .select()
                        .single();

                    if (createError) {
                        console.error("Auto-creation of profile failed", createError);
                        return;
                    }
                    profile = newProfile;
                }
            }

            if (profile) {
                // Get auth user to check email verification status
                const { data: { user: authUser } } = await supabase.auth.getUser();

                setUser({
                    id: profile.id,
                    name: profile.full_name,
                    username: profile.username,
                    avatar: profile.avatar_url,
                    email: profile.email || authUser?.email,
                    email_confirmed_at: authUser?.email_confirmed_at
                });
                setSelectedTheme(profile.selected_theme || "artemis");

                // Fetch Links via Backend API (Securely)
                const { data: { session } } = await supabase.auth.getSession();
                const token = session?.access_token;

                if (token) {
                    try {
                        const linksRes = await fetch(`${API_URL}/my-links`, {
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
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
                                    user_id: l.user_id
                                })));
                            }
                        }
                    } catch (e) {
                        console.error("API Link Fetch Error", e);
                    }
                }
            }

        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    };

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                setIsAuthenticated(true);
                fetchUserData(session.user.id);
            } else {
                setIsAuthenticated(false);
            }
            setIsLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) {
                setIsAuthenticated(true);
                fetchUserData(session.user.id);
            } else {
                setIsAuthenticated(false);
                setUser(null);
                setLinks([]);
            }
            setIsLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const login = async (email: string, pass: string) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password: pass,
        });

        if (error) {
            console.error("Login error:", error);
            return { success: false, error: error.message };
        }
        return { success: true };
    };

    const loginWithGoogle = async () => {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/dashboard`
            }
        });

        if (error) {
            return { success: false, error: error.message };
        }
        return { success: true };
    };

    const signUp = async (email: string, pass: string, username: string, name: string) => {
        // 1. Check if username exists
        const { data: existingUser } = await supabase
            .from('profiles')
            .select('username')
            .eq('username', username)
            .single();

        if (existingUser) {
            return { success: false, error: "Username already taken" };
        }

        // 2. Sign up auth user
        const { data, error } = await supabase.auth.signUp({
            email,
            password: pass,
        });

        if (error) {
            return { success: false, error: error.message };
        }

        if (data.user) {
            // 3. Create profile
            const { error: profileError } = await supabase
                .from('profiles')
                .insert([
                    {
                        id: data.user.id,
                        username,
                        full_name: name,
                        selected_theme: 'artemis'
                    }
                ]);

            if (profileError) {
                return { success: false, error: "Account created but profile setup failed. Please contact support." };
            }
        }

        return { success: true };
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setIsAuthenticated(false);
        setUser(null);
        setLinks([]);
    };

    const updateLinks = async (newLinks: Link[]) => {
        setLinks(newLinks);
        if (!user) return;

        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        if (!token) return;

        try {
            await fetch(`${API_URL}/links`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ links: newLinks }) // userId removed, server gets it from token
            });

            // Refresh
            // await fetchUserData(user.id);
        } catch (err) {
            console.error("Error syncing links:", err);
            toast.error("Failed to save changes");
        }
    };

    const deleteLink = async (linkId: string) => {
        if (!user) return;

        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        if (!token) {
            toast.error("Not authenticated");
            return;
        }

        // Optimistic update - remove from local state immediately
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
                // Revert on failure
                setLinks(previousLinks);
                const error = await response.json();
                toast.error(error.error || "Failed to delete link");
            } else {
                toast.success("Link deleted");
            }
        } catch (err) {
            // Revert on error
            setLinks(previousLinks);
            console.error("Error deleting link:", err);
            toast.error("Failed to delete link");
        }
    };

    const updateTheme = async (themeId: string) => {
        setSelectedTheme(themeId);
        if (user) {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            if (token) {
                await fetch(`${API_URL}/profile/theme`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ themeId })
                });
            }
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
            logout,
            updateLinks,
            deleteLink,
            updateTheme
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
