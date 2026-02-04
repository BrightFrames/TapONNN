import React, { useState, useEffect, useRef } from "react";
import LinktreeLayout from "@/layouts/LinktreeLayout";
import { templates } from "@/data/templates";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { UserCircle, Layout, Image as ImageIcon, Type, Monitor, Video, Youtube, Pencil } from "lucide-react";
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
import { supabase } from "@/lib/supabase";

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
            const token = session?.access_token || localStorage.getItem('token');
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
        ...user?.design_config
    });

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

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video', isCover = false) => {
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
        const token = session?.access_token || localStorage.getItem('token');

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
                <div className="w-[420px] border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black flex flex-col h-full overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                        <div className="mb-8">
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Design</h2>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">Customize your profile appearance</p>
                        </div>

                        <Tabs defaultValue="theme" className="w-full">
                            <TabsList className="w-full flex-wrap h-auto gap-2 bg-transparent justify-start mb-6 p-0">
                                <TabsTrigger value="theme" className="data-[state=active]:bg-zinc-900 dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black rounded-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all">
                                    Theme
                                </TabsTrigger>
                                <TabsTrigger value="cover" className="data-[state=active]:bg-zinc-900 dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black rounded-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all">
                                    Cover
                                </TabsTrigger>
                                <TabsTrigger value="header" className="data-[state=active]:bg-zinc-900 dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black rounded-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all">
                                    Header
                                </TabsTrigger>
                                <TabsTrigger value="text" className="data-[state=active]:bg-zinc-900 dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black rounded-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all">
                                    Text
                                </TabsTrigger>

                            </TabsList>

                            <TabsContent value="theme" className="space-y-6 mt-0">
                                <div className="grid grid-cols-2 gap-4">
                                    {templates.map((t) => (
                                        <div key={t.id} onClick={() => updateTheme(t.id)} className="cursor-pointer group flex flex-col gap-2">
                                            <div className={cn("relative w-full aspect-[4/5] rounded-2xl overflow-hidden shadow-sm transition-all border border-zinc-200 dark:border-zinc-800", selectedTheme === t.id && "ring-2 ring-zinc-900 dark:ring-white ring-offset-2 dark:ring-offset-black")}>
                                                <div className="absolute inset-0 w-full h-full bg-cover bg-center" style={t.bgImage ? { backgroundImage: `url(${t.bgImage})` } : { backgroundColor: t.id === 'blocks' ? '#7F00FF' : undefined }}>
                                                    {!t.bgImage && <div className={`w-full h-full ${t.bgClass}`} />}
                                                </div>
                                                {selectedTheme === t.id && (
                                                    <div className="absolute inset-0 bg-black/10 flex items-center justify-center z-20">
                                                        <div className="bg-white rounded-full p-1 shadow-md">
                                                            <div className="w-2 h-2 bg-zinc-900 rounded-full" />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <span className={cn("text-xs font-medium text-center", selectedTheme === t.id ? "text-zinc-900 dark:text-white" : "text-zinc-500")}>{t.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </TabsContent>

                            <TabsContent value="cover" className="space-y-6 mt-0">
                                <div className="space-y-4">
                                    <Label>Profile Cover</Label>
                                    <Tabs value={config.coverType || 'none'} onValueChange={(v) => handleConfigChange('coverType', v)} className="w-full">
                                        <TabsList className="w-full grid grid-cols-5 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-lg">
                                            <TabsTrigger value="none" className="text-xs rounded-md">None</TabsTrigger>
                                            <TabsTrigger value="color" className="rounded-md">Color</TabsTrigger>
                                            <TabsTrigger value="image" className="rounded-md"><ImageIcon className="w-4 h-4" /></TabsTrigger>
                                            <TabsTrigger value="video" className="rounded-md"><Video className="w-4 h-4" /></TabsTrigger>
                                            <TabsTrigger value="youtube" className="rounded-md"><Youtube className="w-4 h-4" /></TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="none" className="pt-4">
                                            <div className="text-center p-4 text-zinc-500 text-xs">
                                                Default gradient will be used if no cover is selected.
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="color" className="pt-4">
                                            <div className="space-y-2">
                                                <Label className="text-xs text-muted-foreground">Solid Color Background</Label>
                                                <div className="grid grid-cols-5 gap-2">
                                                    {['#000000', '#ffffff', '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#f43f5e', '#881337', '#78350f'].map((color) => (
                                                        <button
                                                            key={color}
                                                            onClick={() => {
                                                                handleConfigChange('coverUrl', '');
                                                                handleConfigChange('coverColor', color);
                                                                handleConfigChange('coverType', 'color');
                                                            }}
                                                            className={cn("w-full aspect-square rounded-lg border shadow-sm transition-transform active:scale-95", config.coverColor === color ? "ring-2 ring-zinc-900 dark:ring-white ring-offset-1" : "border-transparent")}
                                                            style={{ backgroundColor: color }}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="image" className="pt-4">
                                            <div className="space-y-2">
                                                <Label className="text-xs text-muted-foreground">Upload Cover Image</Label>
                                                <input type="file" id="cover-image-upload" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'image', true)} />
                                                <Button variant="outline" className="w-full h-24 border-dashed border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900" onClick={() => document.getElementById('cover-image-upload')?.click()}>
                                                    <div className="flex flex-col items-center text-zinc-500">
                                                        {config.coverUrl ? <img src={config.coverUrl} className="h-12 w-full object-cover rounded shadow-sm" /> : <ImageIcon className="w-6 h-6 mb-2" />}
                                                        <span className="text-xs font-medium">{config.coverUrl ? 'Change Image' : 'Click to Upload'}</span>
                                                    </div>
                                                </Button>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="video" className="pt-4">
                                            <div className="space-y-2">
                                                <Label className="text-xs text-muted-foreground">Upload Cover Video (Max 50MB)</Label>
                                                <Input type="file" accept="video/mp4,video/webm" onChange={(e) => handleFileUpload(e, 'video', true)} className="cursor-pointer" />
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="youtube" className="pt-4">
                                            <div className="space-y-2">
                                                <Label className="text-xs text-muted-foreground">YouTube Cover URL</Label>
                                                <Input
                                                    placeholder="https://youtube.com/watch?v=..."
                                                    value={config.coverYoutubeUrl || ''}
                                                    onChange={(e) => handleConfigChange('coverYoutubeUrl', e.target.value)}
                                                />
                                            </div>
                                        </TabsContent>
                                    </Tabs>
                                </div>
                            </TabsContent>

                            <TabsContent value="header" className="space-y-8 mt-0">
                                <div className="space-y-4">
                                    <Label className="text-xs uppercase tracking-wider text-zinc-500 font-bold">Profile Layout</Label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div onClick={() => handleConfigChange('headerLayout', 'classic')} className={cn("cursor-pointer p-4 border-2 rounded-xl flex flex-col items-center gap-3 transition-all", config.headerLayout === 'classic' ? "border-zinc-900 dark:border-white bg-zinc-50 dark:bg-zinc-900" : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700")}>
                                            <div className="w-12 h-12 rounded-full bg-zinc-200 dark:bg-zinc-800 border-2 border-zinc-300 dark:border-zinc-600"></div>
                                            <span className="text-xs font-medium">Classic</span>
                                        </div>
                                        <div onClick={() => handleConfigChange('headerLayout', 'hero')} className={cn("cursor-pointer p-4 border-2 rounded-xl flex flex-col items-center gap-3 transition-all", config.headerLayout === 'hero' ? "border-zinc-900 dark:border-white bg-zinc-50 dark:bg-zinc-900" : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700")}>
                                            <div className="w-full h-12 bg-zinc-200 dark:bg-zinc-800 border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-md"></div>
                                            <span className="text-xs font-medium">Hero</span>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="text" className="space-y-6 mt-0">
                                <div className="space-y-4">
                                    <Label className="text-xs uppercase tracking-wider text-zinc-500 font-bold">{t('design.textColor')}</Label>
                                    <div className="grid grid-cols-6 gap-3">
                                        {['#111827', '#374151', '#6B7280', '#FFFFFF', '#7C3AED', '#059669'].map(color => (
                                            <button
                                                key={color}
                                                onClick={() => handleConfigChange('textColor', color)}
                                                className={cn("w-10 h-10 rounded-xl border-2 flex items-center justify-center font-bold text-lg shadow-sm transition-transform active:scale-95", config.textColor === color ? "border-zinc-900 dark:border-white scale-110" : "border-transparent bg-zinc-100 dark:bg-zinc-800")}
                                                style={{ color: color === '#FFFFFF' ? '#000' : color, backgroundColor: color === '#FFFFFF' ? '#f3f4f6' : undefined }}
                                            >
                                                A
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </TabsContent>


                        </Tabs>
                    </div>

                    <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black z-10">
                        <Button size="lg" className="w-full bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 rounded-xl font-bold h-12 shadow-lg" onClick={handleSaveConfig}>
                            Save Changes
                        </Button>
                    </div>
                </div>
            </div>
        </LinktreeLayout>
    );
};

export default Design;
