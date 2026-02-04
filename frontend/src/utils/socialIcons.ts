import {
    Instagram,
    Facebook,
    Twitter,
    Linkedin,
    Youtube,
    Github,
    Globe,
    Mail,
    Phone,
    Music,
    Video,
    ShoppingBag,
    MapPin,
    Calendar,
    MessageCircle,
    Send
} from "lucide-react";

export const iconMap: any = {
    instagram: Instagram,
    facebook: Facebook,
    twitter: Twitter,
    linkedin: Linkedin,
    youtube: Youtube,
    github: Github,
    tiktok: Music,
    globe: Globe,
    website: Globe,
    mail: Mail,
    phone: Phone,
    music: Music,
    video: Video,
    store: ShoppingBag,
    location: MapPin,
    calendar: Calendar,
    whatsapp: MessageCircle,
    telegram: Send
};

export const getIconForThumbnail = (thumbnail: string) => {
    if (!thumbnail) return null;
    return iconMap[thumbnail.toLowerCase()] || null;
};
