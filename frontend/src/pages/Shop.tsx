import LinktreeLayout from "@/layouts/LinktreeLayout";
import { templates } from "@/data/templates";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings, Share, Plus, EyeOff, Eye, ExternalLink, Instagram, Globe, Search, GripVertical, Heart, MessageCircle, Smartphone } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, Trash2, MessageSquare, Check, X, Clock, CreditCard } from "lucide-react";
import { getIconForThumbnail } from "@/utils/socialIcons";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ImageUpload } from "@/components/ImageUpload";
import { ChevronRight } from "lucide-react";
import { FileUpload } from "@/components/FileUpload";
import ConnectWithSupplierModal from "@/components/ConnectWithSupplierModal";
import { useTranslation } from "react-i18next";
import { SocialLinksDialog } from "@/components/SocialLinksDialog";
import { Copy, Sparkles } from "lucide-react";
import { ProductPluginSuggestions } from "@/components/shop/ProductPluginSuggestions";
import { PluginConfigModal } from "@/components/marketplace/PluginConfigModal";
import { supabase } from "@/lib/supabase";

interface Product {
    _id: string;
    title: string;
    description?: string;
    price: number;
    image_url?: string;
    file_url?: string; // Used for "Product URL"
    type: 'digital_product' | 'physical_product' | 'physical_service' | 'digital_service';
    product_type?: 'digital_product' | 'physical_product' | 'physical_service' | 'digital_service';
    is_active: boolean;
}

interface Order {
    _id: string;
    buyer_name: string;
    buyer_email: string;
    buyer_phone: string;
    amount: number;
    status: 'pending' | 'paid' | 'completed' | 'failed';
    type: 'product_sale' | 'enquiry';
    transaction_details?: string;
    product_id: string;
    product_name?: string; // Snapshot
    created_at: string;
    invoice_id?: string;
    payment_id?: string;
    paid_at?: string;
}

interface Plugin {
    _id: string;
    name: string;
    slug: string;
    description: string;
    icon: string;
    category: string;
    type: string;
    is_premium: boolean;
    config_schema?: any[];
}

interface UserPlugin {
    _id: string;
    plugin_id: Plugin;
    config: Record<string, any>;
}

const Shop = () => {
    const { user, links: authLinks, isLoading, selectedTheme } = useAuth();
    const { t } = useTranslation();
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [previewTab, setPreviewTab] = useState<'links' | 'shop'>('shop');
    const [connectModal, setConnectModal] = useState<{ open: boolean; product: any; seller: any }>({ open: false, product: null, seller: null });
    const [showPreview, setShowPreview] = useState(false);

    // Marketplace / Plugin State
    const [plugins, setPlugins] = useState<Plugin[]>([]);
    const [installedPlugins, setInstalledPlugins] = useState<UserPlugin[]>([]);
    const [installingPluginId, setInstallingPluginId] = useState<string | null>(null);
    const [configModalOpen, setConfigModalOpen] = useState(false);
    const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null);
    const [selectedConfig, setSelectedConfig] = useState<Record<string, any>>({});

    // New Product State
    const [newProduct, setNewProduct] = useState({
        title: "",
        price: "",
        description: "",
        type: "physical_product",
        image_url: "",
        file_url: ""
    });

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

    useEffect(() => {
        fetchProducts();
        fetchPlugins();
        fetchInstalledPlugins();
    }, []);

    const fetchProducts = async () => {
        const token = localStorage.getItem('auth_token');
        if (!token) return;

        try {
            const res = await fetch(`${API_URL}/products`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setProducts(data);
            }
        } catch (error) {
            console.error("Failed to fetch products", error);
        } finally {
            setLoadingProducts(false);
        }
    };

    const fetchPlugins = async () => {
        try {
            const response = await fetch(`${API_URL}/marketplace/plugins`);
            if (response.ok) {
                const data = await response.json();
                setPlugins(data);
            }
        } catch (error) {
            console.error('Error fetching plugins:', error);
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
                const data = await response.json();
                setInstalledPlugins(data);
            }
        } catch (error) {
            console.error('Error fetching installed plugins:', error);
        }
    };

    const handlePluginInstall = async (pluginId: string) => {
        setInstallingPluginId(pluginId);
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
                toast.success('App connected!');

                // Open config modal immediately
                if (newUserPlugin.plugin_id.config_schema && newUserPlugin.plugin_id.config_schema.length > 0) {
                    handleConfigurePlugin(newUserPlugin.plugin_id, {});
                }
            } else {
                const error = await response.json();
                toast.error(error.error || 'Failed to install app');
            }
        } catch (error) {
            console.error('Error installing plugin:', error);
            toast.error('Failed to install app');
        } finally {
            setInstallingPluginId(null);
        }
    };

    const handleConfigurePlugin = (plugin: Plugin, config: Record<string, any>) => {
        setSelectedPlugin(plugin);
        setSelectedConfig(config || {});
        setConfigModalOpen(true);
    };

    const savePluginConfig = async (config: Record<string, any>) => {
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


    const fetchOrders = async () => {
        const token = localStorage.getItem('auth_token');
        if (!token) return;
        setLoadingOrders(true);

        try {
            const res = await fetch(`${API_URL}/orders`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setOrders(data.orders || []);
            }
        } catch (error) {
            console.error("Failed to fetch orders", error);
        } finally {
            setLoadingOrders(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        // Auto-refresh orders every 10 seconds for real-time feel
        const interval = setInterval(fetchOrders, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleUpdateStatus = async (orderId: string, status: string) => {
        const token = localStorage.getItem('auth_token');
        if (!token) return;

        try {
            const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });

            if (res.ok) {
                setOrders(orders.map(o => o._id === orderId ? { ...o, status: status as any } : o));
                toast.success(`Order marked as ${status}`);
            } else {
                toast.error("Failed to update status");
            }
        } catch (error) {
            toast.error("Error updating status");
        }
    };

    const handleCreateProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const token = localStorage.getItem('auth_token');

        try {
            const res = await fetch(`${API_URL}/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...newProduct,
                    price: parseFloat(newProduct.price),
                    product_type: newProduct.type
                })
            });

            if (!res.ok) throw new Error("Failed to create product");

            const data = await res.json();
            setProducts([data.product, ...products]);
            setIsAddOpen(false);
            setNewProduct({ title: "", price: "", description: "", type: "physical", image_url: "", file_url: "" });
            toast.success("Product created successfully");
        } catch (error) {
            toast.error("Error creating product");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteProduct = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        const token = localStorage.getItem('auth_token');

        try {
            await fetch(`${API_URL}/products/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setProducts(products.filter(p => p._id !== id));
            toast.success("Product deleted");
        } catch (error) {
            toast.error("Failed to delete");
        }
    };


    if (isLoading) {
        return <div className="h-screen w-full flex items-center justify-center bg-gray-50">
            <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full"></div>
        </div>;
    }

    const username = user?.username || "user";
    const userInitial = (user?.name || "U")[0]?.toUpperCase();

    const currentTemplate = templates.find(t => t.id === selectedTheme) || templates[0];
    const bgStyle = currentTemplate.bgImage
        ? { backgroundImage: `url(${currentTemplate.bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
        : {};

    const filteredProducts = products.filter(p =>
        p && p.title && p.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const installedPluginIds = installedPlugins.map(p => p.plugin_id._id);

    return (
        <LinktreeLayout>
            <div className="relative h-full">
                {/* Center Column: Editor */}
                <div className="max-w-6xl mx-auto py-10 px-4 md:px-8">

                    {/* Header */}
                    <div className="flex flex-col gap-4 mb-6">
                        {/* Title Row */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold text-white">Offerings</h1>
                                <p className="text-neutral-400 text-xs sm:text-sm mt-1 hidden sm:block">Manage your offerings • Add products or services to see them here</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="hidden sm:flex items-center gap-3">
                                    <SocialLinksDialog
                                        initialLinks={user?.social_links || {}}
                                        onSave={async () => { }}
                                        onLinksChange={() => { }}
                                        onOpenChange={() => { }}
                                    >
                                        <Button variant="outline" className="rounded-full gap-2 h-9 px-4 text-sm font-medium border-purple-500/30 text-purple-400 hover:bg-purple-900/30 bg-transparent">
                                            <Instagram className="w-4 h-4" /> {t('dashboard.socials')}
                                        </Button>
                                    </SocialLinksDialog>
                                    <Button variant="outline" className="rounded-full gap-2 h-9 px-4 text-sm font-medium border-purple-500/30 text-purple-400 hover:bg-purple-900/30 bg-transparent">
                                        <Sparkles className="w-4 h-4" /> {t('dashboard.enhance')}
                                    </Button>
                                </div>

                                {/* Profile Link - Mobile responsive */}
                                <div className="relative group w-full sm:w-auto">
                                    <div
                                        onClick={() => window.open(user?.active_profile_mode === 'store' ? `/s/${username}` : `/${username}`, '_blank')}
                                        className="bg-neutral-900 hover:bg-neutral-800 transition-colors rounded-full px-3 sm:px-4 py-2 text-xs sm:text-sm text-neutral-400 pr-10 border border-neutral-800 cursor-pointer truncate"
                                    >
                                        tap2.me/{user?.active_profile_mode === 'store' ? `s/${username}` : username}
                                    </div>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 sm:h-7 sm:w-7 rounded-full hover:bg-neutral-800 text-white"
                                        onClick={() => {
                                            const profilePath = user?.active_profile_mode === 'store' ? `/s/${username}` : `/${username}`;
                                            const url = `${window.location.origin}${profilePath}`;
                                            navigator.clipboard.writeText(url);
                                            toast.success("Profile link copied!");
                                        }}
                                    >
                                        <Copy className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Add Button & Clear All */}
                    <div className="flex gap-2 sm:gap-4 mb-6 sm:mb-8">
                        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    className="flex-1 bg-white hover:bg-neutral-200 text-black rounded-xl sm:rounded-2xl h-11 sm:h-14 text-sm sm:text-base font-semibold shadow-lg shadow-white/5 transition-all hover:scale-[1.01] active:scale-[0.99] gap-1.5 sm:gap-2 border-none"
                                >
                                    <Plus className="w-4 h-4 sm:w-5 sm:h-5" /> Add Content
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto bg-neutral-900 border-neutral-800 text-white">
                                <DialogHeader>
                                    <DialogTitle className="text-white">{t('shop.addNewProduct')}</DialogTitle>
                                    <DialogDescription className="text-neutral-400">
                                        {t('shop.addProductDesc')}
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleCreateProduct} className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="title" className="text-neutral-300">{t('shop.productName')}</Label>
                                        <Input
                                            id="title"
                                            value={newProduct.title}
                                            onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                                            required
                                            className="bg-neutral-800 border-neutral-700 text-white focus:ring-neutral-600 focus:border-neutral-500"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="price" className="text-neutral-300">{t('shop.price')}</Label>
                                            <Input
                                                id="price"
                                                type="number"
                                                step="0.01"
                                                value={newProduct.price}
                                                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                                                required
                                                className="bg-neutral-800 border-neutral-700 text-white focus:ring-neutral-600 focus:border-neutral-500"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="type" className="text-neutral-300">{t('shop.type')}</Label>
                                            <Select
                                                value={newProduct.type}
                                                onValueChange={(val: any) => setNewProduct({ ...newProduct, type: val })}
                                            >
                                                <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white focus:ring-neutral-600">
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
                                                    <SelectItem value="digital_product">Digital Product</SelectItem>
                                                    <SelectItem value="physical_product">Physical Product</SelectItem>
                                                    <SelectItem value="physical_service">Physical Service</SelectItem>
                                                    <SelectItem value="digital_service">Digital Service</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="desc" className="text-neutral-300">Description</Label>
                                        <Textarea
                                            id="desc"
                                            value={newProduct.description}
                                            onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                                            className="bg-neutral-800 border-neutral-700 text-white focus:ring-neutral-600 focus:border-neutral-500"
                                        />
                                    </div>
                                    {newProduct.type === 'digital_product' && (
                                        <div className="grid gap-2">
                                            <Label htmlFor="url" className="text-neutral-300">Product File (Max 15MB)</Label>
                                            <FileUpload
                                                value={newProduct.file_url}
                                                onChange={(url) => setNewProduct({ ...newProduct, file_url: url })}
                                                label="Upload Digital Product"
                                                maxSizeMB={15}
                                                type="product_file"
                                            />
                                            <div className="text-xs text-neutral-500 text-center mt-1">- OR -</div>
                                            <Input
                                                id="url"
                                                placeholder="Or enter external download URL..."
                                                value={newProduct.file_url}
                                                onChange={(e) => setNewProduct({ ...newProduct, file_url: e.target.value })}
                                                className="bg-neutral-800 border-neutral-700 text-white focus:ring-neutral-600 focus:border-neutral-500 mt-1"
                                            />
                                        </div>
                                    )}
                                    <div className="grid gap-2">
                                        <Label className="text-neutral-300">Product Image</Label>
                                        <ImageUpload
                                            value={newProduct.image_url}
                                            onChange={(url) => setNewProduct({ ...newProduct, image_url: url })}
                                        />
                                    </div>

                                    {/* Plugin Suggestions */}
                                    <ProductPluginSuggestions
                                        plugins={plugins}
                                        installedPluginIds={installedPluginIds}
                                        onInstall={handlePluginInstall}
                                        onConfigure={(plugin) => {
                                            const installed = installedPlugins.find(p => p.plugin_id._id === plugin._id);
                                            handleConfigurePlugin(plugin, installed?.config || {});
                                        }}
                                        installingId={installingPluginId}
                                    />

                                    <DialogFooter>
                                        <Button type="submit" disabled={isSubmitting} className="bg-white text-black hover:bg-neutral-200">
                                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Save Product
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                        <Button
                            variant="outline"
                            className="h-11 sm:h-14 px-3 sm:px-6 rounded-xl sm:rounded-2xl border-red-900/50 text-red-400 hover:bg-red-950/30 hover:text-red-300 font-medium bg-transparent"
                            onClick={() => toast.info("Clear All functionality to be implemented")}
                        >
                            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span className="hidden sm:inline ml-2">{t('dashboard.clearAll')}</span>
                        </Button>
                    </div>

                    {/* Products List (Directly rendered, no tabs) */}
                    <div className="space-y-4">
                        {loadingProducts ? (
                            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-neutral-500" /></div>
                        ) : filteredProducts.length > 0 ? (
                            <div className="space-y-3">
                                {filteredProducts.map((product) => (
                                    <div key={product._id} className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 shadow-sm flex items-center justify-between group hover:border-purple-500/30 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="text-neutral-600 cursor-move opacity-0 group-hover:opacity-100 transition-opacity">
                                                <GripVertical className="w-5 h-5" />
                                            </div>
                                            <div className="w-16 h-16 bg-neutral-800 rounded-lg overflow-hidden flex-shrink-0 border border-neutral-700">
                                                {product.image_url ? (
                                                    <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-xl bg-neutral-800">🛍️</div>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-white">{product.title}</h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge variant="secondary" className="font-bold border-neutral-800 bg-neutral-800 text-neutral-300">₹{product.price}</Badge>
                                                    <span className="text-neutral-600">•</span>
                                                    <span className="text-xs text-neutral-500 capitalize">{product.type?.replace('_', ' ')}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" className="text-neutral-500 hover:text-red-400 hover:bg-red-950/30 rounded-full" onClick={() => handleDeleteProduct(product._id)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            /* Empty State Card */
                            <div className="bg-neutral-900 rounded-2xl border border-dashed border-neutral-800 p-10 text-center">
                                <div className="w-16 h-16 bg-neutral-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl border border-neutral-700">🛍️</div>
                                <h3 className="text-lg font-bold text-white mb-1">{t('shop.addFirstProduct')}</h3>
                                <p className="text-neutral-500 mb-6 font-medium max-w-sm mx-auto">{t('shop.sellDesc')}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Toggleable Phone Preview Trigger */}
                <div className="fixed bottom-6 right-6 z-40">
                    <Button
                        onClick={() => setShowPreview(true)}
                        className="rounded-full w-14 h-14 bg-white text-black hover:bg-neutral-200 shadow-2xl flex items-center justify-center"
                    >
                        <Smartphone className="w-6 h-6" />
                    </Button>
                </div>

                {/* Phone Preview Sheet (Slide from skin) */}
                <Sheet open={showPreview} onOpenChange={setShowPreview}>
                    <SheetContent side="right" className="w-full sm:w-[480px] p-0 border-l border-neutral-800 bg-neutral-950 flex items-center justify-center">
                        <div className="relative w-full h-full flex items-center justify-center p-4">
                            {/* Phone Frame */}
                            <div className="w-[300px] h-[620px] bg-black rounded-[3rem] border-8 border-neutral-800 shadow-2xl overflow-hidden relative transition-all duration-300 scale-95 sm:scale-100">
                                {/* Notch */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-b-2xl z-20" />

                                {/* Status Bar */}
                                <div className="h-8 w-full bg-black flex items-center justify-between px-8 text-[10px] text-white font-medium pt-1 z-30 relative">
                                    <span>9:41</span>
                                    <div className="flex gap-1.5 items-center">
                                        <div className="flex gap-0.5">
                                            <div className="w-1 h-1 bg-white rounded-full" />
                                            <div className="w-1 h-1 bg-white rounded-full" />
                                            <div className="w-1 h-1.5 bg-white rounded-full" />
                                            <div className="w-1 h-2 bg-white rounded-full" />
                                        </div>
                                    </div>
                                </div>

                                {/* Screen Content */}
                                <div
                                    className={`h-full w-full overflow-y-auto ${currentTemplate.bgClass || 'bg-gray-100'} ${currentTemplate.textColor} transition-colors duration-300`}
                                    style={bgStyle}
                                >
                                    {/* Overlay/Backdrop */}
                                    {currentTemplate.bgImage && <div className="absolute inset-0 bg-black/20 pointer-events-none" />}

                                    {/* Content Container */}
                                    <div className="relative z-10 pt-10 pb-20 px-4 min-h-full flex flex-col items-center">

                                        {/* Profile Header */}
                                        <div className="mb-6 flex flex-col items-center">
                                            <Avatar className="w-20 h-20 border-2 border-white shadow-lg mb-3">
                                                <AvatarImage src={user?.avatar} />
                                                <AvatarFallback className="bg-neutral-700 text-white text-xl font-bold">
                                                    {userInitial}
                                                </AvatarFallback>
                                            </Avatar>
                                            <h2 className="text-lg font-bold tracking-tight mb-0.5">@{username}</h2>

                                            {/* Preview Tabs (Links | Shop) */}
                                            <div className="mt-4 flex bg-black/30 backdrop-blur-sm p-1 rounded-full border border-white/10">
                                                <button
                                                    onClick={() => setPreviewTab('links')}
                                                    className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${previewTab === 'links' ? 'bg-white text-black shadow-sm' : 'text-white opacity-70 hover:opacity-100'}`}
                                                >
                                                    {t('shop.links')}
                                                </button>
                                                <button
                                                    onClick={() => setPreviewTab('shop')}
                                                    className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${previewTab === 'shop' ? 'bg-white text-black shadow-sm' : 'text-white opacity-70 hover:opacity-100'}`}
                                                >
                                                    {t('shop.title')}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Links View */}
                                        {previewTab === 'links' && (
                                            <div className="w-full space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                                {/* Socials */}
                                                <div className="flex gap-3 flex-wrap justify-center mb-4">
                                                    {user?.social_links && Object.entries(user.social_links).map(([platform, url]) => {
                                                        if (!url) return null;
                                                        const Icon = getIconForThumbnail(platform);
                                                        return Icon ? (
                                                            <a key={platform} href="#" className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-current hover:scale-110 transition-transform">
                                                                <Icon className="w-4 h-4" />
                                                            </a>
                                                        ) : null;
                                                    })}
                                                </div>

                                                {/* Links */}
                                                {authLinks.filter(l => l.isActive).map((link) => {
                                                    const Icon = link.thumbnail ? getIconForThumbnail(link.thumbnail) : null;
                                                    return (
                                                        <a
                                                            key={link.id}
                                                            href="#"
                                                            className={`block w-full flex items-center justify-center relative p-3.5 rounded-full transition-transform hover:scale-[1.02] active:scale-[0.98] ${currentTemplate.buttonStyle}`}
                                                        >
                                                            {Icon && <Icon className="absolute left-4 w-4 h-4 opacity-80" />}
                                                            <span className="text-sm font-medium truncate max-w-[200px]">{link.title}</span>
                                                        </a>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {/* Shop View */}
                                        {previewTab === 'shop' && (
                                            <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                                {/* Product Grid */}
                                                {products.filter(p => p && p._id).length > 0 ? (
                                                    <div className="grid gap-3">
                                                        {products.filter(p => p && p._id).map((product, index) => (
                                                            <div
                                                                key={product._id || `product-${index}`}
                                                                className="relative aspect-square w-full rounded-2xl overflow-hidden group shadow-md"
                                                            >
                                                                {/* Background Image */}
                                                                {product.image_url ? (
                                                                    <img src={product.image_url} alt={product.title} className="absolute inset-0 w-full h-full object-cover" />
                                                                ) : (
                                                                    <div className="absolute inset-0 bg-neutral-900 w-full h-full flex items-center justify-center">
                                                                        <div className="text-4xl opacity-20">✨</div>
                                                                    </div>
                                                                )}

                                                                {/* Overlay */}
                                                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                                                                {/* Bottom Content */}
                                                                <div className="absolute bottom-0 left-0 right-0 p-3 z-20 text-white">
                                                                    <div className="inline-flex items-center gap-1 bg-white/10 backdrop-blur-md px-2 py-0.5 rounded-full text-[8px] font-medium mb-2 border border-white/10">
                                                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                                                        <span>{user?.name || "User"}</span>
                                                                    </div>
                                                                    <h3 className="text-sm font-bold leading-tight mb-1 text-white">{product.title}</h3>
                                                                    <p className="text-[10px] text-gray-300 line-clamp-1 mb-2 font-light">{product.description}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-10 opacity-60">
                                                        <p className="text-sm font-medium">No products yet</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                    </div>

                                    {/* Footer - Connect Button */}
                                    <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center gap-2 px-6 z-30">
                                        <button
                                            onClick={() => setConnectModal({
                                                open: true,
                                                product: null,
                                                seller: { id: user?.id || '', name: user?.name || '' }
                                            })}
                                            className="w-full bg-white text-black h-12 rounded-full font-bold text-sm flex items-center justify-between px-5 shadow-xl hover:shadow-2xl transition-shadow border border-gray-100"
                                        >
                                            <span>Message {user?.name?.split(' ')[0] || 'User'}</span>
                                            <MessageCircle className="w-5 h-5 text-gray-600" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Preview Label */}
                            <div className="text-center mt-6">
                                <div className="flex items-center justify-center gap-2 text-sm font-medium text-gray-600">
                                    <Share className="w-4 h-4" /> {t('shop.livePreview')}
                                </div>
                                <p className="text-xs text-gray-400 mt-1">{t('shop.previewDesc')}</p>
                            </div>
                        </div>

                    </SheetContent>
                </Sheet>

                <ConnectWithSupplierModal
                    open={connectModal.open}
                    onOpenChange={(open) => setConnectModal(prev => ({ ...prev, open }))}
                    product={connectModal.product}
                    seller={connectModal.seller}
                    onSuccess={(newUser) => {
                        toast.success(`Welcome, ${newUser.full_name}! You are now connected.`);
                    }}
                />

                <PluginConfigModal
                    isOpen={configModalOpen}
                    onClose={() => setConfigModalOpen(false)}
                    plugin={selectedPlugin}
                    currentConfig={selectedConfig}
                    onSave={savePluginConfig}
                />
            </div>
        </LinktreeLayout >
    );
};

export default Shop;
