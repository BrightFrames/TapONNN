
import React, { useState, useEffect, useRef } from "react";
import LinktreeLayout from "@/layouts/LinktreeLayout";
import { templates } from "@/data/templates";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { UserCircle, Layout, Image as ImageIcon, Type, Sparkles, Monitor, Video, Youtube, Play, X, User, Pencil, Share2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { getIconForThumbnail } from "@/utils/socialIcons";
import { toast } from "sonner";
import axios from "axios";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

const Design = () => {
    const { user, selectedTheme, updateTheme, updateProfile, links: authLinks } = useAuth();
    const { t } = useTranslation();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
    const [isEditOpen, setIsEditOpen] = useState(false);

    // Local state for configuration
    const [config, setConfig] = useState<any>({
        headerLayout: 'classic',
        titleStyle: 'text',
        profileSize: 'medium',
        bgType: 'color',
        bgYoutubeUrl: '',
        coverType: 'none', // none | image | video | youtube
        coverUrl: '',
        coverYoutubeUrl: '',
        showShopOnPersonal: true, // Default to true
        ...user?.design_config
    });

    useEffect(() => {
        if (user?.design_config) {
            setConfig({
                headerLayout: 'classic',
                titleStyle: 'text',
                profileSize: 'medium',
                bgType: 'color',
                ...user.design_config
            });
        }
    }, [user?.design_config]);

    const handleConfigChange = (key: string, value: any) => {
        const newConfig = { ...config, [key]: value };
        setConfig(newConfig);
        // Auto-save removed in favor of manual save button
    };

    const handleSave = async () => {
        const toastId = toast.loading("Saving changes...");
        try {
            await updateProfile({
                design_config: config
            });
            toast.success("Changes saved successfully!", { id: toastId });
            setIsEditOpen(false);
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

        try {
            const res = await axios.post(`${API_URL}/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.success) {
                toast.success(`${type === 'image' ? 'Image' : 'Video'} uploaded successfully!`, { id: toastId });
                if (isCover) {
                    const newUrl = res.data.url;
                    // Update state directly + config
                    handleConfigChange('coverUrl', newUrl);
                    handleConfigChange('coverType', type);
                } else {
                    if (type === 'image') {
                        handleConfigChange('bgImageUrl', res.data.url);
                        handleConfigChange('bgType', 'image');
                    } else {
                        handleConfigChange('bgVideoUrl', res.data.url);
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

    const getYouTubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const handleYouTubeChange = (url: string) => {
        const id = getYouTubeId(url);
        handleConfigChange('bgYoutubeUrl', url);
        if (id) {
            handleConfigChange('bgType', 'youtube');
        }
    };

    // Preview Helpers
    const currentTemplate = templates.find(t => t.id === selectedTheme) || templates[0];

    // Determine background styles
    let bgStyle: any = {};
    const bgType = config.bgType || 'color';

    if (bgType === 'image' && config.bgImageUrl) {
        bgStyle = { backgroundImage: `url(${config.bgImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' };
    } else if (bgType === 'color' && config.bgColor) {
        bgStyle = { backgroundColor: config.bgColor };
    } else if (bgType === 'gradient' && config.bgGradient) {
        bgStyle = { background: config.bgGradient };
    } else if (bgType === 'video' || bgType === 'youtube') {
        bgStyle = { backgroundColor: 'black' };
    } else {
        if (currentTemplate.bgImage) {
            bgStyle = { backgroundImage: `url(${currentTemplate.bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' };
        }
    }

    // Fallback if no bgType but image exists
    if (!config.bgType && config.bgImageUrl) {
        bgStyle = { backgroundImage: `url(${config.bgImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' };
    }

    const getProfileSizeClass = () => {
        switch (config.profileSize) {
            case 'small': return 'w-16 h-16';
            case 'large': return 'w-32 h-32';
            default: return 'w-24 h-24';
        }
    };

    // The Preview Content (Card)
    const [isScrolled, setIsScrolled] = useState(false);

    const PreviewContent = () => (
        <div className="relative z-10 w-full max-w-[420px] mx-auto">
            {/* Profile Card Container - Glassmorphism */}
            <div className={cn(
                "backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 shadow-2xl rounded-[2.5rem] overflow-hidden transition-all duration-300",
                "flex flex-col min-h-[600px] max-h-[750px] relative" // Fixed height frame
            )}>
                {/* Share Button */}
                <button className="absolute top-6 right-6 z-50 p-2 rounded-full bg-black/20 text-white backdrop-blur-md hover:bg-black/40 transition-colors border border-white/10">
                    <Share2 className="w-5 h-5" />
                </button>

                {/* Inner Scrollable Area */}
                <div
                    className={cn(
                        "h-full w-full overflow-y-auto scrollbar-hide flex-1 relative scroll-smooth",
                        !config.bgType && currentTemplate.bgClass
                    )}
                    style={bgStyle}
                    onScroll={(e) => setIsScrolled(e.currentTarget.scrollTop > 60)}
                >

                    {currentTemplate.bgImage && !bgType && <div className="absolute inset-0 bg-black/20 pointer-events-none" />}

                    {/* Video/YouTube Background Rendering w/ Overlay */}
                    {(bgType === 'video' && config.bgVideoUrl) && (
                        <video src={config.bgVideoUrl} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover z-0" />
                    )}
                    {(bgType === 'youtube' && config.bgYoutubeUrl) && (
                        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                            <iframe
                                src={`https://www.youtube.com/embed/${getYouTubeId(config.bgYoutubeUrl)}?autoplay=1&mute=1&controls=0&loop=1&playlist=${getYouTubeId(config.bgYoutubeUrl)}&playsinline=1`}
                                className="absolute top-1/2 left-1/2 w-[300%] h-[300%] -translate-x-1/2 -translate-y-1/2 opacity-80"
                                allow="autoplay; encrypted-media"
                            />
                        </div>
                    )}

                    {/* COVER MEDIA SECTION */}
                    {config.coverType !== 'none' && (
                        <div className="w-full aspect-[2/1] sm:aspect-[3/1] relative overflow-hidden bg-black/10">
                            {config.coverType === 'image' && config.coverUrl && (
                                <img src={config.coverUrl} className="w-full h-full object-cover" alt="Cover" />
                            )}
                            {config.coverType === 'video' && config.coverUrl && (
                                <video src={config.coverUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                            )}
                            {config.coverType === 'youtube' && config.coverYoutubeUrl && (
                                <div className="absolute inset-0 pointer-events-none overflow-hidden bg-black">
                                    <iframe
                                        src={`https://www.youtube.com/embed/${getYouTubeId(config.coverYoutubeUrl)}?autoplay=1&mute=1&controls=0&loop=1&playlist=${getYouTubeId(config.coverYoutubeUrl)}&playsinline=1`}
                                        className="absolute top-1/2 left-1/2 w-[300%] h-[300%] -translate-x-1/2 -translate-y-1/2 opacity-90"
                                        allow="autoplay; encrypted-media"
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Content Overlay - Split Wrapper */}
                    <div className="relative z-10">

                        {/* Sticky Header Section (Profile Info) */}
                        <div className={cn(
                            "transition-all duration-500 ease-in-out px-8 w-full z-20",
                            isScrolled
                                ? "sticky top-0 bg-white/10 backdrop-blur-xl border-b border-white/10 flex flex-row items-center justify-start gap-4 py-3"
                                : cn("flex flex-col items-center", config.coverType !== 'none' ? "-mt-16" : "pt-16")
                        )}>
                            {/* Profile Picture */}
                            {config.titleStyle !== 'logo' && (
                                <div className={cn(
                                    "relative rounded-full overflow-hidden transition-all duration-500",
                                    isScrolled
                                        ? "w-10 h-10 border-2 border-white/20 mb-0 shadow-sm"
                                        : cn("mb-4 border-4 border-white/20 shadow-xl", getProfileSizeClass())
                                )}>
                                    {user?.avatar ? (
                                        <img src={user.avatar} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gray-400 flex items-center justify-center text-white font-bold text-lg">
                                            {(user?.name || "U")[0].toUpperCase()}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Name & Handle */}
                            <div className={cn(
                                "transition-all duration-500",
                                isScrolled ? "text-left" : "text-center mb-0"
                            )}>
                                <h2 className={cn(
                                    "font-bold tracking-tight transition-all",
                                    isScrolled ? "text-sm mb-0" : "text-2xl mb-1",
                                    currentTemplate.textColor === 'text-black' || config.textColor === '#000000' || config.textColor === '#111827' ? "text-gray-900" : "text-white"
                                )} style={{ color: config.textColor !== '#111827' ? config.textColor : undefined }}>
                                    {user?.name || user?.username}
                                </h2>
                                {!isScrolled && (
                                    <p className={cn(
                                        "text-sm font-medium opacity-80",
                                        currentTemplate.textColor === 'text-black' || config.textColor === '#000000' || config.textColor === '#111827' ? "text-gray-600" : "text-white/80"
                                    )} style={{ color: config.textColor !== '#111827' ? config.textColor : undefined }}>
                                        @{user?.username}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Scrollable Content Body (Links & Socials) */}
                        <div className={cn(
                            "w-full px-8 pb-16 transition-all duration-300",
                            isScrolled ? "pt-6" : "pt-8"
                        )}>
                            {/* Social Icons (Only show when not scrolled or move? Logic implies mostly keeping them in body) */}
                            <div className={cn(
                                "flex gap-4 flex-wrap mb-8 transition-all duration-500",
                                isScrolled ? "justify-start" : "justify-center"
                            )}>
                                {user?.social_links && Object.entries(user.social_links).map(([platform, url]) => {
                                    if (!url) return null;
                                    const Icon = getIconForThumbnail(platform);
                                    return Icon ? (
                                        <a key={platform} className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/30 backdrop-blur-sm text-white transition-all hover:scale-110">
                                            <Icon className="w-5 h-5" />
                                        </a>
                                    ) : null;
                                })}
                            </div>

                            {/* Links */}
                            <div className="space-y-4 w-full">
                                {authLinks.filter(l => l.isActive).map((link) => {
                                    const Icon = link.thumbnail ? getIconForThumbnail(link.thumbnail) : null;
                                    return (
                                        <a
                                            key={link.id}
                                            href={link.url || '#'}
                                            className={cn(
                                                "group block w-full flex items-center justify-center relative min-h-[56px] px-6 transition-all duration-300 hover:scale-[1.02]",
                                                currentTemplate.buttonStyle || "bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white hover:bg-white/20"
                                            )}
                                        >
                                            {Icon && (
                                                <Icon className="absolute left-6 w-5 h-5 opacity-90 transition-transform group-hover:rotate-12" />
                                            )}
                                            <span className="truncate max-w-[200px] text-sm font-medium">{link.title}</span>
                                        </a>
                                    );
                                })}
                            </div>

                            <div className="mt-12 flex justify-center">
                                <span className="text-[10px] opacity-60 text-white font-medium tracking-widest uppercase">TapX</span>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );

    // Configuration Sheet Content
    const ConfigurationContent = () => (
        <div className="space-y-8 pb-20">
            <Tabs defaultValue="theme" className="w-full">
                <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent justify-start mb-8 p-0 sticky top-0 bg-white dark:bg-zinc-950 z-20 py-4 border-b border-zinc-200 dark:border-zinc-800">
                    <TabsTrigger value="theme" className="data-[state=active]:bg-zinc-900 dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black rounded-full px-4 py-2 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all">
                        <Layout className="w-4 h-4 mr-2" /> {t('design.theme')}
                    </TabsTrigger>
                    <TabsTrigger value="cover" className="data-[state=active]:bg-zinc-900 dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black rounded-full px-4 py-2 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all">
                        <ImageIcon className="w-4 h-4 mr-2" /> Cover
                    </TabsTrigger>
                    <TabsTrigger value="header" className="data-[state=active]:bg-zinc-900 dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black rounded-full px-4 py-2 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all">
                        <UserCircle className="w-4 h-4 mr-2" /> {t('design.header')}
                    </TabsTrigger>
                    <TabsTrigger value="text" className="data-[state=active]:bg-zinc-900 dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black rounded-full px-4 py-2 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all">
                        <Type className="w-4 h-4 mr-2" /> {t('design.text')}
                    </TabsTrigger>
                    <TabsTrigger value="wallpaper" className="data-[state=active]:bg-zinc-900 dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black rounded-full px-4 py-2 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all">
                        <Monitor className="w-4 h-4 mr-2" /> {t('design.wallpaper')}
                    </TabsTrigger>
                </TabsList>

                {/* THEME TAB */}
                <TabsContent value="theme" className="space-y-6">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {templates.map((t) => (
                            <div key={t.id} onClick={() => updateTheme(t.id)} className="cursor-pointer group flex flex-col gap-2">
                                <div className={cn("relative w-full aspect-[4/5] rounded-2xl overflow-hidden shadow-sm transition-all", selectedTheme === t.id && "ring-4 ring-purple-600 ring-offset-2")}>
                                    <div className="absolute inset-0 w-full h-full bg-cover bg-center" style={t.bgImage ? { backgroundImage: `url(${t.bgImage})` } : { backgroundColor: t.id === 'blocks' ? '#7F00FF' : undefined }}>
                                        {!t.bgImage && <div className={`w-full h-full ${t.bgClass}`} />}
                                    </div>
                                    {selectedTheme === t.id && <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-20"><div className="bg-white rounded-full p-1.5"><div className="w-3 h-3 bg-purple-600 rounded-full" /></div></div>}
                                </div>
                                <span className="text-xs font-medium text-center">{t.name}</span>
                            </div>
                        ))}
                    </div>
                </TabsContent>

                {/* COVER TAB - Extracted from Header */}
                <TabsContent value="cover" className="space-y-6">
                    <div className="space-y-4">
                        <Label>Profile Cover</Label>
                        <Tabs value={config.coverType || 'none'} onValueChange={(v) => handleConfigChange('coverType', v)} className="w-full">
                            <TabsList className="w-full grid grid-cols-4 bg-zinc-100 dark:bg-zinc-800 p-1">
                                <TabsTrigger value="none" className="text-xs">None</TabsTrigger>
                                <TabsTrigger value="image"><ImageIcon className="w-4 h-4" /></TabsTrigger>
                                <TabsTrigger value="video"><Video className="w-4 h-4" /></TabsTrigger>
                                <TabsTrigger value="youtube"><Youtube className="w-4 h-4" /></TabsTrigger>
                            </TabsList>

                            <TabsContent value="image" className="pt-4">
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">Upload Cover Image</Label>
                                    <input type="file" id="cover-image-upload" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'image', true)} />
                                    <Button variant="outline" className="w-full h-20 border-dashed" onClick={() => document.getElementById('cover-image-upload')?.click()}>
                                        <div className="flex flex-col items-center text-zinc-500">
                                            {config.coverUrl ? <img src={config.coverUrl} className="h-12 w-full object-cover rounded opacity-50" /> : <ImageIcon className="w-6 h-6 mb-1" />}
                                            {!config.coverUrl && <span className="text-xs">Upload</span>}
                                        </div>
                                    </Button>
                                </div>
                            </TabsContent>

                            <TabsContent value="video" className="pt-4">
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">Upload Cover Video (Max 50MB)</Label>
                                    <Input type="file" accept="video/mp4,video/webm" onChange={(e) => handleFileUpload(e, 'video', true)} />
                                </div>
                            </TabsContent>

                            <TabsContent value="youtube" className="pt-4">
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">YouTube Cover URL</Label>
                                    <Input
                                        placeholder="https://youtube.com/watch?v=..."
                                        value={config.coverYoutubeUrl || ''}
                                        onChange={(e) => {
                                            const url = e.target.value;
                                            handleConfigChange('coverYoutubeUrl', url);
                                        }}
                                    />
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </TabsContent>

                {/* HEADER TAB - Layout & Shop Toggle */}
                <TabsContent value="header" className="space-y-10">

                    {/* Show Shop Toggle */}
                    {user?.is_store_identity && (
                        <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                            <div className="space-y-0.5">
                                <Label className="text-base font-semibold">Show Shop on Profile</Label>
                                <p className="text-xs text-zinc-500">Display the Shop tab on your personal profile</p>
                            </div>
                            <Switch
                                checked={config.showShopOnPersonal !== false}
                                onCheckedChange={(c) => handleConfigChange('showShopOnPersonal', c)}
                            />
                        </div>
                    )}

                    <div className="space-y-4">
                        <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Profile image layout</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <Button variant="outline" onClick={() => handleConfigChange('headerLayout', 'classic')} className={cn("h-auto p-4 border-2 rounded-xl flex flex-col items-center gap-2", config.headerLayout === 'classic' && "border-zinc-900 dark:border-white bg-zinc-50 dark:bg-zinc-900")}>
                                <div className="w-8 h-8 rounded-full border-2 border-current"></div>
                                <span className="text-sm font-medium">Classic</span>
                            </Button>
                            <Button variant="outline" onClick={() => handleConfigChange('headerLayout', 'hero')} className={cn("h-auto p-4 border-2 rounded-xl flex flex-col items-center gap-2", config.headerLayout === 'hero' && "border-zinc-900 dark:border-white bg-zinc-50 dark:bg-zinc-900")}>
                                <div className="w-full h-8 border-2 border-dashed border-current rounded-md"></div>
                                <span className="text-sm font-medium">Hero</span>
                            </Button>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">{t('design.size')}</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <Button variant="outline" onClick={() => handleConfigChange('profileSize', 'small')} className={cn("rounded-full", config.profileSize === 'small' && "border-black dark:border-white ring-1 ring-black")}>{t('design.small')}</Button>
                            <Button variant="outline" onClick={() => handleConfigChange('profileSize', 'large')} className={cn("rounded-full", config.profileSize === 'large' && "border-black dark:border-white ring-1 ring-black")}>{t('design.large')}</Button>
                        </div>
                    </div>
                </TabsContent>

                {/* TEXT TAB */}
                <TabsContent value="text" className="space-y-6">
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">{t('design.textColor')}</h3>
                        <div className="grid grid-cols-6 gap-3">
                            {['#111827', '#374151', '#6B7280', '#FFFFFF', '#7C3AED', '#059669'].map(color => (
                                <button key={color} onClick={() => handleConfigChange('textColor', color)} className={cn("w-10 h-10 rounded-xl border-2 flex items-center justify-center font-bold", config.textColor === color ? "border-purple-600" : "border-transparent bg-zinc-100 dark:bg-zinc-800")} style={{ color }}>A</button>
                            ))}
                        </div>
                    </div>
                </TabsContent>

                {/* WALLPAPER TAB */}
                <TabsContent value="wallpaper" className="space-y-6">
                    <div className="space-y-4">
                        <Label>Background Type</Label>
                        <Tabs value={config.bgType || 'color'} onValueChange={(v) => handleConfigChange('bgType', v)} className="w-full">
                            <TabsList className="w-full grid grid-cols-5">
                                <TabsTrigger value="color"><div className="w-4 h-4 bg-blue-500 rounded-full"></div></TabsTrigger>
                                <TabsTrigger value="gradient"><div className="w-4 h-4 bg-gradient-to-tr from-blue-400 to-purple-500 rounded-full"></div></TabsTrigger>
                                <TabsTrigger value="image"><ImageIcon className="w-4 h-4" /></TabsTrigger>
                                <TabsTrigger value="video"><Video className="w-4 h-4" /></TabsTrigger>
                                <TabsTrigger value="youtube"><Youtube className="w-4 h-4" /></TabsTrigger>
                            </TabsList>
                            {/* Inner content for each type */}
                            <TabsContent value="image" className="pt-4">
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'image')} />
                                <Button variant="outline" className="w-full h-24 border-dashed" onClick={() => fileInputRef.current?.click()}>
                                    <div className="flex flex-col items-center">
                                        <ImageIcon className="w-6 h-6 mb-2" />
                                        <span>Upload Image</span>
                                    </div>
                                </Button>
                            </TabsContent>
                            <TabsContent value="video" className="pt-4">
                                <Input type="file" accept="video/mp4,video/webm" onChange={(e) => handleFileUpload(e, 'video')} />
                            </TabsContent>
                            <TabsContent value="youtube" className="pt-4">
                                <Input placeholder="YouTube URL" value={config.bgYoutubeUrl || ''} onChange={(e) => handleYouTubeChange(e.target.value)} />
                            </TabsContent>
                            <TabsContent value="color" className="pt-4">
                                <div className="grid grid-cols-6 gap-2">
                                    {['#FFFFFF', '#F8FAFC', '#FEF3C7', '#DCFCE7', '#E0E7FF', '#FCE7F3', '#111827', '#1F2937', '#7C3AED', '#059669', '#DC2626', '#F59E0B'].map(color => (
                                        <button key={color} onClick={() => handleConfigChange('bgColor', color)} className="w-8 h-8 rounded-full border border-gray-200" style={{ backgroundColor: color }} />
                                    ))}
                                </div>
                            </TabsContent>
                            <TabsContent value="gradient" className="pt-4">
                                <div className="grid grid-cols-2 gap-2">
                                    {['linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'].map((grad, i) => (
                                        <button key={i} onClick={() => handleConfigChange('bgGradient', grad)} className="h-10 w-full rounded-md border border-gray-200" style={{ background: grad }} />
                                    ))}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );

    return (
        <LinktreeLayout>
            <div className="h-[calc(100vh-64px)] lg:h-screen w-full relative overflow-hidden bg-zinc-50/50 dark:bg-black flex items-center justify-center">

                {/* Background Blurs for Atmosphere */}
                <div className="absolute inset-0 z-0 opacity-30 dark:opacity-20 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-500/30 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/30 rounded-full blur-[120px]" />
                </div>

                {/* Top Right Action Button */}
                <div className="absolute top-6 right-6 z-40">
                    <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
                        <SheetTrigger asChild>
                            <Button size="lg" className="rounded-full shadow-lg gap-2 bg-white text-black hover:bg-zinc-100 dark:bg-white dark:text-black font-semibold px-6 transition-all hover:scale-105">
                                <Pencil className="w-4 h-4 text-purple-600" />
                                Edit Profile
                            </Button>
                        </SheetTrigger>
                        <SheetContent className="w-full sm:w-[500px] overflow-y-auto z-50 p-6 pt-12">
                            <SheetHeader className="mb-6">
                                <SheetTitle className="text-2xl font-bold">Edit Profile</SheetTitle>
                                <SheetDescription>
                                    Customize your profile appearance, theme, and layout.
                                </SheetDescription>
                            </SheetHeader>
                            <ConfigurationContent />
                            <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 mt-6 sticky bottom-0 bg-white dark:bg-zinc-950 pb-6 z-20">
                                <Button size="lg" className="w-full bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 rounded-xl font-bold h-12" onClick={handleSave}>
                                    Save Changes
                                </Button>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>

                {/* Main Preview Area */}
                <div className="relative z-10 w-full h-full max-w-4xl mx-auto flex items-center justify-center p-4 lg:p-10">
                    <PreviewContent />
                </div>

            </div>
        </LinktreeLayout>
    );
};

export default Design;
