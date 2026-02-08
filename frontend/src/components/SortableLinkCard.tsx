import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { ThumbnailSelector } from "@/components/ThumbnailSelector";
import { getIconForThumbnail } from "@/utils/socialIcons";
import {
    GripVertical,
    Trash2,
    PenLine,
    ExternalLink,
    Copy,
    MoreHorizontal,
    Archive,
    Star,
    Link2,
    BarChart2,
    MousePointerClick
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useState } from "react";

// Helper function to get favicon URL from a link
const getFaviconUrl = (url: string): string | null => {
    if (!url) return null;
    try {
        // Add protocol if missing
        let fullUrl = url;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            fullUrl = 'https://' + url;
        }
        const urlObj = new URL(fullUrl);
        const domain = urlObj.hostname;
        // Use Google's favicon service for reliable favicon fetching
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch {
        return null;
    }
};

// Favicon component with fallback
const Favicon = ({ url, fallback, className, style }: {
    url: string;
    fallback: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
}) => {
    const [error, setError] = useState(false);
    const faviconUrl = getFaviconUrl(url);

    if (error || !faviconUrl) {
        return <>{fallback}</>;
    }

    return (
        <img
            src={faviconUrl}
            alt=""
            className={className}
            style={style}
            onError={() => setError(true)}
        />
    );
};

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
    blockColor?: string;
}

interface SortableLinkCardProps {
    link: Link;
    onUpdate: (id: string, field: keyof Link, value: any) => void;
    onDelete: (id: string) => void;
    onEdit?: () => void;
    onDuplicate?: () => void;
}

const SortableLinkCard = ({ link, onUpdate, onDelete, onEdit, onDuplicate }: SortableLinkCardProps) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: link.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 1000 : 1,
    };

    const copyUrl = () => {
        navigator.clipboard.writeText(link.url);
        toast.success("Copied to clipboard");
    };

    const openLink = (e: React.MouseEvent) => {
        if (link.url) {
            // Prevent if clicking on interactive elements
            const target = e.target as HTMLElement;
            if (
                target.closest('button') || 
                target.closest('input') || 
                target.closest('[role="switch"]') ||
                target.closest('[role="menuitem"]')
            ) {
                return;
            }
            
            let url = link.url;
            if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
            window.open(url, '_blank');
        }
    };

    const ThumbnailIcon = link.thumbnail ? getIconForThumbnail(link.thumbnail) : null;

    return (
        <div
            ref={setNodeRef}
            style={style}
            onClick={openLink}
            title={link.url ? `Click to open: ${link.url}` : undefined}
            className={`
                group relative
                bg-white dark:bg-zinc-900/60 backdrop-blur-md rounded-[20px] overflow-hidden border border-gray-200 dark:border-zinc-800/60
                transition-all duration-300 ease-out hover:border-gray-300 dark:hover:border-zinc-700 shadow-sm hover:shadow-lg dark:hover:shadow-black/20
                ${link.url ? 'cursor-pointer hover:scale-[1.01] active:scale-[0.99]' : ''}
                ${isDragging
                    ? 'shadow-2xl shadow-black/10 dark:shadow-black/50 scale-[1.02] ring-2 ring-purple-500/20 dark:ring-white/10 z-50'
                    : ''
                }
                ${!link.isActive ? 'opacity-60 saturate-50' : ''}
            `}
        >
            <div className="flex items-stretch min-h-[88px]">
                {/* Drag Handle Area */}
                <div
                    {...attributes}
                    {...listeners}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center justify-center w-8 cursor-grab active:cursor-grabbing hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border-r border-transparent group-hover:border-gray-100 dark:group-hover:border-white/5"
                >
                    <GripVertical className="w-4 h-4 text-gray-400 dark:text-zinc-600 group-hover:text-gray-600 dark:group-hover:text-zinc-400 transition-colors" />
                </div>

                {/* Main Content */}
                <div className="flex-1 flex items-center gap-5 p-4 sm:p-5">
                    {/* Thumbnail */}
                    <ThumbnailSelector
                        currentThumbnail={link.thumbnail}
                        onSelect={(val) => onUpdate(link.id, 'thumbnail', val)}
                    >
                        <div className="relative cursor-pointer group/thumb flex-shrink-0">
                            <div className={`
                                w-[56px] h-[56px] rounded-2xl flex items-center justify-center overflow-hidden shadow-inner
                                ${ThumbnailIcon
                                    ? 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-zinc-800 dark:to-black border border-gray-200 dark:border-zinc-700'
                                    : link.thumbnail ? 'bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800' : 'bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-800'
                                }
                                transition-all duration-300 group-hover/thumb:scale-105 group-hover/thumb:border-gray-300 dark:group-hover/thumb:border-zinc-600
                            `}>
                                {ThumbnailIcon ? (
                                    <ThumbnailIcon className="w-7 h-7 text-gray-700 dark:text-white" />
                                ) : link.thumbnail ? (
                                    <img src={link.thumbnail} alt="" className="w-full h-full object-cover" />
                                ) : link.url ? (
                                    <Favicon
                                        url={link.url}
                                        className="w-7 h-7 object-contain"
                                        fallback={<Link2 className="w-6 h-6 text-gray-400 dark:text-zinc-600 group-hover/thumb:text-gray-600 dark:group-hover/thumb:text-zinc-400 transition-colors" />}
                                    />
                                ) : (
                                    <Link2 className="w-6 h-6 text-gray-400 dark:text-zinc-600 group-hover/thumb:text-gray-600 dark:group-hover/thumb:text-zinc-400 transition-colors" />
                                )}

                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                                    <PenLine className="w-4 h-4 text-white" />
                                </div>
                            </div>
                        </div>
                    </ThumbnailSelector>

                    {/* Text Content */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                        <div className="flex items-center gap-2">
                            <Input
                                type="text"
                                className="flex-1 font-bold text-[16px] text-gray-900 dark:text-white bg-transparent border-none p-0 h-auto focus-visible:ring-0 placeholder:text-gray-400 dark:placeholder:text-zinc-600 shadow-none hover:text-black dark:hover:text-white/90 transition-colors"
                                value={link.title}
                                placeholder="Title"
                                onChange={(e) => onUpdate(link.id, 'title', e.target.value)}
                            />
                            {link.blockColor && (
                                <div 
                                    className="w-4 h-4 rounded border border-gray-300 dark:border-zinc-600 shrink-0"
                                    style={{ backgroundColor: link.blockColor }}
                                    title={`Custom color: ${link.blockColor}`}
                                />
                            )}
                        </div>
                        <Input
                            type="text"
                            className="w-full text-[14px] text-gray-500 dark:text-zinc-400 bg-transparent border-none p-0 h-auto focus-visible:ring-0 placeholder:text-gray-400 dark:placeholder:text-zinc-700 shadow-none font-medium hover:text-gray-700 dark:hover:text-zinc-300 transition-colors"
                            value={link.url}
                            placeholder="URL"
                            onChange={(e) => onUpdate(link.id, 'url', e.target.value)}
                        />
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 border-l border-gray-100 dark:border-zinc-800/50">
                        {/* Stats - Only visible if clicks > 0 */}
                        {link.clicks !== undefined && link.clicks > 0 && (
                            <div className="hidden sm:flex flex-col items-end mr-2">
                                <div className="flex items-center gap-1 text-gray-800 dark:text-white font-bold text-sm">
                                    <span>{link.clicks}</span>
                                    <MousePointerClick className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-500" />
                                </div>
                                <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-medium">clicks</span>
                            </div>
                        )}

                        {/* External Link Button - Quick access to open link */}
                        {link.url && (
                            <Button
                                variant="ghost"
                                size="icon"
                                title="Open link"
                                onClick={() => {
                                    let url = link.url;
                                    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
                                    window.open(url, '_blank');
                                }}
                                className="w-9 h-9 rounded-xl text-gray-400 dark:text-zinc-600 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-400/10 transition-all duration-200"
                            >
                                <ExternalLink className="w-4 h-4" />
                            </Button>
                        )}

                        {/* Star Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            title={link.isFeatured ? "Featured" : "Feature this link"}
                            onClick={() => onUpdate(link.id, 'isFeatured', !link.isFeatured)}
                            className={`
                                w-9 h-9 rounded-xl transition-all duration-200
                                ${link.isFeatured
                                    ? 'text-amber-500 dark:text-amber-400 bg-amber-50 dark:bg-amber-400/10 hover:bg-amber-100 dark:hover:bg-amber-400/20'
                                    : 'text-gray-400 dark:text-zinc-600 hover:text-amber-500 dark:hover:text-amber-200 hover:bg-gray-50 dark:hover:bg-zinc-800'
                                }
                            `}
                        >
                            <Star className={`w-4 h-4 ${link.isFeatured ? 'fill-amber-500 dark:fill-amber-400' : ''}`} />
                        </Button>

                        {/* Toggle */}
                        <div title={link.isActive ? "Visible" : "Hidden"}>
                            <Switch
                                checked={link.isActive}
                                onCheckedChange={() => onUpdate(link.id, 'isActive', !link.isActive)}
                            />
                        </div>

                        {/* More Menu */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl text-gray-400 dark:text-zinc-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">
                                    <MoreHorizontal className="w-5 h-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" sideOffset={8} className="w-48 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-xl p-1.5 text-gray-700 dark:text-zinc-200">
                                {onEdit && (
                                    <DropdownMenuItem onClick={onEdit} className="rounded-lg text-[13px] py-2.5 px-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800 focus:bg-gray-100 dark:focus:bg-zinc-800">
                                        <PenLine className="w-4 h-4 mr-2.5 text-gray-400 dark:text-zinc-400" /> Edit Content
                                    </DropdownMenuItem>
                                )}
                                {onDuplicate && (
                                    <DropdownMenuItem onClick={onDuplicate} className="rounded-lg text-[13px] py-2.5 px-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800 focus:bg-gray-100 dark:focus:bg-zinc-800">
                                        <Copy className="w-4 h-4 mr-2.5 text-gray-400 dark:text-zinc-400" /> Duplicate
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                    onClick={() => {
                                        if (link.url) {
                                            let url = link.url;
                                            if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
                                            window.open(url, '_blank');
                                        }
                                    }}
                                    className="rounded-lg text-[13px] py-2.5 px-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800 focus:bg-gray-100 dark:focus:bg-zinc-800"
                                >
                                    <ExternalLink className="w-4 h-4 mr-2.5 text-gray-400 dark:text-zinc-400" /> Open Link
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="my-1 bg-gray-100 dark:bg-zinc-800" />
                                <DropdownMenuItem
                                    onClick={() => onUpdate(link.id, 'isArchived', !link.isArchived)}
                                    className="rounded-lg text-[13px] py-2.5 px-3 cursor-pointer text-amber-500 hover:bg-amber-500/10 focus:bg-amber-500/10 focus:text-amber-500"
                                >
                                    <Archive className="w-4 h-4 mr-2.5" /> Archive
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => onDelete(link.id)}
                                    className="rounded-lg text-[13px] py-2.5 px-3 cursor-pointer text-red-500 hover:bg-red-500/10 focus:bg-red-500/10 focus:text-red-500"
                                >
                                    <Trash2 className="w-4 h-4 mr-2.5" /> Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
            
            {/* Click to Open Indicator */}
            {link.url && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            )}
        </div>
    );
};

export default SortableLinkCard;
