
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
    Linkedin
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
    {
        id: "artemis",
        name: "Artemis",
        creator: "Hydra Juice",
        role: "Your daily dose of vitamin C",
        bgClass: "bg-[#4A5D4F]",
        avatar: "H",
        textColor: "text-white",
        buttonStyle: "rounded-full bg-[#E5E5E5]/20 backdrop-blur-sm h-12 flex items-center justify-center text-sm font-medium transition-transform hover:scale-105",
        links: ["Our drinks", "Find us", "Wellbeings", "Our latest Podcast"],
        icons: [<MessageCircle size={18} />, <Music2 size={18} />, <Youtube size={18} />],
        category: "Health and Fitness"
    },
    {
        id: "balcombe",
        name: "Balcombe",
        creator: "Katy Delma",
        role: "an innovative solar design practice that brings solar energy into daily life.",
        bgImage: "https://images.unsplash.com/photo-1543013309-0d1f4ed48e18?auto=format&fit=crop&w=800&q=80",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80",
        textColor: "text-white",
        buttonStyle: "rounded-3xl bg-white text-black h-12 flex items-center px-4 gap-3 text-sm font-medium shadow-md transition-transform hover:scale-105",
        links: ["Travel Blog", "Travel Tips", "Hiking Equipment", "Camera Equipment"],
        icons: [],
        hasIconsInButtons: true,
        category: "Influencer and Creator"
    },
    {
        id: "boultont",
        name: "Boultont",
        creator: "Sweetest Bean",
        role: "Specialty Coffee & Cocktails",
        bgClass: "bg-[#E6E6E6]",
        avatar: "S",
        textColor: "text-[#3E4935]",
        buttonStyle: "rounded-sm bg-white text-black h-12 flex items-center justify-center text-sm font-mono tracking-wide shadow-sm border border-stone-200 transition-transform hover:scale-105",
        links: ["Special Release", "Menu", "Book a table", "Barista Workshops"],
        icons: [<ShoppingBag size={18} />, <MessageCircle size={18} />, <Instagram size={18} />],
        category: "Small Business"
    },
    {
        id: "bourke",
        name: "Bourke",
        creator: "Dena Presley",
        role: "Long Distance Runner",
        bgImage: "https://images.unsplash.com/photo-1533560906234-54cb6264e97e?auto=format&fit=crop&w=800&q=80",
        avatar: "https://images.unsplash.com/photo-1594824476964-e25b1598d5ba?auto=format&fit=crop&w=150&q=80",
        textColor: "text-white",
        buttonStyle: "bg-white text-black h-12 flex items-center justify-center text-sm font-medium rounded-xl border-2 border-transparent hover:border-blue-200 transition-transform hover:scale-105",
        links: ["Running Tracks", "Trail Routes", "Diet Routine"],
        icons: [<Twitter size={18} />, <Facebook size={18} />, <Instagram size={18} />, <Music2 size={18} />],
        category: "Sports"
    },
    {
        id: "constance",
        name: "Constance",
        creator: "Lowell Silvia",
        role: "Brand Ambassador for Helix, based in SoCal.",
        bgImage: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=800&q=80",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
        textColor: "text-white",
        buttonStyle: "bg-white text-black h-12 flex items-center justify-center text-lg font-bold shadow-lg rounded-lg transition-transform hover:scale-105",
        links: ["My favourite skate parks", "Explore Constance", "Affiliate Links"],
        icons: [<Twitter size={18} className="text-white/70" />, <Facebook size={18} className="text-white/70" />, <Instagram size={18} className="text-white/70" />, <Music2 size={18} className="text-white/70" />],
        category: "Sports"
    },
    {
        id: "coromandel",
        name: "Coromandel",
        creator: "Bakie",
        role: "Plant-based bakery",
        bgImage: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80",
        avatar: "B",
        textColor: "text-white",
        buttonStyle: "bg-[#FFF5E1]/90 text-[#8B4513] h-12 flex items-center justify-center text-sm font-medium shadow-sm transition-transform hover:scale-105",
        links: ["Book our famous afternoon tea", "Menu", "Monthly special offers", "Gift cards", "Contact us"],
        icons: [<Twitter size={18} />, <Facebook size={18} />, <Instagram size={18} />, <Music2 size={18} />],
        category: "Small Business"
    },
    {
        id: "neon-night",
        name: "Neon Night",
        creator: "Cyber Kai",
        role: "Digital Artist & Gamer",
        bgClass: "bg-black",
        avatar: "K",
        textColor: "text-purple-400",
        buttonStyle: "bg-black border border-purple-500 text-purple-400 h-12 flex items-center justify-center text-sm font-mono tracking-widest shadow-[0_0_10px_rgba(168,85,247,0.5)] hover:shadow-[0_0_20px_rgba(168,85,247,0.8)] transition-all hover:scale-105",
        links: ["Portfolio", "Twitch Stream", "Merch Store", "Discord Community"],
        icons: [<Twitter size={18} />, <Youtube size={18} />, <MessageCircle size={18} />],
        category: "Influencer and Creator"
    },
    {
        id: "glassy",
        name: "Glassy",
        creator: "Sarah Vibes",
        role: "Lifestyle Vlogger",
        bgClass: "bg-gradient-to-br from-pink-400 via-purple-400 to-indigo-400",
        avatar: "S",
        textColor: "text-white",
        buttonStyle: "bg-white/20 backdrop-blur-md border border-white/30 text-white h-12 flex items-center justify-center text-sm font-medium rounded-2xl shadow-lg transition-transform hover:scale-105 hover:bg-white/30",
        links: ["Latest Video", "My Gear", "Travel Guide", "Support Me"],
        icons: [<Instagram size={18} />, <Youtube size={18} />, <Music2 size={18} />],
        category: "Social Media"
    },
    {
        id: "minimalist-mono",
        name: "Minimalist Mono",
        creator: "Studio Noir",
        role: "Visual Identity Design",
        bgClass: "bg-white",
        avatar: "N",
        textColor: "text-gray-900",
        buttonStyle: "bg-transparent border border-gray-900 text-gray-900 h-10 flex items-center justify-center text-xs uppercase tracking-[0.2em] transition-all hover:bg-gray-900 hover:text-white rounded-none",
        links: ["Projects", "About", "Services", "Contact"],
        icons: [<Instagram size={18} />, <Twitter size={18} />],
        category: "Marketing"
    },
    {
        id: "pastel-dream",
        name: "Pastel Dream",
        creator: "Coco's Sweets",
        role: "Custom Cakes & Treats",
        bgClass: "bg-[#FFF0F5]",
        avatar: "C",
        textColor: "text-[#8B5F65]",
        buttonStyle: "bg-[#FFE4E1] text-[#8B5F65] h-12 flex items-center justify-center text-sm font-semibold rounded-[2rem] shadow-sm hover:shadow-md transition-transform hover:scale-105 border-2 border-white",
        links: ["Custom Orders", "Menu", "Wedding Cakes", "Gallery"],
        icons: [<Instagram size={18} />, <Facebook size={18} />, <MessageCircle size={18} />],
        category: "Small Business"
    },
    // NEW TEMPLATES
    {
        id: "vogue-fashion",
        name: "Vogue Vogue",
        creator: "ELLE",
        role: "Fashion Editorial",
        bgImage: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80",
        avatar: "E",
        textColor: "text-black",
        buttonStyle: "bg-white text-black h-12 flex items-center justify-center text-sm font-serif italic border-b-2 border-black hover:bg-black hover:text-white transition-all",
        links: ["New Collection", "Runway Highlights", "Trends 2026", "Subscribe"],
        icons: [<Instagram size={18} />, <Twitter size={18} />],
        category: "Fashion"
    },
    {
        id: "soundwave",
        name: "SoundWave",
        creator: "DJ Pulse",
        role: "Electronic Music Producer",
        bgClass: "bg-[#09090b]",
        avatar: "P",
        textColor: "text-cyan-400",
        buttonStyle: "bg-[#18181b] text-cyan-400 border border-cyan-800 h-14 flex items-center justify-center text-sm font-bold tracking-wider hover:bg-cyan-950 transition-colors uppercase",
        links: ["Latest Mix", "Tour Dates", "Beatport", "Spotify"],
        icons: [<Music2 size={18} />, <Youtube size={18} />, <Ticket size={18} />],
        category: "Music"
    },
    {
        id: "zen-yoga",
        name: "Zen Yoga",
        creator: "Maya Wellness",
        role: "Mindful Yoga Instructor",
        bgClass: "bg-[#F0FDF4]",
        avatar: "M",
        textColor: "text-green-800",
        buttonStyle: "bg-[#DCFCE7] text-green-900 h-12 flex items-center justify-center text-sm font-medium rounded-full hover:bg-[#BBF7D0] transition-colors shadow-sm",
        links: ["Morning Flow Class", "Meditation Guide", "Retreats 2026", "Wellness Blog"],
        icons: [<Instagram size={18} />, <Youtube size={18} />],
        category: "Health and Fitness"
    },
    {
        id: "tech-growth",
        name: "Growth Hacker",
        creator: "Startup scale",
        role: "SaaS Marketing Consultant",
        bgClass: "bg-[#F8FAFC]",
        avatar: "S",
        textColor: "text-slate-800",
        buttonStyle: "bg-[#3B82F6] text-white h-12 flex items-center justify-center text-sm font-bold rounded-lg shadow-md hover:bg-[#2563EB] transition-colors",
        links: ["Book Consultation", "Case Studies", "Free E-book", "LinkedIn"],
        icons: [<Linkedin size={18} />, <Twitter size={18} />],
        category: "Marketing"
    },
    {
        id: "telegram-community",
        name: "TeleGroup",
        creator: "Crypto Signals",
        role: "Trading Community",
        bgClass: "bg-[#29B6F6]",
        avatar: "T",
        textColor: "text-white",
        buttonStyle: "bg-white text-[#0088cc] h-12 flex items-center justify-center text-sm font-bold rounded-xl shadow-lg hover:bg-blue-50 transition-colors",
        links: ["Join VIP Channel", "Free Analysis", "Support Bot", "Website"],
        icons: [<MessageCircle size={18} />, <Twitter size={18} />],
        category: "Telegram"
    },
    // PREMIUM THEMES (Patterns/Gradients)
    {
        id: "aura",
        name: "Aura",
        creator: "Tap2 Premium",
        role: "",
        bgClass: "bg-[#E6E5D7]",
        avatar: "Aa",
        textColor: "text-[#3D3D3D]",
        buttonStyle: "bg-transparent border border-[#3D3D3D] text-[#3D3D3D] rounded-3xl h-12 flex items-center justify-center font-serif text-lg",
        links: ["Link One", "Link Two", "Link Three"],
        icons: [],
        category: "Creative"
    },
    {
        id: "bliss",
        name: "Bliss",
        creator: "Tap2 Premium",
        role: "",
        bgImage: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=800&q=80",
        avatar: "Aa",
        textColor: "text-[#2D3436]",
        buttonStyle: "bg-white/40 backdrop-blur-md rounded-2xl h-12 flex items-center justify-center font-sans font-medium text-[#2D3436]",
        links: ["Link One", "Link Two", "Link Three"],
        icons: [],
        category: "Creative"
    },
    {
        id: "blocks",
        name: "Blocks",
        creator: "Tap2 Premium",
        role: "",
        bgClass: "bg-[#7F00FF]", // Vivid Purple
        avatar: "Aa",
        textColor: "text-white",
        buttonStyle: "bg-[#E056FD] border-2 border-black text-black h-12 flex items-center justify-center font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
        links: ["Link One", "Link Two", "Link Three"],
        icons: [],
        category: "Creative"
    },
    {
        id: "bloom",
        name: "Bloom",
        creator: "Tap2 Premium",
        role: "",
        bgClass: "bg-gradient-to-b from-[#FF6B6B] to-[#5563DE]", // Red to Blue gradient
        avatar: "Aa",
        textColor: "text-white",
        buttonStyle: "bg-transparent border border-white rounded-full h-12 flex items-center justify-center text-white",
        links: ["Link One", "Link Two", "Link Three"],
        icons: [],
        category: "Creative"
    },
    {
        id: "breeze",
        name: "Breeze",
        creator: "Tap2 Premium",
        role: "",
        bgClass: "bg-gradient-to-br from-[#FF9A9E] to-[#FECFEF]", // Pink Gradient
        avatar: "Aa",
        textColor: "text-[#4A4A4A]",
        buttonStyle: "bg-white/60 backdrop-blur-sm rounded-xl h-12 flex items-center justify-center text-[#4A4A4A] font-serif",
        links: ["Link One", "Link Two", "Link Three"],
        icons: [],
        category: "Creative"
    },
    {
        id: "encore",
        name: "Encore",
        creator: "Tap2 Premium",
        role: "",
        bgClass: "bg-[#111]",
        bgImage: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80", // Dark concert vibe
        avatar: "Aa",
        textColor: "text-[#E0C097]", // Champagne gold
        buttonStyle: "bg-transparent border border-[#E0C097] text-[#E0C097] rounded-none h-12 flex items-center justify-center font-light uppercase tracking-widest",
        links: ["Link One", "Link Two", "Link Three"],
        icons: [],
        category: "Music"
    },
    {
        id: "grid",
        name: "Grid",
        creator: "Tap2 Premium",
        role: "",
        bgClass: "bg-[#EDF7C2]", // Light Lime
        avatar: "AA",
        textColor: "text-black",
        buttonStyle: "bg-white border-2 border-black rounded-full h-12 flex items-center justify-center font-black italic shadow-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all",
        links: ["Link One", "Link Two", "Link Three"],
        icons: [],
        category: "Creative"
    },
    {
        id: "groove",
        name: "Groove",
        creator: "Tap2 Premium",
        role: "",
        bgImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80", // Liquid abstract
        avatar: "Aa",
        textColor: "text-white",
        buttonStyle: "bg-black/30 backdrop-blur-md rounded-full h-12 flex items-center justify-center text-white font-bold",
        links: ["Link One", "Link Two", "Link Three"],
        icons: [],
        category: "Creative"
    },
    {
        id: "haven",
        name: "Haven",
        creator: "Tap2 Premium",
        role: "",
        bgClass: "bg-[#D7CCC8]", // Earthy Beige
        bgImage: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=800&q=80", // Minimalist architecture
        avatar: "Aa",
        textColor: "text-[#4E342E]",
        buttonStyle: "bg-[#F5F5F5] rounded-xl h-12 flex items-center justify-center text-[#4E342E] font-medium shadow-sm",
        links: ["Link One", "Link Two", "Link Three"],
        icons: [],
        category: "Creative"
    },
    {
        id: "lake",
        name: "Lake",
        creator: "Tap2 Premium",
        role: "",
        bgClass: "bg-[#0F172A]", // Dark Navy
        bgImage: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=800&q=80", // Dark water
        avatar: "Aa",
        textColor: "text-white",
        buttonStyle: "bg-white/10 backdrop-blur-md rounded-lg h-12 flex items-center justify-center text-white font-light tracking-wide",
        links: ["Link One", "Link Two", "Link Three"],
        icons: [],
        category: "Nature"
    },
    {
        id: "mineral",
        name: "Mineral",
        creator: "Tap2 Premium",
        role: "",
        bgClass: "bg-[#FDEEDC]", // Soft Peach/Beige
        avatar: "Aa",
        textColor: "text-[#1C1C1C]",
        buttonStyle: "bg-transparent border border-[#1C1C1C] rounded-[2rem] h-12 flex items-center justify-center text-[#1C1C1C] font-serif",
        links: ["Link One", "Link Two", "Link Three"],
        icons: [],
        category: "Creative"
    },
    {
        id: "nourish",
        name: "Nourish",
        creator: "Tap2 Premium",
        role: "",
        bgClass: "bg-[#556B2F]", // Olive Green
        bgImage: "https://images.unsplash.com/photo-1615485925694-a692a543a993?auto=format&fit=crop&w=800&q=80", // Green texture
        avatar: "Aa",
        textColor: "text-[#F1F8E9]",
        buttonStyle: "bg-[#81C784] text-[#1B5E20] rounded-full h-12 flex items-center justify-center font-bold",
        links: ["Link One", "Link Two", "Link Three"],
        icons: [],
        category: "Nature"
    }
];
