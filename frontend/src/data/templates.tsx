
import React from "react";
import {
    Instagram,
    Youtube,
    Twitter,
    Facebook,
    Music2,
    MessageCircle,
    ShoppingBag,
    MapPin,
    Coffee,
    Camera,
    Ticket,
    Linkedin,
    Send,
    Dumbbell,
    Heart,
    Sparkles,
    Mic2,
    Trophy,
    Store,
    TrendingUp,
    Users,
    Smartphone
} from "lucide-react";

// Types
export type TemplateData = {
    id: string;
    name: string;
    creator: string;
    role?: string;
    bgClass?: string;
    bgImage?: string;
    avatar: string;
    textColor: string;
    buttonStyle: string;
    links: string[];
    icons: React.ReactNode[];
    font?: string;
    hasIconsInButtons?: boolean;
    category: string;
};

// Helper for rendering icons inside buttons for Balcombe
export const getButtonIcon = (index: number) => {
    switch (index) {
        case 0: return <Ticket size={16} className="text-teal-600" />;
        case 1: return <Coffee size={16} className="text-green-600" />;
        case 2: return <MapPin size={16} className="text-orange-600" />;
        case 3: return <Camera size={16} className="text-gray-600" />;
        default: return null;
    }
};

export const categories = [
    "All",
    "Fashion",
    "Health and Fitness",
    "Influencer and Creator",
    "Marketing",
    "Music",
    "Small Business",
    "Social Media",
    "Sports",
    "Telegram",
    "Whatsapp"
];

export const templates: TemplateData[] = [
    // =====================
    // FASHION (5 templates)
    // =====================
    {
        id: "haute-couture",
        name: "Haute Couture",
        creator: "Valentina Rose",
        role: "Fashion Designer & Stylist",
        bgImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
        textColor: "text-white",
        buttonStyle: "bg-white/90 text-black h-12 flex items-center justify-center text-sm font-serif tracking-wide shadow-lg hover:bg-white transition-all",
        links: ["New Collection", "Book Styling Session", "Fashion Week Looks", "Shop My Picks"],
        icons: [<Instagram size={18} />, <Twitter size={18} />],
        category: "Fashion"
    },
    {
        id: "streetwear-king",
        name: "Streetwear King",
        creator: "Urban Drip",
        role: "Streetwear Brand",
        bgClass: "bg-black",
        avatar: "U",
        textColor: "text-white",
        buttonStyle: "bg-gradient-to-r from-red-600 to-orange-500 text-white h-14 flex items-center justify-center text-sm font-bold uppercase tracking-widest hover:scale-105 transition-transform",
        links: ["New Drops", "Limited Edition", "Size Guide", "Collabs", "Stockists"],
        icons: [<Instagram size={18} />, <Twitter size={18} />, <Youtube size={18} />],
        category: "Fashion"
    },
    {
        id: "minimalist-chic",
        name: "Minimalist Chic",
        creator: "Sophia Laurent",
        role: "Sustainable Fashion Curator",
        bgClass: "bg-[#F5F5F0]",
        avatar: "S",
        textColor: "text-gray-900",
        buttonStyle: "bg-transparent border border-gray-900 text-gray-900 h-11 flex items-center justify-center text-xs uppercase tracking-[0.2em] transition-all hover:bg-gray-900 hover:text-white",
        links: ["Capsule Wardrobe", "Ethical Brands", "Style Guide", "Newsletter", "About"],
        icons: [<Instagram size={18} />, <Linkedin size={18} />],
        category: "Fashion"
    },
    {
        id: "vintage-vogue",
        name: "Vintage Vogue",
        creator: "Retro Bella",
        role: "Vintage Fashion Collector",
        bgClass: "bg-[#FFF8E7]",
        avatar: "R",
        textColor: "text-[#8B4513]",
        buttonStyle: "bg-[#D4A574] text-white h-12 flex items-center justify-center text-sm font-medium rounded-full shadow-md hover:bg-[#C49466] transition-colors",
        links: ["Vintage Finds", "Era Collections", "Restoration Tips", "Consignment", "Events"],
        icons: [<Instagram size={18} />, <Facebook size={18} />],
        category: "Fashion"
    },
    {
        id: "luxury-label",
        name: "Luxury Label",
        creator: "MAISON ELITE",
        role: "Luxury Fashion House",
        bgClass: "bg-gradient-to-b from-[#1a1a2e] to-[#16213e]",
        avatar: "M",
        textColor: "text-[#D4AF37]",
        buttonStyle: "bg-transparent border border-[#D4AF37] text-[#D4AF37] h-12 flex items-center justify-center text-sm font-light tracking-widest hover:bg-[#D4AF37] hover:text-black transition-all",
        links: ["Runway 2026", "Atelier Appointment", "Bespoke Orders", "Brand Story", "Press"],
        icons: [<Instagram size={18} />],
        category: "Fashion"
    },

    // ==============================
    // HEALTH AND FITNESS (5 templates)
    // ==============================
    {
        id: "fitness-pro",
        name: "Fitness Pro",
        creator: "Coach Marcus",
        role: "Certified Personal Trainer",
        bgImage: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80",
        avatar: "https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=150&q=80",
        textColor: "text-white",
        buttonStyle: "bg-gradient-to-r from-orange-500 to-red-600 text-white h-14 flex items-center justify-center text-sm font-bold uppercase tracking-wide shadow-lg hover:scale-105 transition-transform",
        links: ["Training Programs", "1-on-1 Coaching", "Meal Plans", "Free Workout", "Testimonials"],
        icons: [<Instagram size={18} />, <Youtube size={18} />, <Twitter size={18} />],
        category: "Health and Fitness"
    },
    {
        id: "zen-yoga",
        name: "Zen Yoga",
        creator: "Maya Wellness",
        role: "Mindful Yoga Instructor",
        bgClass: "bg-gradient-to-br from-[#E8F5E9] to-[#C8E6C9]",
        avatar: "M",
        textColor: "text-green-800",
        buttonStyle: "bg-white text-green-800 h-12 flex items-center justify-center text-sm font-medium rounded-full hover:bg-green-50 transition-colors shadow-sm",
        links: ["Morning Flow", "Meditation Guide", "Retreat 2026", "Wellness Blog", "Book Class"],
        icons: [<Instagram size={18} />, <Youtube size={18} />],
        category: "Health and Fitness"
    },
    {
        id: "nutrition-expert",
        name: "Nutrition Expert",
        creator: "Dr. Sarah Cole",
        role: "Registered Dietitian",
        bgClass: "bg-[#FFF9E6]",
        avatar: "S",
        textColor: "text-[#2E7D32]",
        buttonStyle: "bg-[#4CAF50] text-white h-12 flex items-center justify-center text-sm font-semibold rounded-xl shadow-md hover:bg-[#43A047] transition-colors",
        links: ["Meal Planning", "Nutrition Consult", "Healthy Recipes", "E-Book", "Podcast"],
        icons: [<Instagram size={18} />, <Youtube size={18} />, <Linkedin size={18} />],
        category: "Health and Fitness"
    },
    {
        id: "crossfit-warrior",
        name: "CrossFit Warrior",
        creator: "Iron Box Gym",
        role: "CrossFit Training Center",
        bgClass: "bg-[#1C1C1C]",
        avatar: "I",
        textColor: "text-[#FF5722]",
        buttonStyle: "bg-[#FF5722] text-white h-14 flex items-center justify-center text-sm font-black uppercase tracking-wider hover:bg-[#E64A19] transition-colors",
        links: ["WOD Today", "Class Schedule", "Membership", "Competition Team", "Merch"],
        icons: [<Instagram size={18} />, <Facebook size={18} />],
        category: "Health and Fitness"
    },
    {
        id: "mental-wellness",
        name: "Mental Wellness",
        creator: "Peace of Mind",
        role: "Mental Health Advocate",
        bgClass: "bg-gradient-to-br from-[#E1BEE7] to-[#CE93D8]",
        avatar: "P",
        textColor: "text-[#4A148C]",
        buttonStyle: "bg-white/80 backdrop-blur-sm text-[#7B1FA2] h-12 flex items-center justify-center text-sm font-medium rounded-2xl shadow-md hover:bg-white transition-all",
        links: ["Guided Meditations", "Therapy Resources", "Self-Care Tips", "Community", "Newsletter"],
        icons: [<Instagram size={18} />, <Youtube size={18} />],
        category: "Health and Fitness"
    },

    // ===================================
    // INFLUENCER AND CREATOR (5 templates)
    // ===================================
    {
        id: "content-creator",
        name: "Content Creator",
        creator: "Emma Creates",
        role: "Lifestyle Content Creator",
        bgImage: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=800&q=80",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
        textColor: "text-white",
        buttonStyle: "bg-gradient-to-r from-pink-500 to-purple-600 text-white h-12 flex items-center justify-center text-sm font-semibold rounded-2xl shadow-lg hover:scale-105 transition-transform",
        links: ["Latest Video", "Brand Collabs", "My Camera Gear", "Presets Shop", "Business Inquiries"],
        icons: [<Youtube size={18} />, <Instagram size={18} />, <Twitter size={18} />],
        category: "Influencer and Creator"
    },
    {
        id: "gaming-legend",
        name: "Gaming Legend",
        creator: "NightOwl Gaming",
        role: "Pro Streamer & Esports",
        bgClass: "bg-[#0D0D0D]",
        avatar: "N",
        textColor: "text-[#00FF88]",
        buttonStyle: "bg-[#00FF88]/10 border border-[#00FF88] text-[#00FF88] h-12 flex items-center justify-center text-sm font-mono tracking-wider hover:bg-[#00FF88] hover:text-black transition-all",
        links: ["Twitch Stream", "Discord Server", "Gaming Gear", "Merch Store", "Sponsor Info"],
        icons: [<Youtube size={18} />, <Twitter size={18} />, <MessageCircle size={18} />],
        category: "Influencer and Creator"
    },
    {
        id: "travel-blogger",
        name: "Travel Blogger",
        creator: "Wanderlust Jay",
        role: "Adventure Travel Creator",
        bgImage: "https://images.unsplash.com/photo-1503220317375-aaad61436b1b?auto=format&fit=crop&w=800&q=80",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
        textColor: "text-white",
        buttonStyle: "bg-white/20 backdrop-blur-md border border-white/40 text-white h-12 flex items-center justify-center text-sm font-medium rounded-xl hover:bg-white/30 transition-all",
        links: ["Travel Guides", "Photography", "Packing List", "Trip Planning", "Collabs"],
        icons: [<Instagram size={18} />, <Youtube size={18} />, <Twitter size={18} />],
        category: "Influencer and Creator"
    },
    {
        id: "beauty-guru",
        name: "Beauty Guru",
        creator: "Glow by Mia",
        role: "Beauty & Skincare Expert",
        bgClass: "bg-gradient-to-br from-[#FFECD2] to-[#FCB69F]",
        avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=150&q=80",
        textColor: "text-[#5D4037]",
        buttonStyle: "bg-white text-[#5D4037] h-12 flex items-center justify-center text-sm font-medium rounded-full shadow-md hover:shadow-lg transition-all",
        links: ["Skincare Routine", "Makeup Tutorials", "Product Reviews", "My Brand", "Book Me"],
        icons: [<Instagram size={18} />, <Youtube size={18} />, <Twitter size={18} />],
        category: "Influencer and Creator"
    },
    {
        id: "podcast-host",
        name: "Podcast Host",
        creator: "The Daily Talk",
        role: "Top 10 Podcast",
        bgClass: "bg-[#1A1A2E]",
        avatar: "D",
        textColor: "text-white",
        buttonStyle: "bg-[#E94560] text-white h-12 flex items-center justify-center text-sm font-bold rounded-lg hover:bg-[#D63851] transition-colors",
        links: ["Listen Now", "Apple Podcasts", "Spotify", "Guest Application", "Merch"],
        icons: [<Instagram size={18} />, <Twitter size={18} />, <Youtube size={18} />],
        category: "Influencer and Creator"
    },

    // ====================
    // MARKETING (5 templates)
    // ====================
    {
        id: "growth-hacker",
        name: "Growth Hacker",
        creator: "Scale Labs",
        role: "SaaS Marketing Agency",
        bgClass: "bg-[#F8FAFC]",
        avatar: "S",
        textColor: "text-slate-800",
        buttonStyle: "bg-[#3B82F6] text-white h-12 flex items-center justify-center text-sm font-bold rounded-lg shadow-md hover:bg-[#2563EB] transition-colors",
        links: ["Book Strategy Call", "Case Studies", "Free SEO Audit", "Resources", "About Us"],
        icons: [<Linkedin size={18} />, <Twitter size={18} />],
        category: "Marketing"
    },
    {
        id: "brand-strategist",
        name: "Brand Strategist",
        creator: "Vision Studio",
        role: "Brand & Identity Design",
        bgClass: "bg-white",
        avatar: "V",
        textColor: "text-gray-900",
        buttonStyle: "bg-transparent border-2 border-gray-900 text-gray-900 h-11 flex items-center justify-center text-xs uppercase tracking-[0.15em] transition-all hover:bg-gray-900 hover:text-white",
        links: ["Portfolio", "Services", "Process", "Testimonials", "Contact"],
        icons: [<Instagram size={18} />, <Linkedin size={18} />, <Twitter size={18} />],
        category: "Marketing"
    },
    {
        id: "social-media-pro",
        name: "Social Media Pro",
        creator: "Viral Agency",
        role: "Social Media Marketing",
        bgClass: "bg-gradient-to-br from-[#667eea] to-[#764ba2]",
        avatar: "V",
        textColor: "text-white",
        buttonStyle: "bg-white text-[#667eea] h-12 flex items-center justify-center text-sm font-bold rounded-full shadow-lg hover:scale-105 transition-transform",
        links: ["Free Consultation", "Services & Pricing", "Content Calendar", "Results", "Blog"],
        icons: [<Instagram size={18} />, <Linkedin size={18} />, <Twitter size={18} />],
        category: "Marketing"
    },
    {
        id: "email-expert",
        name: "Email Expert",
        creator: "Inbox Masters",
        role: "Email Marketing Specialist",
        bgClass: "bg-[#FFFBEB]",
        avatar: "I",
        textColor: "text-[#92400E]",
        buttonStyle: "bg-[#F59E0B] text-white h-12 flex items-center justify-center text-sm font-semibold rounded-xl hover:bg-[#D97706] transition-colors",
        links: ["Free Email Templates", "Audit Your Emails", "Courses", "Newsletter", "Hire Us"],
        icons: [<Twitter size={18} />, <Linkedin size={18} />],
        category: "Marketing"
    },
    {
        id: "seo-wizard",
        name: "SEO Wizard",
        creator: "Rank Higher",
        role: "SEO Consultant",
        bgClass: "bg-[#0F172A]",
        avatar: "R",
        textColor: "text-[#22D3EE]",
        buttonStyle: "bg-[#22D3EE] text-[#0F172A] h-12 flex items-center justify-center text-sm font-bold rounded-lg hover:bg-[#06B6D4] transition-colors",
        links: ["Free SEO Check", "Services", "Case Studies", "Blog", "Book Call"],
        icons: [<Linkedin size={18} />, <Twitter size={18} />, <Youtube size={18} />],
        category: "Marketing"
    },

    // =================
    // MUSIC (5 templates)
    // =================
    {
        id: "artist-spotlight",
        name: "Artist Spotlight",
        creator: "Luna Nova",
        role: "Singer-Songwriter",
        bgImage: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=800&q=80",
        avatar: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=150&q=80",
        textColor: "text-white",
        buttonStyle: "bg-black/50 backdrop-blur-md text-white h-12 flex items-center justify-center text-sm font-medium rounded-full border border-white/30 hover:bg-white/20 transition-all",
        links: ["New Single", "Spotify", "Apple Music", "Tour Dates", "Merch"],
        icons: [<Instagram size={18} />, <Twitter size={18} />, <Youtube size={18} />],
        category: "Music"
    },
    {
        id: "dj-producer",
        name: "DJ Producer",
        creator: "DJ Pulse",
        role: "Electronic Music Producer",
        bgClass: "bg-[#09090b]",
        avatar: "P",
        textColor: "text-cyan-400",
        buttonStyle: "bg-[#18181b] text-cyan-400 border border-cyan-800 h-14 flex items-center justify-center text-sm font-bold tracking-wider hover:bg-cyan-950 transition-colors uppercase",
        links: ["Latest Mix", "Beatport", "Spotify", "Tour Dates", "Bookings"],
        icons: [<Music2 size={18} />, <Youtube size={18} />, <Instagram size={18} />],
        category: "Music"
    },
    {
        id: "hip-hop-artist",
        name: "Hip Hop Artist",
        creator: "King Verse",
        role: "Rapper & Producer",
        bgClass: "bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d]",
        avatar: "K",
        textColor: "text-[#FFD700]",
        buttonStyle: "bg-[#FFD700] text-black h-14 flex items-center justify-center text-sm font-black uppercase tracking-wide hover:bg-[#FFC700] transition-colors",
        links: ["New Album", "Music Videos", "Spotify", "Concerts", "Merch Store"],
        icons: [<Instagram size={18} />, <Twitter size={18} />, <Youtube size={18} />],
        category: "Music"
    },
    {
        id: "classical-virtuoso",
        name: "Classical Virtuoso",
        creator: "Elena Strings",
        role: "Concert Violinist",
        bgClass: "bg-[#1C1C1C]",
        avatar: "E",
        textColor: "text-[#C9B037]",
        buttonStyle: "bg-transparent border border-[#C9B037] text-[#C9B037] h-12 flex items-center justify-center text-sm font-serif tracking-wide hover:bg-[#C9B037] hover:text-black transition-all",
        links: ["Upcoming Concerts", "Recordings", "Biography", "Teaching", "Contact"],
        icons: [<Instagram size={18} />, <Youtube size={18} />],
        category: "Music"
    },
    {
        id: "band-page",
        name: "Band Page",
        creator: "Neon Lights",
        role: "Alternative Rock Band",
        bgImage: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80",
        avatar: "N",
        textColor: "text-white",
        buttonStyle: "bg-[#E91E63] text-white h-12 flex items-center justify-center text-sm font-bold uppercase tracking-wider hover:bg-[#C2185B] transition-colors",
        links: ["Listen Now", "Tour Dates", "Music Videos", "Merch", "Press Kit"],
        icons: [<Instagram size={18} />, <Twitter size={18} />, <Youtube size={18} />, <Music2 size={18} />],
        category: "Music"
    },

    // ========================
    // SMALL BUSINESS (5 templates)
    // ========================
    {
        id: "coffee-shop",
        name: "Coffee Shop",
        creator: "Brew & Bean",
        role: "Specialty Coffee Roasters",
        bgImage: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80",
        avatar: "B",
        textColor: "text-white",
        buttonStyle: "bg-[#5D4037] text-white h-12 flex items-center justify-center text-sm font-medium rounded-lg hover:bg-[#4E342E] transition-colors",
        links: ["Our Menu", "Order Online", "Locations", "Coffee Club", "Wholesale"],
        icons: [<Instagram size={18} />, <Facebook size={18} />],
        category: "Small Business"
    },
    {
        id: "bakery-sweet",
        name: "Bakery Sweet",
        creator: "Sugar & Spice",
        role: "Artisan Bakery",
        bgClass: "bg-[#FFF0F5]",
        avatar: "S",
        textColor: "text-[#D4447C]",
        buttonStyle: "bg-[#FFB6C1] text-[#8B3A62] h-12 flex items-center justify-center text-sm font-semibold rounded-full shadow-md hover:bg-[#FFC0CB] transition-colors",
        links: ["Today's Specials", "Custom Cakes", "Order Ahead", "Catering", "Contact Us"],
        icons: [<Instagram size={18} />, <Facebook size={18} />],
        category: "Small Business"
    },
    {
        id: "salon-beauty",
        name: "Salon Beauty",
        creator: "Luxe Hair Studio",
        role: "Premium Hair Salon",
        bgClass: "bg-gradient-to-br from-[#2C3E50] to-[#1A1A2E]",
        avatar: "L",
        textColor: "text-[#F0E6D3]",
        buttonStyle: "bg-[#C9B037] text-black h-12 flex items-center justify-center text-sm font-medium tracking-wide hover:bg-[#D4AF37] transition-colors",
        links: ["Book Appointment", "Services & Prices", "Our Team", "Gallery", "Gift Cards"],
        icons: [<Instagram size={18} />, <Facebook size={18} />],
        category: "Small Business"
    },
    {
        id: "restaurant-bistro",
        name: "Restaurant Bistro",
        creator: "The Local Kitchen",
        role: "Farm-to-Table Dining",
        bgImage: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
        avatar: "T",
        textColor: "text-white",
        buttonStyle: "bg-white/90 text-[#2D3436] h-12 flex items-center justify-center text-sm font-medium rounded-lg shadow-lg hover:bg-white transition-all",
        links: ["Reserve Table", "View Menu", "Today's Specials", "Events", "Catering"],
        icons: [<Instagram size={18} />, <Facebook size={18} />, <MapPin size={18} />],
        category: "Small Business"
    },
    {
        id: "boutique-store",
        name: "Boutique Store",
        creator: "Velvet & Thread",
        role: "Fashion Boutique",
        bgClass: "bg-[#FAF3E9]",
        avatar: "V",
        textColor: "text-[#5D4E37]",
        buttonStyle: "bg-[#8B7355] text-white h-12 flex items-center justify-center text-sm font-medium rounded-xl hover:bg-[#6B5344] transition-colors",
        links: ["Shop Collection", "New Arrivals", "Styling Service", "Store Location", "Instagram Shop"],
        icons: [<Instagram size={18} />, <ShoppingBag size={18} />],
        category: "Small Business"
    },

    // =====================
    // SOCIAL MEDIA (5 templates)
    // =====================
    {
        id: "instagram-star",
        name: "Instagram Star",
        creator: "@vibes.daily",
        role: "Lifestyle & Aesthetic",
        bgClass: "bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#FCAF45]",
        avatar: "V",
        textColor: "text-white",
        buttonStyle: "bg-white/20 backdrop-blur-md text-white h-12 flex items-center justify-center text-sm font-semibold rounded-2xl border border-white/30 hover:bg-white/30 transition-all",
        links: ["Shop My Looks", "Presets", "Brand Collabs", "YouTube", "Contact"],
        icons: [<Instagram size={18} />, <Youtube size={18} />, <Twitter size={18} />],
        category: "Social Media"
    },
    {
        id: "tiktok-creator",
        name: "TikTok Creator",
        creator: "@trendsetter",
        role: "Comedy & Entertainment",
        bgClass: "bg-black",
        avatar: "T",
        textColor: "text-white",
        buttonStyle: "bg-gradient-to-r from-[#00F2EA] to-[#FF0050] text-white h-12 flex items-center justify-center text-sm font-bold rounded-lg hover:scale-105 transition-transform",
        links: ["TikTok", "YouTube Shorts", "Merch", "Business Inquiries", "Discord"],
        icons: [<Instagram size={18} />, <Youtube size={18} />, <Twitter size={18} />],
        category: "Social Media"
    },
    {
        id: "youtube-star",
        name: "YouTube Star",
        creator: "Tech Review Pro",
        role: "Tech YouTuber | 2M Subs",
        bgClass: "bg-[#FF0000]",
        avatar: "T",
        textColor: "text-white",
        buttonStyle: "bg-white text-[#FF0000] h-12 flex items-center justify-center text-sm font-bold rounded-lg shadow-lg hover:bg-gray-100 transition-colors",
        links: ["Subscribe", "Latest Video", "Gear I Use", "Podcast", "Business"],
        icons: [<Youtube size={18} />, <Twitter size={18} />, <Instagram size={18} />],
        category: "Social Media"
    },
    {
        id: "twitter-voice",
        name: "Twitter Voice",
        creator: "@thoughts_daily",
        role: "Tech & Culture Commentary",
        bgClass: "bg-[#1DA1F2]",
        avatar: "T",
        textColor: "text-white",
        buttonStyle: "bg-white text-[#1DA1F2] h-11 flex items-center justify-center text-sm font-semibold rounded-full hover:bg-gray-100 transition-colors",
        links: ["Follow Me", "Newsletter", "Threads", "Speaking", "DM for Collabs"],
        icons: [<Twitter size={18} />, <Linkedin size={18} />],
        category: "Social Media"
    },
    {
        id: "linkedin-leader",
        name: "LinkedIn Leader",
        creator: "Sarah CEO",
        role: "Founder & Thought Leader",
        bgClass: "bg-[#0077B5]",
        avatar: "S",
        textColor: "text-white",
        buttonStyle: "bg-white text-[#0077B5] h-12 flex items-center justify-center text-sm font-semibold rounded-lg shadow-md hover:bg-gray-50 transition-colors",
        links: ["Connect on LinkedIn", "My Newsletter", "Speaking & Events", "Consulting", "My Book"],
        icons: [<Linkedin size={18} />, <Twitter size={18} />],
        category: "Social Media"
    },

    // ================
    // SPORTS (5 templates)
    // ================
    {
        id: "athlete-pro",
        name: "Athlete Pro",
        creator: "Jake Runner",
        role: "Professional Marathon Runner",
        bgImage: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=800&q=80",
        avatar: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=150&q=80",
        textColor: "text-white",
        buttonStyle: "bg-[#FF5722] text-white h-14 flex items-center justify-center text-sm font-bold uppercase tracking-wide hover:bg-[#E64A19] transition-colors",
        links: ["Race Calendar", "Training Tips", "Sponsors", "Strava", "Media Kit"],
        icons: [<Instagram size={18} />, <Twitter size={18} />, <Youtube size={18} />],
        category: "Sports"
    },
    {
        id: "surf-life",
        name: "Surf Life",
        creator: "Wave Rider",
        role: "Pro Surfer & Coach",
        bgImage: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=800&q=80",
        avatar: "W",
        textColor: "text-white",
        buttonStyle: "bg-[#00BCD4] text-white h-12 flex items-center justify-center text-sm font-semibold rounded-full hover:bg-[#00ACC1] transition-colors",
        links: ["Surf Lessons", "Surf Camps", "Gear Guide", "Blog", "Contact"],
        icons: [<Instagram size={18} />, <Youtube size={18} />],
        category: "Sports"
    },
    {
        id: "soccer-star",
        name: "Soccer Star",
        creator: "Diego Striker",
        role: "Professional Soccer Player",
        bgClass: "bg-gradient-to-b from-[#1B5E20] to-[#0D3311]",
        avatar: "D",
        textColor: "text-white",
        buttonStyle: "bg-white text-[#1B5E20] h-12 flex items-center justify-center text-sm font-bold rounded-lg hover:bg-gray-100 transition-colors",
        links: ["Match Highlights", "Training Vlogs", "Merchandise", "Fan Club", "Book Appearance"],
        icons: [<Instagram size={18} />, <Twitter size={18} />, <Youtube size={18} />],
        category: "Sports"
    },
    {
        id: "basketball-coach",
        name: "Basketball Coach",
        creator: "Coach Williams",
        role: "Basketball Skills Trainer",
        bgClass: "bg-[#E65100]",
        avatar: "C",
        textColor: "text-white",
        buttonStyle: "bg-black text-white h-12 flex items-center justify-center text-sm font-bold uppercase tracking-wider hover:bg-gray-900 transition-colors",
        links: ["Training Programs", "1-on-1 Sessions", "Skills Academy", "YouTube", "Testimonials"],
        icons: [<Instagram size={18} />, <Youtube size={18} />, <Twitter size={18} />],
        category: "Sports"
    },
    {
        id: "mma-fighter",
        name: "MMA Fighter",
        creator: "Iron Fist",
        role: "Professional MMA Fighter",
        bgClass: "bg-black",
        avatar: "I",
        textColor: "text-[#DC143C]",
        buttonStyle: "bg-[#DC143C] text-white h-14 flex items-center justify-center text-sm font-black uppercase tracking-wide hover:bg-[#B91C1C] transition-colors",
        links: ["Fight Schedule", "Training Camp", "Merch", "Sponsors", "Media"],
        icons: [<Instagram size={18} />, <Twitter size={18} />, <Youtube size={18} />],
        category: "Sports"
    },

    // ==================
    // TELEGRAM (5 templates)
    // ==================
    {
        id: "telegram-community",
        name: "TeleGroup",
        creator: "Crypto Signals",
        role: "Trading Community",
        bgClass: "bg-[#0088CC]",
        avatar: "T",
        textColor: "text-white",
        buttonStyle: "bg-white text-[#0088cc] h-12 flex items-center justify-center text-sm font-bold rounded-xl shadow-lg hover:bg-blue-50 transition-colors",
        links: ["Join VIP Channel", "Free Signals", "Results", "Support Bot", "Website"],
        icons: [<Send size={18} />, <Twitter size={18} />],
        category: "Telegram"
    },
    {
        id: "telegram-news",
        name: "News Channel",
        creator: "Breaking Tech",
        role: "Tech News Updates",
        bgClass: "bg-gradient-to-br from-[#229ED9] to-[#1C6EA4]",
        avatar: "B",
        textColor: "text-white",
        buttonStyle: "bg-white/20 backdrop-blur-sm text-white h-12 flex items-center justify-center text-sm font-semibold rounded-lg border border-white/30 hover:bg-white/30 transition-all",
        links: ["Join Channel", "Discussion Group", "Newsletter", "Twitter", "About"],
        icons: [<Send size={18} />, <Twitter size={18} />],
        category: "Telegram"
    },
    {
        id: "telegram-bot",
        name: "Bot Service",
        creator: "Auto Bot Pro",
        role: "Telegram Bot Developer",
        bgClass: "bg-[#1C2833]",
        avatar: "A",
        textColor: "text-[#5DADE2]",
        buttonStyle: "bg-[#5DADE2] text-[#1C2833] h-12 flex items-center justify-center text-sm font-bold rounded-lg hover:bg-[#3498DB] transition-colors",
        links: ["Try Our Bot", "Bot Catalog", "Custom Development", "Documentation", "Support"],
        icons: [<Send size={18} />, <MessageCircle size={18} />],
        category: "Telegram"
    },
    {
        id: "telegram-nft",
        name: "NFT Alpha",
        creator: "NFT Hunters",
        role: "NFT & Web3 Community",
        bgClass: "bg-gradient-to-b from-[#8E44AD] to-[#3498DB]",
        avatar: "N",
        textColor: "text-white",
        buttonStyle: "bg-black/30 backdrop-blur-md text-white h-12 flex items-center justify-center text-sm font-bold rounded-full border border-white/20 hover:bg-black/50 transition-all",
        links: ["Join Premium", "Free Group", "OpenSea", "Twitter", "Website"],
        icons: [<Send size={18} />, <Twitter size={18} />],
        category: "Telegram"
    },
    {
        id: "telegram-education",
        name: "Learn Hub",
        creator: "Study Together",
        role: "Educational Community",
        bgClass: "bg-[#27AE60]",
        avatar: "S",
        textColor: "text-white",
        buttonStyle: "bg-white text-[#27AE60] h-12 flex items-center justify-center text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors",
        links: ["Join Study Group", "Resources", "Tutoring", "Notes Channel", "Ask Questions"],
        icons: [<Send size={18} />, <Youtube size={18} />],
        category: "Telegram"
    },

    // ==================
    // WHATSAPP (5 templates)
    // ==================
    {
        id: "whatsapp-business",
        name: "WhatsApp Business",
        creator: "Quick Store",
        role: "Order via WhatsApp",
        bgClass: "bg-[#25D366]",
        avatar: "Q",
        textColor: "text-white",
        buttonStyle: "bg-white text-[#25D366] h-12 flex items-center justify-center text-sm font-bold rounded-full shadow-lg hover:bg-gray-50 transition-colors",
        links: ["Order Now", "View Catalog", "Track Order", "Customer Support", "Location"],
        icons: [<MessageCircle size={18} />, <Instagram size={18} />],
        category: "Whatsapp"
    },
    {
        id: "whatsapp-community",
        name: "WA Community",
        creator: "Entrepreneurs Hub",
        role: "Business Networking Group",
        bgClass: "bg-[#128C7E]",
        avatar: "E",
        textColor: "text-white",
        buttonStyle: "bg-[#25D366] text-white h-12 flex items-center justify-center text-sm font-semibold rounded-xl hover:bg-[#20BD5A] transition-colors",
        links: ["Join Community", "Upcoming Events", "Member Directory", "Resources", "Admin Contact"],
        icons: [<MessageCircle size={18} />, <Linkedin size={18} />],
        category: "Whatsapp"
    },
    {
        id: "whatsapp-service",
        name: "Service Chat",
        creator: "Home Repairs Pro",
        role: "Book Services via WhatsApp",
        bgClass: "bg-gradient-to-br from-[#25D366] to-[#128C7E]",
        avatar: "H",
        textColor: "text-white",
        buttonStyle: "bg-white/20 backdrop-blur-sm text-white h-12 flex items-center justify-center text-sm font-medium rounded-lg border border-white/30 hover:bg-white/30 transition-all",
        links: ["Get Quote", "Our Services", "Book Appointment", "Reviews", "Emergency Service"],
        icons: [<MessageCircle size={18} />, <Facebook size={18} />],
        category: "Whatsapp"
    },
    {
        id: "whatsapp-deals",
        name: "Deal Alerts",
        creator: "Bargain Finder",
        role: "Daily Deals & Coupons",
        bgClass: "bg-[#075E54]",
        avatar: "B",
        textColor: "text-[#25D366]",
        buttonStyle: "bg-[#25D366] text-white h-12 flex items-center justify-center text-sm font-bold rounded-lg hover:bg-[#20BD5A] transition-colors",
        links: ["Join Deals Group", "Today's Best Deals", "Coupon Codes", "Amazon Finds", "About Us"],
        icons: [<MessageCircle size={18} />, <Twitter size={18} />],
        category: "Whatsapp"
    },
    {
        id: "whatsapp-fitness",
        name: "Fitness Group",
        creator: "Fit Together",
        role: "Workout Accountability Group",
        bgClass: "bg-[#34B7F1]",
        avatar: "F",
        textColor: "text-white",
        buttonStyle: "bg-[#25D366] text-white h-12 flex items-center justify-center text-sm font-semibold rounded-full hover:bg-[#20BD5A] transition-colors",
        links: ["Join Challenge", "Workout Plans", "Nutrition Tips", "Progress Tracker", "Community"],
        icons: [<MessageCircle size={18} />, <Instagram size={18} />],
        category: "Whatsapp"
    }
];
