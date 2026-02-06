import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, Phone, User, ArrowRight, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { GoogleIcon } from "./BrandIcons";

interface QuickAuthModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function QuickAuthModal({ open, onOpenChange }: QuickAuthModalProps) {
    const { loginWithGoogle, setUser } = useAuth();
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

    const [step, setStep] = useState<1 | 2>(1);
    const [loading, setLoading] = useState(false);
    const [isExistingUser, setIsExistingUser] = useState(false);

    // Form Data
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phoneNumber: "",
        otp: ""
    });

    useEffect(() => {
        if (!open) {
            setStep(1);
            setFormData({ fullName: "", email: "", phoneNumber: "", otp: "" });
            setLoading(false);
            setIsExistingUser(false);
        }
    }, [open]);

    const handleSendOTP = async () => {
        if (!formData.email.trim() || !formData.email.includes('@')) {
            toast.error("Please enter a valid email address");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/auth/quick-signup/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email })
            });

            const data = await res.json();

            if (data.success) {
                setIsExistingUser(data.isExistingUser);
                setStep(2);
                toast.success(data.message || "OTP sent to your email");
            } else {
                toast.error(data.error || "Failed to send OTP");
            }
        } catch (error) {
            console.error(error);
            toast.error("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        if (formData.otp.length < 4) {
            toast.error("Please enter the verification code");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/auth/quick-signup/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    otp: formData.otp,
                    full_name: formData.fullName,
                    phone_number: formData.phoneNumber
                })
            });

            const data = await res.json();

            if (data.success) {
                localStorage.setItem('auth_token', data.token);
                setUser(data.user);
                toast.success(isExistingUser ? "Welcome back!" : "Account created successfully!");
                onOpenChange(false);
                
                // If existing user, maybe they want to go to their dashboard
                if (!isExistingUser) {
                    window.location.href = '/dashboard?new=true';
                } else {
                    window.location.href = '/dashboard';
                }
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

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden rounded-[2rem] border-none shadow-2xl">
                <div className="bg-white dark:bg-zinc-950 p-8">
                    <div className="flex flex-col items-center text-center mb-8">
                        <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center mb-4 shadow-2xl shadow-black/5 border border-zinc-100 p-4">
                            <img src="/favicon.png" alt="tapx.bio" className="w-full h-full object-contain grayscale" />
                        </div>
                        <DialogTitle className="text-2xl font-black tracking-tight mb-2">
                            {step === 1 ? "Join tapx.bio" : "Verify Email"}
                        </DialogTitle>
                        <p className="text-zinc-500 text-sm font-medium">
                            {step === 1 
                                ? "One link for everything you do." 
                                : `We've sent a code to ${formData.email}`}
                        </p>
                    </div>

                    {step === 1 ? (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                    <Input
                                        placeholder="Full Name"
                                        className="pl-10 h-12 rounded-xl bg-zinc-50 border-zinc-100 focus:bg-white transition-all"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                    <Input
                                        type="email"
                                        placeholder="Email Address"
                                        className="pl-10 h-12 rounded-xl bg-zinc-50 border-zinc-100 focus:bg-white transition-all"
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                    <Input
                                        placeholder="Mobile Number"
                                        className="pl-10 h-12 rounded-xl bg-zinc-50 border-zinc-100 focus:bg-white transition-all"
                                        value={formData.phoneNumber}
                                        onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                                    />
                                </div>
                            </div>

                            <Button 
                                onClick={handleSendOTP}
                                disabled={loading}
                                className="w-full h-12 rounded-xl bg-black hover:bg-zinc-800 text-white font-bold transition-all shadow-lg shadow-black/10"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                    <span className="flex items-center gap-2">
                                        Continue <ArrowRight className="w-4 h-4" />
                                    </span>
                                )}
                            </Button>

                            <div className="relative py-2">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-zinc-100"></div>
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-white px-2 text-zinc-400 font-bold">Or continue with</span>
                                </div>
                            </div>

                            <Button 
                                variant="outline" 
                                onClick={() => loginWithGoogle()}
                                className="w-full h-12 rounded-xl border-zinc-100 hover:bg-zinc-50 font-bold transition-all"
                            >
                                <GoogleIcon className="w-5 h-5 mr-3 grayscale opacity-70" />
                                Google
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex justify-center gap-3">
                                <Input
                                    autoFocus
                                    placeholder="Enter 6-digit code"
                                    className="h-16 text-center text-2xl font-black tracking-[0.5em] rounded-2xl bg-zinc-50 border-zinc-100 focus:border-black focus:ring-0 transition-all"
                                    maxLength={6}
                                    value={formData.otp}
                                    onChange={(e) => setFormData({...formData, otp: e.target.value})}
                                />
                            </div>

                            <Button 
                                onClick={handleVerifyOTP}
                                disabled={loading}
                                className="w-full h-12 rounded-xl bg-black hover:bg-zinc-800 text-white font-bold transition-all"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                    <span className="flex items-center gap-2">
                                        Verify & Continue <ShieldCheck className="w-5 h-5" />
                                    </span>
                                )}
                            </Button>

                            <button 
                                onClick={() => setStep(1)}
                                className="w-full text-sm font-bold text-zinc-400 hover:text-black transition-colors"
                            >
                                Change Email Address
                            </button>
                        </div>
                    )}

                    <p className="mt-8 text-[11px] text-zinc-400 text-center leading-relaxed">
                        By continuing, you agree to tapx.bio's 
                        <span className="text-black dark:text-white font-bold mx-1">Terms of Service</span> 
                        and 
                        <span className="text-black dark:text-white font-bold mx-1">Privacy Policy</span>.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}