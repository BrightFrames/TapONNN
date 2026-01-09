import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GripVertical, Image as ImageIcon, Star, Lock, BarChart2, Trash2, PenLine, Share } from "lucide-react";

interface Link {
    id: string;
    title: string;
    url: string;
    isActive: boolean;
}

interface LinkCardProps {
    link: Link;
    onUpdate: (id: string, field: keyof Link, value: any) => void;
    onDelete: (id: string) => void;
}

const LinkCard = ({ link, onUpdate, onDelete }: LinkCardProps) => {
    return (
        <div className="bg-white rounded-[1.5rem] border border-gray-200 shadow-sm overflow-hidden group">
            <div className="flex">
                {/* Drag Handle */}
                <div className="w-10 flex items-center justify-center cursor-move text-gray-300 hover:text-gray-500 border-r border-transparent">
                    <GripVertical className="w-5 h-5" />
                </div>

                {/* Content */}
                <div className="flex-1 p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-2">
                                <Input
                                    className="font-bold text-lg border-transparent hover:border-gray-200 focus:border-gray-300 bg-transparent px-2 h-auto py-1 w-full max-w-[300px]"
                                    value={link.title}
                                    onChange={(e) => onUpdate(link.id, 'title', e.target.value)}
                                />
                                <PenLine className="w-4 h-4 text-gray-400" />
                            </div>
                            <div className="flex items-center gap-2">
                                <Input
                                    className="text-sm text-gray-600 border-transparent hover:border-gray-200 focus:border-gray-300 bg-transparent px-2 h-auto py-1 w-full"
                                    value={link.url}
                                    onChange={(e) => onUpdate(link.id, 'url', e.target.value)}
                                />
                                <PenLine className="w-4 h-4 text-gray-400" />
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" className="text-gray-400 scale-90">
                                <Share className="w-4 h-4" />
                            </Button>
                            <Switch
                                checked={link.isActive}
                                onCheckedChange={(c) => onUpdate(link.id, 'isActive', c)}
                                className="data-[state=checked]:bg-green-600"
                            />
                        </div>
                    </div>

                    {/* Bottom Toolbar */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-4">
                        <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="text-gray-500 hover:bg-gray-100 rounded-lg w-9 h-9">
                                <ImageIcon className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-gray-500 hover:bg-gray-100 rounded-lg w-9 h-9">
                                <Star className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-gray-500 hover:bg-gray-100 rounded-lg w-9 h-9">
                                <Lock className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-gray-500 hover:bg-gray-100 rounded-lg w-9 h-9">
                                <BarChart2 className="w-4 h-4" />
                                <span className="ml-1 text-xs">0 clicks</span>
                            </Button>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg w-9 h-9"
                            onClick={() => onDelete(link.id)}
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Warning / Suggestion Box */}
                    {link.url.length < 5 && (
                        <div className="mt-4 bg-yellow-50 text-yellow-800 text-xs px-4 py-3 rounded-lg flex gap-2 items-center">
                            <span>Enter a valid URL to publish this link.</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default LinkCard;
