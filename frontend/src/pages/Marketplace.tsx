import { useState, useEffect } from "react";
import { toast } from "sonner";
import LinktreeLayout from "@/layouts/LinktreeLayout";
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
    TrendingUp
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
    const [activeTab, setActiveTab] = useState("plugins");

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
                toast.success('Plugin installed successfully!');

                // Open config modal if plugin has configuration
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
    }

    const filteredPlugins = plugins.filter(plugin => {
        const matchesSearch = plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            plugin.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    const filteredInstalledPlugins = installedPlugins.filter(up => {
        const matchesSearch = up.plugin_id.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            up.plugin_id.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
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
            <div className="min-h-screen bg-gray-50 dark:bg-black font-sans text-gray-900 dark:text-zinc-100">
                {/* Hero Section */}
                <div className="relative border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-transparent to-purple-50/50 dark:from-indigo-950/20 dark:via-transparent dark:to-purple-950/20" />
                    <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
                        <div className="max-w-3xl">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-indigo-100 dark:bg-indigo-500/20 rounded-2xl">
                                    <Zap className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                                    Marketplace
                                </h1>
                            </div>
                            <p className="text-lg text-gray-600 dark:text-zinc-400 mb-6 max-w-2xl leading-relaxed">
                                Extend your platform with powerful integrations and track your connected apps in real-time
                            </p>

                            {/* Search Bar */}
                            <div className="relative max-w-xl group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-zinc-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors" />
                                <Input
                                    type="text"
                                    placeholder="Search plugins and apps..."
                                    className="pl-12 pr-4 h-12 bg-white dark:bg-zinc-900/80 border-gray-200 dark:border-zinc-800 text-base rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-600"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 py-8">
                    {/* Main Tabs */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="h-auto p-1.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl mb-8 inline-flex">
                            <TabsTrigger
                                value="plugins"
                                className="rounded-lg px-6 py-3 text-sm font-semibold text-gray-600 dark:text-zinc-400 data-[state=active]:bg-indigo-50 dark:data-[state=active]:bg-indigo-500/10 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 data-[state=active]:shadow-sm flex items-center gap-2 transition-all"
                            >
                                <Plug className="w-4 h-4" />
                                Add Plugins
                            </TabsTrigger>
                            <TabsTrigger
                                value="apps"
                                className="rounded-lg px-6 py-3 text-sm font-semibold text-gray-600 dark:text-zinc-400 data-[state=active]:bg-green-50 dark:data-[state=active]:bg-green-500/10 data-[state=active]:text-green-600 dark:data-[state=active]:text-green-400 data-[state=active]:shadow-sm flex items-center gap-2 transition-all"
                            >
                                <Activity className="w-4 h-4" />
                                Connect Apps
                                {installedPlugins.length > 0 && (
                                    <Badge className="ml-1 bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/20">
                                        {installedPlugins.length}
                                    </Badge>
                                )}
                            </TabsTrigger>
                        </TabsList>

                        {/* Add Plugins Tab */}
                        <TabsContent value="plugins" className="mt-0">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredPlugins.map(plugin => {
                                    const IconComponent = getIconComponent(plugin.icon);
                                    const installedPlugin = installedPlugins.find(p => p.plugin_id._id === plugin._id);
                                    const isInstalled = !!installedPlugin;
                                    const isLoading = installing === plugin._id;

                                    return (
                                        <Card
                                            key={plugin._id}
                                            className="group relative overflow-hidden border transition-all duration-300 hover:shadow-xl bg-white dark:bg-zinc-900/50 backdrop-blur-sm border-gray-200 dark:border-zinc-800 hover:border-indigo-200 dark:hover:border-indigo-800/50"
                                        >
                                            <CardContent className="p-6">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="relative">
                                                        <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-500/10 dark:to-purple-500/10 transition-all group-hover:scale-110 duration-300 shadow-sm">
                                                            <IconComponent className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                                                        </div>
                                                        {isInstalled && (
                                                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                                                                <Check className="w-3 h-3 text-white" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    {plugin.is_premium && (
                                                        <Badge className="bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20">
                                                            Premium
                                                        </Badge>
                                                    )}
                                                </div>

                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                    {plugin.name}
                                                </h3>
                                                <p className="text-gray-500 dark:text-zinc-400 text-sm mb-4 line-clamp-2 h-10 leading-relaxed">
                                                    {plugin.description}
                                                </p>

                                                <div className="flex items-center gap-2 mb-4 text-xs text-gray-500 dark:text-zinc-500">
                                                    <TrendingUp className="w-3.5 h-3.5" />
                                                    <span>{plugin.install_count || 0} installs</span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        onClick={() => isInstalled ? handleUninstall(plugin._id) : handleInstall(plugin._id)}
                                                        className={`flex-1 ${isInstalled
                                                            ? "bg-white dark:bg-zinc-800 text-gray-900 dark:text-white border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700"
                                                            : "bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                                                            }`}
                                                        disabled={isLoading}
                                                    >
                                                        {isLoading ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : isInstalled ? (
                                                            <>
                                                                <Check className="w-4 h-4 mr-2" />
                                                                Installed
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Download className="w-4 h-4 mr-2" />
                                                                Install
                                                            </>
                                                        )}
                                                    </Button>

                                                    {isInstalled && plugin.config_schema && (
                                                        <Button
                                                            onClick={() => handleConfigure(plugin, installedPlugin.config)}
                                                            variant="outline"
                                                            size="icon"
                                                            className="border-gray-200 dark:border-zinc-700"
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

                            {filteredPlugins.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <Search className="w-12 h-12 text-gray-300 dark:text-zinc-700 mb-4" />
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-zinc-300 mb-2">No plugins found</h3>
                                    <p className="text-gray-500 dark:text-zinc-500 max-w-sm">Try adjusting your search query</p>
                                </div>
                            )}
                        </TabsContent>

                        {/* Connect Apps Tab */}
                        <TabsContent value="apps" className="mt-0">
                            <div className="space-y-4">
                                {filteredInstalledPlugins.map(userPlugin => {
                                    const plugin = userPlugin.plugin_id;
                                    const IconComponent = getIconComponent(plugin.icon);
                                    const isActive = userPlugin.is_active;
                                    const installedDate = new Date(userPlugin.installed_at);
                                    const isLoading = installing === plugin._id;

                                    // Simulate connection status
                                    const connectionStatus = isActive ? 'connected' : 'disconnected';
                                    const syncProgress = isActive ? 100 : 0;

                                    return (
                                        <Card
                                            key={userPlugin._id}
                                            className={`border transition-all duration-300 ${isActive
                                                ? 'border-green-200 dark:border-green-800/50 bg-gradient-to-r from-green-50/50 to-transparent dark:from-green-950/20 dark:to-transparent'
                                                : 'border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50'
                                                }`}
                                        >
                                            <CardContent className="p-6">
                                                <div className="flex items-start gap-4">
                                                    {/* Icon */}
                                                    <div className="relative flex-shrink-0">
                                                        <div className={`p-4 rounded-2xl ${isActive
                                                            ? 'bg-green-100 dark:bg-green-500/20'
                                                            : 'bg-gray-100 dark:bg-zinc-800'
                                                            } transition-all`}>
                                                            <IconComponent className={`w-8 h-8 ${isActive
                                                                ? 'text-green-600 dark:text-green-400'
                                                                : 'text-gray-400 dark:text-zinc-500'
                                                                }`} />
                                                        </div>
                                                        {/* Connection Indicator */}
                                                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-zinc-900 ${isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                                                            }`} />
                                                    </div>

                                                    {/* Content */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between mb-2">
                                                            <div>
                                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                                                                    {plugin.name}
                                                                </h3>
                                                                <p className="text-sm text-gray-500 dark:text-zinc-400 line-clamp-1">
                                                                    {plugin.description}
                                                                </p>
                                                            </div>
                                                            <Badge className={`ml-4 flex-shrink-0 ${connectionStatus === 'connected'
                                                                ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/20'
                                                                : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 border-gray-200 dark:border-zinc-700'
                                                                }`}>
                                                                {connectionStatus === 'connected' ? (
                                                                    <>
                                                                        <CheckCircle2 className="w-3 h-3 mr-1" />
                                                                        Connected
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <AlertCircle className="w-3 h-3 mr-1" />
                                                                        Disconnected
                                                                    </>
                                                                )}
                                                            </Badge>
                                                        </div>

                                                        {/* Progress Bar */}
                                                        {isActive && (
                                                            <div className="mb-3">
                                                                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-zinc-500 mb-1.5">
                                                                    <span>Data Sync</span>
                                                                    <span>{syncProgress}%</span>
                                                                </div>
                                                                <Progress value={syncProgress} className="h-1.5" />
                                                            </div>
                                                        )}

                                                        {/* Metadata */}
                                                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-zinc-500 mb-4">
                                                            <div className="flex items-center gap-1.5">
                                                                <Clock className="w-3.5 h-3.5" />
                                                                <span>Installed {installedDate.toLocaleDateString()}</span>
                                                            </div>
                                                            {isActive && (
                                                                <div className="flex items-center gap-1.5">
                                                                    <Activity className="w-3.5 h-3.5 text-green-500" />
                                                                    <span>Last synced: Just now</span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Actions */}
                                                        <div className="flex items-center gap-2">
                                                            {plugin.config_schema && (
                                                                <Button
                                                                    onClick={() => handleConfigure(plugin, userPlugin.config)}
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="border-gray-200 dark:border-zinc-700"
                                                                >
                                                                    <Settings className="w-3.5 h-3.5 mr-1.5" />
                                                                    Configure
                                                                </Button>
                                                            )}
                                                            {!isActive && (
                                                                <Button
                                                                    onClick={() => handleInstall(plugin._id)}
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/30"
                                                                    disabled={isLoading}
                                                                >
                                                                    {isLoading ? (
                                                                        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                                                                    ) : (
                                                                        <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                                                                    )}
                                                                    Reconnect
                                                                </Button>
                                                            )}
                                                            <Button
                                                                onClick={() => handleUninstall(plugin._id)}
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                                                                disabled={isLoading}
                                                            >
                                                                {isLoading ? (
                                                                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                                                                ) : (
                                                                    <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                                                                )}
                                                                Remove
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="ml-auto"
                                                            >
                                                                <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                                                                View Logs
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>

                            {filteredInstalledPlugins.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-2xl">
                                    <div className="p-4 bg-gray-100 dark:bg-zinc-900 rounded-2xl mb-4">
                                        <Activity className="w-10 h-10 text-gray-400 dark:text-zinc-600" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-zinc-300 mb-2">No connected apps</h3>
                                    <p className="text-gray-500 dark:text-zinc-500 max-w-sm mb-4">
                                        Install plugins from the "Add Plugins" tab to see them here
                                    </p>
                                    <Button
                                        onClick={() => setActiveTab('plugins')}
                                        className="bg-indigo-600 text-white hover:bg-indigo-700"
                                    >
                                        <Plug className="w-4 h-4 mr-2" />
                                        Browse Plugins
                                    </Button>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
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
