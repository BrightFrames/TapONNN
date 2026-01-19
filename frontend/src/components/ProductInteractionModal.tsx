import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2, CheckCircle2, MessageSquare, ShoppingBag, CreditCard, ArrowRight } from "lucide-react";
import { toast } from "sonner";

interface ProductInteractionModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product: any;
    seller: any;
    initialStep?: 'selection' | 'contact_enquiry' | 'contact_buy';
}

const ProductInteractionModal = ({ open, onOpenChange, product, seller, initialStep = 'selection' }: ProductInteractionModalProps) => {
    const [step, setStep] = useState<'selection' | 'contact_enquiry' | 'contact_buy' | 'payment' | 'success'>(initialStep);
    const [submitting, setSubmitting] = useState(false);

    // Form Data
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        message: "",
        transactionRef: ""
    });

    // Reset state on close
    useEffect(() => {
        if (!open) {
            setTimeout(() => {
                setStep(initialStep);
                setFormData({ name: "", email: "", phone: "", message: "", transactionRef: "" });
            }, 300);
        } else {
            setStep(initialStep);
        }
    }, [open, initialStep]);

    const handleEnquiry = async () => {
        setSubmitting(true);
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
        const token = localStorage.getItem('auth_token'); // Might be null for public users (buyers)

        try {
            const res = await fetch(`${API_URL}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    seller_id: seller.id || seller._id,
                    product_id: product._id || product.id,
                    amount: product.price,
                    type: 'enquiry',
                    buyer_name: formData.name,
                    buyer_email: formData.email,
                    buyer_phone: formData.phone,
                    transaction_details: formData.message // Storing message in transaction_details for now
                })
            });

            if (res.ok) {
                setStep('success');
            } else {
                toast.error("Failed to send enquiry");
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setSubmitting(false);
        }
    };

    const handlePurchase = async () => {
        setSubmitting(true);
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

        try {
            const res = await fetch(`${API_URL}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    seller_id: seller.id || seller._id,
                    product_id: product._id || product.id,
                    amount: product.price,
                    type: 'product_sale',
                    buyer_name: formData.name,
                    buyer_email: formData.email,
                    buyer_phone: formData.phone,
                    transaction_details: `Transaction Ref: ${formData.transactionRef}`
                })
            });

            if (res.ok) {
                setStep('success');
            } else {
                toast.error("Failed to record order");
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setSubmitting(false);
        }
    };

    if (!product) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden bg-white text-black">
                {/* Header Image/Summary */}
                <div className="bg-gray-50 p-6 border-b border-gray-100">
                    <div className="flex gap-4 items-center">
                        <div className="w-16 h-16 bg-white rounded-lg border border-gray-100 overflow-hidden flex-shrink-0">
                            {product.image_url ? (
                                <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-2xl">🛍️</div>
                            )}
                        </div>
                        <div>
                            <h3 className="font-bold text-lg leading-tight">{product.title}</h3>
                            <p className="font-bold text-primary mt-1">${product.price}</p>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    {/* Step 1: Selection */}
                    {step === 'selection' && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold mb-4">How would you like to proceed?</h2>

                            <button
                                onClick={() => setStep('contact_enquiry')}
                                className="w-full p-4 rounded-xl border-2 border-gray-100 hover:border-black transition-all flex items-center gap-4 group text-left"
                            >
                                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                                    <MessageSquare className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold">Send Enquiry</h3>
                                    <p className="text-sm text-gray-500">Ask a question or request more info.</p>
                                </div>
                                <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-black" />
                            </button>

                            <button
                                onClick={() => setStep('contact_buy')}
                                className="w-full p-4 rounded-xl border-2 border-gray-100 hover:border-black transition-all flex items-center gap-4 group text-left"
                            >
                                <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                                    <ShoppingBag className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold">Buy Now</h3>
                                    <p className="text-sm text-gray-500">Purchase internally via manual payment.</p>
                                </div>
                                <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-black" />
                            </button>
                        </div>
                    )}

                    {/* Step 2: Contact Info (Enquiry) */}
                    {step === 'contact_enquiry' && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold">Your Details</h2>
                            <div className="space-y-2">
                                <Label>Name</Label>
                                <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="John Doe" />
                            </div>
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="john@example.com" />
                            </div>
                            <div className="space-y-2">
                                <Label>Phone</Label>
                                <Input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="+1 234 567 8900" />
                            </div>
                            <div className="space-y-2">
                                <Label>Message</Label>
                                <Textarea value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} placeholder="I'm interested in..." />
                            </div>
                            <Button onClick={handleEnquiry} disabled={submitting || !formData.name || !formData.phone} className="w-full mt-4">
                                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Send Enquiry
                            </Button>
                        </div>
                    )}

                    {/* Step 3: Contact Info (Buy) */}
                    {step === 'contact_buy' && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold">Checkout Details</h2>
                            <div className="space-y-2">
                                <Label>Name</Label>
                                <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="John Doe" />
                            </div>
                            <div className="space-y-2">
                                <Label>Email (for receipt)</Label>
                                <Input value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="john@example.com" />
                            </div>
                            <div className="space-y-2">
                                <Label>Phone</Label>
                                <Input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="+1 234 567 8900" />
                            </div>
                            <Button onClick={() => setStep('payment')} disabled={!formData.name || !formData.phone} className="w-full mt-4">
                                Next: Payment
                            </Button>
                        </div>
                    )}

                    {/* Step 4: Payment Instructions */}
                    {step === 'payment' && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-green-600 mb-2">
                                <CreditCard className="w-5 h-5" />
                                <span className="font-bold">Payment Instructions</span>
                            </div>

                            <div className="bg-gray-100 p-4 rounded-xl text-sm font-mono whitespace-pre-wrap">
                                {seller.payment_instructions || "No custom payment instructions provided by seller.\n\nPlease contact seller for payment details."}
                            </div>

                            <div className="space-y-2 pt-2">
                                <Label>Transaction ID / Reference No.</Label>
                                <Input
                                    value={formData.transactionRef}
                                    onChange={e => setFormData({ ...formData, transactionRef: e.target.value })}
                                    placeholder="Enter UPI Ref, Transaction ID, etc."
                                />
                                <p className="text-xs text-gray-500">Please enter the transaction reference after making the payment.</p>
                            </div>

                            <Button onClick={handlePurchase} disabled={submitting || !formData.transactionRef} className="w-full mt-4 bg-green-600 hover:bg-green-700">
                                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} I've Made Payment
                            </Button>
                        </div>
                    )}

                    {/* Step 5: Success */}
                    {step === 'success' && (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 className="w-8 h-8" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">All Set!</h2>
                            <p className="text-gray-500 mb-6">
                                Your request has been sent to the seller. They will verify your details and get back to you soon.
                            </p>
                            <Button onClick={() => onOpenChange(false)} variant="outline" className="min-w-[120px]">
                                Close
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ProductInteractionModal;
