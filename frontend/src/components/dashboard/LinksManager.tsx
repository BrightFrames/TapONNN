import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Plus, Globe, MessageCircle, Send } from "lucide-react";
import {
    InstagramIcon,
    FacebookIcon,
    TwitterIcon,
    YouTubeIcon,
    LinkedInIcon,
    WhatsAppIcon,
    TelegramIcon,
    GitHubIcon
} from "@/components/BrandIcons";
import SortableLinkCard from "@/components/SortableLinkCard";
import BlockEditorModal from "@/components/BlockEditorModal";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const SOCIAL_PLATFORMS = [
    { id: 'instagram', name: 'Instagram', icon: InstagramIcon, placeholder: 'https://instagram.com/yourusername' },
    { id: 'twitter', name: 'X / Twitter', icon: TwitterIcon, color: 'text-black dark:text-white', placeholder: 'https://x.com/yourusername' },
    { id: 'youtube', name: 'YouTube', icon: YouTubeIcon, placeholder: 'https://youtube.com/@channel' },
    { id: 'facebook', name: 'Facebook', icon: FacebookIcon, placeholder: 'https://facebook.com/yourprofile' },
    { id: 'linkedin', name: 'LinkedIn', icon: LinkedInIcon, placeholder: 'https://linkedin.com/in/yourprofile' },
    { id: 'whatsapp', name: 'WhatsApp', icon: WhatsAppIcon, placeholder: 'https://wa.me/number' },
    { id: 'telegram', name: 'Telegram', icon: TelegramIcon, placeholder: 'https://t.me/username' },
    { id: 'github', name: 'GitHub', icon: GitHubIcon, color: 'text-gray-900 dark:text-white', placeholder: 'https://github.com/username' },
    { id: 'website', name: 'Website', icon: Globe, color: 'text-blue-500', placeholder: 'https://yourwebsite.com' },
];

const LinksManager = () => {
    const { addBlock, updateBlock, deleteBlock, blocks, reorderBlocks, refreshProfile, user } = useAuth();
    const [isAddingBlock, setIsAddingBlock] = useState(false);
    const [editBlockData, setEditBlockData] = useState<any>(null);
    const [selectedPlatform, setSelectedPlatform] = useState<any>(null);
    const [socialUrl, setSocialUrl] = useState("");

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

    const handleAddSocial = async () => {
        if (!selectedPlatform) return;
        if (!socialUrl) {
            toast.error("Please enter a URL");
            return;
        }

        try {
            await addBlock({
                title: selectedPlatform.name,
                block_type: 'link',
                content: { url: socialUrl },
                thumbnail: selectedPlatform.id, // Store platform ID as thumbnail identifier
                is_active: true
            });
            await refreshProfile();
            toast.success(`Added ${selectedPlatform.name} link`);
            setSelectedPlatform(null);
            setSocialUrl("");
        } catch (error) {
            toast.error("Failed to add link");
        }
    };

    return (
        <div className="space-y-8">
            {/* Header Actions */}
            <div className="flex flex-col gap-4">
                <div>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Social Links</h2>
                    <p className="text-zinc-500 text-sm mt-1">Add your social profiles to build your audience.</p>
                </div>

                {/* Social Platform Grid */}
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                    {SOCIAL_PLATFORMS.map((platform) => (
                        <button
                            key={platform.id}
                            onClick={() => {
                                setSelectedPlatform(platform);
                                setSocialUrl("");
                            }}
                            className="flex flex-col items-center gap-2 group"
                        >
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-110 group-hover:shadow-md ${platform.bgClass}`}>
                                <platform.icon className={`w-7 h-7 ${platform.color}`} />
                            </div>
                            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-200 transition-colors">{platform.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Links List */}
            <div className="space-y-4 pb-20">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white uppercase tracking-wider">Your Links</h3>
                {blocks.length === 0 ? (
                    <div className="text-center py-10 bg-white dark:bg-zinc-900 rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800">
                        <p className="text-zinc-500 font-medium text-sm">No links added yet.</p>
                        <p className="text-zinc-400 text-xs mt-1">Select a platform above to add one.</p>
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

            {/* Add Social Link Dialog */}
            <Dialog open={!!selectedPlatform} onOpenChange={(open) => !open && setSelectedPlatform(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {selectedPlatform && <selectedPlatform.icon className={`w-5 h-5 ${selectedPlatform.color}`} />}
                            Add {selectedPlatform?.name}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="space-y-2">
                            <Label>URL</Label>
                            <Input
                                placeholder={selectedPlatform?.placeholder}
                                value={socialUrl}
                                onChange={(e) => setSocialUrl(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedPlatform(null)}>Cancel</Button>
                        <Button onClick={handleAddSocial}>Add Link</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Block Editor Modal (Edit Only) */}
            <BlockEditorModal
                open={isAddingBlock}
                onOpenChange={setIsAddingBlock}
                initialData={editBlockData}
                onSave={async (block) => {
                    if (editBlockData) {
                        await updateBlock(editBlockData._id, block);
                    } else {
                        await addBlock(block); // Fallback if regular add used
                    }
                    setIsAddingBlock(false);
                    setEditBlockData(null);
                }}
            />
        </div>
    );
};

export default LinksManager;
