import { useState, useEffect } from "react";
import { toast } from "sonner";
import LinktreeLayout from "@/layouts/LinktreeLayout";
import SortableLinkCard from "@/components/SortableLinkCard";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
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
    Globe
} from "lucide-react";

interface Link {
    id: string;
    title: string;
    url: string;
    isActive: boolean;
    clicks?: number;
    position?: number;
}

const Dashboard = () => {
    const { user, links: authLinks, updateLinks, deleteLink: deleteLinkFromApi } = useAuth();
    const [links, setLinks] = useState<Link[]>(authLinks);

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
    useEffect(() => {
        setLinks(authLinks);
    }, [authLinks]);

    const userName = user?.name || "Creator";
    const username = user?.username || "user";
    const userInitial = userName[0]?.toUpperCase() || "U";

    const addLink = () => {
        const newLink: Link = {
            id: Date.now().toString(),
            title: 'New Link',
            url: '',
            isActive: true,
            clicks: 0,
            position: 0
        };
        const newLinks = [newLink, ...links.map((l, i) => ({ ...l, position: i + 1 }))];
        setLinks(newLinks);
        updateLinks(newLinks);
    };

    const updateLink = (id: string, field: keyof Link, value: any) => {
        const newLinks = links.map(l => l.id === id ? { ...l, [field]: value } : l);
        setLinks(newLinks);
        updateLinks(newLinks);
    };

    const deleteLink = async (id: string) => {
        // Use the API-based delete for existing links (UUID format)
        if (id.length > 30) {
            await deleteLinkFromApi(id);
        } else {
            // For temporary local links that haven't been saved yet
            const newLinks = links.filter(l => l.id !== id);
            setLinks(newLinks);
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setLinks((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);

                const newItems = arrayMove(items, oldIndex, newIndex);

                // Update positions
                const itemsWithPositions = newItems.map((item, index) => ({
                    ...item,
                    position: index
                }));

                // Persist to backend
                persistReorder(itemsWithPositions);

                return itemsWithPositions;
            });
        }
    };

    const persistReorder = async (reorderedLinks: Link[]) => {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        if (!token) return;

        try {
            await fetch(`${API_URL}/links/reorder`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    links: reorderedLinks.map(l => ({ id: l.id, position: l.position }))
                })
            });
        } catch (err) {
            console.error("Error persisting reorder:", err);
            toast.error("Failed to save link order");
        }
    };

    const copyProfileLink = () => {
        const url = `${window.location.origin}/${username}`;
        navigator.clipboard.writeText(url);
        toast.success("Profile link copied to clipboard!");
    };

    return (
        <LinktreeLayout>
            <div className="flex h-full">
                {/* Main Editor */}
                <div className="flex-1 py-8 px-6 md:px-10 overflow-y-auto">
                    <div className="max-w-2xl mx-auto">

                        {/* Header */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Links</h1>
                                <p className="text-gray-500 text-sm mt-1">Manage your profile links • Drag to reorder</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button variant="outline" className="rounded-full gap-2 h-9 px-4 text-sm font-medium border-purple-200 text-purple-700 hover:bg-purple-50">
                                    <Sparkles className="w-4 h-4" /> Enhance
                                </Button>

                                <div className="relative group">
                                    <div
                                        onClick={() => window.open(`/${username}`, '_blank')}
                                        className="bg-gray-100 hover:bg-gray-200 transition-colors rounded-full px-4 py-2 text-sm text-gray-600 pr-10 border border-gray-200 cursor-pointer"
                                    >
                                        tap2.me/{username}
                                    </div>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="absolute right-1 top-1 h-7 w-7 rounded-full hover:bg-gray-300"
                                        onClick={copyProfileLink}
                                    >
                                        <Copy className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Add Link Button */}
                        <Button
                            onClick={addLink}
                            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-2xl h-14 text-base font-semibold mb-8 shadow-lg shadow-purple-200/50 transition-all hover:scale-[1.01] active:scale-[0.99] gap-2"
                        >
                            <Plus className="w-5 h-5" /> Add New Link
                        </Button>

                        {/* Links List with Drag and Drop */}
                        <div className="space-y-4 pb-20">
                            {links.length === 0 && (
                                <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-dashed border-gray-200">
                                    <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <Link2 className="w-8 h-8 text-purple-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">No links yet</h3>
                                    <p className="text-gray-500 text-sm mb-6">Add your first link to get started</p>
                                    <Button onClick={addLink} variant="outline" className="rounded-full gap-2">
                                        <Plus className="w-4 h-4" /> Add your first link
                                    </Button>
                                </div>
                            )}

                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={links.map(l => l.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    {links.map(link => (
                                        <SortableLinkCard
                                            key={link.id}
                                            link={link}
                                            onUpdate={updateLink}
                                            onDelete={deleteLink}
                                        />
                                    ))}
                                </SortableContext>
                            </DndContext>
                        </div>
                    </div>
                </div>

                {/* Phone Preview - Right Side */}
                <div className="w-[400px] border-l border-gray-100 hidden xl:flex items-center justify-center bg-gradient-to-b from-gray-50 to-white relative p-8">
                    <div className="sticky top-8">
                        {/* Phone Frame */}
                        <div className="w-[300px] h-[620px] bg-black rounded-[3rem] border-8 border-gray-900 shadow-2xl overflow-hidden relative">
                            {/* Notch */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-b-2xl z-20" />

                            {/* Status Bar */}
                            <div className="h-8 w-full bg-[#132c25] flex items-center justify-between px-8 text-[10px] text-white font-medium pt-1">
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
                            <div className="h-full w-full bg-[#132c25] overflow-y-auto text-white p-6 pb-20">
                                {/* Share Button */}
                                <div className="absolute top-12 right-6 w-8 h-8 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                                    <ExternalLink className="w-4 h-4 text-white/70" />
                                </div>

                                <div className="flex flex-col items-center mt-8 space-y-3">
                                    <Avatar className="w-24 h-24 border-4 border-white/20 shadow-xl">
                                        <AvatarImage src={user?.avatar} />
                                        <AvatarFallback className="bg-gray-400 text-white text-3xl font-bold">
                                            {userInitial}
                                        </AvatarFallback>
                                    </Avatar>
                                    <h2 className="text-xl font-bold tracking-tight">@{username}</h2>
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                                            <Instagram className="w-4 h-4" />
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                                            <Globe className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 space-y-3">
                                    {links.filter(l => l.isActive).map((link) => (
                                        <a
                                            key={link.id}
                                            href={link.url || '#'}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block w-full py-4 px-6 bg-[#e9f6e3] text-[#132c25] rounded-full text-center font-semibold hover:scale-[1.02] active:scale-[0.98] transition-transform text-sm shadow-lg"
                                        >
                                            {link.title}
                                        </a>
                                    ))}
                                    {links.filter(l => l.isActive).length === 0 && (
                                        <div className="text-center text-white/40 text-sm py-8">
                                            Add links to see them here
                                        </div>
                                    )}
                                </div>

                                {/* Footer */}
                                <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center gap-2 px-6">
                                    <button className="bg-white text-black px-5 py-2.5 rounded-full text-xs font-bold shadow-lg hover:shadow-xl transition-shadow">
                                        Join @{username} on Tap2
                                    </button>
                                    <div className="text-[10px] text-white/30">Powered by Tap2</div>
                                </div>
                            </div>
                        </div>

                        {/* Preview Label */}
                        <div className="text-center mt-6">
                            <div className="flex items-center justify-center gap-2 text-sm font-medium text-gray-600">
                                <Smartphone className="w-4 h-4" /> Live Preview
                            </div>
                            <p className="text-xs text-gray-400 mt-1">Changes sync in real-time</p>
                        </div>
                    </div>
                </div>
            </div>
        </LinktreeLayout>
    );
};

export default Dashboard;

