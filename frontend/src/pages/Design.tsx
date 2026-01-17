
import React, { useState, useEffect } from "react";
import LinktreeLayout from "@/layouts/LinktreeLayout";
import { templates } from "@/data/templates";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { UserCircle, Layout, Image as ImageIcon, Type, Sparkles, Monitor } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { getIconForThumbnail } from "@/utils/socialIcons";
import { toast } from "sonner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const Design = () => {
    const { user, selectedTheme, updateTheme, updateProfile, links: authLinks } = useAuth();

    // Local state for configuration to allow debounced updates (optional) or direct updates
    // For now, we sync directly with user.design_config
    const [config, setConfig] = useState<any>({
        headerLayout: 'classic', // classic | hero
        titleStyle: 'text', // text | logo
        profileSize: 'medium', // small | medium | large
        ...user?.design_config
    });

    useEffect(() => {
        if (user?.design_config) {
            setConfig({
                headerLayout: 'classic',
                titleStyle: 'text',
                profileSize: 'medium',
                ...user.design_config
            });
        }
    }, [user?.design_config]);

    const handleConfigChange = (key: string, value: any) => {
        const newConfig = { ...config, [key]: value };
        setConfig(newConfig);

        // Persist to backend
        updateProfile({
            design_config: newConfig
        });
    };

    // Preview Helpers
    const currentTemplate = templates.find(t => t.id === selectedTheme) || templates[0];
    const bgStyle = currentTemplate.bgImage
        ? { backgroundImage: `url(${currentTemplate.bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
        : {};

    const getProfileSizeClass = () => {
        switch (config.profileSize) {
            case 'small': return 'w-16 h-16';
            case 'large': return 'w-32 h-32';
            default: return 'w-24 h-24';
        }
    };

    return (
        <LinktreeLayout>
            <div className="flex flex-col lg:flex-row h-screen overflow-hidden bg-gray-50">

                {/* Left Panel - Settings */}
                <div className="flex-1 overflow-y-auto border-r border-gray-200 bg-white">
                    <div className="p-8 pb-32 max-w-2xl mx-auto">
                        <div className="flex items-center justify-between mb-8">
                            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Design</h1>
                            <Button variant="outline" className="gap-2">
                                <Sparkles className="w-4 h-4" /> Enhance
                            </Button>
                        </div>

                        <Tabs defaultValue="header" className="w-full">
                            <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent justify-start mb-8 p-0">
                                <TabsTrigger value="header" className="data-[state=active]:bg-black data-[state=active]:text-white rounded-full px-4 py-2 border border-gray-200">
                                    <UserCircle className="w-4 h-4 mr-2" /> Header
                                </TabsTrigger>
                                <TabsTrigger value="theme" className="data-[state=active]:bg-black data-[state=active]:text-white rounded-full px-4 py-2 border border-gray-200">
                                    <Layout className="w-4 h-4 mr-2" /> Theme
                                </TabsTrigger>
                                <TabsTrigger value="wallpaper" className="data-[state=active]:bg-black data-[state=active]:text-white rounded-full px-4 py-2 border border-gray-200">
                                    <ImageIcon className="w-4 h-4 mr-2" /> Wallpaper
                                </TabsTrigger>
                                <TabsTrigger value="text" className="data-[state=active]:bg-black data-[state=active]:text-white rounded-full px-4 py-2 border border-gray-200">
                                    <Type className="w-4 h-4 mr-2" /> Text
                                </TabsTrigger>
                            </TabsList>

                            {/* HEADER TAB */}
                            <TabsContent value="header" className="space-y-10">
                                {/* Profile Image Section */}
                                <div className="space-y-4">
                                    <h2 className="text-lg font-semibold">Header</h2>
                                    <div className="bg-gray-100 p-8 rounded-2xl flex items-center justify-center">
                                        {user?.avatar ? (
                                            <img src={user.avatar} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-sm" />
                                        ) : (
                                            <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center text-4xl text-gray-500 font-bold">
                                                {(user?.name || "U")[0].toUpperCase()}
                                            </div>
                                        )}
                                        <Button className="ml-6 bg-black text-white hover:bg-gray-800 rounded-full px-6">+ Add</Button>
                                    </div>
                                </div>

                                {/* Layout Section */}
                                <div className="space-y-4">
                                    <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Profile image layout</h2>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => handleConfigChange('headerLayout', 'classic')}
                                            className={`p-4 border-2 rounded-xl flex flex-col items-center gap-2 hover:border-gray-300 transition-all ${config.headerLayout === 'classic' ? 'border-black bg-gray-50' : 'border-gray-200 bg-white'}`}
                                        >
                                            <div className="w-full flex justify-center pb-2">
                                                <div className="w-8 h-8 rounded-full border-2 border-current"></div>
                                            </div>
                                            <span className="text-sm font-medium">Classic</span>
                                        </button>
                                        <button
                                            onClick={() => handleConfigChange('headerLayout', 'hero')}
                                            className={`p-4 border-2 rounded-xl flex flex-col items-center gap-2 hover:border-gray-300 transition-all ${config.headerLayout === 'hero' ? 'border-black bg-gray-50' : 'border-gray-200 bg-white'}`}
                                        >
                                            <div className="w-full h-8 border-2 border-dashed border-current rounded-md flex items-center justify-center">
                                                <div className="w-4 h-4 rounded-full border-2 border-current"></div>
                                            </div>
                                            <span className="text-sm font-medium">Hero</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Title Style */}
                                <div className="space-y-4">
                                    <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Title style</h2>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => handleConfigChange('titleStyle', 'text')}
                                            className={`p-6 border-2 rounded-xl flex flex-col items-center gap-2 hover:border-gray-300 transition-all ${config.titleStyle === 'text' ? 'border-black bg-gray-50' : 'border-gray-200 bg-white'}`}
                                        >
                                            <span className="font-serif text-xl">Aa</span>
                                            <span className="text-xs font-medium mt-1">Text</span>
                                        </button>
                                        <button
                                            onClick={() => handleConfigChange('titleStyle', 'logo')}
                                            className={`p-6 border-2 rounded-xl flex flex-col items-center gap-2 hover:border-gray-300 transition-all ${config.titleStyle === 'logo' ? 'border-black bg-gray-50' : 'border-gray-200 bg-white'}`}
                                        >
                                            <ImageIcon className="w-6 h-6" />
                                            <span className="text-xs font-medium mt-1">Logo</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Size */}
                                <div className="space-y-4">
                                    <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Size</h2>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => handleConfigChange('profileSize', 'small')}
                                            className={`py-3 px-4 border-2 rounded-full font-medium text-sm transition-all ${config.profileSize === 'small' ? 'border-black bg-gray-50' : 'border-gray-200 bg-white'}`}
                                        >
                                            Small
                                        </button>
                                        <button
                                            onClick={() => handleConfigChange('profileSize', 'large')}
                                            className={`py-3 px-4 border-2 rounded-full font-medium text-sm transition-all ${config.profileSize === 'large' ? 'border-black bg-gray-50' : 'border-gray-200 bg-white'}`}
                                        >
                                            Large
                                        </button>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* THEME TAB */}
                            <TabsContent value="theme">
                                <div className="space-y-6">
                                    <h2 className="text-lg font-semibold">Themes</h2>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        <div
                                            className="aspect-[4/5] rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500 hover:border-gray-400 hover:bg-gray-50 cursor-pointer transition-colors"
                                        >
                                            <Sparkles className="w-6 h-6 mb-2" />
                                            <span className="text-xs font-medium">Custom</span>
                                        </div>

                                        {templates.map((t) => (
                                            <div
                                                key={t.id}
                                                onClick={() => updateTheme(t.id)}
                                                className={`cursor-pointer group flex flex-col gap-2`}
                                            >
                                                <div className={`relative w-full aspect-[4/5] rounded-2xl overflow-hidden shadow-sm transition-all ${selectedTheme === t.id ? 'ring-4 ring-purple-600 ring-offset-2' : ''}`}>
                                                    <div
                                                        className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                                                        style={t.bgImage ? { backgroundImage: `url(${t.bgImage})` } : { backgroundColor: t.id === 'blocks' ? '#7F00FF' : undefined }}
                                                    >
                                                        {!t.bgImage && (
                                                            <div className={`w-full h-full ${t.bgClass}`} />
                                                        )}
                                                    </div>

                                                    {/* "Aa" Text Overlay for Premium themes */}
                                                    {(t.id === 'aura' || t.id === 'bliss' || t.id === 'blocks' || t.id === 'bloom' || t.id === 'breeze' || t.id === 'encore' || t.id === 'grid' || t.id === 'groove' || t.id === 'haven' || t.id === 'lake' || t.id === 'mineral' || t.id === 'nourish') && (
                                                        <div className="absolute inset-0 flex flex-col p-4 justify-between">
                                                            <span className={`text-3xl font-serif ${t.textColor === 'text-white' ? 'text-white' : 'text-black/80'}`}>Aa</span>
                                                            {/* Mini Button Preview */}
                                                            <div className={`w-full h-8 rounded-lg opacity-80 ${t.buttonStyle?.includes('bg-') ? '' : 'bg-white/20'}`} style={{ background: t.buttonStyle?.match(/bg-\[([^\]]+)\]/)?.[1] }} />
                                                        </div>
                                                    )}

                                                    {/* Selection Check */}
                                                    {selectedTheme === t.id && (
                                                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-20">
                                                            <div className="bg-white rounded-full p-1.5">
                                                                <div className="w-3 h-3 bg-purple-600 rounded-full" />
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Premium Icon (mock) */}
                                                    {(t.id === 'aura' || t.id === 'bliss' || t.id === 'blocks' || t.id === 'grid') && (
                                                        <div className="absolute top-2 right-2 w-5 h-5 bg-black/30 backdrop-blur-sm p-1 rounded-full text-white flex items-center justify-center">
                                                            <Sparkles className="w-3 h-3" />
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="text-xs font-medium text-center text-gray-700">{t.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="wallpaper">
                                <div className="text-center py-10 text-gray-500">
                                    Custom wallpaper uploads coming soon.
                                </div>
                            </TabsContent>

                            <TabsContent value="text">
                                <div className="text-center py-10 text-gray-500">
                                    Font customization coming soon.
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>

                {/* Right Panel - Preview */}
                <div className="hidden lg:flex flex-1 bg-white items-center justify-center p-8 border-l border-gray-100">
                    <div className="sticky top-8">
                        <div className="flex items-center justify-center gap-2 mb-6 text-gray-500 text-sm">
                            <span className="bg-gray-100 px-3 py-1 rounded-full text-xs font-mono">
                                linktr.ee/{user?.username}
                            </span>
                            <Monitor className="w-4 h-4" />
                        </div>

                        {/* Phone Frame */}
                        <div className="w-[320px] h-[650px] bg-black rounded-[3rem] border-8 border-gray-900 shadow-2xl overflow-hidden relative">
                            {/* Content */}
                            <div
                                className={`h-full w-full overflow-y-auto ${currentTemplate.bgClass || 'bg-gray-100'} ${currentTemplate.textColor} scrollbar-hide`}
                                style={bgStyle}
                            >
                                {currentTemplate.bgImage && <div className="absolute inset-0 bg-black/20 pointer-events-none" />}

                                <div className="relative z-10 p-6 pt-16 min-h-full flex flex-col">

                                    {/* Configurable Header */}
                                    <div className={`flex flex-col items-center mb-8 ${config.headerLayout === 'hero' ? 'w-full bg-white/10 backdrop-blur-md rounded-2xl p-6' : ''}`}>

                                        {config.titleStyle !== 'logo' && (
                                            <div className={`mb-4 relative ${getProfileSizeClass()} rounded-full border-4 border-white/20 shadow-xl overflow-hidden`}>
                                                {user?.avatar ? (
                                                    <img src={user.avatar} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-gray-400 flex items-center justify-center text-white font-bold text-2xl">
                                                        {(user?.name || "U")[0].toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <h2 className="text-xl font-bold tracking-tight text-center">@{user?.username}</h2>

                                        {/* Social Icons (if any) */}
                                        <div className="flex gap-3 flex-wrap justify-center mt-4">
                                            {user?.social_links && Object.entries(user.social_links).map(([platform, url]) => {
                                                if (!url) return null;
                                                const Icon = getIconForThumbnail(platform);
                                                return Icon ? (
                                                    <a key={platform} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 backdrop-blur-sm">
                                                        <Icon className="w-4 h-4" />
                                                    </a>
                                                ) : null;
                                            })}
                                        </div>
                                    </div>

                                    {/* Links */}
                                    <div className="space-y-3 w-full">
                                        {authLinks.filter(l => l.isActive).map((link) => {
                                            const Icon = link.thumbnail ? getIconForThumbnail(link.thumbnail) : null;
                                            return (
                                                <a
                                                    key={link.id}
                                                    href={link.url || '#'}
                                                    target="_blank" // Disable for preview?
                                                    className={`block w-full flex items-center justify-center relative min-h-[50px] ${currentTemplate.buttonStyle}`}
                                                >
                                                    {Icon && (
                                                        <Icon className="absolute left-4 w-5 h-5 opacity-90" />
                                                    )}
                                                    <span className="truncate max-w-[200px] text-sm font-medium">{link.title}</span>
                                                </a>
                                            );
                                        })}
                                    </div>

                                    <div className="mt-auto pt-8 flex justify-center">
                                        <span className="text-[10px] opacity-60">Tap2</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </LinktreeLayout>
    );
};

export default Design;
