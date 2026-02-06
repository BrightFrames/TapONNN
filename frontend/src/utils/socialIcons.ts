import {
    InstagramIcon,
    FacebookIcon,
    TwitterIcon,
    LinkedInIcon,
    YouTubeIcon,
    GitHubIcon,
    WhatsAppIcon,
    TelegramIcon
} from "@/components/BrandIcons";

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
    instagram: InstagramIcon || Instagram,
    facebook: FacebookIcon || Facebook,
    twitter: TwitterIcon || Twitter,
    linkedin: LinkedInIcon || Linkedin,
    youtube: YouTubeIcon || Youtube,
    github: GitHubIcon || Github,
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
    whatsapp: WhatsAppIcon || MessageCircle,
    telegram: TelegramIcon || Send
};

export const getIconForThumbnail = (thumbnail: string) => {
    if (!thumbnail) return null;
    return iconMap[thumbnail.toLowerCase()] || null;
};
