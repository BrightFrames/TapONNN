import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Mail, ChevronRight, Check, X } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import axios from "axios";

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Sign up fields
    const [username, setUsername] = useState("");
    const [fullName, setFullName] = useState("");
    const [gender, setGender] = useState<"male" | "female" | "other">("other");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [countryCode, setCountryCode] = useState("91");

    // OTP verification state
    const [showOTPModal, setShowOTPModal] = useState(false);
    const [otp, setOtp] = useState("");
    const [maskedEmail, setMaskedEmail] = useState("");
    const [otpLoading, setOtpLoading] = useState(false);

    // Username availability state
    const [checkingUsername, setCheckingUsername] = useState(false);
    const [usernameAvailability, setUsernameAvailability] = useState<{ available: boolean; message: string } | null>(null);

    const [loading, setLoading] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

    const { login, signUp, sendSignupOTP, verifySignupOTP, loginWithGoogle, isAuthenticated, isLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Get the redirect path: first check sessionStorage (from Message button click), then location state, default to /dashboard
    const getRedirectPath = () => {
        const sessionRedirect = sessionStorage.getItem('taponn_redirect_after_login');
        if (sessionRedirect) {
            return sessionRedirect;
        }
        return (location.state as any)?.from?.pathname || "/dashboard";
    };
    const from = getRedirectPath();

    // Pre-fill username from URL query parameter
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const usernameParam = params.get('username');
        if (usernameParam && !isLogin) {
            setUsername(usernameParam);
        }
    }, [location.search, isLogin]);

    // Redirect to dashboard if already logged in
    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            // Clear the redirect from sessionStorage after using it
            sessionStorage.removeItem('taponn_redirect_after_login');
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, isLoading, navigate, from]);

    // Debounced username availability check
    useEffect(() => {
        if (isLogin || !username || username.length < 3) {
            setUsernameAvailability(null);
            return;
        }

        setCheckingUsername(true);
        const timer = setTimeout(async () => {
            try {
                const response = await axios.get(`${API_URL}/auth/check-username/${username}`);
                setUsernameAvailability(response.data);
            } catch (error) {
                console.error("Error checking username:", error);
                setUsernameAvailability({ available: false, message: "Error checking availability" });
            } finally {
                setCheckingUsername(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [username, isLogin, API_URL]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isLogin) {
                const { success, error } = await login(email, password);
                if (success) {
                    toast.success("Welcome back!");
                    // Clear redirect after using it
                    sessionStorage.removeItem('taponn_redirect_after_login');
                    navigate(from, { replace: true });
                } else {
                    toast.error(error || "Invalid credentials");
                }
            } else {
                // Sign Up - Send OTP to email
                const { success, error, maskedEmail: masked } = await sendSignupOTP(email, username);

                if (success) {
                    setMaskedEmail(masked || email);
                    setShowOTPModal(true);
                    toast.success("OTP sent to your email!");
                } else {
                    toast.error(error || "Failed to send OTP");
                }
            }
        } catch (err) {
            console.error(err);
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        if (!otp || otp.length < 4) {
            toast.error("Please enter a valid OTP");
            return;
        }

        setOtpLoading(true);
        try {
            const fullPhone = phoneNumber ? `${countryCode}${phoneNumber}` : '';
            const { success, error } = await verifySignupOTP(
                email,
                password,
                username,
                fullName,
                gender,
                fullPhone,
                otp
            );

            if (success) {
                toast.success("Account created successfully!");
                setShowOTPModal(false);
                // Redirect new users to pricing page
                navigate("/pricing", { replace: true });
            } else {
                toast.error(error || "Invalid OTP");
            }
        } catch (err) {
            console.error(err);
            toast.error("Verification failed");
        } finally {
            setOtpLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setOtpLoading(true);
        try {
            const { success, error } = await sendSignupOTP(email, username);
            if (success) {
                toast.success("OTP resent to your email!");
            } else {
                toast.error(error || "Failed to resend OTP");
            }
        } catch (err) {
            toast.error("Failed to resend OTP");
        } finally {
            setOtpLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-muted/40 px-4">
            {/* Background Pattern */}
            <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-50"></div>

            {/* OTP Verification Modal */}
            {showOTPModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <Card className="w-full max-w-[380px] mx-4">
                        <CardHeader className="text-center">
                            <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <Mail className="h-6 w-6 text-primary" />
                            </div>
                            <CardTitle>Verify Your Email</CardTitle>
                            <CardDescription>
                                Enter the OTP sent to {maskedEmail}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-center gap-2">
                                <Input
                                    type="text"
                                    placeholder="Enter 6-digit OTP"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    className="text-center text-lg tracking-widest h-12 max-w-[200px]"
                                    maxLength={6}
                                    autoFocus
                                />
                            </div>
                            <Button
                                className="w-full"
                                onClick={handleVerifyOTP}
                                disabled={otpLoading || otp.length < 4}
                            >
                                {otpLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Verify & Create Account
                            </Button>
                            <div className="text-center text-sm text-muted-foreground">
                                Didn't receive the code?{" "}
                                <button
                                    className="text-primary hover:underline font-medium"
                                    onClick={handleResendOTP}
                                    disabled={otpLoading}
                                >
                                    Resend OTP
                                </button>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button
                                variant="ghost"
                                className="w-full"
                                onClick={() => setShowOTPModal(false)}
                            >
                                Go Back
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            )}

            <Card className="w-full max-w-[420px] shadow-lg border-border/50">
                <CardHeader className="space-y-1">
                    <div className="flex justify-center mb-4">
                        <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold text-lg">
                            TO
                        </div>
                    </div>
                    <CardTitle className="text-2xl text-center font-bold tracking-tight">
                        {isLogin ? "Welcome back" : "Create an account"}
                    </CardTitle>
                    <CardDescription className="text-center text-muted-foreground">
                        {isLogin ? "Enter your details to access your dashboard" : "Fill in your details to get started"}
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
                                    <div className="relative">
                                        <Input
                                            id="signup-username"
                                            placeholder="johndoe"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                                            required
                                            minLength={3}
                                            className="h-10 pr-10"
                                        />
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            {checkingUsername && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                                            {!checkingUsername && usernameAvailability?.available && <Check className="w-4 h-4 text-green-600" />}
                                            {!checkingUsername && usernameAvailability && !usernameAvailability.available && <X className="w-4 h-4 text-red-600" />}
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground">taponn.me/{username || 'username'}</p>
                                    {usernameAvailability && username.length >= 3 && (
                                        <p className={`text-[10px] ${usernameAvailability.available ? 'text-green-600' : 'text-red-600'}`}>
                                            {usernameAvailability.message}
                                        </p>
                                    )}
                                </div>

                                {/* Gender Selection */}
                                <div className="grid gap-2">
                                    <Label>Gender</Label>
                                    <RadioGroup
                                        value={gender}
                                        onValueChange={(value: "male" | "female" | "other") => setGender(value)}
                                        className="flex gap-4"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="male" id="male" />
                                            <Label htmlFor="male" className="font-normal cursor-pointer">Male</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="female" id="female" />
                                            <Label htmlFor="female" className="font-normal cursor-pointer">Female</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="other" id="other" />
                                            <Label htmlFor="other" className="font-normal cursor-pointer">Other</Label>
                                        </div>
                                    </RadioGroup>
                                </div>

                                {/* Phone Number (Optional) */}
                                <div className="grid gap-2">
                                    <Label htmlFor="phone">Phone Number <span className="text-muted-foreground text-xs">(optional)</span></Label>
                                    <div className="flex gap-2">
                                        <div className="flex items-center gap-1 h-10 px-3 border rounded-md bg-muted text-sm text-muted-foreground w-[70px]">
                                            +{countryCode}
                                        </div>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            placeholder="9876543210"
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                            className="h-10 flex-1"
                                            maxLength={10}
                                        />
                                    </div>
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
                            {!isLogin && (
                                <p className="text-[10px] text-muted-foreground">We'll send a verification code to this email</p>
                            )}
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
                            {isLogin && (
                                <div className="flex justify-end">
                                    <span
                                        className="text-sm text-primary hover:underline cursor-pointer"
                                        onClick={() => navigate("/forgot-password")}
                                    >
                                        Forgot Password?
                                    </span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button className="w-full h-10 font-semibold" type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isLogin ? "Sign In" : (
                                <>
                                    Continue <ChevronRight className="ml-1 h-4 w-4" />
                                </>
                            )}
                        </Button>
                        <div className="text-sm text-center text-muted-foreground">
                            {isLogin ? "Don't have an account? " : "Already have an account? "}
                            <span
                                className="text-primary hover:underline cursor-pointer font-medium"
                                onClick={() => {
                                    setIsLogin(!isLogin);
                                    setEmail("");
                                    setPassword("");
                                    setShowOTPModal(false);
                                    setOtp("");
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
