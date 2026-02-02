import { useState, useMemo, useCallback } from "react";
import { toast } from "sonner";
import LinktreeLayout from "@/layouts/LinktreeLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
    appRegistry,
    APP_CATEGORIES,
    AppCategory,
    MarketplaceApp,
    getAppsByCategory,
    getCategoryCount,
    getRecommendedApps,
    searchApps,
    InstalledApp
} from "@/data/appRegistry";
import {
    Sparkles,
    Download,
    Check,
    ChevronRight,
    Zap,
    Clock,
    ExternalLink,
    Settings,
    Search,
    Crown,
    Star
} from "lucide-react";

const LinktreeMarketplace = () => {
    const [selectedCategory, setSelectedCategory] = useState<AppCategory>("All");
    const [installedApps, setInstalledApps] = useState<InstalledApp[]>([]);
    const [installing, setInstalling] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    // Get apps for current category - NEVER EMPTY
    const displayedApps = useMemo(() => {
        let apps: MarketplaceApp[];

        // If searching, use search function
        if (searchQuery.trim()) {
            apps = searchApps(searchQuery);
        } else {
            apps = getAppsByCategory(selectedCategory);
        }

        // Sort: Featured first, then active, then coming_soon
        return apps.sort((a, b) => {
            // Featured apps first
            if (a.category.includes("Featured") && !b.category.includes("Featured")) return -1;
            if (!a.category.includes("Featured") && b.category.includes("Featured")) return 1;
            // Premium apps second
            if (a.isPremium && !b.isPremium) return -1;
            if (!a.isPremium && b.isPremium) return 1;
            // Active before coming soon
            if (a.status === "active" && b.status === "coming_soon") return -1;
            if (a.status === "coming_soon" && b.status === "active") return 1;
            return 0;
        });
    }, [selectedCategory, searchQuery]);

    // Check if app is installed
    const isInstalled = useCallback((appId: string) => {
        return installedApps.some(a => a.appId === appId);
    }, [installedApps]);

    // Install app - INSTANT
    const handleInstall = useCallback(async (app: MarketplaceApp) => {
        if (app.status === "coming_soon") {
            toast.info(`${app.name} is coming soon! We'll notify you.`);
            return;
        }

        setInstalling(app.id);

        // Simulate instant install (in real app, this would call API)
        await new Promise(resolve => setTimeout(resolve, 300));

        const newInstalledApp: InstalledApp = {
            appId: app.id,
            isActive: true,
            position: installedApps.length,
            config: {},
            installedAt: new Date()
        };

        setInstalledApps(prev => [...prev, newInstalledApp]);
        setInstalling(null);

        toast.success(`${app.name} added to your profile!`, {
            description: app.rendersOnProfile ? "It's now visible on your public profile" : undefined,
            action: {
                label: "Configure",
                onClick: () => console.log("Open config for", app.id)
            }
        });
    }, [installedApps]);

    // Uninstall app
    const handleUninstall = useCallback((appId: string) => {
        setInstalledApps(prev => prev.filter(a => a.appId !== appId));
        toast.success("App removed from your profile");
    }, []);

    // Toggle app visibility
    const handleToggle = useCallback((appId: string) => {
        setInstalledApps(prev => prev.map(a =>
            a.appId === appId ? { ...a, isActive: !a.isActive } : a
        ));
    }, []);

    return (
        <LinktreeLayout>
            <div className="py-6 px-4 md:px-8 max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">App Marketplace</h1>
                                <p className="text-sm text-gray-500 dark:text-zinc-400">{appRegistry.length}+ apps to power up your profile</p>
                            </div>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-zinc-500" />
                        <Input
                            placeholder="Search apps..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-12 h-12 rounded-xl border-gray-200 dark:border-zinc-800 focus:border-purple-300 focus:ring-purple-200 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-600"
                        />
                        {searchQuery && (
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => setSearchQuery("")}
                                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-gray-400 hover:text-gray-600 dark:text-zinc-500 dark:hover:text-zinc-300 rounded-full"
                            >
                                <span className="sr-only">Clear search</span>
                                ✕
                            </Button>
                        )}
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Category Sidebar */}
                    <div className="lg:w-56 flex-shrink-0">
                        <div className="sticky top-4 space-y-2">
                            {APP_CATEGORIES.map((category) => {
                                const count = getCategoryCount(category);
                                const isActive = selectedCategory === category;

                                return (
                                    <Button
                                        key={category}
                                        variant="ghost"
                                        onClick={() => setSelectedCategory(category)}
                                        className={`
                                            w-full px-4 py-8 rounded-xl text-left font-medium
                                            transition-all duration-200 flex items-center justify-between h-auto
                                            ${isActive
                                                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-lg focus:ring-0 hover:bg-gray-800 dark:hover:bg-zinc-200'
                                                : 'bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800'
                                            }
                                        `}
                                    >
                                        <span className="text-sm">{category}</span>
                                        <span className={`
                                            text-xs px-2 py-0.5 rounded-full
                                            ${isActive ? 'bg-white/20 dark:bg-black/10' : 'bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400'}
                                        `}>
                                            {count}
                                        </span>
                                    </Button>
                                );
                            })}
                        </div>
                    </div>

                    {/* App Grid */}
                    <div className="flex-1">
                        {/* Category Title */}
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold text-gray-900">
                                {selectedCategory === "All" ? "All Apps" : selectedCategory}
                            </h2>
                            <p className="text-sm text-gray-500">
                                {displayedApps.length} app{displayedApps.length !== 1 ? 's' : ''} available
                            </p>
                        </div>

                        {/* Apps Grid - NEVER EMPTY */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                            {displayedApps.map((app) => {
                                const installed = isInstalled(app.id);
                                const isLoading = installing === app.id;
                                const isComingSoon = app.status === "coming_soon";

                                return (
                                    <div
                                        key={app.id}
                                        className={`
                                            bg-white dark:bg-zinc-900 rounded-2xl border p-5 transition-all duration-200
                                            ${installed ? 'border-green-200 dark:border-green-900/30 bg-green-50/30 dark:bg-green-900/10' : 'border-gray-100 dark:border-zinc-800 hover:border-gray-200 dark:hover:border-zinc-700 hover:shadow-md'}
                                            ${isComingSoon ? 'opacity-70' : ''}
                                        `}
                                    >
                                        {/* Header */}
                                        <div className="flex items-start gap-4 mb-4">
                                            <div className={`
                                                w-12 h-12 rounded-xl flex items-center justify-center text-2xl
                                                ${installed ? 'bg-green-100 dark:bg-green-900/20' : 'bg-gray-100 dark:bg-zinc-800'}
                                            `}>
                                                {app.icon}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">{app.name}</h3>
                                                    {app.category.includes("Featured") && (
                                                        <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs gap-1">
                                                            <Star className="w-3 h-3" /> Featured
                                                        </Badge>
                                                    )}
                                                    {app.isPremium && (
                                                        <Badge variant="secondary" className="bg-gradient-to-r from-violet-500 to-purple-600 text-white text-xs gap-1">
                                                            <Crown className="w-3 h-3" /> Pro
                                                        </Badge>
                                                    )}
                                                    {app.isNative && (
                                                        <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 text-xs">
                                                            Native
                                                        </Badge>
                                                    )}
                                                    {isComingSoon && (
                                                        <Badge variant="outline" className="text-amber-600 dark:text-amber-500 border-amber-200 dark:border-amber-900/50 text-xs gap-1">
                                                            <Clock className="w-3 h-3" /> Soon
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-500 dark:text-zinc-400 line-clamp-2 mt-1">
                                                    {app.description}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                {app.rendersOnProfile && (
                                                    <span className="text-xs text-gray-400 dark:text-zinc-500 flex items-center gap-1">
                                                        <ExternalLink className="w-3 h-3" />
                                                        Shows on profile
                                                    </span>
                                                )}
                                            </div>

                                            {installed ? (
                                                <div className="flex items-center gap-2">
                                                    <Switch
                                                        checked={installedApps.find(a => a.appId === app.id)?.isActive}
                                                        onCheckedChange={() => handleToggle(app.id)}
                                                    />
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-gray-400 hover:text-gray-600 dark:text-zinc-500 dark:hover:text-zinc-300"
                                                    >
                                                        <Settings className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleInstall(app)}
                                                    disabled={isLoading}
                                                    className={`
                                                        rounded-full gap-2
                                                        ${isComingSoon
                                                            ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/50'
                                                            : 'bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200'
                                                        }
                                                    `}
                                                >
                                                    {isLoading ? (
                                                        <span className="animate-spin">⏳</span>
                                                    ) : isComingSoon ? (
                                                        <>
                                                            <Clock className="w-4 h-4" />
                                                            Notify Me
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Download className="w-4 h-4" />
                                                            Add
                                                        </>
                                                    )}
                                                </Button>
                                            )}
                                        </div>

                                        {/* Installed indicator */}
                                        {installed && (
                                            <div className="mt-3 pt-3 border-t border-green-200 flex items-center gap-2 text-green-600 text-sm">
                                                <Check className="w-4 h-4" />
                                                <span>Added to profile</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Recommended Section - Always visible */}
                        {selectedCategory !== "All" && displayedApps.length < 4 && (
                            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-zinc-800">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-amber-500" />
                                    Popular Apps You Might Like
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {getRecommendedApps()
                                        .filter(app => !displayedApps.some(d => d.id === app.id))
                                        .slice(0, 3)
                                        .map((app) => (
                                            <div
                                                key={app.id}
                                                className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-xl border border-amber-100 dark:border-amber-900/50 p-4 flex items-center gap-3"
                                            >
                                                <div className="w-10 h-10 rounded-lg bg-white dark:bg-zinc-900 flex items-center justify-center text-xl">
                                                    {app.icon}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-gray-900 dark:text-white">{app.name}</h4>
                                                    <p className="text-xs text-gray-500 dark:text-zinc-400 line-clamp-1">{app.description}</p>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-amber-600 hover:text-amber-700 dark:text-amber-500 dark:hover:text-amber-400"
                                                    onClick={() => handleInstall(app)}
                                                >
                                                    <ChevronRight className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </LinktreeLayout>
    );
};

export default LinktreeMarketplace;
