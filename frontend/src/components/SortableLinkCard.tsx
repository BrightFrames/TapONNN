import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThumbnailSelector } from "@/components/ThumbnailSelector";
import {
    GripVertical,
    Image as ImageIcon,
    Trash2,
    PenLine,
    ExternalLink,
    Copy,
    MoreHorizontal,
    Eye,
    EyeOff,
    Link2,
    Archive,
    Star
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 1000 : 1,
    };

    const copyUrl = () => {
        navigator.clipboard.writeText(link.url);
    };

    const hasThumbnail = link.thumbnail && link.thumbnail.length > 0;

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`
                bg-white rounded-xl border shadow-sm overflow-hidden group
                transition-all duration-200 hover:shadow-md hover:border-gray-300
                ${!link.isActive ? 'opacity-60' : ''}
                ${isDragging ? 'shadow-lg ring-2 ring-purple-300' : ''}
                ${link.isFeatured ? 'ring-2 ring-amber-300 shadow-amber-100 shadow-lg' : ''}
                ${link.isArchived ? 'opacity-50 bg-gray-50' : ''}
            `}
        >
            <div className="flex items-center p-2 sm:p-3 gap-3">
                {/* Drag Handle */}
                <div
                    {...attributes}
                    {...listeners}
                    className="flex flex-col justify-center cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 transition-colors touch-none px-1"
                >
                    <GripVertical className="w-5 h-5" />
                </div>

                {/* Thumbnail */}
                <ThumbnailSelector
                    currentThumbnail={link.thumbnail}
                    onSelect={(val) => onUpdate(link.id, 'thumbnail', val)}
                >
                    <div className="relative group/thumb cursor-pointer flex-shrink-0">
                        {hasThumbnail ? (
                            <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden border border-gray-200">
                                <img src={link.thumbnail} alt="Thumbnail" className="w-full h-full object-cover" />
                            </div>
                        ) : (
                            <div className="w-12 h-12 rounded-lg bg-gray-100 text-gray-400 flex items-center justify-center border border-gray-200 hover:bg-gray-200 transition-colors">
                                <ImageIcon className="w-5 h-5" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center rounded-lg transition-opacity">
                            <PenLine className="w-4 h-4 text-white" />
                        </div>
                    </div>
                </ThumbnailSelector>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                        <Input
                            className="font-semibold text-sm h-7 px-1.5 border-transparent hover:border-gray-200 focus:border-purple-400 focus:ring-1 focus:ring-purple-400 bg-transparent w-full rounded transition-colors p-0"
                            value={link.title}
                            placeholder="Link Title"
                            onChange={(e) => onUpdate(link.id, 'title', e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Input
                            className="text-xs text-gray-500 h-6 px-1.5 border-transparent hover:border-gray-200 focus:border-purple-400 focus:ring-1 focus:ring-purple-400 bg-transparent w-full rounded transition-colors p-0"
                            value={link.url}
                            placeholder="https://..."
                            onChange={(e) => onUpdate(link.id, 'url', e.target.value)}
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
                    {/* Featured/Star Toggle */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onUpdate(link.id, 'isFeatured', !link.isFeatured)}
                        className={`h-8 w-8 rounded-full transition-all ${link.isFeatured ? 'text-amber-400 hover:bg-amber-50' : 'text-gray-300 hover:text-amber-400 hover:bg-gray-50'}`}
                        title="Toggle Featured"
                    >
                        <Star className={`w-5 h-5 ${link.isFeatured ? 'fill-amber-400' : ''}`} />
                    </Button>

                    <div className="h-6 w-px bg-gray-200 mx-1 hidden sm:block"></div>

                    {/* Visibility Toggle Group */}
                    <div className="flex items-center">
                        <Switch
                            checked={link.isActive}
                            onCheckedChange={(c) => onUpdate(link.id, 'isActive', c)}
                            className="data-[state=checked]:bg-green-500 scale-110 mr-1"
                            title={link.isActive ? "Hide Link" : "Show Link"}
                        />
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-gray-400 hover:text-gray-600 rounded-lg h-8 w-8"
                            >
                                <MoreHorizontal className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                            {onEdit && (
                                <DropdownMenuItem onClick={onEdit}>
                                    <PenLine className="w-4 h-4 mr-2" /> Edit Block
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={copyUrl}>
                                <Copy className="w-4 h-4 mr-2" /> Copy URL
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                                if (link.url) {
                                    let url = link.url;
                                    if (!/^https?:\/\//i.test(url)) {
                                        url = 'https://' + url;
                                    }
                                    window.open(url, '_blank');
                                }
                            }}>
                                <ExternalLink className="w-4 h-4 mr-2" /> Open link
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => onUpdate(link.id, 'isArchived', !link.isArchived)}
                                className="text-amber-600 focus:text-amber-600 focus:bg-amber-50"
                            >
                                <Archive className="w-4 h-4 mr-2" /> {link.isArchived ? 'Unarchive' : 'Archive'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                onClick={() => onDelete(link.id)}
                            >
                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Warning for invalid URL (Slimmer inline if possible, or just condensed) */}
            {link.url.length > 0 && link.url.length < 5 && (
                <div className="px-3 pb-2 text-amber-700 text-[10px] sm:text-xs">
                    ⚠️ Invalid URL
                </div>
            )}
        </div>
    );
};

export default SortableLinkCard;
