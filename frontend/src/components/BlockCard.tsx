import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    GripVertical,
    MoreVertical,
    Edit2,
    Trash2,
    Eye,
    EyeOff,
    Link,
    ShoppingBag,
    MessageCircle,
    ExternalLink,
    MousePointerClick,
    Users
} from 'lucide-react';

interface Block {
    _id: string;
    block_type: string;
    title: string;
    content: any;
    cta_type: string;
    cta_label: string;
    is_active: boolean;
    analytics: {
        views: number;
        clicks: number;
        enquiries: number;
    };
}

interface BlockCardProps {
    block: Block;
    onEdit: (block: Block) => void;
    onDelete: (blockId: string) => void;
    onToggleActive: (blockId: string, isActive: boolean) => void;
    dragHandleProps?: any;
}

const blockTypeIcons: Record<string, any> = {
    'link': Link,
    'product': ShoppingBag,
    'service': ShoppingBag,
    'contact_card': Users,
    'form': MessageCircle,
    'whatsapp': MessageCircle
};

const ctaLabels: Record<string, string> = {
    'none': '',
    'visit': 'Visit',
    'buy_now': 'Buy Now',
    'enquire': 'Enquire',
    'contact': 'Contact',
    'download': 'Download',
    'book': 'Book',
    'donate': 'Donate',
    'custom': 'Custom'
};

const BlockCard = ({ block, onEdit, onDelete, onToggleActive, dragHandleProps }: BlockCardProps) => {
    const Icon = blockTypeIcons[block.block_type] || Link;
    const ctaLabel = block.cta_label || ctaLabels[block.cta_type] || '';

    return (
        <Card className={`transition-all ${!block.is_active ? 'opacity-60' : ''}`}>
            <CardContent className="p-4">
                <div className="flex items-center gap-3">
                    {/* Drag Handle */}
                    <div {...dragHandleProps} className="cursor-grab active:cursor-grabbing p-1 -ml-1 text-muted-foreground hover:text-foreground">
                        <GripVertical className="w-4 h-4" />
                    </div>

                    {/* Block Icon */}
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-primary" />
                    </div>

                    {/* Block Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h4 className="font-medium text-sm truncate">{block.title}</h4>
                            <Badge variant="secondary" className="text-[10px] shrink-0">
                                {block.block_type}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            {block.content?.url && (
                                <span className="truncate max-w-[150px]">{block.content.url}</span>
                            )}
                            {ctaLabel && (
                                <Badge variant="outline" className="text-[10px]">
                                    {ctaLabel}
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Analytics */}
                    <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1" title="Views">
                            <Eye className="w-3 h-3" />
                            <span>{block.analytics?.views || 0}</span>
                        </div>
                        <div className="flex items-center gap-1" title="Clicks">
                            <MousePointerClick className="w-3 h-3" />
                            <span>{block.analytics?.clicks || 0}</span>
                        </div>
                        <div className="flex items-center gap-1" title="Enquiries">
                            <MessageCircle className="w-3 h-3" />
                            <span>{block.analytics?.enquiries || 0}</span>
                        </div>
                    </div>

                    {/* Active Toggle */}
                    <Switch
                        checked={block.is_active}
                        onCheckedChange={(checked) => onToggleActive(block._id, checked)}
                        className="data-[state=checked]:bg-green-500"
                    />

                    {/* Actions Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEdit(block)}>
                                <Edit2 className="w-4 h-4 mr-2" />
                                Edit
                            </DropdownMenuItem>
                            {block.content?.url && (
                                <DropdownMenuItem onClick={() => window.open(block.content.url, '_blank')}>
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    Open Link
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                                onClick={() => onDelete(block._id)}
                                className="text-red-600 focus:text-red-600"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardContent>
        </Card>
    );
};

export default BlockCard;
