import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { templates } from "@/data/templates";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Instagram, Twitter, Mail, Loader2, Link2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

const PublicProfile = () => {
    const { username } = useParams();
    const { user: authUser, selectedTheme: authTheme, links: authLinks } = useAuth();

    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const [links, setLinks] = useState<any[]>([]);
    const [notFound, setNotFound] = useState(false);

    const API_URL = "http://localhost:5000/api";

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
                    selectedTheme: userProfile.selected_theme
                });

                // Fetch Public Links from Backend
                const linksRes = await fetch(`${API_URL}/links/public/${userProfile.id}`);
                const publicLinks = await linksRes.json();

                setLinks(publicLinks || []);

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
            <div className="h-screen w-full flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    if (notFound || !profile) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50 text-center px-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">User not found</h2>
                <p className="text-gray-500 mb-6">The page you're looking for doesn't exist.</p>
                <a href="/" className="text-purple-600 hover:underline">Go Home</a>
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
                    <p className={`text-sm opacity-90 ${template.textColor}`}>
                        {profile.role || "Welcome to my page"}
                    </p>
                </div>

                {/* Social Icons (Placeholder logic if not in DB) */}
                <div className={`flex gap-4 mb-8 justify-center ${template.textColor}`}>
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
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`w-full block text-center px-6 py-4 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] ${template.buttonStyle}`}
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

                {/* Footer */}
                <div className="mt-16 text-center">
                    <a href="/" className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold hover:bg-white/20 transition-colors text-white">
                        <span>Tap2</span>
                    </a>
                </div>
            </div>
        </div>
    );
};

export default PublicProfile;
