import { useState, useEffect } from "react";
import { toast } from "sonner";
import TapxLayout from "@/layouts/TapxLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/lib/supabase";
import { PluginConfigModal } from "@/components/marketplace/PluginConfigModal";
import { useTranslation } from "react-i18next";
import {
    Search,
    Check,
    Loader2,
    Music,
    Video,
    ShoppingBag,
    Users,
    Calendar,
    FileText,
    Mail,
    Instagram,
    Twitter,
    Youtube,
    Twitch,
    Linkedin,
    MessageCircle,
    Send,
    Headphones,
    DollarSign,
    Coffee,
    Globe,
    Settings,
    Truck,
    Box,
    CreditCard,
    Trash2,
    Download,
    Plug,
    Zap,
    Activity,
    AlertCircle,
    CheckCircle2,
    Clock,
    RefreshCw,
    ExternalLink,
    TrendingUp,
    Star,
    Sparkles,
    Link,
    BarChart3,
    Bell,
    Share2,
    Rss,
    Palette,
    QrCode,
    MapPin,
    Webhook,
    Database,
    CloudLightning,
    Smartphone,
    ArrowRight,
    X,
    Heart,
    Eye
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
    install_count: number;
    config_schema?: any[];
}

interface UserPlugin {
    _id: string;
    plugin_id: Plugin;
    is_active: boolean;
    config: Record<string, any>;
    installed_at: string;
}

// Static plugins data for Add Plugin category
const staticPlugins = [
    {
        _id: "plugin_qr_code",
        name: "QR Code Generator",
        slug: "qr-code",
        description: "Generate beautiful QR codes for your profile that visitors can scan. Customize colors and styles to match your brand.",
        icon: "qrcode",
        category: "Utility",
        type: "add",
        is_premium: false,
        install_count: 12500,
        rating: 4.8,
        reviews: 342,
        featured: true,
        screenshots: ["/plugins/qr-1.png", "/plugins/qr-2.png"],
        features: ["Custom colors", "Logo embedding", "Download PNG/SVG", "Analytics tracking"]
    },
    {
        _id: "plugin_analytics",
        name: "Advanced Analytics",
        slug: "analytics",
        description: "Get detailed insights about your profile visitors. Track clicks, views, locations, and devices with beautiful charts.",
        icon: "chart",
        category: "Analytics",
        type: "add",
        is_premium: true,
        install_count: 8900,
        rating: 4.9,
        reviews: 567,
        featured: true,
        screenshots: ["/plugins/analytics-1.png"],
        features: ["Real-time stats", "Location tracking", "Device breakdown", "Export reports"]
    },
    {
        _id: "plugin_custom_themes",
        name: "Custom Themes",
        slug: "themes",
        description: "Access premium themes and customize your profile with advanced design options. Stand out with unique animations and effects.",
        icon: "palette",
        category: "Design",
        type: "add",
        is_premium: true,
        install_count: 15600,
        rating: 4.7,
        reviews: 890,
        featured: false,
        screenshots: ["/plugins/themes-1.png"],
        features: ["50+ themes", "Custom CSS", "Animations", "Font library"]
    },
    {
        _id: "plugin_link_scheduler",
        name: "Link Scheduler",
        slug: "scheduler",
        description: "Schedule your links to appear or disappear at specific times. Perfect for time-limited offers and promotions.",
        icon: "calendar",
        category: "Utility",
        type: "add",
        is_premium: false,
        install_count: 6700,
        rating: 4.6,
        reviews: 234,
        featured: false,
        screenshots: ["/plugins/scheduler-1.png"],
        features: ["Time-based visibility", "Recurring schedules", "Timezone support", "Preview mode"]
    },
    {
        _id: "plugin_testimonials",
        name: "Testimonials Showcase",
        slug: "testimonials",
        description: "Display customer testimonials and reviews on your profile. Build trust with social proof from your happy customers.",
        icon: "star",
        category: "Social Proof",
        type: "add",
        is_premium: false,
        install_count: 4300,
        rating: 4.5,
        reviews: 156,
        featured: false,
        screenshots: ["/plugins/testimonials-1.png"],
        features: ["Auto-rotate", "Star ratings", "Photo reviews", "Video testimonials"]
    }
];

// Static apps data for Connect App category
const staticApps = [
    {
        _id: "app_instagram",
        name: "Instagram Feed",
        slug: "instagram-feed",
        description: "Connect your Instagram account to display your latest posts directly on your profile. Automatically syncs your feed in real-time.",
        icon: "instagram",
        category: "Social",
        type: "connect",
        is_premium: false,
        install_count: 45000,
        rating: 4.9,
        reviews: 2340,
        featured: true,
        syncStatus: "real-time",
        screenshots: ["/apps/instagram-1.png"],
        features: ["Auto-sync posts", "Stories integration", "Grid layout", "Reels support"]
    },
    {
        _id: "app_spotify",
        name: "Spotify Now Playing",
        slug: "spotify",
        description: "Show what you're currently listening to on Spotify. Display your favorite playlists and recently played tracks.",
        icon: "spotify",
        category: "Music",
        type: "connect",
        is_premium: false,
        install_count: 32000,
        rating: 4.8,
        reviews: 1890,
        featured: true,
        syncStatus: "real-time",
        screenshots: ["/apps/spotify-1.png"],
        features: ["Now playing widget", "Top tracks", "Playlist embed", "Album art"]
    },
    {
        _id: "app_google_calendar",
        name: "Google Calendar",
        slug: "google-calendar",
        description: "Sync your Google Calendar to show your availability. Let visitors book meetings directly from your profile.",
        icon: "calendar",
        category: "Scheduling",
        type: "connect",
        is_premium: true,
        install_count: 18500,
        rating: 4.7,
        reviews: 876,
        featured: false,
        syncStatus: "every-5-min",
        screenshots: ["/apps/calendar-1.png"],
        features: ["Availability slots", "Meeting booking", "Timezone auto-detect", "Email reminders"]
    },
    {
        _id: "app_twitter",
        name: "Twitter/X Feed",
        slug: "twitter",
        description: "Display your latest tweets and threads on your profile. Keep your audience updated with your Twitter activity.",
        icon: "twitter",
        category: "Social",
        type: "connect",
        is_premium: false,
        install_count: 28000,
        rating: 4.6,
        reviews: 1234,
        featured: false,
        syncStatus: "every-15-min",
        screenshots: ["/apps/twitter-1.png"],
        features: ["Latest tweets", "Thread display", "Retweets", "Like counts"]
    },
    {
        _id: "app_youtube",
        name: "YouTube Channel",
        slug: "youtube",
        description: "Showcase your YouTube videos and channel stats. Automatically display your latest uploads and subscriber count.",
        icon: "youtube",
        category: "Video",
        type: "connect",
        is_premium: false,
        install_count: 22000,
        rating: 4.8,
        reviews: 1567,
        featured: true,
        syncStatus: "hourly",
        screenshots: ["/apps/youtube-1.png"],
        features: ["Latest videos", "Sub count", "Views tracker", "Playlist embed"]
    }
];

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
        truck: Truck,
        box: Box,
        "credit-card": CreditCard,
        qrcode: QrCode,
        chart: BarChart3,
        palette: Palette,
        star: Star,
        webhook: Webhook,
        database: Database,
        rss: Rss,
        bell: Bell,
        share: Share2,
        link: Link,
        mappin: MapPin
    };
    return iconMap[iconName] || Globe;
};

const getGradient = (category: string) => {
    const gradients: Record<string, string> = {
        Social: "from-pink-500 to-rose-500",
        Music: "from-green-500 to-emerald-500",
        Video: "from-red-500 to-orange-500",
        Analytics: "from-blue-500 to-cyan-500",
        Design: "from-purple-500 to-violet-500",
        Utility: "from-amber-500 to-yellow-500",
        "Social Proof": "from-indigo-500 to-blue-500",
        Scheduling: "from-teal-500 to-cyan-500",
        default: "from-gray-500 to-slate-500"
    };
    return gradients[category] || gradients.default;
};

const Marketplace = () => {
    const { t } = useTranslation();
    const [plugins, setPlugins] = useState<Plugin[]>([]);
    const [installedPlugins, setInstalledPlugins] = useState<UserPlugin[]>([]);
    const [loading, setLoading] = useState(true);
    const [installing, setInstalling] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("plugins");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [detailModal, setDetailModal] = useState<any | null>(null);

    // Configuration Modal State
    const [configModalOpen, setConfigModalOpen] = useState(false);
    const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null);
    const [selectedConfig, setSelectedConfig] = useState<Record<string, any>>({});

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

    useEffect(() => {
        fetchPlugins();
        fetchInstalledPlugins();
    }, []);

    const fetchPlugins = async () => {
        try {
            const response = await fetch(`${API_URL}/marketplace/plugins`);
            if (response.ok) {
                const data = await response.json();
                setPlugins(data);
            }
        } catch (error) {
            console.error('Error fetching plugins:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchInstalledPlugins = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.access_token) return;

            const response = await fetch(`${API_URL}/marketplace/my-plugins`, {
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });

            if (response.ok) {
                const data: UserPlugin[] = await response.json();
                setInstalledPlugins(data);
            }
        } catch (error) {
            console.error('Error fetching installed plugins:', error);
        }
    };

    const handleInstall = async (pluginId: string, isStatic = false) => {
        setInstalling(pluginId);
        
        // For static plugins/apps, simulate installation
        if (isStatic) {
            await new Promise(resolve => setTimeout(resolve, 1500));
            toast.success('Successfully added to your profile!');
            setInstalling(null);
            setDetailModal(null);
            return;
        }

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.access_token) {
                toast.error('Please log in to install apps');
                return;
            }

            const response = await fetch(`${API_URL}/marketplace/install/${pluginId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });

            if (response.ok) {
                const newUserPlugin = await response.json();
                setInstalledPlugins(prev => [...prev, newUserPlugin]);
                toast.success('Plugin installed successfully!');

                if (newUserPlugin.plugin_id.config_schema && newUserPlugin.plugin_id.config_schema.length > 0) {
                    handleConfigure(newUserPlugin.plugin_id, {});
                }
            } else {
                const error = await response.json();
                toast.error(error.error || 'Failed to install plugin');
            }
        } catch (error) {
            console.error('Error installing plugin:', error);
            toast.error('Failed to install plugin');
        } finally {
            setInstalling(null);
        }
    };

    const handleUninstall = async (pluginId: string) => {
        setInstalling(pluginId);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.access_token) return;

            const response = await fetch(`${API_URL}/marketplace/uninstall/${pluginId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });

            if (response.ok) {
                setInstalledPlugins(prev => prev.filter(up => up.plugin_id._id !== pluginId));
                toast.success('Plugin uninstalled');
            } else {
                toast.error('Failed to uninstall plugin');
            }
        } catch (error) {
            console.error('Error uninstalling plugin:', error);
            toast.error('Failed to uninstall plugin');
        } finally {
            setInstalling(null);
        }
    };

    const handleConfigure = (plugin: Plugin, config: Record<string, any>) => {
        setSelectedPlugin(plugin);
        setSelectedConfig(config || {});
        setConfigModalOpen(true);
    };

    const saveConfig = async (config: Record<string, any>) => {
        if (!selectedPlugin) return;

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.access_token) return;

            const response = await fetch(`${API_URL}/marketplace/config/${selectedPlugin._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ config })
            });

            if (response.ok) {
                toast.success('Configuration saved');
                setInstalledPlugins(prev => prev.map(up =>
                    up.plugin_id._id === selectedPlugin._id
                        ? { ...up, config }
                        : up
                ));
            } else {
                toast.error('Failed to save configuration');
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to save configuration');
        }
    };

    const filteredPlugins = staticPlugins.filter(plugin => {
        const matchesSearch = plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            plugin.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "all" || plugin.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const filteredApps = staticApps.filter(app => {
        const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            app.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "all" || app.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const pluginCategories = ["all", ...new Set(staticPlugins.map(p => p.category))];
    const appCategories = ["all", ...new Set(staticApps.map(a => a.category))];

    if (loading) {
        return (
            <TapxLayout>
                <div className="flex flex-col items-center justify-center min-h-screen bg-transparent p-6 text-center">
                    <div className="relative">
                        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center animate-pulse">
                            <Sparkles className="w-10 h-10 text-white" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-6">Loading Marketplace...</h2>
                    <p className="text-gray-500 dark:text-zinc-500 max-w-md mt-2">Discovering amazing plugins and apps</p>
                </div>
            </TapxLayout>
        );
    }

    // Plugin/App Detail Modal
    const DetailModal = ({ item, type }: { item: any; type: 'plugin' | 'app' }) => {
        const IconComponent = getIconComponent(item.icon);
        const gradient = getGradient(item.category);
        const isInstalling = installing === item._id;

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl">
                    {/* Header with gradient */}
                    <div className={`relative h-40 bg-gradient-to-br ${gradient}`}>
                        <button
                            onClick={() => setDetailModal(null)}
                            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-xl backdrop-blur-sm transition-colors"
                        >
                            <X className="w-5 h-5 text-white" />
                        </button>
                        <div className="absolute -bottom-10 left-6">
                            <div className="w-20 h-20 rounded-2xl bg-white dark:bg-zinc-800 shadow-xl flex items-center justify-center">
                                <IconComponent className="w-10 h-10 text-gray-700 dark:text-white" />
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="px-6 pt-14 pb-6 overflow-y-auto max-h-[calc(90vh-10rem)]">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{item.name}</h2>
                                <div className="flex items-center gap-3 mt-2">
                                    <Badge variant="secondary" className="text-xs">
                                        {item.category}
                                    </Badge>
                                    {item.is_premium && (
                                        <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-xs">
                                            <Sparkles className="w-3 h-3 mr-1" />
                                            Premium
                                        </Badge>
                                    )}
                                    {type === 'app' && (
                                        <Badge className="bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border-0 text-xs">
                                            <Activity className="w-3 h-3 mr-1" />
                                            {item.syncStatus === 'real-time' ? 'Real-time sync' : `Syncs ${item.syncStatus}`}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center gap-1 text-amber-500">
                                    <Star className="w-5 h-5 fill-current" />
                                    <span className="font-bold text-lg">{item.rating}</span>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-zinc-500">{item.reviews} reviews</p>
                            </div>
                        </div>

                        <p className="text-gray-600 dark:text-zinc-400 mb-6 leading-relaxed">
                            {item.description}
                        </p>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="text-center p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-2xl">
                                <Download className="w-5 h-5 mx-auto text-gray-400 mb-2" />
                                <p className="text-lg font-bold text-gray-900 dark:text-white">{(item.install_count / 1000).toFixed(1)}K</p>
                                <p className="text-xs text-gray-500 dark:text-zinc-500">Installs</p>
                            </div>
                            <div className="text-center p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-2xl">
                                <Star className="w-5 h-5 mx-auto text-amber-400 mb-2" />
                                <p className="text-lg font-bold text-gray-900 dark:text-white">{item.rating}</p>
                                <p className="text-xs text-gray-500 dark:text-zinc-500">Rating</p>
                            </div>
                            <div className="text-center p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-2xl">
                                <MessageCircle className="w-5 h-5 mx-auto text-gray-400 mb-2" />
                                <p className="text-lg font-bold text-gray-900 dark:text-white">{item.reviews}</p>
                                <p className="text-xs text-gray-500 dark:text-zinc-500">Reviews</p>
                            </div>
                        </div>

                        {/* Features */}
                        <div className="mb-6">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Features</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {item.features.map((feature: string, index: number) => (
                                    <div key={index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-zinc-400">
                                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                                        <span>{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-zinc-800">
                            <Button
                                onClick={() => handleInstall(item._id, true)}
                                disabled={isInstalling}
                                className={`flex-1 h-12 text-base font-semibold ${
                                    type === 'app'
                                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
                                        : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700'
                                } text-white rounded-xl shadow-lg`}
                            >
                                {isInstalling ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : type === 'app' ? (
                                    <>
                                        <Plug className="w-5 h-5 mr-2" />
                                        Connect App
                                    </>
                                ) : (
                                    <>
                                        <Download className="w-5 h-5 mr-2" />
                                        Add to Profile
                                    </>
                                )}
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-12 w-12 rounded-xl border-gray-200 dark:border-zinc-700"
                            >
                                <Heart className="w-5 h-5" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-12 w-12 rounded-xl border-gray-200 dark:border-zinc-700"
                            >
                                <Share2 className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Plugin Card Component
    const PluginCard = ({ item, type }: { item: any; type: 'plugin' | 'app' }) => {
        const IconComponent = getIconComponent(item.icon);
        const gradient = getGradient(item.category);
        const isInstalling = installing === item._id;

        return (
            <Card
                className="group relative overflow-hidden border transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 bg-white dark:bg-zinc-900/80 backdrop-blur-sm border-gray-100 dark:border-zinc-800 hover:border-transparent cursor-pointer"
                onClick={() => setDetailModal({ item, type })}
            >
                {/* Featured Badge */}
                {item.featured && (
                    <div className="absolute top-3 right-3 z-10">
                        <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg text-xs px-2 py-0.5">
                            <Sparkles className="w-3 h-3 mr-1" />
                            Featured
                        </Badge>
                    </div>
                )}

                <CardContent className="p-0">
                    {/* Icon Header */}
                    <div className={`relative h-28 bg-gradient-to-br ${gradient} opacity-90 group-hover:opacity-100 transition-opacity`}>
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLTZ2LTRoLTJ2NGgyek0zMCAzNGgtMnYtNGgydjR6bTAtNnYtNGgtMnY0aDJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
                            <div className="w-16 h-16 rounded-2xl bg-white dark:bg-zinc-800 shadow-xl flex items-center justify-center border-4 border-white dark:border-zinc-900 group-hover:scale-110 transition-transform">
                                <IconComponent className="w-8 h-8 text-gray-700 dark:text-white" />
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="pt-12 pb-5 px-5">
                        <div className="text-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                {item.name}
                            </h3>
                            <div className="flex items-center justify-center gap-2">
                                <Badge variant="secondary" className="text-xs font-medium">
                                    {item.category}
                                </Badge>
                                {item.is_premium && (
                                    <Badge className="bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20 text-xs">
                                        Premium
                                    </Badge>
                                )}
                            </div>
                        </div>

                        <p className="text-gray-500 dark:text-zinc-400 text-sm text-center line-clamp-2 mb-4 leading-relaxed h-10">
                            {item.description}
                        </p>

                        {/* Rating and Stats */}
                        <div className="flex items-center justify-center gap-4 mb-4 text-sm">
                            <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-amber-500 fill-current" />
                                <span className="font-semibold text-gray-900 dark:text-white">{item.rating}</span>
                            </div>
                            <div className="w-px h-4 bg-gray-200 dark:bg-zinc-700" />
                            <div className="flex items-center gap-1 text-gray-500 dark:text-zinc-500">
                                <Download className="w-3.5 h-3.5" />
                                <span>{(item.install_count / 1000).toFixed(0)}K</span>
                            </div>
                        </div>

                        {/* Action Button */}
                        <Button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleInstall(item._id, true);
                            }}
                            disabled={isInstalling}
                            className={`w-full h-11 font-semibold rounded-xl transition-all ${
                                type === 'app'
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg shadow-green-500/25'
                                    : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25'
                            }`}
                        >
                            {isInstalling ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : type === 'app' ? (
                                <>
                                    <Plug className="w-4 h-4 mr-2" />
                                    Connect
                                </>
                            ) : (
                                <>
                                    <Download className="w-4 h-4 mr-2" />
                                    Add Plugin
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <TapxLayout>
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-black dark:to-zinc-950 font-sans text-gray-900 dark:text-zinc-100">
                {/* Hero Section */}
                <div className="relative overflow-hidden border-b border-gray-200 dark:border-zinc-800">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-100/50 via-purple-50/30 to-pink-50/50 dark:from-indigo-950/30 dark:via-purple-950/20 dark:to-pink-950/30" />
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM2MzY2ZjEiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0aC0ydi00aDJ2NHptMC02di00aC0ydjRoMnpNMzAgMzRoLTJ2LTRoMnY0em0wLTZ2LTRoLTJ2NGgyek0yNCAzNGgtMnYtNGgydjR6bTAtNnYtNGgtMnY0aDJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50 dark:opacity-30" />
                    
                    <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
                        <div className="text-center max-w-3xl mx-auto">
                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-full border border-gray-200 dark:border-zinc-800 mb-6 shadow-sm">
                                <Sparkles className="w-4 h-4 text-indigo-500" />
                                <span className="text-sm font-medium text-gray-700 dark:text-zinc-300">Discover 10+ Plugins & Apps</span>
                            </div>

                            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
                                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                                    Marketplace
                                </span>
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-zinc-400 mb-8 max-w-2xl mx-auto leading-relaxed">
                                Supercharge your profile with powerful plugins and connect your favorite apps for real-time updates
                            </p>

                            {/* Search Bar */}
                            <div className="relative max-w-xl mx-auto group">
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur-xl opacity-20 group-focus-within:opacity-40 transition-opacity" />
                                <div className="relative flex items-center">
                                    <Search className="absolute left-4 h-5 w-5 text-gray-400 dark:text-zinc-500 group-focus-within:text-indigo-500 transition-colors" />
                                    <Input
                                        type="text"
                                        placeholder="Search plugins and apps..."
                                        className="pl-12 pr-4 h-14 bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-base rounded-2xl shadow-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-600"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 py-10">
                    {/* Main Tabs */}
                    <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setSelectedCategory("all"); }} className="w-full">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                            <TabsList className="h-auto p-1.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-sm inline-flex self-start">
                                <TabsTrigger
                                    value="plugins"
                                    className="rounded-xl px-6 py-3.5 text-sm font-semibold text-gray-600 dark:text-zinc-400 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg flex items-center gap-2 transition-all"
                                >
                                    <Plug className="w-4 h-4" />
                                    Add Plugins
                                    <Badge className="ml-1 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 border-0 text-xs">
                                        {staticPlugins.length}
                                    </Badge>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="apps"
                                    className="rounded-xl px-6 py-3.5 text-sm font-semibold text-gray-600 dark:text-zinc-400 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg flex items-center gap-2 transition-all"
                                >
                                    <Activity className="w-4 h-4" />
                                    Connect Apps
                                    <Badge className="ml-1 bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border-0 text-xs">
                                        {staticApps.length}
                                    </Badge>
                                </TabsTrigger>
                            </TabsList>

                            {/* Category Filter */}
                            <div className="flex items-center gap-2 flex-wrap">
                                {(activeTab === 'plugins' ? pluginCategories : appCategories).map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
                                            selectedCategory === cat
                                                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-md'
                                                : 'bg-white dark:bg-zinc-900 text-gray-600 dark:text-zinc-400 border border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700'
                                        }`}
                                    >
                                        {cat === 'all' ? 'All' : cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Add Plugins Tab */}
                        <TabsContent value="plugins" className="mt-0">
                            {/* Section Header */}
                            <div className="mb-8">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl">
                                        <Plug className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add Plugins</h2>
                                </div>
                                <p className="text-gray-500 dark:text-zinc-500 ml-12">
                                    Enhance your profile with powerful features and tools
                                </p>
                            </div>

                            {/* Featured Plugins */}
                            {filteredPlugins.some(p => p.featured) && selectedCategory === 'all' && (
                                <div className="mb-10">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Sparkles className="w-5 h-5 text-amber-500" />
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Featured</h3>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {filteredPlugins.filter(p => p.featured).map(plugin => (
                                            <PluginCard key={plugin._id} item={plugin} type="plugin" />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* All Plugins */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredPlugins.filter(p => selectedCategory !== 'all' || !p.featured).map(plugin => (
                                    <PluginCard key={plugin._id} item={plugin} type="plugin" />
                                ))}
                            </div>

                            {filteredPlugins.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-zinc-900 flex items-center justify-center mb-4">
                                        <Search className="w-8 h-8 text-gray-400 dark:text-zinc-600" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-zinc-300 mb-2">No plugins found</h3>
                                    <p className="text-gray-500 dark:text-zinc-500 max-w-sm">Try adjusting your search or category filter</p>
                                </div>
                            )}
                        </TabsContent>

                        {/* Connect Apps Tab */}
                        <TabsContent value="apps" className="mt-0">
                            {/* Section Header */}
                            <div className="mb-8">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-green-100 dark:bg-green-500/20 rounded-xl">
                                        <Activity className="w-5 h-5 text-green-600 dark:text-green-400" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Connect Apps</h2>
                                </div>
                                <p className="text-gray-500 dark:text-zinc-500 ml-12">
                                    Connect your favorite apps and show real-time updates on your profile
                                </p>
                            </div>

                            {/* Real-time Sync Banner */}
                            <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-2xl border border-green-200 dark:border-green-800/50">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-green-100 dark:bg-green-500/20 rounded-xl">
                                        <CloudLightning className="w-6 h-6 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Real-time Synchronization</h3>
                                        <p className="text-gray-600 dark:text-zinc-400 text-sm">
                                            Connected apps automatically sync your content. Your profile stays updated with your latest posts, music, videos, and more.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Featured Apps */}
                            {filteredApps.some(a => a.featured) && selectedCategory === 'all' && (
                                <div className="mb-10">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Sparkles className="w-5 h-5 text-amber-500" />
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Popular Apps</h3>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {filteredApps.filter(a => a.featured).map(app => (
                                            <PluginCard key={app._id} item={app} type="app" />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* All Apps */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredApps.filter(a => selectedCategory !== 'all' || !a.featured).map(app => (
                                    <PluginCard key={app._id} item={app} type="app" />
                                ))}
                            </div>

                            {filteredApps.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-zinc-900 flex items-center justify-center mb-4">
                                        <Activity className="w-8 h-8 text-gray-400 dark:text-zinc-600" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-zinc-300 mb-2">No apps found</h3>
                                    <p className="text-gray-500 dark:text-zinc-500 max-w-sm">Try adjusting your search or category filter</p>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Detail Modal */}
                {detailModal && <DetailModal item={detailModal.item} type={detailModal.type} />}

                <PluginConfigModal
                    isOpen={configModalOpen}
                    onClose={() => setConfigModalOpen(false)}
                    plugin={selectedPlugin}
                    currentConfig={selectedConfig}
                    onSave={saveConfig}
                />
            </div>
        </TapxLayout>
    );
};

export default Marketplace;
