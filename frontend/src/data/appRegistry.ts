// Linktree-style App Registry - EXPANDED
// 80+ Apps across all categories

export interface MarketplaceApp {
    id: string;
    name: string;
    category: string[];
    description: string;
    icon: string;
    isNative: boolean;
    installType: "instant" | "oauth" | "redirect";
    rendersOnProfile: boolean;
    status: "active" | "coming_soon";
    isPremium?: boolean;
    configFields?: ConfigField[];
}

export interface ConfigField {
    key: string;
    label: string;
    type: "text" | "url" | "toggle" | "select";
    placeholder?: string;
    required?: boolean;
    options?: string[];
}

export interface InstalledApp {
    appId: string;
    isActive: boolean;
    position: number;
    config: Record<string, any>;
    installedAt: Date;
}

// Categories with guaranteed apps
export const APP_CATEGORIES = [
    "All",
    "Featured",
    "Social",
    "Music",
    "Video",
    "Commerce",
    "Donations",
    "Scheduling",
    "Marketing",
    "Community",
    "Podcasts",
    "NFT & Web3",
    "Forms"
] as const;

export type AppCategory = typeof APP_CATEGORIES[number];

// ===========================================
// FULL APP REGISTRY - 80+ APPS
// ===========================================
export const appRegistry: MarketplaceApp[] = [

    // ===============================
    // FEATURED (Top Apps)
    // ===============================
    {
        id: "spotify",
        name: "Spotify",
        category: ["Featured", "Music"],
        description: "Share music, playlists, and podcasts from Spotify",
        icon: "🎧",
        isNative: false,
        installType: "oauth",
        rendersOnProfile: true,
        status: "active"
    },
    {
        id: "youtube",
        name: "YouTube",
        category: ["Featured", "Video"],
        description: "Embed your latest YouTube videos",
        icon: "▶️",
        isNative: false,
        installType: "oauth",
        rendersOnProfile: true,
        status: "active"
    },
    {
        id: "instagram",
        name: "Instagram",
        category: ["Featured", "Social"],
        description: "Display your latest Instagram posts",
        icon: "📸",
        isNative: false,
        installType: "oauth",
        rendersOnProfile: true,
        status: "active"
    },
    {
        id: "tiktok",
        name: "TikTok",
        category: ["Featured", "Social", "Video"],
        description: "Showcase your TikTok videos",
        icon: "🎵",
        isNative: false,
        installType: "redirect",
        rendersOnProfile: true,
        status: "active"
    },
    {
        id: "shopify",
        name: "Shopify",
        category: ["Featured", "Commerce"],
        description: "Connect your Shopify store",
        icon: "🛍️",
        isNative: false,
        installType: "oauth",
        rendersOnProfile: true,
        status: "active",
        isPremium: true
    },

    // ===============================
    // SOCIAL (15 apps)
    // ===============================
    {
        id: "twitter",
        name: "X / Twitter",
        category: ["Social"],
        description: "Show your latest tweets and threads",
        icon: "🐦",
        isNative: false,
        installType: "oauth",
        rendersOnProfile: true,
        status: "active"
    },
    {
        id: "threads",
        name: "Threads",
        category: ["Social"],
        description: "Connect your Threads profile",
        icon: "🧵",
        isNative: false,
        installType: "redirect",
        rendersOnProfile: true,
        status: "active"
    },
    {
        id: "linkedin",
        name: "LinkedIn",
        category: ["Social"],
        description: "Professional networking profile",
        icon: "💼",
        isNative: false,
        installType: "redirect",
        rendersOnProfile: true,
        status: "active"
    },
    {
        id: "pinterest",
        name: "Pinterest",
        category: ["Social"],
        description: "Share your Pinterest boards",
        icon: "📌",
        isNative: false,
        installType: "redirect",
        rendersOnProfile: true,
        status: "active"
    },
    {
        id: "snapchat",
        name: "Snapchat",
        category: ["Social"],
        description: "Add your Snapchat for quick connections",
        icon: "👻",
        isNative: false,
        installType: "redirect",
        rendersOnProfile: true,
        status: "active"
    },
    {
        id: "facebook",
        name: "Facebook",
        category: ["Social"],
        description: "Link to your Facebook profile or page",
        icon: "📘",
        isNative: false,
        installType: "redirect",
        rendersOnProfile: true,
        status: "active"
    },
    {
        id: "reddit",
        name: "Reddit",
        category: ["Social", "Community"],
        description: "Share your Reddit profile or subreddit",
        icon: "🤖",
        isNative: false,
        installType: "redirect",
        rendersOnProfile: true,
        status: "active"
    },
    {
        id: "tumblr",
        name: "Tumblr",
        category: ["Social"],
        description: "Connect your Tumblr blog",
        icon: "📓",
        isNative: false,
        installType: "redirect",
        rendersOnProfile: true,
        status: "active"
    },
    {
        id: "mastodon",
        name: "Mastodon",
        category: ["Social"],
        description: "Decentralized social network",
        icon: "🐘",
        isNative: false,
        installType: "redirect",
        rendersOnProfile: true,
        status: "active"
    },
    {
        id: "bluesky",
        name: "Bluesky",
        category: ["Social"],
        description: "Connect your Bluesky profile",
        icon: "🦋",
        isNative: false,
        installType: "redirect",
        rendersOnProfile: true,
        status: "active"
    },
    {
        id: "bereal",
        name: "BeReal",
        category: ["Social"],
        description: "Share your BeReal username",
        icon: "📷",
        isNative: false,
        installType: "redirect",
        rendersOnProfile: true,
        status: "active"
    },
    {
        id: "clubhouse",
        name: "Clubhouse",
        category: ["Social", "Podcasts"],
        description: "Audio conversations and rooms",
        icon: "🎙️",
        isNative: false,
        installType: "redirect",
        rendersOnProfile: true,
        status: "active"
    },
    {
        id: "whatsapp",
        name: "WhatsApp",
        category: ["Social", "Community"],
        description: "Let visitors message you on WhatsApp",
        icon: "💬",
        isNative: false,
        installType: "instant",
        rendersOnProfile: true,
        status: "active"
    },
    {
        id: "signal",
        name: "Signal",
        category: ["Social"],
        description: "Secure messaging",
        icon: "🔒",
        isNative: false,
        installType: "redirect",
        rendersOnProfile: true,
        status: "active"
    },
    {
        id: "wechat",
        name: "WeChat",
        category: ["Social"],
        description: "Connect on WeChat",
        icon: "💚",
        isNative: false,
        installType: "redirect",
        rendersOnProfile: true,
        status: "active"
    },

    // ===============================
    // MUSIC (12 apps)
    // ===============================
    {
        id: "apple-music",
        name: "Apple Music",
        category: ["Music"],
        description: "Share Apple Music content",
        icon: "🍎",
        isNative: false,
        installType: "redirect",
        rendersOnProfile: true,
        status: "active"
    },
    {
        id: "soundcloud",
        name: "SoundCloud",
        category: ["Music"],
        description: "Share your SoundCloud tracks",
        icon: "🔊",
        isNative: false,
        installType: "redirect",
        rendersOnProfile: true,
        status: "active"
    },
    {
        id: "bandcamp",
        name: "Bandcamp",
        category: ["Music", "Commerce"],
        description: "Sell and share your music",
        icon: "💿",
        isNative: false,
        installType: "redirect",
        rendersOnProfile: true,
        status: "active"
    },
    {
        id: "deezer",
        name: "Deezer",
        category: ["Music"],
        description: "Share Deezer tracks and playlists",
        icon: "🎶",
        isNative: false,
        installType: "redirect",
        rendersOnProfile: true,
        status: "active"
    },
    {
        id: "tidal",
        name: "Tidal",
        category: ["Music"],
        description: "High-fidelity music streaming",
        icon: "🌊",
        isNative: false,
        installType: "redirect",
        rendersOnProfile: true,
        status: "active"
    },
    {
        id: "amazon-music",
        name: "Amazon Music",
        category: ["Music"],
        description: "Share Amazon Music content",
        icon: "🎵",
        isNative: false,
        installType: "redirect",
        rendersOnProfile: true,
        status: "active"
    },
    {
        id: "audiomack",
        name: "Audiomack",
        category: ["Music"],
        description: "Free streaming for artists",
        icon: "🎧",
        isNative: false,
        installType: "redirect",
        rendersOnProfile: true,
        status: "active"
    },
    {
        id: "beatport",
        name: "Beatport",
        category: ["Music"],
        description: "Electronic music marketplace",
        icon: "🎛️",
        isNative: false,
        installType: "redirect",
        rendersOnProfile: true,
        status: "active"
    },
    {
        id: "songkick",
        name: "Songkick",
        category: ["Music"],
        description: "Concert and tour dates",
        icon: "🎤",
        isNative: false,
        installType: "redirect",
        rendersOnProfile: true,
        status: "active"
    },
    {
        id: "bandsintown",
        name: "Bandsintown",
        category: ["Music"],
        description: "Live music events and tickets",
        icon: "🎫",
        isNative: false,
        installType: "redirect",
        rendersOnProfile: true,
        status: "active"
    },
    {
        id: "linkfire",
        name: "Linkfire",
        category: ["Music", "Marketing"],
        description: "Smart music links",
        icon: "🔥",
        isNative: false,
        installType: "redirect",
        rendersOnProfile: true,
        status: "active",
        isPremium: true
    },
    {
        id: "feature-fm",
        name: "Feature.fm",
        category: ["Music", "Marketing"],
        description: "Music marketing platform",
        icon: "📻",
        isNative: false,
        installType: "redirect",
        rendersOnProfile: true,
        status: "active"
    },

    // ===============================
    // VIDEO (10 apps)
    // ===============================
    {
        id: "twitch",
        name: "Twitch",
        category: ["Video", "Community"],
        description: "Show your Twitch stream status",
        icon: "🎮",
        isNative: false,
        installType: "oauth",
        rendersOnProfile: true,
        status: "active"
    },
    {
        id: "vimeo",
        name: "Vimeo",
        category: ["Video"],
        description: "High-quality video hosting",
        icon: "🎬",
        isNative: false,
        installType: "redirect",
        rendersOnProfile: true,
        status: "active"
    },
    {
        id: "rumble",
        name: "Rumble",
        category: ["Video"],
        description: "Video platform alternative",
        icon: "📹",
        isNative: false,
        installType: "redirect",
        rendersOnProfile: true,
        status: "active"
    },
    {
        id: "dailymotion",
        name: "Dailymotion",
        category: ["Video"],
        description: "Video sharing platform",
        icon: "🎞️",
        isNative: false,
        installType: "redirect",
        rendersOnProfile: true,
        status: "active"
    },
    {
        id: "loom",
        name: "Loom",
        category: ["Video"],
        description: "Quick video recordings",
        icon: "🎥",
        isNative: false,
        installType: "redirect",
        rendersOnProfile: true,
        status: "active"
    },
    {
        id: "cameo",
        name: "Cameo",
        category: ["Video", "Commerce"],
        description: "Personalized video messages",
        icon: "⭐",
        isNative: false,
        installType: "redirect",
        rendersOnProfile: true,
        status: "active"
    },
    {
        id: "kick",
        name: "Kick",
        category: ["Video"],
        description: "Live streaming platform",
        icon: "🚀",
        isNative: false,
        installType: "redirect",
        rendersOnProfile: true,
        status: "active"
    },
    {
        id: "video-embed",
        name: "Video Embed",
        category: ["Video"],
        description: "Embed any video with a URL",
        icon: "📺",
        isNative: true,
        installType: "instant",
        rendersOnProfile: true,
        status: "active"
    },
    {
        id: "youtube-shorts",
        name: "YouTube Shorts",
        category: ["Video"],
        description: "Showcase short-form content",
        icon: "📱",
        isNative: false,
        installType: "redirect",
        rendersOnProfile: true,
        status: "active"
    },
    {
        id: "reels",
        name: "Instagram Reels",
        category: ["Video", "Social"],
        description: "Embed your Reels content",
        icon: "🎬",
        isNative: false,
        installType: "redirect",
        rendersOnProfile: true,
        status: "active"
    },

    // ===============================
    // COMMERCE (12 apps)
    // ===============================
    {
        id: "gumroad",
        name: "Gumroad",
        category: ["Commerce"],
        description: "Sell digital products",
        icon: "💳",
        isNative: false,
        installType: "redirect",
        rendersOnProfile: true,
        status: "active"
    },
    {
        id: "etsy",
        name: "Etsy",
        category: ["Commerce"],
        description: "Handmade & vintage marketplace",
        icon: "🧶",
        isNative: false,
        installType: "redirect",
        rendersOnProfile: true,
        status: "active"
    },
    {
        id: "amazon-affiliate",
        name: "Amazon Storefront",
        category: ["Commerce"],
        description: "Your Amazon affiliate storefront",
        icon: "📦",
        isNative: false,
        installType: "redirect",
        rendersOnProfile: true,
        status: "active"
    },
    {
        id: "depop",
        name: "Depop",
        category: ["Commerce"],
        description: "Fashion resale marketplace",
        icon: "👗",
        isNative: false,
        installType: "redirect",
        rendersOnProfile: true,
        status: "active"
    },
    {
        id: "poshmark",
        name: "Poshmark",
        category: ["Commerce"],
        description: "Social commerce for fashion",
        icon: "👠",
        isNative: false,
        installType: "redirect",
        rendersOnProfile: true,
        status: "active"
    },
    {
        id: "spring",
        name: "Spring (Teespring)",
        category: ["Commerce"],
        description: "Sell custom merchandise",
        icon: "👕",
        isNative: false,
        installType: "redirect",
        rendersOnProfile: true,
        status: "active"
    },
    {
        id: "printful",
        name: "Printful",
        category: ["Commerce"],
        description: "Print-on-demand products",
        icon: "🖨️",
        isNative: false,
        installType: "redirect",
        rendersOnProfile: true,
        status: "active"
    },
    {
        id: "fourthwall",
        name: "Fourthwall",
        category: ["Commerce"],
        description: "Creator commerce platform",
        icon: "🏪",
        isNative: false,
        installType: "redirect",
        rendersOnProfile: true,
        status: "active"
    },
    {
        id: "kajabi",
        name: "Kajabi",
        category: ["Commerce", "Marketing"],
        description: "Online courses and coaching",
        icon: "🎓",
        isNative: false,
        installType: "redirect",
        rendersOnProfile: true,
        status: "active",
        isPremium: true
    },
    {
        id: "teachable",
        name: "Teachable",
        category: ["Commerce"],
        description: "Sell online courses",
        icon: "📚",
        isNative: false,
        installType: "redirect",
        rendersOnProfile: true,
        status: "active"
    },
    {
        id: "stan-store",
        name: "Stan Store",
        category: ["Commerce"],
        description: "Creator storefront",
        icon: "🛒",
        isNative: false,
        installType: "redirect",
        rendersOnProfile: true,
        status: "active"
    },
    {
        id: "shop-native",
        name: "Product Showcase",
        category: ["Commerce"],
        description: "Native product display",
        icon: "🏬",
        isNative: true,
        installType: "instant",
        rendersOnProfile: true,
        status: "active"
    },

    // ===============================
    // DONATIONS (10 apps)
    // ===============================
    {
        id: "paypal",
        name: "PayPal",
        category: ["Donations", "Commerce"],
        description: "Accept payments via PayPal",
        icon: "💰",
        isNative: false,
        installType: "redirect",
        rendersOnProfile: true,
        status: "active"
    },
    {
        id: "buymeacoffee",
        name: "Buy Me a Coffee",
        category: ["Donations"],
        description: "Accept tips and support",
        icon: "☕",
        isNative: false,
        installType: "redirect",
        rendersOnProfile: true,
        status: "active"
    },
    {
        id: "kofi",
        name: "Ko-fi",
        category: ["Donations"],
        description: "Get support from fans",
        icon: "🧋",
        isNative: false,
        installType: "redirect",
        rendersOnProfile: true,
        status: "active"
    },
    {
        id: "patreon",
        name: "Patreon",
        category: ["Donations", "Community"],
        description: "Membership platform",
        icon: "🎨",
        isNative: false,
        installType: "redirect",
        rendersOnProfile: true,
        status: "active"
    },
    {
        id: "venmo",
        name: "Venmo",
        category: ["Donations"],
        description: "Send money easily",
        icon: "💸",
        isNative: false,
        installType: "redirect",
        rendersOnProfile: true,
        status: "active"
    },
    {
        id: "cashapp",
        name: "Cash App",
        category: ["Donations"],
        description: "Accept Cash App payments",
        icon: "💵",
        isNative: false,
        installType: "redirect",
        rendersOnProfile: true,
        status: "active"
    },
    {
        id: "stripe",
        name: "Stripe",
        category: ["Donations", "Commerce"],
        description: "Accept card payments",
        icon: "💳",
        isNative: false,
        installType: "oauth",
        rendersOnProfile: true,
        status: "active",
        isPremium: true
    },
    {
        id: "gofundme",
        name: "GoFundMe",
        category: ["Donations"],
        description: "Crowdfunding campaigns",
        icon: "❤️",
        isNative: false,
        installType: "redirect",
        rendersOnProfile: true,
        status: "active"
    },
    {
        id: "givebutter",
        name: "Givebutter",
        category: ["Donations"],
        description: "Fundraising made easy",
        icon: "🧈",
        isNative: false,
        installType: "redirect",
        rendersOnProfile: true,
        status: "active"
    },
    {
        id: "tip-jar",
        name: "Tip Jar",
        category: ["Donations"],
        description: "Native tip collection",
        icon: "🫙",
        isNative: true,
        installType: "instant",
        rendersOnProfile: true,
        status: "active"
    },

    // ===============================
    // SCHEDULING (8 apps)
    // ===============================
    {
        id: "calendly",
        name: "Calendly",
        category: ["Scheduling"],
        description: "Book meetings easily",
        icon: "📅",
        isNative: false,
        installType: "oauth",
        rendersOnProfile: true,
        status: "active"
    },
    {
        id: "calcom",
        name: "Cal.com",
        category: ["Scheduling"],
        description: "Open-source scheduling",
        icon: "🗓️",
        isNative: false,
        installType: "oauth",
        rendersOnProfile: true,
        status: "active"
    },
    {
        id: "acuity",
        name: "Acuity Scheduling",
        category: ["Scheduling"],
        description: "Client scheduling software",
        icon: "⏰",
        isNative: false,
        installType: "oauth",
        rendersOnProfile: true,
        status: "active"
    },
    {
        id: "square-appointments",
        name: "Square Appointments",
        category: ["Scheduling"],
        description: "Booking for businesses",
        icon: "🔲",
        isNative: false,
        installType: "oauth",
        rendersOnProfile: true,
        status: "active"
    },
    {
        id: "setmore",
        name: "Setmore",
        category: ["Scheduling"],
        description: "Free appointment scheduling",
        icon: "📋",
        isNative: false,
        installType: "redirect",
        rendersOnProfile: true,
        status: "active"
    },
    {
        id: "honeybook",
        name: "HoneyBook",
        category: ["Scheduling", "Commerce"],
        description: "Client management",
        icon: "🍯",
        isNative: false,
        installType: "oauth",
        rendersOnProfile: true,
        status: "active",
        isPremium: true
    },
    {
        id: "booking-native",
        name: "Book a Call",
        category: ["Scheduling"],
        description: "Simple booking button",
        icon: "📞",
        isNative: true,
        installType: "instant",
        rendersOnProfile: true,
        status: "active"
    },
    {
        id: "availability",
        name: "Availability Status",
        category: ["Scheduling"],
        description: "Show your availability",
        icon: "🟢",
        isNative: true,
        installType: "instant",
        rendersOnProfile: true,
        status: "active"
    },

    // ===============================
    // MARKETING (8 apps)
    // ===============================
    {
        id: "mailchimp",
        name: "Mailchimp",
        category: ["Marketing"],
        description: "Email marketing signup",
        icon: "📧",
        isNative: false,
        installType: "oauth",
        rendersOnProfile: true,
        status: "active"
    },
    {
        id: "convertkit",
        name: "ConvertKit",
        category: ["Marketing"],
        description: "Creator email platform",
        icon: "📨",
        isNative: false,
        installType: "oauth",
        rendersOnProfile: true,
        status: "active"
    },
    {
        id: "substack",
        name: "Substack",
        category: ["Marketing", "Community"],
        description: "Newsletter publishing",
        icon: "📰",
        isNative: false,
        installType: "redirect",
        rendersOnProfile: true,
        status: "active"
    },
    {
        id: "beehiiv",
        name: "Beehiiv",
        category: ["Marketing"],
        description: "Newsletter platform",
        icon: "🐝",
        isNative: false,
        installType: "redirect",
        rendersOnProfile: true,
        status: "active"
    },
    {
        id: "getresponse",
        name: "GetResponse",
        category: ["Marketing"],
        description: "Email marketing suite",
        icon: "✉️",
        isNative: false,
        installType: "redirect",
        rendersOnProfile: true,
        status: "active"
    },
    {
        id: "email-capture",
        name: "Email Capture",
        category: ["Marketing"],
        description: "Native email collection",
        icon: "📬",
        isNative: true,
        installType: "instant",
        rendersOnProfile: true,
        status: "active"
    },
    {
        id: "cta-button",
        name: "CTA Button",
        category: ["Marketing"],
        description: "Call-to-action button",
        icon: "🔘",
        isNative: true,
        installType: "instant",
        rendersOnProfile: true,
        status: "active"
    },
    {
        id: "link-lock",
        name: "Link Lock",
        category: ["Marketing"],
        description: "Lock content behind email",
        icon: "🔐",
        isNative: true,
        installType: "instant",
        rendersOnProfile: true,
        status: "active",
        isPremium: true
    },

    // ===============================
    // COMMUNITY (8 apps)
    // ===============================
    {
        id: "discord",
        name: "Discord",
        category: ["Community"],
        description: "Join your Discord server",
        icon: "🎯",
        isNative: false,
        installType: "redirect",
        rendersOnProfile: true,
        status: "active"
    },
    {
        id: "telegram",
        name: "Telegram",
        category: ["Community"],
        description: "Telegram channel or group",
        icon: "📱",
        isNative: false,
        installType: "redirect",
        rendersOnProfile: true,
        status: "active"
    },
    {
        id: "slack",
        name: "Slack",
        category: ["Community"],
        description: "Join Slack workspace",
        icon: "💬",
        isNative: false,
        installType: "redirect",
        rendersOnProfile: true,
        status: "active"
    },
    {
        id: "circle",
        name: "Circle",
        category: ["Community"],
        description: "Community platform",
        icon: "⭕",
        isNative: false,
        installType: "redirect",
        rendersOnProfile: true,
        status: "active"
    },
    {
        id: "mighty-networks",
        name: "Mighty Networks",
        category: ["Community"],
        description: "Community and courses",
        icon: "🦁",
        isNative: false,
        installType: "redirect",
        rendersOnProfile: true,
        status: "active"
    },
    {
        id: "facebook-group",
        name: "Facebook Group",
        category: ["Community"],
        description: "Join your Facebook group",
        icon: "👥",
        isNative: false,
        installType: "redirect",
        rendersOnProfile: true,
        status: "active"
    },
    {
        id: "whatsapp-group",
        name: "WhatsApp Group",
        category: ["Community"],
        description: "Join WhatsApp community",
        icon: "💚",
        isNative: false,
        installType: "redirect",
        rendersOnProfile: true,
        status: "active"
    },
    {
        id: "skool",
        name: "Skool",
        category: ["Community"],
        description: "Community platform",
        icon: "🎒",
        isNative: false,
        installType: "redirect",
        rendersOnProfile: true,
        status: "active"
    },

    // ===============================
    // PODCASTS (6 apps)
    // ===============================
    {
        id: "apple-podcasts",
        name: "Apple Podcasts",
        category: ["Podcasts"],
        description: "Listen on Apple Podcasts",
        icon: "🎙️",
        isNative: false,
        installType: "redirect",
        rendersOnProfile: true,
        status: "active"
    },
    {
        id: "spotify-podcasts",
        name: "Spotify Podcasts",
        category: ["Podcasts"],
        description: "Listen on Spotify",
        icon: "🎧",
        isNative: false,
        installType: "redirect",
        rendersOnProfile: true,
        status: "active"
    },
    {
        id: "pocket-casts",
        name: "Pocket Casts",
        category: ["Podcasts"],
        description: "Podcast player",
        icon: "📻",
        isNative: false,
        installType: "redirect",
        rendersOnProfile: true,
        status: "active"
    },
    {
        id: "overcast",
        name: "Overcast",
        category: ["Podcasts"],
        description: "Podcast app for iOS",
        icon: "☁️",
        isNative: false,
        installType: "redirect",
        rendersOnProfile: true,
        status: "active"
    },
    {
        id: "anchor",
        name: "Anchor",
        category: ["Podcasts"],
        description: "Podcast creation",
        icon: "⚓",
        isNative: false,
        installType: "redirect",
        rendersOnProfile: true,
        status: "active"
    },
    {
        id: "castbox",
        name: "Castbox",
        category: ["Podcasts"],
        description: "Podcast discovery",
        icon: "📦",
        isNative: false,
        installType: "redirect",
        rendersOnProfile: true,
        status: "active"
    },

    // ===============================
    // NFT & WEB3 (5 apps)
    // ===============================
    {
        id: "opensea",
        name: "OpenSea",
        category: ["NFT & Web3"],
        description: "NFT marketplace",
        icon: "🌊",
        isNative: false,
        installType: "redirect",
        rendersOnProfile: true,
        status: "active"
    },
    {
        id: "rarible",
        name: "Rarible",
        category: ["NFT & Web3"],
        description: "Create and sell NFTs",
        icon: "🎨",
        isNative: false,
        installType: "redirect",
        rendersOnProfile: true,
        status: "active"
    },
    {
        id: "foundation",
        name: "Foundation",
        category: ["NFT & Web3"],
        description: "Creator NFT platform",
        icon: "🏛️",
        isNative: false,
        installType: "redirect",
        rendersOnProfile: true,
        status: "active"
    },
    {
        id: "zora",
        name: "Zora",
        category: ["NFT & Web3"],
        description: "NFT creation protocol",
        icon: "⚡",
        isNative: false,
        installType: "redirect",
        rendersOnProfile: true,
        status: "active"
    },
    {
        id: "wallet-connect",
        name: "Wallet Connect",
        category: ["NFT & Web3"],
        description: "Connect crypto wallet",
        icon: "🔗",
        isNative: false,
        installType: "oauth",
        rendersOnProfile: true,
        status: "coming_soon",
        isPremium: true
    },

    // ===============================
    // FORMS (5 apps)
    // ===============================
    {
        id: "typeform",
        name: "Typeform",
        category: ["Forms"],
        description: "Beautiful forms and surveys",
        icon: "📋",
        isNative: false,
        installType: "redirect",
        rendersOnProfile: true,
        status: "active"
    },
    {
        id: "google-forms",
        name: "Google Forms",
        category: ["Forms"],
        description: "Free form builder",
        icon: "📝",
        isNative: false,
        installType: "redirect",
        rendersOnProfile: true,
        status: "active"
    },
    {
        id: "jotform",
        name: "Jotform",
        category: ["Forms"],
        description: "Online form builder",
        icon: "📄",
        isNative: false,
        installType: "redirect",
        rendersOnProfile: true,
        status: "active"
    },
    {
        id: "tally",
        name: "Tally",
        category: ["Forms"],
        description: "Simple form builder",
        icon: "✅",
        isNative: false,
        installType: "redirect",
        rendersOnProfile: true,
        status: "active"
    },
    {
        id: "contact-form",
        name: "Contact Form",
        category: ["Forms"],
        description: "Native contact form",
        icon: "💌",
        isNative: true,
        installType: "instant",
        rendersOnProfile: true,
        status: "active"
    }
];

// ==================================
// HELPER FUNCTIONS
// ==================================

export const getAppsByCategory = (category: AppCategory): MarketplaceApp[] => {
    if (category === "All") {
        return appRegistry;
    }

    const categoryApps = appRegistry.filter(app =>
        app.category.includes(category)
    );

    // NEVER return empty - fallback to native + featured
    if (categoryApps.length === 0) {
        return appRegistry.filter(app => app.isNative || app.category.includes("Featured"));
    }

    return categoryApps;
};

export const getRecommendedApps = (): MarketplaceApp[] => {
    return appRegistry.filter(app =>
        ["spotify", "instagram", "youtube", "calendly", "buymeacoffee", "tiktok", "shopify"].includes(app.id)
    );
};

export const getFeaturedApps = (): MarketplaceApp[] => {
    return appRegistry.filter(app => app.category.includes("Featured"));
};

export const getNativeApps = (): MarketplaceApp[] => {
    return appRegistry.filter(app => app.isNative);
};

export const getPremiumApps = (): MarketplaceApp[] => {
    return appRegistry.filter(app => app.isPremium);
};

export const getComingSoonApps = (): MarketplaceApp[] => {
    return appRegistry.filter(app => app.status === "coming_soon");
};

export const getAppById = (id: string): MarketplaceApp | undefined => {
    return appRegistry.find(app => app.id === id);
};

export const getCategoryCount = (category: AppCategory): number => {
    return getAppsByCategory(category).length;
};

export const searchApps = (query: string): MarketplaceApp[] => {
    const lowerQuery = query.toLowerCase();
    return appRegistry.filter(app =>
        app.name.toLowerCase().includes(lowerQuery) ||
        app.description.toLowerCase().includes(lowerQuery) ||
        app.category.some(cat => cat.toLowerCase().includes(lowerQuery))
    );
};
