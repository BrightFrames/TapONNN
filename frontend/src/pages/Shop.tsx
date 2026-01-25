
import LinktreeLayout from "@/layouts/LinktreeLayout";
import { templates } from "@/data/templates";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings, Share, Plus, EyeOff, ExternalLink, Instagram, Globe, Search, GripVertical, Heart, MessageCircle } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
import ConnectWithSupplierModal from "@/components/ConnectWithSupplierModal";

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

const Shop = () => {
    const { user, links: authLinks, isLoading, selectedTheme } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [previewTab, setPreviewTab] = useState<'links' | 'shop'>('shop');
    const [connectModal, setConnectModal] = useState<{ open: boolean; product: any; seller: any }>({ open: false, product: null, seller: null });

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

    return (
        <LinktreeLayout>
            <div className="flex h-full">
                {/* Center Column: Editor */}
                <div className="flex-1 max-w-3xl mx-auto py-10 px-4 md:px-8 overflow-y-auto">

                    {/* Header */}
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-2xl font-bold">My Shop</h1>
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <Settings className="w-5 h-5 text-gray-500" />
                        </Button>
                    </div>

                    {/* Tabs */}
                    <Tabs defaultValue="manage" className="w-full mb-8">
                        <div className="border-b border-gray-200">
                            <TabsList className="bg-transparent p-0 h-auto gap-6 transition-none">
                                <TabsTrigger
                                    value="manage"
                                    className="bg-transparent p-0 pb-3 rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:text-black text-gray-500 font-medium data-[state=active]:shadow-none transition-none"
                                >
                                    Manage
                                </TabsTrigger>
                                <TabsTrigger
                                    value="products"
                                    className="bg-transparent p-0 pb-3 rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:text-black text-gray-500 font-medium data-[state=active]:shadow-none transition-none"
                                >
                                    Products
                                </TabsTrigger>
                                <TabsTrigger
                                    value="orders"
                                    className="bg-transparent p-0 pb-3 rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:text-black text-gray-500 font-medium data-[state=active]:shadow-none transition-none"
                                >
                                    Orders & Enquiries
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        {/* Content */}
                        <div className="flex-1 mt-6">
                            <TabsContent value="manage" className="m-0">
                                {/* Profile Section */}
                                <div className="flex items-start gap-4 mb-8">
                                    <Avatar className="w-20 h-20 border border-gray-100">
                                        <AvatarImage src="" />
                                        <AvatarFallback className="bg-gray-200 text-gray-400">
                                            <svg className="w-10 h-10 fill-current" viewBox="0 0 24 24"><path d="M12 12c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0 2c2.67 0 8 1.34 8 4v2H4v-2c0-2.66 5.33-4 8-4z" /></svg>
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <h2 className="text-xl font-bold mb-1">@{user?.username || "user"}</h2>
                                        <button className="text-gray-400 text-sm hover:underline mb-2">Add bio</button>
                                        <div className="flex gap-2">
                                            {/* Placeholder social icons as per screenshot */}
                                            <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full"><Instagram className="w-4 h-4" /></Button>
                                            <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full"><Plus className="w-4 h-4" /></Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Add Button (Primary Action) */}
                                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                                    <DialogTrigger asChild>
                                        <Button
                                            className="w-full bg-[#7535f5] hover:bg-[#6025d5] text-white rounded-full h-12 text-base font-bold mb-10 shadow-md shadow-purple-200 transition-all hover:scale-[1.01]"
                                        >
                                            <Plus className="w-5 h-5 mr-2" /> Add
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[425px]">
                                        <DialogHeader>
                                            <DialogTitle>Add New Product</DialogTitle>
                                            <DialogDescription>
                                                Add a product or link to your shop.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <form onSubmit={handleCreateProduct} className="grid gap-4 py-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="title">Product Name</Label>
                                                <Input
                                                    id="title"
                                                    value={newProduct.title}
                                                    onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="price">Price ($)</Label>
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
                                                    <Label htmlFor="type">Type</Label>
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
                                                <div className="grid gap-2">
                                                    <Label htmlFor="url">Product URL </Label>
                                                    <Input
                                                        id="url"
                                                        placeholder="https://..."
                                                        value={newProduct.file_url}
                                                        onChange={(e) => setNewProduct({ ...newProduct, file_url: e.target.value })}
                                                    />
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
                                                <Button type="submit" disabled={isSubmitting}>
                                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                    Save Product
                                                </Button>
                                            </DialogFooter>
                                        </form>
                                    </DialogContent>
                                </Dialog>

                                {/* Publish Banner */}
                                <div className="bg-[#EAEAE8] rounded-xl p-6 flex flex-col md:flex-row items-center justify-center md:justify-between gap-4 mb-8 text-center md:text-left">
                                    <div className="flex items-center gap-3">
                                        <EyeOff className="w-5 h-5 text-gray-800" />
                                        <div>
                                            <h3 className="font-bold text-gray-900">Publish your Shop</h3>
                                            <p className="text-sm text-gray-600">Your Shop is currently hidden.</p>
                                        </div>
                                    </div>
                                    <Switch />
                                </div>
                            </TabsContent>

                            <TabsContent value="orders">
                                <div className="space-y-4">
                                    {loadingOrders ? (
                                        <div className="flex justify-center py-10"><Loader2 className="animate-spin" /></div>
                                    ) : orders.length > 0 ? (
                                        orders.map((order) => (
                                            <Card key={order._id} className="overflow-hidden">
                                                <div className="p-4 flex flex-col md:flex-row gap-4 justify-between">
                                                    <div className="flex gap-4">
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${order.type === 'enquiry' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                                                            }`}>
                                                            {order.type === 'enquiry' ? <MessageSquare className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <h3 className="font-bold text-sm">{order.buyer_name || "Anonymous"}</h3>
                                                                <Badge variant={order.status === 'completed' ? 'default' : order.status === 'pending' ? 'secondary' : 'outline'}>
                                                                    {order.status}
                                                                </Badge>
                                                                {order.type === 'enquiry' && <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">Enquiry</Badge>}
                                                            </div>
                                                            <div className="text-sm text-gray-500 mt-1 space-y-0.5">
                                                                <p>{order.buyer_email} • {order.buyer_phone}</p>
                                                                <p className="font-mono text-xs text-gray-400">{new Date(order.created_at).toLocaleString()}</p>
                                                            </div>

                                                            {/* Transaction Details / Message */}
                                                            {order.transaction_details && (
                                                                <div className="mt-3 bg-gray-50 p-3 rounded-lg text-sm border border-gray-100">
                                                                    <span className="font-semibold text-xs text-gray-500 uppercase block mb-1">
                                                                        {order.type === 'enquiry' ? 'Message' : 'Transaction Ref'}
                                                                    </span>
                                                                    {order.transaction_details}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col items-end gap-2">
                                                        <div className="font-bold text-lg">${order.amount}</div>

                                                        {/* Actions */}
                                                        {order.status !== 'completed' && order.status !== 'failed' && (
                                                            <div className="flex gap-2 mt-auto">
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                                    onClick={() => handleUpdateStatus(order._id, 'failed')}
                                                                >
                                                                    <X className="w-4 h-4 mr-1" /> Reject
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    className="bg-green-600 hover:bg-green-700 text-white"
                                                                    onClick={() => handleUpdateStatus(order._id, 'completed')}
                                                                >
                                                                    <Check className="w-4 h-4 mr-1" /> {order.type === 'enquiry' ? 'Mark Done' : 'Verify'}
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </Card>
                                        ))
                                    ) : (
                                        <div className="text-center py-16 opacity-60">
                                            <p>No orders or enquiries yet.</p>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="products">
                                {/* Search and Add Row */}
                                <div className="flex gap-3 mb-8">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <Input
                                            placeholder="Search or paste product URL"
                                            className="pl-9 h-12 bg-white rounded-xl border-gray-200"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>

                                    {/* Add Button with Dialog */}
                                    <Button
                                        onClick={() => {
                                            if (searchQuery.startsWith('http')) {
                                                setNewProduct(prev => ({ ...prev, file_url: searchQuery }));
                                                setSearchQuery('');
                                            }
                                            setIsAddOpen(true);
                                        }}
                                        className="bg-[#7535f5] hover:bg-[#6025d5] text-white rounded-full h-12 px-6 text-base font-semibold shadow-lg shadow-purple-200 transition-all hover:scale-[1.01]"
                                    >
                                        Add
                                    </Button>
                                </div>

                                {/* Products Grid */}
                                {loadingProducts ? (
                                    <div className="flex justify-center py-10"><Loader2 className="animate-spin text-muted-foreground" /></div>
                                ) : filteredProducts.length > 0 ? (
                                    <div className="grid gap-4">
                                        {filteredProducts.map((product) => (
                                            <div key={product._id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between group">
                                                <div className="flex items-center gap-4">
                                                    <div className="text-gray-400 cursor-move opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <GripVertical className="w-5 h-5" />
                                                    </div>
                                                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                                                        {product.image_url ? (
                                                            <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-xl">🛍️</div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900">{product.title}</h3>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="font-bold text-gray-900">${product.price}</span>
                                                            <span className="text-gray-300">•</span>
                                                            <span className="text-sm text-gray-500 capitalize">{product.type}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-500" onClick={() => handleDeleteProduct(product._id)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    /* Empty State Card */
                                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center bg-opacity-50">
                                        <div className="flex justify-center mb-4 text-4xl">🛍️</div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-1">Add your first product</h3>
                                        <p className="text-gray-500 mb-6 font-medium">Sell physical or digital goods directly to your audience.</p>
                                    </div>
                                )}
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
                {/* Phone Preview - Right Side */}
                <div className="w-[400px] border-l border-gray-100 hidden xl:flex items-center justify-center bg-gray-50/50 relative p-8">
                    <div className="sticky top-8">
                        {/* Phone Frame */}
                        <div className="w-[300px] h-[620px] bg-black rounded-[3rem] border-8 border-gray-900 shadow-2xl overflow-hidden relative transition-all duration-300">
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
                                            <AvatarFallback className="bg-gray-400 text-white text-xl font-bold">
                                                {userInitial}
                                            </AvatarFallback>
                                        </Avatar>
                                        <h2 className="text-lg font-bold tracking-tight mb-0.5">@{username}</h2>

                                        {/* Preview Tabs (Links | Shop) */}
                                        <div className="mt-4 flex bg-black/10 backdrop-blur-sm p-1 rounded-full">
                                            <button
                                                onClick={() => setPreviewTab('links')}
                                                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${previewTab === 'links' ? 'bg-white text-black shadow-sm' : 'text-current opacity-70 hover:opacity-100'}`}
                                            >
                                                Links
                                            </button>
                                            <button
                                                onClick={() => setPreviewTab('shop')}
                                                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${previewTab === 'shop' ? 'bg-white text-black shadow-sm' : 'text-current opacity-70 hover:opacity-100'}`}
                                            >
                                                Shop
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
                                            {/* Search Bar */}
                                            {/* Search Bar */}
                                            <div className="relative w-full">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-50 text-current" />
                                                <input
                                                    type="text"
                                                    placeholder={`Search ${username}'s products`}
                                                    className="w-full pl-8 pr-4 py-2.5 rounded-xl text-xs bg-white/10 backdrop-blur-md border border-white/10 placeholder:text-current/50 focus:outline-none focus:ring-1 focus:ring-white/30 transition-all font-medium"
                                                />
                                            </div>

                                            {/* Product Grid */}
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
                                                                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black w-full h-full flex items-center justify-center">
                                                                    <div className="text-4xl opacity-20">✨</div>
                                                                </div>
                                                            )}

                                                            {/* Overlay */}
                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                                                            {/* Top Actions */}
                                                            <div className="absolute top-2 left-2 right-2 flex justify-between items-start z-10">
                                                                <button className="w-6 h-6 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/40 transition-colors">
                                                                    <X className="w-3 h-3" />
                                                                </button>
                                                            </div>

                                                            {/* Bottom Content */}
                                                            <div className="absolute bottom-0 left-0 right-0 p-3 z-20 text-white">
                                                                {/* Badge / Pill */}
                                                                <div className="inline-flex items-center gap-1 bg-white/10 backdrop-blur-md px-2 py-0.5 rounded-full text-[8px] font-medium mb-2 border border-white/10">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                                                    <span>{user?.name || "User"}</span>
                                                                </div>

                                                                <h3 className="text-sm font-bold leading-tight mb-1 text-white">{product.title}</h3>
                                                                <p className="text-[10px] text-gray-300 line-clamp-1 mb-2 font-light">{product.description}</p>

                                                                {/* Action Row */}
                                                                <div className="flex items-center gap-2">
                                                                    <button
                                                                        onClick={() => setConnectModal({
                                                                            open: true,
                                                                            product: product,
                                                                            seller: { id: user?.id || '', name: user?.name || '' }
                                                                        })}
                                                                        className="flex-1 bg-white text-black h-8 rounded-full font-bold text-xs flex items-center justify-center hover:bg-gray-100 transition-colors"
                                                                    >
                                                                        Connect
                                                                    </button>
                                                                    <button className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-colors border border-white/10">
                                                                        <Heart className="w-3.5 h-3.5" />
                                                                    </button>
                                                                    <button className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-colors border border-white/10">
                                                                        <Share className="w-3.5 h-3.5" />
                                                                    </button>
                                                                </div>
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
                                        <span>Connect</span>
                                        <MessageCircle className="w-5 h-5 text-gray-600" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Preview Label */}
                        <div className="text-center mt-6">
                            <div className="flex items-center justify-center gap-2 text-sm font-medium text-gray-600">
                                <Share className="w-4 h-4" /> Live Preview
                            </div>
                            <p className="text-xs text-gray-400 mt-1">Reflects your current theme</p>
                        </div>
                    </div>
                </div>
            </div>

            <ConnectWithSupplierModal
                open={connectModal.open}
                onOpenChange={(open) => setConnectModal(prev => ({ ...prev, open }))}
                product={connectModal.product}
                seller={connectModal.seller}
                onSuccess={(newUser) => {
                    toast.success(`Welcome, ${newUser.full_name}! You are now connected.`);
                }}
            />
        </LinktreeLayout >
    );
};

export default Shop;

