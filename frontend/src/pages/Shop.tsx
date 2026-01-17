
import LinktreeLayout from "@/layouts/LinktreeLayout";
import { templates } from "@/data/templates";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings, Share, Plus, EyeOff, ExternalLink, Instagram, Globe } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";
import { getIconForThumbnail } from "@/utils/socialIcons";

interface Product {
    id: string;
    title: string;
    description?: string;
    price: number;
    image_url?: string;
    type: 'physical' | 'digital';
    is_active: boolean;
}

const Shop = () => {
    const { user, links: authLinks, isLoading, selectedTheme } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // New Product State
    const [newProduct, setNewProduct] = useState({
        title: "",
        price: "",
        description: "",
        type: "physical",
        image_url: ""
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
                    price: parseFloat(newProduct.price)
                })
            });

            if (!res.ok) throw new Error("Failed to create product");

            const data = await res.json();
            setProducts([data.product, ...products]);
            setIsAddOpen(false);
            setNewProduct({ title: "", price: "", description: "", type: "physical", image_url: "" });
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
            setProducts(products.filter(p => p.id !== id));
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
                                    My Products
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        {/* Profile Section */}
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
                                            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-200"><Settings className="w-3 h-3" /></div>
                                            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-200"><Instagram className="w-3 h-3" /></div>
                                            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-200"><Globe className="w-3 h-3" /></div>
                                            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-200"><Plus className="w-3 h-3" /></div>
                                        </div>
                                    </div>
                                </div>

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

                                {/* Add Button */}
                                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                                    <DialogTrigger asChild>
                                        <Button
                                            className="w-full bg-[#7535f5] hover:bg-[#6025d5] text-white rounded-full h-12 text-base font-semibold mb-10 shadow-lg shadow-purple-200 transition-all hover:scale-[1.01]"
                                        >
                                            <Plus className="w-5 h-5 mr-2" /> Add
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[425px]">
                                        <DialogHeader>
                                            <DialogTitle>Add New Product</DialogTitle>
                                            <DialogDescription>
                                                Add a product to sell on your Tap2 Shop.
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
                                                            <SelectItem value="physical">Physical</SelectItem>
                                                            <SelectItem value="digital">Digital</SelectItem>
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
                                            <div className="grid gap-2">
                                                <Label htmlFor="image">Image URL</Label>
                                                <Input
                                                    id="image"
                                                    placeholder="https://..."
                                                    value={newProduct.image_url}
                                                    onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })}
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

                                {/* Products Grid */}
                                {loadingProducts ? (
                                    <div className="flex justify-center py-10"><Loader2 className="animate-spin text-muted-foreground" /></div>
                                ) : products.length > 0 ? (
                                    <div className="grid gap-4">
                                        {products.map((product) => (
                                            <div key={product.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                        {product.image_url ? (
                                                            <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-xl">🛍️</div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900">{product.title}</h3>
                                                        <p className="text-sm text-gray-500 line-clamp-1">{product.description}</p>
                                                        <p className="font-bold text-primary mt-1">${product.price}</p>
                                                    </div>
                                                </div>
                                                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDeleteProduct(product.id)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    /* Empty State Card */
                                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
                                        <div className="flex justify-center gap-4 mb-6">
                                            <div className="w-28 h-36 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative rotate-[-6deg] translate-y-2 translate-x-2 z-0 flex flex-col p-2">
                                                <div className="flex items-center gap-1 text-gray-700 font-medium text-xs mb-1">
                                                    <div className="w-4 h-4 bg-gray-100 rounded-sm flex items-center justify-center">
                                                        <span className="text-[8px]">🖼️</span>
                                                    </div>
                                                    Makeup
                                                </div>
                                                <div className="flex-1 bg-gray-50 rounded-lg"></div>
                                            </div>
                                            <div className="w-28 h-36 bg-gray-100 rounded-xl overflow-hidden relative rotate-[4deg] z-20 shadow-md -translate-x-2 border-2 border-white">
                                                <img src="https://images.unsplash.com/photo-1632922267756-9b71242b1592?auto=format&fit=crop&w=300&q=80" className="w-full h-full object-cover" alt="Nails" />
                                            </div>
                                            <div className="w-28 h-36 bg-[#E3E8EF] rounded-xl overflow-hidden relative rotate-[12deg] translate-y-6 -translate-x-4 z-10 shadow-sm border border-white">
                                            </div>
                                        </div>
                                        <h3 className="text-xl font-bold mb-2">Start by adding some products</h3>
                                        <p className="text-gray-500 mb-6 max-w-sm mx-auto">Copy and paste links from any existing store to feature products.</p>
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="products">
                                <div className="text-center py-10 text-gray-500">
                                    Product management coming soon. Use Manage tab.
                                </div>
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
                {/* Phone Preview - Right Side */}
                <div className="w-[400px] border-l border-gray-100 hidden xl:flex items-center justify-center bg-gradient-to-b from-gray-50 to-white relative p-8">
                    <div className="sticky top-8">
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
                                {/* Overlay for readibility overlay if needed */}
                                {currentTemplate.bgImage && <div className="absolute inset-0 bg-black/20 pointer-events-none" />}

                                {/* Share Button */}
                                <div className="absolute top-12 right-6 w-8 h-8 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center z-10">
                                    <ExternalLink className={`w-4 h-4 ${currentTemplate.textColor ? 'opacity-80' : 'text-gray-700'}`} />
                                </div>

                                <div className="flex flex-col items-center mt-8 space-y-3 relative z-10">
                                    <Avatar className="w-24 h-24 border-4 border-white/20 shadow-xl" key={user?.avatar}>
                                        <AvatarImage src={user?.avatar} />
                                        <AvatarFallback className="bg-gray-400 text-white text-3xl font-bold">
                                            {userInitial}
                                        </AvatarFallback>
                                    </Avatar>
                                    <h2 className="text-xl font-bold tracking-tight">@{username}</h2>
                                    <div className="flex gap-3 flex-wrap justify-center px-4">
                                        {user?.social_links && Object.entries(user.social_links).map(([platform, url]) => {
                                            if (!url) return null;
                                            const Icon = getIconForThumbnail(platform);
                                            return Icon ? (
                                                <a
                                                    key={platform}
                                                    href={url.startsWith('http') ? url : `https://${url}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer backdrop-blur-sm"
                                                >
                                                    <Icon className="w-4 h-4" />
                                                </a>
                                            ) : null;
                                        })}
                                    </div>
                                </div>

                                <div className="mt-8 space-y-3 relative z-10">


                                    {authLinks.filter(l => l.isActive).map((link) => {
                                        const Icon = link.thumbnail ? getIconForThumbnail(link.thumbnail) : null;
                                        return (
                                            <a
                                                key={link.id}
                                                href={link.url || '#'}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`block w-full flex items-center justify-center relative ${currentTemplate.buttonStyle}`}
                                            >
                                                {Icon && (
                                                    <Icon className="absolute left-4 w-5 h-5 opacity-90" />
                                                )}
                                                <span className="truncate max-w-[200px]">{link.title}</span>
                                            </a>
                                        );
                                    })}
                                    {authLinks.filter(l => l.isActive).length === 0 && (
                                        <div className={`text-center text-sm py-8 ${currentTemplate.textColor} opacity-60`}>
                                            Add links to see them here
                                        </div>
                                    )}
                                </div>

                                {/* Footer */}
                                <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center gap-2 px-6 z-10">
                                    <button className="bg-white/10 backdrop-blur-md border border-white/20 text-current px-5 py-2.5 rounded-full text-xs font-bold shadow-lg hover:shadow-xl transition-shadow">
                                        Join @{username} on Tap2
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
        </LinktreeLayout >
    );
};

export default Shop;
