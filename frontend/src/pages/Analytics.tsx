import { useState, useEffect } from "react";
import LinktreeLayout from "@/layouts/LinktreeLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
    ArrowUpRight,
    ArrowDownRight,
    MousePointerClick,
    Eye,
    Users,
    Clock,
    Globe,
    Smartphone,
    ExternalLink,
    Percent,
    DollarSign,
    Info,
    ChevronRight,
    ChevronDown,
    UserPlus,
    Instagram,
    Lock,
    Loader2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Chart config
const chartConfig = {
    views: {
        label: "Views",
        color: "#8884d8",
    },
    clicks: {
        label: "Clicks",
        color: "#82ca9d",
    },
};

interface AnalyticsSummary {
    totalClicks: number;
    linkCount: number;
    topLinks: { id: string; title: string; url: string; clicks: number }[];
}

const Analytics = () => {
    const { user, links } = useAuth();
    const [timeRange, setTimeRange] = useState("7d");
    const [dateRange, setDateRange] = useState("Last 7 days");
    const [loading, setLoading] = useState(true);
    const [analyticsData, setAnalyticsData] = useState<AnalyticsSummary | null>(null);

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

    // Fetch real analytics from backend
    useEffect(() => {
        const fetchAnalytics = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`${API_URL}/analytics/summary`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setAnalyticsData(data);
                }
            } catch (err) {
                console.error("Error fetching analytics:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    // Calculate stats - prefer backend data, fallback to local links
    const totalClicks = analyticsData?.totalClicks ?? links.reduce((sum, link) => sum + (link.clicks || 0), 0);
    const totalViews = Math.round(totalClicks * 3.2); // Estimated views based on clicks
    const ctr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : "0";
    const clickRate = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : "0";
    const subscribers = 34; // Mock subscriber count
    const earnings = 0;

    // Sort links by clicks for "Most clicked" section - use backend data if available
    const topLinks = analyticsData?.topLinks?.length
        ? analyticsData.topLinks
        : [...links].sort((a, b) => (b.clicks || 0) - (a.clicks || 0)).slice(0, 5);

    // Generate chart data based on current time range (mock for now)
    const chartData = [
        { date: "Jan 01", views: Math.round(totalViews * 0.15), clicks: Math.round(totalClicks * 0.12) },
        { date: "Jan 02", views: Math.round(totalViews * 0.18), clicks: Math.round(totalClicks * 0.14) },
        { date: "Jan 03", views: Math.round(totalViews * 0.22), clicks: Math.round(totalClicks * 0.20) },
        { date: "Jan 04", views: Math.round(totalViews * 0.12), clicks: Math.round(totalClicks * 0.10) },
        { date: "Jan 05", views: Math.round(totalViews * 0.25), clicks: Math.round(totalClicks * 0.22) },
        { date: "Jan 06", views: Math.round(totalViews * 0.20), clicks: Math.round(totalClicks * 0.18) },
        { date: "Jan 07", views: Math.round(totalViews * 0.28), clicks: Math.round(totalClicks * 0.24) },
    ];

    // Mock top links for the chart section
    const mockTopLinks = [
        { title: "My Portfolio", url: "/portfolio", clicks: 1250, change: "+12%" },
        { title: "YouTube Channel", url: "youtube.com/user", clicks: 890, change: "+5%" },
        { title: "Latest Blog Post", url: "/blog/new", clicks: 650, change: "-2%" },
        { title: "Instagram", url: "instagram.com/user", clicks: 420, change: "+8%" },
    ];

    const dateOptions = [
        { label: "Last 7 days", locked: false },
        { label: "Last 28 days", locked: false },
        { label: "Last 90 days", locked: true },
        { label: "Last 365 days", locked: true },
        { label: "Custom range", locked: false },
    ];

    // Lifetime stats
    const lifetimeStats = [
        { icon: Eye, value: totalViews.toLocaleString(), label: "Views" },
        { icon: MousePointerClick, value: totalClicks.toLocaleString(), label: "Clicks" },
        { icon: Percent, value: `${clickRate}%`, label: "Click rate" },
        { icon: Users, value: subscribers.toString(), label: "Subscribers" },
        { icon: DollarSign, value: `$${earnings.toFixed(2)}`, label: "Earnings" },
    ];

    return (
        <LinktreeLayout>
            <div className="p-6 md:p-8 max-w-7xl mx-auto font-sans space-y-8">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Insights</h1>
                        <p className="text-gray-500 mt-1">Overall performance of your links and profile.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Select value={timeRange} onValueChange={setTimeRange}>
                            <SelectTrigger className="w-[160px] rounded-full bg-white border-gray-200">
                                <SelectValue placeholder="Select range" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="24h">Last 24 hours</SelectItem>
                                <SelectItem value="7d">Last 7 days</SelectItem>
                                <SelectItem value="30d">Last 30 days</SelectItem>
                                <SelectItem value="90d">Last 3 months</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" className="rounded-full gap-2 hidden sm:flex">
                            <ExternalLink className="w-4 h-4" /> Export Data
                        </Button>
                    </div>
                </div>

                {/* Lifetime Totals */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">Lifetime totals</h2>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                        {lifetimeStats.map((stat) => (
                            <div key={stat.label} className="bg-gray-50 rounded-xl p-4">
                                <stat.icon className="w-5 h-5 text-gray-400 mb-3" />
                                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                                <div className="text-sm text-gray-500">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Dashboard Tabs */}
                <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="bg-transparent p-0 border-b border-gray-200 w-full justify-start rounded-none h-auto mb-8">
                        <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-gray-900 data-[state=active]:bg-transparent px-4 py-3 text-gray-500 data-[state=active]:text-gray-900 font-medium transition-all">Overview</TabsTrigger>
                        <TabsTrigger value="audience" className="rounded-none border-b-2 border-transparent data-[state=active]:border-gray-900 data-[state=active]:bg-transparent px-4 py-3 text-gray-500 data-[state=active]:text-gray-900 font-medium transition-all">Audience</TabsTrigger>
                        <TabsTrigger value="content" className="rounded-none border-b-2 border-transparent data-[state=active]:border-gray-900 data-[state=active]:bg-transparent px-4 py-3 text-gray-500 data-[state=active]:text-gray-900 font-medium transition-all">Content</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                        {/* KPI Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Card className="shadow-sm border-gray-100 bg-white">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-500">Total Views</CardTitle>
                                    <Eye className="h-4 w-4 text-gray-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-gray-900">{totalViews.toLocaleString()}</div>
                                    <p className="text-xs text-green-600 flex items-center mt-1 font-medium">
                                        <ArrowUpRight className="w-3 h-3 mr-1" /> +20.1% <span className="text-gray-400 ml-1 font-normal">from last month</span>
                                    </p>
                                </CardContent>
                            </Card>
                            <Card className="shadow-sm border-gray-100 bg-white">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-500">Total Clicks</CardTitle>
                                    <MousePointerClick className="h-4 w-4 text-gray-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-gray-900">{totalClicks.toLocaleString()}</div>
                                    <p className="text-xs text-green-600 flex items-center mt-1 font-medium">
                                        <ArrowUpRight className="w-3 h-3 mr-1" /> +15.2% <span className="text-gray-400 ml-1 font-normal">from last month</span>
                                    </p>
                                </CardContent>
                            </Card>
                            <Card className="shadow-sm border-gray-100 bg-white">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-500">Click Rate (CTR)</CardTitle>
                                    <Users className="h-4 w-4 text-gray-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-gray-900">{ctr}%</div>
                                    <p className="text-xs text-red-500 flex items-center mt-1 font-medium">
                                        <ArrowDownRight className="w-3 h-3 mr-1" /> -1.2% <span className="text-gray-400 ml-1 font-normal">from last month</span>
                                    </p>
                                </CardContent>
                            </Card>
                            <Card className="shadow-sm border-gray-100 bg-white">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-500">Avg. Time</CardTitle>
                                    <Clock className="h-4 w-4 text-gray-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-gray-900">1m 24s</div>
                                    <p className="text-xs text-gray-400 mt-1">
                                        +0s from last month
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Chart Section */}
                        <Card className="border-gray-100 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold text-gray-900">Activity Growth</CardTitle>
                                <CardDescription>Visualizing your profile views and link clicks trends.</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[350px] w-full pt-4">
                                <ChartContainer config={chartConfig} className="h-full w-full">
                                    <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Area type="monotone" dataKey="views" stroke="#8884d8" strokeWidth={2} fillOpacity={1} fill="url(#colorViews)" />
                                        <Area type="monotone" dataKey="clicks" stroke="#82ca9d" strokeWidth={2} fillOpacity={1} fill="url(#colorClicks)" />
                                    </AreaChart>
                                </ChartContainer>
                            </CardContent>
                        </Card>

                        {/* Bottom Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                            {/* Top Links */}
                            <Card className="border-gray-100 shadow-sm">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle className="text-lg font-semibold text-gray-900">Top Performing Links</CardTitle>
                                        <CardDescription>Your most clicked destinations</CardDescription>
                                    </div>
                                    <Button variant="ghost" size="sm" className="text-purple-600">View All</Button>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {(topLinks.length > 0 ? topLinks : mockTopLinks).map((link, idx) => (
                                        <div key={idx} className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <div className="font-medium text-gray-900">{link.title}</div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-gray-900">{(link.clicks || 0).toLocaleString()}</span>
                                                    {link.change && <span className={`text-xs ${link.change.startsWith('+') ? 'text-green-600' : 'text-red-500'}`}>{link.change}</span>}
                                                </div>
                                            </div>
                                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-purple-500 rounded-full"
                                                    style={{ width: `${((link.clicks || 0) / 1500) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            {/* Device & Location */}
                            <div className="space-y-6">
                                <Card className="border-gray-100 shadow-sm flex-1">
                                    <CardHeader>
                                        <CardTitle className="text-lg font-semibold text-gray-900">Top Locations</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                                <div className="flex items-center gap-3">
                                                    <Globe className="w-5 h-5 text-blue-500" />
                                                    <span className="font-medium text-gray-700">United States</span>
                                                </div>
                                                <span className="font-bold text-gray-900">45%</span>
                                            </div>
                                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                                <div className="flex items-center gap-3">
                                                    <Globe className="w-5 h-5 text-indigo-500" />
                                                    <span className="font-medium text-gray-700">India</span>
                                                </div>
                                                <span className="font-bold text-gray-900">22%</span>
                                            </div>
                                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                                <div className="flex items-center gap-3">
                                                    <Globe className="w-5 h-5 text-green-500" />
                                                    <span className="font-medium text-gray-700">United Kingdom</span>
                                                </div>
                                                <span className="font-bold text-gray-900">12%</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-gray-100 shadow-sm flex-1">
                                    <CardHeader>
                                        <CardTitle className="text-lg font-semibold text-gray-900">Device Analytics</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1 p-4 border border-gray-100 rounded-2xl flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors">
                                                <Smartphone className="w-6 h-6 text-gray-400 mb-2" />
                                                <div className="text-xl font-bold text-gray-900">85%</div>
                                                <div className="text-xs text-gray-500">Mobile</div>
                                            </div>
                                            <div className="flex-1 p-4 border border-gray-100 rounded-2xl flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors">
                                                <Globe className="w-6 h-6 text-gray-400 mb-2" />
                                                <div className="text-xl font-bold text-gray-900">15%</div>
                                                <div className="text-xs text-gray-500">Desktop</div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                    </TabsContent>

                    <TabsContent value="audience" className="space-y-6">
                        {/* Audience Section */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <h3 className="font-semibold text-gray-900">Audience</h3>
                                    <Badge variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-100 text-xs">
                                        Sample data
                                    </Badge>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-400" />
                            </div>

                            <div className="grid grid-cols-3 gap-8">
                                <div>
                                    <Users className="w-5 h-5 text-gray-400 mb-2" />
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl font-bold text-gray-900">3.2k</span>
                                        <span className="text-sm text-green-600 font-medium">7% ↑</span>
                                    </div>
                                    <div className="text-sm text-gray-500">Total audience</div>
                                </div>
                                <div>
                                    <UserPlus className="w-5 h-5 text-gray-400 mb-2" />
                                    <div className="text-2xl font-bold text-gray-900">{subscribers}</div>
                                    <div className="text-sm text-gray-500">Subscriber growth</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-400 mb-2">Top growth tool</div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                                            📚
                                        </div>
                                        <div className="text-sm font-medium text-gray-900">A Buyers' and Sellers' Guide</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Visitors */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <h3 className="font-semibold text-gray-900">Visitors</h3>
                                    <Badge variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-100 text-xs">
                                        Sample data
                                    </Badge>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-400" />
                            </div>

                            <div className="text-gray-600 text-sm leading-relaxed">
                                <p>
                                    Most commonly your visitors are based in <span className="font-semibold text-gray-900">India</span>,
                                    care about <span className="inline-flex items-center gap-1"><span className="text-yellow-500">💡</span> People & Society</span>,
                                    and find you on <span className="inline-flex items-center gap-1"><Instagram className="w-4 h-4 text-pink-500" /> Instagram</span> using
                                    <span className="inline-flex items-center gap-1 ml-1"><Smartphone className="w-4 h-4" /> mobile devices</span>.
                                </p>
                            </div>

                            {/* Mini world map placeholder */}
                            <div className="mt-4 h-20 bg-gray-50 rounded-lg flex items-center justify-center">
                                <Globe className="w-12 h-12 text-purple-200" />
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="content" className="min-h-[300px] flex items-center justify-center text-gray-500">
                        Content performance details go here.
                    </TabsContent>
                </Tabs>

                {/* Feedback */}
                <div className="text-center py-4">
                    <p className="text-sm text-gray-600">
                        <span className="font-semibold">Got ideas?</span> We're listening!
                        <a href="#" className="text-purple-600 hover:underline ml-1">Share feedback</a>
                    </p>
                </div>

            </div>
        </LinktreeLayout>
    );
};

export default Analytics;
