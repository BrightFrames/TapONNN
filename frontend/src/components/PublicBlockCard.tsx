import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Link, ShoppingBag, Briefcase, Zap, Heart, MessageCircle,
    Calendar, MapPin, Share2, Instagram, Youtube, Music,
    Download, ExternalLink, ArrowRight
} from 'lucide-react';

interface Block {
    _id: string;
    block_type: string;
    title: string;
    content: any;
    cta_type: string;
    cta_label: string;
    thumbnail?: string;
    styles?: any;
}

interface PublicBlockCardProps {
    block: Block;
    onInteract: (block: Block) => void;
    template: any;
}

const iconMap: Record<string, any> = {
    'link': Link,
    'product': ShoppingBag,
    'service': Briefcase,
    'pricing': Zap,
    'donation': Heart,
    'contact_card': MessageCircle,
    'booking': Calendar,
    'map': MapPin,
    'social_icons': Share2,
    'instagram': Instagram,
    'youtube': Youtube,
    'music': Music,
    'pdf': Download
};

const PublicBlockCard = ({ block, onInteract, template }: PublicBlockCardProps) => {
    const Icon = iconMap[block.block_type] || Link;

    // Different rendering based on block type
    if (block.block_type === 'product' || block.block_type === 'service') {
        return (
            <Card
                className={`w-full overflow-hidden hover:shadow-md transition-all cursor-pointer bg-white/80 backdrop-blur-sm border-0`}
                onClick={() => onInteract(block)}
            >
                <div className="flex">
                    {block.content.image_url && (
                        <div className="w-24 h-24 sm:w-32 bg-gray-100 shrink-0">
                            <img
                                src={block.content.image_url}
                                alt={block.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}
                    <CardContent className="flex-1 p-4 flex flex-col justify-center min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{block.title}</h3>
                        {block.content.description && (
                            <p className="text-sm text-gray-500 line-clamp-2 mt-1">{block.content.description}</p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                            {block.content.price && (
                                <span className="font-bold text-primary">₹{block.content.price}</span>
                            )}
                            <Button size="sm" className="h-7 text-xs rounded-full gap-1 ml-auto">
                                {block.cta_label || (block.cta_type === 'buy_now' ? 'Buy Now' : 'Enquire')}
                                <ArrowRight className="w-3 h-3" />
                            </Button>
                        </div>
                    </CardContent>
                </div>
            </Card>
        );
    }

    // Default Link/Content Block
    return (
        <a
            onClick={(e) => {
                e.preventDefault();
                onInteract(block);
            }}
            className={`w-full block text-center px-6 py-4 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${template.buttonStyle} flex items-center justify-between group`}
        >
            <div className="w-5" /> {/* Spacer for centering */}
            <span className="font-medium truncate px-2">{block.title}</span>
            <Icon className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" />
        </a>
    );
};

export default PublicBlockCard;
