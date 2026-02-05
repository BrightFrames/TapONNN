import { useState, useMemo, useCallback } from "react";
import { toast } from "sonner";
import LinktreeLayout from "@/layouts/LinktreeLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    appRegistry,
    APP_CATEGORIES,
    AppCategory,
    MarketplaceApp,
    getAppsByCategory,
    getCategoryCount,
    getRecommendedApps,
    searchApps,
    InstalledApp
} from "@/data/appRegistry";
import {
    Sparkles,
    Download,
    Check,
    ChevronRight,
    Zap,
    Clock,
    ExternalLink,
    Settings,
    Search,
    Crown,
    Star,
    Plug,
    Activity,
    CloudLightning,
    X,
    Heart,
    Share2,
    CheckCircle2,
    MessageCircle,
    RefreshCw
} from "lucide-react";

// Static plugins data for Add Plugin category
const staticPlugins = [
    {
        id: "plugin_qr_code",
        name: "QR Code Generator",
        description: "Generate beautiful QR codes for your profile that visitors can scan. Customize colors and styles to match your brand.",
        icon: "📱",
        category: "Utility",
        isPremium: false,
        install_count: 12500,
        rating: 4.8,
        reviews: 342,
        featured: true,
        features: ["Custom colors", "Logo embedding", "Download PNG/SVG", "Analytics tracking"]
    },
    {
        id: "plugin_analytics",
        name: "Advanced Analytics",
        description: "Get detailed insights about your profile visitors. Track clicks, views, locations, and devices with beautiful charts.",
        icon: "📊",
        category: "Analytics",
        isPremium: true,
        install_count: 8900,
        rating: 4.9,
        reviews: 567,
        featured: true,
        features: ["Real-time stats", "Location tracking", "Device breakdown", "Export reports"]
    },
    {
        id: "plugin_custom_themes",
        name: "Custom Themes",
        description: "Access premium themes and customize your profile with advanced design options. Stand out with unique animations and effects.",
        icon: "🎨",
        category: "Design",
        isPremium: true,
        install_count: 15600,
        rating: 4.7,
        reviews: 890,
        featured: false,
        features: ["50+ themes", "Custom CSS", "Animations", "Font library"]
    },
    {
        id: "plugin_link_scheduler",
        name: "Link Scheduler",
        description: "Schedule your links to appear or disappear at specific times. Perfect for time-limited offers and promotions.",
        icon: "📅",
        category: "Utility",
        isPremium: false,
        install_count: 6700,
        rating: 4.6,
        reviews: 234,
        featured: false,
        features: ["Time-based visibility", "Recurring schedules", "Timezone support", "Preview mode"]
    },
    {
        id: "plugin_testimonials",
        name: "Testimonials Showcase",
        description: "Display customer testimonials and reviews on your profile. Build trust with social proof from your happy customers.",
        icon: "⭐",
        category: "Social Proof",
        isPremium: false,
        install_count: 4300,
        rating: 4.5,
        reviews: 156,
        featured: false,
        features: ["Auto-rotate", "Star ratings", "Photo reviews", "Video testimonials"]
    }
];

// Static apps data for Connect App category  
const staticApps = [
    {
        id: "app_instagram",
        name: "Instagram Feed",
        description: "Connect your Instagram account to display your latest posts directly on your profile. Automatically syncs your feed in real-time.",
        icon: "📸",
        category: "Social",
        isPremium: false,
        install_count: 45000,
        rating: 4.9,
        reviews: 2340,
        featured: true,
        syncStatus: "real-time",
        features: ["Auto-sync posts", "Stories integration", "Grid layout", "Reels support"]
    },
    {
        id: "app_spotify",
        name: "Spotify Now Playing",
        description: "Show what you're currently listening to on Spotify. Display your favorite playlists and recently played tracks.",
        icon: "🎧",
        category: "Music",
        isPremium: false,
        install_count: 32000,
        rating: 4.8,
        reviews: 1890,
        featured: true,
        syncStatus: "real-time",
        features: ["Now playing widget", "Top tracks", "Playlist embed", "Album art"]
    },
    {
        id: "app_google_calendar",
        name: "Google Calendar",
        description: "Sync your Google Calendar to show your availability. Let visitors book meetings directly from your profile.",
        icon: "📆",
        category: "Scheduling",
        isPremium: true,
        install_count: 18500,
        rating: 4.7,
        reviews: 876,
        featured: false,
        syncStatus: "every-5-min",
        features: ["Availability slots", "Meeting booking", "Timezone auto-detect", "Email reminders"]
    },
    {
        id: "app_twitter",
        name: "Twitter/X Feed",
        description: "Display your latest tweets and threads on your profile. Keep your audience updated with your Twitter activity.",
        icon: "🐦",
        category: "Social",
        isPremium: false,
        install_count: 28000,
        rating: 4.6,
        reviews: 1234,
        featured: false,
        syncStatus: "every-15-min",
        features: ["Latest tweets", "Thread display", "Retweets", "Like counts"]
    },
    {
        id: "app_youtube",
        name: "YouTube Channel",
        description: "Showcase your YouTube videos and channel stats. Automatically display your latest uploads and subscriber count.",
        icon: "▶️",
        category: "Video",
        isPremium: false,
        install_count: 22000,
        rating: 4.8,
        reviews: 1567,
        featured: true,
        syncStatus: "hourly",
        features: ["Latest videos", "Sub count", "Views tracker", "Playlist embed"]
    }
];

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

const LinktreeMarketplace = () => {
    const [selectedCategory, setSelectedCategory] = useState<AppCategory>("All");
    const [installedApps, setInstalledApps] = useState<InstalledApp[]>([]);
    const [installing, setInstalling] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("plugins");
    const [detailModal, setDetailModal] = useState<any | null>(null);
    const [pluginCategory, setPluginCategory] = useState("all");
    const [appCategory, setAppCategory] = useState("all");

    // Get apps for current category
    const displayedApps = useMemo(() => {
        let apps: MarketplaceApp[];

        if (searchQuery.trim()) {
            apps = searchApps(searchQuery);
        } else {
            apps = getAppsByCategory(selectedCategory);
        }

        return apps.sort((a, b) => {
            if (a.category.includes("Featured") && !b.category.includes("Featured")) return -1;
            if (!a.category.includes("Featured") && b.category.includes("Featured")) return 1;
            if (a.isPremium && !b.isPremium) return -1;
            if (!a.isPremium && b.isPremium) return 1;
            if (a.status === "active" && b.status === "coming_soon") return -1;
            if (a.status === "coming_soon" && b.status === "active") return 1;
            return 0;
        });
    }, [selectedCategory, searchQuery]);

    const filteredPlugins = useMemo(() => {
        return staticPlugins.filter(plugin => {
            const matchesSearch = plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                plugin.description.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = pluginCategory === "all" || plugin.category === pluginCategory;
            return matchesSearch && matchesCategory;
        });
    }, [searchQuery, pluginCategory]);

    const filteredApps = useMemo(() => {
        return staticApps.filter(app => {
            const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                app.description.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = appCategory === "all" || app.category === appCategory;
            return matchesSearch && matchesCategory;
        });
    }, [searchQuery, appCategory]);

    const pluginCategories = ["all", ...new Set(staticPlugins.map(p => p.category))];
    const appCategories = ["all", ...new Set(staticApps.map(a => a.category))];

    const isInstalled = useCallback((appId: string) => {
        return installedApps.some(a => a.appId === appId);
    }, [installedApps]);

    const handleInstall = useCallback(async (item: any, isStatic = false) => {
        setInstalling(item.id);

        await new Promise(resolve => setTimeout(resolve, 800));

        if (isStatic) {
            toast.success(`${item.name} added to your profile!`);
            setInstalling(null);
            setDetailModal(null);
            return;
        }

        const newInstalledApp: InstalledApp = {
            appId: item.id,
            isActive: true,
            position: installedApps.length,
            config: {},
            installedAt: new Date()
        };

        setInstalledApps(prev => [...prev, newInstalledApp]);
        setInstalling(null);

        toast.success(`${item.name} added to your profile!`, {
            description: item.rendersOnProfile ? "It's now visible on your public profile" : undefined
        });
    }, [installedApps]);

    const handleUninstall = useCallback((appId: string) => {
        setInstalledApps(prev => prev.filter(a => a.appId !== appId));
        toast.success("App removed from your profile");
    }, []);

    const handleToggle = useCallback((appId: string) => {
        setInstalledApps(prev => prev.map(a =>
            a.appId === appId ? { ...a, isActive: !a.isActive } : a
        ));
    }, []);

    // Detail Modal Component
    const DetailModal = ({ item, type }: { item: any; type: 'plugin' | 'app' }) => {
        const gradient = getGradient(item.category);
        const isInstalling = installing === item.id;

        return (
            <div 
                className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={(e) => e.target === e.currentTarget && setDetailModal(null)}
            >
                <div className="relative w-full sm:max-w-2xl max-h-[85vh] sm:max-h-[90vh] overflow-hidden bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl shadow-2xl animate-in slide-in-from-bottom duration-300 sm:mx-4">
                    {/* Mobile drag handle */}
                    <div className="sm:hidden flex justify-center pt-3 pb-1">
                        <div className="w-10 h-1 bg-gray-300 dark:bg-zinc-700 rounded-full" />
                    </div>
                    
                    <div className={`relative h-32 bg-gradient-to-br ${gradient}`}>
                        <button
                            onClick={() => setDetailModal(null)}
                            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-xl backdrop-blur-sm transition-colors"
                        >
                            <X className="w-5 h-5 text-white" />
                        </button>
                        <div className="absolute -bottom-8 left-6">
                            <div className="w-16 h-16 rounded-2xl bg-white dark:bg-zinc-800 shadow-xl flex items-center justify-center text-3xl">
                                {item.icon}
                            </div>
                        </div>
                    </div>

                    <div className="px-6 pt-12 pb-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{item.name}</h2>
                                <div className="flex items-center gap-3 mt-2">
                                    <Badge variant="secondary" className="text-xs">{item.category}</Badge>
                                    {item.isPremium && (
                                        <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-xs">
                                            <Crown className="w-3 h-3 mr-1" /> Pro
                                        </Badge>
                                    )}
                                    {type === 'app' && item.syncStatus && (
                                        <Badge className="bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border-0 text-xs">
                                            <Activity className="w-3 h-3 mr-1" />
                                            {item.syncStatus === 'real-time' ? 'Real-time' : item.syncStatus}
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

                        <p className="text-gray-600 dark:text-zinc-400 mb-6 leading-relaxed">{item.description}</p>

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

                        {item.features && (
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
                        )}

                        <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-zinc-800">
                            <Button
                                onClick={() => handleInstall(item, true)}
                                disabled={isInstalling}
                                className={`flex-1 h-12 text-base font-semibold rounded-xl shadow-lg ${
                                    type === 'app'
                                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
                                        : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700'
                                } text-white`}
                            >
                                {isInstalling ? (
                                    <RefreshCw className="w-5 h-5 animate-spin" />
                                ) : type === 'app' ? (
                                    <><Plug className="w-5 h-5 mr-2" /> Connect App</>
                                ) : (
                                    <><Download className="w-5 h-5 mr-2" /> Add to Profile</>
                                )}
                            </Button>
                            <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl">
                                <Heart className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Card Component
    const ItemCard = ({ item, type }: { item: any; type: 'plugin' | 'app' }) => {
        const gradient = getGradient(item.category);
        const isInstalling = installing === item.id;

        return (
            <div
                className="group bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-transparent cursor-pointer"
                onClick={() => setDetailModal({ item, type })}
            >
                {item.featured && (
                    <div className="absolute top-3 right-3 z-10">
                        <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg text-xs">
                            <Sparkles className="w-3 h-3 mr-1" /> Featured
                        </Badge>
                    </div>
                )}

                <div className={`relative h-20 bg-gradient-to-br ${gradient} opacity-90 group-hover:opacity-100 transition-opacity`}>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
                        <div className="w-14 h-14 rounded-xl bg-white dark:bg-zinc-800 shadow-xl flex items-center justify-center text-2xl border-4 border-white dark:border-zinc-900 group-hover:scale-110 transition-transform">
                            {item.icon}
                        </div>
                    </div>
                </div>

                <div className="pt-10 pb-5 px-4">
                    <div className="text-center mb-3">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {item.name}
                        </h3>
                        <div className="flex items-center justify-center gap-2">
                            <Badge variant="secondary" className="text-xs">{item.category}</Badge>
                            {item.isPremium && (
                                <Badge className="bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-xs">Pro</Badge>
                            )}
                        </div>
                    </div>

                    <p className="text-gray-500 dark:text-zinc-400 text-sm text-center line-clamp-2 mb-4 h-10">
                        {item.description}
                    </p>

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

                    <Button
                        onClick={(e) => { e.stopPropagation(); handleInstall(item, true); }}
                        disabled={isInstalling}
                        className={`w-full h-10 font-semibold rounded-xl transition-all ${
                            type === 'app'
                                ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg shadow-green-500/25'
                                : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25'
                        }`}
                    >
                        {isInstalling ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : type === 'app' ? (
                            <><Plug className="w-4 h-4 mr-2" /> Connect</>
                        ) : (
                            <><Download className="w-4 h-4 mr-2" /> Add Plugin</>
                        )}
                    </Button>
                </div>
            </div>
        );
    };

    return (
        <LinktreeLayout>
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-black dark:to-zinc-950">
                {/* Hero Section */}
                <div className="relative overflow-hidden border-b border-gray-200 dark:border-zinc-800">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-100/50 via-purple-50/30 to-pink-50/50 dark:from-indigo-950/30 dark:via-purple-950/20 dark:to-pink-950/30" />
                    
                    <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 relative z-10">
                        <div className="text-center max-w-2xl mx-auto">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-full border border-gray-200 dark:border-zinc-800 mb-6 shadow-sm">
                                <Sparkles className="w-4 h-4 text-indigo-500" />
                                <span className="text-sm font-medium text-gray-700 dark:text-zinc-300">10+ Plugins & Apps</span>
                            </div>

                            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
                                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                                    App Marketplace
                                </span>
                            </h1>
                            <p className="text-base text-gray-600 dark:text-zinc-400 mb-8 max-w-xl mx-auto">
                                Supercharge your profile with plugins and connect apps for real-time updates
                            </p>

                            {/* Search Bar */}
                            <div className="relative max-w-md mx-auto group">
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur-xl opacity-20 group-focus-within:opacity-40 transition-opacity" />
                                <div className="relative flex items-center">
                                    <Search className="absolute left-4 h-5 w-5 text-gray-400 dark:text-zinc-500 group-focus-within:text-indigo-500 transition-colors" />
                                    <Input
                                        placeholder="Search plugins and apps..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-12 pr-4 h-12 bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-base rounded-xl shadow-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-600"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
                    {/* Main Tabs */}
                    <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setSearchQuery(""); }} className="w-full">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                            <TabsList className="h-auto p-1.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-sm inline-flex self-start">
                                <TabsTrigger
                                    value="plugins"
                                    className="rounded-xl px-5 py-3 text-sm font-semibold text-gray-600 dark:text-zinc-400 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg flex items-center gap-2 transition-all"
                                >
                                    <Plug className="w-4 h-4" />
                                    Add Plugins
                                    <Badge className="ml-1 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 border-0 text-xs">
                                        {staticPlugins.length}
                                    </Badge>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="apps"
                                    className="rounded-xl px-5 py-3 text-sm font-semibold text-gray-600 dark:text-zinc-400 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg flex items-center gap-2 transition-all"
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
                                        onClick={() => activeTab === 'plugins' ? setPluginCategory(cat) : setAppCategory(cat)}
                                        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                                            (activeTab === 'plugins' ? pluginCategory : appCategory) === cat
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
                            <div className="mb-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl">
                                        <Plug className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add Plugins</h2>
                                </div>
                                <p className="text-gray-500 dark:text-zinc-500 text-sm ml-11">
                                    Enhance your profile with powerful features
                                </p>
                            </div>

                            {/* Featured Plugins */}
                            {filteredPlugins.some(p => p.featured) && pluginCategory === 'all' && (
                                <div className="mb-8">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Sparkles className="w-5 h-5 text-amber-500" />
                                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">Featured</h3>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                        {filteredPlugins.filter(p => p.featured).map(plugin => (
                                            <ItemCard key={plugin.id} item={plugin} type="plugin" />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* All Plugins */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                {filteredPlugins.filter(p => pluginCategory !== 'all' || !p.featured).map(plugin => (
                                    <ItemCard key={plugin.id} item={plugin} type="plugin" />
                                ))}
                            </div>

                            {filteredPlugins.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-zinc-900 flex items-center justify-center mb-4">
                                        <Search className="w-7 h-7 text-gray-400 dark:text-zinc-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-300 mb-2">No plugins found</h3>
                                    <p className="text-gray-500 dark:text-zinc-500 text-sm">Try a different search or category</p>
                                </div>
                            )}
                        </TabsContent>

                        {/* Connect Apps Tab */}
                        <TabsContent value="apps" className="mt-0">
                            <div className="mb-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-green-100 dark:bg-green-500/20 rounded-xl">
                                        <Activity className="w-5 h-5 text-green-600 dark:text-green-400" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Connect Apps</h2>
                                </div>
                                <p className="text-gray-500 dark:text-zinc-500 text-sm ml-11">
                                    Connect your favorite apps for real-time updates
                                </p>
                            </div>

                            {/* Real-time Sync Banner */}
                            <div className="mb-6 p-5 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-2xl border border-green-200 dark:border-green-800/50">
                                <div className="flex items-start gap-4">
                                    <div className="p-2.5 bg-green-100 dark:bg-green-500/20 rounded-xl">
                                        <CloudLightning className="w-5 h-5 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Real-time Synchronization</h3>
                                        <p className="text-gray-600 dark:text-zinc-400 text-sm">
                                            Connected apps automatically sync your content to keep your profile updated.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Featured Apps */}
                            {filteredApps.some(a => a.featured) && appCategory === 'all' && (
                                <div className="mb-8">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Sparkles className="w-5 h-5 text-amber-500" />
                                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">Popular Apps</h3>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                        {filteredApps.filter(a => a.featured).map(app => (
                                            <ItemCard key={app.id} item={app} type="app" />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* All Apps */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                {filteredApps.filter(a => appCategory !== 'all' || !a.featured).map(app => (
                                    <ItemCard key={app.id} item={app} type="app" />
                                ))}
                            </div>

                            {filteredApps.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-zinc-900 flex items-center justify-center mb-4">
                                        <Activity className="w-7 h-7 text-gray-400 dark:text-zinc-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-300 mb-2">No apps found</h3>
                                    <p className="text-gray-500 dark:text-zinc-500 text-sm">Try a different search or category</p>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Detail Modal */}
                {detailModal && <DetailModal item={detailModal.item} type={detailModal.type} />}
            </div>
        </LinktreeLayout>
    );
};

export default LinktreeMarketplace;
