import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { templates } from "@/data/templates";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Instagram, Twitter, Mail, Loader2, Link2, Sparkles, Share2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import ShareModal from "@/components/ShareModal";
import ProductInteractionModal from "@/components/ProductInteractionModal";

const PublicProfile = () => {
    const { username } = useParams();
    const { user: authUser, selectedTheme: authTheme, links: authLinks } = useAuth();

    const [shareOpen, setShareOpen] = useState(false);

    // Modal State
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [modalStep, setModalStep] = useState<'selection' | 'contact_enquiry' | 'contact_buy'>('selection');

    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const [links, setLinks] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [notFound, setNotFound] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

    // Track link click before opening
    const handleLinkClick = async (link: any, e: React.MouseEvent) => {
        e.preventDefault();

        // Track the click (fire and forget - don't block navigation)
        if (link.id && link.id.length > 30) {
            fetch(`${API_URL}/links/${link.id}/click`, {
                method: 'POST'
            }).catch(() => {
                // Silently fail - don't block the user
            });
        }

        // Open the link in a new tab
        let url = link.url;
        if (url && !url.startsWith('http')) {
            url = `https://${url}`;
        }
        window.open(url, '_blank', 'noopener,noreferrer');
    };
    const handleSupport = async () => {
        if (!profile) return;
        try {
            await fetch(`${API_URL}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    seller_id: profile.id, // We need profile.id here, handled below
                    buyer_email: "supporter@example.com", // Placeholder
                    amount: 5.00,
                    type: "donation"
                })
            });
            // formatting currency to be nice
            alert(`Thanks for the $5.00 tip! (Demo Transaction)`);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        const fetchPublicProfile = async () => {
            if (!username) return;

            // Optimization: If viewing own profile
            if (authUser && authUser.username === username) {
                setProfile(authUser);
                setLinks(authLinks.filter(l => l.isActive));
                setLoading(false);
                return;
            }

            try {
                // Fetch Profile from Backend
                const profileRes = await fetch(`${API_URL}/profile/${username}`);
                if (!profileRes.ok) {
                    setNotFound(true);
                    setLoading(false);
                    return;
                }

                const userProfile = await profileRes.json();

                setProfile({
                    name: userProfile.full_name,
                    username: userProfile.username,
                    avatar: userProfile.avatar_url,
                    bio: userProfile.bio,
                    selectedTheme: userProfile.selected_theme,
                    id: userProfile.id, // Ensure we store ID
                    payment_instructions: userProfile.payment_instructions
                });

                // Fetch Public Links from Backend
                const linksRes = await fetch(`${API_URL}/links/public/${userProfile.id}`);
                const publicLinks = await linksRes.json();
                setLinks(publicLinks || []);

                // Fetch Public Products from Backend
                const productsRes = await fetch(`${API_URL}/public/products/${username}`);
                if (productsRes.ok) {
                    const publicProducts = await productsRes.json();
                    setProducts(publicProducts || []);
                }

                // Track the profile view (fire and forget)
                fetch(`${API_URL}/profile/${username}/view`, {
                    method: 'POST'
                }).catch(() => {
                    // Silently fail - don't block the user experience
                });

            } catch (error) {
                console.error("Error fetching public profile:", error);
                setNotFound(true);
            } finally {
                setLoading(false);
            }
        };

        fetchPublicProfile();
    }, [username, authUser, authLinks]);

    if (loading) {
        return (
            <div className="min-h-screen w-full flex flex-col items-center py-16 px-6 bg-background space-y-8">
                <div className="flex flex-col items-center space-y-4">
                    <Skeleton className="h-24 w-24 rounded-full" />
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <div className="w-full max-w-lg space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-16 w-full rounded-xl" />
                    ))}
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
                <h2 className="text-2xl font-bold tracking-tight mb-2">Profile not found</h2>
                <p className="text-muted-foreground mb-6">The page you're looking for doesn't exist.</p>
                <Button variant="default" onClick={() => window.location.href = '/'}>Go Home</Button>
            </div>
        );
    }

    // Determine Theme
    const themeId = authUser && authUser.username === username ? authTheme : (profile.selectedTheme || "artemis");
    const template = templates.find(t => t.id === themeId) || templates[0];

    const bgStyle = template.bgImage
        ? { backgroundImage: `url(${template.bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
        : {};

    return (
        <div
            className={`min-h-screen w-full flex flex-col items-center py-16 px-6 transition-colors duration-500 ${template.bgClass || 'bg-gray-100'}`}
            style={bgStyle}
        >
            {/* Overlay if image background */}
            {template.bgImage && <div className="absolute inset-0 bg-black/30 fixed pointer-events-none" />}

            {/* Share Button (Floating) */}
            <div className="fixed top-6 right-6 z-50">
                <Button
                    size="icon"
                    variant="secondary"
                    className="rounded-full shadow-lg bg-white/20 backdrop-blur-md border border-white/20 hover:bg-white/40 text-current"
                    onClick={() => setShareOpen(true)}
                >
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

                    <h1 className={`text-2xl font-bold tracking-tight mb-2 ${template.textColor}`}>
                        @{profile.username}
                    </h1>
                    {profile.bio ? (
                        <p className={`text-sm opacity-90 max-w-sm ${template.textColor}`}>
                            {profile.bio}
                        </p>
                    ) : (
                        <p className={`text-sm opacity-70 ${template.textColor}`}>
                            Welcome to my page
                        </p>
                    )}
                </div>

                <div className={`flex gap-4 mb-8 justify-center ${template.textColor}`}>
                    <Button variant="outline" className="rounded-full bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 text-inherit" onClick={handleSupport}>
                        🎁 Support Me
                    </Button>
                    {/* Social Icons Placeholder */}
                    <div className="hover:opacity-80 cursor-pointer transition-opacity p-2 rounded-full bg-white/10 backdrop-blur-sm">
                        <Instagram size={20} />
                    </div>
                    <div className="hover:opacity-80 cursor-pointer transition-opacity p-2 rounded-full bg-white/10 backdrop-blur-sm">
                        <Twitter size={20} />
                    </div>
                </div>

                {/* Links List */}
                <div className="w-full space-y-4">
                    {links.length > 0 ? (
                        links.map((link: any) => (
                            <a
                                key={link.id}
                                href={link.url && !link.url.startsWith('http') ? `https://${link.url}` : link.url}
                                onClick={(e) => handleLinkClick(link, e)}
                                className={`w-full block text-center px-6 py-4 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${template.buttonStyle}`}
                            >
                                {link.title}
                            </a>
                        ))
                    ) : (
                        <div className={`text-center py-8 opacity-70 ${template.textColor}`}>
                            <Link2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>No links yet.</p>
                        </div>
                    )}
                </div>

                {/* Products Section */}
                {products.length > 0 && (
                    <div className="w-full mt-12 mb-8">
                        <h3 className={`text-xl font-bold mb-6 text-center ${template.textColor}`}>My Store</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {products.map((product: any) => (
                                <div key={product.id} className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow flex gap-4 items-center">
                                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                        {product.image_url ? (
                                            <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xl">🛍️</div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-gray-900 truncate">{product.title}</h4>
                                        <p className="text-sm text-gray-500 line-clamp-1">{product.description}</p>
                                        <div className="flex justify-between items-center mt-1">
                                            <span className="font-bold text-primary">${product.price}</span>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-7 text-xs rounded-full border-gray-300 hover:bg-gray-100"
                                                    onClick={() => {
                                                        setModalStep('contact_enquiry');
                                                        setSelectedProduct(product);
                                                    }}
                                                >
                                                    Enquiry
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="h-7 text-xs rounded-full bg-black text-white hover:bg-black/80"
                                                    onClick={() => {
                                                        setModalStep('contact_buy');
                                                        setSelectedProduct(product);
                                                    }}
                                                >
                                                    Buy
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="mt-16 text-center">
                    <a href="/" className="inline-flex items-center gap-2 px-4 py-2 bg-background/20 backdrop-blur-md border border-white/10 rounded-full text-xs font-semibold hover:bg-background/30 transition-all text-foreground hover:scale-105">
                        <Sparkles className="w-3 h-3 text-primary" />
                        <span>Create your own Tap2</span>
                    </a>
                </div>
            </div>

            {profile && (
                <>
                    <ProductInteractionModal
                        open={!!selectedProduct}
                        onOpenChange={(open) => !open && setSelectedProduct(null)}
                        product={selectedProduct}
                        seller={profile}
                        initialStep={modalStep}
                    />
                    <ShareModal
                        open={shareOpen}
                        onOpenChange={setShareOpen}
                        username={profile.username}
                        url={window.location.href}
                    />
                </>
            )}
        </div>
    );
};

export default PublicProfile;
