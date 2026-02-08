import { useState, useEffect } from "react";
import { toast } from "sonner";
import TapxLayout from "@/layouts/TapxLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import {
    Loader2,
    Trash2,
    Settings,
    Package,
    Plus,
    Music,
    Video,
    ShoppingBag,
    Users,
    Calendar,
    FileText,
    Mail,
    MessageCircle,
    Instagram,
    Twitter,
    Youtube,
    Twitch,
    Linkedin,
    Send,
    Headphones,
    DollarSign,
    Coffee,
    Globe,
    Crown
} from "lucide-react";

interface Plugin {
    _id: string;
    name: string;
    slug: string;
    description: string;
    icon: string;
    category: string;
    type: string;
    is_premium: boolean;
}

interface UserPlugin {
    _id: string;
    plugin_id: Plugin;
    is_active: boolean;
    config: Record<string, any>;
    installed_at: string;
}

const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, any> = {
        instagram: Instagram,
        twitter: Twitter,
        youtube: Youtube,
        twitch: Twitch,
        linkedin: Linkedin,
        spotify: Headphones,
        discord: MessageCircle,
        telegram: Send,
        whatsapp: MessageCircle,
        tiktok: Video,
        soundcloud: Music,
        bandcamp: Music,
        deezer: Music,
        apple: Music,
        vimeo: Video,
        shopify: ShoppingBag,
        spring: ShoppingBag,
        gofundme: DollarSign,
        paypal: DollarSign,
        coffee: Coffee,
        patreon: DollarSign,
        calendar: Calendar,
        typeform: FileText,
        google: FileText,
        mailchimp: Mail,
        convertkit: Mail,
        snapchat: Users,
    };
    return iconMap[iconName] || Globe;
};

const MyApps = () => {
    const navigate = useNavigate();
    const [userPlugins, setUserPlugins] = useState<UserPlugin[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

    useEffect(() => {
        fetchUserPlugins();
    }, []);

    const fetchUserPlugins = async () => {
        try {
            const token = localStorage.getItem("auth_token");
            if (!token) {
                setLoading(false);
                return;
            }

            const response = await fetch(`${API_URL}/marketplace/my-plugins`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setUserPlugins(data);
            }
        } catch (error) {
            console.error('Error fetching user plugins:', error);
            toast.error('Failed to load your apps');
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (pluginId: string) => {
        setActionLoading(pluginId);
        try {
            const token = localStorage.getItem("auth_token");
            if (!token) return;

            const response = await fetch(`${API_URL}/marketplace/toggle/${pluginId}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const updated = await response.json();
                setUserPlugins(prev => prev.map(up =>
                    up.plugin_id._id === pluginId ? { ...up, is_active: updated.is_active } : up
                ));
                toast.success(updated.is_active ? 'App enabled' : 'App disabled');
            }
        } catch (error) {
            console.error('Error toggling plugin:', error);
            toast.error('Failed to update app status');
        } finally {
            setActionLoading(null);
        }
    };

    const handleUninstall = async (pluginId: string) => {
        if (!confirm('Are you sure you want to uninstall this app?')) return;

        setActionLoading(pluginId);
        try {
            const token = localStorage.getItem("auth_token");
            if (!token) return;

            const response = await fetch(`${API_URL}/marketplace/uninstall/${pluginId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                setUserPlugins(prev => prev.filter(up => up.plugin_id._id !== pluginId));
                toast.success('App uninstalled');
            }
        } catch (error) {
            console.error('Error uninstalling plugin:', error);
            toast.error('Failed to uninstall app');
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <TapxLayout>
                <div className="flex items-center justify-center h-[60vh]">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                </div>
            </TapxLayout>
        );
    }

    return (
        <TapxLayout>
            <div className="py-8 px-6 md:px-10 max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <Package className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">My Apps</h1>
                            <p className="text-gray-500 text-sm">Manage your installed apps</p>
                        </div>
                    </div>
                    <Button
                        onClick={() => navigate('/marketplace')}
                        className="bg-purple-600 hover:bg-purple-700 rounded-full gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Add Apps
                    </Button>
                </div>

                {/* Installed Apps List */}
                {userPlugins.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                        <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Package className="w-8 h-8 text-purple-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">No apps installed</h3>
                        <p className="text-gray-500 mb-6">Browse the marketplace to discover and install apps</p>
                        <Button
                            onClick={() => navigate('/marketplace')}
                            className="bg-purple-600 hover:bg-purple-700 rounded-full gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Browse Marketplace
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {userPlugins.map(userPlugin => {
                            const plugin = userPlugin.plugin_id;
                            const IconComponent = getIconComponent(plugin.icon);
                            const isLoading = actionLoading === plugin._id;

                            return (
                                <Card
                                    key={userPlugin._id}
                                    className={`transition-all ${!userPlugin.is_active ? 'opacity-60' : ''}`}
                                >
                                    <CardContent className="p-5">
                                        <div className="flex items-center gap-4">
                                            {/* Icon */}
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${userPlugin.is_active ? 'bg-gradient-to-br from-purple-100 to-indigo-50' : 'bg-gray-100'}`}>
                                                <IconComponent className={`w-6 h-6 ${userPlugin.is_active ? 'text-purple-600' : 'text-gray-400'}`} />
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold text-gray-900">{plugin.name}</h3>
                                                    {plugin.is_premium && (
                                                        <Badge variant="secondary" className="bg-amber-100 text-amber-700 gap-1">
                                                            <Crown className="w-3 h-3" /> Pro
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-500">{plugin.description}</p>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-3">
                                                <Switch
                                                    checked={userPlugin.is_active}
                                                    onCheckedChange={() => handleToggle(plugin._id)}
                                                    disabled={isLoading}
                                                />
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-gray-400 hover:text-gray-600"
                                                    disabled={isLoading}
                                                >
                                                    <Settings className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleUninstall(plugin._id)}
                                                    className="text-red-400 hover:text-red-600 hover:bg-red-50"
                                                    disabled={isLoading}
                                                >
                                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </TapxLayout>
    );
};

export default MyApps;
