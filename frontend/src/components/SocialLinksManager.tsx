import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
    Instagram,
    Twitter,
    Youtube,
    Linkedin,
    Github,
    Globe,
    Facebook,
    Mail,
    Plus,
    Trash2,
    GripVertical
} from "lucide-react";

interface SocialLink {
    id: string;
    platform: string;
    url: string;
}

interface SocialLinksManagerProps {
    socialLinks: SocialLink[];
    onUpdate: (links: SocialLink[]) => void;
}

const PLATFORMS = [
    { id: "instagram", name: "Instagram", icon: Instagram, placeholder: "https://instagram.com/username" },
    { id: "twitter", name: "Twitter/X", icon: Twitter, placeholder: "https://twitter.com/username" },
    { id: "youtube", name: "YouTube", icon: Youtube, placeholder: "https://youtube.com/@channel" },
    { id: "linkedin", name: "LinkedIn", icon: Linkedin, placeholder: "https://linkedin.com/in/username" },
    { id: "github", name: "GitHub", icon: Github, placeholder: "https://github.com/username" },
    { id: "facebook", name: "Facebook", icon: Facebook, placeholder: "https://facebook.com/username" },
    { id: "website", name: "Website", icon: Globe, placeholder: "https://yourwebsite.com" },
    { id: "email", name: "Email", icon: Mail, placeholder: "mailto:you@example.com" }
];

const SocialLinksManager = ({ socialLinks, onUpdate }: SocialLinksManagerProps) => {
    const [links, setLinks] = useState<SocialLink[]>(socialLinks);

    const addLink = () => {
        const newLink: SocialLink = {
            id: Date.now().toString(),
            platform: "instagram",
            url: ""
        };
        const newLinks = [...links, newLink];
        setLinks(newLinks);
    };

    const updateLink = (id: string, field: keyof SocialLink, value: string) => {
        const newLinks = links.map(link =>
            link.id === id ? { ...link, [field]: value } : link
        );
        setLinks(newLinks);
    };

    const removeLink = (id: string) => {
        const newLinks = links.filter(link => link.id !== id);
        setLinks(newLinks);
    };

    const saveLinks = () => {
        // Validate URLs
        const invalidLinks = links.filter(link => link.url && !link.url.startsWith('http') && !link.url.startsWith('mailto:'));
        if (invalidLinks.length > 0) {
            toast.error("Please enter valid URLs starting with https:// or mailto:");
            return;
        }

        onUpdate(links.filter(link => link.url.trim() !== ""));
        toast.success("Social links saved!");
    };

    const getPlatformIcon = (platformId: string) => {
        const platform = PLATFORMS.find(p => p.id === platformId);
        if (!platform) return Globe;
        return platform.icon;
    };

    const getPlatformPlaceholder = (platformId: string) => {
        const platform = PLATFORMS.find(p => p.id === platformId);
        return platform?.placeholder || "https://...";
    };

    return (
        <div className="space-y-4">
            {links.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
                    <div className="text-gray-500 mb-4">
                        <Globe className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No social links added yet</p>
                    </div>
                    <Button variant="outline" onClick={addLink} className="gap-2 rounded-xl">
                        <Plus className="w-4 h-4" />
                        Add Social Link
                    </Button>
                </div>
            ) : (
                <>
                    <div className="space-y-3">
                        {links.map((link, index) => {
                            const Icon = getPlatformIcon(link.platform);
                            return (
                                <div
                                    key={link.id}
                                    className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100"
                                >
                                    <div className="text-gray-400">
                                        <GripVertical className="w-5 h-5" />
                                    </div>

                                    <div className="flex items-center gap-2 w-32">
                                        <Icon className="w-5 h-5 text-gray-500" />
                                        <select
                                            value={link.platform}
                                            onChange={(e) => updateLink(link.id, 'platform', e.target.value)}
                                            className="text-sm border-0 bg-transparent focus:ring-0 cursor-pointer"
                                        >
                                            {PLATFORMS.map(p => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <Input
                                        value={link.url}
                                        onChange={(e) => updateLink(link.id, 'url', e.target.value)}
                                        placeholder={getPlatformPlaceholder(link.platform)}
                                        className="flex-1 rounded-lg border-gray-200"
                                    />

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeLink(link.id)}
                                        className="text-gray-400 hover:text-red-500 h-8 w-8"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={addLink}
                            className="gap-2 rounded-xl"
                        >
                            <Plus className="w-4 h-4" />
                            Add Another
                        </Button>
                        <Button
                            onClick={saveLinks}
                            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-xl"
                        >
                            Save Social Links
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
};

export default SocialLinksManager;
