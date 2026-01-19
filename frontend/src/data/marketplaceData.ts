// Marketplace Data Model
export interface MarketplaceItem {
    id: string;
    title: string;
    category: string;
    description: string;
    thumbnail: string;
    price?: number;
    tags?: string[];
}

export const MARKETPLACE_CATEGORIES = [
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
] as const;

export type MarketplaceCategory = typeof MARKETPLACE_CATEGORIES[number];

// Sample marketplace items
export const marketplaceItems: MarketplaceItem[] = [
    // Fashion
    { id: "f1", title: "Weekly Outfit Planner", category: "Fashion", description: "Plan your entire week's outfits in 10 minutes", thumbnail: "👗" },
    { id: "f2", title: "Capsule Wardrobe Builder", category: "Fashion", description: "Build a versatile 30-piece wardrobe", thumbnail: "👔" },
    { id: "f3", title: "Buy vs Own Checker", category: "Fashion", description: "Check if you really need that purchase", thumbnail: "🛍️" },
    { id: "f4", title: "Occasion Outfit Matcher", category: "Fashion", description: "Quick reference for any event", thumbnail: "👠" },
    { id: "f5", title: "Closet Gap Identifier", category: "Fashion", description: "Monthly closet audit template", thumbnail: "🧥" },

    // Health and Fitness
    { id: "h1", title: "15-Minute Workout Selector", category: "Health and Fitness", description: "Zero decision fatigue workouts", thumbnail: "💪" },
    { id: "h2", title: "Habit Streak Tracker", category: "Health and Fitness", description: "Daily check-in, 30-second log", thumbnail: "✅" },
    { id: "h3", title: "Protein & Water Log", category: "Health and Fitness", description: "Track the 2 things that matter", thumbnail: "💧" },
    { id: "h4", title: "Injury-Safe Planner", category: "Health and Fitness", description: "Train around pain safely", thumbnail: "🏥" },
    { id: "h5", title: "Diet Reality Check", category: "Health and Fitness", description: "Weekly honest assessment", thumbnail: "🥗" },

    // Influencer and Creator
    { id: "i1", title: "Content Idea Recycler", category: "Influencer and Creator", description: "Turn 1 idea into 5 pieces", thumbnail: "♻️" },
    { id: "i2", title: "Hook-Body-CTA Builder", category: "Influencer and Creator", description: "Structure any post in 2 mins", thumbnail: "📝" },
    { id: "i3", title: "Brand Pitch Generator", category: "Influencer and Creator", description: "Professional brand outreach", thumbnail: "🤝" },
    { id: "i4", title: "Weekly Posting System", category: "Influencer and Creator", description: "Never miss a post", thumbnail: "📅" },
    { id: "i5", title: "Burnout-Proof Planner", category: "Influencer and Creator", description: "Sustainable content creation", thumbnail: "🧘" },

    // Marketing
    { id: "m1", title: "Campaign Canvas", category: "Marketing", description: "Plan any campaign in one view", thumbnail: "🎯" },
    { id: "m2", title: "ICP Clarity Sheet", category: "Marketing", description: "Define ideal customer profile", thumbnail: "👤" },
    { id: "m3", title: "Offer Clarity Template", category: "Marketing", description: "Crystallize your value prop", thumbnail: "💡" },
    { id: "m4", title: "Content-Conversion Map", category: "Marketing", description: "Connect content to revenue", thumbnail: "📊" },
    { id: "m5", title: "Post-Mortem Template", category: "Marketing", description: "Learn from every campaign", thumbnail: "📋" },

    // Music
    { id: "mu1", title: "Song Idea Capture", category: "Music", description: "Never lose an idea", thumbnail: "🎵" },
    { id: "mu2", title: "Daily Practice System", category: "Music", description: "Structured 30-min sessions", thumbnail: "🎸" },
    { id: "mu3", title: "Release Checklist", category: "Music", description: "Don't miss any launch step", thumbnail: "🚀" },
    { id: "mu4", title: "Lyrics Refinement", category: "Music", description: "Polish any verse", thumbnail: "✍️" },
    { id: "mu5", title: "Creative Block Reset", category: "Music", description: "Unblock in 10 minutes", thumbnail: "🔓" },

    // Small Business
    { id: "sb1", title: "Daily Ops Checklist", category: "Small Business", description: "Start every day organized", thumbnail: "📋" },
    { id: "sb2", title: "Cash-Flow Snapshot", category: "Small Business", description: "Weekly 5-min financial check", thumbnail: "💰" },
    { id: "sb3", title: "Customer Follow-Up", category: "Small Business", description: "Never lose a lead", thumbnail: "📞" },
    { id: "sb4", title: "Weekly Priorities", category: "Small Business", description: "Focus on what matters", thumbnail: "🎯" },
    { id: "sb5", title: "Decision Log", category: "Small Business", description: "Document business decisions", thumbnail: "📓" },

    // Social Media
    { id: "sm1", title: "Daily Post Generator", category: "Social Media", description: "Create content in 5 mins", thumbnail: "📱" },
    { id: "sm2", title: "Analytics Translator", category: "Social Media", description: "Turn data into decisions", thumbnail: "📈" },
    { id: "sm3", title: "Engagement Routine", category: "Social Media", description: "Daily 15-min checklist", thumbnail: "💬" },
    { id: "sm4", title: "Trend Adapter", category: "Social Media", description: "Jump on trends fast", thumbnail: "🔥" },
    { id: "sm5", title: "Caption Builder", category: "Social Media", description: "Write captions that convert", thumbnail: "✏️" },

    // Sports
    { id: "sp1", title: "Training Planner", category: "Sports", description: "Structure every workout", thumbnail: "🏋️" },
    { id: "sp2", title: "Match Prep Checklist", category: "Sports", description: "Pre-game ritual", thumbnail: "⚽" },
    { id: "sp3", title: "Recovery Tracker", category: "Sports", description: "Optimize rest days", thumbnail: "🛌" },
    { id: "sp4", title: "Weakness Identifier", category: "Sports", description: "Honest self-assessment", thumbnail: "🎯" },
    { id: "sp5", title: "Progress Log", category: "Sports", description: "Track improvement over time", thumbnail: "📊" },

    // Telegram
    { id: "tg1", title: "Content Calendar", category: "Telegram", description: "Plan channel posts", thumbnail: "📅" },
    { id: "tg2", title: "Message Formatter", category: "Telegram", description: "Consistent, readable posts", thumbnail: "📝" },
    { id: "tg3", title: "Engagement Triggers", category: "Telegram", description: "Boost interaction ideas", thumbnail: "🎮" },
    { id: "tg4", title: "Monetization Planner", category: "Telegram", description: "Revenue from channel", thumbnail: "💵" },
    { id: "tg5", title: "Channel Audit", category: "Telegram", description: "Monthly health check", thumbnail: "✅" },

    // Whatsapp
    { id: "wa1", title: "Broadcast Planner", category: "Whatsapp", description: "Send effective broadcasts", thumbnail: "📢" },
    { id: "wa2", title: "Follow-Up Scripts", category: "Whatsapp", description: "Ready-to-send messages", thumbnail: "💬" },
    { id: "wa3", title: "Sales Conversation", category: "Whatsapp", description: "Guide any sales chat", thumbnail: "🤝" },
    { id: "wa4", title: "Support Responses", category: "Whatsapp", description: "Quick replies system", thumbnail: "🛠️" },
    { id: "wa5", title: "Group Moderation", category: "Whatsapp", description: "Keep groups healthy", thumbnail: "👥" },
];
