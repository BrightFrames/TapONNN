import { useState, useEffect } from 'react';
import LinktreeLayout from '@/layouts/LinktreeLayout';
import { Loader2, Heart, ExternalLink, ShoppingBag } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

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

        console.log('handleLike called for product:', productId);
        console.log('User:', user);

        if (!user) {
            console.log('No user, redirecting to login');
            // Redirect to login page
            window.location.href = '/login';
            return;
        }

        const isLiked = likedProductIds.has(productId);
        const token = localStorage.getItem('auth_token');
        console.log('Is liked:', isLiked);
        console.log('Token:', token ? 'exists' : 'not found');

        try {
            const url = `${API_URL}/products/${productId}/like`;
            console.log('Making request to:', url);
            console.log('Method:', isLiked ? 'DELETE' : 'POST');

            const response = await fetch(url, {
                method: isLiked ? 'DELETE' : 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('Success response:', data);
                const newLikedIds = new Set(likedProductIds);
                if (isLiked) {
                    newLikedIds.delete(productId);
                } else {
                    newLikedIds.add(productId);
                }
                setLikedProductIds(newLikedIds);
                console.log('Updated liked IDs:', Array.from(newLikedIds));
            } else {
                const errorData = await response.json();
                console.error('Like error response:', errorData);
                alert(`Error: ${errorData.message || 'Failed to like product'}`);
            }
        } catch (error) {
            console.error('Error toggling like:', error);
            alert('Failed to connect to server');
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
                <div className="flex items-center justify-center min-h-screen">
                    <Loader2 className="w-8 h-8 animate-spin text-zinc-600" />
                </div>
            </LinktreeLayout>
        );
    }

    return (
        <LinktreeLayout>
            <div className="min-h-screen p-4 md:p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold mb-2 text-white">Explore</h1>
                        <p className="text-zinc-500">
                            Discover amazing products from creators
                        </p>
                    </div>

                    {/* Error State */}
                    {error && (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="text-red-500 mb-2">⚠️ {error}</div>
                            <button
                                onClick={() => window.location.reload()}
                                className="text-sm text-blue-500 hover:underline"
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    {/* Empty State */}
                    {!error && products.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-zinc-600">
                            <ShoppingBag className="w-16 h-16 mb-4 opacity-20" />
                            <p className="text-lg font-medium">No products yet</p>
                            <p className="text-sm mt-1">Check back soon for amazing products from creators!</p>
                        </div>
                    )}

                    {/* Instagram-style Grid */}
                    {!error && products.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1">
                            {products.map((product) => {
                                const isLiked = likedProductIds.has(product._id);

                                return (
                                    <div
                                        key={product._id}
                                        className="relative aspect-square cursor-pointer group overflow-hidden bg-zinc-900"
                                        onClick={() => handleProductClick(product)}
                                    >
                                        {/* Product Image */}
                                        {product.image_url ? (
                                            <img
                                                src={product.image_url}
                                                alt={product.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
                                                <span className="text-4xl opacity-20">✨</span>
                                            </div>
                                        )}

                                        {/* Hover Overlay */}
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-4">
                                            <div className="flex items-center gap-6 text-white">
                                                <button
                                                    onClick={(e) => handleLike(product._id, e)}
                                                    className="flex items-center gap-2 hover:scale-110 transition-transform"
                                                >
                                                    <Heart
                                                        className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`}
                                                    />
                                                    <span className="font-bold text-sm">
                                                        {isLiked ? 'Liked' : 'Like'}
                                                    </span>
                                                </button>
                                                <div className="flex items-center gap-2">
                                                    <ExternalLink className="w-5 h-5" />
                                                    <span className="font-bold text-sm">View</span>
                                                </div>
                                            </div>

                                            {/* Product Title */}
                                            <div className="text-white text-center px-4">
                                                <p className="font-semibold text-sm line-clamp-1">{product.title}</p>
                                                {product.price && (
                                                    <p className="text-xs mt-1 opacity-90">₹{product.price}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Like indicator - Top Right */}
                                        {isLiked && (
                                            <div className="absolute top-2 right-2 z-10">
                                                <Heart className="w-6 h-6 fill-red-500 text-red-500 drop-shadow-lg" />
                                            </div>
                                        )}

                                        {/* Owner Info Badge - Bottom Left */}
                                        <div className="absolute bottom-2 left-2 flex items-center gap-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full z-10">
                                            {product.owner_avatar ? (
                                                <img
                                                    src={product.owner_avatar}
                                                    alt={product.owner_name || 'User'}
                                                    className="w-5 h-5 rounded-full object-cover border border-white/20"
                                                />
                                            ) : (
                                                <div className="w-5 h-5 rounded-full bg-zinc-700 flex items-center justify-center text-white text-[10px] font-bold border border-white/20">
                                                    {product.owner_name?.[0]?.toUpperCase() || 'U'}
                                                </div>
                                            )}
                                            <span className="text-white text-[11px] font-medium">
                                                {product.owner_name || product.owner_username || 'User'}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </LinktreeLayout>
    );
};

export default Explore;
