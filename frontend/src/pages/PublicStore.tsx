import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { templates } from "@/data/templates";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Store, Share2, ShoppingBag } from "lucide-react";
import ShareModal from "@/components/ShareModal";

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
}

const PublicStore = () => {
    const { username } = useParams();
    const [shareOpen, setShareOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [store, setStore] = useState<StoreProfile | null>(null);
    const [notFound, setNotFound] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

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
    }, [username]);

    if (loading) {
        return (
            <div className="min-h-screen w-full flex flex-col items-center py-16 px-6 bg-background space-y-8">
                <div className="flex flex-col items-center space-y-4">
                    <Skeleton className="h-24 w-24 rounded-full" />
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <div className="w-full max-w-2xl grid grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-48 w-full rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    if (notFound || !store) {
        return (
            <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background text-center px-4">
                <div className="bg-muted p-4 rounded-full mb-4">
                    <Store className="w-8 h-8 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight mb-2">Store not found</h2>
                <p className="text-muted-foreground mb-6">This store doesn't exist or isn't published yet.</p>
                <Button variant="default" onClick={() => window.location.href = '/'}>Go Home</Button>
            </div>
        );
    }

    // Determine Theme
    const template = templates.find(t => t.id === store.selected_theme) || templates[0];

    const bgStyle = template.bgImage
        ? { backgroundImage: `url(${template.bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
        : {};

    const storeUrl = `${window.location.origin}/${store.username}/store`;

    return (
        <div
            className={`min-h-screen w-full flex flex-col items-center py-16 px-6 transition-colors duration-500 ${template.bgClass || 'bg-gray-100'}`}
            style={bgStyle}
        >
            {/* Overlay if image background */}
            {template.bgImage && <div className="absolute inset-0 bg-black/30 fixed pointer-events-none" />}

            {/* Share Button (Floating) */}
            <div className="fixed top-6 right-6 z-50">
                <Button
                    size="icon"
                    variant="secondary"
                    className="rounded-full shadow-lg bg-white/20 backdrop-blur-md border border-white/20 hover:bg-white/40 text-current"
                    onClick={() => setShareOpen(true)}
                >
                    <Share2 className="w-4 h-4" />
                </Button>
            </div>

            <div className="z-10 w-full max-w-2xl mx-auto flex flex-col items-center">
                {/* Store Header */}
                <div className="flex flex-col items-center mb-8 text-center">
                    <Avatar className="w-24 h-24 border-4 border-white/20 shadow-xl mb-4">
                        <AvatarImage src={store.avatar_url} />
                        <AvatarFallback className="bg-gray-400 text-white text-3xl font-bold">
                            {store.full_name?.[0]?.toUpperCase() || "S"}
                        </AvatarFallback>
                    </Avatar>

                    <div className="flex items-center gap-2 mb-2">
                        <ShoppingBag className={`w-5 h-5 ${template.textColor}`} />
                        <h1 className={`text-2xl font-bold tracking-tight ${template.textColor}`}>
                            @{store.username}'s Store
                        </h1>
                    </div>
                    {store.bio && (
                        <p className={`text-sm opacity-90 max-w-sm ${template.textColor}`}>
                            {store.bio}
                        </p>
                    )}
                </div>

                {/* Products Grid */}
                {store.products.length > 0 ? (
                    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                        {store.products.map((product) => (
                            <div key={product._id} className="bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-[1.02]">
                                <div className="w-full h-40 bg-gray-100 rounded-lg overflow-hidden mb-3">
                                    {product.image_url ? (
                                        <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-purple-100 to-pink-100">
                                            🛍️
                                        </div>
                                    )}
                                </div>
                                <h4 className="font-semibold text-gray-900 truncate">{product.title}</h4>
                                {product.description && (
                                    <p className="text-sm text-gray-500 line-clamp-2 mb-2">{product.description}</p>
                                )}
                                <div className="flex justify-between items-center mt-2">
                                    <span className="font-bold text-lg text-primary">${product.price}</span>
                                    <Button size="sm" className="rounded-full bg-black text-white hover:bg-black/80">
                                        Buy Now
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={`text-center py-16 opacity-70 ${template.textColor}`}>
                        <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg">No products available yet.</p>
                    </div>
                )}

                {/* Back to Profile Link */}
                <div className="mt-12 text-center">
                    <a
                        href={`/${store.username}`}
                        className={`text-sm underline underline-offset-4 hover:opacity-80 transition-opacity ${template.textColor}`}
                    >
                        ← View full profile
                    </a>
                </div>
            </div>

            {store && (
                <ShareModal
                    open={shareOpen}
                    onOpenChange={setShareOpen}
                    username={store.username}
                    url={storeUrl}
                    type="store"
                />
            )}
        </div>
    );
};

export default PublicStore;
