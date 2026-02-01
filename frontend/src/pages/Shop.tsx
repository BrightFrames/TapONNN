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
import { Loader2, Trash2, MessageSquare, Check, X, Clock, CreditCard, Package } from "lucide-react";
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

    const handleToggleProduct = async (id: string, currentStatus: boolean) => {
        const token = localStorage.getItem('auth_token');

        if (!token) {
            toast.error("Please log in to toggle products");
            return;
        }

        const newStatus = !currentStatus;
        console.log(`[Toggle] Product ${id}: ${currentStatus} -> ${newStatus}`);

        // Optimistic update
        setProducts(products.map(p =>
            p._id === id ? { ...p, is_active: newStatus } : p
        ));

        try {
            const res = await fetch(`${API_URL}/products/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ is_active: newStatus })
            });

            if (!res.ok) {
                // Revert on error
                setProducts(products.map(p =>
                    p._id === id ? { ...p, is_active: currentStatus } : p
                ));

                const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
                console.error('[Toggle] Error:', errorData);
                toast.error(errorData.error || "Failed to toggle product");
                return;
            }

            const updatedProduct = await res.json();
            console.log('[Toggle] Success:', updatedProduct);

            // Update with server response to ensure sync
            setProducts(products.map(p =>
                p._id === id ? { ...p, is_active: updatedProduct.is_active } : p
            ));

            toast.success(newStatus ? "Product enabled" : "Product disabled");
        } catch (error) {
            // Revert on error
            setProducts(products.map(p =>
                p._id === id ? { ...p, is_active: currentStatus } : p
            ));

            console.error('[Toggle] Network error:', error);
            toast.error("Failed to toggle product. Please check your connection.");
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
            <div className="flex h-full">
                {/* Main Editor */}
                <div className="flex-1 py-8 px-6 md:px-10">
                    <div className="max-w-2xl mx-auto">

                        {/* Header */}
                        <div className="flex flex-col gap-4 mb-6">
                            {/* Title Row */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                <div>
                                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Shop</h1>
                                    <p className="text-gray-500 text-xs sm:text-sm mt-1 hidden sm:block">Manage your products • Drag to reorder</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    {/* Profile Link */}
                                    <div className="relative group w-full sm:w-auto">
                                        <div
                                            onClick={() => {
                                                const url = `${window.location.origin}/s/${username}`;
                                                window.open(url, '_blank');
                                            }}
                                            className="bg-gray-100 hover:bg-gray-200 transition-colors rounded-full px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-600 pr-10 border border-gray-200 cursor-pointer truncate max-w-[200px]"
                                            title="Click to open store"
                                        >
                                            {/* Show localhost if on localhost, else tap2.me */}
                                            {window.location.hostname === 'localhost' ? 'localhost' : 'tap2.me'}/s/{username}
                                        </div>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 sm:h-7 sm:w-7 rounded-full hover:bg-gray-300"
                                            onClick={() => {
                                                const url = `${window.location.origin}/s/${username}`;
                                                navigator.clipboard.writeText(url);
                                                toast.success("Store link copied!");
                                            }}
                                        >
                                            <Copy className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Add Button, Socials & Clear All */}
                        <div className="flex gap-2 sm:gap-4 mb-6 sm:mb-8">
                            {/* <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                                <DialogTrigger asChild>
                                    <Button
                                        className="w-3/4 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl sm:rounded-2xl h-11 sm:h-14 text-sm sm:text-base font-semibold shadow-lg shadow-zinc-200/50 transition-all hover:scale-[1.01] active:scale-[0.99] gap-1.5 sm:gap-2"
                                    >
                                        <Plus className="w-4 h-4 sm:w-5 sm:h-5" /> {t('dashboard.addContent')}
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle>{t('shop.addNewProduct')}</DialogTitle>
                                        <DialogDescription>
                                            {t('shop.addProductDesc')}
                                        </DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleCreateProduct} className="grid gap-4 py-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="title">{t('shop.productName')}</Label>
                                            <Input
                                                id="title"
                                                value={newProduct.title}
                                                onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="price">{t('shop.price')}</Label>
                                                <Input
                                                    id="price"
                                                    type="number"
                                                    step="0.01"
                                                    value={newProduct.price}
                                                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="type">{t('shop.type')}</Label>
                                                <Select
                                                    value={newProduct.type}
                                                    onValueChange={(val: any) => setNewProduct({ ...newProduct, type: val })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="digital_product">Digital Product</SelectItem>
                                                        <SelectItem value="physical_product">Physical Product</SelectItem>
                                                        <SelectItem value="physical_service">Physical Service</SelectItem>
                                                        <SelectItem value="digital_service">Digital Service</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="desc">Description</Label>
                                            <Textarea
                                                id="desc"
                                                value={newProduct.description}
                                                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                                            />
                                        </div>
                                        {newProduct.type === 'digital_product' && (
                                            <>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="url">Product File (Max 15MB)</Label>
                                                    <FileUpload
                                                        value={newProduct.file_url}
                                                        onChange={(url) => setNewProduct({ ...newProduct, file_url: url })}
                                                        label="Upload Digital Product"
                                                        maxSizeMB={15}
                                                        type="product_file"
                                                    />
                                                    <div className="text-xs text-gray-500 text-center mt-1">- OR -</div>
                                                    <Input
                                                        id="url"
                                                        type="url"
                                                        placeholder="https://drive.google.com/file/..."
                                                        value={newProduct.file_url}
                                                        onChange={(e) => setNewProduct({ ...newProduct, file_url: e.target.value })}
                                                    />
                                                </div>
                                            </>
                                        )}
                                        <div className="grid gap-2">
                                            <Label>Product Image</Label>
                                            <ImageUpload
                                                value={newProduct.image_url}
                                                onChange={(url) => setNewProduct({ ...newProduct, image_url: url })}
                                            />
                                        </div>
                                        <DialogFooter>
                                            <Button type="submit" disabled={isSubmitting} className="w-full">
                                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                                {t('shop.createProduct')}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog> */}
                            <SocialLinksDialog
                                initialLinks={user?.social_links || {}}
                                onSave={async () => { }}
                                onLinksChange={() => { }}
                                onOpenChange={() => { }}
                            >
                                <Button
                                    variant="outline"
                                    className="h-11 sm:h-14 px-3 sm:px-6 rounded-xl sm:rounded-2xl border-zinc-200 text-zinc-700 hover:bg-zinc-50 font-medium gap-1.5 sm:gap-2"
                                >
                                    <Instagram className="w-4 h-4 sm:w-5 sm:h-5" />
                                    <span className="hidden sm:inline">{t('dashboard.socials')}</span>
                                </Button>
                            </SocialLinksDialog>
                            <Button
                                variant="outline"
                                className="h-11 sm:h-14 px-3 sm:px-6 rounded-xl sm:rounded-2xl border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 font-medium"
                                onClick={() => toast.info("Clear All functionality coming soon")}
                            >
                                <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span className="hidden sm:inline ml-2">{t('dashboard.clearAll')}</span>
                            </Button>
                        </div>

                        {/* Products List */}
                        <div className="space-y-3 sm:space-y-4 pb-6">
                            {loadingProducts ? (
                                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-gray-400" /></div>
                            ) : filteredProducts.length > 0 ? (
                                filteredProducts.map((product) => (
                                    <div key={product._id} className="bg-zinc-900 p-4 rounded-xl sm:rounded-2xl border border-zinc-800 shadow-sm flex items-center justify-between group hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-3 sm:gap-4">
                                            {/* Drag Handle */}
                                            <div className="text-zinc-500 cursor-move opacity-0 group-hover:opacity-100 transition-opacity">
                                                <GripVertical className="w-5 h-5" />
                                            </div>
                                            {/* Product Image */}
                                            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                                                {product.image_url ? (
                                                    <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-xl bg-gradient-to-br from-purple-100 to-pink-100">🛍️</div>
                                                )}
                                            </div>
                                            {/* Product Info */}
                                            <div>
                                                <h3 className="font-semibold text-white text-sm sm:text-base">{product.title}</h3>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-xs sm:text-sm font-bold text-green-400">₹{product.price}</span>
                                                    <span className="text-zinc-600">•</span>
                                                    <span className="text-xs text-zinc-400 capitalize">{product.type?.replace('_', ' ')}</span>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Actions */}
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                checked={product.is_active}
                                                onCheckedChange={() => handleToggleProduct(product._id, product.is_active)}
                                                className="data-[state=checked]:bg-green-500"
                                            />
                                            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full" onClick={() => handleDeleteProduct(product._id)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10 sm:py-16 bg-gradient-to-br from-gray-50 to-white rounded-xl sm:rounded-2xl border-2 border-dashed border-gray-200 px-4">
                                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-zinc-100 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                                        <Package className="w-6 h-6 sm:w-8 sm:h-8 text-zinc-600" />
                                    </div>
                                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">{t('shop.noProducts')}</h3>
                                    <p className="text-gray-500 text-xs sm:text-sm mb-4 sm:mb-6">{t('shop.noProductsDesc')}</p>
                                    <Button onClick={() => setIsAddOpen(true)} variant="outline" className="rounded-full gap-2 text-sm">
                                        <Plus className="w-4 h-4" /> {t('shop.addFirstProduct')}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Phone Preview - Right Side */}
                <div className="w-[400px] border-l border-zinc-800 hidden xl:flex items-center justify-center bg-[#0A0A0A] sticky top-0 h-full">
                    <div className="py-8 px-8 flex flex-col items-center">
                        {/* Phone Frame */}
                        <div className="w-[300px] h-[620px] bg-black rounded-[3rem] border-8 border-gray-900 shadow-2xl overflow-hidden relative">
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
                                    <span className="text-[8px]">5G</span>
                                    <div className="w-5 h-2.5 border border-white rounded-sm relative">
                                        <div className="absolute inset-0.5 right-1 bg-white rounded-[1px]" />
                                        <div className="absolute -right-0.5 top-1/2 -translate-y-1/2 w-0.5 h-1 bg-white rounded-r" />
                                    </div>
                                </div>
                            </div>

                            {/* Screen Content */}
                            <div
                                className={`h-full w-full overflow-y-auto p-6 pb-20 ${currentTemplate.bgClass || 'bg-gray-100'} ${currentTemplate.textColor}`}
                                style={bgStyle}
                            >
                                {currentTemplate.bgImage && <div className="absolute inset-0 bg-black/20 pointer-events-none" />}

                                {/* Share Button */}
                                <div className="absolute top-12 right-6 w-8 h-8 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center z-10">
                                    <ExternalLink className={`w-4 h-4 ${currentTemplate.textColor ? 'opacity-80' : 'text-gray-700'}`} />
                                </div>

                                <div className="flex flex-col items-center mt-8 space-y-3 relative z-10">
                                    <Avatar className="w-24 h-24 border-4 border-white/20 shadow-xl">
                                        <AvatarImage src={user?.avatar} />
                                        <AvatarFallback className="bg-gray-400 text-white text-3xl font-bold">
                                            {userInitial}
                                        </AvatarFallback>
                                    </Avatar>
                                    <h2 className="text-xl font-bold tracking-tight">@{username}</h2>

                                    {/* Tab Switcher */}
                                    <div className="mt-4 flex bg-black/10 backdrop-blur-sm p-1 rounded-full">
                                        <button
                                            onClick={() => setPreviewTab('links')}
                                            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${previewTab === 'links' ? 'bg-white text-black shadow-sm' : 'text-current opacity-70 hover:opacity-100'}`}
                                        >
                                            {t('dashboard.links')}
                                        </button>
                                        <button
                                            onClick={() => setPreviewTab('shop')}
                                            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${previewTab === 'shop' ? 'bg-white text-black shadow-sm' : 'text-current opacity-70 hover:opacity-100'}`}
                                        >
                                            {t('shop.title')}
                                        </button>
                                    </div>
                                </div>

                                {/* Links Preview */}
                                {previewTab === 'links' && (
                                    <div className="mt-8 space-y-3 relative z-10 w-full px-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
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

                                {/* Shop Preview */}
                                {previewTab === 'shop' && (
                                    <div className="mt-8 space-y-3 relative z-10 w-full px-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                        {products.filter(p => p && p._id && p.is_active).map((product) => (
                                            <div
                                                key={product._id}
                                                className="relative aspect-square w-full rounded-2xl overflow-hidden group shadow-md"
                                            >
                                                {product.image_url ? (
                                                    <img src={product.image_url} alt={product.title} className="absolute inset-0 w-full h-full object-cover" />
                                                ) : (
                                                    <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-400 w-full h-full flex items-center justify-center">
                                                        <div className="text-4xl opacity-40">✨</div>
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                                                <div className="absolute bottom-0 left-0 right-0 p-4">
                                                    <h4 className="font-bold text-white text-sm truncate">{product.title}</h4>
                                                    <p className="text-white/80 text-xs font-semibold">₹{product.price}</p>
                                                </div>
                                            </div>
                                        ))}
                                        {products.filter(p => p && p.is_active).length === 0 && (
                                            <div className="text-center py-8 text-white/50 text-sm">
                                                No products yet
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Bottom Message Button */}
                                <div className="absolute bottom-4 left-4 right-4 z-20">
                                    <button
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
                                <Smartphone className="w-4 h-4" /> {t('dashboard.livePreview')}
                            </div>
                            <p className="text-xs text-gray-400 mt-1">{t('dashboard.previewDesc')}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Preview Trigger */}
            <div className="fixed bottom-6 right-6 z-40 xl:hidden">
                <Button
                    onClick={() => setShowPreview(true)}
                    className="rounded-full w-14 h-14 bg-zinc-900 text-white hover:bg-zinc-800 shadow-2xl flex items-center justify-center"
                >
                    <Smartphone className="w-6 h-6" />
                </Button>
            </div>

            {/* Mobile Preview Sheet */}
            <Sheet open={showPreview} onOpenChange={setShowPreview}>
                <SheetContent side="right" className="w-full sm:max-w-lg p-0 bg-gradient-to-b from-gray-50 to-white">
                    <div className="h-full flex flex-col items-center justify-center p-6">
                        {/* Phone Frame - Mobile */}
                        <div className="w-[280px] h-[560px] bg-black rounded-[2.5rem] border-8 border-gray-900 shadow-2xl overflow-hidden relative">
                            {/* Notch */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-b-xl z-20" />

                            {/* Status Bar */}
                            <div className="h-7 w-full bg-black flex items-center justify-between px-6 text-[9px] text-white font-medium pt-1 z-30 relative">
                                <span>9:41</span>
                                <div className="flex gap-1 items-center">
                                    <span className="text-[7px]">5G</span>
                                    <div className="w-4 h-2 border border-white rounded-sm relative">
                                        <div className="absolute inset-0.5 right-0.5 bg-white rounded-[1px]" />
                                    </div>
                                </div>
                            </div>

                            {/* Screen Content */}
                            <div
                                className={`h-full w-full overflow-y-auto p-5 pb-16 ${currentTemplate.bgClass || 'bg-gray-100'} ${currentTemplate.textColor}`}
                                style={bgStyle}
                            >
                                <div className="flex flex-col items-center mt-6 space-y-2 relative z-10">
                                    <Avatar className="w-20 h-20 border-3 border-white/20 shadow-lg">
                                        <AvatarImage src={user?.avatar} />
                                        <AvatarFallback className="bg-gray-400 text-white text-2xl font-bold">
                                            {userInitial}
                                        </AvatarFallback>
                                    </Avatar>
                                    <h2 className="text-lg font-bold tracking-tight">@{username}</h2>

                                    {/* Tab Switcher */}
                                    <div className="mt-3 flex bg-black/10 backdrop-blur-sm p-1 rounded-full">
                                        <button
                                            onClick={() => setPreviewTab('links')}
                                            className={`px-3 py-1 rounded-full text-[10px] font-semibold transition-all ${previewTab === 'links' ? 'bg-white text-black shadow-sm' : 'text-current opacity-70'}`}
                                        >
                                            {t('dashboard.links')}
                                        </button>
                                        <button
                                            onClick={() => setPreviewTab('shop')}
                                            className={`px-3 py-1 rounded-full text-[10px] font-semibold transition-all ${previewTab === 'shop' ? 'bg-white text-black shadow-sm' : 'text-current opacity-70'}`}
                                        >
                                            {t('shop.title')}
                                        </button>
                                    </div>
                                </div>

                                {/* Shop Preview in Mobile */}
                                {previewTab === 'shop' && (
                                    <div className="mt-6 space-y-2 relative z-10 w-full">
                                        {products.filter(p => p && p._id && p.is_active).map((product) => (
                                            <div
                                                key={product._id}
                                                className="relative aspect-square w-full rounded-xl overflow-hidden shadow-md"
                                            >
                                                {product.image_url ? (
                                                    <img src={product.image_url} alt={product.title} className="absolute inset-0 w-full h-full object-cover" />
                                                ) : (
                                                    <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-400" />
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                                                <div className="absolute bottom-0 left-0 right-0 p-3">
                                                    <h4 className="font-bold text-white text-xs truncate">{product.title}</h4>
                                                    <p className="text-white/80 text-[10px] font-semibold">₹{product.price}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Links Preview in Mobile */}
                                {previewTab === 'links' && (
                                    <div className="mt-6 space-y-2 relative z-10 w-full">
                                        {authLinks.filter(l => l.isActive).map((link) => (
                                            <a
                                                key={link.id}
                                                href="#"
                                                className={`block w-full flex items-center justify-center p-3 rounded-full transition-transform ${currentTemplate.buttonStyle}`}
                                            >
                                                <span className="text-xs font-medium truncate">{link.title}</span>
                                            </a>
                                        ))}
                                    </div>
                                )}

                                {/* Bottom Message Button */}
                                <div className="absolute bottom-3 left-3 right-3 z-20">
                                    <button className="w-full bg-white text-black h-10 rounded-full font-bold text-xs flex items-center justify-between px-4 shadow-lg border border-gray-100">
                                        <span>Message {user?.name?.split(' ')[0] || 'User'}</span>
                                        <MessageCircle className="w-4 h-4 text-gray-600" />
                                    </button>
                                </div>
                            </div>
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
        </LinktreeLayout>
    );
};

export default Shop;
