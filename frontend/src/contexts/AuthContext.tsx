import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface AuthContextType {
    isAuthenticated: boolean;
    login: (username: string, pass: string) => boolean;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

    useEffect(() => {
        const auth = localStorage.getItem("isAuthenticated");
        if (auth === "true") {
            setIsAuthenticated(true);
        }
    }, []);

    const login = (username: string, pass: string): boolean => {
        console.log("Attempting login with:", username, pass);
        if (username.trim() === "user" && pass.trim() === "user123") {
            setIsAuthenticated(true);
            localStorage.setItem("isAuthenticated", "true");
            return true;
        }
        console.log("Login failed");
        return false;
    };

    const logout = () => {
        setIsAuthenticated(false);
        localStorage.removeItem("isAuthenticated");
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
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
