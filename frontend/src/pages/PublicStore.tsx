import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client"; // Add Socket.io
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Store, Share2, ShoppingBag, X, ChevronDown, ChevronUp, MessageCircle, ArrowLeft } from "lucide-react";
import ShareModal from "@/components/ShareModal";
import ProductInteractionModal from "@/components/ProductInteractionModal";
import { getImageUrl } from "@/utils/imageUtils";

interface Product {
    _id: string;
    title: string;
    description?: string;
    price: number;
    image_url?: string;
}

interface StoreProfile {
    id: string;
    username: string;
    full_name: string;
    bio?: string;
    avatar_url?: string;
    selected_theme: string;
    products: Product[];
    payment_instructions?: string;
}

const PublicStore = () => {
    const { username } = useParams();
    const navigate = useNavigate();
    const [shareOpen, setShareOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [store, setStore] = useState<StoreProfile | null>(null);
    const [notFound, setNotFound] = useState(false);
    const [currentProductIndex, setCurrentProductIndex] = useState(0);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Modal State
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

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
            } catch (error) {
                console.error("Error fetching store:", error);
                setNotFound(true);
            } finally {
                setLoading(false);
            }
        };

        fetchStore();

        // Socket.io Connection
        // Socket.io Connection
        const socketUrl = (import.meta.env.VITE_API_URL || "http://localhost:5001").replace(/\/api\/?$/, '');
        console.log("Store: Connecting to socket at:", socketUrl);
        const socket = io(socketUrl);

        socket.on("connect", () => {
            console.log("Store: Socket connected:", socket.id);
            if (username) {
                console.log("Store: Joining profile room:", username);
                socket.emit("joinProfile", username);
            }
        });

        socket.on("connect_error", (err) => {
            console.error("Store: Socket connection error:", err);
        });

        socket.on("profileUpdated", (data) => {
            console.log("Store: Real-time update received:", data);
            fetchStore();
        });

        return () => {
            socket.disconnect();
        };
    }, [username]);

    // Handle scroll to update current product index
    const handleScroll = () => {
        if (!scrollContainerRef.current) return;
        const scrollTop = scrollContainerRef.current.scrollTop;
        const height = window.innerHeight;
        const newIndex = Math.round(scrollTop / height);
        setCurrentProductIndex(newIndex);
    };

    // Scroll to specific product
    const scrollToProduct = (index: number) => {
        if (!scrollContainerRef.current) return;
        scrollContainerRef.current.scrollTo({
            top: index * window.innerHeight,
            behavior: 'smooth'
        });
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black flex items-center justify-center">
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                    <p className="text-white/60 text-sm">Loading shop...</p>
                </div>
            </div>
        );
    }

    if (notFound || !store) {
        return (
            <div className="fixed inset-0 bg-black flex flex-col items-center justify-center text-center px-4">
                <div className="bg-white/10 p-4 rounded-full mb-4">
                    <Store className="w-8 h-8 text-white/60" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight mb-2 text-white">Shop not found</h2>
                <p className="text-white/60 mb-6">This shop doesn't exist or isn't published yet.</p>
                <Button
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
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
        <div className="fixed inset-0 bg-black">
            {/* Floating Header */}
            <div className="fixed top-0 left-0 right-0 z-50 px-4 py-3 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
                {/* Back Button */}
                <Button
                    size="icon"
                    variant="ghost"
                    className="text-white hover:bg-white/10 rounded-full"
                    onClick={() => navigate(`/${store.username}`)}
                >
                    <ArrowLeft className="w-5 h-5" />
                </Button>

                {/* Store Info */}
                <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8 border border-white/20">
                        <AvatarImage src={getImageUrl(store.avatar_url)} />
                        <AvatarFallback className="bg-white/10 text-white text-xs">
                            {store.full_name?.[0]?.toUpperCase() || "S"}
                        </AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                        <div className="text-white text-sm font-semibold">{store.full_name}</div>
                        <div className="text-white/60 text-xs">@{store.username}</div>
                    </div>
                </div>

                {/* Share Button */}
                <Button
                    size="icon"
                    variant="ghost"
                    className="text-white hover:bg-white/10 rounded-full"
                    onClick={() => setShareOpen(true)}
                >
                    <Share2 className="w-5 h-5" />
                </Button>
            </div>

            {/* Products - Snap Scroll Container */}
            {hasProducts ? (
                <>
                    <div
                        ref={scrollContainerRef}
                        onScroll={handleScroll}
                        className="h-full w-full overflow-y-auto snap-y snap-mandatory scroll-smooth"
                        style={{ scrollSnapType: 'y mandatory' }}
                    >
                        {store.products.map((product, index) => (
                            <div
                                key={product._id}
                                className="h-screen w-full snap-start snap-always relative flex flex-col"
                                style={{ scrollSnapAlign: 'start' }}
                            >
                                {/* Product Image - Full Screen Background */}
                                <div className="absolute inset-0">
                                    {product.image_url ? (
                                        <img
                                            src={getImageUrl(product.image_url)}
                                            alt={product.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-purple-900 via-gray-900 to-black flex items-center justify-center">
                                            <ShoppingBag className="w-24 h-24 text-white/20" />
                                        </div>
                                    )}
                                    {/* Dark Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                                </div>

                                {/* Product Info - Bottom Overlay */}
                                <div className="absolute bottom-0 left-0 right-0 p-6 pb-24 z-10">
                                    <div className="max-w-lg mx-auto">
                                        {/* Price Badge */}
                                        <div className="inline-block bg-white text-black text-lg font-bold px-4 py-1 rounded-full mb-3">
                                            ${product.price}
                                        </div>

                                        {/* Title */}
                                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                                            {product.title}
                                        </h2>

                                        {/* Description */}
                                        {product.description && (
                                            <p className="text-white/80 text-sm md:text-base line-clamp-3 mb-4">
                                                {product.description}
                                            </p>
                                        )}

                                        {/* CTA Buttons */}
                                        <div className="flex gap-3">
                                            <Button
                                                size="lg"
                                                className="flex-1 bg-white text-black hover:bg-white/90 font-bold rounded-full"
                                                onClick={() => setSelectedProduct(product)}
                                            >
                                                Buy Now
                                            </Button>
                                            <Button
                                                size="lg"
                                                variant="outline"
                                                className="border-white/30 text-white hover:bg-white/10 rounded-full"
                                                onClick={() => setSelectedProduct(product)}
                                            >
                                                <MessageCircle className="w-5 h-5" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Scroll Hint (only on first product) */}
                                {index === 0 && store.products.length > 1 && (
                                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 animate-bounce">
                                        <ChevronDown className="w-6 h-6 text-white/60" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Product Indicators */}
                    {store.products.length > 1 && (
                        <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2">
                            {store.products.map((_, index) => (
                                <Button
                                    key={index}
                                    variant="ghost"
                                    onClick={() => scrollToProduct(index)}
                                    className={`w-2 h-2 p-0 rounded-full transition-all hover:bg-white/80 ${currentProductIndex === index
                                        ? 'bg-white scale-125'
                                        : 'bg-white/30 hover:bg-white/60'
                                        }`}
                                />
                            ))}
                        </div>
                    )}

                    {/* Navigation Arrows */}
                    <div className="fixed right-4 bottom-6 z-50 flex flex-col gap-2">
                        <Button
                            size="icon"
                            variant="ghost"
                            className="text-white/60 hover:text-white hover:bg-white/10 rounded-full"
                            disabled={currentProductIndex === 0}
                            onClick={() => scrollToProduct(currentProductIndex - 1)}
                        >
                            <ChevronUp className="w-5 h-5" />
                        </Button>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="text-white/60 hover:text-white hover:bg-white/10 rounded-full"
                            disabled={currentProductIndex === store.products.length - 1}
                            onClick={() => scrollToProduct(currentProductIndex + 1)}
                        >
                            <ChevronDown className="w-5 h-5" />
                        </Button>
                    </div>
                </>
            ) : (
                /* No Products State */
                <div className="h-full flex flex-col items-center justify-center text-center px-4">
                    <ShoppingBag className="w-16 h-16 text-white/20 mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No products yet</h3>
                    <p className="text-white/60 max-w-xs">
                        This store doesn't have any products available at the moment.
                    </p>
                    <Button
                        variant="outline"
                        className="mt-6 border-white/20 text-white hover:bg-white/10"
                        onClick={() => navigate(`/${store.username}`)}
                    >
                        View Profile
                    </Button>
                </div>
            )}

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
                    />
                </>
            )}
        </div>
    );
};

export default PublicStore;
