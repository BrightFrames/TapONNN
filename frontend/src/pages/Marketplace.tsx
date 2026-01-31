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
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-card to-muted border border-border flex items-center justify-center shadow-lg shadow-black/20">
                            <Sparkles className="w-5 h-5 text-foreground" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">App Marketplace</h1>
                    </div>
                    <p className="text-muted-foreground ml-13">Discover and install apps to enhance your profile</p>
                </div>

                {/* Search */}
                <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                        placeholder="Search apps..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-12 h-12 rounded-xl bg-card/50 border-border focus:border-ring focus:ring-ring placeholder:text-muted-foreground text-foreground"
                    />
                </div>

                {/* Category Tabs */}
                <Tabs value={activeCategory} onValueChange={setActiveCategory} className="mb-8">
                    <TabsList className="h-auto p-1 bg-card border border-border rounded-xl flex flex-wrap gap-1">
                        {CATEGORIES.map(cat => (
                            <TabsTrigger
                                key={cat.id}
                                value={cat.id}
                                className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground data-[state=active]:bg-muted data-[state=active]:text-foreground data-[state=active]:shadow-sm flex items-center gap-2 transition-all hover:text-foreground"
                            >
                                <cat.icon className="w-4 h-4 opacity-70" />
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

                        // 21st.dev inspired card design
                        return (
                            <div
                                key={plugin._id}
                                className="group relative flex flex-col gap-3 rounded-[2rem] overflow-hidden transition-all duration-300 hover:z-10"
                            >
                                {/* Card Body */}
                                <div className="aspect-[16/10] w-full bg-card rounded-[2rem] border border-border/40 relative overflow-hidden group-hover:border-border/80 transition-colors">
                                    {/* Background Gradient/Mesh */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent" />

                                    {/* Inner Glow on Hover */}
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-tr from-primary/5 via-transparent to-transparent pointer-events-none" />

                                    {/* Header: Icon + Title */}
                                    <div className="absolute top-5 left-5 right-5 flex items-start justify-between z-10">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-background border border-border/50 flex items-center justify-center shadow-lg">
                                                <IconComponent className="w-4 h-4 text-foreground/80" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-foreground tracking-tight leading-none">{plugin.name}</span>
                                                <span className="text-[10px] text-muted-foreground mt-1">{plugin.category} • Default</span>
                                            </div>
                                        </div>

                                        {plugin.is_premium && (
                                            <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[10px] px-2 h-5">PRO</Badge>
                                        )}
                                    </div>

                                    {/* Center Content / Preview Visualization */}
                                    <div className="absolute inset-0 flex items-center justify-center p-8 mt-8">
                                        <div className="text-center">
                                            <h3 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/40 tracking-tighter leading-tight select-none">
                                                {plugin.name}
                                            </h3>
                                            <p className="text-xs text-muted-foreground/60 mt-2 line-clamp-1 max-w-[200px] mx-auto">
                                                {plugin.description}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Bottom Status Status */}
                                    {isInstalled && (
                                        <div className="absolute bottom-5 right-5 z-10">
                                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                                <span className="text-[10px] font-medium text-primary">Active</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Hover Overlay & Actions */}
                                    <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3 z-20">
                                        <Button
                                            onClick={() => isInstalled ? handleUninstall(plugin._id) : handleInstall(plugin._id)}
                                            disabled={isLoading}
                                            variant={isInstalled ? "destructive" : "default"}
                                            className={`rounded-full px-6 font-medium shadow-2xl scale-95 group-hover:scale-100 transition-transform duration-200 ${isInstalled ? '' : 'bg-foreground text-background hover:bg-foreground/90'}`}
                                        >
                                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : isInstalled ? "Uninstall" : "Install"}
                                        </Button>

                                        {isInstalled && plugin.config_schema && (
                                            <Button
                                                onClick={() => handleConfigure(plugin, installedPlugin.config)}
                                                variant="outline"
                                                size="icon"
                                                className="rounded-full w-10 h-10 bg-background border-border"
                                            >
                                                <Settings className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Empty State */}
                {filteredPlugins.length === 0 && (
                    <div className="text-center py-24">
                        <div className="w-16 h-16 bg-neutral-900 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-neutral-800">
                            <Search className="w-8 h-8 text-neutral-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">No apps found</h3>
                        <p className="text-neutral-500">Try adjusting your search or filter</p>
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
