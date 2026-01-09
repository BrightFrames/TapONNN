import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface User {
    name: string;
    username: string;
    avatar?: string;
    email?: string;
}

interface Link {
    id: string;
    title: string;
    url: string;
    isActive: boolean;
    clicks?: number;
}

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    links: Link[];
    login: (username: string, pass: string) => boolean;
    logout: () => void;
    updateLinks: (links: Link[]) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data
const mockUser: User = {
    name: "Sourabh Upadhyay",
    username: "sourabhupadhyay",
    avatar: undefined,
    email: "sourabh@example.com"
};

const mockLinks: Link[] = [
    { id: '1', title: 'Instagram', url: 'https://instagram.com/sourabh_upadhyay', isActive: true, clicks: 1240 },
    { id: '2', title: 'Portfolio', url: 'https://sourabh.dev', isActive: true, clicks: 856 },
    { id: '3', title: 'Twitter', url: 'https://twitter.com/sourabh', isActive: true, clicks: 432 },
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [user, setUser] = useState<User | null>(null);
    const [links, setLinks] = useState<Link[]>(mockLinks);

    useEffect(() => {
        const auth = localStorage.getItem("isAuthenticated");
        if (auth === "true") {
            setIsAuthenticated(true);
            setUser(mockUser);
        }
    }, []);

    const login = (username: string, pass: string): boolean => {
        console.log("Attempting login with:", username, pass);
        if (username.trim() === "user" && pass.trim() === "user123") {
            setIsAuthenticated(true);
            setUser(mockUser);
            localStorage.setItem("isAuthenticated", "true");
            return true;
        }
        console.log("Login failed");
        return false;
    };

    const logout = () => {
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem("isAuthenticated");
    };

    const updateLinks = (newLinks: Link[]) => {
        setLinks(newLinks);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, links, login, logout, updateLinks }}>
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

