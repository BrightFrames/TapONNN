
import React from "react";
import {
    Instagram,
    Youtube,
    Twitter,
    Facebook,
    Music2,
    Send,
    MessageCircle,
    ShoppingBag,
    MapPin,
    Coffee,
    Camera,
    Ticket
} from "lucide-react";

// Types
type TemplateData = {
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
};

const categories = [
    "Fashion", "Health and Fitness", "Influencer and Creator", "Marketing",
    "Music", "Small Business", "Social Media", "Sports", "Telegram", "Whatsapp"
];

const templates: TemplateData[] = [
    {
        id: "artemis",
        name: "Artemis",
        creator: "Hydra Juice",
        role: "Your daily dose of vitamin C",
        bgClass: "bg-[#4A5D4F]",
        avatar: "H", // Placeholder for Hydra logo
        textColor: "text-white",
        buttonStyle: "rounded-full bg-[#E5E5E5]/20 backdrop-blur-sm h-12 flex items-center justify-center text-sm font-medium transition-transform hover:scale-105",
        links: ["Our drinks", "Find us", "Wellbeings", "Our latest Podcast"],
        icons: [<MessageCircle size={18} />, <Music2 size={18} />, <Youtube size={18} />]
    },
    {
        id: "balcombe",
        name: "Balcombe",
        creator: "Katy Delma",
        role: "an innovative solar design practice that brings solar energy into daily life.",
        bgImage: "https://images.unsplash.com/photo-1543013309-0d1f4ed48e18?auto=format&fit=crop&w=800&q=80", // Pool/Water vibe
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80",
        textColor: "text-white",
        buttonStyle: "rounded-3xl bg-white text-black h-12 flex items-center px-4 gap-3 text-sm font-medium shadow-md transition-transform hover:scale-105",
        links: ["Travel Blog", "Travel Tips", "Hiking Equipment", "Camera Equipment"],
        icons: [], // No icons shown at bottom in screenshot, but maybe inside buttons? Screenshot shows icons in buttons.
        hasIconsInButtons: true
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
        icons: [<ShoppingBag size={18} />, <MessageCircle size={18} />, <Instagram size={18} />]
    },
    {
        id: "bourke",
        name: "Bourke",
        creator: "Dena Presley",
        role: "Long Distance Runner",
        bgImage: "https://images.unsplash.com/photo-1533560906234-54cb6264e97e?auto=format&fit=crop&w=800&q=80", // Blue texture
        avatar: "https://images.unsplash.com/photo-1594824476964-e25b1598d5ba?auto=format&fit=crop&w=150&q=80",
        textColor: "text-white",
        buttonStyle: "bg-white text-black h-12 flex items-center justify-center text-sm font-medium rounded-xl border-2 border-transparent hover:border-blue-200 transition-transform hover:scale-105",
        links: ["Running Tracks", "Trail Routes", "Diet Routine"],
        icons: [<Twitter size={18} />, <Facebook size={18} />, <Instagram size={18} />, <Music2 size={18} />]
    },
    {
        id: "constance",
        name: "Constance",
        creator: "Lowell Silvia",
        role: "Brand Ambassador for Helix, based in SoCal.",
        bgImage: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=800&q=80", // Light faded bg
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
        textColor: "text-white",
        buttonStyle: "bg-white text-black h-12 flex items-center justify-center text-lg font-bold shadow-lg rounded-lg transition-transform hover:scale-105",
        links: ["My favourite skate parks", "Explore Constance", "Affiliate Links"],
        icons: [<Twitter size={18} className="text-white/70" />, <Facebook size={18} className="text-white/70" />, <Instagram size={18} className="text-white/70" />, <Music2 size={18} className="text-white/70" />]
    },
    {
        id: "coromandel",
        name: "Coromandel",
        creator: "Bakie",
        role: "Plant-based bakery",
        bgImage: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80", // Bread/Bakery
        avatar: "B",
        textColor: "text-white",
        buttonStyle: "bg-[#FFF5E1]/90 text-[#8B4513] h-12 flex items-center justify-center text-sm font-medium shadow-sm transition-transform hover:scale-105", // Wavy approximation
        links: ["Book our famous afternoon tea", "Menu", "Monthly special offers", "Gift cards", "Contact us"],
        icons: [<Twitter size={18} />, <Facebook size={18} />, <Instagram size={18} />, <Music2 size={18} />]
    }
];

// Helper for rendering icons inside buttons for Balcombe
const getButtonIcon = (index: number) => {
    switch (index) {
        case 0: return <Ticket size={16} className="text-teal-600" />;
        case 1: return <Coffee size={16} className="text-green-600" />;
        case 2: return <MapPin size={16} className="text-orange-600" />;
        case 3: return <Camera size={16} className="text-gray-600" />;
        default: return null;
    }
};

const TemplateCard = ({ template }: { template: TemplateData }) => {
    return (
        <div className="flex flex-col items-center gap-4 group">
            {/* Phone Frame */}
            <div
                className={`relative w-[280px] h-[580px] rounded-[3rem] overflow-hidden shadow-2xl transition-transform duration-300 group-hover:-translate-y-2 border-[6px] border-black/5 ${template.bgClass || ''}`}
                style={template.bgImage ? { backgroundImage: `url(${template.bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
            >
                {/* Overlay for readability if image */}
                {template.bgImage && <div className="absolute inset-0 bg-black/20" />}

                {/* Content */}
                <div className="relative h-full flex flex-col items-center pt-16 px-6 pb-8 z-10">

                    {/* Avatar */}
                    <div className="mb-4">
                        {template.avatar.startsWith('http') ? (
                            <img src={template.avatar} alt={template.creator} className="w-20 h-20 rounded-full object-cover border-2 border-white/20" />
                        ) : (
                            <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold ${template.id === 'artemis' ? 'bg-[#3A4D3F] text-[#E07F4F]' : 'bg-red-600 text-white'}`}>
                                {template.avatar}
                            </div>
                        )}
                    </div>

                    {/* Header Text */}
                    <h3 className={`text-xl font-bold mb-1 text-center ${template.textColor}`}>{template.creator}</h3>
                    <p className={`text-xs text-center opacity-90 mb-8 max-w-[200px] leading-tight ${template.textColor}`}>{template.role}</p>

                    {/* Links */}
                    <div className="w-full flex-1 flex flex-col gap-3">
                        {template.links.map((link, i) => (
                            <button key={i} className={template.buttonStyle}>
                                {template.hasIconsInButtons && getButtonIcon(i)}
                                {link}
                            </button>
                        ))}
                    </div>

                    {/* Social Icons */}
                    <div className={`flex gap-4 mt-auto justify-center ${template.textColor}`}>
                        {template.icons.map((icon, i) => (
                            <div key={i} className="hover:opacity-80 cursor-pointer">
                                {icon}
                            </div>
                        ))}
                    </div>

                </div>
            </div>

            {/* Template Name */}
            <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
        </div>
    );
};

const Template = () => {
    return (
        <div className="min-h-screen bg-[#F9F9F9] text-[#1E2330] font-sans">
            <div className="container mx-auto px-4 py-20">

                {/* Hero Section */}
                <div className="text-center mb-24">
                    <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tight text-[#1E2330]">
                        A Linktree template to<br />suit every brand and<br />creator
                    </h1>
                    <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        Different Link Apps, integrations and visual styles can help you create a Linktree that looks and feels like you and your brand. Explore our library of custom templates to grow and connect with your audience even more easily!
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-12 items-start">

                    {/* Categories Sidebar/List */}
                    <div className="w-full lg:w-64 flex-shrink-0">
                        <div className="flex flex-row lg:flex-col flex-wrap gap-3 sticky top-8">
                            {categories.map((cat, i) => (
                                <button
                                    key={i}
                                    className="px-6 py-3 rounded-full border border-gray-200 bg-white text-sm font-semibold hover:bg-gray-50 hover:border-gray-300 transition-colors text-left whitespace-nowrap"
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Templates Grid */}
                    <div className="flex-1">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16 justify-items-center">
                            {templates.map((t) => (
                                <TemplateCard key={t.id} template={t} />
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Template;
