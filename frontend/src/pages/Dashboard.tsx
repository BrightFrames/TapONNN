import { useState, useEffect } from "react";
import { toast } from "sonner";
import LinktreeLayout from "@/layouts/LinktreeLayout";
import BlockEditorModal from "@/components/BlockEditorModal";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import SortableLinkCard from "@/components/SortableLinkCard";
import ProfilePreview from "@/components/dashboard/ProfilePreview";
import { templates } from "@/data/templates";
import { supabase } from "@/lib/supabase";
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
    const { user, addBlock, updateBlock, deleteBlock, blocks, reorderBlocks, selectedTheme } = useAuth();
    const [isAddingBlock, setIsAddingBlock] = useState(false);
    const [editBlockData, setEditBlockData] = useState<any>(null);
    const [products, setProducts] = useState<any[]>([]);

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

    // Products for Preview
    useEffect(() => {
        const fetchProducts = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token || localStorage.getItem('token');
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

    // Current config/theme for preview
    const currentThemeConfig = {
        ...user?.design_config,
        // If theme is selected from templates but not overridden by custom config:
        ...(templates.find(t => t.id === selectedTheme) || {})
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
        isArchived: block.is_archived
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
        <LinktreeLayout>
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
                                />
                            </div>
                            <div className="mt-4 text-center">
                                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Live Preview</p>
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
        </LinktreeLayout>
    );
};

export default Dashboard;
