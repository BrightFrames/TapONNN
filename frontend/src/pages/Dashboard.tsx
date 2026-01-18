import { useState, useEffect } from "react";
import { toast } from "sonner";
import LinktreeLayout from "@/layouts/LinktreeLayout";
import SortableLinkCard from "@/components/SortableLinkCard";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { templates } from "@/data/templates";
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
    Trash2
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
}

const Dashboard = () => {
    const { user, links: authLinks, updateLinks, deleteLink: deleteLinkFromApi, selectedTheme, refreshProfile } = useAuth();
    const [links, setLinks] = useState<Link[]>(authLinks);
    const [isAddingLink, setIsAddingLink] = useState(false);

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

    // Get current template based on theme
    const currentTemplate = templates.find(t => t.id === selectedTheme) || templates[0];

    // Background style
    const bgStyle = currentTemplate.bgImage
        ? { backgroundImage: `url(${currentTemplate.bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
        : {};

    // Add a single new link - with debounce protection
    const handleAddLink = async () => {
        if (isAddingLink) return; // Prevent double-clicks
        setIsAddingLink(true);

        const newLink: Link = {
            id: `temp_${Date.now()}`,
            title: 'New Link',
            url: '',
            isActive: true,
            clicks: 0,
            position: 0,
            thumbnail: ''
        };

        // Add to local state immediately for responsive UI
        const newLinks = [newLink, ...links.map((l, i) => ({ ...l, position: i + 1 }))];
        setLinks(newLinks);

        // Sync to backend
        await updateLinks(newLinks);

        setIsAddingLink(false);
    };

    const updateLink = (id: string, field: keyof Link, value: any) => {
        let newLinks = links.map(l => {
            if (l.id === id) {
                const updatedLink = { ...l, [field]: value };

                // Auto-detect thumbnail from URL
                if (field === 'url' && !l.thumbnail && typeof value === 'string') {
                    const url = value.toLowerCase();
                    if (url.includes('instagram.com')) updatedLink.thumbnail = 'instagram';
                    else if (url.includes('facebook.com')) updatedLink.thumbnail = 'facebook';
                    else if (url.includes('twitter.com') || url.includes('x.com')) updatedLink.thumbnail = 'twitter';
                    else if (url.includes('linkedin.com')) updatedLink.thumbnail = 'linkedin';
                    else if (url.includes('youtube.com')) updatedLink.thumbnail = 'youtube';
                    else if (url.includes('github.com')) updatedLink.thumbnail = 'github';
                    else if (url.includes('tiktok.com')) updatedLink.thumbnail = 'tiktok';
                    else if (url.includes('mailto:')) updatedLink.thumbnail = 'mail';
                }

                return updatedLink;
            }
            return l;
        });
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

    const saveSocialLinks = async (updatedLinks: Record<string, string>) => {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (!token) return;

        try {
            await fetch(`${API_URL}/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ social_links: updatedLinks })
            });
            await refreshProfile();
        } catch (err) {
            console.error("Error saving socials:", err);
            toast.error("Failed to save social links");
        }
    };

    const handleClearAll = async () => {
        if (!confirm("Are you sure you want to delete ALL links? This action cannot be undone.")) return;

        // Delete all links sequentially
        for (const link of links) {
            if (link.id.length > 30) {
                // Determine if it's a real backend ID (long string) vs generated temporary ID
                await deleteLinkFromApi(link.id);
            }
        }
        setLinks([]);
    };

    return (
        <LinktreeLayout>
            <div className="flex h-full">
                {/* Main Editor */}
                <div className="flex-1 py-8 px-6 md:px-10 overflow-y-auto">
                    <div className="max-w-2xl mx-auto">



                        {/* Header */}
                        <div className="flex flex-col gap-4 mb-6">
                            {/* Title Row */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                <div>
                                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Links</h1>
                                    <p className="text-gray-500 text-xs sm:text-sm mt-1 hidden sm:block">Manage your profile links • Drag to reorder</p>
                                </div>

                                {/* Profile Link - Mobile responsive */}
                                <div className="relative group w-full sm:w-auto">
                                    <div
                                        onClick={() => window.open(`/${username}`, '_blank')}
                                        className="bg-gray-100 hover:bg-gray-200 transition-colors rounded-full px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-600 pr-10 border border-gray-200 cursor-pointer truncate"
                                    >
                                        tap2.me/{username}
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

                            {/* Action Buttons Row - Scrollable on mobile */}
                            <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2 -mx-2 px-2 sm:mx-0 sm:px-0 sm:overflow-visible">
                                <SocialLinksDialog initialLinks={user?.social_links || {}} onSave={saveSocialLinks}>
                                    <Button variant="outline" className="rounded-full gap-1.5 sm:gap-2 h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm font-medium border-purple-200 text-purple-700 hover:bg-purple-50 whitespace-nowrap flex-shrink-0">
                                        <Instagram className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Socials
                                    </Button>
                                </SocialLinksDialog>
                                <Button variant="outline" className="rounded-full gap-1.5 sm:gap-2 h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm font-medium border-purple-200 text-purple-700 hover:bg-purple-50 whitespace-nowrap flex-shrink-0">
                                    <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Enhance
                                </Button>
                            </div>
                        </div>

                        {/* Add Link Button & Clear All */}
                        <div className="flex gap-2 sm:gap-4 mb-6 sm:mb-8">
                            <Button
                                onClick={handleAddLink}
                                disabled={isAddingLink}
                                className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl sm:rounded-2xl h-11 sm:h-14 text-sm sm:text-base font-semibold shadow-lg shadow-purple-200/50 transition-all hover:scale-[1.01] active:scale-[0.99] gap-1.5 sm:gap-2"
                            >
                                <Plus className="w-4 h-4 sm:w-5 sm:h-5" /> Add New Link
                            </Button>
                            <Button
                                onClick={handleClearAll}
                                variant="outline"
                                className="h-11 sm:h-14 px-3 sm:px-6 rounded-xl sm:rounded-2xl border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 font-medium"
                            >
                                <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span className="hidden sm:inline ml-2">Clear All</span>
                            </Button>
                        </div>

                        {/* Links List with Drag and Drop */}
                        <div className="space-y-3 sm:space-y-4 pb-20">
                            {links.length === 0 && (
                                <div className="text-center py-10 sm:py-16 bg-gradient-to-br from-gray-50 to-white rounded-xl sm:rounded-2xl border-2 border-dashed border-gray-200 px-4">
                                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                                        <Link2 className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                                    </div>
                                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">No links yet</h3>
                                    <p className="text-gray-500 text-xs sm:text-sm mb-4 sm:mb-6">Add your first link to get started</p>
                                    <Button onClick={handleAddLink} disabled={isAddingLink} variant="outline" className="rounded-full gap-2 text-sm">
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
                                        {user?.social_links && Object.entries(user.social_links).map(([platform, url]) => {
                                            if (!url) return null;
                                            const Icon = getIconForThumbnail(platform);
                                            return Icon ? (
                                                <a
                                                    key={platform}
                                                    href={url.startsWith('http') ? url : `https://${url}`}
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
                                </div>

                                <div className="mt-8 space-y-3 relative z-10 w-full px-6">
                                    {links.filter(l => l.isActive).map((link) => {
                                        const Icon = link.thumbnail ? getIconForThumbnail(link.thumbnail) : null;
                                        return (
                                            <a
                                                key={link.id}
                                                href={link.url || '#'}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`block w-full flex items-center justify-center relative ${currentTemplate.buttonStyle}`}
                                            >
                                                {Icon && (
                                                    <Icon className="absolute left-4 w-5 h-5 opacity-90" />
                                                )}
                                                <span className="truncate max-w-[200px]">{link.title}</span>
                                            </a>
                                        );
                                    })}
                                    {links.filter(l => l.isActive).length === 0 && (
                                        <div className={`text-center text-sm py-8 ${currentTemplate.textColor} opacity-60`}>
                                            Add links to see them here
                                        </div>
                                    )}
                                </div>

                                {/* Footer */}
                                <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center gap-2 px-6 z-10">
                                    <button className="bg-white/10 backdrop-blur-md border border-white/20 text-current px-5 py-2.5 rounded-full text-xs font-bold shadow-lg hover:shadow-xl transition-shadow">
                                        Join @{username} on Tap2
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Preview Label */}
                        <div className="text-center mt-6">
                            <div className="flex items-center justify-center gap-2 text-sm font-medium text-gray-600">
                                <Smartphone className="w-4 h-4" /> Live Preview
                            </div>
                            <p className="text-xs text-gray-400 mt-1">Reflects your current theme</p>
                        </div>
                    </div>
                </div>
            </div>
        </LinktreeLayout >
    );
};

export default Dashboard;

