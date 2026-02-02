import { useState, useEffect } from "react";
import LinktreeLayout from "@/layouts/LinktreeLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { templates } from "@/data/templates";
import { supabase } from "@/lib/supabase";
import {
    Copy,
    ExternalLink,
    Eye,
    MousePointerClick,
    Share2,
    Sparkles,
    Users,
    TrendingUp,
    Instagram,
    Globe,
    Zap,
} from "lucide-react";
import { getIconForThumbnail } from "@/utils/socialIcons";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

const Overview = () => {
    const { user, links, selectedTheme } = useAuth();
    const [analyticsData, setAnalyticsData] = useState<any>(null);
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

    // Fetch real analytics
    useEffect(() => {
        const fetchAnalytics = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            if (!token) return;

            try {
                const response = await fetch(`${API_URL}/analytics/summary`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setAnalyticsData(data);
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchAnalytics();
    }, []);

    // Use real user data or fallback
    const userName = user?.name || "Creator";
    const username = user?.username || "user";
    const userInitial = userName[0]?.toUpperCase() || "U";

    // Calculate real stats
    const totalClicks = analyticsData?.totalClicks ?? links.reduce((sum, link) => sum + (link.clicks || 0), 0);
    const totalViews = analyticsData?.totalViews ?? 0;
    const subscribers = analyticsData?.subscribers ?? 0;
    const ctr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : 0;

    // Helper to fill chart data
    const fillChartData = (backendData: any[]) => {
        const filledData = [];
        const today = new Date();
        const dataMap = new Map();
        if (backendData) {
            backendData.forEach(item => {
                dataMap.set(item.date, { views: parseInt(item.views), clicks: parseInt(item.clicks) });
            });
        }
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
            const existing = dataMap.get(dateStr);
            filledData.push({
                name: dateStr, // naming 'name' for XAxis
                views: existing ? existing.views : 0,
                clicks: existing ? existing.clicks : 0
            });
        }
        return filledData;
    };

    const chartData = analyticsData?.chartData ? fillChartData(analyticsData.chartData) : [
        { name: 'Mon', views: 0, clicks: 0 },
        { name: 'Tue', views: 0, clicks: 0 },
        { name: 'Wed', views: 0, clicks: 0 },
        { name: 'Thu', views: 0, clicks: 0 },
        { name: 'Fri', views: 0, clicks: 0 },
        { name: 'Sat', views: 0, clicks: 0 },
        { name: 'Sun', views: 0, clicks: 0 },
    ];

    const copyLink = () => {
        navigator.clipboard.writeText(`${window.location.origin}/${username}`);
    };

    // Get current template based on theme
    const currentTemplate = templates.find(t => t.id === selectedTheme) || templates[0];

    // Background style
    const bgStyle = currentTemplate.bgImage
        ? { backgroundImage: `url(${currentTemplate.bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
        : {};

    return (
        <LinktreeLayout>
            <div className="flex h-full">
                {/* Main Content */}
                <div className="flex-1 max-w-4xl py-8 px-6 md:px-10 overflow-y-auto">

                    {/* Welcome Card - Clean & Modern */}
                    <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Avatar className="w-16 h-16 border-2 border-border" key={user?.avatar}>
                                <AvatarImage src={user?.avatar} />
                                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                                    {userInitial}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight text-foreground">{userName}</h1>
                                <p className="text-muted-foreground">@{username}</p>
                            </div>
                        </div>
                        <div className="flex gap-3 w-full md:w-auto">
                            <Button
                                variant="outline"
                                className="gap-2 flex-1 md:flex-none"
                                onClick={copyLink}
                            >
                                <Copy className="w-4 h-4" /> Copy Link
                            </Button>
                            <Button className="gap-2 flex-1 md:flex-none">
                                <Share2 className="w-4 h-4" /> Share
                            </Button>
                        </div>
                    </div>

                    {/* Stats Grid - Standard Cards */}
                    <div className="grid gap-4 md:grid-cols-4 mb-8">
                        <Card className="hover:bg-muted/50 transition-colors">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="p-2 bg-primary/10 text-primary rounded-lg">
                                        <Eye className="w-4 h-4" />
                                    </div>
                                    <Badge variant="secondary" className="text-[10px]">Lifetime</Badge>
                                </div>
                                <div className="text-2xl font-bold">{totalViews}</div>
                                <p className="text-muted-foreground text-xs">Total Views</p>
                            </CardContent>
                        </Card>

                        <Card className="hover:bg-muted/50 transition-colors">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                                        <MousePointerClick className="w-4 h-4" />
                                    </div>
                                </div>
                                <div className="text-2xl font-bold">{totalClicks}</div>
                                <p className="text-muted-foreground text-xs">Total Clicks</p>
                            </CardContent>
                        </Card>

                        <Card className="hover:bg-muted/50 transition-colors">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
                                        <Users className="w-4 h-4" />
                                    </div>
                                </div>
                                <div className="text-2xl font-bold">{subscribers}</div>
                                <p className="text-muted-foreground text-xs">Subscribers</p>
                            </CardContent>
                        </Card>

                        <Card className="hover:bg-muted/50 transition-colors">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
                                        <TrendingUp className="w-4 h-4" />
                                    </div>
                                </div>
                                <div className="text-2xl font-bold">{ctr}%</div>
                                <p className="text-muted-foreground text-xs">Click Rate</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Chart & Activity */}
                    <div className="grid gap-6 md:grid-cols-5">
                        {/* Chart */}
                        <Card className="md:col-span-3 border border-gray-100">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-lg">Weekly Performance</CardTitle>
                                        <CardDescription>Views and clicks over the last 7 days</CardDescription>
                                    </div>
                                    <Badge variant="outline" className="text-xs">No Data</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <ResponsiveContainer width="100%" height={220}>
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="colorViews2" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} stroke="hsl(var(--muted-foreground))" />
                                        <YAxis axisLine={false} tickLine={false} fontSize={12} stroke="hsl(var(--muted-foreground))" />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))', color: 'hsl(var(--foreground))', fontSize: '12px' }}
                                        />
                                        <Area type="monotone" dataKey="views" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#colorViews2)" />
                                        <Area type="monotone" dataKey="clicks" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorClicks)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Recent Activity - Empty State */}
                        <Card className="md:col-span-2 border border-gray-100">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-amber-500" /> Recent Activity
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col items-center justify-center text-center py-8 text-gray-500">
                                    <p className="text-sm">No recent activity</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Top Links */}
                    <Card className="mt-6 border border-gray-100">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Zap className="w-4 h-4 text-yellow-500 fill-yellow-500" /> Top Performing Links
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {links.filter(l => l.isActive).slice(0, 3).map((link, index) => (
                                    <div key={link.id} className="flex items-center justify-between p-4 rounded-xl border border-border/50 hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-muted text-muted-foreground">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-sm text-foreground">{link.title}</h4>
                                                <p className="text-xs text-muted-foreground truncate max-w-[200px]">{link.url}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-foreground text-sm">{link.clicks?.toLocaleString() || 0}</div>
                                            <div className="text-xs text-muted-foreground">clicks</div>
                                        </div>
                                    </div>
                                ))}
                                {links.length === 0 && (
                                    <div className="text-center py-6 text-gray-500 text-sm">
                                        No links to show yet.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                </div>

                {/* Phone Preview - Right Side */}
                <div className="w-[400px] border-l border-gray-100 hidden xl:flex items-center justify-center bg-gradient-to-b from-gray-50 to-white relative p-8">
                    <div className="sticky top-8">
                        {/* Phone Frame */}
                        <div className="w-[300px] h-[620px] bg-black rounded-[3rem] border-8 border-gray-900 shadow-2xl overflow-hidden relative">
                            {/* Notch */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-b-2xl z-20" />

                            {/* Status Bar */}
                            <div className="h-8 w-full bg-black flex items-center justify-between px-8 text-[10px] text-white font-medium pt-1 z-30 relative">
                                <span>9:41</span>
                                <div className="flex gap-1.5 items-center">
                                    <div className="flex gap-0.5">
                                        <div className="w-1 h-1 bg-white rounded-full" />
                                        <div className="w-1 h-1 bg-white rounded-full" />
                                        <div className="w-1 h-1.5 bg-white rounded-full" />
                                        <div className="w-1 h-2 bg-white rounded-full" />
                                    </div>
                                    <span className="text-[8px]">5G</span>
                                    <div className="w-5 h-2.5 border border-white rounded-sm relative">
                                        <div className="absolute inset-0.5 right-1 bg-white rounded-[1px]" />
                                        <div className="absolute -right-0.5 top-1/2 -translate-y-1/2 w-0.5 h-1 bg-white rounded-r" />
                                    </div>
                                </div>
                            </div>

                            {/* Screen Content */}
                            <div
                                className={`h-full w-full overflow-y-auto p-6 pb-20 ${currentTemplate.bgClass || 'bg-gray-100'} ${currentTemplate.textColor}`}
                                style={bgStyle}
                            >
                                {/* Overlay for readibility overlay if needed */}
                                {currentTemplate.bgImage && <div className="absolute inset-0 bg-black/20 pointer-events-none" />}

                                {/* Share Button */}
                                <div className="absolute top-12 right-6 w-8 h-8 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center z-10">
                                    <ExternalLink className={`w-4 h-4 ${currentTemplate.textColor ? 'opacity-80' : 'text-gray-700'}`} />
                                </div>

                                <div className="flex flex-col items-center mt-8 space-y-3 relative z-10">
                                    <Avatar className="w-24 h-24 border-4 border-white/20 shadow-xl" key={user?.avatar}>
                                        <AvatarImage src={user?.avatar} />
                                        <AvatarFallback className="bg-gray-400 text-white text-3xl font-bold">
                                            {userInitial}
                                        </AvatarFallback>
                                    </Avatar>
                                    <h2 className="text-xl font-bold tracking-tight">@{username}</h2>
                                    <div className="flex gap-3 flex-wrap justify-center px-4">
                                        {user?.social_links && Object.entries(user.social_links).map(([platform, url]) => {
                                            if (!url) return null;
                                            const Icon = getIconForThumbnail(platform);
                                            return Icon ? (
                                                <a
                                                    key={platform}
                                                    href={url.startsWith('http') ? url : `https://${url}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer backdrop-blur-sm"
                                                >
                                                    <Icon className="w-4 h-4" />
                                                </a>
                                            ) : null;
                                        })}
                                    </div>
                                </div>

                                <div className="mt-8 space-y-3 relative z-10">


                                    {links.filter(l => l.isActive).map((link) => {
                                        const Icon = link.thumbnail ? getIconForThumbnail(link.thumbnail) : null;
                                        return (
                                            <a
                                                key={link.id}
                                                href={link.url || '#'}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`block w-full flex items-center justify-center relative ${currentTemplate.buttonStyle}`}
                                            >
                                                {Icon && (
                                                    <Icon className="absolute left-4 w-5 h-5 opacity-90" />
                                                )}
                                                <span className="truncate max-w-[200px]">{link.title}</span>
                                            </a>
                                        );
                                    })}
                                    {links.filter(l => l.isActive).length === 0 && (
                                        <div className={`text-center text-sm py-8 ${currentTemplate.textColor} opacity-60`}>
                                            Add links to see them here
                                        </div>
                                    )}
                                </div>

                                {/* Footer */}
                                <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center gap-2 px-6 z-10">
                                    <button className="bg-white/10 backdrop-blur-md border border-white/20 text-current px-5 py-2.5 rounded-full text-xs font-bold shadow-lg hover:shadow-xl transition-shadow">
                                        Join @{username} on Tap2
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Preview Label */}
                        <div className="text-center mt-6">
                            <div className="flex items-center justify-center gap-2 text-sm font-medium text-gray-600">
                                <Share2 className="w-4 h-4" /> Live Preview
                            </div>
                            <p className="text-xs text-gray-400 mt-1">Reflects your current theme</p>
                        </div>
                    </div>
                </div>
            </div>
        </LinktreeLayout>
    );
};

export default Overview;
