import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Mail, Phone, KeyRound, Lock, CheckCircle } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

type Step = "email" | "otp" | "reset" | "success";

const ForgotPassword = () => {
    const [step, setStep] = useState<Step>("email");
    const [loading, setLoading] = useState(false);

    // Form data
    const [email, setEmail] = useState("");
    const [maskedPhone, setMaskedPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [resetToken, setResetToken] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const navigate = useNavigate();

    // Step 1: Send OTP
    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/auth/forgot-password/send-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setMaskedPhone(data.maskedPhone);
                setStep("otp");
                toast.success(`OTP sent to ${data.maskedPhone}`);
            } else {
                toast.error(data.error || "Failed to send OTP");
            }
        } catch (err) {
            console.error(err);
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    // Resend OTP
    const handleResendOTP = async () => {
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/auth/forgot-password/resend-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                toast.success("OTP resent successfully");
            } else {
                toast.error(data.error || "Failed to resend OTP");
            }
        } catch (err) {
            console.error(err);
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP
    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/auth/forgot-password/verify-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setResetToken(data.resetToken);
                setStep("reset");
                toast.success("OTP verified! Set your new password");
            } else {
                toast.error(data.error || "Invalid OTP");
            }
        } catch (err) {
            console.error(err);
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    // Step 3: Reset Password
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (newPassword.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/auth/forgot-password/reset`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ resetToken, newPassword }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setStep("success");
                toast.success("Password reset successfully!");
            } else {
                toast.error(data.error || "Failed to reset password");
            }
        } catch (err) {
            console.error(err);
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const getStepIcon = () => {
        switch (step) {
            case "email": return <Mail className="h-6 w-6" />;
            case "otp": return <Phone className="h-6 w-6" />;
            case "reset": return <Lock className="h-6 w-6" />;
            case "success": return <CheckCircle className="h-6 w-6" />;
        }
    };

    const getStepTitle = () => {
        switch (step) {
            case "email": return "Forgot Password";
            case "otp": return "Verify OTP";
            case "reset": return "Set New Password";
            case "success": return "Password Reset!";
        }
    };

    const getStepDescription = () => {
        switch (step) {
            case "email": return "Enter your email to receive an OTP on your registered mobile";
            case "otp": return `We've sent a 6-digit OTP to ${maskedPhone}`;
            case "reset": return "Create a strong password for your account";
            case "success": return "Your password has been reset successfully";
        }
    };

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-muted/40 px-4">
            {/* Background Pattern */}
            <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-50"></div>

            <Card className="w-full max-w-[400px] shadow-lg border-border/50">
                <CardHeader className="space-y-1">
                    <div className="flex justify-center mb-4">
                        <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                            {getStepIcon()}
                        </div>
                    </div>
                    <CardTitle className="text-2xl text-center font-bold tracking-tight">
                        {getStepTitle()}
                    </CardTitle>
                    <CardDescription className="text-center text-muted-foreground">
                        {getStepDescription()}
                    </CardDescription>

                    {/* Step Indicator */}
                    {step !== "success" && (
                        <div className="flex justify-center gap-2 pt-4">
                            {["email", "otp", "reset"].map((s, index) => (
                                <div
                                    key={s}
                                    className={`h-2 w-8 rounded-full transition-colors ${["email", "otp", "reset"].indexOf(step) >= index
                                        ? "bg-primary"
                                        : "bg-muted"
                                        }`}
                                />
                            ))}
                        </div>
                    )}
                </CardHeader>

                {/* Step 1: Email */}
                {step === "email" && (
                    <form onSubmit={handleSendOTP}>
                        <CardContent className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email Address</Label>
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
                        </CardContent>
                        <CardFooter className="flex flex-col gap-4">
                            <Button className="w-full h-10 font-semibold" type="submit" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Send OTP
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                className="w-full"
                                onClick={() => navigate("/login")}
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Login
                            </Button>
                        </CardFooter>
                    </form>
                )}

                {/* Step 2: OTP Verification */}
                {step === "otp" && (
                    <form onSubmit={handleVerifyOTP}>
                        <CardContent className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="otp">Enter 6-digit OTP</Label>
                                <Input
                                    id="otp"
                                    type="text"
                                    placeholder="000000"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                    required
                                    maxLength={6}
                                    className="h-12 text-center text-2xl tracking-[0.5em] font-mono"
                                />
                            </div>
                            <Button
                                type="button"
                                variant="link"
                                className="text-sm"
                                onClick={handleResendOTP}
                                disabled={loading}
                            >
                                Didn't receive OTP? Resend
                            </Button>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-4">
                            <Button className="w-full h-10 font-semibold" type="submit" disabled={loading || otp.length !== 6}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Verify OTP
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                className="w-full"
                                onClick={() => setStep("email")}
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Change Email
                            </Button>
                        </CardFooter>
                    </form>
                )}

                {/* Step 3: Reset Password */}
                {step === "reset" && (
                    <form onSubmit={handleResetPassword}>
                        <CardContent className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="newPassword">New Password</Label>
                                <Input
                                    id="newPassword"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="h-10"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="h-10"
                                />
                            </div>
                            {newPassword && confirmPassword && newPassword !== confirmPassword && (
                                <p className="text-sm text-destructive">Passwords do not match</p>
                            )}
                        </CardContent>
                        <CardFooter className="flex flex-col gap-4">
                            <Button
                                className="w-full h-10 font-semibold"
                                type="submit"
                                disabled={loading || newPassword !== confirmPassword}
                            >
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Reset Password
                            </Button>
                        </CardFooter>
                    </form>
                )}

                {/* Success */}
                {step === "success" && (
                    <CardFooter className="flex flex-col gap-4">
                        <div className="flex justify-center">
                            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                        </div>
                        <Button
                            className="w-full h-10 font-semibold"
                            onClick={() => navigate("/login")}
                        >
                            Go to Login
                        </Button>
                    </CardFooter>
                )}
            </Card>
        </div>
    );
};

export default ForgotPassword;
