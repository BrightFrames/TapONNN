import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogContentBottomSheet, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Link,
    Type,
    Heading,
    Image,
    Video,
    Minus,
    ShoppingBag,
    Briefcase,
    DollarSign,
    Heart,
    User,
    FileText,
    Calendar,
    MessageCircle,
    Share2,
    Instagram,
    Music,
    Youtube,
    Square,
    Clock,
    MapPin,
    File,
    Search,
    Loader2,
    Bell
} from 'lucide-react';

interface BlockType {
    type: string;
    name: string;
    description: string;
    icon: string;
    cta_default: string;
}

interface BlockLibrary {
    content: BlockType[];
    commerce: BlockType[];
    contact: BlockType[];
    social: BlockType[];
    utility: BlockType[];
}

interface BlockTypeSelectorProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (blockType: BlockType) => void;
}

const iconMap: Record<string, any> = {
    'link': Link,
    'type': Type,
    'heading': Heading,
    'image': Image,
    'video': Video,
    'minus': Minus,
    'shopping-bag': ShoppingBag,
    'briefcase': Briefcase,
    'dollar-sign': DollarSign,
    'heart': Heart,
    'user': User,
    'file-text': FileText,
    'calendar': Calendar,
    'message-circle': MessageCircle,
    'share-2': Share2,
    'instagram': Instagram,
    'music': Music,
    'youtube': Youtube,
    'square': Square,
    'clock': Clock,
    'map-pin': MapPin,
    'file': File,
    'bell': Bell
};

const BlockTypeSelector = ({ open, onOpenChange, onSelect }: BlockTypeSelectorProps) => {
    const [library, setLibrary] = useState<BlockLibrary | null>(null);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

    useEffect(() => {
        if (open && !library) {
            fetchLibrary();
        }
    }, [open]);

    const fetchLibrary = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/blocks/library`);
            if (response.ok) {
                const data = await response.json();
                setLibrary(data);
            }
        } catch (err) {
            console.error('Error fetching block library:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (block: BlockType) => {
        onSelect(block);
        onOpenChange(false);
    };

    const filterBlocks = (blocks: BlockType[]) => {
        if (!search) return blocks;
        const searchLower = search.toLowerCase();
        return blocks.filter(b =>
            b.name.toLowerCase().includes(searchLower) ||
            b.description.toLowerCase().includes(searchLower)
        );
    };

    const renderBlockGrid = (blocks: BlockType[]) => {
        const filtered = filterBlocks(blocks);
        if (filtered.length === 0) {
            return <p className="text-sm text-muted-foreground text-center py-4">No blocks found</p>;
        }
        return (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {filtered.map((block) => {
                    const Icon = iconMap[block.icon] || Square;
                    return (
                        <Button
                            key={block.type}
                            variant="outline"
                            onClick={() => handleSelect(block)}
                            className="flex flex-col items-center gap-2 p-4 h-auto rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-all text-center group"
                        >
                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                <Icon className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                            </div>
                            <div className="w-full">
                                <p className="font-medium text-sm">{block.name}</p>
                                <p className="text-xs text-muted-foreground line-clamp-1 whitespace-normal">{block.description}</p>
                            </div>
                        </Button>
                    );
                })}
            </div>
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContentBottomSheet className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
                <DialogHeader className="px-1 pt-6 sm:pt-0">
                    <DialogTitle>Add Block</DialogTitle>
                    <DialogDescription>Choose a block type to add to your profile</DialogDescription>
                </DialogHeader>

                <div className="relative mb-4 px-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search blocks..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                ) : library ? (
                    <Tabs defaultValue="content" className="w-full flex-1 flex flex-col">
                        <TabsList className="grid w-full grid-cols-5 mb-4 shrink-0">
                            <TabsTrigger value="content" className="text-[10px] sm:text-xs">Content</TabsTrigger>
                            <TabsTrigger value="commerce" className="text-[10px] sm:text-xs">Store</TabsTrigger>
                            <TabsTrigger value="contact" className="text-[10px] sm:text-xs">Contact</TabsTrigger>
                            <TabsTrigger value="social" className="text-[10px] sm:text-xs">Social</TabsTrigger>
                            <TabsTrigger value="utility" className="text-[10px] sm:text-xs">Utility</TabsTrigger>
                        </TabsList>

                        <ScrollArea className="flex-1 pr-4">
                            <TabsContent value="content" className="mt-0">
                                {renderBlockGrid(library.content)}
                            </TabsContent>
                            <TabsContent value="commerce" className="mt-0">
                                {renderBlockGrid(library.commerce)}
                            </TabsContent>
                            <TabsContent value="contact" className="mt-0">
                                {renderBlockGrid(library.contact)}
                            </TabsContent>
                            <TabsContent value="social" className="mt-0">
                                {renderBlockGrid(library.social)}
                            </TabsContent>
                            <TabsContent value="utility" className="mt-0">
                                {renderBlockGrid(library.utility)}
                            </TabsContent>
                        </ScrollArea>
                    </Tabs>
                ) : (
                    <p className="text-center text-muted-foreground py-8">Failed to load block library</p>
                )}
                <div className="h-6 shrink-0" />
            </DialogContentBottomSheet>
        </Dialog>
    );
};

export default BlockTypeSelector;
