import { useState, useEffect } from "react";
import { toast } from "sonner";
import LinktreeLayout from "@/layouts/LinktreeLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";
import { PluginConfigModal } from "@/components/marketplace/PluginConfigModal";
import { useTranslation } from "react-i18next";
import {
    Search,
    Plus,
    Check,
    Loader2,
    Crown,
    Sparkles,
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
    Download
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

const CATEGORIES = [
    { id: 'all', label: 'All', icon: Globe },
    { id: 'Commerce', label: 'Commerce', icon: ShoppingBag },
    { id: 'Scheduling', label: 'Scheduling', icon: Calendar },
    { id: 'Social', label: 'Social', icon: Users },
    { id: 'Marketing', label: 'Marketing', icon: Mail },
    { id: 'Community', label: 'Community', icon: MessageCircle },
    { id: 'Music', label: 'Music', icon: Music },
    { id: 'Video', label: 'Video', icon: Video },
    { id: 'Forms', label: 'Forms', icon: FileText },
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
        "credit-card": CreditCard
    };
    return iconMap[iconName] || Globe;
};

const Marketplace = () => {
    const { t } = useTranslation();
    const [plugins, setPlugins] = useState<Plugin[]>([]);
    const [installedPlugins, setInstalledPlugins] = useState<UserPlugin[]>([]);
    const [loading, setLoading] = useState(true);
    const [installing, setInstalling] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("all");

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
            toast.error('Failed to load marketplace');
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

    const handleInstall = async (pluginId: string) => {
        setInstalling(pluginId);
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
                toast.success('App installed successfully!');

                // Open config modal if plugin has configuration
                if (newUserPlugin.plugin_id.config_schema && newUserPlugin.plugin_id.config_schema.length > 0) {
                    handleConfigure(newUserPlugin.plugin_id, {});
                }
            } else {
                const error = await response.json();
                toast.error(error.error || 'Failed to install app');
            }
        } catch (error) {
            console.error('Error installing plugin:', error);
            toast.error('Failed to install app');
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
                toast.success('App uninstalled');
            } else {
                toast.error('Failed to uninstall app');
            }
        } catch (error) {
            console.error('Error uninstalling plugin:', error);
            toast.error('Failed to uninstall app');
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
                // Update local state
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
    }

    const filteredPlugins = plugins.filter(plugin => {
        const matchesCategory = activeCategory === 'all' || plugin.category === activeCategory;
        const matchesSearch = plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            plugin.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    if (loading) {
        return (
            <LinktreeLayout>
                <div className="flex flex-col items-center justify-center min-h-screen bg-transparent p-6 text-center">
                    <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Loading Marketplace...</h2>
                    <p className="text-gray-500 dark:text-zinc-500 max-w-md mt-2">Discover tools to grow your audience</p>
                </div>
            </LinktreeLayout>
        );
    }

    return (
        <LinktreeLayout>
            <div className="min-h-screen bg-transparent font-sans text-gray-900 dark:text-zinc-100">
                {/* Hero Section */}
                <div className="relative border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40">
                    <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02] bg-[size:20px_20px]" />
                    <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
                        <div className="max-w-3xl">
                            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-4 sm:text-5xl">
                                {t('marketplace.title')}
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-zinc-400 mb-8 max-w-2xl leading-relaxed">
                                {t('marketplace.subtitle')}
                            </p>

                            {/* Search Bar */}
                            <div className="relative max-w-xl group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-zinc-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors" />
                                <Input
                                    type="text"
                                    placeholder={t('marketplace.searchPlaceholder')}
                                    className="pl-12 pr-4 h-12 bg-white dark:bg-zinc-900/80 border-gray-200 dark:border-zinc-800 text-lg rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-600"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 py-8">
                    {/* Category Tabs */}
                    <Tabs value={activeCategory} onValueChange={setActiveCategory} className="mb-8">
                        <TabsList className="h-auto p-1 bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl flex flex-wrap gap-1">
                            {CATEGORIES.map(cat => (
                                <TabsTrigger
                                    key={cat.id}
                                    value={cat.id}
                                    className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 dark:text-zinc-400 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm flex items-center gap-2 transition-all hover:text-gray-900 dark:hover:text-zinc-200"
                                >
                                    <cat.icon className="w-4 h-4 opacity-70" />
                                    <span className="hidden sm:inline">{cat.label}</span>
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>

                    {/* Apps Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPlugins.map(plugin => {
                            const IconComponent = getIconComponent(plugin.icon);
                            const installedPlugin = installedPlugins.find(p => p.plugin_id._id === plugin._id);
                            const isInstalled = !!installedPlugin;
                            const isLoading = installing === plugin._id;

                            return (
                                <Card
                                    key={plugin._id}
                                    className={`group relative overflow-hidden border transition-all duration-300 hover:shadow-lg bg-white dark:bg-zinc-900/50 backdrop-blur-sm ${isInstalled
                                        ? "border-green-200 dark:border-green-900/50 bg-green-50 dark:bg-green-950/10"
                                        : "border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700"
                                        }`}
                                >
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className={`p-3 rounded-2xl ${isInstalled ? 'bg-green-100 dark:bg-green-500/20' : 'bg-gray-100 dark:bg-zinc-800'} transition-colors group-hover:scale-110 duration-300`}>
                                                <IconComponent className={`w-6 h-6 ${isInstalled ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-zinc-400'}`} />
                                            </div>
                                            {isInstalled && (
                                                <Badge variant="secondary" className="bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 flex items-center gap-1 font-medium border-green-200 dark:border-green-500/20">
                                                    <Check className="w-3 h-3" />
                                                    {t('marketplace.installedBadge')}
                                                </Badge>
                                            )}
                                        </div>

                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                            {plugin.name}
                                        </h3>
                                        <p className="text-gray-500 dark:text-zinc-400 text-sm mb-6 line-clamp-2 h-10 leading-relaxed">
                                            {plugin.description}
                                        </p>

                                        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-zinc-800/50">
                                            <Button
                                                onClick={() => isInstalled ? handleUninstall(plugin._id) : handleInstall(plugin._id)}
                                                variant={isInstalled ? "outline" : "default"}
                                                className={`w-full ${isInstalled
                                                    ? "border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700 dark:hover:text-red-300 hover:border-red-300 dark:hover:border-red-800"
                                                    : "bg-gray-900 text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-zinc-200"
                                                    }`}
                                                disabled={isLoading}
                                            >
                                                {isLoading ? (
                                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                                ) : isInstalled ? (
                                                    <span className="flex items-center gap-2">
                                                        <Trash2 className="w-4 h-4" /> {t('marketplace.uninstall')}
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-2">
                                                        <Download className="w-4 h-4" /> {t('marketplace.install')}
                                                    </span>
                                                )}
                                            </Button>

                                            {isInstalled && plugin.config_schema && (
                                                <Button
                                                    onClick={() => handleConfigure(plugin, installedPlugin.config)}
                                                    variant="ghost"
                                                    size="icon"
                                                    className="ml-2 text-gray-400 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800"
                                                    title="Configure"
                                                >
                                                    <Settings className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {/* Empty State */}
                    {filteredPlugins.length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                            <Search className="w-12 h-12 text-gray-300 dark:text-zinc-700 mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-zinc-300 mb-2">{t('marketplace.noAppsFound')}</h3>
                            <p className="text-gray-500 dark:text-zinc-500 max-w-sm">{t('marketplace.noAppsDesc')}</p>
                        </div>
                    )}
                </div>

                <PluginConfigModal
                    isOpen={configModalOpen}
                    onClose={() => setConfigModalOpen(false)}
                    plugin={selectedPlugin}
                    currentConfig={selectedConfig}
                    onSave={saveConfig}
                />
            </div>
        </LinktreeLayout>
    );
};

export default Marketplace;
