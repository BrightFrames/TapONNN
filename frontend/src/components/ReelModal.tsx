import { useState, useEffect } from 'react';
import { X, Heart, ExternalLink, ChevronUp, ChevronDown, Share2, MessageCircle, ShoppingBag, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

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

interface ReelModalProps {
    isOpen: boolean;
    onClose: () => void;
    products: Product[];
    initialIndex: number;
    likedProductIds: Set<string>;
    onLike: (productId: string) => void;
    onEnquire?: (product: Product) => void;
    onBuy?: (product: Product) => void;
}

const ReelModal = ({ isOpen, onClose, products, initialIndex, likedProductIds, onLike, onEnquire, onBuy }: ReelModalProps) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);

    const currentProduct = products[currentIndex];
    const isLiked = currentProduct ? likedProductIds.has(currentProduct._id) : false;

    // Reset index when modal opens
    useEffect(() => {
        if (isOpen) {
            setCurrentIndex(initialIndex);
        }
    }, [isOpen, initialIndex]);

    // Keyboard navigation
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                goToPrevious();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                goToNext();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, currentIndex]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const goToNext = () => {
        if (currentIndex < products.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const goToPrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    // Touch handlers for swipe
    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStart(e.targetTouches[0].clientY);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientY);
    };

    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return;

        const distance = touchStart - touchEnd;
        const isSwipeUp = distance > 50;
        const isSwipeDown = distance < -50;

        if (isSwipeUp) {
            goToNext();
        } else if (isSwipeDown) {
            goToPrevious();
        }

        setTouchStart(0);
        setTouchEnd(0);
    };

    const handleVisitProfile = () => {
        const storeName = currentProduct.store_username || currentProduct.owner_username;
        if (storeName) {
            window.open(`/s/${storeName}`, '_blank');
        }
    };

    const handleLike = () => {
        if (currentProduct) {
            onLike(currentProduct._id);
        }
    };

    if (!isOpen || !currentProduct) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black animate-in fade-in duration-300">
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/70 transition-colors border border-white/10"
            >
                <X className="w-5 h-5" />
            </button>

            {/* Navigation Arrows - Desktop */}
            <div className="hidden md:block">
                {currentIndex > 0 && (
                    <button
                        onClick={goToPrevious}
                        className="absolute top-1/2 left-4 -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/70 transition-colors border border-white/10"
                    >
                        <ChevronUp className="w-6 h-6" />
                    </button>
                )}
                {currentIndex < products.length - 1 && (
                    <button
                        onClick={goToNext}
                        className="absolute top-1/2 right-4 -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/70 transition-colors border border-white/10"
                    >
                        <ChevronDown className="w-6 h-6" />
                    </button>
                )}
            </div>

            {/* Main Content */}
            <div
                className="h-full w-full flex items-center justify-center animate-in slide-in-from-bottom duration-500"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {/* Product Image */}
                <div className="relative w-full h-full flex items-center justify-center">
                    {currentProduct.image_url ? (
                        <img
                            src={currentProduct.image_url}
                            alt={currentProduct.title}
                            className="max-w-full max-h-full object-contain"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                            <span className="text-6xl opacity-20">✨</span>
                        </div>
                    )}

                    {/* Right Side Action Icons */}
                    <div className="absolute right-4 bottom-32 flex flex-col gap-4 z-40">
                        {/* Like Button */}
                        <button
                            onClick={handleLike}
                            className="flex flex-col items-center gap-1 group"
                        >
                            <div className={cn(
                                "w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md border transition-all",
                                isLiked
                                    ? "bg-red-600 text-white border-red-600"
                                    : "bg-black/50 text-white border-white/20 hover:bg-white/20"
                            )}>
                                <Heart className={cn("w-6 h-6", isLiked && "fill-current")} />
                            </div>
                            <span className="text-white text-xs font-medium drop-shadow-lg">
                                {isLiked ? 'Liked' : 'Like'}
                            </span>
                        </button>

                        {/* Visit Store Button */}
                        <button
                            onClick={handleVisitProfile}
                            className="flex flex-col items-center gap-1 group"
                        >
                            <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all">
                                <Store className="w-6 h-6" />
                            </div>
                            <span className="text-white text-xs font-medium drop-shadow-lg">Visit</span>
                        </button>
                    </div>

                    {/* Bottom Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-6 pb-8 animate-in slide-in-from-bottom duration-700 delay-200">
                        {/* Product Info */}
                        <div className="mb-4">
                            <h2 className="text-2xl font-bold text-white mb-2">{currentProduct.title}</h2>
                            {currentProduct.description && (
                                <p className="text-white/80 text-sm mb-3 line-clamp-2">{currentProduct.description}</p>
                            )}
                            <div className="flex items-center gap-3">
                                <span className="text-2xl font-bold text-white">₹{currentProduct.price}</span>
                                <span className="text-xs text-white/60 bg-white/10 px-2 py-1 rounded-full">
                                    {currentProduct.product_type === 'digital_product' ? 'Digital' : 'Physical'}
                                </span>
                            </div>
                        </div>

                        {/* Owner Profile Card */}
                        <div className="flex items-center gap-3 mb-4">
                            <Avatar className="w-10 h-10 border-2 border-white/20">
                                <AvatarImage src={currentProduct.owner_avatar} />
                                <AvatarFallback className="bg-zinc-800 text-white text-sm">
                                    {currentProduct.owner_name?.[0] || 'U'}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-white font-semibold text-sm">{currentProduct.owner_name || 'Unknown'}</p>
                                <p className="text-white/60 text-xs">@{currentProduct.owner_username || currentProduct.store_username}</p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 justify-start">
                            {onEnquire && (
                                <Button
                                    onClick={() => onEnquire(currentProduct)}
                                    className="h-10 px-6 rounded-full font-semibold text-sm bg-white/10 text-white hover:bg-white/20 backdrop-blur-md border border-white/20"
                                >
                                    <MessageCircle className="w-4 h-4 mr-2" />
                                    Enquire
                                </Button>
                            )}
                            {onBuy && (
                                <Button
                                    onClick={() => onBuy(currentProduct)}
                                    className="h-10 px-6 rounded-full font-semibold text-sm bg-white text-black hover:bg-white/90"
                                >
                                    <ShoppingBag className="w-4 h-4 mr-2" />
                                    Buy Now
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Progress Indicator */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex gap-1">
                {products.map((_, index) => (
                    <div
                        key={index}
                        className={cn(
                            "h-1 rounded-full transition-all",
                            index === currentIndex ? "w-8 bg-white" : "w-1 bg-white/30"
                        )}
                    />
                ))}
            </div>
        </div>
    );
};

export default ReelModal;
