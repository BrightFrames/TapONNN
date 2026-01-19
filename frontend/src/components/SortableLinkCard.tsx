import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThumbnailSelector } from "@/components/ThumbnailSelector";
import {
    GripVertical,
    Image as ImageIcon,
    Star,
    Lock,
    BarChart2,
    Trash2,
    PenLine,
    ExternalLink,
    Copy,
    MoreHorizontal,
    Eye,
    EyeOff,
    Link2,
    Instagram,
    Facebook,
    Twitter,
    Linkedin,
    Youtube,
    Github,
    Globe,
    Mail,
    Phone,
    Music,
    Video,
    ShoppingBag,
    MapPin,
    Calendar,
    Sparkles,
    Clock,
    Archive,
    Zap
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
}

const iconMap: any = {
    instagram: Instagram,
    facebook: Facebook,
    twitter: Twitter,
    linkedin: Linkedin,
    youtube: Youtube,
    github: Github,
    tiktok: Music,
    globe: Globe,
    mail: Mail,
    phone: Phone,
    music: Music,
    video: Video,
    store: ShoppingBag,
    location: MapPin,
    calendar: Calendar
};

const SortableLinkCard = ({ link, onUpdate, onDelete }: SortableLinkCardProps) => {
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

    const ThumbnailIcon = link.thumbnail && iconMap[link.thumbnail] ? iconMap[link.thumbnail] : null;

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`
                bg-white rounded-xl sm:rounded-2xl border shadow-sm overflow-hidden group
                transition-all duration-200 hover:shadow-md hover:border-gray-300
                ${!link.isActive ? 'opacity-60' : ''}
                ${isDragging ? 'shadow-lg ring-2 ring-purple-300' : ''}
                ${link.isFeatured ? 'ring-2 ring-amber-300 shadow-amber-100 shadow-lg' : ''}
                ${link.isPriority ? 'ring-2 ring-purple-400 animate-pulse' : ''}
                ${link.isArchived ? 'opacity-50 bg-gray-50' : ''}
            `}
        >
            <div className="flex">
                {/* Drag Handle */}
                <div
                    {...attributes}
                    {...listeners}
                    className="w-8 sm:w-12 flex items-center justify-center cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 hover:bg-gray-50 transition-colors border-r border-gray-100 touch-none"
                >
                    <GripVertical className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>

                {/* Content */}
                <div className="flex-1 p-3 sm:p-5">
                    <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 space-y-2">
                            {/* Title with Thumbnail Preview */}
                            <div className="flex items-center gap-2 sm:gap-3 group/title">
                                {ThumbnailIcon ? (
                                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0">
                                        <ThumbnailIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    </div>
                                ) : (
                                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gray-100 text-gray-400 flex items-center justify-center flex-shrink-0">
                                        <Link2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    </div>
                                )}

                                <Input
                                    className="font-semibold text-sm sm:text-base border-transparent hover:border-gray-200 focus:border-purple-400 focus:ring-1 focus:ring-purple-400 bg-transparent px-1.5 sm:px-2 h-8 sm:h-9 w-full max-w-[180px] sm:max-w-[280px] rounded-lg transition-colors"
                                    value={link.title}
                                    placeholder="Link title"
                                    onChange={(e) => onUpdate(link.id, 'title', e.target.value)}
                                />
                                <PenLine className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-300 opacity-0 group-hover/title:opacity-100 transition-opacity hidden sm:block" />
                            </div>

                            {/* URL */}
                            <div className="flex items-center gap-2 group/url pl-9 sm:pl-11">
                                <div className="flex items-center gap-1.5 flex-1">
                                    <Input
                                        className="text-xs sm:text-sm text-gray-500 border-transparent hover:border-gray-200 focus:border-purple-400 focus:ring-1 focus:ring-purple-400 bg-transparent px-1.5 sm:px-2 h-7 sm:h-8 w-full rounded-lg transition-colors"
                                        value={link.url}
                                        placeholder="https://..."
                                        onChange={(e) => onUpdate(link.id, 'url', e.target.value)}
                                    />
                                </div>
                                <PenLine className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-300 opacity-0 group-hover/url:opacity-100 transition-opacity hidden sm:block" />
                            </div>
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-1.5 sm:gap-3">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-gray-400 hover:text-gray-600 h-7 w-7 sm:h-8 sm:w-8 hidden sm:flex"
                                onClick={copyUrl}
                            >
                                <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </Button>

                            <div className="flex items-center gap-1.5 sm:gap-2">
                                {link.isActive ? (
                                    <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500" />
                                ) : (
                                    <EyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
                                )}
                                <Switch
                                    checked={link.isActive}
                                    onCheckedChange={(c) => onUpdate(link.id, 'isActive', c)}
                                    className="data-[state=checked]:bg-green-500 scale-90 sm:scale-100"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Bottom Toolbar */}
                    <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-gray-100 mt-3 sm:mt-4">
                        <div className="flex items-center gap-0.5 sm:gap-1 overflow-x-auto">
                            <ThumbnailSelector
                                currentThumbnail={link.thumbnail}
                                onSelect={(val) => onUpdate(link.id, 'thumbnail', val)}
                            >
                                <Button variant="ghost" size="sm" className={`text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg h-7 sm:h-8 px-1.5 sm:px-2 gap-1 sm:gap-1.5 text-[10px] sm:text-xs ${link.thumbnail ? 'text-purple-600 bg-purple-50' : ''}`}>
                                    <ImageIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                    <span className="hidden sm:inline">Thumbnail</span>
                                </Button>
                            </ThumbnailSelector>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onUpdate(link.id, 'isFeatured', !link.isFeatured)}
                                className={`rounded-lg h-7 sm:h-8 px-1.5 sm:px-2 gap-1 sm:gap-1.5 text-[10px] sm:text-xs transition-all ${link.isFeatured ? 'text-amber-600 bg-amber-50 hover:bg-amber-100' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
                            >
                                <Sparkles className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${link.isFeatured ? 'fill-amber-400' : ''}`} />
                                <span className="hidden sm:inline">Featured</span>
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onUpdate(link.id, 'isPriority', !link.isPriority)}
                                className={`rounded-lg h-7 sm:h-8 px-1.5 sm:px-2 gap-1 sm:gap-1.5 text-[10px] sm:text-xs transition-all ${link.isPriority ? 'text-purple-600 bg-purple-50 hover:bg-purple-100' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
                            >
                                <Zap className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${link.isPriority ? 'fill-purple-400' : ''}`} />
                                <span className="hidden sm:inline">Priority</span>
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    const now = new Date().toISOString();
                                    if (link.scheduledStart) {
                                        onUpdate(link.id, 'scheduledStart', undefined);
                                        onUpdate(link.id, 'scheduledEnd', undefined);
                                    } else {
                                        onUpdate(link.id, 'scheduledStart', now);
                                    }
                                }}
                                className={`rounded-lg h-7 sm:h-8 px-1.5 sm:px-2 gap-1 sm:gap-1.5 text-[10px] sm:text-xs transition-all ${link.scheduledStart ? 'text-blue-600 bg-blue-50 hover:bg-blue-100' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
                            >
                                <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                <span className="hidden sm:inline">Schedule</span>
                            </Button>

                            {/* Click Stats */}
                            <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-gray-50 rounded-lg ml-1 sm:ml-2">
                                <BarChart2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-500" />
                                <span className="text-[10px] sm:text-xs font-medium text-gray-600">{link.clicks || 0}</span>
                                <span className="text-[10px] sm:text-xs font-medium text-gray-600 hidden sm:inline"> clicks</span>
                            </div>
                        </div>

                        {/* More Actions */}
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
                                <DropdownMenuItem onClick={copyUrl}>
                                    <Copy className="w-4 h-4 mr-2" /> Copy URL
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => link.url && window.open(link.url, '_blank')}>
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

                    {/* Warning for invalid URL */}
                    {link.url.length < 5 && (
                        <div className="mt-3 sm:mt-4 bg-amber-50 text-amber-700 text-[10px] sm:text-xs px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl flex gap-2 items-center border border-amber-100">
                            <span className="font-medium">⚠️ Enter a valid URL to publish this link.</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SortableLinkCard;
