import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
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
    Image as ImageIcon
} from "lucide-react";

interface ThumbnailSelectorProps {
    currentThumbnail?: string;
    onSelect: (thumbnail: string) => void;
    children: React.ReactNode;
}

const SOCIAL_ICONS = [
    { id: 'instagram', icon: Instagram, label: 'Instagram' },
    { id: 'facebook', icon: Facebook, label: 'Facebook' },
    { id: 'twitter', icon: Twitter, label: 'Twitter' },
    { id: 'linkedin', icon: Linkedin, label: 'LinkedIn' },
    { id: 'youtube', icon: Youtube, label: 'YouTube' },
    { id: 'github', icon: Github, label: 'GitHub' },
    { id: 'tiktok', icon: Music, label: 'TikTok' }, // Proxy icon
    { id: 'globe', icon: Globe, label: 'Website' },
    { id: 'mail', icon: Mail, label: 'Email' },
    { id: 'phone', icon: Phone, label: 'Phone' },
    { id: 'music', icon: Music, label: 'Music' },
    { id: 'video', icon: Video, label: 'Video' },
    { id: 'store', icon: ShoppingBag, label: 'Store' },
    { id: 'location', icon: MapPin, label: 'Location' },
    { id: 'calendar', icon: Calendar, label: 'Event' },
];

export const ThumbnailSelector = ({ currentThumbnail, onSelect, children }: ThumbnailSelectorProps) => {
    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Choose Thumbnail</DialogTitle>
                </DialogHeader>
                <Tabs defaultValue="icons" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="icons">Icons</TabsTrigger>
                        <TabsTrigger value="upload" disabled>Upload (Pro)</TabsTrigger>
                    </TabsList>
                    <TabsContent value="icons" className="py-4">
                        <div className="grid grid-cols-4 gap-4">
                            {SOCIAL_ICONS.map(({ id, icon: Icon, label }) => (
                                <button
                                    key={id}
                                    onClick={() => onSelect(id)}
                                    className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl transition-all ${currentThumbnail === id ? 'bg-purple-100 text-purple-600 ring-2 ring-purple-500' : 'hover:bg-gray-100 text-gray-600'}`}
                                >
                                    <Icon className="w-6 h-6" />
                                    <span className="text-xs font-medium">{label}</span>
                                </button>
                            ))}
                        </div>
                    </TabsContent>
                    <TabsContent value="upload">
                        <div className="flex flex-col items-center justify-center py-8 text-center text-gray-500">
                            <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
                            <p>Custom uploads are coming soon!</p>
                        </div>
                    </TabsContent>
                </Tabs>
                <div className="flex justify-end">
                    <Button variant="ghost" onClick={() => onSelect('')} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                        Remove Thumbnail
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
