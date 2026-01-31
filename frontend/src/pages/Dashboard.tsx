import { useState, useEffect } from "react";
import { toast } from "sonner";
import LinktreeLayout from "@/layouts/LinktreeLayout";
import SortableLinkCard from "@/components/SortableLinkCard";
import BlockEditorModal from "@/components/BlockEditorModal"; // Import BlockEditor
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { templates } from "@/data/templates";
import { useTranslation } from "react-i18next";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
    Plus,
    Sparkles,
    Copy,
    ExternalLink,
    Link2,
    Smartphone,
    Instagram,
    Globe,
    Trash2,
    Search,
    Heart,
    X,
    Share,
    MessageCircle
} from "lucide-react";

import { getIconForThumbnail } from "@/utils/socialIcons";
import { SocialLinksDialog } from "@/components/SocialLinksDialog";

interface Link {
    id: string;
    title: string;
    url: string;
    isActive: boolean;
    clicks?: number;
    position?: number;
    thumbnail?: string;
    isFeatured?: boolean;
    isPriority?: boolean;
    isArchived?: boolean;
    scheduledStart?: string;
    scheduledEnd?: string;
}

interface Product {
    _id: string;
    title: string;
    description?: string;
    price: number;
    image_url?: string;
    file_url?: string;
    type: 'digital_product' | 'physical_product' | 'physical_service' | 'digital_service';
    product_type?: 'digital_product' | 'physical_product' | 'physical_service' | 'digital_service';
    is_active: boolean;
}

const Dashboard = () => {
    const { t } = useTranslation();
    const { user, blocks, addBlock, updateBlock, deleteBlock, reorderBlocks, selectedTheme, updateProfile } = useAuth(); // Use blocks instead of links
    // Removed local links state to rely on context or separate local state if needed (using context for now)
    const [isAddingBlock, setIsAddingBlock] = useState(false);
    const [editingBlock, setEditingBlock] = useState<any>(null); // For editing
    const [socialPreview, setSocialPreview] = useState<Record<string, string> | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [previewTab, setPreviewTab] = useState<'links' | 'shop'>('links');
    const [searchQuery, setSearchQuery] = useState("");

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

    // Sensors for drag and drop
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // 8px movement before drag starts
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Sync with AuthContext
    // Sync with AuthContext - Blocks are managed there
    // No need for local links useEffect syncing if we use blocks directly from context, 
    // but dnd-kit might want a local state for smooth dragging.
    // Let's create a local state for blocks to handle drag smoothly
    const [localBlocks, setLocalBlocks] = useState(blocks);

    useEffect(() => {
        setLocalBlocks(blocks);
    }, [blocks]);

    useEffect(() => {
        const fetchProducts = async () => {
            const token = localStorage.getItem('auth_token');
            if (!token) return;
            try {
                const res = await fetch(`${API_URL}/products`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setProducts(data);
                }
            } catch (error) {
                console.error("Failed to fetch products", error);
            }
        };
        fetchProducts();
    }, []);

    const userName = user?.name || "Creator";
    const username = user?.username || "user";
    const userInitial = userName[0]?.toUpperCase() || "U";

    // Get current template based on theme
    const currentTemplate = templates.find(t => t.id === selectedTheme) || templates[0];

    // Background style
    const bgStyle = currentTemplate.bgImage
        ? { backgroundImage: `url(${currentTemplate.bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
        : {};

    const handleSaveBlock = async (blockData: any) => {
        if (blockData._id) {
            await updateBlock(blockData._id, blockData);
        } else {
            await addBlock(blockData);
        }
        setIsAddingBlock(false);
        setEditingBlock(null);
    };

    const handleDeleteBlock = async (id: string) => {
        if (!confirm(t('common.delete') + "?")) return;
        await deleteBlock(id);
    };

    // Adapt Update for SortableLinkCard
    const handleUpdateBlockField = (id: string, field: string, value: any) => {
        // Map legacy fields if necessary
        const fieldMap: Record<string, string> = {
            'isActive': 'is_active',
            'isFeatured': 'is_featured'
        };

        const backendField = fieldMap[field] || field;
        updateBlock(id, { [backendField]: value });
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setLocalBlocks((items) => {
                const oldIndex = items.findIndex((item) => item._id === active.id);
                const newIndex = items.findIndex((item) => item._id === over.id);
                const newItems = arrayMove(items, oldIndex, newIndex);

                // Trigger context update
                reorderBlocks(newItems);

                return newItems;
            });
        }
    };

    const copyProfileLink = () => {
        const profilePath = user?.active_profile_mode === 'store' ? `/s/${username}` : `/${username}`;
        const url = `${window.location.origin}${profilePath}`;
        navigator.clipboard.writeText(url);
        toast.success(t('common.copied') || "Profile link copied to clipboard!");
    };

    const saveSocialLinks = async (updatedLinks: Record<string, string>) => {
        try {
            // Use updateProfile from AuthContext to get optimistic updates
            await updateProfile({ social_links: updatedLinks });

            // Access token check is handled inside updateProfile now (or we assume logged in)
            // If we needed to check token specifically before call, useAuth usually handles that.

            // Reset preview mode - the optimistic update ensures icons stay visible
            setSocialPreview(null);
        } catch (err) {
            console.error("Error saving socials:", err);
            // toast handled in updateProfile
        }
    };

    const handleClearAll = async () => {
        if (!confirm(t('common.confirm') + "?")) return;
        for (const block of blocks) {
            await deleteBlock(block._id);
        }
    };

    return (
        <LinktreeLayout>
            <div className="flex h-full">
                {/* Main Editor */}
                <div className="flex-1 py-8 px-6 md:px-10">
                    <div className="max-w-2xl mx-auto">



                        {/* Header */}
                        <div className="flex flex-col gap-4 mb-6">
                            {/* Title Row */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                <div>
                                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{t('dashboard.title')}</h1>
                                    <p className="text-gray-500 text-xs sm:text-sm mt-1 hidden sm:block">{t('dashboard.subtitle')}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="hidden sm:flex items-center gap-3">


                                    </div>

                                    {/* Profile Link - Mobile responsive */}
                                    <div className="relative group w-full sm:w-auto">
                                        <div
                                            onClick={() => window.open(user?.active_profile_mode === 'store' ? `/s/${username}` : `/${username}`, '_blank')}
                                            className="bg-gray-100 hover:bg-gray-200 transition-colors rounded-full px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-600 pr-10 border border-gray-200 cursor-pointer truncate"
                                        >
                                            tap2.me/{user?.active_profile_mode === 'store' ? `s/${username}` : username}
                                        </div>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 sm:h-7 sm:w-7 rounded-full hover:bg-gray-300"
                                            onClick={copyProfileLink}
                                        >
                                            <Copy className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons Row - Scrollable on mobile */}

                        </div>

                        {/* Add Link Button, Socials & Clear All */}
                        <div className="flex gap-2 sm:gap-4 mb-6 sm:mb-8">
                            <Button
                                onClick={() => setIsAddingBlock(true)}
                                className="w-3/4 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl sm:rounded-2xl h-11 sm:h-14 text-sm sm:text-base font-semibold shadow-lg shadow-zinc-200/50 transition-all hover:scale-[1.01] active:scale-[0.99] gap-1.5 sm:gap-2"
                            >
                                <Plus className="w-4 h-4 sm:w-5 sm:h-5" /> {t('dashboard.addContent')}
                            </Button>
                            <SocialLinksDialog
                                initialLinks={user?.social_links || {}}
                                onSave={saveSocialLinks}
                                onLinksChange={setSocialPreview}
                                onOpenChange={(isOpen) => !isOpen && setSocialPreview(null)}
                            >
                                <Button
                                    variant="outline"
                                    className="h-11 sm:h-14 px-3 sm:px-6 rounded-xl sm:rounded-2xl border-zinc-200 text-zinc-700 hover:bg-zinc-50 font-medium gap-1.5 sm:gap-2"
                                >
                                    <Instagram className="w-4 h-4 sm:w-5 sm:h-5" />
                                    <span className="hidden sm:inline">{t('dashboard.socials')}</span>
                                </Button>
                            </SocialLinksDialog>
                            <Button
                                onClick={handleClearAll}
                                variant="outline"
                                className="h-11 sm:h-14 px-3 sm:px-6 rounded-xl sm:rounded-2xl border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 font-medium"
                            >
                                <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span className="hidden sm:inline ml-2">{t('dashboard.clearAll')}</span>
                            </Button>
                        </div>

                        {/* Links List with Drag and Drop */}
                        <div className="space-y-3 sm:space-y-4 pb-6">
                            {(localBlocks || []).length === 0 && (
                                <div className="text-center py-10 sm:py-16 bg-gradient-to-br from-gray-50 to-white rounded-xl sm:rounded-2xl border-2 border-dashed border-gray-200 px-4">
                                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-zinc-100 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                                        <Link2 className="w-6 h-6 sm:w-8 sm:h-8 text-zinc-600" />
                                    </div>
                                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">{t('dashboard.noLinks')}</h3>
                                    <p className="text-gray-500 text-xs sm:text-sm mb-4 sm:mb-6">{t('dashboard.noLinksDesc')}</p>
                                    <Button onClick={() => setIsAddingBlock(true)} variant="outline" className="rounded-full gap-2 text-sm">
                                        <Plus className="w-4 h-4" /> {t('dashboard.addFirstBlock')}
                                    </Button>
                                </div>
                            )}

                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={localBlocks.map(b => b._id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    {localBlocks.map(block => (
                                        <SortableLinkCard
                                            key={block._id}
                                            // Adapter to make Block look like Link for the component
                                            link={{
                                                id: block._id,
                                                title: block.title,
                                                url: block.content.url || block.content.price || '', // Fallback
                                                isActive: block.is_active,
                                                clicks: 0, // TODO: Add tracking
                                                thumbnail: block.thumbnail,
                                                isFeatured: (block as any).is_featured || false,
                                                // Add missing properties that SortableLinkCard expects
                                            }}
                                            onUpdate={handleUpdateBlockField}
                                            onDelete={handleDeleteBlock}
                                            // Pass real block for editing if we enhance component
                                            onEdit={() => setEditingBlock(block)}
                                        />
                                    ))}
                                </SortableContext>
                            </DndContext>
                        </div>

                        {/* Archived Links Section */}
                        {/* Archived/Inactive blocks would go here */}
                    </div>
                </div>

                {/* Phone Preview - Right Side */}
                <div className="w-[400px] border-l border-gray-100 hidden xl:flex items-center justify-center bg-gradient-to-b from-gray-50 to-white sticky top-0 h-full">
                    <div className="py-8 px-8 flex flex-col items-center">
                        {/* Phone Frame */}
                        <div className="w-[300px] h-[620px] bg-black rounded-[3rem] border-8 border-gray-900 shadow-2xl overflow-hidden relative">
                            {/* Notch */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-b-2xl z-20" />

                            {/* Status Bar */}
                            <div className="h-8 w-full bg-black flex items-center justify-between px-8 text-[10px] text-white font-medium pt-1 z-30 relative">
                                <span>9:41</span>
                                <div className="flex gap-1.5 items-center">
                                    <div className="flex gap-0.5">
                                        <div className="w-1 h-1 bg-white rounded-full" />
                                        <div className="w-1 h-1 bg-white rounded-full" />
                                        <div className="w-1 h-1.5 bg-white rounded-full" />
                                        <div className="w-1 h-2 bg-white rounded-full" />
                                    </div>
                                    <span className="text-[8px]">5G</span>
                                    <div className="w-5 h-2.5 border border-white rounded-sm relative">
                                        <div className="absolute inset-0.5 right-1 bg-white rounded-[1px]" />
                                        <div className="absolute -right-0.5 top-1/2 -translate-y-1/2 w-0.5 h-1 bg-white rounded-r" />
                                    </div>
                                </div>
                            </div>

                            {/* Screen Content - Dynamic Style Applied Here */}
                            <div
                                className={`h-full w-full overflow-y-auto p-6 pb-20 ${currentTemplate.bgClass || 'bg-gray-100'} ${currentTemplate.textColor}`}
                                style={bgStyle}
                            >
                                {/* Overlay for readibility overlay if needed */}
                                {currentTemplate.bgImage && <div className="absolute inset-0 bg-black/20 pointer-events-none" />}

                                {/* Share Button */}
                                <div className="absolute top-12 right-6 w-8 h-8 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center z-10">
                                    <ExternalLink className={`w-4 h-4 ${currentTemplate.textColor ? 'opacity-80' : 'text-gray-700'}`} />
                                </div>

                                <div className="flex flex-col items-center mt-8 space-y-3 relative z-10">
                                    <Avatar className="w-24 h-24 border-4 border-white/20 shadow-xl">
                                        <AvatarImage src={user?.avatar} />
                                        <AvatarFallback className="bg-gray-400 text-white text-3xl font-bold">
                                            {userInitial}
                                        </AvatarFallback>
                                    </Avatar>
                                    <h2 className="text-xl font-bold tracking-tight">@{username}</h2>
                                    <div className="flex gap-3 flex-wrap justify-center px-4">
                                        {(socialPreview || user?.social_links ? Object.entries(socialPreview || user?.social_links || {}) : [])?.map(([platform, url]) => {
                                            // Show icon if URL is defined (even if empty string)
                                            if (url === null || url === undefined) return null;

                                            const Icon = getIconForThumbnail(platform);
                                            return Icon ? (
                                                <a
                                                    key={platform}
                                                    href={url && (url.startsWith('http') ? url : `https://${url}`) || '#'}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer backdrop-blur-sm"
                                                >
                                                    <Icon className="w-4 h-4" />
                                                </a>
                                            ) : null;
                                        })}
                                        {(!user?.social_links || Object.values(user.social_links).every(v => !v)) && (
                                            <div className="text-xs text-white/50 italic"></div>
                                        )}
                                    </div>

                                    {/* Preview Tabs (Links | Shop) - Offerings only for store profile */}
                                    <div className="mt-4 flex bg-black/10 backdrop-blur-sm p-1 rounded-full">
                                        <button
                                            onClick={() => setPreviewTab('links')}
                                            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${previewTab === 'links' ? 'bg-white text-black shadow-sm' : 'text-current opacity-70 hover:opacity-100'}`}
                                        >
                                            {t('dashboard.links')}
                                        </button>
                                        {user?.active_profile_mode === 'store' && (
                                            <button
                                                onClick={() => setPreviewTab('shop')}
                                                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${previewTab === 'shop' ? 'bg-white text-black shadow-sm' : 'text-current opacity-70 hover:opacity-100'}`}
                                            >
                                                {t('dashboard.offerings')}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Links View */}
                                {previewTab === 'links' && (
                                    <div className="mt-8 space-y-3 relative z-10 w-full px-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                        {localBlocks.filter(b => b.is_active).map((block) => {
                                            const Icon = block.thumbnail ? getIconForThumbnail(block.thumbnail) : null;
                                            const isUrlThumbnail = block.thumbnail && !Icon;

                                            // Simple preview for now
                                            return (
                                                <a
                                                    key={block._id}
                                                    href={block.content.url || '#'}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={`block w-full flex items-center justify-center relative px-12 ${currentTemplate.buttonStyle}`}
                                                >
                                                    {Icon && (
                                                        <Icon className="absolute left-4 w-5 h-5 opacity-90" />
                                                    )}
                                                    {isUrlThumbnail && (
                                                        <img src={block.thumbnail} alt="" className="absolute left-4 w-5 h-5 rounded-full object-cover bg-white/10" />
                                                    )}
                                                    <span className="truncate w-full">{block.title}</span>
                                                </a>
                                            );
                                        })}
                                        {localBlocks.filter(b => b.is_active).length === 0 && (
                                            <div className={`text-center text-sm py-8 ${currentTemplate.textColor} opacity-60`}>
                                                {t('dashboard.addLinksHere')}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Shop / Offerings View - Only for store profile */}
                                {previewTab === 'shop' && user?.active_profile_mode === 'store' && (
                                    <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300 px-6 mt-4">
                                        {/* Search Bar */}
                                        <div className="relative w-full">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-50 text-current" />
                                            <input
                                                type="text"
                                                placeholder={t('shop.searchProducts') || `Search ${username}'s products`}
                                                className="w-full pl-8 pr-4 py-2.5 rounded-xl text-xs bg-white/10 backdrop-blur-md border border-white/10 placeholder:text-current/50 focus:outline-none focus:ring-1 focus:ring-white/30 transition-all font-medium"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                            />
                                        </div>

                                        {/* Product Grid */}
                                        {products.filter(p => p && p._id && p.title.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 ? (
                                            <div className="grid gap-3">
                                                {products.filter(p => p && p._id && p.title.toLowerCase().includes(searchQuery.toLowerCase())).map((product, index) => (
                                                    <div
                                                        key={product._id || `product-${index}`}
                                                        className="relative aspect-square w-full rounded-2xl overflow-hidden group shadow-md"
                                                    >
                                                        {/* Background Image */}
                                                        {product.image_url ? (
                                                            <img src={product.image_url} alt={product.title} className="absolute inset-0 w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black w-full h-full flex items-center justify-center">
                                                                <div className="text-4xl opacity-20">✨</div>
                                                            </div>
                                                        )}

                                                        {/* Overlay */}
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                                                        {/* Top Actions */}
                                                        <div className="absolute top-2 left-2 right-2 flex justify-between items-start z-10">
                                                            <button className="w-6 h-6 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/40 transition-colors">
                                                                <X className="w-3 h-3" />
                                                            </button>
                                                        </div>

                                                        {/* Bottom Content */}
                                                        <div className="absolute bottom-0 left-0 right-0 p-3 z-20 text-white">
                                                            {/* Badge / Pill */}
                                                            <div className="inline-flex items-center gap-1 bg-white/10 backdrop-blur-md px-2 py-0.5 rounded-full text-[8px] font-medium mb-2 border border-white/10">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                                                <span>{user?.name || "User"}</span>
                                                            </div>

                                                            <h3 className="text-sm font-bold leading-tight mb-1 text-white">{product.title}</h3>
                                                            <p className="text-[10px] text-gray-300 line-clamp-1 mb-2 font-light">{product.description}</p>

                                                            {/* Action Row */}
                                                            <div className="flex items-center gap-2">
                                                                <a
                                                                    href={product.file_url ? (product.file_url.startsWith('http') ? product.file_url : `https://${product.file_url}`) : '#'}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex-1 bg-white text-black h-8 rounded-full font-bold text-xs flex items-center justify-center hover:bg-gray-100 transition-colors"
                                                                >
                                                                    Message {user?.name?.split(' ')[0] || 'User'}
                                                                </a>
                                                                <button className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-colors border border-white/10">
                                                                    <Heart className="w-3.5 h-3.5" />
                                                                </button>
                                                                <button className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-colors border border-white/10">
                                                                    <Share className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-10 opacity-60">
                                                <p className="text-sm font-medium">{t('shop.noProducts')}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Footer - Connect Button */}
                                <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center gap-2 px-6 z-30">
                                    <button className="w-full bg-white text-black h-12 rounded-full font-bold text-sm flex items-center justify-between px-5 shadow-xl hover:shadow-2xl transition-shadow border border-gray-100">
                                        <span>Message {user?.name?.split(' ')[0] || 'User'}</span>
                                        <MessageCircle className="w-5 h-5 text-gray-600" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Preview Label */}
                        <div className="text-center mt-6">
                            <div className="flex items-center justify-center gap-2 text-sm font-medium text-gray-600">
                                <Smartphone className="w-4 h-4" /> {t('dashboard.livePreview')}
                            </div>
                            <p className="text-xs text-gray-400 mt-1">{t('dashboard.previewDesc')}</p>
                        </div>
                    </div>
                </div>
            </div>

            <BlockEditorModal
                open={isAddingBlock || !!editingBlock}
                onOpenChange={(open) => {
                    if (!open) {
                        setIsAddingBlock(false);
                        setEditingBlock(null);
                    }
                }}
                block={editingBlock}
                onSave={handleSaveBlock}
            />
        </LinktreeLayout >
    );
};

export default Dashboard;
