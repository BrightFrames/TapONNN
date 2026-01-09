
import LinktreeLayout from "@/layouts/LinktreeLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import {
    Activity,
    ArrowUpRight,
    Copy,
    ExternalLink,
    Eye,
    Link2,
    MousePointerClick,
    Share2,
    Sparkles,
    Users,
    Zap,
    TrendingUp,
    ShoppingBag,
    Instagram,
    Globe
} from "lucide-react";
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
    const { user, links } = useAuth();

    // Use real user data or fallback
    const userName = user?.name || "Creator";
    const username = user?.username || "user";
    const userInitial = userName[0]?.toUpperCase() || "U";

    // Mock analytics data
    const stats = {
        totalViews: 128400,
        totalClicks: 42800,
        subscribers: 1204,
        ctr: 33.4,
        topLink: links[0] || { title: 'Instagram', clicks: 1240 }
    };

    const activityFeed = [
        { id: 1, type: "click", text: `Someone clicked on '${links[0]?.title || "Instagram"}'`, time: "2 mins ago", icon: MousePointerClick, color: "text-blue-500", bg: "bg-blue-100" },
        { id: 2, type: "subscribe", text: "New subscriber: alex_j", time: "15 mins ago", icon: Users, color: "text-emerald-500", bg: "bg-emerald-100" },
        { id: 3, type: "view", text: "Profile reached 1k views today", time: "1 hour ago", icon: TrendingUp, color: "text-violet-500", bg: "bg-violet-100" },
        { id: 4, type: "sale", text: "New sale: Digital Art Pack", time: "2 hours ago", icon: ShoppingBag, color: "text-amber-500", bg: "bg-amber-100" },
    ];

    const chartData = [
        { name: 'Mon', views: 400, clicks: 120 },
        { name: 'Tue', views: 300, clicks: 90 },
        { name: 'Wed', views: 550, clicks: 180 },
        { name: 'Thu', views: 450, clicks: 140 },
        { name: 'Fri', views: 600, clicks: 200 },
        { name: 'Sat', views: 800, clicks: 280 },
        { name: 'Sun', views: 950, clicks: 350 },
    ];

    const copyLink = () => {
        navigator.clipboard.writeText(`linktr.ee/${username}`);
    };

    return (
        <LinktreeLayout>
            <div className="flex h-full">
                {/* Main Content */}
                <div className="flex-1 max-w-4xl py-8 px-6 md:px-10 overflow-y-auto">

                    {/* Welcome Card - Premium Glassmorphism */}
                    <div className="relative mb-8 rounded-3xl overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600" />
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cGF0aCBkPSJNLTEwIDMwaDYwdjJoLTYweiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNhKSIvPjwvc3ZnPg==')] opacity-50" />
                        <div className="relative p-8 flex items-center justify-between">
                            <div className="flex items-center gap-5">
                                <Avatar className="w-16 h-16 border-4 border-white/30 shadow-xl">
                                    <AvatarImage src={user?.avatar} />
                                    <AvatarFallback className="bg-white/20 text-white text-2xl font-bold backdrop-blur-sm">
                                        {userInitial}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-white/70 text-sm font-medium mb-1">Welcome back,</p>
                                    <h1 className="text-2xl font-bold text-white tracking-tight">{userName}</h1>
                                    <p className="text-white/60 text-sm mt-0.5">@{username}</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <Button
                                    variant="secondary"
                                    className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm rounded-full gap-2"
                                    onClick={copyLink}
                                >
                                    <Copy className="w-4 h-4" /> Copy Link
                                </Button>
                                <Button className="bg-white text-purple-700 hover:bg-white/90 rounded-full gap-2 font-semibold shadow-lg">
                                    <Share2 className="w-4 h-4" /> Share
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid - Premium Cards */}
                    <div className="grid gap-4 md:grid-cols-4 mb-8">
                        <Card className="bg-gradient-to-br from-violet-500 to-purple-600 text-white border-none shadow-lg shadow-purple-200/50 hover:shadow-xl transition-shadow">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                                        <Eye className="w-5 h-5" />
                                    </div>
                                    <Badge className="bg-white/20 text-white border-none text-[10px]">Lifetime</Badge>
                                </div>
                                <div className="text-3xl font-bold mb-0.5">{(stats.totalViews / 1000).toFixed(1)}k</div>
                                <p className="text-white/70 text-sm">Total Views</p>
                            </CardContent>
                        </Card>

                        <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow bg-white">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl">
                                        <MousePointerClick className="w-5 h-5" />
                                    </div>
                                    <div className="flex items-center text-emerald-600 text-xs font-semibold bg-emerald-50 px-2 py-1 rounded-full">
                                        <ArrowUpRight className="w-3 h-3 mr-0.5" /> 12%
                                    </div>
                                </div>
                                <div className="text-3xl font-bold mb-0.5 text-gray-900">{(stats.totalClicks / 1000).toFixed(1)}k</div>
                                <p className="text-gray-500 text-sm">Total Clicks</p>
                            </CardContent>
                        </Card>

                        <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow bg-white">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-xl">
                                        <Users className="w-5 h-5" />
                                    </div>
                                    <div className="flex items-center text-emerald-600 text-xs font-semibold bg-emerald-50 px-2 py-1 rounded-full">
                                        <ArrowUpRight className="w-3 h-3 mr-0.5" /> 5%
                                    </div>
                                </div>
                                <div className="text-3xl font-bold mb-0.5 text-gray-900">{stats.subscribers.toLocaleString()}</div>
                                <p className="text-gray-500 text-sm">Subscribers</p>
                            </CardContent>
                        </Card>

                        <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow bg-white">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="p-2.5 bg-amber-100 text-amber-600 rounded-xl">
                                        <TrendingUp className="w-5 h-5" />
                                    </div>
                                </div>
                                <div className="text-3xl font-bold mb-0.5 text-gray-900">{stats.ctr}%</div>
                                <p className="text-gray-500 text-sm">Click Rate</p>
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
                                    <Badge variant="outline" className="text-xs">This Week</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <ResponsiveContainer width="100%" height={220}>
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="colorViews2" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={11} stroke="#9ca3af" />
                                        <YAxis axisLine={false} tickLine={false} fontSize={11} stroke="#9ca3af" />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '12px' }}
                                        />
                                        <Area type="monotone" dataKey="views" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorViews2)" />
                                        <Area type="monotone" dataKey="clicks" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorClicks)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Activity Feed */}
                        <Card className="md:col-span-2 border border-gray-100">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-amber-500" /> Recent Activity
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {activityFeed.map((item) => (
                                        <div key={item.id} className="flex gap-3 items-start">
                                            <div className={`p-2 rounded-xl shrink-0 ${item.bg} ${item.color}`}>
                                                <item.icon className="w-4 h-4" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-gray-800 truncate">{item.text}</p>
                                                <p className="text-xs text-gray-400 mt-0.5">{item.time}</p>
                                            </div>
                                        </div>
                                    ))}
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
                                    <div key={link.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-amber-700'}`}>
                                                {index + 1}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900">{link.title}</h4>
                                                <p className="text-xs text-gray-500 truncate max-w-[200px]">{link.url}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-gray-900">{link.clicks?.toLocaleString() || 0}</div>
                                            <div className="text-xs text-gray-500">clicks</div>
                                        </div>
                                    </div>
                                ))}
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
                            <div className="h-8 w-full bg-[#132c25] flex items-center justify-between px-8 text-[10px] text-white font-medium pt-1">
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
                            <div className="h-full w-full bg-[#132c25] overflow-y-auto text-white p-6 pb-20">
                                {/* Share Button */}
                                <div className="absolute top-12 right-6 w-8 h-8 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                                    <ExternalLink className="w-4 h-4 text-white/70" />
                                </div>

                                <div className="flex flex-col items-center mt-8 space-y-3">
                                    <Avatar className="w-24 h-24 border-4 border-white/20 shadow-xl">
                                        <AvatarImage src={user?.avatar} />
                                        <AvatarFallback className="bg-gray-400 text-white text-3xl font-bold">
                                            {userInitial}
                                        </AvatarFallback>
                                    </Avatar>
                                    <h2 className="text-xl font-bold tracking-tight">@{username}</h2>
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                                            <Instagram className="w-4 h-4" />
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                                            <Globe className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 space-y-3">
                                    {links.filter(l => l.isActive).map((link) => (
                                        <a
                                            key={link.id}
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block w-full py-4 px-6 bg-[#e9f6e3] text-[#132c25] rounded-full text-center font-semibold hover:scale-[1.02] active:scale-[0.98] transition-transform text-sm shadow-lg"
                                        >
                                            {link.title}
                                        </a>
                                    ))}
                                </div>

                                {/* Footer */}
                                <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center gap-2 px-6">
                                    <button className="bg-white text-black px-5 py-2.5 rounded-full text-xs font-bold shadow-lg hover:shadow-xl transition-shadow">
                                        Join @{username} on Tap2
                                    </button>
                                    <div className="text-[10px] text-white/30">Powered by Tap2</div>
                                </div>
                            </div>
                        </div>

                        {/* Preview Label */}
                        <div className="text-center mt-6">
                            <p className="text-sm font-medium text-gray-600">Live Preview</p>
                            <p className="text-xs text-gray-400 mt-1">This is how your profile looks</p>
                        </div>
                    </div>
                </div>
            </div>
        </LinktreeLayout>
    );
};

export default Overview;
