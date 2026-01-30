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
    CreditCard
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

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

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
                <div className="flex items-center justify-center h-[60vh]">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                </div>
            </LinktreeLayout>
        );
    }

    return (
        <LinktreeLayout>
            <div className="py-8 px-6 md:px-10 max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">App Marketplace</h1>
                    </div>
                    <p className="text-gray-500 ml-13">Discover and install apps to enhance your profile</p>
                </div>

                {/* Search */}
                <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                        placeholder="Search apps..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-12 h-12 rounded-xl border-gray-200 focus:border-purple-300 focus:ring-purple-200"
                    />
                </div>

                {/* Category Tabs */}
                <Tabs value={activeCategory} onValueChange={setActiveCategory} className="mb-8">
                    <TabsList className="h-auto p-1 bg-gray-100/80 rounded-xl flex flex-wrap gap-1">
                        {CATEGORIES.map(cat => (
                            <TabsTrigger
                                key={cat.id}
                                value={cat.id}
                                className="rounded-lg px-4 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2"
                            >
                                <cat.icon className="w-4 h-4" />
                                <span className="hidden sm:inline">{cat.label}</span>
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>

                {/* Apps Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredPlugins.map(plugin => {
                        const IconComponent = getIconComponent(plugin.icon);
                        const installedPlugin = installedPlugins.find(p => p.plugin_id._id === plugin._id);
                        const isInstalled = !!installedPlugin;
                        const isLoading = installing === plugin._id;
                        const hasConfig = plugin.config_schema && plugin.config_schema.length > 0;

                        return (
                            <Card
                                key={plugin._id}
                                className="group hover:shadow-lg transition-all duration-200 border-gray-100 hover:border-purple-200 overflow-hidden"
                            >
                                <CardContent className="p-5">
                                    <div className="flex items-start gap-4">
                                        {/* Icon */}
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center flex-shrink-0 group-hover:from-purple-100 group-hover:to-indigo-50 transition-colors">
                                            <IconComponent className="w-6 h-6 text-gray-600 group-hover:text-purple-600 transition-colors" />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold text-gray-900 truncate">{plugin.name}</h3>
                                                {plugin.is_premium && (
                                                    <Badge variant="secondary" className="bg-amber-100 text-amber-700 gap-1 flex-shrink-0">
                                                        <Crown className="w-3 h-3" /> Pro
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500 line-clamp-2 mb-3">{plugin.description}</p>
                                            <div className="flex items-center justify-between gap-2">
                                                <Badge variant="outline" className="text-xs text-gray-500">
                                                    {plugin.category}
                                                </Badge>

                                                <div className="flex gap-2">
                                                    {isInstalled && hasConfig && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleConfigure(plugin, installedPlugin.config)}
                                                            className="rounded-full h-8 px-2"
                                                        >
                                                            <Settings className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        size="sm"
                                                        variant={isInstalled ? "outline" : "default"}
                                                        onClick={() => isInstalled ? handleUninstall(plugin._id) : handleInstall(plugin._id)}
                                                        disabled={isLoading}
                                                        className={`rounded-full h-8 px-4 ${isInstalled ? 'text-green-600 border-green-200 hover:bg-green-50' : 'bg-purple-600 hover:bg-purple-700'}`}
                                                    >
                                                        {isLoading ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : isInstalled ? (
                                                            <>
                                                                <Check className="w-4 h-4 mr-1" />
                                                                Installed
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Plus className="w-4 h-4 mr-1" />
                                                                Install
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Empty State */}
                {filteredPlugins.length === 0 && (
                    <div className="text-center py-16">
                        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">No apps found</h3>
                        <p className="text-gray-500">Try adjusting your search or filter</p>
                    </div>
                )}

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
