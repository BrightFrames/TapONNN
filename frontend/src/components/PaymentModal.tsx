import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard, CheckCircle, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    intentId: string;
    itemTitle: string;
    price: number;
    sellerId: string;
    onComplete?: () => void;
}

const PaymentModal = ({ open, onOpenChange, intentId, itemTitle, price, sellerId, onComplete }: PaymentModalProps) => {
    const [step, setStep] = useState<'review' | 'processing' | 'success'>('review');

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
    const getToken = () => localStorage.getItem('auth_token');

    const handlePayment = async () => {
        setStep('processing');

        // Simulating Payment Gateway Delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        try {
            const token = getToken();
            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            // Create Order (which completes intent)
            await fetch(`${API_URL}/orders`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    seller_id: sellerId,
                    amount: price,
                    intent_id: intentId,
                    transaction: {
                        status: 'confirmed',
                        gateway: 'mock_razorpay',
                        gateway_payment_id: `pay_${Math.random().toString(36).substr(2, 9)}`,
                        amount: price,
                        currency: 'INR',
                        method: 'card'
                    }
                })
            });

            setStep('success');
            toast.success('Payment successful!');

            if (onComplete) onComplete();

            setTimeout(() => {
                onOpenChange(false);
                setStep('review');
            }, 3000);

        } catch (err) {
            console.error('Payment failed:', err);
            toast.error('Payment processing failed');
            setStep('review');
        }
    };

    if (step === 'success') {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-md">
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Payment Successful!</h3>
                        <p className="text-muted-foreground">
                            You purchased <strong>{itemTitle}</strong>
                        </p>
                        <p className="text-sm text-muted-foreground mt-4 bg-muted px-4 py-2 rounded-full">
                            Transaction ID: {`pay_...${Math.random().toString(16).substr(2, 4)}`}
                        </p>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Complete Purchase</DialogTitle>
                    <DialogDescription>
                        Secure payment via Razorpay
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6 space-y-4">
                    <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                        <span className="font-medium">{itemTitle}</span>
                        <span className="font-bold text-lg text-primary">₹{price}</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
                        <ShieldCheck className="w-3 h-3 text-green-600" />
                        <span>Secure SSL Encryption</span>
                    </div>
                </div>

                <DialogFooter className="flex-col gap-2 sm:flex-col">
                    <Button
                        onClick={handlePayment}
                        disabled={step === 'processing'}
                        className="w-full gap-2 text-lg h-12"
                    >
                        {step === 'processing' ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <CreditCard className="w-5 h-5" />
                        )}
                        {step === 'processing' ? 'Processing...' : `Pay ₹${price}`}
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        disabled={step === 'processing'}
                    >
                        Cancel
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default PaymentModal;
