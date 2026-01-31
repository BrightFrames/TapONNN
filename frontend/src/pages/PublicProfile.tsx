import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { templates } from "@/data/templates";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Instagram, Twitter, Sparkles, Share2, Link2, Facebook, Linkedin, Youtube, Github, Heart, X, Share, MessageCircle, Search, ExternalLink } from "lucide-react";
import EnquiryModal from "@/components/EnquiryModal";
import PaymentModal from "@/components/PaymentModal";
import LoginToContinueModal from "@/components/LoginToContinueModal";
import ShareModal from "@/components/ShareModal";
import ConnectWithSupplierModal from "@/components/ConnectWithSupplierModal";
import useIntent, { getPendingIntent, clearPendingIntent } from "@/hooks/useIntent";
import { toast } from "sonner";
import { getIconForThumbnail } from "@/utils/socialIcons";

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
    const [activeTab, setActiveTab] = useState<'links' | 'offerings'>('links');
    const [searchQuery, setSearchQuery] = useState('');
    const [notFound, setNotFound] = useState(false);

    // Modals State
    const [shareOpen, setShareOpen] = useState(false);
    const [enquiryModal, setEnquiryModal] = useState({ open: false, blockId: '', blockTitle: '', ctaType: '', intentId: '' });
    const [paymentModal, setPaymentModal] = useState({ open: false, blockId: '', blockTitle: '', price: 0, intentId: '', sellerId: '' });
    const [loginModal, setLoginModal] = useState({ open: false, intentId: '', ctaType: '', blockTitle: '' });
    const [connectModal, setConnectModal] = useState<{ open: boolean; product: any; seller: any }>({ open: false, product: null, seller: null });

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

    // Initialize Profile & Blocks
    useEffect(() => {
        fetchPublicProfile();
    }, [username, isStoreRoute]);

    // Check for pending intent after login
    useEffect(() => {
        const checkPendingIntent = async () => {
            const pendingIntentId = getPendingIntent();
            if (pendingIntentId && authUser) {
                try {
                    const result = await resumeIntent(pendingIntentId);
                    if (result) {
                        // Intent resumed - now trigger the action
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

    const fetchPublicProfile = async () => {
        if (!username) return;

        try {
            // 1. Fetch Profile - Use store endpoint for /s/:username route
            const profileEndpoint = isStoreRoute
                ? `${API_URL}/profile/store/${username}`
                : `${API_URL}/profile/${username}`;

            console.log('Fetching profile:', { isStoreRoute, username, profileEndpoint });

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
                is_store_identity: userProfile.is_store_identity
            });

            // 2. Fetch Blocks
            const blocksRes = await fetch(`${API_URL}/blocks/public/${userProfile.id}`);
            const publicBlocks = await blocksRes.json();
            setBlocks(publicBlocks || []);

            // 3. Fetch Products
            const productsRes = await fetch(`${API_URL}/public/products/${userProfile.username}`);
            if (productsRes.ok) {
                const publicProducts = await productsRes.json();
                setProducts(publicProducts.products || publicProducts || []);
            }

            // 4. Track View (Fire & Forget)
            fetch(`${API_URL}/profile/${userProfile.id}/view`, { method: 'POST' }).catch(() => { });

        } catch (error) {
            console.error("Error fetching profile:", error);
            setNotFound(true);
        } finally {
            setLoading(false);
        }
    };

    // Handle Block Interaction (CTA Click)
    const handleBlockInteract = async (block: any) => {
        // 1. Create Intent
        const intent = await createIntent({
            profile_id: profile.id,
            block_id: block._id,
            store_id: profile.id, // Profile is the store in this model
            source: 'profile_page'
        });

        if (!intent) {
            toast.error('Something went wrong. Please try again.');
            return;
        }

        // 2. Check if Login Required
        if (intent.requires_login) {
            setLoginModal({
                open: true,
                intentId: intent.intent_id,
                ctaType: block.cta_type,
                blockTitle: block.title
            });
            return;
        }

        // 3. Proceed with Action
        handleIntentAction(intent, block);
    };

    // Route Action based on Intent/Block
    const handleIntentAction = (intent: any, blockCtx?: any) => {
        const block = blockCtx || blocks.find(b => b._id === intent.block_id);
        if (!block) return;

        // Redirects
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

        // Enquiries
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

        // Buy Flow
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
                // Free download/item - skip payment
                toast.success('Added to your library! (Mock)');
            }
            return;
        }
    };

    // Guest Continue Handler
    const handleGuestContinue = async (email: string) => {
        // Determine action based on current login modal context
        const intentId = loginModal.intentId;
        // In a real app, we'd update the intent with the guest email here
        // For now, we just close login modal and proceed
        setLoginModal({ ...loginModal, open: false });

        // Find intent to resume details (simplified for frontend flow)
        // We re-trigger action assuming intent exists
        const block = blocks.find(b => b.title === loginModal.blockTitle); // Weak match but works for flow
        if (block) {
            // Re-trigger visual flow - intent is technically already created/waiting
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

    if (loading) {
        return (
            <div className="min-h-screen w-full flex flex-col items-center py-16 px-6 bg-background space-y-8">
                <Skeleton className="h-24 w-24 rounded-full" />
                <Skeleton className="h-8 w-48" />
                <div className="w-full max-w-lg space-y-4">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
                </div>
            </div>
        );
    }

    if (notFound || !profile) {
        return (
            <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background text-center px-4">
                <div className="bg-muted p-4 rounded-full mb-4">
                    <Link2 className="w-8 h-8 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Profile not found</h2>
                <Button onClick={() => navigate('/')}>Go Home</Button>
            </div>
        );
    }

    // Determine Theme - Match Dashboard phone preview logic
    const themeId = authUser && authUser.username === username ? authTheme : (profile.selectedTheme || "artemis");
    const currentTemplate = templates.find(t => t.id === themeId) || templates[0];

    // Background style - Match Dashboard phone preview
    const bgStyle = currentTemplate.bgImage
        ? { backgroundImage: `url(${currentTemplate.bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
        : {};

    const userInitial = (profile.name?.[0] || profile.username?.[0] || "U").toUpperCase();

    return (
        <div
            className={`min-h-screen w-full ${currentTemplate.bgClass || 'bg-gray-100'} ${currentTemplate.textColor || ''} relative`}
            style={bgStyle}
        >
            {/* Overlay for readability */}
            {currentTemplate.bgImage && <div className="absolute inset-0 bg-black/20 pointer-events-none" />}

            {/* Share Button - Top Right */}
            <div className="fixed top-6 right-6 z-50">
                <Button
                    size="icon"
                    variant="ghost"
                    className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
                    onClick={() => setShareOpen(true)}
                >
                    <ExternalLink className={`w-5 h-5 ${currentTemplate.textColor ? 'opacity-80' : 'text-gray-700'}`} />
                </Button>
            </div>

            {/* Main Content - Matches Phone Preview Layout */}
            <div className="relative z-10 max-w-md mx-auto px-6 pt-12 pb-32">

                {/* Profile Header - Matches Phone Preview */}
                <div className="flex flex-col items-center space-y-3">
                    <Avatar className="w-24 h-24 border-4 border-white/20 shadow-xl">
                        <AvatarImage src={profile.avatar} className="object-cover" />
                        <AvatarFallback className="bg-gray-400 text-white text-3xl font-bold">
                            {userInitial}
                        </AvatarFallback>
                    </Avatar>
                    <h2 className="text-xl font-bold tracking-tight">@{profile.username}</h2>

                    {/* Bio - if present */}
                    {profile.bio && (
                        <p className="text-sm text-center opacity-80 max-w-xs">{profile.bio}</p>
                    )}

                    {/* Social Links - Match Phone Preview Design */}
                    {profile.social_links && Object.keys(profile.social_links).length > 0 && (
                        <div className="flex gap-3 flex-wrap justify-center px-4 mt-2">
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
                                        className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer backdrop-blur-sm"
                                    >
                                        <Icon className="w-5 h-5" />
                                    </a>
                                ) : null;
                            })}
                        </div>
                    )}

                    {/* Tab Switcher - Match Phone Preview Design */}
                    <div className="mt-4 flex bg-black/10 backdrop-blur-sm p-1 rounded-full">
                        <button
                            onClick={() => setActiveTab('links')}
                            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${activeTab === 'links' ? 'bg-white text-black shadow-sm' : 'text-current opacity-70 hover:opacity-100'}`}
                        >
                            Links
                        </button>
                        {profile?.is_store_identity && (
                            <button
                                onClick={() => setActiveTab('offerings')}
                                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${activeTab === 'offerings' ? 'bg-white text-black shadow-sm' : 'text-current opacity-70 hover:opacity-100'}`}
                            >
                                Offerings
                            </button>
                        )}
                        <button
                            onClick={() => setActiveTab('explore')}
                            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${activeTab === 'explore' ? 'bg-white text-black shadow-sm' : 'text-current opacity-70 hover:opacity-100'}`}
                        >
                            Explore
                        </button>
                    </div>
                </div>

                {/* Links View - Match Phone Preview Design */}
                {activeTab === 'links' && (
                    <div className="mt-8 space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        {blocks.filter(b => b.is_active).map((block) => {
                            const Icon = block.thumbnail ? getIconForThumbnail(block.thumbnail) : null;
                            const isUrlThumbnail = block.thumbnail && !Icon;

                            return (
                                <button
                                    key={block._id}
                                    onClick={() => handleBlockInteract(block)}
                                    className={`block w-full flex items-center justify-center relative px-12 ${currentTemplate.buttonStyle}`}
                                >
                                    {Icon && (
                                        <Icon className="absolute left-4 w-5 h-5 opacity-90" />
                                    )}
                                    {isUrlThumbnail && (
                                        <img src={block.thumbnail} alt="" className="absolute left-4 w-5 h-5 rounded-full object-cover bg-white/10" />
                                    )}
                                    <span className="truncate w-full">{block.title}</span>
                                </button>
                            );
                        })}
                        {blocks.filter(b => b.is_active).length === 0 && (
                            <div className={`text-center text-sm py-8 ${currentTemplate.textColor} opacity-60`}>
                                No links yet
                            </div>
                        )}
                    </div>
                )}

                {/* Offerings View - Match Phone Preview Connect Card Design */}
                {activeTab === 'offerings' && profile?.is_store_identity && (
                    <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        {/* Search Bar - Match Phone Preview */}
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50 text-current" />
                            <input
                                type="text"
                                placeholder={`Search ${profile.username}'s products`}
                                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm bg-white/10 backdrop-blur-md border border-white/10 placeholder:text-current/50 focus:outline-none focus:ring-1 focus:ring-white/30 transition-all font-medium"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Product Grid - Match Phone Preview Connect Card Design */}
                        {products.filter(p => p && p._id && p.title.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 ? (
                            <div className="grid gap-4">
                                {products.filter(p => p && p._id && p.title.toLowerCase().includes(searchQuery.toLowerCase())).map((product, index) => (
                                    <div
                                        key={product._id || `product-${index}`}
                                        className="relative aspect-square w-full rounded-2xl overflow-hidden group shadow-md"
                                    >
                                        {/* Background Image */}
                                        {product.image_url ? (
                                            <img src={product.image_url} alt={product.title} className="absolute inset-0 w-full h-full object-cover" />
                                        ) : (
                                            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black w-full h-full flex items-center justify-center">
                                                <div className="text-4xl opacity-20">✨</div>
                                            </div>
                                        )}

                                        {/* Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                                        {/* Top Actions */}
                                        <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10">
                                            <button className="w-8 h-8 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/40 transition-colors">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {/* Bottom Content */}
                                        <div className="absolute bottom-0 left-0 right-0 p-4 z-20 text-white">
                                            {/* Badge / Pill */}
                                            <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-medium mb-2 border border-white/10">
                                                <div className="w-2 h-2 rounded-full bg-blue-400" />
                                                <span>{profile?.name || "User"}</span>
                                            </div>

                                            <h3 className="text-base font-bold leading-tight mb-1 text-white">{product.title}</h3>
                                            <p className="text-xs text-gray-300 line-clamp-1 mb-3 font-light">{product.description}</p>

                                            {/* Action Row */}
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        // Track Product Click
                                                        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/analytics/track`, {
                                                            method: 'POST',
                                                            headers: { 'Content-Type': 'application/json' },
                                                            body: JSON.stringify({
                                                                event_type: 'product_click',
                                                                profile_id: profile.id,
                                                                path: window.location.pathname,
                                                                metadata: {
                                                                    productId: product._id,
                                                                    productName: product.title
                                                                }
                                                            })
                                                        }).catch(err => console.error("Analytics track error:", err));

                                                        setConnectModal({
                                                            open: true,
                                                            product: product,
                                                            seller: { id: profile.id, name: profile.name }
                                                        });
                                                    }}
                                                    className="flex-1 bg-white text-black h-10 rounded-full font-bold text-sm flex items-center justify-center hover:bg-gray-100 transition-colors"
                                                >
                                                    Buy Now
                                                </button>
                                                <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-colors border border-white/10">
                                                    <Heart className="w-4 h-4" />
                                                </button>
                                                <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-colors border border-white/10">
                                                    <Share className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 opacity-60">
                                <p className="text-sm font-medium">No products yet</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Explore View */}
                {activeTab === 'explore' && (
                    <div className="mt-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="bg-black/5 backdrop-blur-sm rounded-3xl p-4 border border-white/5">
                            <ExploreSection hideHeader />
                        </div>
                    </div>
                )}
            </div>

            {/* Footer - Connect Button - Match Phone Preview - ENHANCED UI */}
            <div className="fixed bottom-6 left-0 right-0 flex flex-col items-center gap-3 px-6 z-40 translate-y-0 opacity-100 transition-all duration-500 delay-300">
                <div className="w-full max-w-md">
                    <button
                        onClick={() => setConnectModal({
                            open: true,
                            product: null,
                            seller: { id: profile.id, name: profile.name }
                        })}
                        className="group w-full relative overflow-hidden rounded-full h-14 shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:shadow-[0_8px_40px_rgba(0,0,0,0.2)] transition-all duration-300 hover:-translate-y-1 active:scale-95"
                    >
                        {/* Gradient Background */}
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-black to-gray-900 group-hover:bg-gradient-to-r group-hover:from-gray-800 group-hover:via-gray-900 group-hover:to-gray-800 transition-all duration-500" />

                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-gradient-to-r from-transparent via-white to-transparent -skew-x-12 translate-x-[-100%] group-hover:animate-shimmer" />

                        <div className="relative flex items-center justify-between px-6 h-full text-white">
                            <span className="font-bold text-lg tracking-wide">Message {profile.name?.split(' ')[0] || profile.username || 'User'}</span>
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-white/20 transition-all duration-300">
                                <MessageCircle className="w-5 h-5 text-white" />
                            </div>
                        </div>
                    </button>
                </div>

                {/* Tap2 Branding - ENHANCED UI */}
                <a
                    href="/"
                    className="inline-flex items-center gap-2 px-5 py-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full text-xs font-medium text-current/60 hover:text-current hover:bg-white/10 hover:border-white/20 transition-all hover:scale-105 shadow-sm"
                >
                    <Sparkles className="w-3 h-3 text-purple-500" />
                    <span>Create your own Tap2</span>
                </a>
            </div>

            {/* Modals */}
            <LoginToContinueModal
                open={loginModal.open}
                onOpenChange={(open) => setLoginModal(prev => ({ ...prev, open }))}
                intentId={loginModal.intentId}
                ctaType={loginModal.ctaType}
                blockTitle={loginModal.blockTitle}
                onContinueAsGuest={handleGuestContinue}
            />

            <EnquiryModal
                open={enquiryModal.open}
                onOpenChange={(open) => setEnquiryModal(prev => ({ ...prev, open }))}
                sellerId={profile.id}
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
                itemTitle={paymentModal.blockTitle}
                price={paymentModal.price}
                sellerId={paymentModal.sellerId}
                onComplete={() => clearPendingIntent()}
            />

            <ShareModal
                open={shareOpen}
                onOpenChange={setShareOpen}
                username={profile.username}
                url={window.location.href}
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
        </div>
    );
};

export default PublicProfile;
