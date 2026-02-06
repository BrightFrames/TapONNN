import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { io } from "socket.io-client";
import { useAuth } from "@/contexts/AuthContext";
import { templates } from "@/data/templates";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Sparkles, Share2, Link2, MessageCircle, Search, ExternalLink, ArrowRight, ShoppingBag, Star, ChevronLeft, BadgeCheck, Heart, Upload, Bell, Info, CheckCircle, AlertTriangle, PartyPopper } from "lucide-react";
import EnquiryModal from "@/components/EnquiryModal";
import PaymentModal from "@/components/PaymentModal";
import LoginToContinueModal from "@/components/LoginToContinueModal";
import ShareModal from "@/components/ShareModal";
import ConnectWithSupplierModal from "@/components/ConnectWithSupplierModal";
import { MessageSignupModal } from "@/components/MessageSignupModal";
import { QuickAuthModal } from "@/components/QuickAuthModal";
import { StoreUpdates } from "@/components/StoreUpdates";
import useIntent, { getPendingIntent, clearPendingIntent } from "@/hooks/useIntent";
import { toast } from "sonner";
import { getIconForThumbnail } from "@/utils/socialIcons";
import { useAnalytics } from "@/hooks/useAnalytics";
import { cn } from "@/lib/utils";

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

    // Derived Products Data
    const featuredProducts = (products || []).filter(p => p.is_featured);
    const regularProducts = (products || []).filter(p => !p.is_featured);
    const filteredProducts = (products || []).filter(p => 
        p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
    const [quickAuthOpen, setQuickAuthOpen] = useState(false);

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
                design_config: userProfile.design_config,
                has_store: userProfile.has_store,
                show_stores_on_profile: userProfile.show_stores_on_profile ?? false,
                visible_stores: userProfile.visible_stores || []
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
        const { coverType, coverUrl, coverYoutubeUrl, coverColor } = designConfig;

        // Force cover URL if provided (legacy support)
        const finalCoverUrl = coverUrl || profile.design_config?.bgImageUrl;

        // Handle solid color background
        if (coverType === 'color' && coverColor) {
            return <div className="w-full h-full" style={{ backgroundColor: coverColor }} />;
        }
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

    if (notFound || !profile) {
        return (
            <div className="min-h-screen w-full flex flex-col items-center justify-center text-center px-4 bg-zinc-50">
                <div className="p-4 rounded-full mb-4 shadow-sm bg-white">
                    <Link2 className="w-8 h-8 opacity-50 text-zinc-400" />
                </div>
                <h2 className="text-2xl font-bold mb-2 text-zinc-900">Profile not found</h2>
                <p className="text-zinc-500 mb-6 text-sm">The bio link you're looking for doesn't exist or has been moved.</p>
                <Button onClick={() => navigate('/')} variant="outline" className="rounded-xl border-zinc-200 text-zinc-900">Go Home</Button>
            </div>
        );
    }

    const designConfig = profile.design_config || {};
    const theme = profile.selectedTheme || {};

    // Helper to convert Tailwind class names to hex colors
    const tailwindToHex = (cls: string, type: 'text' | 'bg'): string => {
        if (!cls) return type === 'text' ? '#000000' : '#ffffff';
        if (cls.startsWith('#')) return cls;
        if (cls.startsWith('rgb')) return cls;
        // Pass through gradients as-is
        if (cls.includes('gradient') || cls.includes('linear')) return cls;

        // Handle text colors
        if (cls.includes('white')) return '#ffffff';
        if (cls.includes('black')) return '#000000';
        if (cls.includes('zinc-900') || cls.includes('gray-900')) return '#18181b';
        if (cls.includes('zinc-50') || cls.includes('gray-50')) return '#fafafa';

        // Extract hex from arbitrary values like text-[#abc123] or bg-[#abc123]
        const hexMatch = cls.match(/\[#([a-fA-F0-9]+)\]/);
        if (hexMatch) return `#${hexMatch[1]}`;

        return type === 'text' ? '#000000' : '#ffffff';
    };

    // Helper to convert hex color to rgba with opacity
    const hexToRgba = (hex: string, alpha: number): string => {
        if (!hex || hex.includes('rgb') || hex.includes('gradient')) return `rgba(0,0,0,${alpha})`;
        const cleanHex = hex.replace('#', '');
        const fullHex = cleanHex.length === 3
            ? cleanHex.split('').map(c => c + c).join('')
            : cleanHex;
        const r = parseInt(fullHex.substring(0, 2), 16);
        const g = parseInt(fullHex.substring(2, 4), 16);
        const b = parseInt(fullHex.substring(4, 6), 16);
        return `rgba(${r},${g},${b},${alpha})`;
    };

    // Theme Variables with Fallbacks - prioritize design_config from profile
    // Convert any Tailwind classes to proper hex values
    const rawBgColor = designConfig.backgroundColor || theme.backgroundColor || "#fafafa";
    const rawTextColor = designConfig.textColor || theme.textColor || "#18181b";
    const rawButtonColor = designConfig.buttonColor || theme.buttonColor || "#000000";
    const rawButtonTextColor = designConfig.buttonTextColor || theme.buttonTextColor || "#ffffff";

    const bgColor = tailwindToHex(rawBgColor, 'bg');
    const textColor = tailwindToHex(rawTextColor, 'text');
    const buttonColor = tailwindToHex(rawButtonColor, 'bg');
    const buttonTextColor = tailwindToHex(rawButtonTextColor, 'text');
    const blockStyle = designConfig.blockStyle || 'rounded';

    // Helper to determine if a color is light or dark
    const isColorLight = (color: string) => {
        if (!color) return false;

        // First convert from Tailwind class if needed
        let hexColor = color.startsWith('#') ? color : tailwindToHex(color, 'text');

        // Handle gradients - extract the first color
        if (hexColor.includes('gradient') || hexColor.includes('linear')) {
            const match = hexColor.match(/#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})/);
            if (match) hexColor = match[0];
            else return false; // Can't determine
        }

        const hex = hexColor.replace('#', '');
        if (!/^[a-fA-F0-9]{3,6}$/.test(hex)) return false; // Invalid hex

        // Handle short hex (e.g., #fff)
        const fullHex = hex.length === 3 ? hex.split('').map(c => c + c).join('') : hex;
        const r = parseInt(fullHex.substring(0, 2), 16);
        const g = parseInt(fullHex.substring(2, 4), 16);
        const b = parseInt(fullHex.substring(4, 6), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness > 128;
    };

    // Dark theme detection - check both background and text
    // If background is dark (not light) OR if it's a gradient, treat as dark theme
    const bgIsLight = isColorLight(bgColor);
    const textIsLight = isColorLight(textColor);
    // A theme is "dark" if background is dark OR if background is a gradient (gradients are usually dark/colorful)
    // Also check if the background contains gradient keywords or is not a simple light color
    const isDarkTheme = !bgIsLight || bgColor.includes('gradient') || bgColor.includes('linear') || bgColor.includes('rgb');

    // Card background - semi-transparent for better blending with theme
    // Products should have a subtle overlay effect that works with any background
    const cardBgColor = isDarkTheme
        ? 'rgba(255, 255, 255, 0.08)'
        : 'rgba(255, 255, 255, 0.85)';

    // Helper to get background style object (handles both colors and gradients)
    const getBackgroundStyle = (color: string) => {
        if (color.includes('gradient') || color.includes('linear')) {
            return { background: color };
        }
        return { backgroundColor: color };
    };

    return (
        <div className="fixed inset-0 w-full h-full font-sans selection:bg-zinc-200 overflow-hidden" style={{ color: textColor }}>
            
            {/* Background Blur Layer - Fills the entire screen with the cover photo's colors */}
            <div 
                className="absolute inset-0 z-0 transition-all duration-1000 ease-out pointer-events-none"
                style={{
                    backgroundColor: bgColor,
                }}
            >
                {/* Blurred Cover Image Background */}
                <div 
                    className="absolute inset-0 opacity-40 blur-[80px] saturate-[1.8] scale-110"
                    style={{
                        background: (profile.design_config?.coverUrl || profile.design_config?.bgImageUrl) 
                            ? `url(${profile.design_config.coverUrl || profile.design_config.bgImageUrl}) center/cover no-repeat` 
                            : (profile.design_config?.coverColor || bgColor),
                    }}
                />
                
                {/* Dynamic Gradient Overlay that responds to scroll */}
                <div 
                    className="absolute inset-0 transition-opacity duration-700"
                    style={{
                        background: `linear-gradient(135deg, ${hexToRgba(bgColor, 0.9)}, ${hexToRgba(bgColor, 0.7)}, ${hexToRgba(buttonColor, 0.3)})`,
                        opacity: 0.8 + (scrollProgress * 0.2)
                    }}
                />
            </div>

            {/* 1. Fixed Sticky Header */}
            <div className="fixed top-0 left-0 right-0 z-[60] pointer-events-none">
                <div className={cn(
                    "flex items-end justify-between w-full max-w-md mx-auto h-[88px] px-5 pb-3 transition-all duration-500 pointer-events-auto",
                    isScrolled ? "backdrop-blur-xl shadow-lg border-x border-b rounded-b-[2.5rem]" : "bg-transparent"
                )} style={isScrolled ? {
                    backgroundColor: cardBgColor,
                    borderColor: isDarkTheme ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.3)',
                    boxShadow: isDarkTheme ? '0 10px 30px -10px rgba(0,0,0,0.5)' : '0 10px 30px -10px rgba(0,0,0,0.1)'
                } : { backgroundColor: 'transparent' }}>
                    <div className="flex items-center gap-2 h-9 overflow-visible relative w-40">
                        {/* Tapx Logo */}
                        <div
                            onClick={() => setQuickAuthOpen(true)}
                            className={cn(
                                "absolute left-0 flex items-center gap-1.5 transition-all duration-500 transform origin-left px-2.5 py-1 rounded-full cursor-pointer hover:scale-105",
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
                className="w-full h-full overflow-y-auto overflow-x-hidden scrollbar-hide relative z-10"
            >
                {/* Max Width Container to mimic phone on desktop */}
                <div className="w-full max-w-md mx-auto min-h-full flex flex-col relative box-border md:my-0 md:min-h-screen">

                    {/* Cover Photo - The "Pink" or Image area */}
                    <div className="h-[28rem] w-full relative z-0 shrink-0 overflow-hidden">
                        <div
                            className="w-full h-full transition-all duration-500 ease-out origin-top"
                            style={{
                                filter: `blur(${scrollProgress * 40}px) saturate(${1 + scrollProgress})`,
                                transform: `scale(${1 + scrollProgress * 0.2}) translateY(${scrollProgress * 20}px)`,
                            }}
                        >
                            {renderCoverMedia() || (
                                <div className="w-full h-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 animate-gradient-slow" />
                            )}
                        </div>
                        
                        {/* Smooth Gradient Overlay for transition to content */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10 pointer-events-none" />
                        
                        {/* Scroll-dependent overlay to darken/blur as we move down */}
                        <div 
                            className="absolute inset-0 bg-black/10 backdrop-blur-sm transition-opacity duration-300 pointer-events-none"
                            style={{ opacity: Math.max(0, scrollProgress - 0.2) }}
                        />
                    </div>

                    {/* Uplifted Card */}
                    <div className="relative z-10 -mt-24 px-0 pb-12 flex-1 flex flex-col">
                        <div
                            className="w-full rounded-[2.5rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)] p-5 pt-0 flex flex-col items-center animate-in slide-in-from-bottom-12 duration-1000 fill-mode-both min-h-[70vh] relative overflow-hidden backdrop-blur-md"
                            style={{
                                backgroundColor: isDarkTheme ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.92)',
                                border: isDarkTheme ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(255,255,255,0.3)',
                                boxShadow: isDarkTheme ? '0 25px 50px -12px rgba(0,0,0,0.5)' : '0 25px 50px -12px rgba(0,0,0,0.15)'
                            }}
                        >
                            {/* Profile Avatar Background - Full Silhouette */}
                            {profile.avatar && (
                                <div
                                    className="absolute inset-x-0 top-0 z-0 pointer-events-none"
                                    style={{
                                        height: '70%',
                                        backgroundImage: `url(${profile.avatar})`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center top',
                                        filter: 'brightness(0.35) saturate(1.1)',
                                    }}
                                />
                            )}
                            {/* Gradient Overlay - Fade to dark at bottom */}
                            <div
                                className="absolute inset-0 z-0 pointer-events-none"
                                style={{
                                    background: 'linear-gradient(to bottom, transparent 0%, transparent 30%, rgba(0,0,0,0.8) 60%, rgba(0,0,0,1) 100%)',
                                }}
                            />

                            {/* Large Profile Header */}
                            <div className="relative z-10 pt-14 flex flex-col items-center mb-8 w-full px-6">
                                <div className={cn(
                                    "w-28 h-28 rounded-full border-[6px] shadow-2xl overflow-hidden mb-6 transition-all duration-300",
                                    scrollProgress > 0.2 ? "scale-90 opacity-80" : "scale-100 opacity-100"
                                )} style={{ borderColor: isDarkTheme ? 'rgba(255,255,255,0.1)' : '#ffffff', backgroundColor: isDarkTheme ? bgColor : cardBgColor }}>
                                    <Avatar className="w-full h-full">
                                        <AvatarImage src={profile.avatar} className="object-cover" />
                                        <AvatarFallback style={{ backgroundColor: buttonColor, color: buttonTextColor }} className="text-4xl font-bold">{userInitial}</AvatarFallback>
                                    </Avatar>
                                </div>
                                <div className={cn(
                                    "text-center transition-all duration-300 w-full",
                                    scrollProgress > 0.4 ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
                                )}>
                                    <h1 className="text-3xl font-black tracking-tighter flex items-center gap-2 justify-center" style={{ color: textColor }}>
                                        {profile.name}
                                        {profile.is_email_verified && <BadgeCheck className="w-6 h-6 text-blue-500 fill-blue-500/10" />}
                                    </h1>
                                    <p className="text-base font-bold opacity-40 mt-0.5 tracking-tight" style={{ color: textColor }}>@{profile.username}</p>
                                    
                                    {profile.bio && (
                                        <div className="mt-4 px-2">
                                            <p className="text-sm font-medium leading-relaxed opacity-70 max-w-[280px] mx-auto" style={{ color: textColor }}>
                                                {profile.bio}
                                            </p>
                                        </div>
                                    )}

                                    {/* Social Links */}
                                    {profile.social_links && Object.keys(profile.social_links).length > 0 && (
                                        <div className="flex gap-4 justify-center mt-6">
                                            {Object.entries(profile.social_links).map(([platform, url]: [string, any]) => {
                                                if (!url) return null;
                                                const Icon = getIconForThumbnail(platform);
                                                const href = url.startsWith('http') ? url : `https://${url}`;
                                                
                                                // Check if it's a brand icon to decide on styling
                                                const isBrandIcon = ['instagram', 'facebook', 'twitter', 'youtube', 'linkedin', 'whatsapp', 'telegram', 'github'].includes(platform.toLowerCase());
                                                
                                                return Icon ? (
                                                    <a
                                                        key={platform}
                                                        href={href}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="w-10 h-10 rounded-xl flex items-center justify-center hover:scale-110 transition-all duration-200 shadow-sm"
                                                        style={{ 
                                                            backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.05)' : '#ffffff',
                                                            border: isDarkTheme ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)'
                                                        }}
                                                        onClick={() => trackClick(null, href)}
                                                    >
                                                        <Icon className={cn("w-5 h-5", !isBrandIcon && "currentColor")} style={!isBrandIcon ? { color: textColor } : {}} />
                                                    </a>
                                                ) : null;
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Navigation Toggles - Only show if profile has a store and wants to show it */}
                            {!profile?.is_store_identity && profile?.show_stores_on_profile && (
                                <div className="flex w-full bg-zinc-100 p-1 rounded-full mb-6 relative z-20 mx-auto max-w-[200px]" style={{
                                    backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.1)' : `${textColor}10`
                                }}>
                                    <button
                                        onClick={() => setActiveTab('personal')}
                                        className={cn(
                                            "flex-1 py-1.5 text-[11px] font-bold rounded-full transition-all flex items-center justify-center gap-1.5",
                                            activeTab === 'personal' ? "shadow-sm" : "opacity-60 hover:opacity-100"
                                        )}
                                        style={activeTab === 'personal' ? { color: isDarkTheme ? '#ffffff' : '#000000', backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.1)' : '#ffffff' } : { color: textColor }}
                                    >
                                        Links
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('store')}
                                        className={cn(
                                            "flex-1 py-1.5 text-[11px] font-bold rounded-full transition-all flex items-center justify-center gap-1.5",
                                            activeTab === 'store' ? "shadow-sm" : "opacity-60 hover:opacity-100"
                                        )}
                                        style={activeTab === 'store' ? { color: isDarkTheme ? '#ffffff' : '#000000', backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.1)' : '#ffffff' } : { color: textColor }}
                                    >
                                        Stores
                                    </button>
                                </div>
                            )}

                            {/* Content Area - Show Products, Stores, or Links based on profile type and settings */}
                            <div className="w-full min-h-[300px] relative z-10">
                                {profile?.is_store_identity ? (
                                    <div className="space-y-6 px-1 pb-24 animate-in slide-in-from-bottom duration-700 fade-in fill-mode-both" style={{ animationDelay: '100ms' }}>
                                        
                                        {/* 1. Featured Products (High UI Level Card) */}
                                        {featuredProducts.length > 0 && (
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between px-1">
                                                    <h2 className="text-lg font-black tracking-tight flex items-center gap-2" style={{ color: textColor }}>
                                                        <Sparkles className="w-4 h-4" style={{ color: isDarkTheme ? '#ffffff' : '#000000' }} />
                                                        Top Picks
                                                    </h2>
                                                </div>
                                                <div className="flex flex-nowrap overflow-x-auto gap-5 pb-6 scrollbar-hide snap-x px-1">
                                                    {featuredProducts.map((product) => (
                                                        <div
                                                            key={product._id}
                                                            onClick={() => setSelectedProduct(product)}
                                                            className="min-w-[280px] snap-center rounded-[2.5rem] overflow-hidden border relative flex flex-col group transition-all active:scale-[0.98] shadow-2xl backdrop-blur-xl"
                                                            style={{ 
                                                                backgroundColor: isDarkTheme ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
                                                                borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0,0,0,0.06)',
                                                                boxShadow: isDarkTheme ? '0 20px 50px rgba(0,0,0,0.5)' : '0 10px 40px rgba(0,0,0,0.04)'
                                                            }}
                                                        >
                                                            {/* Badge */}
                                                            {product.badge && (
                                                                <div className="absolute top-6 right-6 z-20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm text-white"
                                                                    style={{ backgroundColor: buttonColor }}
                                                                >
                                                                    {product.badge}
                                                                </div>
                                                            )}
                                                            
                                                            <div className="aspect-square relative p-8 flex items-center justify-center" style={{ backgroundColor: isDarkTheme ? 'rgba(255, 255, 255, 0.02)' : 'transparent' }}>
                                                                {product.image_url ? (
                                                                    <img src={product.image_url} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-5xl bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl text-zinc-300">🛍️</div>
                                                                )}
                                                            </div>
                                                            
                                                            <div className="px-6 pb-8 pt-2 flex flex-col">
                                                                <h3 className="text-xl font-bold leading-tight line-clamp-2 mb-2" style={{ color: textColor }}>{product.title}</h3>
                                                                <p className="text-xs line-clamp-2 min-h-[32px] mb-4 leading-relaxed opacity-60" style={{ color: textColor }}>{product.description}</p>
                                                                
                                                                <div className="space-y-1 mb-6">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-sm font-semibold opacity-50" style={{ color: textColor }}>Price:</span>
                                                                        <span className="text-base font-black" style={{ color: textColor }}>₹{product.price}</span>
                                                                        {product.discount_price && (
                                                                            <span className="text-sm opacity-30 line-through" style={{ color: textColor }}>₹{product.discount_price}</span>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-sm font-semibold opacity-50" style={{ color: textColor }}>Stock:</span>
                                                                        <span className={cn(
                                                                            "text-sm font-bold",
                                                                            product.stock_status === 'out_of_stock' ? "text-red-500" : (isDarkTheme ? "text-green-400" : "text-green-600")
                                                                        )}>
                                                                            {product.stock_status === 'out_of_stock' ? 'Out of Stock' : 'In Stock'}
                                                                        </span>
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center gap-3">
                                                                    <Button 
                                                                        variant="outline"
                                                                        className="flex-1 rounded-2xl h-12 font-bold text-sm transition-all"
                                                                        style={{ 
                                                                            borderColor: isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                                                                            backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'white',
                                                                            color: textColor
                                                                        }}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleProductAction(product, 'enquire');
                                                                        }}
                                                                    >
                                                                        Enquire
                                                                    </Button>
                                                                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center border transition-colors group/heart"
                                                                        style={{ 
                                                                            borderColor: isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                                                                            backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'white'
                                                                        }}
                                                                        onClick={(e) => handleLike(product._id, e)}
                                                                    >
                                                                        <Heart className={cn("w-5 h-5 transition-all", likedProductIds.has(product._id) ? "fill-red-500 text-red-500 scale-110" : "text-zinc-300")} />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* 2. Rest of the Products (The Grid) */}
                                        <div className="space-y-4">
                                            {featuredProducts.length > 0 && products.length > 0 && (
                                                <h2 className="text-sm font-black opacity-30 uppercase tracking-[0.2em] px-1" style={{ color: textColor }}>
                                                    All Products
                                                </h2>
                                            )}

                                            {/* Search Bar - Only for Store Identity or if products exist */}
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
                                                        className="w-full h-11 pl-10 pr-4 rounded-xl text-sm border focus:outline-none focus:ring-2 transition-all"
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
                                                            className="rounded-xl overflow-hidden shadow-lg cursor-pointer hover:shadow-xl transition-all active:scale-[0.98] group flex flex-col backdrop-blur-xl"
                                                            style={{ 
                                                                backgroundColor: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.7)',
                                                                border: `1px solid ${isDarkTheme ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)'}`,
                                                                boxShadow: isDarkTheme 
                                                                    ? '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)' 
                                                                    : '0 8px 32px rgba(0, 0, 0, 0.1)'
                                                            }}
                                                            onClick={() => setSelectedProduct(product)}
                                                        >
                                                            <div className="aspect-square relative overflow-hidden" style={{ backgroundColor: isDarkTheme ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)' }}>
                                                                {product.image_url ? (
                                                                    <img src={product.image_url} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-2xl">🛍️</div>
                                                                )}
                                                                
                                                                {/* Grid View Badges */}
                                                                {product.badge && (
                                                                    <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full text-[8px] font-black uppercase text-white shadow-md"
                                                                        style={{ backgroundColor: buttonColor }}
                                                                    >
                                                                        {product.badge}
                                                                    </div>
                                                                )}

                                                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <div className="backdrop-blur-md p-1.5 rounded-full shadow-sm cursor-pointer transition-colors"
                                                                        style={{ backgroundColor: isDarkTheme ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.9)' }}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleLike(product._id, e);
                                                                        }}
                                                                    >
                                                                        <Heart className={cn("w-3.5 h-3.5", likedProductIds.has(product._id) ? "fill-red-500 text-red-500" : "")} style={{ color: likedProductIds.has(product._id) ? undefined : textColor }} />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="p-3 backdrop-blur-xl" style={{ backgroundColor: isDarkTheme ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.5)' }}>
                                                                <h3 className="font-semibold text-xs line-clamp-1" style={{ color: textColor }}>{product.title}</h3>
                                                                <div className="flex items-center gap-1.5 mt-1">
                                                                    <p className="text-[10px] font-bold" style={{ color: textColor, opacity: 0.8 }}>₹{product.price}</p>
                                                                    {product.discount_price && (
                                                                        <p className="text-[8px] opacity-40 line-through" style={{ color: textColor }}>₹{product.discount_price}</p>
                                                                    )}
                                                                </div>
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

                                            {/* Store Updates Section */}
                                            <StoreUpdates 
                                                sellerId={profile?.id} 
                                                textColor={textColor} 
                                                isDarkTheme={isDarkTheme} 
                                            />
                                        </div>
                                    </div>
                                ) : profile?.show_stores_on_profile && activeTab === 'store' ? (

                                    <div className="space-y-4 px-1 pb-24 animate-in slide-in-from-bottom duration-700 fade-in fill-mode-both" style={{ animationDelay: '100ms' }}>
                                        {profile?.visible_stores?.length > 0 ? (
                                            <div className="grid grid-cols-1 gap-3">
                                                {profile.visible_stores.map((store: any) => (
                                                    <div
                                                        key={store._id}
                                                        onClick={() => navigate(`/s/${store.username}`)}
                                                        className="w-full p-4 rounded-2xl active:scale-[0.98] transition-all cursor-pointer border flex items-center justify-between group h-20 shadow-sm hover:shadow-md backdrop-blur-xl"
                                                        style={{
                                                            backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.7)',
                                                            borderColor: isDarkTheme ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
                                                        }}
                                                    >
                                                        <div className="flex items-center gap-4 w-full overflow-hidden">
                                                            <Avatar className="w-12 h-12 border-2 border-white/20">
                                                                <AvatarImage src={store.avatar_url || profile.avatar} />
                                                                <AvatarFallback style={{ backgroundColor: buttonColor, color: buttonTextColor }}>
                                                                    {store.store_name?.charAt(0) || 'S'}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex flex-col text-left">
                                                                <span className="text-[15px] font-black" style={{ color: textColor }}>{store.store_name}</span>
                                                                <span className="text-xs opacity-60" style={{ color: textColor }}>@{store.username}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <ArrowRight className="w-5 h-5 opacity-40 group-hover:opacity-100 transition-all" style={{ color: textColor }} />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-20 opacity-60">
                                                <ShoppingBag className="w-8 h-8 mx-auto mb-3" style={{ color: textColor, opacity: 0.4 }} />
                                                <p className="text-sm font-bold" style={{ color: textColor }}>No stores currently visible</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-3 w-full animate-in slide-in-from-bottom duration-700 fade-in fill-mode-both" style={{ animationDelay: '100ms' }}>
                                        {/* Update/Notification Blocks - Show at top */}
                                        {blocks.filter(b => b.is_active && b.block_type === 'update').map((block) => {
                                            const styleConfig = {
                                                info: { icon: Info, bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.3)', iconColor: '#3b82f6' },
                                                success: { icon: CheckCircle, bg: 'rgba(34, 197, 94, 0.15)', border: 'rgba(34, 197, 94, 0.3)', iconColor: '#22c55e' },
                                                warning: { icon: AlertTriangle, bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)', iconColor: '#f59e0b' },
                                                promo: { icon: PartyPopper, bg: 'rgba(168, 85, 247, 0.15)', border: 'rgba(168, 85, 247, 0.3)', iconColor: '#a855f7' },
                                            };
                                            const style = block.content?.style || 'info';
                                            const config = styleConfig[style as keyof typeof styleConfig] || styleConfig.info;
                                            const UpdateIcon = config.icon;

                                            return (
                                                <div
                                                    key={block._id}
                                                    onClick={() => block.content?.url && handleBlockInteract(block)}
                                                    className={`w-full p-4 rounded-2xl transition-all border ${block.content?.url ? 'cursor-pointer active:scale-[0.98] hover:shadow-md' : ''}`}
                                                    style={{
                                                        backgroundColor: config.bg,
                                                        borderColor: config.border,
                                                    }}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: config.iconColor + '20' }}>
                                                            <UpdateIcon className="w-4 h-4" style={{ color: config.iconColor }} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="text-sm font-bold" style={{ color: textColor }}>{block.title}</h4>
                                                            {block.content?.message && (
                                                                <p className="text-xs mt-1 opacity-80" style={{ color: textColor }}>{block.content.message}</p>
                                                            )}
                                                        </div>
                                                        {block.content?.url && (
                                                            <ArrowRight className="w-4 h-4 opacity-50 shrink-0 mt-1" style={{ color: textColor }} />
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        {/* Regular Link Blocks */}
                                        {blocks.filter(b => b.is_active && b.block_type !== 'update').map((block) => {
                                            const Icon = block.thumbnail ? getIconForThumbnail(block.thumbnail) : null;
                                            const isUrlThumbnail = block.thumbnail && !Icon;
                                            const blockUrl = block.content?.url || block.url;

                                            return (
                                                <div
                                                    key={block._id}
                                                    onClick={() => handleBlockInteract(block)}
                                                    className="w-full p-4 rounded-2xl active:scale-[0.98] transition-all cursor-pointer border flex items-center justify-between group h-16 shadow-sm hover:shadow-md"
                                                    style={{
                                                        backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.08)' : `${textColor}08`,
                                                        borderColor: isDarkTheme ? 'rgba(255,255,255,0.05)' : `${textColor}10`,
                                                    }}
                                                >
                                                    <div className="flex items-center gap-4 w-full overflow-hidden">
                                                        {isUrlThumbnail ? (
                                                            <img src={block.thumbnail} className="w-10 h-10 rounded-full object-cover border border-zinc-200" />
                                                        ) : Icon ? (
                                                            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border shadow-sm"
                                                                style={{ backgroundColor: isDarkTheme ? bgColor : cardBgColor, color: textColor, borderColor: `${textColor}15` }}>
                                                                <Icon className="w-5 h-5" />
                                                            </div>
                                                        ) : blockUrl ? (
                                                            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border shadow-sm overflow-hidden"
                                                                style={{ backgroundColor: isDarkTheme ? bgColor : cardBgColor, borderColor: `${textColor}15` }}>
                                                                <Favicon
                                                                    url={blockUrl}
                                                                    className="w-6 h-6 object-contain"
                                                                    fallback={<ExternalLink className="w-5 h-5" style={{ color: textColor }} />}
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border shadow-sm"
                                                                style={{ backgroundColor: isDarkTheme ? bgColor : cardBgColor, color: textColor, borderColor: `${textColor}15` }}>
                                                                <ExternalLink className="w-5 h-5" />
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

            <QuickAuthModal
                open={quickAuthOpen}
                onOpenChange={setQuickAuthOpen}
            />

            {/* Link Interstitial Overlay */}
            {selectedBlock && (
                <div className="fixed inset-0 z-[80] flex flex-col animate-in slide-in-from-bottom-10 duration-300"
                    style={{ backgroundColor: isDarkTheme ? '#09090b' : '#F2F7FD' }}
                >
                    {/* Header */}
                    <div className="px-6 py-4 flex items-center justify-between safe-area-top">
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" size="icon" onClick={() => setSelectedBlock(null)} className="-ml-2 hover:bg-black/5 rounded-full" style={{ color: textColor }}>
                                <ChevronLeft className="w-6 h-6" />
                            </Button>
                            <span className="font-semibold text-sm opacity-50 truncate max-w-[200px]" style={{ color: textColor }}>tapx.bio/{username}</span>
                        </div>
                        <Avatar className="w-9 h-9 border-2 border-white shadow-sm">
                            <AvatarImage src={profile?.avatar} />
                            <AvatarFallback>{userInitial}</AvatarFallback>
                        </Avatar>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 py-4 pb-32">
                        {/* Rating Badge */}
                        <div className="w-fit px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1 mb-4"
                            style={{ backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.1)' : '#ffffff' }}
                        >
                            <Star className="w-3 h-3 text-black dark:text-white fill-current" />
                            <span className="text-xs font-bold" style={{ color: textColor }}>5.0</span>
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl font-black leading-tight mb-8 tracking-tight" style={{ color: textColor }}>
                            {selectedBlock.title}
                        </h1>

                        {/* Info Row */}
                        <div className="flex border-y divide-x mb-8 rounded-xl shadow-sm overflow-hidden"
                            style={{ 
                                backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.05)' : '#ffffff',
                                borderColor: isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                                divideColor: isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                            }}
                        >
                            <div className="flex-1 py-4 px-4 flex items-center gap-3">
                                {(selectedBlock.content?.url || selectedBlock.url) ? (
                                    <Favicon
                                        url={selectedBlock.content?.url || selectedBlock.url}
                                        className="w-5 h-5 object-contain"
                                        fallback={<ShoppingBag className="w-5 h-5" style={{ color: textColor }} />}
                                    />
                                ) : (
                                    <ShoppingBag className="w-5 h-5" style={{ color: textColor }} />
                                )}
                                <span className="text-sm font-semibold" style={{ color: isDarkTheme ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>Website Link</span>
                            </div>
                            <div className="flex-1 py-4 px-4 flex items-center gap-3">
                                <Sparkles className="w-5 h-5" style={{ color: isDarkTheme ? '#ffffff' : '#000000' }} />
                                <span className="text-sm font-semibold" style={{ color: isDarkTheme ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>{selectedBlock.analytics?.clicks || 0} Visits</span>
                            </div>
                        </div>

                        {/* Description OR Large Thumbnail */}
                        <div className="space-y-6 mb-8">
                            {/* Only show thumbnail if it's a valid URL (not a social icon ID) */}
                            {selectedBlock.thumbnail && (selectedBlock.thumbnail.startsWith('http') || selectedBlock.thumbnail.startsWith('/')) && (
                                <div className="w-full aspect-video rounded-xl overflow-hidden shadow-sm border"
                                    style={{ borderColor: isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}
                                >
                                    <img src={selectedBlock.thumbnail} className="w-full h-full object-cover" alt={selectedBlock.title} />
                                </div>
                            )}

                            {selectedBlock.content?.description && (
                                <div className="prose prose-sm max-w-none leading-relaxed"
                                    style={{ color: isDarkTheme ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}
                                >
                                    <p>{selectedBlock.content.description}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bottom Sticky Action */}
                    <div className="fixed bottom-0 w-full border-t p-4 safe-area-bottom shadow-2xl z-[90]"
                        style={{ 
                            backgroundColor: isDarkTheme ? '#09090b' : '#ffffff',
                            borderColor: isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
                        }}
                    >
                        <p className="text-xs font-medium mb-3 text-center animate-pulse" style={{ color: isDarkTheme ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}>
                            Redirecting to website in {countdown} seconds ...
                        </p>
                        <Button
                            onClick={proceedToLink}
                            className="w-full h-12 font-bold text-base rounded-lg transition-all flex items-center justify-center gap-2"
                            style={{
                                backgroundColor: isDarkTheme ? '#ffffff' : '#000000',
                                color: isDarkTheme ? '#000000' : '#ffffff'
                            }}
                        >
                            Continue to Link
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Product Detail Overlay */}
            {selectedProduct && (
                <div className="fixed inset-0 z-[80] flex justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="w-full max-w-md mx-auto h-full flex flex-col shadow-2xl relative animate-in slide-in-from-bottom duration-500"
                        style={{ backgroundColor: isDarkTheme ? '#09090b' : '#ffffff' }}
                    >
                        <div className="p-4 border-b flex items-center justify-between sticky top-0 z-10 safe-area-top backdrop-blur-xl"
                            style={{ 
                                backgroundColor: isDarkTheme ? 'rgba(9, 9, 11, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                                borderColor: isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
                            }}
                        >
                            <Button variant="ghost" size="icon" onClick={() => setSelectedProduct(null)} className="-ml-2" style={{ color: textColor }}>
                                <ChevronLeft className="w-6 h-6" />
                            </Button>
                            <span className="font-bold text-sm" style={{ color: textColor }}>Product Details</span>
                            <div className="w-9" />
                        </div>
                        <div className="flex-1 overflow-y-auto p-5 pb-32">
                            <div className="aspect-square rounded-3xl overflow-hidden mb-6 shadow-xl border relative group"
                                style={{ 
                                    backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                                    borderColor: isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
                                }}
                            >
                                {selectedProduct.image_url ?
                                    <img src={selectedProduct.image_url} className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110" /> :
                                    <div className="w-full h-full flex items-center justify-center text-4xl">🛍️</div>
                                }
                                <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                                    <div className="backdrop-blur-xl p-3 rounded-full shadow-lg cursor-pointer transition-all hover:scale-110 active:scale-95"
                                        style={{ 
                                            backgroundColor: isDarkTheme ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.9)',
                                            border: `1px solid ${isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`
                                        }}
                                        onClick={(e) => handleLike(selectedProduct._id, e)}
                                    >
                                        <Heart className={cn("w-5 h-5 transition-all", likedProductIds.has(selectedProduct._id) ? "fill-red-500 text-red-500" : "")} 
                                            style={{ color: likedProductIds.has(selectedProduct._id) ? undefined : textColor }} 
                                        />
                                    </div>
                                    {selectedProduct.badge && (
                                        <div className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-lg"
                                            style={{ backgroundColor: buttonColor }}
                                        >
                                            {selectedProduct.badge}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-start justify-between gap-4">
                                    <h1 className="text-2xl font-black leading-tight tracking-tight" style={{ color: textColor }}>{selectedProduct.title}</h1>
                                    {selectedProduct.stock_status === 'out_of_stock' && (
                                        <Badge variant="outline" className="text-red-500 border-red-500/30 bg-red-500/10 shrink-0">Out of Stock</Badge>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-black" style={{ color: textColor }}>₹{selectedProduct.price}</span>
                                    {selectedProduct.discount_price && (
                                        <span className="text-sm opacity-40 line-through font-medium" style={{ color: textColor }}>
                                            ₹{selectedProduct.discount_price}
                                        </span>
                                    )}
                                </div>

                                {selectedProduct.description && (
                                    <div className="pt-4 border-t" style={{ borderColor: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
                                        <p className="text-sm leading-relaxed opacity-60" style={{ color: textColor }}>{selectedProduct.description}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Buy/Enquire Bar */}
                        <div className="p-4 border-t absolute bottom-0 w-full backdrop-blur-xl safe-area-bottom shadow-2xl flex gap-3"
                            style={{ 
                                backgroundColor: isDarkTheme ? 'rgba(9, 9, 11, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                                borderColor: isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
                            }}
                        >
                            <Button
                                variant="outline"
                                onClick={() => handleProductAction(selectedProduct, 'enquire')}
                                className="flex-1 h-14 rounded-2xl font-black text-sm uppercase tracking-wider transition-all"
                                style={{ 
                                    borderColor: isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                                    backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'transparent',
                                    color: textColor
                                }}
                            >
                                Enquire Now
                            </Button>
                            <Button
                                onClick={() => handleProductAction(selectedProduct, 'buy')}
                                className="flex-1 h-14 rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg transition-all hover:opacity-90 active:scale-95"
                                style={{ 
                                    backgroundColor: isDarkTheme ? '#ffffff' : '#000000',
                                    color: isDarkTheme ? '#000000' : '#ffffff'
                                }}
                            >
                                Buy Now
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PublicProfile;
