import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Share2, ArrowRight, Sparkles, AlertCircle, ExternalLink, Mail, Phone, ShoppingBag, ChevronLeft, Star, Heart, Upload } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getIconForThumbnail } from "@/utils/socialIcons";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

// ... (previous code)

interface ProfilePreviewProps {
    blocks?: any[];
    theme?: any;
    products?: any[];
    mode?: 'personal' | 'store';
}

const ProfilePreview = ({ blocks = [], theme, products = [], mode = 'personal' }: ProfilePreviewProps) => {

    const { user } = useAuth();
    const username = user?.username || "user";
    const displayName = user?.name || "Display Name";
    const userInitial = displayName[0]?.toUpperCase() || "U";
    const avatarUrl = user?.avatar;
    const coverUrl = theme?.coverUrl || user?.design_config?.coverUrl;
    const coverColor = theme?.coverColor || user?.design_config?.coverColor;
    const coverYoutubeUrl = theme?.coverYoutubeUrl || user?.design_config?.coverYoutubeUrl;

    // Extract YouTube video ID from URL
    const getYouTubeVideoId = (url: string) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const youtubeVideoId = coverYoutubeUrl ? getYouTubeVideoId(coverYoutubeUrl) : null;

    const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
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

    const renderProductList = () => (
        <div className="space-y-4 px-1 pb-24 animate-in slide-in-from-bottom duration-700 fade-in fill-mode-both" style={{ animationDelay: '100ms' }}>
            <div className="grid grid-cols-2 gap-3">
                {products.length > 0 ? (
                    products.map((product) => (
                        <div
                            key={product._id}
                            className="bg-zinc-50 rounded-xl overflow-hidden shadow-sm border border-zinc-100 cursor-pointer hover:shadow-md transition-all active:scale-[0.98] group flex flex-col"
                            onClick={() => setSelectedProduct(product)}
                        >
                            <div className="aspect-square bg-zinc-200 relative overflow-hidden">
                                {product.image_url ? (
                                    <img src={product.image_url} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-2xl">🛍️</div>
                                )}
                            </div>
                            <div className="p-3">
                                <h3 className="font-semibold text-xs text-zinc-900 line-clamp-1">{product.title}</h3>
                                <p className="text-[10px] text-zinc-500 mt-1">₹{product.price}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-2 text-center py-10 opacity-60">
                        <ShoppingBag className="w-6 h-6 mx-auto mb-2 text-zinc-300" />
                        <p className="text-xs text-zinc-400">No products found</p>
                    </div>
                )}
            </div>
        </div>
    );

    const renderProductDetail = () => {
        if (!selectedProduct) return null;

        // Hide description and actions if no description provided (Gallery Mode)
        const hasDescription = !!selectedProduct.description;

        return (
            <div className="absolute inset-0 bg-white z-[60] flex flex-col animate-in slide-in-from-bottom duration-300">
                <div className="p-4 border-b border-zinc-100 flex items-center justify-between sticky top-0 bg-white z-10 pt-12">
                    <Button variant="ghost" size="icon" onClick={() => setSelectedProduct(null)} className="-ml-2">
                        <ChevronLeft className="w-6 h-6" />
                    </Button>
                    <span className="font-bold text-sm">Product</span>
                    <div className="w-9" />
                </div>
                <div className="flex-1 overflow-y-auto p-5 pb-24">
                    <div className="aspect-video bg-zinc-100 rounded-2xl overflow-hidden mb-6 shadow-sm border border-zinc-100 relative">
                        {selectedProduct.image_url ?
                            <img src={selectedProduct.image_url} className="w-full h-full object-cover" /> :
                            <div className="w-full h-full flex items-center justify-center text-4xl">🛍️</div>
                        }
                    </div>
                    <h1 className="text-2xl font-black mb-2 leading-tight">{selectedProduct.title}</h1>
                    <div className="flex items-center gap-2 mb-6">
                        <span className="text-xl font-bold text-green-600">₹{selectedProduct.price}</span>
                        {selectedProduct.originalPrice && <span className="text-sm text-zinc-400 line-through">₹{selectedProduct.originalPrice}</span>}
                    </div>

                    {hasDescription && (
                        <div className="prose prose-sm prose-zinc max-w-none">
                            <p className="text-zinc-600 leading-relaxed">{selectedProduct.description}</p>
                        </div>
                    )}
                </div>

                {/* Buy/Enquire Bar - Only if description exists */}
                {hasDescription && (
                    <div className="p-4 border-t border-zinc-100 absolute bottom-0 w-full bg-white safe-area-bottom flex gap-3">
                        <Button
                            variant="outline"
                            className="flex-1 h-12 rounded-xl font-bold text-base border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                        >
                            Enquire Now
                        </Button>
                        <Button className="flex-1 h-12 rounded-2xl bg-black text-white font-bold text-base shadow-lg">
                            Buy Now
                        </Button>
                    </div>
                )}
            </div>
        );
    }

    // Theme Styles
    const bgColor = theme?.backgroundColor || "#fafafa"; // Zinc-50 equivalent
    const textColor = theme?.textColor || "#18181b"; // Zinc-900
    const buttonColor = theme?.buttonColor || "#000000";
    const buttonTextColor = theme?.buttonTextColor || "#ffffff";
    const blockStyle = theme?.blockStyle || 'rounded'; // rounded, square, fully_rounded

    // Helper to determine if a color is light or dark
    const isColorLight = (color: string) => {
        if (!color) return false;
        const hex = color.replace('#', '');
        // Handle short hex (e.g., #fff)
        const fullHex = hex.length === 3 ? hex.split('').map(c => c + c).join('') : hex;
        const r = parseInt(fullHex.substring(0, 2), 16);
        const g = parseInt(fullHex.substring(2, 4), 16);
        const b = parseInt(fullHex.substring(4, 6), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness > 128;
    };

    const isDarkTheme = isColorLight(textColor); // If text is light, theme is likely dark

    return (
        <div className="flex flex-col items-center justify-center p-4 w-full h-full font-sans select-none" style={{ color: textColor }}>
            {/* Phone Mockup Frame */}
            <div className="relative w-[320px] h-[640px] bg-black rounded-[2.5rem] border-[8px] border-zinc-900 shadow-2xl overflow-hidden flex flex-col ring-1 ring-zinc-800 isolate">

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
                    className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide relative"
                    style={{ background: bgColor }}
                >
                    {/* Cover Photo */}
                    <div className="h-64 w-full relative z-0">
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
                        ) : coverUrl ? (
                            <img src={coverUrl} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full" style={{ background: coverColor || 'linear-gradient(to bottom right, #6366f1, #a855f7, #ec4899)' }} />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent" />
                    </div>

                    {/* Uplifted Card */}
                    <div className="relative z-10 -mt-10 px-3 pb-8 min-h-[500px]">
                        <div
                            className="w-full rounded-[1.5rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] p-4 pt-0 flex flex-col items-center animate-in slide-in-from-bottom-8 duration-700 fill-mode-both"
                            style={{
                                backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.05)' : '#ffffff',
                                border: isDarkTheme ? '1px solid rgba(255,255,255,0.1)' : 'none'
                            }}
                        >

                            {/* Large Profile Header */}
                            <div className="relative -top-9 flex flex-col items-center mb-[-20px]">
                                <div className={cn(
                                    "w-24 h-24 rounded-full border-[5px] shadow-lg overflow-hidden mb-2 transition-all duration-300",
                                    scrollProgress > 0.2 ? "scale-90 opacity-80" : "scale-100 opacity-100"
                                )} style={{ borderColor: isDarkTheme ? '#18181b' : '#ffffff', backgroundColor: isDarkTheme ? '#18181b' : '#ffffff' }}>
                                    <Avatar className="w-full h-full">
                                        <AvatarImage src={avatarUrl} className="object-cover" />
                                        <AvatarFallback style={{ backgroundColor: buttonColor, color: buttonTextColor }} className="text-3xl font-bold">{userInitial}</AvatarFallback>
                                    </Avatar>
                                </div>
                                <div className={cn(
                                    "text-center transition-all duration-300",
                                    scrollProgress > 0.4 ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
                                )}>
                                    <h1 className="text-xl font-black tracking-tight" style={{ color: textColor }}>{displayName}</h1>
                                    <p className="text-xs font-medium opacity-60" style={{ color: textColor }}>@{username}</p>
                                </div>
                            </div>

                            {/* Navigation Toggles */}
                            <div className="flex w-full bg-zinc-100 dark:bg-zinc-800/50 p-1 rounded-full mb-6 relative z-20 mx-auto max-w-[200px]" style={{
                                backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.1)' : '#f4f4f5'
                            }}>
                                <button
                                    onClick={() => setActiveTab('personal')}
                                    className={cn(
                                        "flex-1 py-1.5 text-[11px] font-bold rounded-full transition-all flex items-center justify-center gap-1.5",
                                        activeTab === 'personal' ? "bg-white dark:bg-zinc-800 shadow-sm text-black dark:text-white" : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
                                    )}
                                    style={activeTab === 'personal' ? { color: textColor, backgroundColor: isDarkTheme ? 'rgba(0,0,0,0.4)' : '#ffffff' } : { color: textColor, opacity: 0.6 }}
                                >
                                    Links
                                </button>
                                <button
                                    onClick={() => setActiveTab('store')}
                                    className={cn(
                                        "flex-1 py-1.5 text-[11px] font-bold rounded-full transition-all flex items-center justify-center gap-1.5",
                                        activeTab === 'store' ? "bg-white dark:bg-zinc-800 shadow-sm text-black dark:text-white" : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
                                    )}
                                    style={activeTab === 'store' ? { color: textColor, backgroundColor: isDarkTheme ? 'rgba(0,0,0,0.4)' : '#ffffff' } : { color: textColor, opacity: 0.6 }}
                                >
                                    Store
                                </button>
                            </div>

                            {/* Content Area - Show Links or Products based on mode */}
                            <div className="w-full min-h-[300px]">
                                {activeTab === 'store' ? (
                                    renderProductList()
                                ) : (
                                    <div className="space-y-3 w-full animate-in slide-in-from-bottom duration-700 fade-in fill-mode-both" style={{ animationDelay: '100ms' }}>
                                        {blocks.map((block) => {
                                            const Icon = block.thumbnail ? getIconForThumbnail(block.thumbnail) : null;
                                            return (
                                                <div key={block._id}
                                                    className="w-full p-3.5 rounded-2xl active:scale-[0.98] transition-all cursor-pointer border flex items-center justify-between group h-14"
                                                    style={{
                                                        backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.08)' : '#fafafa',
                                                        borderColor: isDarkTheme ? 'rgba(255,255,255,0.05)' : '#f4f4f5',
                                                    }}
                                                >
                                                    <div className="flex items-center gap-3 w-full overflow-hidden">
                                                        {Icon ?
                                                            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm" style={{ backgroundColor: isDarkTheme ? '#000' : '#fff', color: textColor }}><Icon className="w-4 h-4" /></div>
                                                            :
                                                            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm" style={{ backgroundColor: isDarkTheme ? '#000' : '#fff', color: textColor }}><ExternalLink className="w-4 h-4" /></div>
                                                        }
                                                        <span className="text-sm font-bold truncate flex-1 text-left" style={{ color: textColor }}>{block.title}</span>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                        {blocks.length === 0 && (
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
