import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Instagram,
    Facebook,
    Twitter,
    Linkedin,
    Youtube,
    Github,
    Globe,
    Music,
    MessageCircle,
    Send,
    Plus,
    X,
    Check,
    Pencil,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Available social platforms
const SOCIAL_PLATFORMS = [
    { key: 'instagram', label: 'Instagram', icon: Instagram, placeholder: 'https://instagram.com/username', color: 'from-pink-500 to-purple-500' },
    { key: 'twitter', label: 'Twitter / X', icon: Twitter, placeholder: 'https://twitter.com/username', color: 'from-sky-400 to-blue-500' },
    { key: 'facebook', label: 'Facebook', icon: Facebook, placeholder: 'https://facebook.com/username', color: 'from-blue-500 to-blue-600' },
    { key: 'linkedin', label: 'LinkedIn', icon: Linkedin, placeholder: 'https://linkedin.com/in/username', color: 'from-blue-600 to-blue-700' },
    { key: 'youtube', label: 'YouTube', icon: Youtube, placeholder: 'https://youtube.com/@channel', color: 'from-red-500 to-red-600' },
    { key: 'github', label: 'GitHub', icon: Github, placeholder: 'https://github.com/username', color: 'from-gray-600 to-gray-800' },
    { key: 'tiktok', label: 'TikTok', icon: Music, placeholder: 'https://tiktok.com/@username', color: 'from-black to-gray-800' },
    { key: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, placeholder: 'https://wa.me/1234567890', color: 'from-green-500 to-green-600' },
    { key: 'telegram', label: 'Telegram', icon: Send, placeholder: 'https://t.me/username', color: 'from-blue-400 to-blue-500' },
    { key: 'website', label: 'Website', icon: Globe, placeholder: 'https://yourwebsite.com', color: 'from-emerald-500 to-teal-500' },
];

interface SocialLinksEditorProps {
    socialLinks: Record<string, string>;
    onSave: (links: Record<string, string>) => Promise<void>;
}

const SocialLinksEditor = ({ socialLinks, onSave }: SocialLinksEditorProps) => {
    const [links, setLinks] = useState<Record<string, string>>(socialLinks || {});
    const [isOpen, setIsOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingKey, setEditingKey] = useState<string | null>(null);
    const [tempUrl, setTempUrl] = useState('');

    useEffect(() => {
        setLinks(socialLinks || {});
    }, [socialLinks]);

    const handleAddOrUpdate = (key: string, url: string) => {
        if (!url.trim()) {
            // Remove if empty
            const newLinks = { ...links };
            delete newLinks[key];
            setLinks(newLinks);
        } else {
            setLinks({ ...links, [key]: url.trim() });
        }
        setEditingKey(null);
        setTempUrl('');
    };

    const handleRemove = (key: string) => {
        const newLinks = { ...links };
        delete newLinks[key];
        setLinks(newLinks);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSave(links);
            toast.success("Social links saved!");
            setIsOpen(false);
        } catch (error) {
            toast.error("Failed to save social links");
        } finally {
            setIsSaving(false);
        }
    };

    const startEditing = (key: string) => {
        setEditingKey(key);
        setTempUrl(links[key] || '');
    };

    // Get active links (ones that have URLs)
    const activeLinks = Object.entries(links).filter(([_, url]) => url);
    const availablePlatforms = SOCIAL_PLATFORMS.filter(p => !links[p.key]);

    return (
        <div className="bg-white dark:bg-zinc-900/60 backdrop-blur-md rounded-2xl border border-gray-200 dark:border-zinc-800/60 p-5">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Social Links</h3>
                    <p className="text-sm text-gray-500 dark:text-zinc-500">Add your social media profiles</p>
                </div>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="rounded-full">
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800">
                        <DialogHeader>
                            <DialogTitle className="text-gray-900 dark:text-white">Edit Social Links</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 mt-4 max-h-[60vh] overflow-y-auto pr-2">
                            {/* Current Links */}
                            {SOCIAL_PLATFORMS.map((platform) => {
                                const hasLink = !!links[platform.key];
                                const isEditing = editingKey === platform.key;
                                const Icon = platform.icon;

                                return (
                                    <div key={platform.key} className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                                            hasLink 
                                                ? `bg-gradient-to-br ${platform.color} text-white` 
                                                : "bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-zinc-600"
                                        )}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{platform.label}</p>
                                            {isEditing ? (
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Input
                                                        type="url"
                                                        placeholder={platform.placeholder}
                                                        value={tempUrl}
                                                        onChange={(e) => setTempUrl(e.target.value)}
                                                        className="h-8 text-sm bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700"
                                                        autoFocus
                                                    />
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                                                        onClick={() => handleAddOrUpdate(platform.key, tempUrl)}
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-8 w-8 text-gray-400 hover:text-gray-600"
                                                        onClick={() => { setEditingKey(null); setTempUrl(''); }}
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            ) : hasLink ? (
                                                <p className="text-xs text-gray-500 dark:text-zinc-500 truncate">{links[platform.key]}</p>
                                            ) : (
                                                <p className="text-xs text-gray-400 dark:text-zinc-600">Not added</p>
                                            )}
                                        </div>

                                        {!isEditing && (
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 text-gray-400 hover:text-gray-600 dark:hover:text-white"
                                                    onClick={() => startEditing(platform.key)}
                                                >
                                                    {hasLink ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                                </Button>
                                                {hasLink && (
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                        onClick={() => handleRemove(platform.key)}
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Save Button */}
                        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-zinc-800">
                            <Button variant="outline" onClick={() => setIsOpen(false)}>
                                Cancel
                            </Button>
                            <Button 
                                onClick={handleSave} 
                                disabled={isSaving}
                                className="bg-green-600 hover:bg-green-700 text-white"
                            >
                                {isSaving ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Display Current Social Links */}
            {activeLinks.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                    {activeLinks.map(([key, url]) => {
                        const platform = SOCIAL_PLATFORMS.find(p => p.key === key);
                        if (!platform) return null;
                        const Icon = platform.icon;
                        return (
                            <a
                                key={key}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={cn(
                                    "flex items-center gap-2 px-3 py-2 rounded-xl text-white text-sm font-medium transition-all hover:scale-105 hover:shadow-lg",
                                    `bg-gradient-to-br ${platform.color}`
                                )}
                            >
                                <Icon className="w-4 h-4" />
                                {platform.label}
                            </a>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-6 bg-gray-50 dark:bg-zinc-800/50 rounded-xl border border-dashed border-gray-200 dark:border-zinc-700">
                    <p className="text-sm text-gray-500 dark:text-zinc-500">No social links added yet</p>
                    <Button 
                        variant="link" 
                        className="text-green-600 mt-1"
                        onClick={() => setIsOpen(true)}
                    >
                        Add your first social link
                    </Button>
                </div>
            )}
        </div>
    );
};

export default SocialLinksEditor;
