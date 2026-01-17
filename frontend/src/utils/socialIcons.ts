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
    Calendar
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
    mail: Mail,
    phone: Phone,
    music: Music,
    video: Video,
    store: ShoppingBag,
    location: MapPin,
    calendar: Calendar
};

export const getIconForThumbnail = (thumbnail: string) => {
    if (!thumbnail) return null;
    return iconMap[thumbnail.toLowerCase()] || null;
};
