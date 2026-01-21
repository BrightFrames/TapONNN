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

    // Default Link/Content Block - Redesigned as Premium Card
    return (
        <a
            onClick={(e) => {
                e.preventDefault();
                onInteract(block);
            }}
            className="block group w-full"
        >
            <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-card border border-border">
                <CardContent className="p-4 flex items-center justify-between gap-4">
                    {block.thumbnail ? (
                        <div className="w-12 h-12 rounded-md bg-muted overflow-hidden shrink-0">
                            <img src={block.thumbnail} alt="" className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            <Icon className="w-5 h-5" />
                        </div>
                    )}

                    <div className="flex-1 min-w-0 text-left">
                        <h3 className="font-semibold text-foreground truncate text-sm sm:text-base">{block.title}</h3>
                        {block.content.description && (
                            <p className="text-xs text-muted-foreground truncate">{block.content.description}</p>
                        )}
                    </div>

                    <div className="opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                </CardContent>
            </Card>
        </a>
    );
};

export default PublicBlockCard;
