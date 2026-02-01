
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
import { useTranslation } from "react-i18next";

const Design = () => {
    const { user, selectedTheme, updateTheme, updateProfile, links: authLinks } = useAuth();
    const { t } = useTranslation();

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
                            <h1 className="text-3xl font-bold tracking-tight text-gray-900">{t('design.title')}</h1>
                            <Button variant="outline" className="gap-2">
                                <Sparkles className="w-4 h-4" /> {t('design.enhance')}
                            </Button>
                        </div>

                        <Tabs defaultValue="header" className="w-full">
                            <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent justify-start mb-8 p-0">
                                <TabsTrigger value="header" className="data-[state=active]:bg-black data-[state=active]:text-white rounded-full px-4 py-2 border border-gray-200">
                                    <UserCircle className="w-4 h-4 mr-2" /> {t('design.header')}
                                </TabsTrigger>
                                <TabsTrigger value="theme" className="data-[state=active]:bg-black data-[state=active]:text-white rounded-full px-4 py-2 border border-gray-200">
                                    <Layout className="w-4 h-4 mr-2" /> {t('design.theme')}
                                </TabsTrigger>
                                <TabsTrigger value="wallpaper" className="data-[state=active]:bg-black data-[state=active]:text-white rounded-full px-4 py-2 border border-gray-200">
                                    <ImageIcon className="w-4 h-4 mr-2" /> {t('design.wallpaper')}
                                </TabsTrigger>
                                <TabsTrigger value="text" className="data-[state=active]:bg-black data-[state=active]:text-white rounded-full px-4 py-2 border border-gray-200">
                                    <Type className="w-4 h-4 mr-2" /> {t('design.text')}
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
                                        <Button className="ml-6 bg-black text-white hover:bg-gray-800 rounded-full px-6">+ {t('common.add')}</Button>
                                    </div>
                                </div>

                                {/* Layout Section */}
                                <div className="space-y-4">
                                    <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Profile image layout</h2>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Button
                                            variant="outline"
                                            onClick={() => handleConfigChange('headerLayout', 'classic')}
                                            className={`h-auto p-4 border-2 rounded-xl flex flex-col items-center gap-2 hover:border-gray-300 hover:bg-gray-50 transition-all ${config.headerLayout === 'classic' ? 'border-black bg-gray-50 ring-2 ring-black ring-offset-1' : 'border-gray-200 bg-white'}`}
                                        >
                                            <div className="w-full flex justify-center pb-2">
                                                <div className="w-8 h-8 rounded-full border-2 border-current"></div>
                                            </div>
                                            <span className="text-sm font-medium">Classic</span>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => handleConfigChange('headerLayout', 'hero')}
                                            className={`h-auto p-4 border-2 rounded-xl flex flex-col items-center gap-2 hover:border-gray-300 hover:bg-gray-50 transition-all ${config.headerLayout === 'hero' ? 'border-black bg-gray-50 ring-2 ring-black ring-offset-1' : 'border-gray-200 bg-white'}`}
                                        >
                                            <div className="w-full h-8 border-2 border-dashed border-current rounded-md flex items-center justify-center">
                                                <div className="w-4 h-4 rounded-full border-2 border-current"></div>
                                            </div>
                                            <span className="text-sm font-medium">Hero</span>
                                        </Button>
                                    </div>
                                </div>

                                {/* Title Style */}
                                <div className="space-y-4">
                                    <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Title style</h2>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Button
                                            variant="outline"
                                            onClick={() => handleConfigChange('titleStyle', 'text')}
                                            className={`h-auto p-6 border-2 rounded-xl flex flex-col items-center gap-2 hover:border-gray-300 hover:bg-gray-50 transition-all ${config.titleStyle === 'text' ? 'border-black bg-gray-50 ring-2 ring-black ring-offset-1' : 'border-gray-200 bg-white'}`}
                                        >
                                            <span className="font-serif text-xl">Aa</span>
                                            <span className="text-xs font-medium mt-1">Text</span>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => handleConfigChange('titleStyle', 'logo')}
                                            className={`h-auto p-6 border-2 rounded-xl flex flex-col items-center gap-2 hover:border-gray-300 hover:bg-gray-50 transition-all ${config.titleStyle === 'logo' ? 'border-black bg-gray-50 ring-2 ring-black ring-offset-1' : 'border-gray-200 bg-white'}`}
                                        >
                                            <ImageIcon className="w-6 h-6" />
                                            <span className="text-xs font-medium mt-1">{t('design.logo')}</span>
                                        </Button>
                                    </div>
                                </div>

                                {/* Size */}
                                <div className="space-y-4">
                                    <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">{t('design.size')}</h2>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Button
                                            variant="outline"
                                            onClick={() => handleConfigChange('profileSize', 'small')}
                                            className={`h-auto py-3 px-4 border-2 rounded-full font-medium text-sm transition-all hover:bg-gray-50 ${config.profileSize === 'small' ? 'border-black bg-gray-50 ring-2 ring-black ring-offset-1' : 'border-gray-200 bg-white'}`}
                                        >
                                            {t('design.small')}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => handleConfigChange('profileSize', 'large')}
                                            className={`h-auto py-3 px-4 border-2 rounded-full font-medium text-sm transition-all hover:bg-gray-50 ${config.profileSize === 'large' ? 'border-black bg-gray-50 ring-2 ring-black ring-offset-1' : 'border-gray-200 bg-white'}`}
                                        >
                                            {t('design.large')}
                                        </Button>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* THEME TAB */}
                            <TabsContent value="theme">
                                <div className="space-y-6">
                                    <h2 className="text-lg font-semibold">{t('design.themes')}</h2>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        <div
                                            className="aspect-[4/5] rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500 hover:border-gray-400 hover:bg-gray-50 cursor-pointer transition-colors"
                                        >
                                            <Sparkles className="w-6 h-6 mb-2" />
                                            <span className="text-xs font-medium">{t('common.custom')}</span>
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
                                <div className="space-y-8">
                                    <h2 className="text-lg font-semibold">Background</h2>

                                    {/* Solid Color */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Solid Color</h3>
                                        <div className="grid grid-cols-6 gap-3">
                                            {['#FFFFFF', '#F8FAFC', '#FEF3C7', '#DCFCE7', '#E0E7FF', '#FCE7F3', '#111827', '#1F2937', '#7C3AED', '#059669', '#DC2626', '#F59E0B'].map(color => (
                                                <Button
                                                    key={color}
                                                    variant="ghost"
                                                    onClick={() => handleConfigChange('bgColor', color)}
                                                    className={`w-10 h-10 rounded-xl border-2 p-0 transition-all hover:scale-110 ${config.bgColor === color ? 'ring-2 ring-purple-500 ring-offset-2' : 'border-gray-200'}`}
                                                    style={{ backgroundColor: color }}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Gradient Presets */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Gradient</h3>
                                        <div className="grid grid-cols-3 gap-3">
                                            {[
                                                'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                                'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                                                'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                                                'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                                                'linear-gradient(135deg, #30cfd0 0%, #330867 100%)'
                                            ].map((gradient, i) => (
                                                <Button
                                                    key={i}
                                                    variant="ghost"
                                                    onClick={() => handleConfigChange('bgGradient', gradient)}
                                                    className={`h-16 w-full rounded-xl border-2 p-0 transition-all hover:scale-105 ${config.bgGradient === gradient ? 'ring-2 ring-purple-500 ring-offset-2' : 'border-gray-200'}`}
                                                    style={{ background: gradient }}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Custom Image URL */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">{t('design.customImageUrl')}</h3>
                                        <input
                                            type="url"
                                            placeholder="https://example.com/image.jpg"
                                            value={config.bgImageUrl || ''}
                                            onChange={(e) => handleConfigChange('bgImageUrl', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="text">
                                <div className="space-y-8">
                                    <h2 className="text-lg font-semibold">Typography</h2>

                                    {/* Font Family */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Font Family</h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            {[
                                                { name: 'Inter', className: 'font-sans' },
                                                { name: 'Poppins', className: 'font-sans' },
                                                { name: 'Playfair Display', className: 'font-serif' },
                                                { name: 'Roboto Mono', className: 'font-mono' }
                                            ].map((font) => (
                                                <Button
                                                    key={font.name}
                                                    variant="outline"
                                                    onClick={() => handleConfigChange('fontFamily', font.name)}
                                                    className={`h-auto p-4 border-2 rounded-xl transition-all hover:border-gray-300 hover:bg-gray-50 flex flex-col items-center gap-1 ${config.fontFamily === font.name ? 'border-black bg-gray-50 ring-2 ring-black ring-offset-1' : 'border-gray-200 bg-white'}`}
                                                >
                                                    <span className={`text-xl ${font.className}`}>Aa</span>
                                                    <p className="text-xs mt-1 text-gray-600">{font.name}</p>
                                                </Button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Text Color */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">{t('design.textColor')}</h3>
                                        <div className="grid grid-cols-6 gap-3">
                                            {['#111827', '#374151', '#6B7280', '#FFFFFF', '#7C3AED', '#059669'].map(color => (
                                                <Button
                                                    key={color}
                                                    variant="ghost"
                                                    onClick={() => handleConfigChange('textColor', color)}
                                                    className={`w-10 h-10 rounded-xl border-2 p-0 transition-all hover:scale-110 flex items-center justify-center ${config.textColor === color ? 'ring-2 ring-purple-500 ring-offset-2' : 'border-gray-200'}`}
                                                    style={{ backgroundColor: color === '#FFFFFF' ? '#000' : '#FFF' }}
                                                >
                                                    <span style={{ color }} className="font-bold">A</span>
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
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
                                tap2.me/{user?.username}
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
