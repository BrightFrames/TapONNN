import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Store, Share2, Settings, ShoppingBag, MessageCircle, Sparkles } from "lucide-react";
import ShareModal from "@/components/ShareModal";
import ProductInteractionModal from "@/components/ProductInteractionModal";
import { getIconForThumbnail } from "@/utils/socialIcons";
import { getImageUrl } from "@/utils/imageUtils";

interface Product {
    _id: string;
    title: string;
    description?: string;
    price: number;
    image_url?: string;
    product_type?: string;
}

interface StoreProfile {
    id: string;
    username: string;
    full_name: string;
    name?: string;
    bio?: string;
    avatar_url?: string;
    avatar?: string;
    selected_theme: string;
    products: Product[];
    payment_instructions?: string;
}

const PublicStore_New = () => {
    const { username, productId } = useParams();
    const navigate = useNavigate();
    const [shareOpen, setShareOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [store, setStore] = useState<StoreProfile | null>(null);
    const [notFound, setNotFound] = useState(false);
    const [viewMode, setViewMode] = useState<'links' | 'shop'>('shop');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [blocks, setBlocks] = useState<any[]>([]); // Store links
    const [activeTab, setActiveTab] = useState<'links' | 'shop'>('shop'); // For internal consistency if needed

    // Helper for icons (copied imports needed)

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

    useEffect(() => {
        const fetchStore = async () => {
            if (!username) return;

            try {
                const res = await fetch(`${API_URL}/profile/store/${username}`);
                if (!res.ok) {
                    setNotFound(true);
                    setLoading(false);
                    return;
                }

                const data = await res.json();
                setStore(data);

                // Fetch Store Blocks
                const blocksRes = await fetch(`${API_URL}/blocks/public/${data.id}?context=store`);
                if (blocksRes.ok) {
                    const storeBlocks = await blocksRes.json();
                    setBlocks(storeBlocks);
                }
            } catch (error) {
                console.error("Error fetching store:", error);
                setNotFound(true);
            } finally {
                setLoading(false);
            }
        };

        fetchStore();
    }, [username]);

    // Effect to handle deep linking to product
    useEffect(() => {
        if (store && productId && store.products) {
            const product = store.products.find(p => p._id === productId);
            if (product) {
                setSelectedProduct(product);
            }
        }
    }, [store, productId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 rounded-full border-4 border-gray-200 border-t-black animate-spin" />
                    <p className="text-gray-600 text-sm">Loading store...</p>
                </div>
            </div>
        );
    }

    if (notFound || !store) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center text-center px-4">
                <div className="bg-white p-6 rounded-full mb-4 shadow-lg">
                    <Store className="w-12 h-12 text-gray-400" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight mb-2 text-gray-900">Store not found</h2>
                <p className="text-gray-600 mb-6 max-w-md">This store doesn't exist or isn't published yet.</p>
                <Button
                    className="bg-black hover:bg-gray-800 text-white rounded-full px-8"
                    onClick={() => navigate('/')}
                >
                    Go Home
                </Button>
            </div>
        );
    }

    const storeUrl = `${window.location.origin}/${store.username}/store`;
    const hasProducts = store.products.length > 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-blue-50">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">
                <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Button
                            size="icon"
                            variant="ghost"
                            className="rounded-full hover:bg-gray-100"
                            onClick={() => navigate(`/${store.username}`)}
                        >
                            <Settings className="w-5 h-5" />
                        </Button>
                    </div>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="rounded-full hover:bg-gray-100"
                        onClick={() => setShareOpen(true)}
                    >
                        <Share2 className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* Hero Section */}
            <div className="max-w-5xl mx-auto px-4 py-12 text-center">
                {/* Store Icon */}
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full blur-xl opacity-50" />
                        <div className="relative w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-2xl">
                            <Store className="w-12 h-12 text-black" />
                        </div>
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
                    TapX Store
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
                    Give your visitors the perfect destination to shop products with store!
                </p>

                {/* Toggle */}
                <div className="inline-flex bg-gray-200 rounded-full p-1 shadow-inner">
                    <button
                        onClick={() => setViewMode('links')}
                        className={`px-6 py-2.5 rounded-full font-semibold transition-all ${viewMode === 'links'
                            ? 'bg-white text-black shadow-md'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Links
                    </button>
                    <button
                        onClick={() => setViewMode('shop')}
                        className={`px-6 py-2.5 rounded-full font-semibold transition-all ${viewMode === 'shop'
                            ? 'bg-gray-700 text-white shadow-md'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Shop
                    </button>
                </div>
            </div>

            {/* Content Switcher */}
            {viewMode === 'links' ? (
                <div className="max-w-md mx-auto px-4 pb-20 space-y-4">
                    {blocks.filter(b => b.is_active).length > 0 ? (
                        blocks.filter(b => b.is_active).map((block) => {
                            const Icon = block.thumbnail ? getIconForThumbnail(block.thumbnail) : null;
                            const isUrlThumbnail = block.thumbnail && !Icon;

                            return (
                                <a
                                    key={block._id}
                                    href={block.content?.url || '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full bg-white hover:bg-gray-50 transition-all rounded-xl p-4 shadow-sm hover:shadow-md border border-gray-100 flex items-center gap-4"
                                >
                                    {Icon && (
                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                                            <Icon className="w-5 h-5 text-gray-700" />
                                        </div>
                                    )}
                                    {isUrlThumbnail && (
                                        <img src={getImageUrl(block.thumbnail)} alt="" className="w-10 h-10 rounded-full object-cover" />
                                    )}
                                    <span className="font-semibold text-gray-900 truncate flex-1">{block.title}</span>
                                    <MessageCircle className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </a>
                            );
                        })
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            <Store className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p>No links added to this store yet.</p>
                        </div>
                    )}
                </div>
            ) : (
                /* Products Grid */
                hasProducts ? (
                    <div className="max-w-5xl mx-auto px-4 pb-20">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {store.products.map((product) => (
                                <div
                                    key={product._id}
                                    onClick={() => setSelectedProduct(product)}
                                    className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-[1.02]"
                                >
                                    {/* Product Image */}
                                    <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                                        {product.image_url ? (
                                            <img
                                                src={getImageUrl(product.image_url)}
                                                alt={product.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <ShoppingBag className="w-24 h-24 text-gray-300" />
                                            </div>
                                        )}

                                        {/* Logo and Share Overlay */}
                                        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                                            {/* Logo Icon */}
                                            <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                                                <Sparkles className="w-5 h-5 text-black" />
                                            </button>

                                            {/* Share Button */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    // Ensure we share the specific product link
                                                    const productUrl = `${window.location.origin}/${store.username}/store/product/${product._id}`;
                                                    if (navigator.share) {
                                                        navigator.share({
                                                            title: product.title,
                                                            text: `Check out ${product.title} on ${store.name || store.username}'s store`,
                                                            url: productUrl,
                                                        }).catch(console.error);
                                                    } else {
                                                        navigator.clipboard.writeText(productUrl);
                                                        // toast.success("Link copied!"); // Need toast import if used here, or use existing ShareModal logic context
                                                        setShareOpen(true); // Fallback to general share for now, or update ShareModal to accept custom URL
                                                    }
                                                }}
                                                className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                                            >
                                                <Share2 className="w-5 h-5 text-black" />
                                            </button>
                                        </div>

                                        {/* Hover Overlay */}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
                                    </div>

                                    {/* Product Info */}
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold text-gray-900 mb-1 line-clamp-2">
                                            {product.title}
                                        </h3>
                                        <p className="text-2xl font-bold text-gray-900">
                                            ₹{product.price}
                                        </p>
                                        {product.description && (
                                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                                                {product.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Featured Collection Sections */}
                        {store.products.length >= 3 && (
                            <div className="mt-12">
                                <div className="bg-white rounded-3xl p-8 shadow-lg">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                        Featured Collection
                                    </h2>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {store.products.slice(0, 6).map((product) => (
                                            <div
                                                key={product._id}
                                                onClick={() => setSelectedProduct(product)}
                                                className="group cursor-pointer"
                                            >
                                                <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-3">
                                                    {product.image_url ? (
                                                        <img
                                                            src={getImageUrl(product.image_url)}
                                                            alt={product.title}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <ShoppingBag className="w-12 h-12 text-gray-300" />
                                                        </div>
                                                    )}
                                                </div>
                                                <h4 className="font-semibold text-sm text-gray-900 line-clamp-1">
                                                    {product.title}
                                                </h4>
                                                <p className="text-sm text-gray-600">₹{product.price}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
                        <ShoppingBag className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">No products yet</h3>
                        <p className="text-gray-600 mb-8">
                            This store doesn't have any products available at the moment.
                        </p>
                        <Button
                            className="bg-black hover:bg-gray-800 text-white rounded-full px-8"
                            onClick={() => navigate(`/${store.username}`)}
                        >
                            View Profile
                        </Button>
                    </div>
                ))}

            {/* Footer CTA */}
            <div className="max-w-5xl mx-auto px-4 py-12 text-center">
                <Button
                    size="lg"
                    className="bg-white hover:bg-gray-50 text-black font-bold rounded-full px-8 shadow-lg hover:shadow-xl transition-all"
                    onClick={() => window.open('https://taponn.com/signup', '_blank')}
                >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Create your own store on TapX
                </Button>
            </div>

            {/* Modals */}
            {store && (
                <>
                    <ProductInteractionModal
                        open={!!selectedProduct}
                        onOpenChange={(open) => !open && setSelectedProduct(null)}
                        product={selectedProduct}
                        seller={store}
                        initialStep="selection"
                    />
                    <ShareModal
                        open={shareOpen}
                        onOpenChange={setShareOpen}
                        username={store.username}
                        url={storeUrl}
                        type="store"
                        userAvatar={getImageUrl(store.avatar_url || store.avatar)}
                        userName={store.full_name || store.name}
                    />
                </>
            )}
        </div>
    );
};

export default PublicStore_New;
