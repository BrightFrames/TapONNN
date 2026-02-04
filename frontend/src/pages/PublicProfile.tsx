import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { io } from "socket.io-client";
import { useAuth } from "@/contexts/AuthContext";
import { templates } from "@/data/templates";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Sparkles, Share2, Link2, MessageCircle, Search, ExternalLink, ArrowRight, ShoppingBag, Star, ChevronLeft, BadgeCheck, Heart, Upload } from "lucide-react";
import EnquiryModal from "@/components/EnquiryModal";
import PaymentModal from "@/components/PaymentModal";
import LoginToContinueModal from "@/components/LoginToContinueModal";
import ShareModal from "@/components/ShareModal";
import ConnectWithSupplierModal from "@/components/ConnectWithSupplierModal";
import { MessageSignupModal } from "@/components/MessageSignupModal";
import useIntent, { getPendingIntent, clearPendingIntent } from "@/hooks/useIntent";
import { toast } from "sonner";
import { getIconForThumbnail } from "@/utils/socialIcons";
import { useAnalytics } from "@/hooks/useAnalytics";
import { cn } from "@/lib/utils";

const PublicProfile = () => {
    const { username } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user: authUser, selectedTheme: authTheme } = useAuth();

    // Check if this is a store route (/s/:username)
    const isStoreRoute = location.pathname.startsWith('/s/');

    // Intent Hook
    const { createIntent, resumeIntent, loading: intentLoading } = useIntent();

    // State
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const [blocks, setBlocks] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
    const [selectedBlock, setSelectedBlock] = useState<any | null>(null); // For Link Interstitial
    const [searchQuery, setSearchQuery] = useState('');
    const [notFound, setNotFound] = useState(false);
    const [likedProductIds, setLikedProductIds] = useState<Set<string>>(new Set());
    const [activeTab, setActiveTab] = useState<'personal' | 'store'>('personal');

    useEffect(() => {
        setActiveTab(isStoreRoute ? 'store' : 'personal');
    }, [isStoreRoute]);

    // Countdown State
    const [countdown, setCountdown] = useState(5);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Scroll Logic
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [scrollProgress, setScrollProgress] = useState(0);

    const handleScroll = () => {
        if (!scrollContainerRef.current) return;
        const scrollTop = scrollContainerRef.current.scrollTop;
        const progress = Math.min(scrollTop / 120, 1);
        setScrollProgress(progress);
    };

    const isScrolled = scrollProgress > 0.8;

    // Modals State
    const [shareOpen, setShareOpen] = useState(false);
    const [enquiryModal, setEnquiryModal] = useState({ open: false, blockId: '', blockTitle: '', ctaType: '', intentId: '' });
    const [paymentModal, setPaymentModal] = useState({ open: false, blockId: '', blockTitle: '', price: 0, intentId: '', sellerId: '' });
    const [loginModal, setLoginModal] = useState({ open: false, intentId: '', ctaType: '', blockTitle: '' });
    const [connectModal, setConnectModal] = useState<{ open: boolean; product: any; seller: any }>({ open: false, product: null, seller: null });
    const [messageSignupOpen, setMessageSignupOpen] = useState(false);

    // Initialize Analytics
    const { trackClick } = useAnalytics(profile?.id);

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

    // Initialize Profile & Blocks
    useEffect(() => {
        fetchPublicProfile();

        // Socket.io Connection
        const socketUrl = (import.meta.env.VITE_API_URL || "http://localhost:5001").replace(/\/api\/?$/, '');
        const socket = io(socketUrl);

        socket.on("connect", () => {
            if (username) {
                socket.emit("joinProfile", username);
            }
        });

        socket.on("profileUpdated", (data) => {
            fetchPublicProfile();
        });

        return () => {
            socket.disconnect();
        };
    }, [username, isStoreRoute]);

    // Check for pending intent after login
    useEffect(() => {
        const checkPendingIntent = async () => {
            const pendingIntentId = getPendingIntent();
            if (pendingIntentId && authUser) {
                try {
                    const result = await resumeIntent(pendingIntentId);
                    if (result) {
                        handleIntentAction(result);
                    }
                } catch (err) {
                    console.error('Failed to resume intent:', err);
                }
            }
        };

        if (!loading && authUser) {
            checkPendingIntent();
        }
    }, [loading, authUser]);

    // Countdown Logic for Link Interstitial
    useEffect(() => {
        if (selectedBlock && countdown > 0) {
            timerRef.current = setTimeout(() => {
                setCountdown(prev => prev - 1);
            }, 1000);
        } else if (selectedBlock && countdown === 0) {
            // Auto Redirect
            proceedToLink();
        }

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [selectedBlock, countdown]);

    const proceedToLink = () => {
        if (!selectedBlock) return;
        const url = selectedBlock.content?.url || selectedBlock.url;
        if (url) {
            let finalUrl = url;
            if (!/^https?:\/\//i.test(finalUrl)) {
                finalUrl = 'https://' + finalUrl;
            }
            window.open(finalUrl, '_blank');
        }
        // Close interstitial
        setSelectedBlock(null);
        setCountdown(5); // Reset
    };

    const fetchPublicProfile = async () => {
        if (!username) return;

        try {
            const profileEndpoint = isStoreRoute
                ? `${API_URL}/profile/store/${username}`
                : `${API_URL}/profile/${username}`;

            const profileRes = await fetch(profileEndpoint);
            if (!profileRes.ok) {
                setNotFound(true);
                return;
            }
            const userProfile = await profileRes.json();

            setProfile({
                id: userProfile.id,
                name: userProfile.full_name,
                username: userProfile.username,
                avatar: userProfile.avatar_url,
                bio: userProfile.bio,
                selectedTheme: userProfile.selected_theme,
                payment_instructions: userProfile.payment_instructions,
                social_links: userProfile.social_links || {},
                is_store_identity: userProfile.is_store_identity,
                design_config: userProfile.design_config
            });

            const context = isStoreRoute ? 'store' : 'personal';
            const blocksRes = await fetch(`${API_URL}/blocks/public/${userProfile.id}?context=${context}`);
            const publicBlocks = await blocksRes.json();
            setBlocks(publicBlocks || []);

            const productsRes = await fetch(`${API_URL}/public/products/${userProfile.username}`);
            if (productsRes.ok) {
                const publicProducts = await productsRes.json();
                setProducts(publicProducts.products || publicProducts || []);
            }

        } catch (error) {
            console.error("Error fetching profile:", error);
            setNotFound(true);
        } finally {
            setLoading(false);
        }
    };

    // Fetch Liked Products
    useEffect(() => {
        const fetchLikedProducts = async () => {
            if (!authUser) return;
            try {
                const response = await fetch(`${API_URL}/products/liked`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
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
    }, [authUser, API_URL]);

    const handleLike = async (productId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!authUser) {
            toast.error("Please login to like products");
            return;
        }

        const isLiked = likedProductIds.has(productId);
        const newLikedIds = new Set(likedProductIds);
        if (isLiked) {
            newLikedIds.delete(productId);
        } else {
            newLikedIds.add(productId);
        }
        setLikedProductIds(newLikedIds);

        try {
            await fetch(`${API_URL}/products/${productId}/like`, {
                method: isLiked ? 'DELETE' : 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
            });
        } catch (error) {
            setLikedProductIds(likedProductIds);
            toast.error("Failed to update like");
        }
    };

    // Handle Block Interaction (CTA Click)
    const handleBlockInteract = async (block: any) => {
        // Track click immediately
        if (block.url) trackClick(block._id, block.url);

        // Check for Interstitial Requirement (Links only)
        // If it's a simple link block or no CTA, show interstitial
        if (block.block_type === 'link' || (!block.cta_type || block.cta_type === 'none')) {
            setSelectedBlock(block);
            setCountdown(5);
            return;
        }

        // For other interactions (Buy/Enquire/Form linked blocks), use Intent Flow
        const intent = await createIntent({
            profile_id: profile.id,
            block_id: block._id,
            store_id: profile.id,
            source: 'profile_page'
        });

        if (!intent) {
            toast.error('Something went wrong. Please try again.');
            return;
        }

        if (intent.requires_login) {
            setLoginModal({
                open: true,
                intentId: intent.intent_id,
                ctaType: block.cta_type,
                blockTitle: block.title
            });
            return;
        }

        handleIntentAction(intent, block);
    };

    // New Handler for Product Actions (Shop Tab)
    const handleProductAction = (product: any, action: 'buy' | 'enquire') => {
        if (action === 'buy') {
            setPaymentModal({
                open: true,
                blockId: '', // No block ID
                blockTitle: product.title,
                price: product.price,
                intentId: '', // No intent ID for simple product buy yet (or create one)
                sellerId: profile.id
            });
        } else if (action === 'enquire') {
            setEnquiryModal({
                open: true,
                blockId: '',
                blockTitle: product.title,
                ctaType: 'enquire',
                intentId: ''
            });
        }
    };

    const handleIntentAction = (intent: any, blockCtx?: any) => {
        const block = blockCtx || blocks.find(b => b._id === intent.block_id);
        if (!block) return;

        if (intent.flow_type === 'redirect') {
            if (block.content.url) {
                let url = block.content.url;
                if (!/^https?:\/\//i.test(url)) {
                    url = 'https://' + url;
                }
                window.open(url, '_blank');
            }
            return;
        }

        if (intent.flow_type === 'enquiry') {
            setEnquiryModal({
                open: true,
                blockId: block._id,
                blockTitle: block.title,
                ctaType: block.cta_type,
                intentId: intent.intent_id
            });
            return;
        }

        if (intent.flow_type === 'buy') {
            const price = block.content.price || 0;
            if (price > 0) {
                setPaymentModal({
                    open: true,
                    blockId: block._id,
                    blockTitle: block.title,
                    price,
                    intentId: intent.intent_id,
                    sellerId: profile.id
                });
            } else {
                toast.success('Added to your library! (Mock)');
            }
            return;
        }
    };

    const handleGuestContinue = async (email: string) => {
        const intentId = loginModal.intentId;
        setLoginModal({ ...loginModal, open: false });

        const block = blocks.find(b => b.title === loginModal.blockTitle);
        if (block) {
            if (loginModal.ctaType === 'buy_now') {
                setPaymentModal({
                    open: true,
                    blockId: block._id,
                    blockTitle: block.title,
                    price: block.content.price || 0,
                    intentId: intentId,
                    sellerId: profile?.id || ''
                });
            } else {
                setEnquiryModal({
                    open: true,
                    blockId: block._id,
                    blockTitle: block.title,
                    ctaType: block.cta_type,
                    intentId: intentId
                });
            }
        }
    };

    const getYouTubeId = (url: string) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const renderCoverMedia = () => {
        const designConfig = profile.design_config || {};
        const { coverType, coverUrl, coverYoutubeUrl } = designConfig;

        // Force cover URL if provided (legacy support)
        const finalCoverUrl = coverUrl || profile.design_config?.bgImageUrl;

        if (finalCoverUrl && (!coverType || coverType === 'image')) {
            return <img src={finalCoverUrl} alt="Cover" className="w-full h-full object-cover" />;
        }
        if (coverType === 'video' && finalCoverUrl) {
            return <video src={finalCoverUrl} className="w-full h-full object-cover" autoPlay muted loop playsInline />;
        }
        if (coverType === 'youtube' && coverYoutubeUrl) {
            const videoId = getYouTubeId(coverYoutubeUrl);
            if (videoId) {
                return (
                    <div className="w-full h-full relative overflow-hidden bg-black">
                        <iframe
                            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&showinfo=0&modestbranding=1`}
                            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] pointer-events-none"
                            allow="autoplay; encrypted-media"
                        />
                    </div>
                );
            }
        }
        return null;
    };

    const userInitial = (profile?.name?.[0] || profile?.username?.[0] || "U").toUpperCase();

    if (loading) {
        return (
            <div className="min-h-screen w-full flex flex-col items-center py-16 px-6 bg-zinc-50 space-y-8 animate-pulse">
                <div className="w-full h-64 bg-zinc-200 absolute top-0 left-0" />
                <div className="relative z-10 -mt-10 bg-white p-6 rounded-[2rem] shadow-xl w-full max-w-md flex flex-col items-center">
                    <Skeleton className="h-24 w-24 rounded-full border-4 border-white -mt-16 mb-4" />
                    <Skeleton className="h-8 w-48 mb-6" />
                    <div className="w-full space-y-4">
                        {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)}
                    </div>
                </div>
            </div>
        );
    }

    const designConfig = profile.design_config || {};
    const theme = profile.selectedTheme || {};

    // Theme Variables with Fallbacks
    const bgColor = designConfig.backgroundColor || theme.backgroundColor || "#fafafa";
    const textColor = designConfig.textColor || theme.textColor || "#18181b";
    const buttonColor = designConfig.buttonColor || theme.buttonColor || "#000000";
    const buttonTextColor = designConfig.buttonTextColor || theme.buttonTextColor || "#ffffff";
    const blockStyle = designConfig.blockStyle || 'rounded';

    // Simple dark mode detection
    const isDarkTheme = ['#000000', '#18181b', '#09090b', '#121212'].some(c => bgColor.toLowerCase().includes(c));

    if (notFound || !profile) {
        return (
            <div className="min-h-screen w-full flex flex-col items-center justify-center text-center px-4" style={{ backgroundColor: bgColor, color: textColor }}>
                <div className="p-4 rounded-full mb-4 shadow-sm" style={{ backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.1)' : '#fff' }}>
                    <Link2 className="w-8 h-8 opacity-50" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Profile not found</h2>
                <Button onClick={() => navigate('/')} variant="outline" style={{ color: textColor, borderColor: textColor }}>Go Home</Button>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 w-full h-full font-sans selection:bg-zinc-200" style={{ backgroundColor: bgColor, color: textColor }}>

            {/* 1. Fixed Sticky Header */}
            <div className={cn(
                "absolute top-0 left-0 right-0 z-[60] h-[88px] flex items-end px-5 pb-3 transition-all duration-300 pointer-events-none",
                isScrolled ? "backdrop-blur-xl shadow-sm border-b border-black/5" : "bg-transparent"
            )} style={{ backgroundColor: isScrolled ? `${bgColor}90` : 'transparent' }}>
                <div className="flex items-center justify-between w-full max-w-md mx-auto pointer-events-auto">
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
                        <div
                            onClick={() => scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
                            className={cn(
                                "absolute left-0 flex items-center gap-2 transition-all duration-500 transform origin-left cursor-pointer",
                                isScrolled ? "opacity-100 translate-y-0 delay-75" : "opacity-0 translate-y-8"
                            )}>
                            <Avatar className="w-8 h-8 cursor-pointer border border-zinc-200/20">
                                <AvatarImage src={profile.avatar} className="object-cover" />
                                <AvatarFallback style={{ backgroundColor: buttonColor, color: buttonTextColor }} className="text-xs">{userInitial}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-bold line-clamp-1 truncate max-w-[120px]" style={{ color: textColor }}>{profile.name}</span>
                        </div>
                    </div>

                    {/* Share Button */}
                    <div className="flex items-center gap-2">
                        {authUser?.username === username && (
                            <Button size="icon" variant="ghost" className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 backdrop-blur-md"
                                style={{ color: textColor }}
                                onClick={() => navigate('/dashboard')}
                            >
                                <ExternalLink className="w-4 h-4" />
                            </Button>
                        )}
                        <Button size="icon" variant="ghost" onClick={() => setShareOpen(true)} className={cn(
                            "w-8 h-8 rounded-full transition-colors backdrop-blur-md",
                            isScrolled ? "hover:opacity-80" : "bg-black/20 text-white hover:bg-black/30 border border-white/10"
                        )} style={isScrolled ? { color: textColor, backgroundColor: `${textColor}10` } : {}}>
                            <Upload className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* 2. Main Scroll Container */}
            <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="w-full h-full overflow-y-auto overflow-x-hidden scrollbar-hide relative"
                style={{ backgroundColor: bgColor }}
            >
                {/* Max Width Container to mimic phone on desktop */}
                <div className="w-full max-w-md mx-auto min-h-full flex flex-col relative box-border shadow-2xl md:my-0 md:min-h-screen"
                    style={{ backgroundColor: bgColor }}
                >

                    {/* Cover Photo */}
                    <div className="h-64 w-full relative z-0 shrink-0">
                        {renderCoverMedia() || (
                            <div className="w-full h-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent pointer-events-none" />
                    </div>

                    {/* Uplifted Card */}
                    <div className="relative z-10 -mt-10 px-4 pb-12 flex-1 flex flex-col">
                        <div
                            className="w-full rounded-[2rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] p-5 pt-0 flex flex-col items-center animate-in slide-in-from-bottom-8 duration-700 fill-mode-both min-h-[60vh]"
                            style={{
                                backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.05)' : '#ffffff',
                                border: isDarkTheme ? '1px solid rgba(255,255,255,0.1)' : 'none'
                            }}
                        >

                            {/* Large Profile Header */}
                            <div className="relative -top-10 flex flex-col items-center mb-[-24px]">
                                <div className={cn(
                                    "w-24 h-24 rounded-full border-[5px] shadow-lg overflow-hidden mb-3 transition-all duration-300",
                                    scrollProgress > 0.2 ? "scale-90 opacity-80" : "scale-100 opacity-100"
                                )} style={{ borderColor: isDarkTheme ? '#18181b' : '#ffffff', backgroundColor: isDarkTheme ? '#18181b' : '#ffffff' }}>
                                    <Avatar className="w-full h-full">
                                        <AvatarImage src={profile.avatar} className="object-cover" />
                                        <AvatarFallback style={{ backgroundColor: buttonColor, color: buttonTextColor }} className="text-3xl font-bold">{userInitial}</AvatarFallback>
                                    </Avatar>
                                </div>
                                <div className={cn(
                                    "text-center transition-all duration-300",
                                    scrollProgress > 0.4 ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
                                )}>
                                    <h1 className="text-2xl font-black tracking-tight flex items-center gap-1.5 justify-center" style={{ color: textColor }}>
                                        {profile.name}
                                        {profile.is_email_verified && <BadgeCheck className="w-5 h-5 text-blue-500 fill-blue-500/10" />}
                                    </h1>
                                    <p className="text-sm font-medium opacity-60 mt-1" style={{ color: textColor }}>@{profile.username}</p>
                                    {profile.bio && <p className="text-sm mt-3 max-w-xs leading-relaxed opacity-80" style={{ color: textColor }}>{profile.bio}</p>}

                                    {/* Social Links */}
                                    {profile.social_links && Object.keys(profile.social_links).length > 0 && (
                                        <div className="flex gap-3 justify-center mt-4">
                                            {Object.entries(profile.social_links).map(([platform, url]: [string, any]) => {
                                                if (!url) return null;
                                                const Icon = getIconForThumbnail(platform);
                                                const href = url.startsWith('http') ? url : `https://${url}`;
                                                return Icon ? (
                                                    <a
                                                        key={platform}
                                                        href={href}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="w-8 h-8 rounded-full flex items-center justify-center hover:opacity-80 transition-colors"
                                                        style={{ backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.1)' : '#f4f4f5', color: textColor }}
                                                        onClick={() => trackClick(null, href)}
                                                    >
                                                        <Icon className="w-4 h-4" />
                                                    </a>
                                                ) : null;
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Navigation Toggles */}
                            <div className="flex w-full bg-zinc-100 p-1 rounded-full mb-6 relative z-20 mx-auto max-w-[200px]" style={{
                                backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.1)' : '#f4f4f5'
                            }}>
                                <button
                                    onClick={() => setActiveTab('personal')}
                                    className={cn(
                                        "flex-1 py-1.5 text-[11px] font-bold rounded-full transition-all flex items-center justify-center gap-1.5",
                                        activeTab === 'personal' ? "bg-white shadow-sm text-black" : "text-zinc-500 hover:text-zinc-700"
                                    )}
                                    style={activeTab === 'personal' ? { color: textColor, backgroundColor: isDarkTheme ? 'rgba(0,0,0,0.4)' : '#ffffff' } : { color: textColor, opacity: 0.6 }}
                                >
                                    Links
                                </button>
                                <button
                                    onClick={() => setActiveTab('store')}
                                    className={cn(
                                        "flex-1 py-1.5 text-[11px] font-bold rounded-full transition-all flex items-center justify-center gap-1.5",
                                        activeTab === 'store' ? "bg-white shadow-sm text-black" : "text-zinc-500 hover:text-zinc-700"
                                    )}
                                    style={activeTab === 'store' ? { color: textColor, backgroundColor: isDarkTheme ? 'rgba(0,0,0,0.4)' : '#ffffff' } : { color: textColor, opacity: 0.6 }}
                                >
                                    Store
                                </button>
                            </div>

                            {/* Content Area - Show Links or Products based on mode */}
                            <div className="w-full min-h-[300px]">
                                {activeTab === 'store' ? (
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
                                                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <div className="bg-white/90 backdrop-blur-md p-1.5 rounded-full shadow-sm cursor-pointer hover:bg-white transition-colors"
                                                                    onClick={(e) => handleLike(product._id, e)}
                                                                >
                                                                    <Heart className={cn("w-3.5 h-3.5", likedProductIds.has(product._id) ? "fill-red-500 text-red-500" : "text-zinc-600")} />
                                                                </div>
                                                            </div>
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
                                ) : (
                                    <div className="space-y-3 w-full animate-in slide-in-from-bottom duration-700 fade-in fill-mode-both" style={{ animationDelay: '100ms' }}>
                                        {blocks.filter(b => b.is_active).map((block) => {
                                            const Icon = block.thumbnail ? getIconForThumbnail(block.thumbnail) : null;
                                            const isUrlThumbnail = block.thumbnail && !Icon;

                                            return (
                                                <div
                                                    key={block._id}
                                                    onClick={() => handleBlockInteract(block)}
                                                    className="w-full p-4 rounded-2xl active:scale-[0.98] transition-all cursor-pointer border flex items-center justify-between group h-16 shadow-sm hover:shadow-md"
                                                    style={{
                                                        backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.08)' : '#fafafa',
                                                        borderColor: isDarkTheme ? 'rgba(255,255,255,0.05)' : '#f4f4f5',
                                                    }}
                                                >
                                                    <div className="flex items-center gap-4 w-full overflow-hidden">
                                                        {isUrlThumbnail ? (
                                                            <img src={block.thumbnail} className="w-10 h-10 rounded-full object-cover border border-zinc-200" />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border border-zinc-200 shadow-sm"
                                                                style={{ backgroundColor: isDarkTheme ? '#000' : '#fff', color: textColor }}>
                                                                {Icon ? <Icon className="w-5 h-5" /> : <ExternalLink className="w-5 h-5" />}
                                                            </div>
                                                        )}
                                                        <span className="text-sm font-bold truncate flex-1 text-left" style={{ color: textColor }}>{block.title}</span>
                                                    </div>
                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity -ml-4 group-hover:ml-0">
                                                        <ArrowRight className="w-4 h-4 opacity-50" style={{ color: textColor }} />
                                                    </div>
                                                </div>
                                            )
                                        })}
                                        {blocks.filter(b => b.is_active).length === 0 && (
                                            <div className="text-center py-12 opacity-50">
                                                <p className="text-sm font-medium" style={{ color: textColor }}>No links added yet.</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                        </div>

                        {/* Footer Branding */}
                        <div className="mt-8 flex flex-col items-center justify-center opacity-40 hover:opacity-100 transition-opacity pb-8">
                            <a href="/" className="flex items-center gap-1.5 grayscale hover:grayscale-0 transition-all">
                                <span className="text-[11px] font-bold" style={{ color: textColor }}>Powered by tapx.bio</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals & Overlays */}
            <LoginToContinueModal
                open={loginModal.open}
                onOpenChange={(open) => setLoginModal(prev => ({ ...prev, open }))}
                intentId={loginModal.intentId}
                ctaType={loginModal.ctaType}
                blockTitle={loginModal.blockTitle}
                onContinueAsGuest={handleGuestContinue}
            />

            <MessageSignupModal
                open={messageSignupOpen}
                onOpenChange={setMessageSignupOpen}
                intentUsername={username || ''}
                intentName={profile?.name || profile?.username || 'User'}
            />

            <EnquiryModal
                open={enquiryModal.open}
                onOpenChange={(open) => setEnquiryModal(prev => ({ ...prev, open }))}
                sellerId={profile?.id}
                blockId={enquiryModal.blockId}
                blockTitle={enquiryModal.blockTitle}
                ctaType={enquiryModal.ctaType}
                intentId={enquiryModal.intentId}
                onComplete={() => clearPendingIntent()}
            />

            <PaymentModal
                open={paymentModal.open}
                onOpenChange={(open) => setPaymentModal(prev => ({ ...prev, open }))}
                intentId={paymentModal.intentId}
                itemTitle={paymentModal.blockTitle || paymentModal.itemTitle}
                price={paymentModal.price}
                sellerId={paymentModal.sellerId}
                onComplete={() => clearPendingIntent()}
            />

            <ShareModal
                open={shareOpen}
                onOpenChange={setShareOpen}
                username={profile?.username}
                url={window.location.href}
                userAvatar={profile?.avatar}
                userName={profile?.name}
            />

            <ConnectWithSupplierModal
                open={connectModal.open}
                onOpenChange={(open) => setConnectModal(prev => ({ ...prev, open }))}
                product={connectModal.product}
                seller={connectModal.seller}
                onSuccess={(user) => {
                    toast.success(`Welcome, ${user.full_name}! You are now connected.`);
                }}
            />

            {/* Link Interstitial Overlay */}
            {selectedBlock && (
                <div className="fixed inset-0 bg-[#F2F7FD] z-[80] flex flex-col animate-in slide-in-from-bottom-10 duration-300">
                    {/* Header */}
                    <div className="px-6 py-4 flex items-center justify-between safe-area-top">
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" size="icon" onClick={() => setSelectedBlock(null)} className="-ml-2 hover:bg-black/5 rounded-full">
                                <ChevronLeft className="w-6 h-6 text-zinc-800" />
                            </Button>
                            <span className="font-semibold text-sm text-zinc-500 truncate max-w-[200px]">tapx.bio/{username}</span>
                        </div>
                        <Avatar className="w-9 h-9 border-2 border-white shadow-sm">
                            <AvatarImage src={profile?.avatar} />
                            <AvatarFallback>{userInitial}</AvatarFallback>
                        </Avatar>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 py-4 pb-32">
                        {/* Rating Badge */}
                        <div className="bg-white w-fit px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1 mb-4">
                            <Star className="w-3 h-3 text-black fill-black" />
                            <span className="text-xs font-bold">5.0</span>
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl font-black text-zinc-900 leading-tight mb-8 tracking-tight">
                            {selectedBlock.title}
                        </h1>

                        {/* Info Row */}
                        <div className="flex border-y border-zinc-200 divide-x divide-zinc-200 mb-8 bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="flex-1 py-4 px-4 flex items-center gap-3">
                                <ShoppingBag className="w-5 h-5 text-zinc-900" />
                                <span className="text-sm font-semibold text-zinc-700">Website Link</span>
                            </div>
                            <div className="flex-1 py-4 px-4 flex items-center gap-3">
                                <Sparkles className="w-5 h-5 text-zinc-900" />
                                <span className="text-sm font-semibold text-zinc-700">{selectedBlock.analytics?.clicks || 0} Visits</span>
                            </div>
                        </div>

                        {/* Description OR Large Thumbnail */}
                        <div className="space-y-6 mb-8">
                            {/* Only show thumbnail if it's a valid URL (not a social icon ID) */}
                            {selectedBlock.thumbnail && (selectedBlock.thumbnail.startsWith('http') || selectedBlock.thumbnail.startsWith('/')) && (
                                <div className="w-full aspect-video rounded-xl overflow-hidden shadow-sm border border-zinc-100">
                                    <img src={selectedBlock.thumbnail} className="w-full h-full object-cover" alt={selectedBlock.title} />
                                </div>
                            )}

                            {selectedBlock.content?.description && (
                                <div className="prose prose-sm prose-zinc max-w-none text-zinc-600 leading-relaxed">
                                    <p>{selectedBlock.content.description}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bottom Sticky Action */}
                    <div className="fixed bottom-0 w-full bg-white border-t border-zinc-100 p-4 safe-area-bottom shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-[90]">
                        <p className="text-xs font-medium text-zinc-500 mb-3 text-center animate-pulse">
                            Redirecting to website in {countdown} seconds ...
                        </p>
                        <Button
                            onClick={proceedToLink}
                            className="w-full h-12 bg-black text-white font-bold text-base rounded-lg hover:bg-zinc-800 transition-all flex items-center justify-center gap-2"
                        >
                            Continue to Link
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Product Detail Overlay */}
            {selectedProduct && (
                <div className="fixed inset-0 z-[80] flex justify-center bg-zinc-50/50 backdrop-blur-sm animate-in slide-in-from-bottom duration-300">
                    <div className="w-full max-w-md mx-auto h-full bg-white flex flex-col shadow-2xl relative">
                        <div className="p-4 border-b border-zinc-100 flex items-center justify-between sticky top-0 bg-white z-10 safe-area-top">
                            <Button variant="ghost" size="icon" onClick={() => setSelectedProduct(null)} className="-ml-2">
                                <ChevronLeft className="w-6 h-6" />
                            </Button>
                            <span className="font-bold text-sm">Product Details</span>
                            <div className="w-9" />
                        </div>
                        <div className="flex-1 overflow-y-auto p-5 pb-32">
                            <div className="aspect-video bg-zinc-100 rounded-2xl overflow-hidden mb-6 shadow-sm border border-zinc-100 relative">
                                {selectedProduct.image_url ?
                                    <img src={selectedProduct.image_url} className="w-full h-full object-cover" /> :
                                    <div className="w-full h-full flex items-center justify-center text-4xl">🛍️</div>
                                }
                                <div className="absolute top-3 right-3">
                                    <div className="bg-white/90 backdrop-blur-md p-2 rounded-full shadow-sm cursor-pointer hover:bg-white transition-colors"
                                        onClick={(e) => handleLike(selectedProduct._id, e)}
                                    >
                                        <Heart className={cn("w-5 h-5", likedProductIds.has(selectedProduct._id) ? "fill-red-500 text-red-500" : "text-zinc-600")} />
                                    </div>
                                </div>
                            </div>
                            <h1 className="text-2xl font-black mb-2 leading-tight text-zinc-900">{selectedProduct.title}</h1>
                            <div className="flex items-center gap-2 mb-6">
                                <span className="text-xl font-bold text-green-600">₹{selectedProduct.price}</span>
                                {selectedProduct.originalPrice && <span className="text-sm text-zinc-400 line-through">₹{selectedProduct.originalPrice}</span>}
                            </div>

                            {selectedProduct.description && (
                                <div className="prose prose-sm prose-zinc max-w-none">
                                    <p className="text-zinc-600 leading-relaxed">{selectedProduct.description}</p>
                                </div>
                            )}
                        </div>

                        {/* Sticky Buy/Enquire Bar - Only if description exists */}
                        {selectedProduct.description && (
                            <div className="p-4 border-t border-zinc-100 absolute bottom-0 w-full bg-white safe-area-bottom shadow-[0_-5px_20px_rgba(0,0,0,0.05)] flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => handleProductAction(selectedProduct, 'enquire')}
                                    className="flex-1 h-12 rounded-xl font-bold text-base border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                                >
                                    Enquire Now
                                </Button>
                                <Button
                                    onClick={() => handleProductAction(selectedProduct, 'buy')}
                                    className="flex-1 h-12 rounded-xl bg-black text-white font-bold text-base shadow-lg hover:bg-zinc-800 transition-colors"
                                >
                                    Buy Now
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PublicProfile;
