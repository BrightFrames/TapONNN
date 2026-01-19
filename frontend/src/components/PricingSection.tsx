import React, { useState } from "react";
import { ArrowRight, X, Loader2, QrCode, CheckCircle } from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface PlanData {
    id: string;
    title: string;
    price: string;
    priceValue: number;
    description: string;
    bgColor: string;
    buttonVariant: string;
    buttonBg: string;
    buttonText?: string;
    textColor?: string;
    descriptionColor?: string;
}

const PricingSection = () => {
    const [activeTab, setActiveTab] = useState<"profile" | "store">("profile");
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<PlanData | null>(null);
    const [orderStatus, setOrderStatus] = useState<'idle' | 'loading' | 'pending' | 'success' | 'error'>('idle');
    const [orderData, setOrderData] = useState<any>(null);

    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

    const pricingData = {
        profile: [
            {
                id: "free",
                title: "Free",
                price: "₹0",
                priceValue: 0,
                description: "Get started with the basics. Perfect for trying out Tap2.",
                bgColor: "bg-muted text-foreground border border-border",
                buttonVariant: "outline",
                buttonBg: "bg-foreground text-background hover:bg-foreground/90",
                buttonText: "Get Started Free",
            },
            {
                id: "personal",
                title: "Personal",
                price: "₹299/yr",
                priceValue: 299,
                description: "Ideal for individuals and professionals sharing a basic digital identity.",
                bgColor: "bg-card text-card-foreground border border-border",
                buttonVariant: "outline",
                buttonBg: "bg-primary text-primary-foreground hover:bg-primary/90",
            },
            {
                id: "creator",
                title: "Creator",
                price: "₹699/yr",
                priceValue: 699,
                description: "Ideal for creators and freelancers who need more links, content, and enquiries",
                bgColor: "bg-foreground text-background",
                buttonVariant: "default",
                buttonBg: "bg-primary text-primary-foreground hover:bg-primary/90",
                textColor: "text-background",
                descriptionColor: "text-muted"
            },
            {
                id: "professional",
                title: "Professional",
                price: "₹2499/yr",
                priceValue: 2499,
                description: "Ideal for businesses requiring multiple profiles, branding control, and lead management.",
                bgColor: "bg-primary text-primary-foreground",
                buttonVariant: "default",
                buttonBg: "bg-foreground text-background hover:bg-foreground/90",
            },
        ],
        store: [
            {
                id: "free",
                title: "Free",
                price: "₹0",
                priceValue: 0,
                description: "Start selling with up to 5 products. No credit card required.",
                bgColor: "bg-muted text-foreground border border-border",
                buttonVariant: "outline",
                buttonBg: "bg-foreground text-background hover:bg-foreground/90",
                buttonText: "Get Started Free",
            },
            {
                id: "starter",
                title: "Starter",
                price: "₹999/yr",
                priceValue: 999,
                description: "Perfect for small shops starting their digital journey.",
                bgColor: "bg-card text-card-foreground border border-border",
                buttonVariant: "outline",
                buttonBg: "bg-primary text-primary-foreground hover:bg-primary/90",
            },
            {
                id: "business",
                title: "Business",
                price: "₹1999/yr",
                priceValue: 1999,
                description: "Advanced features for growing businesses with inventory management.",
                bgColor: "bg-foreground text-background",
                buttonVariant: "default",
                buttonBg: "bg-primary text-primary-foreground hover:bg-primary/90",
                textColor: "text-background",
                descriptionColor: "text-muted"
            },
            {
                id: "enterprise",
                title: "Enterprise",
                price: "₹4999/yr",
                priceValue: 4999,
                description: "Full suite of tools for large scale operations and custom integrations.",
                bgColor: "bg-primary text-primary-foreground",
                buttonVariant: "default",
                buttonBg: "bg-foreground text-background hover:bg-foreground/90",
            },
        ],
    };

    const handlePlanSelect = async (plan: PlanData) => {
        // Free plan - just redirect to signup/dashboard
        if (plan.priceValue === 0) {
            if (isAuthenticated) {
                navigate('/dashboard');
            } else {
                navigate('/login');
            }
            return;
        }

        // Paid plan - need to be logged in first
        if (!isAuthenticated) {
            toast.info("Please login to subscribe to a plan");
            navigate('/login');
            return;
        }

        // Show payment modal
        setSelectedPlan(plan);
        setShowPaymentModal(true);
        setOrderStatus('loading');

        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`${API_URL}/payments/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    planId: plan.id,
                    planName: plan.title,
                    amount: plan.priceValue
                })
            });

            const data = await response.json();

            if (data.success) {
                setOrderData(data.order);
                setOrderStatus('pending');
                // Start polling for payment status
                pollPaymentStatus(data.order.id);
            } else {
                throw new Error(data.error || 'Failed to create order');
            }
        } catch (error: any) {
            console.error('Error creating order:', error);
            toast.error(error.message || 'Failed to initiate payment');
            setOrderStatus('error');
        }
    };

    const pollPaymentStatus = async (orderId: string) => {
        const token = localStorage.getItem('auth_token');
        let attempts = 0;
        const maxAttempts = 60; // 5 minutes with 5s intervals

        const checkStatus = async () => {
            if (attempts >= maxAttempts) {
                setOrderStatus('error');
                toast.error('Payment timeout. Please try again.');
                return;
            }

            try {
                const response = await fetch(`${API_URL}/payments/orders/${orderId}/status`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();

                if (data.isPaid) {
                    setOrderStatus('success');
                    toast.success('Payment successful! Your subscription is now active.');
                    setTimeout(() => {
                        setShowPaymentModal(false);
                        navigate('/dashboard');
                    }, 2000);
                    return;
                }

                attempts++;
                setTimeout(checkStatus, 5000); // Check every 5 seconds
            } catch (error) {
                console.error('Error polling status:', error);
                attempts++;
                setTimeout(checkStatus, 5000);
            }
        };

        setTimeout(checkStatus, 5000); // Start after 5 seconds
    };

    const closeModal = () => {
        setShowPaymentModal(false);
        setSelectedPlan(null);
        setOrderData(null);
        setOrderStatus('idle');
    };

    return (
        <>
            <section id="pricing" className="py-20 px-4 flex flex-col items-center bg-background">
                <div className="text-center mb-12">
                    <span className="px-3 py-1 text-xs font-semibold tracking-wider uppercase border border-border rounded-full text-foreground mb-6 inline-block">
                        PRICING & PLANS
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                        Start for Free.<br />
                        Upgrade From Just ₹1 Per Day.
                    </h2>
                </div>

                {/* Tabs */}
                <div className="bg-card border border-border p-1 rounded-full flex gap-1 mb-16 shadow-sm">
                    <button
                        onClick={() => setActiveTab("profile")}
                        className={`px-8 py-3 rounded-full text-sm font-semibold transition-all ${activeTab === "profile"
                            ? "bg-secondary text-secondary-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        DIGITAL PROFILE
                    </button>
                    <button
                        onClick={() => setActiveTab("store")}
                        className={`px-8 py-3 rounded-full text-sm font-semibold transition-all ${activeTab === "store"
                            ? "bg-secondary text-secondary-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        DIGITAL STORE
                    </button>
                </div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl w-full">
                    {pricingData[activeTab].map((plan, index) => (
                        <div
                            key={index}
                            className={`rounded-3xl p-8 flex flex-col h-full min-h-[400px] transition-transform hover:scale-[1.02] duration-300 shadow-lg ${plan.bgColor}`}
                        >
                            <div className="flex-grow">
                                <h3 className="text-2xl font-bold mb-4">{plan.title}</h3>
                                <div className="text-4xl font-bold mb-6">{plan.price}</div>
                                <p className={`text-base mb-6 leading-relaxed ${plan.descriptionColor || "text-card-foreground/80"}`}>
                                    {plan.description}
                                </p>
                            </div>

                            <button
                                onClick={() => handlePlanSelect(plan)}
                                className={`mt-auto w-full group flex items-center justify-between py-4 px-6 rounded-full font-bold transition-all ${plan.buttonBg}`}
                            >
                                <span>{plan.buttonText || "Try For Free"}</span>
                                <div className={`p-1 rounded-full flex items-center justify-center transition-transform group-hover:translate-x-1 ${plan.title === "Professional" || plan.title === "Enterprise" ? "bg-black text-primary" : "bg-background text-foreground"}`}>
                                    <ArrowRight size={20} />
                                </div>
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* Payment Modal */}
            {showPaymentModal && selectedPlan && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-md w-full p-8 relative shadow-2xl">
                        <button
                            onClick={closeModal}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X size={24} />
                        </button>

                        <div className="text-center">
                            <h3 className="text-2xl font-bold mb-2">Subscribe to {selectedPlan.title}</h3>
                            <p className="text-gray-500 mb-6">Pay {selectedPlan.price} via UPI</p>

                            {orderStatus === 'loading' && (
                                <div className="py-12 flex flex-col items-center">
                                    <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                                    <p className="text-gray-500">Creating order...</p>
                                </div>
                            )}

                            {orderStatus === 'pending' && orderData && (
                                <div className="py-6">
                                    {/* QR Code Placeholder - Replace with actual QR from Zero Gateway */}
                                    <div className="bg-gray-100 rounded-2xl p-8 mb-6 flex flex-col items-center">
                                        {orderData.qrCodeUrl ? (
                                            <img
                                                src={orderData.qrCodeUrl}
                                                alt="Payment QR Code"
                                                className="w-48 h-48 object-contain"
                                            />
                                        ) : (
                                            <div className="w-48 h-48 bg-gray-200 rounded-xl flex items-center justify-center">
                                                <QrCode className="w-24 h-24 text-gray-400" />
                                            </div>
                                        )}
                                        <p className="text-sm text-gray-500 mt-4">
                                            Scan with any UPI app
                                        </p>
                                    </div>

                                    <div className="bg-primary/10 rounded-xl p-4 mb-6">
                                        <p className="text-sm font-medium">Pay to UPI ID:</p>
                                        <p className="text-lg font-bold text-primary">{orderData.upiId}</p>
                                        <p className="text-sm text-gray-500 mt-2">Amount: ₹{orderData.amount}</p>
                                    </div>

                                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Waiting for payment confirmation...</span>
                                    </div>
                                </div>
                            )}

                            {orderStatus === 'success' && (
                                <div className="py-12 flex flex-col items-center">
                                    <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                                    <h4 className="text-xl font-bold text-green-600 mb-2">Payment Successful!</h4>
                                    <p className="text-gray-500">Your subscription is now active.</p>
                                </div>
                            )}

                            {orderStatus === 'error' && (
                                <div className="py-8">
                                    <p className="text-red-500 mb-4">Something went wrong. Please try again.</p>
                                    <Button onClick={() => handlePlanSelect(selectedPlan)}>
                                        Retry Payment
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default PricingSection;
