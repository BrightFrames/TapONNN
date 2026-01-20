import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface EnquiryModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    sellerId: string;
    blockId: string;
    blockTitle: string;
    ctaType: string;
    intentId?: string;
    onComplete?: () => void;
}

const EnquiryModal = ({ open, onOpenChange, sellerId, blockId, blockTitle, ctaType, intentId, onComplete }: EnquiryModalProps) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    const getToken = () => localStorage.getItem('auth_token');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim()) {
            toast.error('Email is required');
            return;
        }

        setSubmitting(true);
        try {
            // 1. Create Enquiry
            const response = await fetch(`${API_URL}/enquiries`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    seller_id: sellerId,
                    block_id: blockId,
                    visitor_name: name,
                    visitor_email: email,
                    visitor_phone: phone,
                    message,
                    source: 'profile'
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to send enquiry');
            }

            const enquiryData = await response.json();

            // 2. Complete Intent (if intentId exists)
            if (intentId && enquiryData.enquiry?.id) {
                const token = getToken();
                const headers: Record<string, string> = { 'Content-Type': 'application/json' };
                if (token) headers['Authorization'] = `Bearer ${token}`;

                await fetch(`${API_URL}/intents/${intentId}/complete`, {
                    method: 'PUT',
                    headers,
                    body: JSON.stringify({
                        linked_enquiry_id: enquiryData.enquiry.id
                    })
                });
            }

            setSubmitted(true);
            toast.success('Enquiry sent successfully!');

            if (onComplete) onComplete();

            setTimeout(() => {
                onOpenChange(false);
                // Reset form
                setName('');
                setEmail('');
                setPhone('');
                setMessage('');
                setSubmitted(false);
            }, 2000);
        } catch (err: any) {
            console.error('Error submitting enquiry:', err);
            toast.error(err.message || 'Failed to send enquiry');
        } finally {
            setSubmitting(false);
        }
    };

    const getTitle = () => {
        switch (ctaType) {
            case 'enquire': return 'Send Enquiry';
            case 'contact': return 'Contact';
            case 'buy_now': return 'Request to Buy';
            case 'book': return 'Book Appointment';
            default: return 'Get in Touch';
        }
    };

    if (submitted) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-md">
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Enquiry Sent!</h3>
                        <p className="text-muted-foreground">
                            Your message has been sent. They'll get back to you soon.
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
                    <DialogTitle>{getTitle()}</DialogTitle>
                    <DialogDescription>
                        Interested in: {blockTitle}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            placeholder="Your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone (optional)</Label>
                        <Input
                            id="phone"
                            type="tel"
                            placeholder="+91 XXXXX XXXXX"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                            id="message"
                            placeholder="Tell them what you're interested in..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={4}
                        />
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={submitting}>
                            {submitting ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Send className="w-4 h-4 mr-2" />
                            )}
                            Send
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default EnquiryModal;
