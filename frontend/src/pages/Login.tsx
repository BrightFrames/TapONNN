import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Sign up fields
    const [username, setUsername] = useState("");
    const [fullName, setFullName] = useState("");

    const [loading, setLoading] = useState(false);

    const { login, signUp, loginWithGoogle, isAuthenticated, isLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Get the redirect path from ProtectedRoute, default to /dashboard
    const from = (location.state as any)?.from?.pathname || "/dashboard";

    // Redirect to dashboard if already logged in
    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, isLoading, navigate, from]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isLogin) {
                const { success, error } = await login(email, password);
                if (success) {
                    toast.success("Welcome back!");
                    navigate(from, { replace: true });
                } else {
                    toast.error(error || "Invalid credentials");
                }
            } else {
                // Sign Up
                const { success, error } = await signUp(email, password, username, fullName);
                if (success) {
                    toast.success("Account created successfully!");
                    navigate(from, { replace: true });
                } else {
                    toast.error(error || "Sign up failed");
                }
            }
        } catch (err) {
            console.error(err);
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-muted/40 px-4">
            {/* Background Pattern */}
            <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-50"></div>

            <Card className="w-full max-w-[400px] shadow-lg border-border/50">
                <CardHeader className="space-y-1">
                    <div className="flex justify-center mb-4">
                        <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold text-lg">
                            T2
                        </div>
                    </div>
                    <CardTitle className="text-2xl text-center font-bold tracking-tight">
                        {isLogin ? "Welcome back" : "Create an account"}
                    </CardTitle>
                    <CardDescription className="text-center text-muted-foreground">
                        {isLogin ? "Enter your details to access your dashboard" : "Enter your email below to create your account"}
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="grid gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full relative"
                            onClick={() => loginWithGoogle()}
                        >
                            <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                                <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                            </svg>
                            Continue with Google
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-2 text-muted-foreground">
                                    Or continue with
                                </span>
                            </div>
                        </div>

                        {!isLogin && (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="fullname">Full Name</Label>
                                    <Input
                                        id="fullname"
                                        placeholder="John Doe"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        required
                                        className="h-10"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="signup-username">Username</Label>
                                    <Input
                                        id="signup-username"
                                        placeholder="johndoe"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                                        required
                                        minLength={3}
                                        className="h-10"
                                    />
                                    <p className="text-[10px] text-muted-foreground">tap2.me/{username || 'username'}</p>
                                </div>
                            </>
                        )}

                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="h-10"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                className="h-10"
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button className="w-full h-10 font-semibold" type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isLogin ? "Sign In" : "Create Account"}
                        </Button>
                        <div className="text-sm text-center text-muted-foreground">
                            {isLogin ? "Don't have an account? " : "Already have an account? "}
                            <span
                                className="text-primary hover:underline cursor-pointer font-medium"
                                onClick={() => {
                                    setIsLogin(!isLogin);
                                    setEmail("");
                                    setPassword("");
                                }}
                            >
                                {isLogin ? "Sign up" : "Sign in"}
                            </span>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
};

export default Login;
