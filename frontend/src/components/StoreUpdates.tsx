import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Bell, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StoreUpdatesProps {
    sellerId: string;
    textColor?: string;
    isDarkTheme?: boolean;
}

export function StoreUpdates({ sellerId, textColor = "#000000", isDarkTheme = false }: StoreUpdatesProps) {
    const [inputValue, setInputValue] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

    const handleSubscribe = async () => {
        if (!inputValue.trim()) {
            toast.error("Please enter your email or tapx username");
            return;
        }

        setLoading(true);
        setIsVerifying(true);

        try {
            const trimmedValue = inputValue.trim().toLowerCase();
            const isEmail = trimmedValue.includes("@") && trimmedValue.includes(".");
            let payload: any = { seller_id: sellerId };

            if (isEmail) {
                payload.email = trimmedValue;
            } else {
                // Handle as username - strip @ if present
                const username = trimmedValue.startsWith("@") ? trimmedValue.substring(1) : trimmedValue;
                
                // Verify if it's a valid tapx username first
                const verifyRes = await fetch(`${API_URL}/auth/check-username/${username}`);
                const verifyData = await verifyRes.json();
                
                // If available is true, it means username doesn't exist
                if (verifyData.available) {
                    toast.error("This tapx.bio username does not exist");
                    setLoading(false);
                    setIsVerifying(false);
                    return;
                }
                
                payload.username = username;
            }

            const response = await fetch(`${API_URL}/stores/subscribe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (data.success) {
                setSuccess(true);
                toast.success("You're subscribed for updates!");
                setInputValue("");
            } else {
                toast.error(data.error || "Failed to subscribe");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred. Please try again.");
        } finally {
            setLoading(false);
            setIsVerifying(false);
        }
    };

    if (success) {
        return (
            <div className="mt-12 p-8 rounded-[2.5rem] text-center animate-in zoom-in duration-500"
                style={{ 
                    backgroundColor: isDarkTheme ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                    border: `1px solid ${isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`
                }}
            >
                <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                </div>
                <h3 className="text-lg font-black tracking-tight mb-2" style={{ color: textColor }}>You're on the list!</h3>
                <p className="text-xs opacity-60 font-medium" style={{ color: textColor }}>
                    We'll notify you when this store drops new products or updates.
                </p>
                <Button 
                    variant="ghost" 
                    className="mt-4 text-[10px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity"
                    onClick={() => setSuccess(false)}
                    style={{ color: textColor }}
                >
                    Subscribe another
                </Button>
            </div>
        );
    }

    return (
        <div className="mt-12 p-8 rounded-[2.5rem] relative overflow-hidden group"
            style={{ 
                backgroundColor: isDarkTheme ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.5)',
                border: `1px solid ${isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
                backdropBlur: '12px'
            }}
        >
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-black rounded-2xl flex items-center justify-center shadow-lg shadow-black/10">
                        <Bell className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black tracking-tight leading-none" style={{ color: textColor }}>Get Updates</h3>
                        <p className="text-[10px] uppercase font-bold tracking-widest opacity-40 mt-1" style={{ color: textColor }}>Never miss a drop</p>
                    </div>
                </div>

                <p className="text-xs font-medium opacity-60 mb-6 leading-relaxed" style={{ color: textColor }}>
                    Enter your email or <span className="font-bold">tapx username</span> to get notified about new products and exclusive offers.
                </p>

                <div className="flex flex-col gap-3">
                    <div className="relative">
                        <Input
                            placeholder="Email or @username"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            disabled={loading}
                            className={cn(
                                "h-14 rounded-2xl border-none font-bold text-sm px-5 transition-all outline-none ring-0 focus-visible:ring-2 focus-visible:ring-black/5",
                                isDarkTheme ? "bg-white/5 placeholder:text-white/20 text-white" : "bg-zinc-100 placeholder:text-zinc-400 text-black"
                            )}
                        />
                        {isVerifying && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                <span className="text-[10px] font-black uppercase text-zinc-400">Verifying</span>
                                <Loader2 className="w-3 h-3 animate-spin text-zinc-400" />
                            </div>
                        )}
                    </div>
                    <Button 
                        onClick={handleSubscribe}
                        disabled={loading || !inputValue.trim()}
                        className="h-14 rounded-2xl bg-black hover:bg-zinc-800 text-white font-black text-sm shadow-xl shadow-black/10 transition-all active:scale-95"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Keep me updated"}
                    </Button>
                </div>

                <p className="mt-6 text-[9px] font-bold opacity-30 text-center uppercase tracking-tighter" style={{ color: textColor }}>
                    Zero spam. Just important updates.
                </p>
            </div>
            
            {/* Background elements for aesthetic */}
            <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-black/5 rounded-full blur-3xl group-hover:bg-black/10 transition-colors" />
        </div>
    );
}
