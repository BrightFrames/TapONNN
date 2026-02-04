import LinktreeLayout from "@/layouts/LinktreeLayout";
import { templates } from "@/data/templates";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings, Share, Plus, EyeOff, Eye, ExternalLink, Instagram, Globe, Search, GripVertical, Heart, MessageCircle, Smartphone, Store } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, Trash2, MessageSquare, Check, X, Clock, CreditCard, Package, MoreHorizontal, Copy, Edit, BadgeCheck } from "lucide-react";
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
import { Sparkles } from "lucide-react";
import { ProductPluginSuggestions } from "@/components/shop/ProductPluginSuggestions";
import { PluginConfigModal } from "@/components/marketplace/PluginConfigModal";
import { supabase } from "@/lib/supabase";
import ProfilePreview from "@/components/dashboard/ProfilePreview";
import LinksManager from "@/components/dashboard/LinksManager";

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
    const { user, links: authLinks, isLoading, selectedTheme, refreshProfile } = useAuth();
    const { t } = useTranslation();
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
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

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

    useEffect(() => {
        fetchProducts();
        fetchPlugins();
        fetchInstalledPlugins();
    }, []);

    const fetchProducts = async () => {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            console.log('No auth token found');
            setLoadingProducts(false);
            return;
        }

        try {
            const res = await fetch(`${API_URL}/products`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setProducts(data);
            } else if (res.status === 401) {
                console.error('401 Unauthorized - token may be expired');
                toast.error('Session expired. Please log in again.');
                setProducts([]); // Set empty products array
            } else {
                console.error('Failed to fetch products:', res.status);
                setProducts([]);
            }
        } catch (error) {
            console.error("Failed to fetch products", error);
            setProducts([]); // Ensure products is set to empty array on error
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

    const handleSaveProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const token = localStorage.getItem('auth_token');

        try {
            const url = editingProduct
                ? `${API_URL}/products/${editingProduct._id}`
                : `${API_URL}/products`;

            const method = editingProduct ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
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

            if (!res.ok) throw new Error(editingProduct ? "Failed to update product" : "Failed to create product");

            const data = await res.json();

            if (editingProduct) {
                setProducts(products.map(p => p._id === editingProduct._id ? data.product : p));
                toast.success("Product updated successfully");
            } else {
                setProducts([data.product, ...products]);
                toast.success("Product created successfully");
            }

            setIsAddOpen(false);
            setIsEditOpen(false);
            setEditingProduct(null);
            setNewProduct({ title: "", price: "", description: "", type: "physical_product", image_url: "", file_url: "" });
        } catch (error) {
            toast.error(editingProduct ? "Error updating product" : "Error creating product");
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

    const handleDuplicateProduct = async (product: Product) => {
        const token = localStorage.getItem('auth_token');
        try {
            const duplicatedProduct = {
                title: `${product.title} (Copy)`,
                price: product.price,
                description: product.description,
                product_type: product.type,
                image_url: product.image_url,
                file_url: product.file_url
            };

            const res = await fetch(`${API_URL}/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(duplicatedProduct)
            });

            if (res.ok) {
                const data = await res.json();
                setProducts([data.product, ...products]);
                toast.success('Product duplicated successfully!');
            } else {
                toast.error('Failed to duplicate product');
            }
        } catch (error) {
            toast.error('Error duplicating product');
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
        return <div className="h-screen w-full flex items-center justify-center bg-white dark:bg-[#050505]">
            <div className="animate-spin w-8 h-8 border-4 border-gray-200 dark:border-white border-t-purple-600 dark:border-t-transparent rounded-full"></div>
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

    const handleToggleShopVisibility = async (checked: boolean) => {
        try {
            const token = localStorage.getItem('auth_token');
            const res = await fetch(`${API_URL}/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ show_shop_on_profile: checked })
            });

            if (res.ok) {
                await refreshProfile();
                toast.success(`Shop ${checked ? 'visible' : 'hidden'} on profile`);
            } else {
                toast.error("Failed to update visibility");
            }
        } catch (error) {
            toast.error("Error updating settings");
        }
    };

    return (
        <LinktreeLayout>
            <div className="flex h-full">
                {/* Main Editor */}
                <div className="flex-1 py-8 px-6 md:px-10">
                    <div className="max-w-2xl mx-auto">

                        {/* Tabs Integration */}
                        <Tabs defaultValue="shop" value={previewTab} onValueChange={(val) => setPreviewTab(val as 'links' | 'shop')} className="w-full">
                            <div className="flex flex-col gap-4 mb-6">
                                {/* Title Row */}
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                    <div>
                                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Shop & Links</h1>
                                        <p className="text-gray-500 dark:text-zinc-400 text-xs sm:text-sm mt-1 hidden sm:block">Manage your products and profile content</p>
                                    </div>
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        {/* Shop Visibility Toggle */}
                                        <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 shadow-sm">
                                            <Switch
                                                checked={user?.show_shop_on_profile ?? true}
                                                onCheckedChange={handleToggleShopVisibility}
                                                className="scale-90 data-[state=checked]:bg-green-500"
                                            />
                                            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 hidden sm:inline-block">Show Store</span>
                                            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 sm:hidden">Store</span>
                                        </div>

                                        {/* Profile Link */}
                                        <div className="relative group w-full sm:w-auto">
                                            <div
                                                onClick={() => {
                                                    const url = `${window.location.origin}/s/${username}`;
                                                    window.open(url, '_blank');
                                                }}
                                                className="bg-zinc-900 hover:bg-zinc-800 transition-colors rounded-full px-3 sm:px-4 py-2 text-xs sm:text-sm text-zinc-300 pr-10 border border-zinc-800 cursor-pointer truncate max-w-[200px]"
                                                title="Click to open store"
                                            >
                                                {window.location.hostname === 'localhost' ? 'localhost' : 'tapx.bio'}/s/{username}
                                            </div>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 sm:h-7 sm:w-7 rounded-full hover:bg-zinc-700 text-zinc-400"
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

                                {/* Tabs List */}
                                <TabsList className="w-full sm:w-auto self-start bg-zinc-100 dark:bg-zinc-900">
                                    <TabsTrigger value="shop" className="flex-1 sm:flex-none">Products</TabsTrigger>
                                    <TabsTrigger value="links" className="flex-1 sm:flex-none">Links</TabsTrigger>
                                </TabsList>
                            </div>

                            <TabsContent value="shop" className="mt-0">
                                {/* Add Button, Socials & Clear All */}
                                <div className="flex gap-2 sm:gap-4 mb-6 sm:mb-8">
                                    {/* Edit Dialog Logic: Unified with Add Dialog or separate usage? Reusing Dialog but logic controlled by isOpen */}
                                    <Dialog open={isAddOpen || isEditOpen} onOpenChange={(open) => {
                                        if (!open) {
                                            setIsAddOpen(false);
                                            setIsEditOpen(false);
                                            setEditingProduct(null);
                                            setNewProduct({ title: "", price: "", description: "", type: "physical_product", image_url: "", file_url: "" });
                                        }
                                    }}>
                                        <DialogTrigger asChild>
                                            <Button
                                                onClick={() => {
                                                    setEditingProduct(null);
                                                    setNewProduct({ title: "", price: "", description: "", type: "physical_product", image_url: "", file_url: "" });
                                                    setIsAddOpen(true);
                                                }}
                                                className="w-3/4 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl sm:rounded-2xl h-11 sm:h-14 text-sm sm:text-base font-semibold shadow-lg shadow-zinc-200/50 transition-all hover:scale-[1.01] active:scale-[0.99] gap-1.5 sm:gap-2"
                                            >
                                                <Plus className="w-4 h-4 sm:w-5 sm:h-5" /> {t('dashboard.addContent')}
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
                                            <DialogHeader>
                                                <DialogTitle>{isEditOpen ? 'Edit Product' : t('shop.addNewProduct')}</DialogTitle>
                                                <DialogDescription>
                                                    {isEditOpen ? 'Update your product details below.' : t('shop.addProductDesc')}
                                                </DialogDescription>
                                            </DialogHeader>
                                            <form onSubmit={handleSaveProduct} className="grid gap-4 py-4">
                                                <div className="grid gap-2">
                                                    <Input
                                                        id="title"
                                                        value={newProduct.title}
                                                        onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="price">Price (₹)</Label>
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

                                                {/* Marketplace Plugins - Only for non-digital products */}
                                                {newProduct.type !== 'digital_product' && newProduct.type && (
                                                    <div className="grid gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                                        <div className="flex items-center gap-2">
                                                            <Store className="w-4 h-4 text-gray-600" />
                                                            <Label className="text-sm font-semibold text-gray-900">Marketplace Plugins</Label>
                                                        </div>
                                                        <p className="text-xs text-gray-600">
                                                            Enhance your {newProduct.type.replace('_', ' ')} with shipping, payment, and other plugins from the marketplace.
                                                        </p>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={() => window.location.href = '/marketplace'}
                                                            className="w-full border-gray-300 hover:border-gray-900 hover:bg-gray-100"
                                                        >
                                                            <Store className="w-4 h-4 mr-2" />
                                                            Browse Marketplace
                                                        </Button>
                                                    </div>
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
                                    </Dialog>

                                    <Button
                                        variant="outline"
                                        className="h-11 sm:h-14 px-3 sm:px-6 rounded-xl sm:rounded-2xl border-red-900/30 text-red-400 hover:bg-red-950/30 hover:text-red-300 font-medium"
                                        onClick={() => toast.info("Clear All functionality coming soon")}
                                    >
                                        <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                                        <span className="hidden sm:inline">{t('dashboard.clearAll')}</span>
                                    </Button>
                                </div>

                                {/* Products List */}
                                <div className="space-y-3 sm:space-y-4 pb-6">
                                    {loadingProducts ? (
                                        <div className="flex justify-center py-10"><Loader2 className="animate-spin text-gray-400" /></div>
                                    ) : filteredProducts.length > 0 ? (
                                        filteredProducts.map((product) => (
                                            <div key={product._id} className="bg-white dark:bg-zinc-900 p-4 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm flex items-center justify-between group hover:shadow-md transition-shadow">
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
                                                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">{product.title}</h3>
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

                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-40 bg-zinc-900 border-zinc-800 text-zinc-300">
                                                            <DropdownMenuItem
                                                                onClick={() => {
                                                                    setEditingProduct(product);
                                                                    setNewProduct({
                                                                        title: product.title,
                                                                        price: product.price.toString(),
                                                                        description: product.description || "",
                                                                        type: product.product_type || product.type || "physical_product",
                                                                        image_url: product.image_url || "",
                                                                        file_url: product.file_url || ""
                                                                    });
                                                                    setIsEditOpen(true);
                                                                }}
                                                                className="cursor-pointer hover:bg-zinc-800 hover:text-white focus:bg-zinc-800 focus:text-white"
                                                            >
                                                                <Settings className="mr-2 h-4 w-4" />
                                                                <span>Edit</span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => {
                                                                    const url = `${window.location.origin}/${username}/store/product/${product._id}`;
                                                                    navigator.clipboard.writeText(url);
                                                                    toast.success("Product link copied!");
                                                                }}
                                                                className="cursor-pointer hover:bg-zinc-800 hover:text-white focus:bg-zinc-800 focus:text-white"
                                                            >
                                                                <Share className="mr-2 h-4 w-4" />
                                                                <span>Copy Link</span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => handleDuplicateProduct(product)}
                                                                className="cursor-pointer hover:bg-zinc-800 hover:text-white focus:bg-zinc-800 focus:text-white"
                                                            >
                                                                <Copy className="mr-2 h-4 w-4" />
                                                                <span>Duplicate</span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator className="bg-zinc-800" />
                                                            <DropdownMenuItem
                                                                onClick={() => handleDeleteProduct(product._id)}
                                                                className="cursor-pointer text-red-400 hover:text-red-300 hover:bg-red-950/30 focus:bg-red-950/30 focus:text-red-300"
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                <span>Delete</span>
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-10 sm:py-16 bg-white dark:bg-zinc-900/50 rounded-xl sm:rounded-2xl border-2 border-dashed border-gray-200 dark:border-zinc-800 px-4">
                                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 dark:bg-zinc-800 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                                                <Package className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 dark:text-zinc-500" />
                                            </div>
                                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('shop.noProducts')}</h3>
                                            <p className="text-gray-500 dark:text-zinc-400 text-xs sm:text-sm mb-4 sm:mb-6">{t('shop.noProductsDesc')}</p>
                                            <Button onClick={() => setIsAddOpen(true)} variant="outline" className="rounded-full gap-2 text-sm bg-gray-900 dark:bg-zinc-800 border-transparent dark:border-zinc-700 text-white dark:text-zinc-200 hover:bg-gray-800 dark:hover:bg-zinc-700 hover:text-white">
                                                <Plus className="w-4 h-4" /> {t('shop.addFirstProduct')}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="links">
                                <LinksManager />
                            </TabsContent>
                        </Tabs >
                    </div >
                </div >

                {/* Phone Preview - Right Side */}
                < div className="w-[400px] border-l border-zinc-200 dark:border-zinc-800 hidden xl:flex items-center justify-center bg-gray-50 dark:bg-[#0A0A0A] sticky top-0 h-full" >
                    <div className="py-8 px-8 flex flex-col items-center transform scale-90 origin-top">
                        <ProfilePreview blocks={authLinks} theme={currentTemplate} products={products} mode={previewTab === 'shop' ? 'store' : 'personal'} />

                        {/* Preview Label */}
                        <div className="text-center mt-6">
                            <div className="flex items-center justify-center gap-2 text-sm font-medium text-gray-600">
                                <Smartphone className="w-4 h-4" /> {t('dashboard.livePreview')}
                            </div>
                            <p className="text-xs text-gray-400 mt-1">{t('dashboard.previewDesc')}</p>
                        </div>
                    </div>
                </div >
            </div >

            {/* Mobile Preview Trigger */}
            < div className="fixed bottom-6 right-6 z-40 xl:hidden" >
                <Button
                    onClick={() => setShowPreview(true)}
                    className="rounded-full w-14 h-14 shadow-2xl flex items-center justify-center bg-zinc-900 text-white"
                >
                    <Smartphone className="w-6 h-6" />
                </Button>
            </div >

            {/* Mobile Preview Sheet */}
            < Sheet open={showPreview} onOpenChange={setShowPreview} >
                <SheetContent side="right" className="w-full sm:max-w-md p-0 bg-transparent border-none shadow-none flex items-center justify-center backdrop-blur-sm">
                    <div className="scale-90">
                        <ProfilePreview blocks={authLinks} theme={currentTemplate} products={products} mode={previewTab === 'shop' ? 'store' : 'personal'} />
                        <Button
                            className="absolute top-4 right-4 rounded-full w-10 h-10 bg-white/10 hover:bg-white/20 text-white"
                            onClick={() => setShowPreview(false)}
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </div>
                </SheetContent>
            </Sheet >

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
        </LinktreeLayout >
    );
};

export default Shop;
