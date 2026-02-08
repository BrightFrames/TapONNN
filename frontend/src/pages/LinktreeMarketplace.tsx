
    useEffect(() => {
        const load = async () => {
            setLoading(true);
            await Promise.all([fetchPlugins(), fetchInstalledPlugins()]);
            setLoading(false);
        };

        load();
    }, []);

    const fetchPlugins = async () => {
        try {
            const response = await fetch(`${API_URL}/marketplace/plugins`);
            if (response.ok) {
                const data = await response.json();
                setPlugins(data || []);
            }
        } catch (error) {
            console.error("Error fetching plugins:", error);
            toast.error("Failed to load marketplace");
        }
    };

    const fetchInstalledPlugins = async () => {
        if (!token) return;
        try {
            const response = await fetch(`${API_URL}/marketplace/my-plugins`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setInstalledPlugins(data || []);
            }
        } catch (error) {
            console.error("Error fetching installed plugins:", error);
        }
    };

    const installedMap = useMemo(() => {
        return new Map(installedPlugins.map((up) => [up.plugin_id._id, up]));
    }, [installedPlugins]);

    const filteredPlugins = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        return plugins.filter((plugin) => {
            const matchesSearch =
                !query ||
                plugin.name.toLowerCase().includes(query) ||
                plugin.description.toLowerCase().includes(query);
            const matchesCategory = pluginCategory === "all" || plugin.category === pluginCategory;
            return matchesSearch && matchesCategory;
        });
    }, [plugins, searchQuery, pluginCategory]);

    const filteredApps = useMemo(() => {
        return staticApps.filter((app) => {
            const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                app.description.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = appCategory === "all" || app.category === appCategory;
            return matchesSearch && matchesCategory;
        });
    }, [searchQuery, appCategory]);

    const pluginCategories = useMemo(() => {
        return ["all", ...new Set(plugins.map((p) => p.category))];
    }, [plugins]);

    const appCategories = ["all", ...new Set(staticApps.map((a) => a.category))];

    const handleInstall = useCallback(async (plugin: Plugin) => {
        if (!token) {
            toast.error("Please log in to install plugins");
            return;
        }

        if (installedMap.has(plugin._id)) {
            toast.info("Plugin already installed");
            return;
        }

        setActionLoading(plugin._id);
        try {
            const response = await fetch(`${API_URL}/marketplace/install/${plugin._id}`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
                const newUserPlugin = await response.json();
                setInstalledPlugins((prev) => [newUserPlugin, ...prev]);
                toast.success("Plugin installed successfully");

                if (newUserPlugin.plugin_id?.config_schema?.length) {
                    handleConfigure(newUserPlugin.plugin_id, newUserPlugin.config || {});
                }
            } else {
                const error = await response.json();
                toast.error(error.error || "Failed to install plugin");
            }
        } catch (error) {
            console.error("Error installing plugin:", error);
            toast.error("Failed to install plugin");
        } finally {
            setActionLoading(null);
        }
    }, [API_URL, token, installedMap]);

    const handleUninstall = useCallback(async (pluginId: string) => {
        if (!token) return;

        if (!confirm("Uninstall this plugin?")) return;

        setActionLoading(pluginId);
        try {
            const response = await fetch(`${API_URL}/marketplace/uninstall/${pluginId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
                setInstalledPlugins((prev) => prev.filter((up) => up.plugin_id._id !== pluginId));
                toast.success("Plugin uninstalled");
            } else {
                toast.error("Failed to uninstall plugin");
            }
        } catch (error) {
            console.error("Error uninstalling plugin:", error);
            toast.error("Failed to uninstall plugin");
        } finally {
            setActionLoading(null);
        }
    }, [API_URL, token]);

    const handleToggle = useCallback(async (pluginId: string) => {
        if (!token) return;

        setActionLoading(pluginId);
        try {
            const response = await fetch(`${API_URL}/marketplace/toggle/${pluginId}`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
                const updated = await response.json();
                setInstalledPlugins((prev) => prev.map((up) =>
                    up.plugin_id._id === pluginId ? { ...up, is_active: updated.is_active } : up
                ));
                toast.success(updated.is_active ? "Plugin enabled" : "Plugin disabled");
            } else {
                toast.error("Failed to update plugin status");
            }
        } catch (error) {
            console.error("Error toggling plugin:", error);
            toast.error("Failed to update plugin status");
        } finally {
            setActionLoading(null);
        }
    }, [API_URL, token]);

    const handleConfigure = (plugin: Plugin, config: Record<string, any>) => {
        setSelectedPlugin(plugin);
        setSelectedConfig(config || {});
        setConfigModalOpen(true);
    };

    const saveConfig = async (config: Record<string, any>) => {
        if (!selectedPlugin || !token) return;

        try {
            const response = await fetch(`${API_URL}/marketplace/config/${selectedPlugin._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ config })
            });

            if (response.ok) {
                toast.success("Configuration saved");
                setInstalledPlugins((prev) => prev.map((up) =>
                    up.plugin_id._id === selectedPlugin._id ? { ...up, config } : up
                ));
            } else {
                toast.error("Failed to save configuration");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to save configuration");
        }
    };

    const handleComingSoon = () => {
        toast.info("Coming soon", { description: "App connections are on the way." });
    };

    const DetailModal = ({ item, type }: { item: any; type: "plugin" | "app" }) => {
        const gradient = getGradient(item.category);
        const isInstalling = actionLoading === (type === "plugin" ? item._id : item.id);
        const isInstalled = type === "plugin" && installedMap.has(item._id);
        const installedEntry = type === "plugin" ? installedMap.get(item._id) : null;

        return (
            <div
                className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={(e) => e.target === e.currentTarget && setDetailModal(null)}
            >
                <div className="relative w-full sm:max-w-2xl max-h-[85vh] sm:max-h-[90vh] overflow-hidden bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl shadow-2xl animate-in slide-in-from-bottom duration-300 sm:mx-4">
                    <div className="sm:hidden flex justify-center pt-3 pb-1">
                        <div className="w-10 h-1 bg-gray-300 dark:bg-zinc-700 rounded-full" />
                    </div>

                    <div className={`relative h-32 bg-gradient-to-br ${gradient}`}>
                        <button
                            onClick={() => setDetailModal(null)}
                            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-xl backdrop-blur-sm transition-colors"
                        >
                            <X className="w-5 h-5 text-white" />
                        </button>
                        <div className="absolute -bottom-8 left-6">
                            <div className="w-16 h-16 rounded-2xl bg-white dark:bg-zinc-800 shadow-xl flex items-center justify-center text-3xl">
                                {type === "plugin" ? (() => {
                                    const IconComponent = getIconComponent(item.icon);
                                    return <IconComponent className="w-8 h-8 text-gray-700 dark:text-white" />;
                                })() : item.icon}
                            </div>
                        </div>
                    </div>

                    <div className="px-6 pt-12 pb-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{item.name}</h2>
                                <div className="flex items-center gap-3 mt-2">
                                    <Badge variant="secondary" className="text-xs">{item.category}</Badge>
                                    {item.is_premium || item.isPremium ? (
                                        <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-xs">
                                            <Crown className="w-3 h-3 mr-1" /> Pro
                                        </Badge>
                                    ) : null}
                                    {type === "app" && item.syncStatus && (
                                        <Badge className="bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border-0 text-xs">
                                            <Activity className="w-3 h-3 mr-1" />
                                            {item.syncStatus === "real-time" ? "Real-time" : item.syncStatus}
                                        </Badge>
                                    )}
                                    {isInstalled && (
                                        <Badge className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-0 text-xs">
                                            <Check className="w-3 h-3 mr-1" /> Installed
                                        </Badge>
                                    )}
                                </div>
                            </div>
                            <div className="text-right">
                                {item.rating && (
                                    <div className="flex items-center gap-1 text-amber-500">
                                        <Star className="w-5 h-5 fill-current" />
                                        <span className="font-bold text-lg">{item.rating}</span>
                                    </div>
                                )}
                                {item.reviews && (
                                    <p className="text-xs text-gray-500 dark:text-zinc-500">{item.reviews} reviews</p>
                                )}
                            </div>
                        </div>

                        <p className="text-gray-600 dark:text-zinc-400 mb-6 leading-relaxed">{item.description}</p>

                        {item.features && (
                            <div className="mb-6">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Features</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {item.features.map((feature: string, index: number) => (
                                        <div key={index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-zinc-400">
                                            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                                            <span>{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {type === "plugin" && installedEntry && (
                            <div className="mb-6 p-4 rounded-2xl border border-emerald-200/60 dark:border-emerald-500/20 bg-emerald-50/60 dark:bg-emerald-950/20">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">Installed</p>
                                        <p className="text-xs text-emerald-700/80 dark:text-emerald-300/70">Toggle it on your profile anytime.</p>
                                    </div>
                                    <Switch
                                        checked={installedEntry.is_active}
                                        onCheckedChange={() => handleToggle(item._id)}
                                        disabled={actionLoading === item._id}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-zinc-800">
                            {type === "plugin" ? (
                                isInstalled ? (
                                    <>
                                        {item.config_schema?.length ? (
                                            <Button
                                                onClick={() => handleConfigure(item, installedEntry?.config || {})}
                                                className="flex-1 h-12 text-base font-semibold rounded-xl bg-white text-gray-900 border border-gray-200 hover:bg-gray-50"
                                            >
                                                <Settings className="w-5 h-5 mr-2" /> Configure
                                            </Button>
                                        ) : null}
                                        <Button
                                            onClick={() => handleUninstall(item._id)}
                                            disabled={isInstalling}
                                            className="flex-1 h-12 text-base font-semibold rounded-xl bg-red-500 hover:bg-red-600 text-white"
                                        >
                                            {isInstalling ? <RefreshCw className="w-5 h-5 animate-spin" /> : "Uninstall"}
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        onClick={() => handleInstall(item)}
                                        disabled={isInstalling}
                                        className="flex-1 h-12 text-base font-semibold rounded-xl shadow-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
                                    >
                                        {isInstalling ? (
                                            <RefreshCw className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <><Download className="w-5 h-5 mr-2" /> Install Plugin</>
                                        )}
                                    </Button>
                                )
                            ) : (
                                <Button
                                    onClick={handleComingSoon}
                                    className="flex-1 h-12 text-base font-semibold rounded-xl shadow-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                                >
                                    <Plug className="w-5 h-5 mr-2" /> Coming Soon
                                </Button>
                            )}
                            <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl">
                                <Heart className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const PluginCard = ({ plugin }: { plugin: Plugin }) => {
        const IconComponent = getIconComponent(plugin.icon);
        const gradient = getGradient(plugin.category);
        const isInstalling = actionLoading === plugin._id;
        const isInstalled = installedMap.has(plugin._id);

        return (
            <div
                className="group relative bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-transparent cursor-pointer"
                onClick={() => setDetailModal({ item: plugin, type: "plugin" })}
            >
                <div className={`relative h-20 bg-gradient-to-br ${gradient} opacity-90 group-hover:opacity-100 transition-opacity`}>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
                        <div className="w-14 h-14 rounded-xl bg-white dark:bg-zinc-800 shadow-xl flex items-center justify-center border-4 border-white dark:border-zinc-900 group-hover:scale-110 transition-transform">
                            <IconComponent className="w-6 h-6 text-gray-700 dark:text-white" />
                        </div>
                    </div>
                </div>

                <div className="pt-10 pb-5 px-4">
                    <div className="text-center mb-3">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {plugin.name}
                        </h3>
                        <div className="flex items-center justify-center gap-2">
                            <Badge variant="secondary" className="text-xs">{plugin.category}</Badge>
                            {plugin.is_premium && (
                                <Badge className="bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-xs">Pro</Badge>
                            )}
                            {isInstalled && (
                                <Badge className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs">Installed</Badge>
                            )}
                        </div>
                    </div>

                    <p className="text-gray-500 dark:text-zinc-400 text-sm text-center line-clamp-2 mb-4 h-10">
                        {plugin.description}
                    </p>

                    <div className="flex items-center justify-center gap-4 mb-4 text-sm">
                        <div className="flex items-center gap-1 text-gray-500 dark:text-zinc-500">
                            <Download className="w-3.5 h-3.5" />
                            <span>{Math.max(plugin.install_count, 0).toLocaleString()}</span>
                        </div>
                    </div>

                    {isInstalled ? (
                        <div className="flex items-center gap-2">
                            {plugin.config_schema?.length ? (
                                <Button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const installed = installedMap.get(plugin._id);
                                        handleConfigure(plugin, installed?.config || {});
                                    }}
                                    className="w-full h-10 font-semibold rounded-xl bg-white text-gray-900 border border-gray-200 hover:bg-gray-50"
                                >
                                    <Settings className="w-4 h-4 mr-2" /> Configure
                                </Button>
                            ) : (
                                <Button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleUninstall(plugin._id);
                                    }}
                                    disabled={isInstalling}
                                    className="w-full h-10 font-semibold rounded-xl bg-red-500 hover:bg-red-600 text-white"
                                >
                                    {isInstalling ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Uninstall"}
                                </Button>
                            )}
                        </div>
                    ) : (
                        <Button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleInstall(plugin);
                            }}
                            disabled={isInstalling}
                            className="w-full h-10 font-semibold rounded-xl transition-all bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25"
                        >
                            {isInstalling ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                                <><Download className="w-4 h-4 mr-2" /> Install</>
                            )}
                        </Button>
                    )}
                </div>
            </div>
        );
    };

    const AppCard = ({ item }: { item: any }) => {
        const gradient = getGradient(item.category);
        return (
            <div
                className="group relative bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-transparent cursor-pointer"
                onClick={() => setDetailModal({ item, type: "app" })}
            >
                {item.featured && (
                    <div className="absolute top-3 right-3 z-10">
                        <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg text-xs">
                            <Sparkles className="w-3 h-3 mr-1" /> Featured
                        </Badge>
                    </div>
                )}

                <div className={`relative h-20 bg-gradient-to-br ${gradient} opacity-90 group-hover:opacity-100 transition-opacity`}>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
                        <div className="w-14 h-14 rounded-xl bg-white dark:bg-zinc-800 shadow-xl flex items-center justify-center text-2xl border-4 border-white dark:border-zinc-900 group-hover:scale-110 transition-transform">
                            {item.icon}
                        </div>
                    </div>
                </div>

                <div className="pt-10 pb-5 px-4">
                    <div className="text-center mb-3">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {item.name}
                        </h3>
                        <div className="flex items-center justify-center gap-2">
                            <Badge variant="secondary" className="text-xs">{item.category}</Badge>
                            {item.isPremium && (
                                <Badge className="bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-xs">Pro</Badge>
                            )}
                        </div>
                    </div>

                    <p className="text-gray-500 dark:text-zinc-400 text-sm text-center line-clamp-2 mb-4 h-10">
                        {item.description}
                    </p>

                    <div className="flex items-center justify-center gap-4 mb-4 text-sm">
                        <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-amber-500 fill-current" />
                            <span className="font-semibold text-gray-900 dark:text-white">{item.rating}</span>
                        </div>
                        <div className="w-px h-4 bg-gray-200 dark:bg-zinc-700" />
                        <div className="flex items-center gap-1 text-gray-500 dark:text-zinc-500">
                            <Download className="w-3.5 h-3.5" />
                            <span>{(item.install_count / 1000).toFixed(0)}K</span>
                        </div>
                    </div>

                    <Button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleComingSoon();
                        }}
                        className="w-full h-10 font-semibold rounded-xl transition-all bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/25"
                    >
                        <Plug className="w-4 h-4 mr-2" /> Coming Soon
                    </Button>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <LinktreeLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                </div>
            </LinktreeLayout>
        );
    }

    return (
        <LinktreeLayout>
            <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-slate-50 dark:from-black dark:via-zinc-950 dark:to-zinc-950">
                {/* Hero Section */}
                <div className="relative overflow-hidden border-b border-gray-200 dark:border-zinc-800">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-100/50 via-purple-50/30 to-pink-50/50 dark:from-indigo-950/30 dark:via-purple-950/20 dark:to-pink-950/30" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.15),_transparent_60%)]" />

                    <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 relative z-10">
                        <div className="text-center max-w-2xl mx-auto">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-full border border-gray-200 dark:border-zinc-800 mb-6 shadow-sm">
                                <Sparkles className="w-4 h-4 text-indigo-500" />
                                <span className="text-sm font-medium text-gray-700 dark:text-zinc-300">
                                    {plugins.length} plugins available
                                </span>
                            </div>

                            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
                                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                                    Marketplace
                                </span>
                            </h1>
                            <p className="text-base text-gray-600 dark:text-zinc-400 mb-8 max-w-xl mx-auto">
                                Install plugins to power up your profile and get ready for upcoming app connections.
                            </p>

                            {/* Search Bar */}
                            <div className="relative max-w-md mx-auto group">
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur-xl opacity-20 group-focus-within:opacity-40 transition-opacity" />
                                <div className="relative flex items-center">
                                    <Search className="absolute left-4 h-5 w-5 text-gray-400 dark:text-zinc-500 group-focus-within:text-indigo-500 transition-colors" />
                                    <Input
                                        placeholder="Search plugins and apps..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-12 pr-4 h-12 bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-base rounded-xl shadow-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-600"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
                    {/* Main Tabs */}
                    <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setSearchQuery(""); }} className="w-full">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                            <TabsList className="h-auto p-1.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-sm inline-flex self-start">
                                <TabsTrigger
                                    value="plugins"
                                    className="rounded-xl px-5 py-3 text-sm font-semibold text-gray-600 dark:text-zinc-400 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg flex items-center gap-2 transition-all"
                                >
                                    <Plug className="w-4 h-4" />
                                    Plugins
                                    <Badge className="ml-1 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 border-0 text-xs">
                                        {plugins.length}
                                    </Badge>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="apps"
                                    className="rounded-xl px-5 py-3 text-sm font-semibold text-gray-600 dark:text-zinc-400 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg flex items-center gap-2 transition-all"
                                >
                                    <Activity className="w-4 h-4" />
                                    Apps
                                    <Badge className="ml-1 bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border-0 text-xs">
                                        {staticApps.length}
                                    </Badge>
                                </TabsTrigger>
                            </TabsList>

                            {/* Category Filter */}
                            <div className="flex items-center gap-2 flex-wrap">
                                {(activeTab === "plugins" ? pluginCategories : appCategories).map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => activeTab === "plugins" ? setPluginCategory(cat) : setAppCategory(cat)}
                                        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                                            (activeTab === "plugins" ? pluginCategory : appCategory) === cat
                                                ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-md"
                                                : "bg-white dark:bg-zinc-900 text-gray-600 dark:text-zinc-400 border border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700"
                                        }`}
                                    >
                                        {cat === "all" ? "All" : cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Plugins Tab */}
                        <TabsContent value="plugins" className="mt-0">
                            {installedPlugins.length > 0 && (
                                <div className="mb-10">
                                    <div className="flex items-center gap-2 mb-4">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">Installed</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {installedPlugins.map((userPlugin) => {
                                            const plugin = userPlugin.plugin_id;
                                            const IconComponent = getIconComponent(plugin.icon);
                                            const isWorking = actionLoading === plugin._id;
                                            return (
                                                <div
                                                    key={userPlugin._id}
                                                    className="flex items-center gap-4 p-4 rounded-2xl border border-emerald-200/60 dark:border-emerald-500/20 bg-white dark:bg-zinc-900"
                                                >
                                                    <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                                                        <IconComponent className="w-6 h-6 text-emerald-700 dark:text-emerald-300" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="font-semibold text-gray-900 dark:text-white truncate">{plugin.name}</h4>
                                                            {plugin.is_premium && (
                                                                <Badge className="bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-xs">Pro</Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-gray-500 dark:text-zinc-500 line-clamp-1">{plugin.description}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Switch
                                                            checked={userPlugin.is_active}
                                                            onCheckedChange={() => handleToggle(plugin._id)}
                                                            disabled={isWorking}
                                                        />
                                                        {plugin.config_schema?.length ? (
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                onClick={() => handleConfigure(plugin, userPlugin.config || {})}
                                                                disabled={isWorking}
                                                                className="h-9 w-9 rounded-xl"
                                                            >
                                                                <Settings className="w-4 h-4" />
                                                            </Button>
                                                        ) : null}
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() => handleUninstall(plugin._id)}
                                                            disabled={isWorking}
                                                            className="h-9 w-9 rounded-xl text-red-500 border-red-200 hover:bg-red-50"
                                                        >
                                                            {isWorking ? <Loader2 className="w-4 h-4 animate-spin" /> : "×"}
                                                        </Button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            <div className="mb-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl">
                                        <Plug className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">All Plugins</h2>
                                </div>
                                <p className="text-gray-500 dark:text-zinc-500 text-sm ml-11">
                                    Enhance your profile with powerful features
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                {filteredPlugins.map((plugin) => (
                                    <PluginCard key={plugin._id} plugin={plugin} />
                                ))}
                            </div>

                            {filteredPlugins.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-zinc-900 flex items-center justify-center mb-4">
                                        <Search className="w-7 h-7 text-gray-400 dark:text-zinc-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-300 mb-2">No plugins found</h3>
                                    <p className="text-gray-500 dark:text-zinc-500 text-sm">Try a different search or category</p>
                                </div>
                            )}
                        </TabsContent>

                        {/* Apps Tab */}
                        <TabsContent value="apps" className="mt-0">
                            <div className="mb-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-green-100 dark:bg-green-500/20 rounded-xl">
                                        <Activity className="w-5 h-5 text-green-600 dark:text-green-400" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Apps (Coming Soon)</h2>
                                </div>
                                <p className="text-gray-500 dark:text-zinc-500 text-sm ml-11">
                                    Connect your favorite apps for real-time updates
                                </p>
                            </div>

                            <div className="mb-6 p-5 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-2xl border border-green-200 dark:border-green-800/50">
                                <div className="flex items-start gap-4">
                                    <div className="p-2.5 bg-green-100 dark:bg-green-500/20 rounded-xl">
                                        <CloudLightning className="w-5 h-5 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Real-time Synchronization</h3>
                                        <p className="text-gray-600 dark:text-zinc-400 text-sm">
                                            Connected apps automatically sync your content to keep your profile updated.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                {filteredApps.map((app) => (
                                    <AppCard key={app.id} item={app} />
                                ))}
                            </div>

                            {filteredApps.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-zinc-900 flex items-center justify-center mb-4">
                                        <Activity className="w-7 h-7 text-gray-400 dark:text-zinc-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-300 mb-2">No apps found</h3>
                                    <p className="text-gray-500 dark:text-zinc-500 text-sm">Try a different search or category</p>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Detail Modal */}
                {detailModal && <DetailModal item={detailModal.item} type={detailModal.type} />}

                <PluginConfigModal
                    isOpen={configModalOpen}
                    onClose={() => setConfigModalOpen(false)}
                    plugin={selectedPlugin}
                    currentConfig={selectedConfig}
                    onSave={saveConfig}
                />
            </div>
        </LinktreeLayout>
    );
};

export default LinktreeMarketplace;
