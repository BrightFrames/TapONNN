import LinktreeLayout from "@/layouts/LinktreeLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { ArrowUpRight, ArrowDownRight, MousePointerClick, Eye, Users, Clock, Globe, Smartphone, ExternalLink } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

// Mock Data for Charts
const chartData = [
    { date: "Jan 01", views: 120, clicks: 45 },
    { date: "Jan 02", views: 155, clicks: 52 },
    { date: "Jan 03", views: 250, clicks: 89 },
    { date: "Jan 04", views: 180, clicks: 65 },
    { date: "Jan 05", views: 320, clicks: 120 },
    { date: "Jan 06", views: 290, clicks: 95 },
    { date: "Jan 07", views: 450, clicks: 160 },
];

const chartConfig = {
    views: {
        label: "Views",
        color: "#8884d8", // Fallback, usually use CSS variables
    },
    clicks: {
        label: "Clicks",
        color: "#82ca9d",
    },
};

const Analytics = () => {
    const { links } = useAuth();
    const [timeRange, setTimeRange] = useState("7d");

    // Mock calculations or use real data if available
    const totalViews = 15420;
    const totalClicks = 4250;
    const ctr = ((totalClicks / totalViews) * 100).toFixed(1);

    // Sort links by simulated performance or mock data
    const topLinks = [
        { title: "My Portfolio", url: "/portfolio", clicks: 1250, change: "+12%" },
        { title: "YouTube Channel", url: "youtube.com/user", clicks: 890, change: "+5%" },
        { title: "Latest Blog Post", url: "/blog/new", clicks: 650, change: "-2%" },
        { title: "Instagram", url: "instagram.com/user", clicks: 420, change: "+8%" },
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
                                    {topLinks.map((link, idx) => (
                                        <div key={idx} className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <div className="font-medium text-gray-900">{link.title}</div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-gray-900">{link.clicks.toLocaleString()}</span>
                                                    <span className={`text-xs ${link.change.startsWith('+') ? 'text-green-600' : 'text-red-500'}`}>{link.change}</span>
                                                </div>
                                            </div>
                                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-purple-500 rounded-full"
                                                    style={{ width: `${(link.clicks / 1500) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            {/* Device & Location (Simplified for UI Demo) */}
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

                    <TabsContent value="audience" className="min-h-[300px] flex items-center justify-center text-gray-500">
                        Audience analytics content goes here.
                    </TabsContent>
                    <TabsContent value="content" className="min-h-[300px] flex items-center justify-center text-gray-500">
                        Content performance details go here.
                    </TabsContent>
                </Tabs>
            </div>
        </LinktreeLayout>
    );
};

export default Analytics;
