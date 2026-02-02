
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    Link2
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
}

interface LinkCardProps {
    link: Link;
    onUpdate: (id: string, field: keyof Link, value: any) => void;
    onDelete: (id: string) => void;
}

const LinkCard = ({ link, onUpdate, onDelete }: LinkCardProps) => {
    const copyUrl = () => {
        navigator.clipboard.writeText(link.url);
    };

    return (
        <div className={`
            bg-white rounded-2xl border shadow-sm overflow-hidden group
            transition-all duration-200 hover:shadow-md hover:border-gray-300
            ${!link.isActive ? 'opacity-60' : ''}
        `}>
            <div className="flex">
                {/* Drag Handle */}
                <div className="w-12 flex items-center justify-center cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 hover:bg-gray-50 transition-colors border-r border-gray-100">
                    <GripVertical className="w-5 h-5" />
                </div>

                {/* Content */}
                <div className="flex-1 p-5">
                    <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 space-y-2">
                            {/* Title */}
                            <div className="flex items-center gap-2 group/title">
                                <Input
                                    className="font-semibold text-base border-transparent hover:border-gray-200 focus:border-purple-400 focus:ring-1 focus:ring-purple-400 bg-transparent px-2 h-9 w-full max-w-[280px] rounded-lg transition-colors"
                                    value={link.title}
                                    placeholder="Link title"
                                    onChange={(e) => onUpdate(link.id, 'title', e.target.value)}
                                />
                                <PenLine className="w-4 h-4 text-gray-300 opacity-0 group-hover/title:opacity-100 transition-opacity" />
                            </div>

                            {/* URL */}
                            <div className="flex items-center gap-2 group/url">
                                <div className="flex items-center gap-1.5 flex-1">
                                    <Link2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                    <Input
                                        className="text-sm text-gray-500 border-transparent hover:border-gray-200 focus:border-purple-400 focus:ring-1 focus:ring-purple-400 bg-transparent px-2 h-8 w-full rounded-lg transition-colors"
                                        value={link.url}
                                        placeholder="https://..."
                                        onChange={(e) => onUpdate(link.id, 'url', e.target.value)}
                                    />
                                </div>
                                <PenLine className="w-3.5 h-3.5 text-gray-300 opacity-0 group-hover/url:opacity-100 transition-opacity" />
                            </div>
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-gray-400 hover:text-gray-600 h-8 w-8"
                                onClick={copyUrl}
                            >
                                <Copy className="w-4 h-4" />
                            </Button>

                            <div className="flex items-center gap-2">
                                {link.isActive ? (
                                    <Eye className="w-4 h-4 text-green-500" />
                                ) : (
                                    <EyeOff className="w-4 h-4 text-gray-400" />
                                )}
                                <Switch
                                    checked={link.isActive}
                                    onCheckedChange={(c) => onUpdate(link.id, 'isActive', c)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Bottom Toolbar */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-4">
                        <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg h-8 px-2 gap-1.5 text-xs">
                                <ImageIcon className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Thumbnail</span>
                            </Button>
                            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg h-8 px-2 gap-1.5 text-xs">
                                <Star className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Highlight</span>
                            </Button>
                            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg h-8 px-2 gap-1.5 text-xs">
                                <Lock className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Lock</span>
                            </Button>

                            {/* Click Stats */}
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg ml-2">
                                <BarChart2 className="w-3.5 h-3.5 text-gray-500" />
                                <span className="text-xs font-medium text-gray-600">{link.clicks || 0} clicks</span>
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
                                <DropdownMenuItem>
                                    <ExternalLink className="w-4 h-4 mr-2" /> Open link
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
                        <div className="mt-4 bg-amber-50 text-amber-700 text-xs px-4 py-3 rounded-xl flex gap-2 items-center border border-amber-100">
                            <span className="font-medium">⚠️ Enter a valid URL to publish this link.</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default LinkCard;
