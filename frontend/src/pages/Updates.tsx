import { useState, useEffect } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Bell, Info, CheckCircle, AlertTriangle, PartyPopper, ExternalLink, Clock, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface Update {
    _id: string;
    title: string;
    message?: string;
    style: 'info' | 'success' | 'warning' | 'promo';
    url?: string;
    createdAt: string;
    profile: {
        username: string;
        name: string;
        avatar?: string;
    };
}

const Updates = () => {
    const { token } = useAuth();
    const [updates, setUpdates] = useState<Update[]>([]);
    const [loading, setLoading] = useState(true);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

    useEffect(() => {
        fetchUpdates();
    }, []);

    const fetchUpdates = async () => {
        try {
            const response = await fetch(`${API_URL}/blocks/updates/feed`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setUpdates(data);
            }
        } catch (err) {
            console.error('Error fetching updates:', err);
        } finally {
            setLoading(false);
        }
    };

    const styleConfig = {
        info: { icon: Info, bg: 'bg-blue-500/10', border: 'border-blue-500/20', iconBg: 'bg-blue-500/20', iconColor: 'text-blue-500' },
        success: { icon: CheckCircle, bg: 'bg-green-500/10', border: 'border-green-500/20', iconBg: 'bg-green-500/20', iconColor: 'text-green-500' },
        warning: { icon: AlertTriangle, bg: 'bg-amber-500/10', border: 'border-amber-500/20', iconBg: 'bg-amber-500/20', iconColor: 'text-amber-500' },
        promo: { icon: PartyPopper, bg: 'bg-purple-500/10', border: 'border-purple-500/20', iconBg: 'bg-purple-500/20', iconColor: 'text-purple-500' },
    };

    const formatTime = (date: string) => {
        const now = new Date();
        const then = new Date(date);
        const diffMs = now.getTime() - then.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return then.toLocaleDateString();
    };

    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto py-8 px-4">
                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Bell className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Updates</h1>
                        <p className="text-sm text-muted-foreground">Stay updated with the latest from profiles you follow</p>
                    </div>
                </div>

                {/* Updates List */}
                <div className="space-y-3">
                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="animate-pulse bg-muted/50 rounded-2xl h-24" />
                            ))}
                        </div>
                    ) : updates.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                                <Bell className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <h3 className="font-semibold text-lg mb-1">No updates yet</h3>
                            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                                Updates from profiles you interact with will appear here. Explore and follow profiles to get started!
                            </p>
                        </div>
                    ) : (
                        updates.map((update) => {
                            const config = styleConfig[update.style] || styleConfig.info;
                            const UpdateIcon = config.icon;

                            return (
                                <div
                                    key={update._id}
                                    className={cn(
                                        "p-4 rounded-2xl border transition-all",
                                        config.bg,
                                        config.border,
                                        update.url && "cursor-pointer hover:shadow-lg active:scale-[0.99]"
                                    )}
                                    onClick={() => update.url && window.open(update.url, '_blank')}
                                >
                                    <div className="flex gap-3">
                                        {/* Icon */}
                                        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", config.iconBg)}>
                                            <UpdateIcon className={cn("w-5 h-5", config.iconColor)} />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="flex items-center gap-1.5">
                                                    {update.profile.avatar ? (
                                                        <img src={update.profile.avatar} className="w-4 h-4 rounded-full" alt="" />
                                                    ) : (
                                                        <User className="w-4 h-4 text-muted-foreground" />
                                                    )}
                                                    <span className="text-xs font-medium text-muted-foreground">
                                                        @{update.profile.username}
                                                    </span>
                                                </div>
                                                <span className="text-xs text-muted-foreground/60">•</span>
                                                <span className="text-xs text-muted-foreground/60 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {formatTime(update.createdAt)}
                                                </span>
                                            </div>

                                            <h4 className="font-bold text-sm">{update.title}</h4>
                                            {update.message && (
                                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{update.message}</p>
                                            )}
                                        </div>

                                        {/* External Link Indicator */}
                                        {update.url && (
                                            <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Updates;
