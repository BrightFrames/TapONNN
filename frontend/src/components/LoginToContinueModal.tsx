import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, LogIn, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LoginToContinueModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    intentId: string;
    ctaType: string;
    blockTitle: string;
    onLoginSuccess?: () => void;
    onContinueAsGuest?: (email: string) => void;
    allowGuest?: boolean;
}

/**
 * LoginToContinue Modal
 * 
 * Shown when a CTA requires login to continue.
 * Intent is already created at this point - we just need login to proceed.
 * 
 * Flow:
 * 1. User clicks CTA
 * 2. Intent is recorded (user is still visitor)
 * 3. This modal appears
 * 4. User logs in OR continues as guest (if allowed)
 * 5. Flow resumes with the same intent
 */
const LoginToContinueModal = ({
    open,
    onOpenChange,
    intentId,
    ctaType,
    blockTitle,
    onLoginSuccess,
    onContinueAsGuest,
    allowGuest = true
}: LoginToContinueModalProps) => {
    const navigate = useNavigate();
    const [mode, setMode] = useState<'choice' | 'guest'>('choice');
    const [guestEmail, setGuestEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = () => {
        // Store intent ID and redirect to login
        sessionStorage.setItem('tap2_pending_intent', intentId);
        sessionStorage.setItem('tap2_redirect_after_login', window.location.pathname);
        onOpenChange(false);
        navigate('/login');
    };

    const handleContinueAsGuest = async () => {
        if (!guestEmail.trim() || !guestEmail.includes('@')) {
            return;
        }

        setLoading(true);
        try {
            if (onContinueAsGuest) {
                await onContinueAsGuest(guestEmail);
            }
        } finally {
            setLoading(false);
        }
    };

    const getCtaLabel = () => {
        switch (ctaType) {
            case 'buy_now': return 'complete this purchase';
            case 'enquire': return 'send your enquiry';
            case 'contact': return 'get in touch';
            case 'book': return 'book this appointment';
            case 'donate': return 'make a donation';
            default: return 'continue';
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Login to Continue</DialogTitle>
                    <DialogDescription>
                        Login or sign up to {getCtaLabel()}
                    </DialogDescription>
                </DialogHeader>

                {mode === 'choice' ? (
                    <div className="space-y-4 py-4">
                        <div className="p-4 bg-muted/50 rounded-lg text-center">
                            <p className="text-sm text-muted-foreground">You're interested in:</p>
                            <p className="font-medium mt-1">{blockTitle}</p>
                        </div>

                        <Button
                            onClick={() => {
                                sessionStorage.setItem('tap2_pending_intent', intentId);
                                sessionStorage.setItem('tap2_redirect_after_login', window.location.pathname);
                                onOpenChange(false);
                                navigate('/signup');
                            }}
                            className="w-full gap-2"
                            size="lg"
                        >
                            <LogIn className="w-4 h-4" />
                            Create Free Account
                        </Button>

                        {/* Already have account - Sign In link */}
                        <div className="text-center text-sm text-muted-foreground">
                            Already have an account?{' '}
                            <Button
                                variant="link"
                                type="button"
                                onClick={handleLogin}
                                className="text-primary hover:underline font-medium p-0 h-auto"
                            >
                                Sign In
                            </Button>
                        </div>

                        {allowGuest && (
                            <>
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-background px-2 text-muted-foreground">
                                            or
                                        </span>
                                    </div>
                                </div>

                                <Button
                                    variant="outline"
                                    onClick={() => setMode('guest')}
                                    className="w-full"
                                >
                                    Continue as Guest
                                </Button>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Your Email</Label>
                            <Input
                                type="email"
                                placeholder="your@email.com"
                                value={guestEmail}
                                onChange={(e) => setGuestEmail(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                We'll use this to send you updates about your {ctaType === 'buy_now' ? 'order' : 'enquiry'}
                            </p>
                        </div>

                        <DialogFooter className="flex-col gap-2 sm:flex-col">
                            <Button
                                onClick={handleContinueAsGuest}
                                disabled={loading || !guestEmail.includes('@')}
                                className="w-full gap-2"
                            >
                                {loading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <ArrowRight className="w-4 h-4" />
                                )}
                                Continue
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => setMode('choice')}
                                className="w-full"
                            >
                                Back
                            </Button>
                        </DialogFooter>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default LoginToContinueModal;
