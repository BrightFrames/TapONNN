import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import TapxLayout from "@/layouts/TapxLayout";
import BlockEditorModal from "@/components/BlockEditorModal";
import StoreSelectorModal from "@/components/StoreSelectorModal";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { Plus, ShoppingBag, Link2, Copy, ExternalLink } from "lucide-react";
import SortableLinkCard from "@/components/SortableLinkCard";
import SocialLinksEditor from "@/components/SocialLinksEditor";
import ProfilePreview from "@/components/dashboard/ProfilePreview";
import { templates } from "@/data/templates";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';

const Dashboard = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user, addBlock, updateBlock, deleteBlock, blocks, reorderBlocks, selectedTheme, updateProfile } = useAuth();
    const [isAddingBlock, setIsAddingBlock] = useState(false);
    const [editBlockData, setEditBlockData] = useState<any>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [stores, setStores] = useState<any[]>([]);
    const [isStoreSelectorOpen, setIsStoreSelectorOpen] = useState(false);
    const [isStoresLoading, setIsStoresLoading] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

    // Redirect to business dashboard if in store mode
    useEffect(() => {
        if (user?.active_profile_mode === 'store') {
            navigate('/dashboard/business', { replace: true });
        }
    }, [user?.active_profile_mode, navigate]);

    // Products for Preview
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

    // Fetch user stores
    const fetchStores = useCallback(async () => {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            console.log('[Dashboard] No auth token found');
            return [];
        }
        setIsStoresLoading(true);
        try {
            console.log('[Dashboard] Fetching stores from:', `${API_URL}/stores/my-stores`);
            const res = await fetch(`${API_URL}/stores/my-stores`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log('[Dashboard] Stores fetch response status:', res.status);
            if (res.ok) {
                const data = await res.json();
                console.log('[Dashboard] Stores data received:', data);
                const nextStores = data.stores || [];
                setStores(nextStores);
                console.log('[Dashboard] Stores count:', nextStores.length);
                return nextStores;
            } else {
                console.error('[Dashboard] Stores fetch failed:', res.status, res.statusText);
            }
        } catch (error) {
            console.error("[Dashboard] Failed to fetch stores", error);
        } finally {
            setIsStoresLoading(false);
        }
        return [];
    }, [API_URL]);

    useEffect(() => {
        fetchStores();
    }, [fetchStores]);

    const handleStoreVisibilityToggle = async (checked: boolean) => {
        if (checked) {
            if (isStoresLoading) return;

            const availableStores = stores.length > 0 ? stores : await fetchStores();

            if (availableStores.length === 0) {
                toast.error("Create a shop first to enable this feature");
                return;
            }

            if (availableStores.length === 1) {
                await updateProfile({
                    show_stores_on_profile: true,
                    visible_stores: [availableStores[0].id]
                } as any);
                toast.success("Shop is now visible on your profile");
                return;
            }

            setIsStoreSelectorOpen(true);
        } else {
            await updateProfile({ 
                show_stores_on_profile: false,
                visible_stores: [] 
            } as any);
            toast.success("Shops hidden from profile");
        }
    };

    const handleSaveVisibleStores = async (storeIds: string[]) => {
        try {
            await updateProfile({ 
                show_stores_on_profile: storeIds.length > 0,
                visible_stores: storeIds 
            } as any);
            setIsStoreSelectorOpen(false);
            if (storeIds.length > 0) {
                toast.success(`${storeIds.length} shop${storeIds.length > 1 ? 's' : ''} now visible on your profile`);
            } else {
                toast.success("All shops hidden from profile");
            }
        } catch (error) {
            console.error("Failed to update visible stores", error);
            toast.error("Failed to update shop visibility");
        }
    };

    // Current config/theme for preview
    const currentThemeConfig = {
        // Start from template defaults, then let user overrides win
        ...(templates.find(t => t.id === selectedTheme) || {}),
        ...user?.design_config,
    };

    // Dnd Sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = blocks.findIndex((b) => b._id === active.id);
            const newIndex = blocks.findIndex((b) => b._id === over.id);

            const newBlocks = arrayMove(blocks, oldIndex, newIndex);
            reorderBlocks(newBlocks);
        }
    };

    // Link/Block Mapping Helper
    const mapBlockToLink = (block: any) => ({
        id: block._id,
        title: block.title,
        url: block.content?.url || '',
        isActive: block.is_active,
        clicks: block.clicks || 0,
        position: block.position,
        thumbnail: block.thumbnail,
        isFeatured: block.is_featured,
        isArchived: block.is_archived,
        blockColor: block.content?.blockColor
    });

    const handleUpdate = async (id: string, field: string, value: any) => {
        const updates: any = {};
        if (field === 'url') updates.content = { url: value };
        else if (field === 'isActive') updates.is_active = value;
        else if (field === 'isFeatured') updates.is_featured = value;
        else if (field === 'isArchived') updates.is_archived = value;
        else updates[field] = value;

        await updateBlock(id, updates);
    };

    return (
        <TapxLayout>
            <div className="min-h-screen bg-[#F3F3F1] dark:bg-black p-4 lg:p-10 transition-colors">
                <div className="flex flex-col xl:flex-row gap-8 max-w-7xl mx-auto">

                    {/* LEFT PANEL: Link Management */}
                    <div className="flex-1 space-y-6">
                        {/* Header Actions */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Links & Blocks</h1>
                                <p className="text-zinc-500 text-sm mt-1">Manage and organize your profile content.</p>
                            </div>
                            <Button
                                onClick={() => {
                                    setEditBlockData(null);
                                    setIsAddingBlock(true);
                                }}
                                className="w-full sm:w-auto rounded-full font-bold shadow-lg bg-green-600 hover:bg-green-700 text-white"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Link
                            </Button>
                        </div>

                        {/* Your Profile Link */}
                        <div className="bg-white dark:bg-zinc-900/60 backdrop-blur-md rounded-2xl border border-gray-200 dark:border-zinc-800/60 p-5">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0">
                                        <Link2 className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-base font-bold text-gray-900 dark:text-white">Your Profile</h3>
                                        <p className="text-sm text-gray-500 dark:text-zinc-500 truncate">
                                            {window.location.origin}/{user?.username}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-9 w-9 rounded-xl"
                                        onClick={() => {
                                            navigator.clipboard.writeText(`${window.location.origin}/${user?.username}`);
                                            toast.success("Profile link copied!");
                                        }}
                                        title="Copy link"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-9 w-9 rounded-xl"
                                        onClick={() => window.open(`/${user?.username}`, '_blank')}
                                        title="Open profile"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Social Links Section */}
                        <SocialLinksEditor
                            socialLinks={user?.social_links || {}}
                            onSave={async (links) => {
                                await updateProfile({ social_links: links } as any);
                            }}
                        />

                        {/* Store & Apps Visibility */}
                        <div className="bg-white dark:bg-zinc-900/60 backdrop-blur-md rounded-2xl border border-gray-200 dark:border-zinc-800/60 p-5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/30 flex items-center justify-center">
                                        <ShoppingBag className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-gray-900 dark:text-white">Shop Visibility</h3>
                                        <p className="text-sm text-gray-500 dark:text-zinc-500">Show your products on your profile</p>
                                    </div>
                                </div>
                                <Switch 
                                    checked={user?.show_stores_on_profile} 
                                    onCheckedChange={handleStoreVisibilityToggle}
                                />
                            </div>
                        </div>

                        {/* Links List */}
                        <div className="space-y-4 pb-20">
                            {blocks.length === 0 ? (
                                <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800">
                                    <p className="text-zinc-500 font-medium">No links or blocks yet.</p>
                                    <Button variant="link" onClick={() => setIsAddingBlock(true)} className="text-green-600">Get started by adding one</Button>
                                </div>
                            ) : (
                                <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragEnd={handleDragEnd}
                                >
                                    <SortableContext
                                        items={blocks.map(b => b._id)}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        {blocks.map((block) => (
                                            <SortableLinkCard
                                                key={block._id}
                                                link={mapBlockToLink(block)}
                                                onUpdate={handleUpdate}
                                                onDelete={deleteBlock}
                                                onEdit={() => {
                                                    setEditBlockData(block);
                                                    setIsAddingBlock(true);
                                                }}
                                                onDuplicate={async () => {
                                                    await addBlock({
                                                        ...block,
                                                        _id: undefined,
                                                        title: `${block.title} (Copy)`
                                                    });
                                                }}
                                            />
                                        ))}
                                    </SortableContext>
                                </DndContext>
                            )}
                        </div>
                    </div>

                    {/* RIGHT PANEL: Live Preview */}
                    <div className="hidden xl:block w-[400px] shrink-0">
                        <div className="sticky top-24 flex flex-col items-center">
                            <div className="transform scale-[0.9] origin-top">
                                <ProfilePreview
                                    blocks={blocks}
                                    theme={currentThemeConfig}
                                    products={products}
                                    showStoreTab={user?.show_stores_on_profile === true && (user?.visible_stores?.length || 0) > 0}
                                />
                            </div>
                            <div className="mt-4 text-center space-y-2">
                                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Live Preview</p>
                                {stores.length > 0 ? (
                                    <div className="flex items-center gap-2 justify-center text-xs text-zinc-500 dark:text-zinc-400">
                                        <div className="w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center">
                                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                        </div>
                                        <span>{stores.length} shop{stores.length > 1 ? 's' : ''} active</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 justify-center text-xs text-zinc-400">
                                        <div className="w-4 h-4 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
                                            <div className="w-2 h-2 rounded-full bg-zinc-400"></div>
                                        </div>
                                        <span>No shops yet</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Block Editor Modal */}
            <BlockEditorModal
                open={isAddingBlock}
                onOpenChange={setIsAddingBlock}
                initialData={editBlockData}
                onSave={async (block) => {
                    if (editBlockData) {
                        await updateBlock(editBlockData._id, block);
                    } else {
                        await addBlock(block);
                    }
                    setIsAddingBlock(false);
                    setEditBlockData(null);
                }}
            />

            <StoreSelectorModal
                open={isStoreSelectorOpen}
                onClose={() => setIsStoreSelectorOpen(false)}
                currentVisibleStores={user?.visible_stores || []}
                onSave={handleSaveVisibleStores}
            />

        </TapxLayout>
    );
};

export default Dashboard;
