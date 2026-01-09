
import { useState } from "react";
import LinktreeLayout from "@/layouts/LinktreeLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import {
    Eye,
    MousePointerClick,
    Percent,
    Users,
    DollarSign,
    Info,
    ChevronRight,
    ChevronDown,
    UserPlus,
    Globe,
    Smartphone,
    Instagram,
    Lock
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Analytics = () => {
    const { user, links } = useAuth();
    const [dateRange, setDateRange] = useState("Last 7 days");

    // Calculate real stats from links
    const totalClicks = links.reduce((sum, link) => sum + (link.clicks || 0), 0);
    const totalViews = Math.round(totalClicks * 3.2); // Estimated views based on clicks
    const clickRate = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : "0";
    const subscribers = 34; // Mock subscriber count
    const earnings = 0;

    // Sort links by clicks for "Most clicked" section
    const topLinks = [...links].sort((a, b) => (b.clicks || 0) - (a.clicks || 0)).slice(0, 5);

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
            <div className="flex-1 py-8 px-6 md:px-10 overflow-y-auto bg-gray-50/50">
                <div className="max-w-5xl mx-auto">

                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">Insights</h1>
                        <Button variant="ghost" size="icon" className="text-gray-400">
                            <Info className="w-5 h-5" />
                        </Button>
                    </div>

                    {/* Lifetime Totals */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
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

                    {/* Date Range Selector */}
                    <div className="mb-6">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="rounded-full px-5 h-10 text-sm font-medium border-gray-900 gap-2">
                                    {dateRange}
                                    <ChevronDown className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-52 rounded-xl p-2">
                                {dateOptions.map((option) => (
                                    <DropdownMenuItem
                                        key={option.label}
                                        className="flex items-center justify-between rounded-lg"
                                        onClick={() => !option.locked && setDateRange(option.label)}
                                        disabled={option.locked}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-4 h-4 rounded-full border-2 ${dateRange === option.label ? 'border-gray-900 bg-gray-900' : 'border-gray-300'}`} />
                                            <span>{option.label}</span>
                                        </div>
                                        {option.locked && (
                                            <Badge variant="outline" className="text-[10px] gap-1 px-2">
                                                <Lock className="w-3 h-3" /> Upgrade
                                            </Badge>
                                        )}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Content Grid */}
                    <div className="grid md:grid-cols-2 gap-6 mb-6">

                        {/* Most Clicked */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <h3 className="font-semibold text-gray-900">Most clicked</h3>
                                    <Badge variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-100 text-xs">
                                        Real data
                                    </Badge>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-400" />
                            </div>

                            <div className="space-y-4">
                                {topLinks.length > 0 ? topLinks.map((link, index) => (
                                    <div key={link.id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold ${index === 0 ? 'bg-red-500' : index === 1 ? 'bg-gray-400' : 'bg-blue-500'
                                                }`}>
                                                {link.title[0]}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900 text-sm">{link.title}</div>
                                                <div className="text-xs text-gray-400 truncate max-w-[150px]">{link.url}</div>
                                            </div>
                                        </div>
                                        <div className="font-semibold text-gray-900">
                                            {(link.clicks || 0) >= 1000
                                                ? `${((link.clicks || 0) / 1000).toFixed(1)}k`
                                                : link.clicks || 0
                                            }
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-8 text-gray-400 text-sm">
                                        No clicks yet. Share your links!
                                    </div>
                                )}
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
                    </div>

                    {/* Audience Section */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
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
                                    <div className="text-sm font-medium text-gray-900">A Buyers' and Sellers' Guide to Multiple Offer Negotiations</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Feedback */}
                    <div className="text-center py-4">
                        <p className="text-sm text-gray-600">
                            <span className="font-semibold">Got ideas?</span> We're listening!
                            <a href="#" className="text-purple-600 hover:underline ml-1">Share feedback</a>
                        </p>
                    </div>

                </div>
            </div>
        </LinktreeLayout>
    );
};

export default Analytics;
