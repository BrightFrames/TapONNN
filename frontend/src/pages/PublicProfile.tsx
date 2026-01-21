import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { templates } from "@/data/templates";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Instagram, Twitter, Sparkles, Share2, Link2, Facebook, Linkedin, Youtube, Github } from "lucide-react";
import PublicBlockCard from "@/components/PublicBlockCard";
import EnquiryModal from "@/components/EnquiryModal";
import PaymentModal from "@/components/PaymentModal";
import LoginToContinueModal from "@/components/LoginToContinueModal";
import ShareModal from "@/components/ShareModal";
import useIntent, { getPendingIntent, clearPendingIntent } from "@/hooks/useIntent";
import { toast } from "sonner";

const PublicProfile = () => {
    const { username } = useParams();
    const navigate = useNavigate();
    const { user: authUser, selectedTheme: authTheme } = useAuth();

    // Intent Hook
    const { createIntent, resumeIntent, loading: intentLoading } = useIntent();

    // State
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const [blocks, setBlocks] = useState<any[]>([]);
    const [notFound, setNotFound] = useState(false);

    // Modals State
    const [shareOpen, setShareOpen] = useState(false);
    const [enquiryModal, setEnquiryModal] = useState({ open: false, blockId: '', blockTitle: '', ctaType: '', intentId: '' });
    const [paymentModal, setPaymentModal] = useState({ open: false, blockId: '', blockTitle: '', price: 0, intentId: '', sellerId: '' });
    const [loginModal, setLoginModal] = useState({ open: false, intentId: '', ctaType: '', blockTitle: '' });

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

    // Initialize Profile & Blocks
    useEffect(() => {
        fetchPublicProfile();
    }, [username]);

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
            // 1. Fetch Profile
            const profileRes = await fetch(`${API_URL}/profile/${username}`);
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
                selectedTheme: userProfile.selected_theme,
                payment_instructions: userProfile.payment_instructions,
                social_links: userProfile.social_links || {}
            });

            // 2. Fetch Blocks
            const blocksRes = await fetch(`${API_URL}/blocks/public/${userProfile.id}`);
            const publicBlocks = await blocksRes.json();
            setBlocks(publicBlocks || []);

            // 3. Track View (Fire & Forget)
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
                    intentId: intentId
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

    // Determine Theme
    const themeId = authUser && authUser.username === username ? authTheme : (profile.selectedTheme || "artemis");
    const template = templates.find(t => t.id === themeId) || templates[0];
    const bgStyle = template.bgImage ? { backgroundImage: `url(${template.bgImage})`, backgroundSize: 'cover' } : {};

    return (
        <div className={`min-h-screen w-full flex flex-col items-center py-16 px-6 transition-colors duration-500 ${template.bgClass || 'bg-gray-100'}`} style={bgStyle}>
            {template.bgImage && <div className="absolute inset-0 bg-black/30 fixed pointer-events-none" />}

            {/* Share Button */}
            <div className="fixed top-6 right-6 z-50">
                <Button size="icon" variant="secondary" className="rounded-full shadow-lg bg-white/20 backdrop-blur-md border border-white/20 hover:bg-white/40 text-current" onClick={() => setShareOpen(true)}>
                    <Share2 className="w-4 h-4" />
                </Button>
            </div>

            <div className="z-10 w-full max-w-lg mx-auto flex flex-col items-center">
                {/* Profile Header */}
                <div className="flex flex-col items-center mb-8 text-center">
                    <Avatar className="w-24 h-24 border-4 border-white/20 shadow-xl mb-4">
                        <AvatarImage src={profile.avatar} />
                        <AvatarFallback className="bg-gray-400 text-white text-3xl font-bold">
                            {profile.name?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                    </Avatar>
                    <h1 className={`text-2xl font-bold mb-2 ${template.textColor}`}>@{profile.username}</h1>
                    {profile.bio && <p className={`text-sm opacity-90 ${template.textColor}`}>{profile.bio}</p>}
                </div>

                {/* Social Links */}
                {profile.social_links && Object.keys(profile.social_links).length > 0 && (
                    <div className={`flex gap-4 mb-8 justify-center flex-wrap ${template.textColor}`}>
                        {Object.entries(profile.social_links).map(([platform, url]: [string, any]) => {
                            if (!url) return null;
                            const p = platform.toLowerCase();
                            let Icon = Link2;
                            if (p.includes('instagram')) Icon = Instagram;
                            else if (p.includes('twitter') || p.includes('x.com')) Icon = Twitter;
                            else if (p.includes('facebook')) Icon = Facebook;
                            else if (p.includes('linkedin')) Icon = Linkedin;
                            else if (p.includes('youtube')) Icon = Youtube;
                            else if (p.includes('github')) Icon = Github;

                            // Ensure URL has protocol
                            const href = /^https?:\/\//i.test(url) ? url : `https://${url}`;

                            return (
                                <a
                                    key={platform}
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:opacity-80 hover:scale-110 transition-transform cursor-pointer p-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10"
                                >
                                    <Icon size={20} />
                                </a>
                            );
                        })}
                    </div>
                )}

                {/* Blocks List */}
                <div className="w-full space-y-4">
                    {blocks.length > 0 ? (
                        blocks.map((block: any) => (
                            <PublicBlockCard
                                key={block._id}
                                block={block}
                                onInteract={handleBlockInteract}
                                template={template}
                            />
                        ))
                    ) : (
                        <div className={`text-center py-8 opacity-70 ${template.textColor}`}>
                            <p>No active blocks.</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-16 text-center">
                    <a href="/" className="inline-flex items-center gap-2 px-4 py-2 bg-background/20 backdrop-blur-md border border-white/10 rounded-full text-xs font-semibold hover:bg-background/30 transition-all text-white hover:scale-105">
                        <Sparkles className="w-3 h-3 text-primary" />
                        <span>Create your own Tap2</span>
                    </a>
                </div>
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
        </div>
    );
};

export default PublicProfile;
