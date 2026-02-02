import { useState, useEffect } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ConnectWithSupplierModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product?: { _id: string; title: string } | null;
    seller: { id: string; name: string } | null;
    onSuccess?: (user: any) => void;
}

const ConnectWithSupplierModal = ({
    open,
    onOpenChange,
    product,
    seller,
    onSuccess
}: ConnectWithSupplierModalProps) => {
    const navigate = useNavigate();
    const { refreshProfile } = useAuth();

    // Form state
    const [step, setStep] = useState<'details' | 'verify'>('details');
    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [leadId, setLeadId] = useState('');

    // Loading states
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [otpSent, setOtpSent] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

    // Reset form when modal closes
    useEffect(() => {
        if (!open) {
            setTimeout(() => {
                setStep('details');
                setFullName('');
                setPhoneNumber('');
                setEmail('');
                setOtp('');
                setLeadId('');
                setOtpSent(false);
            }, 300);
        }
    }, [open]);

    // Step 1: Submit name and phone
    const handleDetailsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!fullName.trim() || !phoneNumber.trim()) {
            toast.error('Please fill in all fields');
            return;
        }

        if (!seller?.id) {
            toast.error('Seller information missing');
            return;
        }

        setIsSubmitting(true);

        try {
            const res = await fetch(`${API_URL}/connect/init`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    full_name: fullName.trim(),
                    phone_number: phoneNumber.trim(),
                    product_id: product?._id || null,
                    seller_id: seller.id
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to submit details');
            }

            setLeadId(data.lead_id);
            setStep('verify');
            toast.success('Details saved! Now verify your email.');

        } catch (error: any) {
            toast.error(error.message || 'Something went wrong');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Step 2a: Send OTP to email
    const handleSendOtp = async () => {
        if (!email.trim() || !email.includes('@')) {
            toast.error('Please enter a valid email');
            return;
        }

        setIsSendingOtp(true);

        try {
            const res = await fetch(`${API_URL}/connect/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    lead_id: leadId,
                    email: email.trim()
                })
            });

            const data = await res.json();

            if (!res.ok) {
                if (data.code === 'EMAIL_EXISTS') {
                    toast.error(data.error);
                    return;
                }
                throw new Error(data.error || 'Failed to send OTP');
            }

            setOtpSent(true);
            toast.success('OTP sent to your email!');

        } catch (error: any) {
            toast.error(error.message || 'Failed to send OTP');
        } finally {
            setIsSendingOtp(false);
        }
    };

    // Step 2b: Verify OTP and create account
    const handleVerifyAndConnect = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!otp.trim() || otp.length < 4) {
            toast.error('Please enter the OTP');
            return;
        }

        setIsSubmitting(true);

        try {
            const res = await fetch(`${API_URL}/connect/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    lead_id: leadId,
                    email: email.trim(),
                    otp: otp.trim()
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to verify OTP');
            }

            // Store token and login
            if (data.token) {
                localStorage.setItem('auth_token', data.token);

                // Refresh the auth context to pick up the new token
                if (refreshProfile) {
                    await refreshProfile();
                }
            }

            toast.success(data.message || 'Account created successfully!');

            if (onSuccess) {
                onSuccess(data.user);
            }

            onOpenChange(false);

        } catch (error: any) {
            toast.error(error.message || 'Verification failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Resend OTP
    const handleResendOtp = async () => {
        setIsSendingOtp(true);

        try {
            const res = await fetch(`${API_URL}/connect/resend-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lead_id: leadId })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to resend OTP');
            }

            toast.success('OTP resent!');

        } catch (error: any) {
            toast.error(error.message || 'Failed to resend OTP');
        } finally {
            setIsSendingOtp(false);
        }
    };

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent className="bg-gray-900 border-t border-gray-800 focus:outline-none rounded-t-[32px]" aria-describedby={undefined}>
                <DrawerHeader className="sr-only">
                    <DrawerTitle>Connect with Supplier</DrawerTitle>
                </DrawerHeader>

                <div className="mx-auto w-full max-w-sm">
                    {/* Simplified Handle Bar */}
                    <div className="flex justify-center pt-3">
                        <div className="w-10 h-1 bg-gray-600 rounded-full opacity-50" />
                    </div>

                    <div className="px-6 pb-8 pt-5">
                        {/* Header */}
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-white tracking-tight">Connect with Supplier</h2>
                            <div className="flex items-center gap-2 mt-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                                <span className="text-sm text-gray-400 font-medium">Typically replies in 1 hr</span>
                            </div>
                        </div>

                        {/* Step 1: Name & Phone */}
                        {step === 'details' && (
                            <form onSubmit={handleDetailsSubmit} className="space-y-4">
                                <div>
                                    <Input
                                        type="text"
                                        placeholder="Full Name"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="h-14 bg-gray-800/80 border-transparent text-white placeholder:text-gray-500 rounded-2xl focus:ring-0 focus:border-gray-700 hover:bg-gray-800 transition-colors text-base px-5"
                                        required
                                    />
                                </div>
                                <div>
                                    <Input
                                        type="tel"
                                        placeholder="Phone Number"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        className="h-14 bg-gray-800/80 border-transparent text-white placeholder:text-gray-500 rounded-2xl focus:ring-0 focus:border-gray-700 hover:bg-gray-800 transition-colors text-base px-5"
                                        style={{ WebkitAppearance: 'none', margin: 0 }}
                                        required
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isSubmitting || !fullName.trim() || !phoneNumber.trim()}
                                    className="w-full h-14 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-2xl shadow-lg shadow-blue-900/20 transition-all text-base mt-2"
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        'Continue'
                                    )}
                                </Button>

                                <div className="text-center pt-4">
                                    <span className="text-gray-500 text-sm">Already have an account? </span>
                                    <Button
                                        variant="link"
                                        type="button"
                                        onClick={() => {
                                            onOpenChange(false);
                                            navigate('/login');
                                        }}
                                        className="text-blue-500 text-sm font-semibold hover:text-blue-400 transition-colors p-0 h-auto"
                                    >
                                        Sign In
                                    </Button>
                                </div>
                            </form>
                        )}

                        {/* Step 2: Email & OTP */}
                        {step === 'verify' && (
                            <form onSubmit={handleVerifyAndConnect} className="space-y-4">
                                <div className="relative">
                                    <Input
                                        type="email"
                                        placeholder="Business Email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={otpSent}
                                        className={`h-14 bg-gray-800/80 border-transparent text-white placeholder:text-gray-500 rounded-2xl pr-24 text-base px-5 ${otpSent ? 'ring-2 ring-blue-500/50' : ''
                                            }`}
                                        required
                                    />
                                    {!otpSent && (
                                        <Button
                                            type="button"
                                            size="sm"
                                            onClick={handleSendOtp}
                                            disabled={isSendingOtp || !email.includes('@')}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 h-9 px-4 text-xs bg-blue-600 hover:bg-blue-500 rounded-xl"
                                        >
                                            {isSendingOtp ? (
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                            ) : (
                                                'Send OTP'
                                            )}
                                        </Button>
                                    )}
                                </div>

                                <div>
                                    <Input
                                        type="text"
                                        placeholder="Enter OTP"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        disabled={!otpSent}
                                        className="h-14 bg-gray-800/80 border-transparent text-white placeholder:text-gray-500 rounded-2xl tracking-[0.5em] text-center text-xl font-medium"
                                        maxLength={6}
                                    />
                                    {otpSent && (
                                        <div className="flex justify-end mt-2">
                                            <Button
                                                variant="link"
                                                type="button"
                                                onClick={handleResendOtp}
                                                disabled={isSendingOtp}
                                                className="text-blue-500 text-xs font-medium hover:text-blue-400 transition-colors p-0 h-auto block ml-auto"
                                            >
                                                {isSendingOtp ? 'Sending...' : 'Resend OTP'}
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isSubmitting || !otpSent || !otp.trim()}
                                    className="w-full h-14 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-2xl shadow-lg shadow-blue-900/20 transition-all text-base mt-2"
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        'Verify & Connect'
                                    )}
                                </Button>

                                <Button
                                    variant="ghost"
                                    type="button"
                                    onClick={() => setStep('details')}
                                    className="w-full text-center text-gray-400 text-sm hover:text-white transition-colors flex items-center justify-center gap-2 py-2 h-auto hover:bg-transparent"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Back to Details
                                </Button>
                            </form>
                        )}
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    );
};

export default ConnectWithSupplierModal;
