import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogContentBottomSheet,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Instagram,
    Facebook,
    Twitter,
    Linkedin,
    Youtube,
    Globe,
    Mail,
    Phone,
    Music,
    Plus,
    Trash2
} from "lucide-react";
import { toast } from "sonner";

interface SocialLinksDialogProps {
    initialLinks: Record<string, string>;
    onSave: (links: Record<string, string>) => Promise<void>;
    onLinksChange?: (links: Record<string, string>) => void;
    onOpenChange?: (open: boolean) => void;
    children: React.ReactNode;
}

const SOCIAL_PLATFORMS = [
    { id: 'instagram', icon: Instagram, label: 'Instagram', placeholder: 'instagram.com/username' },
    { id: 'facebook', icon: Facebook, label: 'Facebook', placeholder: 'facebook.com/username' },
    { id: 'twitter', icon: Twitter, label: 'Twitter / X', placeholder: 'twitter.com/username' },
    { id: 'linkedin', icon: Linkedin, label: 'LinkedIn', placeholder: 'linkedin.com/in/username' },
    { id: 'youtube', icon: Youtube, label: 'YouTube', placeholder: 'youtube.com/@channel' },
    { id: 'tiktok', icon: Music, label: 'TikTok', placeholder: 'tiktok.com/@username' },
    { id: 'email', icon: Mail, label: 'Email', placeholder: 'your@email.com' },
    { id: 'website', icon: Globe, label: 'Website / Portfolio', placeholder: 'https://yourwebsite.com' },
    { id: 'whatsapp', icon: Phone, label: 'WhatsApp', placeholder: 'wa.me/number' },
];

// Basic regex patterns for validation
const URL_PATTERNS: Record<string, RegExp> = {
    instagram: /instagram\.com/,
    facebook: /facebook\.com/,
    twitter: /(twitter\.com|x\.com)/,
    linkedin: /linkedin\.com/,
    youtube: /youtube\.com/,
    tiktok: /tiktok\.com/,
    email: /^[^@]+@[^@]+\.[^@]+$/,
    website: /^https?:\/\//, // Basic check for website
    whatsapp: /(wa\.me|whatsapp\.com)/
};

export const SocialLinksDialog = ({ initialLinks, onSave, onLinksChange, onOpenChange, children }: SocialLinksDialogProps) => {
    const [open, setOpen] = useState(false);
    const [links, setLinks] = useState<Record<string, string>>(initialLinks || {});
    const [errors, setErrors] = useState<Record<string, boolean>>({}); // Track errors
    const [loading, setLoading] = useState(false);
    const [selectedPlatform, setSelectedPlatform] = useState<string>("");

    // Notify parent of changes
    useEffect(() => {
        onLinksChange?.(links);
    }, [links, onLinksChange]);

    // Handle initialLinks updates (if user saves and re-opens) and open state changes
    useEffect(() => {
        if (open) {
            setLinks(initialLinks || {});
            setErrors({}); // Reset errors on open
        }
    }, [open, initialLinks]);

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
        onOpenChange?.(newOpen);
    }

    const validateUrl = (id: string, value: string) => {
        if (!value) return true; // Empty is valid (or removed)
        const pattern = URL_PATTERNS[id];
        if (pattern && !pattern.test(value)) {
            return false;
        }
        return true;
    };

    const handleChange = (id: string, value: string) => {
        setLinks(prev => ({ ...prev, [id]: value }));

        // Real-time validation
        const isValid = validateUrl(id, value);
        setErrors(prev => ({ ...prev, [id]: !isValid }));
    };

    const handleAddPlatform = () => {
        if (!selectedPlatform) return;
        setLinks(prev => ({ ...prev, [selectedPlatform]: "" }));
        setSelectedPlatform("");
    };

    const handleRemovePlatform = (id: string) => {
        const newLinks = { ...links };
        delete newLinks[id];
        setLinks(newLinks);
        // Clear error
        const newErrors = { ...errors };
        delete newErrors[id];
        setErrors(newErrors);
    };

    const handleSave = async () => {
        // Validate all before saving
        const newErrors: Record<string, boolean> = {};
        let hasError = false;

        for (const [id, value] of Object.entries(links)) {
            if (value && !validateUrl(id, value)) {
                newErrors[id] = true;
                hasError = true;
            }
        }

        if (hasError) {
            setErrors(newErrors);
            toast.error("Please fix the red flagged links before saving");
            return;
        }

        setLoading(true);
        try {
            await onSave(links);
            handleOpenChange(false);
            toast.success("Social links updated!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to save social links");
        } finally {
            setLoading(false);
        }
    };

    const availablePlatforms = SOCIAL_PLATFORMS.filter(p => !links.hasOwnProperty(p.id));
    const activePlatforms = SOCIAL_PLATFORMS.filter(p => links.hasOwnProperty(p.id));

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContentBottomSheet className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
                <DialogHeader className="pt-6 sm:pt-0">
                    <DialogTitle>Social Icons</DialogTitle>
                    <DialogDescription>
                        Add your social profiles to display them as icons at the top of your page.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                    {/* Active Links List */}
                    <div className="space-y-4">
                        {activePlatforms.map(({ id, icon: Icon, label, placeholder }) => (
                            <div key={id} className="flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                                <div className="w-10 h-10 mt-0.5 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 text-gray-600">
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <Input
                                        value={links[id] || ''}
                                        onChange={(e) => handleChange(id, e.target.value)}
                                        placeholder={placeholder}
                                        className={`h-10 ${errors[id] ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                                    />
                                    {errors[id] && (
                                        <p className="text-xs text-red-500 ml-1">
                                            Invalid URL
                                        </p>
                                    )}
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRemovePlatform(id)}
                                    className="text-gray-400 hover:text-red-500 shrink-0 mt-0.5"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                        {activePlatforms.length === 0 && (
                            <div className="text-center py-6 border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50">
                                <p className="text-sm text-gray-400">No social links added yet</p>
                            </div>
                        )}
                    </div>

                    {/* Add New Platform */}
                    {availablePlatforms.length > 0 && (
                        <div className="flex gap-2 pt-2 border-t border-gray-100">
                            <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                                <SelectTrigger className="flex-1">
                                    <SelectValue placeholder="Select platform to add..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {availablePlatforms.map(({ id, icon: Icon, label }) => (
                                        <SelectItem key={id} value={id}>
                                            <div className="flex items-center gap-2">
                                                <Icon className="w-4 h-4" />
                                                {label}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button onClick={handleAddPlatform} disabled={!selectedPlatform} variant="secondary">
                                <Plus className="w-4 h-4 mr-2" /> Add
                            </Button>
                        </div>
                    )}
                </div>
                <DialogFooter className="px-1 pb-6 sm:pb-4">
                    <Button variant="outline" onClick={() => handleOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSave} disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-white">
                        {loading ? "Saving..." : "Save Changes"}
                    </Button>
                </DialogFooter>
            </DialogContentBottomSheet>
        </Dialog>
    );
};
