import { useState, useRef, useEffect } from "react";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface MessageSignupModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    intentUsername: string; // The username of the profile being viewed
    intentName: string; // Name of the person to message
}

export function MessageSignupModal({ open, onOpenChange, intentUsername, intentName }: MessageSignupModalProps) {
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

    const [step, setStep] = useState<1 | 2>(1);
    const [loading, setLoading] = useState(false);

    // Step 1 Data
    const [fullName, setFullName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");

    // Step 2 Data
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);

    useEffect(() => {
        if (!open) {
            // Reset state when closed
            setStep(1);
            setFullName("");
            setPhoneNumber("");
            setEmail("");
            setOtp("");
            setOtpSent(false);
            setLoading(false);
        }
    }, [open]);

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setEmail(newValue);
        if (otpSent) {
            setOtpSent(false);
            setOtp("");
        }
    };

    const handleStep1Continue = (e: React.FormEvent) => {
        e.preventDefault();
        if (!fullName.trim() || !phoneNumber.trim()) {
            toast.error("Please fill in your name and phone number");
            return;
        }
        setStep(2);
        // Show the toast as seen in the image
        toast.custom((t) => (
            <div className="bg-white text-black px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-black fill-black text-white" />
                <span className="font-medium text-sm">Details saved! Now verify your email.</span>
            </div>
        ), { position: 'bottom-right', duration: 3000 });
    };

    const handleSendOTP = async () => {
        if (!email.trim() || !email.includes('@')) {
            toast.error("Please enter a valid email address");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/auth/quick-signup/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, username: fullName })
            });

            const data = await res.json();

            if (data.success) {
                setOtpSent(true);
                toast.success("OTP sent to your email");
            } else if (data.isExistingUser) {
                toast.error("Account already exists. Please Sign In.");
                sessionStorage.setItem('tap2_redirect_after_login', `/messages?with=${intentUsername}`);
                navigate('/login');
                onOpenChange(false);
            } else {
                toast.error(data.error || "Failed to send OTP");
            }
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyAndConnect = async () => {
        if (otp.length < 4) {
            toast.error("Please enter the OTP");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/auth/quick-signup/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    otp,
                    full_name: fullName,
                    phone_number: phoneNumber
                })
            });

            const data = await res.json();

            if (data.success) {
                localStorage.setItem('auth_token', data.token);
                toast.success("Account created successfully!");
                window.location.href = `/messages?with=${intentUsername}`;
            } else if (data.isExistingUser) {
                toast.error("Account already exists. Please Sign In.");
                sessionStorage.setItem('tap2_redirect_after_login', `/messages?with=${intentUsername}`);
                navigate('/login');
            } else {
                toast.error(data.error || "Verification failed");
            }
        } catch (error) {
            console.error(error);
            toast.error("Verification failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleSignIn = () => {
        sessionStorage.setItem('tap2_redirect_after_login', `/messages?with=${intentUsername}`);
        navigate('/login');
        onOpenChange(false);
    };

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent className="bg-[#0B0E14] border-t border-zinc-800 text-white p-0">
                <div className="mx-auto w-full max-w-md">

                    {/* Header */}
                    <div className="pt-8 pb-6 text-center">
                        <DrawerTitle className="text-2xl font-bold mb-2">Connect with {intentName}</DrawerTitle>
                        <p className="text-zinc-400 text-sm flex items-center justify-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500" />
                            Typically replies in 1 hr
                        </p>
                    </div>

                    <div className="px-6 pb-12 space-y-6">
                        {step === 1 ? (
                            /* STEP 1: Details */
                            <form onSubmit={handleStep1Continue} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">

                                <Input
                                    placeholder="Full Name"
                                    className="bg-[#151A23] border-none h-14 rounded-xl text-white placeholder:text-zinc-500 px-5 text-base"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                />

                                <Input
                                    placeholder="Phone Number"
                                    className="bg-[#151A23] border-none h-14 rounded-xl text-white placeholder:text-zinc-500 px-5 text-base"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    required
                                />

                                <Button type="submit" className="w-full h-14 bg-[#1D4ED8] hover:bg-blue-700 text-white font-semibold rounded-2xl text-base mt-2">
                                    Continue
                                </Button>

                                <div className="text-center pt-2">
                                    <p className="text-zinc-500 text-sm">
                                        Already have an account?{" "}
                                        <button type="button" onClick={handleSignIn} className="text-[#4A90E2] font-medium hover:underline">
                                            Sign In
                                        </button>
                                    </p>
                                </div>
                            </form>
                        ) : (
                            /* STEP 2: Verification */
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">

                                {/* Email Field with Embedded Button */}
                                <div className="relative">
                                    <Input
                                        placeholder="Business Email"
                                        className="bg-[#151A23] border-none h-14 rounded-xl text-white placeholder:text-zinc-500 pl-5 pr-28 text-base"
                                        value={email}
                                        onChange={handleEmailChange}
                                        disabled={loading}
                                    />
                                    {!otpSent && (
                                        <Button
                                            type="button"
                                            onClick={handleSendOTP}
                                            disabled={loading}
                                            className="absolute right-2 top-2 bottom-2 bg-[#1D4ED8] hover:bg-blue-700 text-white px-4 h-10 rounded-lg text-sm font-medium"
                                        >
                                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send OTP"}
                                        </Button>
                                    )}
                                </div>

                                {/* OTP Input - Single Field */}
                                <Input
                                    placeholder="E n t e r   O T P"
                                    className="bg-[#151A23] border-none h-14 rounded-xl text-white placeholder:text-zinc-600 px-5 text-center text-lg tracking-widest"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    maxLength={6}
                                />

                                <Button
                                    onClick={handleVerifyAndConnect}
                                    disabled={loading || otp.length < 4}
                                    className="w-full h-14 bg-[#1D4ED8] hover:bg-blue-700 text-white font-semibold rounded-2xl text-base mt-2"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                    Verify & Connect
                                </Button>

                                <div className="text-center pt-4">
                                    <button
                                        onClick={() => setStep(1)}
                                        className="flex items-center justify-center gap-2 text-zinc-400 hover:text-white text-sm mx-auto transition-colors"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        Back to Details
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
