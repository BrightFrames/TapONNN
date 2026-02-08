import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Share2, ArrowRight, Sparkles, AlertCircle, ExternalLink, Mail, Phone, ShoppingBag, ChevronLeft, Star, Heart, Upload, Instagram, Twitter, Facebook, Linkedin, Youtube, Github, Music, MessageCircle, Send, Globe, Info, CheckCircle, AlertTriangle, PartyPopper, Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getIconForThumbnail } from "@/utils/socialIcons";
import { getImageUrl } from "@/utils/imageUtils";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { StoreUpdates } from "@/components/StoreUpdates";

// Helper function to get favicon URL from a link
const getFaviconUrl = (url: string): string | null => {
    if (!url) return null;
    try {
        // Add protocol if missing
        let fullUrl = url;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            fullUrl = 'https://' + url;
        }
        const urlObj = new URL(fullUrl);
        const domain = urlObj.hostname;
        // Use Google's favicon service for reliable favicon fetching
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch {
        return null;
    }
};

// Favicon component with fallback
const Favicon = ({ url, fallback, className, style }: { 
    url: string; 
    fallback: React.ReactNode; 
    className?: string;
    style?: React.CSSProperties;
}) => {
    const [error, setError] = useState(false);
    const faviconUrl = getFaviconUrl(url);
    
    if (error || !faviconUrl) {
        return <>{fallback}</>;
    }
    
    return (
        <img 
            src={faviconUrl} 
            alt="" 
            className={className}
            style={style}
            onError={() => setError(true)}
        />
    );
};

// Social icons mapping for preview
const socialIconMap: Record<string, any> = {
    instagram: Instagram,
    twitter: Twitter,
    facebook: Facebook,
    linkedin: Linkedin,
    youtube: Youtube,
    github: Github,
    tiktok: Music,
    whatsapp: MessageCircle,
    telegram: Send,
    website: Globe,
};

interface ProfilePreviewProps {
    blocks?: any[];
    theme?: any;
    products?: any[];
    mode?: 'personal' | 'store';
    showStoreTab?: boolean;
}

const ProfilePreview = ({ blocks = [], theme, products = [], mode = 'personal', showStoreTab = false }: ProfilePreviewProps) => {

    const { user } = useAuth();
    // Only show store tab if explicitly passed as true
    const shouldShowStoreTab = showStoreTab === true;
    const username = user?.username || "user";
    const displayName = user?.name || "Display Name";
    const userInitial = displayName[0]?.toUpperCase() || "U";
    const avatarUrl = getImageUrl(user?.avatar);
    const coverType = theme?.coverType || user?.design_config?.coverType || 'none';
    const coverUrl = getImageUrl(theme?.coverUrl || user?.design_config?.coverUrl);
    const coverColor = theme?.coverColor || user?.design_config?.coverColor;
    const coverYoutubeUrl = theme?.coverYoutubeUrl || user?.design_config?.coverYoutubeUrl;

    // Extract YouTube video ID from URL
    const getYouTubeVideoId = (url: string) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const youtubeVideoId = (coverType === 'youtube' && coverYoutubeUrl) ? getYouTubeVideoId(coverYoutubeUrl) : null;
    const youtubeThumbUrl = youtubeVideoId ? `https://img.youtube.com/vi/${youtubeVideoId}/hqdefault.jpg` : '';
    const showCoverImage = (coverType === 'image' || coverType === 'video') && coverUrl;
    const showCoverColor = coverType === 'color' || (coverType === 'none' && !showCoverImage && !youtubeVideoId);

    const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
    const [likedProductIds, setLikedProductIds] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [scrollProgress, setScrollProgress] = useState(0);
    const [activeTab, setActiveTab] = useState<'personal' | 'store'>(mode || 'personal');
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (mode) setActiveTab(mode);
    }, [mode]);

    // Handle scroll for animations
    const handleScroll = () => {
        if (!scrollContainerRef.current) return;
        const scrollTop = scrollContainerRef.current.scrollTop;
        // Calculate progress (0 to 1) over first 100px
        const progress = Math.min(scrollTop / 120, 1);
        setScrollProgress(progress);
    };

    const isScrolled = scrollProgress > 0.8;

    const bgColor = theme?.backgroundColor || "#fafafa"; // Zinc-50 equivalent
    const bgType = theme?.bgType || 'color';
    const bgImageUrl = getImageUrl(theme?.bgImageUrl || '');
    const cardBgType = theme?.cardBgType || 'color';
    const cardImageUrl = getImageUrl(theme?.cardImageUrl || '');
    const buttonColor = theme?.buttonColor || "#000000";
    const buttonTextColor = theme?.buttonTextColor || "#ffffff";
    const blockStyle = theme?.blockStyle || 'rounded'; // rounded, square, fully_rounded
    const linkBlocksColor = theme?.linkBlocksColor; // Global color for link blocks
    const featuredProducts = (products || []).filter(p => p.is_featured);
    const filteredProducts = (products || []).filter(p => 
        p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    // Smart card color - use user selection or fallback
    const hasCoverImage = !!coverUrl;
    const hasCoverBackdrop = hasCoverImage || !!youtubeVideoId;
    const userCardColor = theme?.cardColor;
    const cardColor = userCardColor || (hasCoverImage 
        ? "rgba(255,255,255,0.95)" // Glass effect fallback
        : "#ffffff");
    const cardSurfaceColor = (cardBgType === 'color' && userCardColor) ? userCardColor : undefined;
    
    // Text color - respect user selection or use dark text for glass effect
    const textColor = theme?.textColor || (hasCoverImage ? "#18181b" : "#18181b");

    // Helper to determine if a color is light or dark
    const isColorLight = (color: string) => {
        if (!color) return true; // Default to light
        if (color === 'transparent') return true;
        let hex = color.replace('#', '');
        
        // Handle gradients - extract the first color
        if (color.includes('gradient') || color.includes('linear')) {
            const match = color.match(/#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})/);
            if (match) hex = match[1];
            else return false;
        }
        
        if (!/^[a-fA-F0-9]{3,6}$/.test(hex)) return true;
        
        // Handle short hex (e.g., #fff)
        const fullHex = hex.length === 3 ? hex.split('').map(c => c + c).join('') : hex;
        const r = parseInt(fullHex.substring(0, 2), 16);
        const g = parseInt(fullHex.substring(2, 4), 16);
        const b = parseInt(fullHex.substring(4, 6), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness > 128;
    };

    // Dark theme detection - check the card color
    const cardIsLight = isColorLight(cardColor);
    const isDarkTheme = !cardIsLight; // When card is dark, use light text/borders

    const renderProductList = () => (
        <div className="space-y-6 pb-24 animate-in slide-in-from-bottom duration-700 fade-in fill-mode-both" style={{ animationDelay: '100ms' }}>
            {featuredProducts.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="text-sm font-black tracking-tight flex items-center gap-2" style={{ color: textColor }}>
                            <Sparkles className="w-3.5 h-3.5" style={{ color: isDarkTheme ? '#ffffff' : '#000000' }} />
                            Top Picks
                        </h2>
                    </div>
                    <div className="flex flex-nowrap overflow-x-auto gap-4 pb-4 scrollbar-hide snap-x px-1">
                        {featuredProducts.map((product) => (
                            <div
                                key={product._id}
                                onClick={() => setSelectedProduct(product)}
                                className="min-w-[220px] snap-center rounded-[2rem] overflow-hidden border relative flex flex-col group transition-all active:scale-[0.98] shadow-xl backdrop-blur-xl"
                                style={{ 
                                    backgroundColor: cardSurfaceColor || (isDarkTheme ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)'),
                                    borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0,0,0,0.06)',
                                    boxShadow: isDarkTheme ? '0 20px 50px rgba(0,0,0,0.5)' : '0 10px 40px rgba(0,0,0,0.04)'
                                }}
                            >
                                {product.badge && (
                                    <div className="absolute top-4 right-4 z-20 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm text-white"
                                        style={{ backgroundColor: buttonColor }}
                                    >
                                        {product.badge}
                                    </div>
                                )}
                                <div className="aspect-square relative p-6 flex items-center justify-center" style={{ backgroundColor: isDarkTheme ? 'rgba(255, 255, 255, 0.02)' : 'transparent' }}>
                                    {product.image_url ? (
                                        <img src={product.image_url} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-4xl">🛍️</div>
                                    )}
                                </div>
                                <div className="px-5 pb-6 pt-1 flex flex-col">
                                    <h3 className="text-base font-bold leading-tight line-clamp-2 mb-2" style={{ color: textColor }}>{product.title}</h3>
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="text-xs font-semibold opacity-50" style={{ color: textColor }}>Price:</span>
                                        <span className="text-sm font-black" style={{ color: textColor }}>₹{product.price}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Button 
                                            variant="outline"
                                            className="flex-1 rounded-2xl h-10 font-bold text-xs transition-all"
                                            style={{ 
                                                borderColor: isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                                                backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'white',
                                                color: textColor
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                            }}
                                        >
                                            Enquire
                                        </Button>
                                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center border transition-colors"
                                            style={{ 
                                                borderColor: isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                                                backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'white'
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setLikedProductIds(prev => {
                                                    const next = new Set(prev);
                                                    if (next.has(product._id)) next.delete(product._id);
                                                    else next.add(product._id);
                                                    return next;
                                                });
                                            }}
                                        >
                                            <Heart className={cn("w-4 h-4 transition-all", likedProductIds.has(product._id) ? "fill-red-500 text-red-500" : "text-zinc-300")} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="space-y-3">
                {products.length > 0 && (
                    <div className="px-1 relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-600 transition-colors">
                            <Search className="w-4 h-4" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-11 pl-10 pr-4 rounded-xl text-xs border focus:outline-none focus:ring-2 transition-all"
                            style={{
                                backgroundColor: isDarkTheme ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)',
                                borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0,0,0,0.06)',
                                color: textColor,
                            }}
                        />
                    </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                    {filteredProducts.length > 0 ? (
                        filteredProducts.map((product) => (
                            <div
                                key={product._id}
                                className="rounded-xl overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-all active:scale-[0.98] group flex flex-col backdrop-blur-xl"
                                style={{
                                    backgroundColor: cardSurfaceColor || (isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.7)'),
                                    borderWidth: '1px',
                                    borderColor: isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
                                }}
                                onClick={() => setSelectedProduct(product)}
                            >
                                <div className="aspect-square relative overflow-hidden" style={{ backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
                                    {product.image_url ? (
                                        <img src={product.image_url} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-2xl">🛍️</div>
                                    )}
                                </div>
                                <div className="p-3 backdrop-blur-xl">
                                    <h3 className="font-semibold text-xs line-clamp-1" style={{ color: textColor }}>{product.title}</h3>
                                    <p className="text-[10px] mt-1" style={{ color: textColor, opacity: 0.6 }}>₹{product.price}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-2 text-center py-10 opacity-60">
                            <Search className="w-6 h-6 mx-auto mb-2" style={{ color: textColor, opacity: 0.4 }} />
                            <p className="text-xs" style={{ color: textColor, opacity: 0.5 }}>
                                {searchQuery ? `No results for "${searchQuery}"` : "No products found"}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <StoreUpdates 
                sellerId={user?.id || ''} 
                textColor={textColor} 
                isDarkTheme={isDarkTheme} 
                surfaceColor={cardSurfaceColor}
            />
        </div>
    );

    const renderProductDetail = () => {
        if (!selectedProduct) return null;

        // Hide description and actions if no description provided (Gallery Mode)
        const hasDescription = !!selectedProduct.description;

        const detailBg = cardSurfaceColor || (isDarkTheme ? '#09090b' : '#ffffff');
        const detailHeaderBg = cardSurfaceColor || (isDarkTheme ? 'rgba(9, 9, 11, 0.85)' : 'rgba(255, 255, 255, 0.9)');
        const detailBorder = isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';

        return (
            <div className="absolute inset-0 z-[60] flex flex-col animate-in slide-in-from-bottom duration-300" style={{ backgroundColor: detailBg }}>
                <div className="p-4 border-b flex items-center justify-between sticky top-0 z-10 pt-12 backdrop-blur-xl"
                    style={{ backgroundColor: detailHeaderBg, borderColor: detailBorder }}
                >
                    <Button variant="ghost" size="icon" onClick={() => setSelectedProduct(null)} className="-ml-2" style={{ color: textColor }}>
                        <ChevronLeft className="w-6 h-6" />
                    </Button>
                    <span className="font-bold text-sm" style={{ color: textColor }}>Product</span>
                    <div className="w-9" />
                </div>
                <div className="flex-1 overflow-y-auto p-5 pb-24">
                    <div className="aspect-video rounded-2xl overflow-hidden mb-6 shadow-sm border relative"
                        style={{ backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', borderColor: detailBorder }}
                    >
                        {selectedProduct.image_url ?
                            <img src={selectedProduct.image_url} className="w-full h-full object-cover" /> :
                            <div className="w-full h-full flex items-center justify-center text-4xl">🛍️</div>
                        }
                    </div>
                    <h1 className="text-2xl font-black mb-2 leading-tight" style={{ color: textColor }}>{selectedProduct.title}</h1>
                    <div className="flex items-center gap-2 mb-6">
                        <span className="text-xl font-bold" style={{ color: textColor }}>₹{selectedProduct.price}</span>
                        {selectedProduct.originalPrice && <span className="text-sm opacity-50 line-through" style={{ color: textColor }}>₹{selectedProduct.originalPrice}</span>}
                    </div>

                    {hasDescription && (
                        <div className="prose prose-sm max-w-none">
                            <p className="leading-relaxed opacity-70" style={{ color: textColor }}>{selectedProduct.description}</p>
                        </div>
                    )}
                </div>

                {/* Buy/Enquire Bar - Only if description exists */}
                {hasDescription && (
                    <div className="p-4 border-t absolute bottom-0 w-full safe-area-bottom flex gap-3 backdrop-blur-xl"
                        style={{ backgroundColor: detailHeaderBg, borderColor: detailBorder }}
                    >
                        <Button
                            variant="outline"
                            className="flex-1 h-12 rounded-xl font-bold text-base transition-all"
                            style={{ borderColor: detailBorder, color: textColor, backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'transparent' }}
                        >
                            Enquire Now
                        </Button>
                        <Button
                            className="flex-1 h-12 rounded-2xl font-bold text-base shadow-lg"
                            style={{ backgroundColor: isDarkTheme ? '#ffffff' : '#000000', color: isDarkTheme ? '#000000' : '#ffffff' }}
                        >
                            Buy Now
                        </Button>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center p-4 w-full h-full font-sans select-none" style={{ color: textColor }}>
            {/* Phone Mockup Frame */}
            <div className="relative w-[320px] h-[640px] bg-black rounded-[2.5rem] border-[8px] border-zinc-900 shadow-2xl overflow-hidden flex flex-col ring-1 ring-zinc-800 isolate">
                
                {/* Background Layer (Matches PublicProfile.tsx) */}
                <div 
                    className="absolute inset-0 z-0 transition-all duration-1000 ease-out pointer-events-none"
                    style={{
                        backgroundColor: hasCoverBackdrop ? '#000000' : bgColor,
                    }}
                >
                    {/* Blurred Cover Image Background */}
                    {coverType === 'video' && coverUrl ? (
                        <video
                            src={coverUrl}
                            className="absolute inset-0 w-full h-full object-cover blur-[20px] saturate-[1.5] scale-[1.1]"
                            autoPlay
                            muted
                            loop
                            playsInline
                        />
                    ) : hasCoverImage && coverUrl ? (
                        <div 
                            className="absolute inset-0 opacity-100 blur-[20px] saturate-[1.5] scale-[1.1]"
                            style={{
                                backgroundImage: `url(${coverUrl})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                backgroundRepeat: 'no-repeat',
                            }}
                        />
                    ) : null}
                    {!hasCoverImage && youtubeThumbUrl && (
                        <div
                            className="absolute inset-0 opacity-100 blur-[20px] saturate-[1.5] scale-[1.1]"
                            style={{
                                backgroundImage: `url(${youtubeThumbUrl})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                backgroundRepeat: 'no-repeat',
                            }}
                        />
                    )}
                    
                    {/* Subtle Ambient Overlay - lighter to show more blur */}
                    {hasCoverBackdrop && (
                        <div 
                            className="absolute inset-0 transition-opacity duration-700"
                            style={{
                                background: 'radial-gradient(circle at center, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.2) 100%)',
                            }}
                        />
                    )}
                </div>

                {/* 1. Dynamic Island / Status Bar Area */}
                <div className="absolute top-0 w-full h-8 z-[70] flex justify-between px-6 items-end pb-1 pointer-events-none">
                    <span className="text-[10px] font-bold text-white mix-blend-difference z-[70]">9:41</span>
                    <div className="flex gap-1 z-[70]">
                        <div className="w-3.5 h-[10px] border border-white/50 rounded-[2px] relative">
                            <div className="absolute inset-0.5 bg-white rounded-[1px]"></div>
                        </div>
                    </div>
                </div>

                {/* 2. Fixed Sticky Header */}
                <div className={cn(
                    "absolute top-0 left-0 right-0 z-[100] h-[88px] flex items-end px-5 pb-3 transition-all duration-300 pointer-events-none",
                    isScrolled ? "backdrop-blur-xl shadow-sm border-b border-black/5" : "bg-transparent"
                )} style={{ background: isScrolled ? `${bgColor}90` : 'transparent' }}>
                    <div className="flex items-center justify-between w-full pointer-events-auto">
                        <div className="flex items-center gap-2 h-9 overflow-visible relative w-40">
                            {/* Tapx Logo */}
                            <div className={cn(
                                "absolute left-0 flex items-center gap-1.5 transition-all duration-500 transform origin-left px-2.5 py-1 rounded-full",
                                isScrolled ? "opacity-0 -translate-y-4 pointer-events-none" : "opacity-100 translate-y-0 delay-100 bg-black/20 backdrop-blur-md border border-white/10"
                            )}>
                                <div className="w-4 h-4 bg-black rounded-full flex items-center justify-center shadow-sm">
                                    <span className="text-[9px] text-white font-bold">t</span>
                                </div>
                                <span className="text-xs font-bold text-white shadow-black drop-shadow-sm">tapx.bio</span>
                            </div>

                            {/* Mini Avatar */}
                            <div className={cn(
                                "absolute left-0 flex items-center gap-2 transition-all duration-500 transform origin-left",
                                isScrolled ? "opacity-100 translate-y-0 delay-75" : "opacity-0 translate-y-8"
                            )}>
                                <Avatar className="w-8 h-8 cursor-pointer border border-zinc-200/20">
                                    <AvatarImage src={avatarUrl} className="object-cover" />
                                    <AvatarFallback style={{ backgroundColor: buttonColor, color: buttonTextColor }} className="text-xs">{userInitial}</AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-bold line-clamp-1 truncate max-w-[120px]" style={{ color: textColor }}>{displayName}</span>
                            </div>
                        </div>

                        {/* Share Button */}
                        <Button size="icon" variant="ghost" className={cn(
                            "w-8 h-8 rounded-full transition-colors backdrop-blur-md",
                            isScrolled ? "hover:opacity-80" : "bg-black/20 text-white hover:bg-black/30 border border-white/10"
                        )} style={isScrolled ? { color: textColor, backgroundColor: `${textColor}10` } : {}}>
                            <Upload className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* 3. Main Scroll Container */}
                <div
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                    className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide relative z-[1]"
                >
                    {/* Cover Photo */}
                    <div className="h-64 w-full relative z-0 px-3">
                        <div className="w-full h-full overflow-hidden">
                        {youtubeVideoId ? (
                            <div className="w-full h-full relative pointer-events-auto">
                                <iframe
                                    src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${youtubeVideoId}&playsinline=1`}
                                    className="w-full h-full absolute inset-0 object-cover"
                                    allow="autoplay; encrypted-media; loop"
                                    title="Cover Video"
                                />
                                <div className="absolute inset-0 bg-transparent pointer-events-none" />
                            </div>
                        ) : showCoverImage ? (
                            coverType === 'video' ? (
                                <video 
                                    src={coverUrl} 
                                    className="w-full h-full object-cover" 
                                    autoPlay 
                                    muted 
                                    loop 
                                    playsInline 
                                />
                            ) : (
                                <img src={coverUrl} className="w-full h-full object-cover" />
                            )
                        ) : (
                            <div className="w-full h-full" style={{ background: coverColor || 'linear-gradient(to bottom right, #6366f1, #a855f7, #ec4899)' }} />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent" />
                        <div
                            className="absolute inset-0 pointer-events-none"
                            style={{
                                opacity: Math.max(0, scrollProgress - 0.2),
                                backdropFilter: `blur(${Math.max(0, scrollProgress - 0.2) * 20}px)`,
                                WebkitBackdropFilter: `blur(${Math.max(0, scrollProgress - 0.2) * 20}px)`,
                                background: 'linear-gradient(to bottom, rgba(0,0,0,0.15), rgba(0,0,0,0.35))'
                            }}
                        />
                        </div>
                    </div>

                    {/* Uplifted Card */}
                    <div className="relative z-10 -mt-16 px-3 pb-8 min-h-[500px]">
                        {/* Avatar - Positioned outside card to prevent clipping */}
                        <div className="relative z-20 flex justify-center -mb-14">
                            <div className={cn(
                                "w-28 h-28 rounded-full border-[6px] shadow-2xl overflow-hidden transition-all duration-300",
                                scrollProgress > 0.2 ? "scale-90 opacity-80" : "scale-100 opacity-100"
                            )} style={{ borderColor: '#ffffff', backgroundColor: cardBgType === 'color' ? cardColor : '#ffffff' }}>
                                <Avatar className="w-full h-full">
                                    <AvatarImage src={avatarUrl} className="object-cover" />
                                    <AvatarFallback style={{ backgroundColor: buttonColor, color: buttonTextColor }} className="text-4xl font-bold">{userInitial}</AvatarFallback>
                                </Avatar>
                            </div>
                        </div>
                        
                        <div
                            className="w-full shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)] p-5 pt-16 flex flex-col items-center animate-in slide-in-from-bottom-12 duration-1000 fill-mode-both min-h-[70vh] relative overflow-hidden backdrop-blur-md"
                            style={{
                                backgroundColor: (cardBgType === 'color' || !cardBgType) ? cardColor : undefined,
                                backgroundImage: cardBgType === 'image' && cardImageUrl ? `url(${cardImageUrl})` : undefined,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                border: isDarkTheme ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(255,255,255,0.3)',
                                boxShadow: isDarkTheme ? '0 25px 50px -12px rgba(0,0,0,0.5)' : '0 25px 50px -12px rgba(0,0,0,0.15)'
                            }}
                        >
                            {/* Gradient Overlay */}
                            <div
                                className="absolute inset-0 z-0 pointer-events-none"
                                style={{
                                    background: isDarkTheme ? 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.4) 100%)' : 'transparent',
                                }}
                            />

                            {/* Large Profile Header */}
                            <div className="relative z-10 flex flex-col items-center mb-4 w-full px-6">
                                <div className={cn(
                                    "text-center transition-all duration-300 w-full",
                                    scrollProgress > 0.4 ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
                                )}>
                                    <h1 className="text-xl font-black tracking-tight" style={{ color: textColor }}>{displayName}</h1>
                                    <p className="text-xs font-medium opacity-60" style={{ color: textColor }}>@{username}</p>
                                    
                                    {/* Social Links Icons */}
                                    {user?.social_links && Object.keys(user.social_links).length > 0 && (
                                        <div className="flex items-center justify-center gap-2 mt-3 mb-4">
                                            {Object.entries(user.social_links).map(([key, url]) => {
                                                if (!url) return null;
                                                const Icon = socialIconMap[key];
                                                if (!Icon) return null;
                                                return (
                                                    <a
                                                        key={key}
                                                        href={url as string}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="w-8 h-8 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                                                        style={{ 
                                                            backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.1)' : '#f4f4f5',
                                                            color: textColor
                                                        }}
                                                    >
                                                        <Icon className="w-4 h-4" />
                                                    </a>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Content Area - Show Links or Products based on mode and settings */}
                            <div className="w-full min-h-[300px] relative z-10">
                                {mode === 'store' ? (
                                    renderProductList()
                                ) : shouldShowStoreTab ? (
                                    <div className="space-y-3 w-full animate-in slide-in-from-bottom duration-700 fade-in fill-mode-both">
                                        {(user?.visible_stores?.length || 0) > 0 ? (
                                            <div className="grid grid-cols-1 gap-2.5">
                                                {user?.visible_stores?.map((store: any) => (
                                                    <div
                                                        key={store._id || (typeof store === 'string' ? store : 'fallback')}
                                                        className="w-full p-3 rounded-2xl border flex items-center justify-between group h-16 shadow-sm"
                                                        style={{
                                                            backgroundColor: cardBgType === 'color' ? (cardColor || '#ffffff') : '#ffffff',
                                                            borderColor: isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                                                        }}
                                                    >
                                                        <div className="flex items-center gap-3 w-full overflow-hidden">
                                                            <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center shrink-0 border border-white/20">
                                                                <ShoppingBag className="w-5 h-5 opacity-40" style={{ color: textColor }} />
                                                            </div>
                                                            <div className="flex flex-col text-left overflow-hidden">
                                                                <span className="text-sm font-bold truncate" style={{ color: textColor }}>
                                                                    {typeof store === 'string' ? 'Your Shop' : (store.store_name || 'Shop')}
                                                                </span>
                                                                <span className="text-[10px] opacity-60 truncate" style={{ color: textColor }}>
                                                                    @{typeof store === 'string' ? 'username' : (store.username || 'store')}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <ArrowRight className="w-4 h-4 opacity-30" style={{ color: textColor }} />
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-10 opacity-60">
                                                <ShoppingBag className="w-6 h-6 mx-auto mb-2" style={{ color: textColor, opacity: 0.4 }} />
                                                <p className="text-[10px]" style={{ color: textColor, opacity: 0.5 }}>No stores visible</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-3 w-full animate-in slide-in-from-bottom duration-700 fade-in fill-mode-both" style={{ animationDelay: '100ms' }}>
                                        {/* Update/Notification Blocks - Show at top */}
                                        {blocks.filter(b => b.is_active !== false && b.block_type === 'update').map((block) => {
                                            const styleConfig = {
                                                info: { icon: Info, bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.3)', iconColor: '#3b82f6' },
                                                success: { icon: CheckCircle, bg: 'rgba(34, 197, 94, 0.15)', border: 'rgba(34, 197, 94, 0.3)', iconColor: '#22c55e' },
                                                warning: { icon: AlertTriangle, bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)', iconColor: '#f59e0b' },
                                                promo: { icon: PartyPopper, bg: 'rgba(168, 85, 247, 0.15)', border: 'rgba(168, 85, 247, 0.3)', iconColor: '#a855f7' },
                                            };
                                            const style = block.content?.style || 'info';
                                            const config = styleConfig[style as keyof typeof styleConfig] || styleConfig.info;
                                            const UpdateIcon = config.icon;
                                            
                                            const handleUpdateClick = () => {
                                                if (block.content?.url) {
                                                    let url = block.content.url;
                                                    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
                                                    window.open(url, '_blank');
                                                }
                                            };
                                            
                                            return (
                                                <div
                                                    key={block._id}
                                                    onClick={handleUpdateClick}
                                                    className={`w-full p-3 rounded-2xl transition-all border ${block.content?.url ? 'cursor-pointer active:scale-[0.98] hover:shadow-md' : ''}`}
                                                    style={{
                                                        backgroundColor: config.bg,
                                                        borderColor: config.border,
                                                    }}
                                                >
                                                    <div className="flex items-start gap-2.5">
                                                        <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: config.iconColor + '20' }}>
                                                            <UpdateIcon className="w-3 h-3" style={{ color: config.iconColor }} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="text-xs font-bold" style={{ color: textColor }}>{block.title}</h4>
                                                            {block.content?.message && (
                                                                <p className="text-[10px] mt-0.5 opacity-80" style={{ color: textColor }}>{block.content.message}</p>
                                                            )}
                                                        </div>
                                                        {block.content?.url && (
                                                            <ArrowRight className="w-3 h-3 opacity-50 shrink-0 mt-0.5" style={{ color: textColor }} />
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        
                                        {/* Regular Link Blocks */}
                                        {blocks.filter(b => b.is_active !== false && b.block_type !== 'update').map((block) => {
                                            const Icon = block.thumbnail ? getIconForThumbnail(block.thumbnail) : null;
                                            const blockUrl = block.content?.url || block.url;
                                            const customBlockColor = block.content?.blockColor;
                                            const finalBlockColor = customBlockColor || linkBlocksColor || (cardBgType === 'color' ? (cardColor || '#ffffff') : '#ffffff');
                                            
                                            const handleBlockClick = () => {
                                                if (blockUrl) {
                                                    let url = blockUrl;
                                                    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
                                                    window.open(url, '_blank');
                                                }
                                            };
                                            
                                            return (
                                                <div key={block._id}
                                                    onClick={handleBlockClick}
                                                    className="w-full p-3.5 rounded-2xl active:scale-[0.98] transition-all cursor-pointer border flex items-center justify-between group h-14 hover:shadow-md"
                                                    style={{
                                                        backgroundColor: finalBlockColor,
                                                        borderColor: isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                                                    }}
                                                >
                                                    <div className="flex items-center gap-3 w-full overflow-hidden">
                                                        {Icon ? (
                                                            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm" style={{ backgroundColor: isDarkTheme ? '#000' : '#fff', color: textColor }}><Icon className="w-4 h-4" /></div>
                                                        ) : blockUrl ? (
                                                            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm overflow-hidden" style={{ backgroundColor: isDarkTheme ? '#000' : '#fff' }}>
                                                                <Favicon 
                                                                    url={blockUrl}
                                                                    className="w-5 h-5 object-contain"
                                                                    fallback={<ExternalLink className="w-4 h-4" style={{ color: textColor }} />}
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm" style={{ backgroundColor: isDarkTheme ? '#000' : '#fff', color: textColor }}><ExternalLink className="w-4 h-4" /></div>
                                                        )}
                                                        <span className="text-sm font-bold truncate flex-1 text-left" style={{ color: textColor }}>{block.title}</span>
                                                    </div>
                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <ArrowRight className="w-3.5 h-3.5 opacity-50" style={{ color: textColor }} />
                                                    </div>
                                                </div>
                                            )
                                        })}
                                        {blocks.filter(b => b.is_active !== false).length === 0 && (
                                            <div className="text-center py-8 opacity-50">
                                                <p className="text-xs" style={{ color: textColor }}>No links added yet.</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                        </div>

                        {/* Footer Branding */}
                        <div className="mt-8 flex justify-center opacity-30 pb-4">
                            <div className="flex items-center gap-1.5 grayscale">
                                <span className="text-[10px] font-bold" style={{ color: textColor }}>tapx.bio</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Home Indicator */}
                <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-black/20 rounded-full z-[70] pointer-events-none" style={{ backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' }}></div>

                {/* Product Detail Overlay */}
                {selectedProduct && renderProductDetail()}
            </div>
        </div>
    );
};

export default ProfilePreview;
