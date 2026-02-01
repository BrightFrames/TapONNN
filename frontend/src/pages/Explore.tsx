import { useState, useEffect } from 'react';
import LinktreeLayout from '@/layouts/LinktreeLayout';
import { Loader2, Heart, ExternalLink, ShoppingBag } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";

interface Product {
    _id: string;
    title: string;
    description?: string;
    price: number;
    image_url?: string;
    file_url?: string;
    product_type: string;
    owner_name?: string;
    owner_username?: string;
    owner_avatar?: string;
    store_username?: string;
}

const Explore = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [likedProductIds, setLikedProductIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch(`${API_URL}/explore/products`);
                if (response.ok) {
                    const data = await response.json();
                    console.log('Fetched products:', data);
                    setProducts(data);
                } else {
                    const errorData = await response.json();
                    setError(errorData.message || 'Failed to load products');
                }
            } catch (error) {
                console.error('Error fetching products:', error);
                setError('Failed to connect to server');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // Fetch user's liked products
    useEffect(() => {
        const fetchLikedProducts = async () => {
            if (!user) return;

            try {
                const token = localStorage.getItem('auth_token');
                const response = await fetch(`${API_URL}/products/liked`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setLikedProductIds(new Set(data.likedProductIds || []));
                }
            } catch (error) {
                console.error('Error fetching liked products:', error);
            }
        };

        fetchLikedProducts();
    }, [user]);

    const handleLike = async (productId: string, e: React.MouseEvent) => {
        e.stopPropagation();

        if (!user) {
            window.location.href = '/login';
            return;
        }

        const isLiked = likedProductIds.has(productId);
        const token = localStorage.getItem('auth_token');

        // Optimistic Update
        const newLikedIds = new Set(likedProductIds);
        if (isLiked) {
            newLikedIds.delete(productId);
        } else {
            newLikedIds.add(productId);
        }
        setLikedProductIds(newLikedIds);

        try {
            const url = `${API_URL}/products/${productId}/like`;
            const response = await fetch(url, {
                method: isLiked ? 'DELETE' : 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                // Revert on error
                setLikedProductIds(likedProductIds);
                const errorData = await response.json();
                console.error('Like error response:', errorData);
            }
        } catch (error) {
            console.error('Error toggling like:', error);
            setLikedProductIds(likedProductIds); // Revert
        }
    };

    const handleProductClick = (product: Product) => {
        const username = product.store_username || product.owner_username;
        if (username) {
            window.open(`/${username}`, '_blank');
        }
    };

    if (loading) {
        return (
            <LinktreeLayout>
                <div className="flex items-center justify-center min-h-screen bg-black">
                    <Loader2 className="w-8 h-8 animate-spin text-white" />
                </div>
            </LinktreeLayout>
        );
    }

    return (
        <LinktreeLayout>
            <div className="min-h-screen bg-black text-white p-4 md:p-8">
                {/* Pinterest-style Header */}
                <div className="max-w-[1600px] mx-auto mb-8 flex flex-col md:flex-row gap-6 items-center justify-between sticky top-0 z-30 bg-black/80 backdrop-blur-xl py-4 transition-all">
                    <div className="flex-1 w-full md:w-auto">
                        <div className="relative group">
                            <input
                                type="text"
                                placeholder="Search for ideas..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-zinc-900 text-white rounded-full pl-12 pr-4 py-3.5 border-none focus:ring-2 focus:ring-white/20 transition-all font-medium text-base shadow-sm group-hover:bg-zinc-800"
                            />
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-hover:text-white transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                            </div>
                        </div>
                    </div>
                    {/* Categories Pills */}
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide w-full md:w-auto mask-linear-fade">
                        {['All', 'Design', 'Technology', 'Art', 'Fashion', 'Home', 'Travel'].map((cat) => (
                            <Button
                                key={cat}
                                variant="outline"
                                className="px-5 py-2.5 h-auto rounded-full bg-zinc-900 hover:bg-white hover:text-black font-semibold transition-all whitespace-nowrap text-sm border-zinc-800 hover:border-transparent text-white"
                            >
                                {cat}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Error State */}
                {error && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="text-red-500 mb-2 font-medium">⚠️ {error}</div>
                        <Button
                            onClick={() => window.location.reload()}
                            variant="secondary"
                            className="px-6 py-2 bg-zinc-800 rounded-full text-sm font-semibold hover:bg-zinc-700 transition-colors text-white h-auto"
                        >
                            Retry
                        </Button>
                    </div>
                )}

                {/* Masonry Grid */}
                {!error && products.length > 0 && (
                    <div className="max-w-[1600px] mx-auto columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4 px-2">
                        {products
                            .filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()))
                            .map((product) => {
                                const isLiked = likedProductIds.has(product._id);
                                return (
                                    <div key={product._id} className="break-inside-avoid relative group mb-4 rounded-3xl overflow-hidden bg-zinc-900 hover:shadow-2xl hover:shadow-white/5 transition-all duration-300 cursor-zoom-in">
                                        {/* Image */}
                                        <div className="relative w-full" onClick={() => handleProductClick(product)}>
                                            {product.image_url ? (
                                                <img
                                                    src={product.image_url}
                                                    alt={product.title}
                                                    className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700 ease-out"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="w-full aspect-[4/5] flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
                                                    <span className="text-4xl opacity-20">✨</span>
                                                </div>
                                            )}
                                            {/* Dark Gradient Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                                        </div>

                                        {/* Hover Controls */}
                                        <div className="absolute inset-x-0 top-0 p-4 flex justify-between items-start opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                                            <p className="text-xs font-semibold text-white/70 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                                                {product.product_type === 'digital_product' ? 'Digital' : 'Physical'}
                                            </p>
                                            <Button
                                                onClick={(e) => handleLike(product._id, e)}
                                                className={`px-4 py-3 h-auto rounded-full font-bold text-sm transition-all transform hover:scale-105 active:scale-95 shadow-lg flex items-center gap-2 ${isLiked
                                                    ? 'bg-black text-white hover:bg-zinc-900'
                                                    : 'bg-[#E60023] text-white hover:bg-[#ad081b]'
                                                    }`}
                                            >
                                                {isLiked ? 'Saved' : 'Save'}
                                            </Button>
                                        </div>

                                        {/* Bottom Info */}
                                        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
                                            <div className="flex items-center justify-between gap-3">
                                                <a
                                                    href={product.file_url || '#'}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="flex-1 bg-white/90 hover:bg-white text-black font-bold py-2.5 px-4 rounded-full text-sm text-center shadow-lg transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                    Visit
                                                </a>
                                                <div className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 cursor-pointer transition-colors border border-white/10" title="More options">
                                                    <div className="flex gap-0.5">
                                                        <div className="w-1 h-1 bg-white rounded-full"></div>
                                                        <div className="w-1 h-1 bg-white rounded-full"></div>
                                                        <div className="w-1 h-1 bg-white rounded-full"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                )}

                {/* Empty State */}
                {!error && products.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-32 text-zinc-500">
                        <ShoppingBag className="w-20 h-20 mb-6 opacity-20" />
                        <p className="text-xl font-bold text-zinc-300">Nothing here yet</p>
                        <p className="text-base mt-2">Check back later for fresh ideas!</p>
                    </div>
                )}
            </div>
        </LinktreeLayout>
    );
};

export default Explore;
