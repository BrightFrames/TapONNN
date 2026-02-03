import { useState, useEffect } from "react";
import { toast } from "sonner";
import LinktreeLayout from "@/layouts/LinktreeLayout";
import SortableLinkCard from "@/components/SortableLinkCard";
import BlockEditorModal from "@/components/BlockEditorModal";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { templates } from "@/data/templates";
import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
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
    Copy,
    ExternalLink,
    Link2,
    Instagram,
    Trash2,
    Search,
    X,
    MessageCircle,
    Settings,
    Truck,
    CreditCard
} from "lucide-react";

import { getIconForThumbnail } from "@/utils/socialIcons";
import { SocialLinksDialog } from "@/components/SocialLinksDialog";
// import { PluginConfigModal } from "@/components/marketplace/PluginConfigModal"; // Unused import

interface Plugin {
    _id: string;
    name: string;
    slug: string;
    description: string;
    icon: string;
    category: string;
    type: string;
    is_premium: boolean;
    config_schema?: any[];
}

interface UserPlugin {
    _id: string;
    plugin_id: Plugin;
    config: Record<string, any>;
}

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
    const { user, blocks, addBlock, updateBlock, deleteBlock, reorderBlocks, selectedTheme, updateProfile } = useAuth();
    const [isAddingBlock, setIsAddingBlock] = useState(false);
    const [editingBlock, setEditingBlock] = useState<any>(null);
    const [socialPreview, setSocialPreview] = useState<Record<string, string> | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [previewTab, setPreviewTab] = useState<'links' | 'shop'>('links');
    const [searchQuery, setSearchQuery] = useState("");

    // Plugin State
    const [plugins, setPlugins] = useState<Plugin[]>([]);
    const [installedPlugins, setInstalledPlugins] = useState<UserPlugin[]>([]);
    const [installingPluginId, setInstallingPluginId] = useState<string | null>(null);
    const [configModalOpen, setConfigModalOpen] = useState(false);
    const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null);
    const [selectedConfig, setSelectedConfig] = useState<Record<string, any>>({});

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        fetchPlugins();
        fetchInstalledPlugins();
    }, []);

    const fetchPlugins = async () => {
        try {
            const response = await fetch(`${API_URL}/marketplace/plugins`);
            if (response.ok) {
                const data = await response.json();
                setPlugins(data);
            }
        } catch (error) {
            console.error('Error fetching plugins:', error);
        }
    };

    const fetchInstalledPlugins = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.access_token) return;

            const response = await fetch(`${API_URL}/marketplace/my-plugins`, {
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setInstalledPlugins(data);
            }
        } catch (error) {
            console.error('Error fetching installed plugins:', error);
        }
    };

    const handleConfigurePlugin = (plugin: Plugin, config: Record<string, any>) => {
        setSelectedPlugin(plugin);
        setSelectedConfig(config || {});
        setConfigModalOpen(true);
    };

    const [localBlocks, setLocalBlocks] = useState(blocks);

    useEffect(() => {
        setLocalBlocks(blocks);
    }, [blocks]);

    useEffect(() => {
        const fetchProducts = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            // Fallback to localStorage if session token is missing, but usually session is source of truth
            const localToken = localStorage.getItem('token');
            const finalToken = token || localToken;

            if (!finalToken) return;
            try {
                const res = await fetch(`${API_URL}/products`, {
                    headers: { 'Authorization': `Bearer ${finalToken}` }
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
    const currentTemplate = templates.find(t => t.id === selectedTheme) || templates[0];
    const bgStyle = currentTemplate.bgImage
        ? { backgroundImage: `url(${currentTemplate.bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
        : {};

    const handleDeleteBlock = async (id: string) => {
        if (!confirm(t('common.delete') + "?")) return;
        await deleteBlock(id);
    };

    const handleUpdateBlockField = (id: string, field: string, value: any) => {
        const fieldMap: Record<string, string> = {
            'isActive': 'is_active',
            'isFeatured': 'is_featured'
        };
        const backendField = fieldMap[field] || field;

        updateBlock(id, { [backendField]: value });

        if (field === 'isFeatured') {
            setLocalBlocks(currentBlocks => {
                const blockIndex = currentBlocks.findIndex(b => b._id === id);
                if (blockIndex === -1) return currentBlocks;

                const blockToMove = { ...currentBlocks[blockIndex], [backendField]: value };
                const otherBlocks = currentBlocks.filter(b => b._id !== id);
                let newOrder = [];

                if (value === true) {
                    const existingFeatured = otherBlocks.filter(b => (b as any).is_featured);
                    const unfeatured = otherBlocks.filter(b => !(b as any).is_featured);
                    newOrder = [blockToMove, ...existingFeatured, ...unfeatured];
                } else {
                    const existingFeatured = otherBlocks.filter(b => (b as any).is_featured);
                    const unfeatured = otherBlocks.filter(b => !(b as any).is_featured);
                    newOrder = [...existingFeatured, blockToMove, ...unfeatured];
                }
                reorderBlocks(newOrder);
                return newOrder;
            });
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setLocalBlocks((items) => {
                const oldIndex = items.findIndex((item) => item._id === active.id);
                const newIndex = items.findIndex((item) => item._id === over.id);
                const newItems = arrayMove(items, oldIndex, newIndex);
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
            await updateProfile({ social_links: updatedLinks });
            setSocialPreview(null);
        } catch (err) {
            console.error("Error saving socials:", err);
        }
    };

    const handleClearAll = async () => {
        if (!confirm(t('common.confirm') + "?")) return;
        for (const block of blocks) {
            await deleteBlock(block._id);
        }
    };

    const handleDuplicateBlock = async (blockId: string) => {
        const blockToDuplicate = blocks.find(b => b._id === blockId);
        if (!blockToDuplicate) return;
        const { _id, ...rest } = blockToDuplicate;
        const newBlock = {
            ...rest,
            title: `${rest.title} (Copy)`,
            content: { ...rest.content }
        };
        const toastId = toast.loading("Duplicating...");
        try {
            await addBlock(newBlock);
            toast.success("Duplicated successfully", { id: toastId });
        } catch (error) {
            toast.error("Failed to duplicate", { id: toastId });
        }
    };

    return (
        <LinktreeLayout>
            <div className="flex h-full font-sans">
                {/* Main Editor */}
                <div className="flex-1 py-12 px-6 md:px-12 bg-gray-50 dark:bg-black/40 overflow-y-auto custom-scrollbar">
                    <div className="max-w-3xl mx-auto space-y-8">

                        {/* Header */}
                        <div className="flex flex-col gap-6">
                            {/* Title Row */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">{t('dashboard.title') || "Dashboard"}</h1>
                                    <p className="text-gray-500 dark:text-zinc-400 text-sm sm:text-base font-medium">Manage your links and content.</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    {/* Profile Link - Mobile responsive */}
                                    <div className="relative group w-full sm:w-auto">
                                        <div
                                            onClick={() => {
                                                const path = user?.active_profile_mode === 'store' ? `/s/${username}` : `/${username}`;
                                                const url = `${window.location.origin}${path}`;
                                                window.open(url, '_blank');
                                            }}
                                            className="bg-gray-100 dark:bg-zinc-900/80 hover:bg-gray-200 dark:hover:bg-zinc-800 transition-all rounded-full px-4 py-2.5 text-sm text-gray-700 dark:text-zinc-300 pr-12 border border-gray-200 dark:border-zinc-800 cursor-pointer truncate max-w-[220px] shadow-sm dark:shadow-lg backdrop-blur-sm"
                                            title="Click to open public profile"
                                        >
                                            <span className="opacity-60 mr-1">{window.location.hostname === 'localhost' ? 'localhost' : 'taponn.me'}/</span>
                                            <span className="font-semibold text-gray-900 dark:text-white">{user?.active_profile_mode === 'store' ? `s/${username}` : username}</span>
                                        </div>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full hover:bg-zinc-700 text-zinc-400 transition-colors"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                copyProfileLink();
                                            }}
                                        >
                                            <Copy className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Bar */}
                        <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr] gap-4">
                            <Button
                                onClick={() => setIsAddingBlock(true)}
                                className="w-full bg-white hover:bg-gray-100 text-black rounded-xl h-14 text-base font-bold shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all hover:scale-[1.01] active:scale-[0.99] gap-2.5"
                            >
                                <Plus className="w-5 h-5" /> {t('dashboard.addContent')}
                            </Button>

                            <SocialLinksDialog
                                initialLinks={user?.social_links || {}}
                                onSave={saveSocialLinks}
                                onLinksChange={setSocialPreview}
                                onOpenChange={(isOpen) => !isOpen && setSocialPreview(null)}
                            >
                                <Button
                                    variant="outline"
                                    className="w-full h-14 rounded-xl border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white hover:border-gray-300 dark:hover:border-zinc-700 backdrop-blur-sm transition-all gap-2"
                                >
                                    <Instagram className="w-5 h-5 opacity-70" />
                                    <span className="font-medium">{t('dashboard.socials')}</span>
                                </Button>
                            </SocialLinksDialog>

                            <Button
                                onClick={handleClearAll}
                                variant="outline"
                                className="w-full h-14 rounded-xl border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 dark:hover:text-red-300 hover:border-red-200 dark:hover:border-red-900/50 backdrop-blur-sm transition-all gap-2"
                            >
                                <Trash2 className="w-5 h-5 opacity-70" />
                                <span className="font-medium">{t('dashboard.clearAll')}</span>
                            </Button>
                        </div>

                        {/* Connected Apps Section (Store Mode Only) */}
                        {user?.active_profile_mode === 'store' && installedPlugins.length > 0 && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4 px-1 ml-1">{t('dashboard.connectedApps') || 'Connected Apps'}</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                                    {installedPlugins.map((plugin) => (
                                        <div key={plugin._id} className="group flex items-center justify-between p-4 bg-zinc-900/40 border border-zinc-800/60 rounded-2xl hover:bg-zinc-900/60 hover:border-zinc-700 transition-all duration-300 backdrop-blur-sm">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className="shrink-0 w-10 h-10 rounded-xl bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center text-zinc-400 group-hover:text-zinc-200 transition-colors">
                                                    {plugin.plugin_id.icon === 'truck' ? <Truck className="w-5 h-5" /> :
                                                        plugin.plugin_id.icon === 'credit-card' ? <CreditCard className="w-5 h-5" /> :
                                                            <div className="font-bold text-sm">⚡</div>}
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="text-sm font-semibold text-zinc-200 truncate">{plugin.plugin_id.name}</h4>
                                                    <p className="text-[11px] text-zinc-500 truncate flex items-center gap-1.5 mt-0.5">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></span>
                                                        Active
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800"
                                                onClick={() => handleConfigurePlugin(plugin.plugin_id, plugin.config)}
                                            >
                                                <Settings className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}


                        <div className="space-y-4 pb-20">
                            {(localBlocks || []).length === 0 && (
                                <div className="text-center py-16 bg-white dark:bg-zinc-900/30 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800/60 px-4 mt-8">
                                    <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <Link2 className="w-8 h-8 text-zinc-400 dark:text-zinc-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('dashboard.noLinks')}</h3>
                                    <p className="text-gray-500 dark:text-zinc-500 text-sm mb-6 max-w-sm mx-auto">{t('dashboard.noLinksDesc')}</p>
                                    <Button onClick={() => setIsAddingBlock(true)} variant="outline" className="rounded-full gap-2 text-sm bg-gray-900 dark:bg-zinc-900 border-transparent dark:border-zinc-700 text-white dark:text-zinc-300 hover:bg-gray-800 dark:hover:bg-zinc-800 hover:text-white px-6">
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
                                    <div className="space-y-4">
                                        {localBlocks.map(block => (
                                            <SortableLinkCard
                                                key={block._id}
                                                link={{
                                                    id: block._id,
                                                    title: block.title,
                                                    url: block.content.url || block.content.price || '',
                                                    isActive: block.is_active,
                                                    clicks: 0,
                                                    thumbnail: block.thumbnail,
                                                    isFeatured: (block as any).is_featured || false,
                                                }}
                                                onUpdate={handleUpdateBlockField}
                                                onDelete={handleDeleteBlock}
                                                onEdit={() => setEditingBlock(block)}
                                                onDuplicate={() => handleDuplicateBlock(block._id)}
                                            />
                                        ))}
                                    </div>
                                </SortableContext>
                            </DndContext>
                        </div>
                    </div>
                </div>

                {/* Phone Preview - Right Side */}
                <div className="w-[400px] border-l border-zinc-200 dark:border-zinc-800/50 hidden xl:flex items-center justify-center bg-gray-50 dark:bg-[#050505] sticky top-0 h-full">
                    <div className="py-8 px-8 flex flex-col items-center scale-[0.85] 2xl:scale-100 transition-transform origin-top">
                        {/* Phone Frame */}
                        <div className="w-[300px] h-[620px] bg-black rounded-[3rem] border-[10px] border-zinc-900/90 shadow-2xl overflow-hidden relative ring-4 ring-black/50">
                            {/* Notch */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-b-2xl z-20" />

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

                            {/* Screen Content */}
                            <div
                                className={`h-full w-full overflow-y-auto p-6 pb-20 ${currentTemplate.bgClass || 'bg-gray-100'} ${currentTemplate.textColor} scrollbar-hide`}
                                style={bgStyle}
                            >
                                {currentTemplate.bgImage && <div className="absolute inset-0 bg-black/20 pointer-events-none" />}

                                {/* Share Button */}
                                <div className="absolute top-12 right-6 w-8 h-8 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center z-10">
                                    <ExternalLink className={`w-4 h-4 ${currentTemplate.textColor ? 'opacity-80' : 'text-gray-700'}`} />
                                </div>

                                <div className="flex flex-col items-center mt-8 space-y-3 relative z-10">
                                    <div className="w-24 h-24 rounded-full border-4 border-white/20 shadow-xl overflow-hidden relative">
                                        {user?.avatar ? (
                                            <img src={user.avatar} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-white text-3xl font-bold">
                                                {userInitial}
                                            </div>
                                        )}
                                    </div>

                                    <h2 className="text-xl font-bold tracking-tight shadow-black/10 drop-shadow-sm">@{username}</h2>

                                    <div className="flex gap-3 flex-wrap justify-center px-4">
                                        {(socialPreview || user?.social_links ? Object.entries(socialPreview || user?.social_links || {}) : [])?.map(([platform, url]) => {
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
                                    </div>

                                    {/* Preview Tabs */}
                                    <Tabs defaultValue="links" value={previewTab} onValueChange={(v) => setPreviewTab(v as 'links' | 'shop')} className="w-full">
                                        <div className="flex justify-center mt-4">
                                            <TabsList className="bg-black/20 backdrop-blur-md h-9 rounded-full p-1 w-auto border border-white/5">
                                                <TabsTrigger value="links" className="rounded-full text-xs h-7 px-4 data-[state=active]:bg-white/90 data-[state=active]:text-black transition-all">
                                                    {t('dashboard.links')}
                                                </TabsTrigger>
                                                {user?.active_profile_mode === 'store' && (
                                                    <TabsTrigger value="shop" className="rounded-full text-xs h-7 px-4 data-[state=active]:bg-white/90 data-[state=active]:text-black transition-all">
                                                        Shop
                                                    </TabsTrigger>
                                                )}
                                            </TabsList>
                                        </div>

                                        {/* Links View */}
                                        <TabsContent value="links" className="mt-8 space-y-3 relative z-10 w-full px-6 animate-in fade-in slide-in-from-bottom-4 duration-300 data-[state=inactive]:hidden text-center">
                                            {localBlocks.filter(b => b.is_active).map((block) => {
                                                const Icon = block.thumbnail ? getIconForThumbnail(block.thumbnail) : null;
                                                const isUrlThumbnail = block.thumbnail && !Icon;

                                                return (
                                                    <a
                                                        key={block._id}
                                                        href={block.content.url || '#'}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className={`block w-full flex items-center justify-center relative px-12 ${currentTemplate.buttonStyle || 'bg-white/10 backdrop-blur-sm hover:scale-[1.02] transition-transform rounded-xl py-3 border border-white/10'}`}
                                                    >
                                                        {Icon && (
                                                            <Icon className="absolute left-4 w-5 h-5 opacity-90" />
                                                        )}
                                                        {isUrlThumbnail && (
                                                            <img src={block.thumbnail} alt="" className="absolute left-4 w-5 h-5 rounded-full object-cover bg-white/10" />
                                                        )}
                                                        <span className="truncate w-full text-left font-medium">{block.title}</span>
                                                    </a>
                                                );
                                            })}
                                            {localBlocks.filter(b => b.is_active).length === 0 && (
                                                <div className={`text-center text-sm py-8 opacity-60`}>
                                                    {t('dashboard.addLinksHere')}
                                                </div>
                                            )}
                                        </TabsContent>

                                        {/* Shop View */}
                                        <TabsContent value="shop" className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300 px-6 mt-4 data-[state=inactive]:hidden">
                                            {user?.active_profile_mode === 'store' && (
                                                <>
                                                    <div className="relative w-full">
                                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-50 text-current" />
                                                        <Input
                                                            type="text"
                                                            placeholder={t('shop.searchProducts') || "Search..."}
                                                            className="w-full pl-8 pr-4 py-2 h-9 rounded-xl text-xs bg-white/10 backdrop-blur-md border-white/10 placeholder:text-current/50 focus-visible:ring-1 focus-visible:ring-white/30 transition-all font-medium text-inherit"
                                                            value={searchQuery}
                                                            onChange={(e) => setSearchQuery(e.target.value)}
                                                        />
                                                    </div>

                                                    {products.filter(p => p && p._id && p.title.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 ? (
                                                        <div className="grid gap-3">
                                                            {products.filter(p => p && p._id && p.title.toLowerCase().includes(searchQuery.toLowerCase())).map((product, index) => (
                                                                <div
                                                                    key={product._id || `product-${index}`}
                                                                    className="relative aspect-square w-full rounded-2xl overflow-hidden group shadow-md"
                                                                >
                                                                    {product.image_url ? (
                                                                        <img src={product.image_url} alt={product.title} className="absolute inset-0 w-full h-full object-cover" />
                                                                    ) : (
                                                                        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black w-full h-full flex items-center justify-center">
                                                                            <span className="text-2xl">🛍️</span>
                                                                        </div>
                                                                    )}
                                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                                                                    <div className="absolute bottom-0 left-0 right-0 p-3 z-20 text-white">
                                                                        <h3 className="text-sm font-bold leading-tight mb-1 text-white">{product.title}</h3>
                                                                        <div className="flex items-center gap-2 mt-2">
                                                                            <Button size="sm" className="w-full bg-white text-black h-7 rounded-full font-bold text-[10px] hover:bg-gray-100">
                                                                                Buy Now
                                                                            </Button>
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
                                                </>
                                            )}
                                        </TabsContent>

                                        {/* Footer - Connect Button */}
                                        <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center gap-2 px-6 z-30">
                                            <Button className="group w-full relative overflow-hidden rounded-full h-14 shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:shadow-[0_8px_40px_rgba(0,0,0,0.2)] transition-all duration-300 hover:-translate-y-1 active:scale-95 p-0 border-none">
                                                {/* Gradient Background */}
                                                <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-black to-gray-900 group-hover:bg-gradient-to-r group-hover:from-gray-800 group-hover:via-gray-900 group-hover:to-gray-800 transition-all duration-500" />

                                                {/* Shimmer Effect */}
                                                <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-gradient-to-r from-transparent via-white to-transparent -skew-x-12 translate-x-[-100%] group-hover:animate-shimmer" />

                                                <div className="relative flex items-center justify-between px-6 h-full text-white w-full">
                                                    <span className="font-bold text-lg tracking-wide">
                                                        {previewTab === 'shop'
                                                            ? 'Connect with Seller'
                                                            : `Message ${user?.name?.split(' ')[0] || 'User'}`}
                                                    </span>
                                                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-white/20 transition-all duration-300">
                                                        <MessageCircle className="w-5 h-5 text-white" />
                                                    </div>
                                                </div>
                                            </Button>
                                        </div>
                                    </Tabs>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Block Editor Modals */}
            <BlockEditorModal
                open={isAddingBlock}
                onOpenChange={setIsAddingBlock}
                onSave={async (block) => {
                    await addBlock(block);
                    setIsAddingBlock(false);
                }}
            />

            <BlockEditorModal
                open={!!editingBlock}
                onOpenChange={(open) => !open && setEditingBlock(null)}
                block={editingBlock}
                onSave={async (block) => {
                    if (editingBlock) {
                        await updateBlock(editingBlock._id, block);
                        setEditingBlock(null);
                    }
                }}
            />
        </LinktreeLayout>
    );
};

export default Dashboard;
