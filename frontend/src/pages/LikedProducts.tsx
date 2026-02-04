import { useState, useEffect } from 'react';
import LinktreeLayout from '@/layouts/LinktreeLayout';
import { Loader2, Heart, ExternalLink, ShoppingBag, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Product {
    _id: string;
    title: string;
    description?: string;
    price: number;
    image_url?: string;
    product_type: string;
}

const LikedProducts = () => {
    const { user } = useAuth();
    const [likedProducts, setLikedProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

    useEffect(() => {
        const fetchLikedProducts = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                const token = localStorage.getItem('auth_token');
                const response = await fetch(`${API_URL}/products/liked`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setLikedProducts(data.likedProducts || []);
                }
            } catch (error) {
                console.error('Error fetching liked products:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLikedProducts();
    }, [user]);

    const handleUnlike = async (productId: string) => {
        const token = localStorage.getItem('auth_token');

        try {
            const response = await fetch(`${API_URL}/products/${productId}/like`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                setLikedProducts(prev => prev.filter(p => p._id !== productId));
            }
        } catch (error) {
            console.error('Error unliking product:', error);
        }
    };

    if (loading) {
        return (
            <LinktreeLayout>
                <div className="flex items-center justify-center min-h-screen bg-white dark:bg-black">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-zinc-400" />
                </div>
            </LinktreeLayout>
        );
    }

    return (
        <LinktreeLayout>
            <div className="min-h-screen bg-gray-50 dark:bg-black p-4 md:p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white flex items-center gap-3">
                            <Heart className="w-8 h-8 fill-red-500 text-red-500" />
                            Liked Products
                        </h1>
                        <p className="text-gray-500 dark:text-zinc-400">
                            Products you've saved for later
                        </p>
                    </div>

                    {/* Empty State */}
                    {likedProducts.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-zinc-500">
                            <Heart className="w-16 h-16 mb-4 opacity-20" />
                            <p className="text-lg font-medium text-gray-900 dark:text-zinc-300">No liked products yet</p>
                            <p className="text-sm mt-1">Explore and like products to save them here!</p>
                        </div>
                    )}

                    {/* Grid */}
                    {likedProducts.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {likedProducts.map((product) => (
                                <div
                                    key={product._id}
                                    className="relative group overflow-hidden bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm hover:shadow-xl dark:hover:shadow-lg dark:hover:shadow-white/5 transition-all duration-300"
                                >
                                    {/* Product Image */}
                                    <div className="aspect-square overflow-hidden bg-gray-100 dark:bg-zinc-800">
                                        {product.image_url ? (
                                            <img
                                                src={product.image_url}
                                                alt={product.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-zinc-800 dark:to-zinc-900">
                                                <span className="text-4xl opacity-30 dark:opacity-20 grayscale brightness-110">✨</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Product Info */}
                                    <div className="p-4">
                                        <h3 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-1 mb-1">
                                            {product.title}
                                        </h3>
                                        {product.price && (
                                            <p className="text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                                                ₹{product.price}
                                            </p>
                                        )}
                                        {product.description && (
                                            <p className="text-xs text-gray-500 dark:text-zinc-500 line-clamp-2">
                                                {product.description}
                                            </p>
                                        )}
                                    </div>

                                    {/* Unlike Button */}
                                    <button
                                        onClick={() => handleUnlike(product._id)}
                                        className="absolute top-2 right-2 p-2 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </LinktreeLayout>
    );
};

export default LikedProducts;
