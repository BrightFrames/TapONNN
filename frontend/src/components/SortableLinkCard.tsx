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
    BarChart2
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

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

interface SortableLinkCardProps {
    link: Link;
    onUpdate: (id: string, field: keyof Link, value: any) => void;
    onDelete: (id: string) => void;
    onEdit?: () => void;
}

const SortableLinkCard = ({ link, onUpdate, onDelete, onEdit }: SortableLinkCardProps) => {
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

    const ThumbnailIcon = link.thumbnail ? getIconForThumbnail(link.thumbnail) : null;

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`
                bg-zinc-900 rounded-[20px] overflow-hidden border border-zinc-800
                transition-all duration-200 ease-out
                ${isDragging
                    ? 'shadow-[0_20px_40px_rgba(0,0,0,0.4)] scale-[1.02]'
                    : 'shadow-[0_1px_3px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.5)] hover:border-zinc-700'
                }
                ${!link.isActive ? 'opacity-50' : ''}
            `}
        >
            <div className="flex items-stretch">
                {/* Drag Handle Area */}
                <div
                    {...attributes}
                    {...listeners}
                    className="flex items-center justify-center w-10 cursor-grab active:cursor-grabbing bg-transparent hover:bg-zinc-800 transition-colors"
                >
                    <GripVertical className="w-4 h-4 text-zinc-600" />
                </div>

                {/* Main Content */}
                <div className="flex-1 flex items-center gap-4 py-4 pr-4">
                    {/* Thumbnail */}
                    <ThumbnailSelector
                        currentThumbnail={link.thumbnail}
                        onSelect={(val) => onUpdate(link.id, 'thumbnail', val)}
                    >
                        <div className="relative cursor-pointer group/thumb flex-shrink-0">
                            <div className={`
                                w-[52px] h-[52px] rounded-xl flex items-center justify-center overflow-hidden
                                ${ThumbnailIcon
                                    ? 'bg-gradient-to-br from-zinc-800 to-zinc-700 text-purple-400'
                                    : link.thumbnail ? 'bg-zinc-800 border border-zinc-700' : 'bg-zinc-800 text-zinc-500'
                                }
                                group-hover/thumb:ring-2 group-hover/thumb:ring-purple-500/30
                                transition-all duration-150
                            `}>
                                {ThumbnailIcon ? (
                                    <ThumbnailIcon className="w-6 h-6" />
                                ) : link.thumbnail ? (
                                    <img src={link.thumbnail} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <Link2 className="w-5 h-5" />
                                )}
                            </div>
                        </div>
                    </ThumbnailSelector>

                    {/* Text Content */}
                    <div className="flex-1 min-w-0">
                        <input
                            type="text"
                            className="w-full font-semibold text-[15px] text-white bg-transparent border-0 p-0 focus:outline-none focus:ring-0 placeholder:text-zinc-600"
                            value={link.title}
                            placeholder="Title"
                            onChange={(e) => onUpdate(link.id, 'title', e.target.value)}
                        />
                        <input
                            type="text"
                            className="w-full text-[13px] text-zinc-400 bg-transparent border-0 p-0 mt-0.5 focus:outline-none focus:ring-0 placeholder:text-zinc-600"
                            value={link.url}
                            placeholder="URL"
                            onChange={(e) => onUpdate(link.id, 'url', e.target.value)}
                        />
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-1">
                        {/* Stats */}
                        {link.clicks !== undefined && link.clicks > 0 && (
                            <div className="flex items-center gap-1 text-zinc-500 text-xs mr-2">
                                <BarChart2 className="w-3.5 h-3.5" />
                                <span>{link.clicks}</span>
                            </div>
                        )}

                        {/* Star Button */}
                        <button
                            onClick={() => onUpdate(link.id, 'isFeatured', !link.isFeatured)}
                            className={`
                                w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150
                                ${link.isFeatured
                                    ? 'text-yellow-500 bg-yellow-500/10'
                                    : 'text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800'
                                }
                            `}
                        >
                            <Star className={`w-[18px] h-[18px] ${link.isFeatured ? 'fill-yellow-500' : ''}`} />
                        </button>

                        {/* Toggle */}
                        <Switch
                            checked={link.isActive}
                            onCheckedChange={() => onUpdate(link.id, 'isActive', !link.isActive)}
                            className="data-[state=checked]:bg-green-500"
                        />

                        {/* More Menu */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors">
                                    <MoreHorizontal className="w-5 h-5" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" sideOffset={8} className="w-40 rounded-xl shadow-lg border-gray-100 p-1">
                                {onEdit && (
                                    <DropdownMenuItem onClick={onEdit} className="rounded-lg text-[13px] py-2 cursor-pointer">
                                        <PenLine className="w-4 h-4 mr-2 text-gray-500" /> Edit
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={copyUrl} className="rounded-lg text-[13px] py-2 cursor-pointer">
                                    <Copy className="w-4 h-4 mr-2 text-gray-500" /> Copy
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => {
                                        if (link.url) {
                                            let url = link.url;
                                            if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
                                            window.open(url, '_blank');
                                        }
                                    }}
                                    className="rounded-lg text-[13px] py-2 cursor-pointer"
                                >
                                    <ExternalLink className="w-4 h-4 mr-2 text-gray-500" /> Open
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="my-1" />
                                <DropdownMenuItem
                                    onClick={() => onUpdate(link.id, 'isArchived', !link.isArchived)}
                                    className="rounded-lg text-[13px] py-2 cursor-pointer text-amber-600"
                                >
                                    <Archive className="w-4 h-4 mr-2" /> Archive
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => onDelete(link.id)}
                                    className="rounded-lg text-[13px] py-2 cursor-pointer text-red-600"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SortableLinkCard;
