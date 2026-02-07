import React, { useState, useEffect, useRef } from "react";
import LinktreeLayout from "@/layouts/LinktreeLayout";
import { templates } from "@/data/templates";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { UserCircle, Image as ImageIcon, Type, Monitor, Video, Youtube, Pencil, Heart, Link2, Music, Palette, ShoppingBag, Plus } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import axios from "axios";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import ProfilePreview from "@/components/dashboard/ProfilePreview";
import { getImageUrl } from "@/utils/imageUtils";
import { supabase } from "@/lib/supabase";
import FeatureCard from "@/components/FeatureCard";
import ColorSelector from "@/components/ColorSelector";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const Design = () => {
    const { user, selectedTheme, updateTheme, updateProfile, blocks, addBlock, refreshProfile } = useAuth();
    const { t } = useTranslation();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

    // UI States
    const [isConfigOpen, setIsConfigOpen] = useState(false);
    const [isAddingBlock, setIsAddingBlock] = useState(false);

    // Product Fetching for Preview
    const [products, setProducts] = useState<any[]>([]);
    useEffect(() => {
        const fetchProducts = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token || localStorage.getItem('auth_token') || localStorage.getItem('token');
            if (!token) return;
            try {
                const res = await fetch(`${API_URL}/products`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setProducts(data);
                }
            } catch (error) {
                console.error("Failed to fetch products", error);
            }
        };
        fetchProducts();
    }, []);

    // Configuration State
    const [config, setConfig] = useState<any>({
        headerLayout: 'classic',
        titleStyle: 'text',
        profileSize: 'medium',
        bgType: 'color',
        bgYoutubeUrl: '',
        coverType: 'none',
        coverUrl: '',
        coverColor: '',
        coverYoutubeUrl: '',
        cardBgType: 'color',
        ...user?.design_config
    });

    const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
    const [activeColorKey, setActiveColorKey] = useState<string | null>(null);

    // Sync config when selectedTheme changes
    useEffect(() => {
        const template = templates.find(t => t.id === selectedTheme);
        if (template) {
            // Helper to map Tailwind classes to CSS values
            const getCssFromClass = (cls: string, type: 'text' | 'bg') => {
                if (!cls) return type === 'text' ? '#000000' : '#ffffff';

                // Handle Hex directly
                if (cls.startsWith('#')) return cls;

                // Handle Text Colors (Simple mapping)
                if (type === 'text') {
                    if (cls.includes('white')) return '#ffffff';
                    if (cls.includes('black')) return '#000000';
                    if (cls.includes('zinc-900') || cls.includes('gray-900') || cls.includes('slate-900')) return '#18181b';
                    if (cls.includes('zinc-50') || cls.includes('gray-50') || cls.includes('slate-50')) return '#fafafa';
                    // Specific template overrides
                    if (cls.includes('text-[#')) {
                        const match = cls.match(/text-\[#([a-fA-F0-9]+)\]/);
                        if (match) return `#${match[1]}`;
                    }
                    return '#000000';
                }

                // Handle Backgrounds (Gradients & Solids)
                if (type === 'bg') {
                    // Check for arbitrary values first [bg-[#...]]
                    if (cls.includes('bg-[#')) {
                        const match = cls.match(/bg-\[#([a-fA-F0-9]+)\]/);
                        if (match && !cls.includes('gradient')) return `#${match[1]}`;
                    }

                    // Handle Gradients
                    if (cls.includes('bg-gradient')) {
                        let direction = 'to bottom';
                        if (cls.includes('to-r')) direction = 'to right';
                        if (cls.includes('to-br')) direction = '135deg';
                        if (cls.includes('to-bl')) direction = '225deg';

                        const fromMatch = cls.match(/from-\[#([a-fA-F0-9]+)\]/);
                        const viaMatch = cls.match(/via-\[#([a-fA-F0-9]+)\]/);
                        const toMatch = cls.match(/to-\[#([a-fA-F0-9]+)\]/);

                        if (fromMatch && toMatch) {
                            if (viaMatch) {
                                return `linear-gradient(${direction}, #${fromMatch[1]}, #${viaMatch[1]}, #${toMatch[1]})`;
                            }
                            return `linear-gradient(${direction}, #${fromMatch[1]}, #${toMatch[1]})`;
                        }

                        // Named color fallback for gradients (basic support)
                        if (cls.includes('from-purple-500') && cls.includes('to-pink-500')) return 'linear-gradient(135deg, #a855f7, #ec4899)';
                        if (cls.includes('from-blue-400') && cls.includes('to-teal-500')) return 'linear-gradient(to right, #60a5fa, #14b8a6)';
                    }

                    // Simple classes
                    if (cls.includes('white')) return '#ffffff';
                    if (cls.includes('black')) return '#000000';
                    if (cls.includes('zinc-900')) return '#18181b';
                    if (cls.includes('zinc-50')) return '#fafafa';
                }

                return type === 'text' ? '#000000' : '#ffffff';
            };

            setConfig(prev => ({
                ...prev,
                textColor: getCssFromClass(template.textColor, 'text'),
                backgroundColor: getCssFromClass(template.bgClass || '', 'bg'),
                coverUrl: template.bgImage || '',
                coverColor: '' // Reset cover color when changing themes
            }));
        }
    }, [selectedTheme]);

    useEffect(() => {
        if (user?.design_config) {
            setConfig(prev => ({ ...prev, ...user.design_config }));
        }
    }, [user?.design_config]);

    const handleConfigChange = (key: string, value: any) => {
        setConfig(prev => ({ ...prev, [key]: value }));
    };

    const handleSaveConfig = async () => {
        const toastId = toast.loading("Saving changes...");
        try {
            await updateProfile({ design_config: config });
            await refreshProfile(); // Refresh auth context to update live preview
            toast.success("Changes saved successfully!", { id: toastId });
            setIsConfigOpen(false);
            // Reload window to force refresh designs if needed, or rely on context update
        } catch (error) {
            console.error("Save error:", error);
            toast.error("Failed to save changes", { id: toastId });
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video', isCover = false, isCard = false) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (type === 'video' && file.size > 50 * 1024 * 1024) {
            toast.error("Video file is too large (max 50MB)");
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        const toastId = toast.loading(`Uploading ${type}...`);

        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token || localStorage.getItem('auth_token') || localStorage.getItem('token');

        try {
            const res = await axios.post(`${API_URL}/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                }
            });

            if (res.data.success) {
                toast.success(`${type === 'image' ? 'Image' : 'Video'} uploaded successfully!`, { id: toastId });
                const newUrl = res.data.url;
                if (isCover) {
                    handleConfigChange('coverUrl', newUrl);
                    handleConfigChange('coverType', type);
                } else if (isCard) {
                    handleConfigChange('cardImageUrl', newUrl);
                    handleConfigChange('cardBgType', 'image');
                } else {
                    if (type === 'image') {
                        handleConfigChange('bgImageUrl', newUrl);
                        handleConfigChange('bgType', 'image');
                    } else {
                        handleConfigChange('bgVideoUrl', newUrl);
                        handleConfigChange('bgType', 'video');
                    }
                }
            } else {
                toast.error("Upload failed", { id: toastId });
            }
        } catch (error) {
            console.error("Upload error:", error);
            toast.error(`Failed to upload ${type}`, { id: toastId });
        }
    };

    const handleYouTubeChange = (url: string) => {
        handleConfigChange('bgYoutubeUrl', url);
        // Simple validation could be added here
        if (url.includes('youtu')) {
            handleConfigChange('bgType', 'youtube');
        }
    };

    // Derived States
    const currentTemplate = templates.find(t => t.id === selectedTheme) || templates[0];

    return (
        <LinktreeLayout>
            <div className="flex h-full w-full bg-black min-h-screen font-sans overflow-hidden">
                {/* Center Panel - Profile Preview */}
                <div className="flex-1 flex flex-col items-center justify-center p-8 bg-black relative overflow-y-auto custom-scrollbar">
                    <div className="absolute top-6 left-8 flex items-center gap-2 text-zinc-500 text-sm">
                        <span className="text-zinc-600 font-semibold">Edit Profile</span>
                    </div>

                    <div className="absolute top-6 right-8 flex items-center gap-3">
                        <div className="bg-zinc-900 border border-zinc-800 rounded-full px-4 py-1.5 flex items-center gap-2 text-sm text-zinc-400">
                            <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"></span>
                            Your Bio Link
                            <span className="text-zinc-600">|</span>
                            <span className="text-zinc-300">tapx.bio/{user?.username}</span>
                        </div>
                    </div>

                    <ProfilePreview
                        blocks={blocks}
                        theme={config}
                        products={products}
                    />
                </div>

                {/* Right Panel - Design Tools */}
                <div className="w-[420px] border-l border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex flex-col h-full overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                        {/* Header */}
                        <div className="mb-6 pb-6 border-b border-zinc-200 dark:border-zinc-800">
                            <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">Design</h2>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Customize your profile appearance</p>
                        </div>

                        <div className="space-y-6">
                            {/* Cover Section */}
                            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                        <ImageIcon className="w-4 h-4 text-white" />
                                    </div>
                                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Cover Photo</h3>
                                </div>
                                <div className="space-y-4">
                                    <Tabs value={config.coverType || 'none'} onValueChange={(v) => handleConfigChange('coverType', v)} className="w-full">
                                        <TabsList className="w-full grid grid-cols-5 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
                                            <TabsTrigger value="none" className="text-xs rounded-lg">None</TabsTrigger>
                                            <TabsTrigger value="color" className="rounded-lg">Color</TabsTrigger>
                                            <TabsTrigger value="image" className="rounded-lg"><ImageIcon className="w-4 h-4" /></TabsTrigger>
                                            <TabsTrigger value="video" className="rounded-lg"><Video className="w-4 h-4" /></TabsTrigger>
                                            <TabsTrigger value="youtube" className="rounded-lg"><Youtube className="w-4 h-4" /></TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="none" className="pt-4">
                                            <div className="text-center p-4 text-zinc-500 text-xs bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                                                Default gradient will be used if no cover is selected.
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="color" className="pt-4">
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-5 gap-2">
                                                    {['#000000', '#ffffff', '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#f43f5e', '#881337', '#78350f'].map((color) => (
                                                        <button
                                                            key={color}
                                                            onClick={() => {
                                                                handleConfigChange('coverUrl', '');
                                                                handleConfigChange('coverColor', color);
                                                                handleConfigChange('coverType', 'color');
                                                            }}
                                                            className={cn("w-full aspect-square rounded-lg border-2 shadow-sm transition-all hover:scale-105", config.coverColor === color ? "border-zinc-900 dark:border-white scale-105" : "border-zinc-200 dark:border-zinc-700")}
                                                            style={{ backgroundColor: color }}
                                                        />
                                                    ))}
                                                </div>

                                                <ColorSelector 
                                                    color={config.coverColor || '#000000'} 
                                                    onChange={(c) => {
                                                        handleConfigChange('coverUrl', '');
                                                        handleConfigChange('coverColor', c);
                                                        handleConfigChange('coverType', 'color');
                                                    }}
                                                />
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="image" className="pt-4">
                                            <div className="space-y-2">
                                                <input type="file" id="cover-image-upload" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'image', true)} />
                                                <Button variant="outline" className="w-full h-28 border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl" onClick={() => document.getElementById('cover-image-upload')?.click()}>
                                                    <div className="flex flex-col items-center text-zinc-500">
                                                        {config.coverUrl ? <img src={getImageUrl(config.coverUrl)} className="h-16 w-full object-cover rounded-lg shadow-sm" /> : <ImageIcon className="w-8 h-8 mb-2" />}
                                                        <span className="text-xs font-medium">{config.coverUrl ? 'Change Image' : 'Upload Cover'}</span>
                                                    </div>
                                                </Button>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="video" className="pt-4">
                                            <div className="space-y-2">
                                                <Label className="text-xs text-zinc-500">Upload Video (Max 50MB)</Label>
                                                <Input type="file" accept="video/mp4,video/webm" onChange={(e) => handleFileUpload(e, 'video', true)} className="cursor-pointer rounded-xl" />
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="youtube" className="pt-4">
                                            <div className="space-y-2">
                                                <Label className="text-xs text-zinc-500">YouTube URL</Label>
                                                <Input
                                                    placeholder="https://youtube.com/watch?v=..."
                                                    value={config.coverYoutubeUrl || ''}
                                                    onChange={(e) => handleConfigChange('coverYoutubeUrl', e.target.value)}
                                                    className="rounded-xl"
                                                />
                                            </div>
                                        </TabsContent>
                                    </Tabs>
                                </div>
                            </div>

                            {/* Profile Card Section */}
                            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                                        <UserCircle className="w-4 h-4 text-white" />
                                    </div>
                                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Profile Card</h3>
                                </div>
                                
                                <Tabs defaultValue="color" className="w-full">
                                    <TabsList className="w-full grid grid-cols-2 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
                                        <TabsTrigger value="color" className="rounded-lg">Color</TabsTrigger>
                                        <TabsTrigger value="image" className="rounded-lg">Image</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="color" className="pt-4 space-y-4">
                                        <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                                            <Label className="text-xs font-semibold">Card Background</Label>
                                            <div 
                                                className="w-10 h-10 rounded-lg border-2 border-zinc-200 dark:border-zinc-700 shadow-sm"
                                                style={{ background: config.cardColor || '#FFFFFF' }}
                                            />
                                        </div>
                                        <ColorSelector 
                                            color={config.cardColor || '#FFFFFF'} 
                                            onChange={(c) => {
                                                handleConfigChange('cardColor', c);
                                                handleConfigChange('cardBgType', 'color');
                                            }}
                                        />
                                    </TabsContent>

                                    <TabsContent value="image" className="pt-4">
                                        <div className="space-y-2">
                                            <input type="file" id="card-image-upload" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'image', false, true)} />
                                            <Button variant="outline" className="w-full h-28 border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl" onClick={() => document.getElementById('card-image-upload')?.click()}>
                                                <div className="flex flex-col items-center text-zinc-500">
                                                    {config.cardImageUrl ? <img src={getImageUrl(config.cardImageUrl)} className="h-16 w-full object-cover rounded-lg shadow-sm" /> : <ImageIcon className="w-8 h-8 mb-2" />}
                                                    <span className="text-xs font-medium">{config.cardImageUrl ? 'Change Image' : 'Upload Image'}</span>
                                                </div>
                                            </Button>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </div>

                            {/* Text Color Section */}
                            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                                        <Type className="w-4 h-4 text-white" />
                                    </div>
                                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Text Color</h3>
                                </div>
                                
                                <div className="space-y-4">
                                    <div className="grid grid-cols-6 gap-2">
                                        {['#111827', '#374151', '#6B7280', '#FFFFFF', '#7C3AED', '#059669'].map(color => (
                                            <button
                                                key={color}
                                                onClick={() => handleConfigChange('textColor', color)}
                                                className={cn("w-full aspect-square rounded-lg border-2 flex items-center justify-center font-bold text-lg shadow-sm transition-all hover:scale-105", config.textColor === color ? "border-zinc-900 dark:border-white scale-105" : "border-zinc-200 dark:border-zinc-700")}
                                                style={{ color: color === '#FFFFFF' ? '#000' : color, backgroundColor: color === '#FFFFFF' ? '#f3f4f6' : 'transparent' }}
                                            >
                                                A
                                            </button>
                                        ))}
                                    </div>

                                    <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                                        <div className="flex items-center justify-between mb-3">
                                            <Label className="text-xs font-semibold">Custom Color</Label>
                                            <div 
                                                className="w-10 h-10 rounded-lg border-2 border-zinc-200 dark:border-zinc-700 shadow-sm"
                                                style={{ background: config.textColor || '#FFFFFF' }}
                                            />
                                        </div>
                                        <ColorSelector 
                                            color={config.textColor || '#FFFFFF'} 
                                            onChange={(c) => handleConfigChange('textColor', c)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                        <Button size="lg" className="w-full bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 rounded-xl font-bold h-12 shadow-lg hover:shadow-xl transition-all" onClick={handleSaveConfig}>
                            Save Changes
                        </Button>
                    </div>
                </div>
            </div>
        </LinktreeLayout>
    );
};

export default Design;
