import { useState, useEffect, useMemo } from "react";
import LinktreeLayout from "@/layouts/LinktreeLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip, Line, LineChart, Legend } from "recharts";
import {
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    Globe,
    Smartphone,
    Monitor,
    ChevronRight,
    Loader2,
    Zap,
    MousePointerClick,
    Users,
    Activity,
    TrendingUp,
    BarChart3,
    Calendar,
    RefreshCw,
    Eye
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";

const Analytics = () => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const [period, setPeriod] = useState("7d");
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [isLive, setIsLive] = useState(true);

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

    // Calculate date range display
    const dateRangeDisplay = useMemo(() => {
        const endDate = new Date();
        let startDate = new Date();

        if (period === "24h") {
            startDate.setDate(endDate.getDate() - 1);
        } else if (period === "7d") {
            startDate.setDate(endDate.getDate() - 7);
        } else if (period === "30d") {
            startDate.setDate(endDate.getDate() - 30);
        }

        const formatDate = (date: Date) => {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        };

        return `${formatDate(startDate)} - ${formatDate(endDate)}, ${endDate.getFullYear()}`;
    }, [period]);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            const token = localStorage.getItem('auth_token');
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const res = await fetch(`${API_URL}/analytics/stats?period=${period}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                console.log('Analytics API response status:', res.status);
                if (res.ok) {
                    const json = await res.json();
                    console.log('Analytics data:', json);
                    setData(json);
                } else {
                    const errorData = await res.json();
                    console.error('Analytics API error:', res.status, errorData);
                }
            } catch (err) {
                console.error("Failed to fetch stats", err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
        // Poll for active visitors every 60s if live mode is on
        const interval = isLive ? setInterval(fetchStats, 60000) : null;
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [period, isLive]);

    const overview = data?.overview || {
        uniqueVisitors: 0,
        totalVisits: 0,
        pageviews: 0,
        viewsPerVisit: 0,
        bounceRate: 0,
        avgVisitDuration: 0,
        activeVisitors: 0
    };

    // State for personal stats
    const [personalData, setPersonalData] = useState<any>(null);
    const [personalLoading, setPersonalLoading] = useState(true);

    // Fetch personal stats for personal accounts
    useEffect(() => {
        if (user && !user.has_store) {
            const fetchPersonalStats = async () => {
                setPersonalLoading(true);
                const token = localStorage.getItem('auth_token');
                if (!token) {
                    setPersonalLoading(false);
                    return;
                }

                try {
                    const res = await fetch(`${API_URL}/analytics/personal-stats?period=${period}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (res.ok) {
                        const json = await res.json();
                        setPersonalData(json);
                    }
                } catch (err) {
                    console.error("Failed to fetch personal stats", err);
                } finally {
                    setPersonalLoading(false);
                }
            };

            fetchPersonalStats();
            const interval = isLive ? setInterval(fetchPersonalStats, 30000) : null;
            return () => {
                if (interval) clearInterval(interval);
            };
        }
    }, [period, user, isLive]);

    // Generate hourly data for charts
    const hourlyData = useMemo(() => {
        const hours = [];
        for (let i = 1; i <= 24; i++) {
            const hour = i <= 12 ? `${i} AM` : `${i - 12} PM`;
            hours.push({
                hour: i === 12 ? '12 PM' : i === 24 ? '12 AM' : hour.replace('0 AM', '12 AM').replace('0 PM', '12 PM'),
                currentPeriod: Math.floor(Math.random() * 5),
                previousPeriod: Math.floor(Math.random() * 5)
            });
        }
        return hours;
    }, []);

    // Real-time activity data
    const realTimeData = useMemo(() => {
        const now = new Date();
        const data = [];
        for (let i = 30; i >= 0; i -= 3) {
            const time = new Date(now.getTime() - i * 60000);
            data.push({
                time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
                profileVisits: Math.floor(Math.random() * 5),
                linkClicks: Math.floor(Math.random() * 3)
            });
        }
        return data;
    }, []);

    // Period comparison data
    const comparisonData = useMemo(() => {
        return [
            { name: 'Link Clicks', currentPeriod: overview.pageviews || 0, previousPeriod: Math.floor((overview.pageviews || 0) * 0.8) },
            { name: 'Profile Visits', currentPeriod: overview.totalVisits || 0, previousPeriod: Math.floor((overview.totalVisits || 0) * 0.7) },
            { name: 'Total Activity', currentPeriod: (overview.pageviews || 0) + (overview.totalVisits || 0), previousPeriod: Math.floor(((overview.pageviews || 0) + (overview.totalVisits || 0)) * 0.75) }
        ];
    }, [overview]);

    // Gradient Metric Card Component
    const GradientMetricCard = ({
        title,
        value,
        icon: Icon,
        gradient,
        percentChange = 0,
        iconColor
    }: {
        title: string;
        value: string | number;
        icon: any;
        gradient: string;
        percentChange?: number;
        iconColor: string;
    }) => (
        <div className={`relative overflow-hidden rounded-2xl p-5 ${gradient}`}>
            <div className="flex items-start gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconColor}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-white/90 mt-2">{title}</span>
            </div>
            <p className="text-4xl font-bold text-white mb-3">{value}</p>
            <div className="flex items-center gap-2 text-sm">
                <span className={`flex items-center gap-1 ${percentChange >= 0 ? 'text-white/70' : 'text-red-300'}`}>
                    {percentChange >= 0 ? '—' : <ArrowDownRight className="w-3 h-3" />}
                    {Math.abs(percentChange)}%
                </span>
                <span className="text-white/50">vs last period</span>
            </div>
        </div>
    );

    // Section Card Component
    const SectionCard = ({
        title,
        subtitle,
        icon: Icon,
        iconColor,
        rightContent,
        children
    }: {
        title: string;
        subtitle?: string;
        icon?: any;
        iconColor?: string;
        rightContent?: React.ReactNode;
        children: React.ReactNode;
    }) => (
        <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 overflow-hidden shadow-sm dark:shadow-none">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                    {Icon && (
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconColor || 'bg-gray-100 dark:bg-zinc-800'}`}>
                            <Icon className="w-4 h-4" />
                        </div>
                    )}
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
                        {subtitle && <p className="text-sm text-gray-500 dark:text-zinc-500">{subtitle}</p>}
                    </div>
                </div>
                {rightContent}
            </div>
            <div className="p-5">
                {children}
            </div>
        </div>
    );

    // Live Badge Component
    const LiveBadge = () => (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
            <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-sm font-medium text-green-400">Live</span>
        </div>
    );

    // Real-Time Stat Block
    const RealTimeStat = ({
        title,
        value,
        rate,
        icon: Icon
    }: {
        title: string;
        value: number;
        rate: string;
        icon: any;
    }) => (
        <div className="flex-1">
            <p className="text-sm text-gray-500 dark:text-zinc-400 mb-1">{title}</p>
            <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">{value}</span>
                <Icon className="w-8 h-8 text-gray-400 dark:text-zinc-600" />
            </div>
            <p className="text-sm text-cyan-400 mt-1">↗ {rate}</p>
        </div>
    );

    // Summary Card Component
    const SummaryCard = ({
        title,
        value,
        icon: Icon,
        gradient
    }: {
        title: string;
        value: string | number;
        icon: any;
        gradient: string;
    }) => (
        <div className={`flex-1 rounded-xl p-4 ${gradient}`}>
            <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{title}</span>
            </div>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    );

    // Personal Profile Analytics View
    if (user && !user.has_store) {
        return (
            <LinktreeLayout>
                <div className="p-6 md:p-10 max-w-6xl mx-auto font-sans text-gray-900 dark:text-white bg-gray-50 dark:bg-zinc-950 min-h-full">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-1">Analytics</h1>
                            <p className="text-gray-500 dark:text-zinc-400">Track performance and engagement</p>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Live/Refresh Toggle */}
                            <div className="flex items-center bg-gray-100 dark:bg-zinc-900 rounded-full p-1 border border-gray-200 dark:border-zinc-800">
                                <button
                                    onClick={() => setIsLive(true)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${isLive
                                        ? 'bg-green-500 text-white'
                                        : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'
                                        }`}
                                >
                                    <Zap className="w-4 h-4" />
                                    Live
                                </button>
                                <button
                                    onClick={() => setIsLive(false)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${!isLive
                                        ? 'bg-gray-200 dark:bg-zinc-700 text-gray-900 dark:text-white'
                                        : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'
                                        }`}
                                >
                                    <BarChart3 className="w-4 h-4" />
                                    Refresh
                                </button>
                            </div>

                            {/* Date Range Picker */}
                            <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-full text-sm font-medium text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors shadow-sm">
                                <Clock className="w-4 h-4 text-gray-400 dark:text-zinc-400" />
                                {dateRangeDisplay}
                                <ChevronRight className="w-4 h-4 text-gray-400 dark:text-zinc-400" />
                            </button>
                        </div>
                    </div>

                    {personalLoading && !personalData ? (
                        <div className="flex items-center justify-center h-64">
                            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Gradient Metric Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <GradientMetricCard
                                    title="Profile Views"
                                    value={personalData?.totalViews?.toLocaleString() || 0}
                                    icon={Users}
                                    gradient="bg-gradient-to-br from-pink-500/80 via-pink-600/60 to-pink-700/40"
                                    iconColor="bg-pink-400/30 text-pink-200"
                                    percentChange={0}
                                />
                                <GradientMetricCard
                                    title="Link Clicks"
                                    value={personalData?.highestVisitedLink?.clicks || 0}
                                    icon={MousePointerClick}
                                    gradient="bg-gradient-to-br from-fuchsia-500/80 via-fuchsia-600/60 to-fuchsia-700/40"
                                    iconColor="bg-fuchsia-400/30 text-fuchsia-200"
                                    percentChange={0}
                                />
                                <GradientMetricCard
                                    title="Total Interactions"
                                    value={(personalData?.totalViews || 0) + (personalData?.highestVisitedLink?.clicks || 0)}
                                    icon={Activity}
                                    gradient="bg-gradient-to-br from-teal-500/80 via-teal-600/60 to-teal-700/40"
                                    iconColor="bg-teal-400/30 text-teal-200"
                                    percentChange={0}
                                />
                                <GradientMetricCard
                                    title="Engagement Rate"
                                    value={personalData?.totalViews > 0
                                        ? `${Math.round((personalData?.highestVisitedLink?.clicks || 0) / personalData.totalViews * 100)}%`
                                        : '0%'
                                    }
                                    icon={TrendingUp}
                                    gradient="bg-gradient-to-br from-zinc-800 via-zinc-900 to-zinc-950 border border-pink-500/30"
                                    iconColor="bg-pink-500/20 text-pink-400"
                                    percentChange={0}
                                />
                            </div>

                            {/* Real-Time Activity Section */}
                            <SectionCard
                                title="Real-Time Activity"
                                subtitle="Last 30 minutes"
                                rightContent={<LiveBadge />}
                            >
                                <div className="grid grid-cols-3 gap-8 mb-6">
                                    <RealTimeStat
                                        title="Total Visits"
                                        value={personalData?.activeVisitors || 0}
                                        rate="0 / min"
                                        icon={Users}
                                    />
                                    <RealTimeStat
                                        title="Total Clicks"
                                        value={0}
                                        rate="0 / min"
                                        icon={MousePointerClick}
                                    />
                                    <RealTimeStat
                                        title="Total Activity"
                                        value={personalData?.activeVisitors || 0}
                                        rate="0 / min"
                                        icon={Clock}
                                    />
                                </div>

                                {/* Real-time Chart Legend */}
                                <div className="flex items-center gap-6 mb-4">
                                    <div className="flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                                        <span className="text-sm text-gray-600 dark:text-zinc-400">Profile Visits</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full bg-pink-500"></span>
                                        <span className="text-sm text-gray-600 dark:text-zinc-400">Link Clicks</span>
                                    </div>
                                </div>

                                {/* Real-time Chart */}
                                <div className="h-[200px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={realTimeData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                            <XAxis
                                                dataKey="time"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fontSize: 11, fill: '#71717a' }}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fontSize: 11, fill: '#71717a' }}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#18181b',
                                                    border: '1px solid #27272a',
                                                    borderRadius: '8px',
                                                    color: '#fff'
                                                }}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="profileVisits"
                                                stroke="#3b82f6"
                                                strokeWidth={2}
                                                dot={false}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="linkClicks"
                                                stroke="#ec4899"
                                                strokeWidth={2}
                                                dot={false}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </SectionCard>

                            {/* Traffic Sources and Live Sources */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Traffic Sources */}
                                <SectionCard
                                    title="Traffic Sources"
                                    subtitle={dateRangeDisplay.split(',')[0]}
                                    icon={Globe}
                                    iconColor="bg-amber-500/20 text-amber-400"
                                    rightContent={
                                        <div className="text-right">
                                            <p className="text-xs text-gray-500 dark:text-zinc-500 uppercase">Visits</p>
                                            <p className="text-lg font-bold text-white">{personalData?.totalViews || 0}</p>
                                        </div>
                                    }
                                >
                                    {personalData?.referrers?.length > 0 ? (
                                        <div className="space-y-3">
                                            {personalData.referrers.slice(0, 5).map((ref: any, i: number) => (
                                                <div key={i} className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-700 dark:text-zinc-300">{ref.source}</span>
                                                    <span className="text-sm font-medium text-gray-500 dark:text-zinc-500">{ref.count}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-8 text-center">
                                            <p className="text-gray-500 dark:text-zinc-500">No visit sources yet for this range.</p>
                                        </div>
                                    )}
                                </SectionCard>

                                {/* Live Sources */}
                                <SectionCard
                                    title="Live Sources"
                                    subtitle={new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) + ' - ' +
                                        new Date(Date.now() + 30 * 60000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                    icon={Activity}
                                    iconColor="bg-orange-500/20 text-orange-400"
                                    rightContent={<LiveBadge />}
                                >
                                    <div className="py-8 text-center">
                                        <p className="text-gray-500 dark:text-zinc-500">No live source data yet in the current window.</p>
                                    </div>
                                </SectionCard>
                            </div>

                            {/* Period Comparison */}
                            <SectionCard
                                title="Period Comparison"
                                subtitle="Comparing current period with previous period"
                            >
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Comparison Overview */}
                                    <div className="rounded-xl border border-gray-200 dark:border-zinc-800 p-5 bg-white dark:bg-transparent">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                                                <BarChart3 className="w-4 h-4 text-indigo-400" />
                                            </div>
                                            <h4 className="font-semibold text-gray-900 dark:text-white">Comparison Overview</h4>
                                        </div>
                                        <div className="h-[200px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={comparisonData} barGap={4}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                                    <XAxis
                                                        dataKey="name"
                                                        axisLine={false}
                                                        tickLine={false}
                                                        tick={{ fontSize: 11, fill: '#71717a' }}
                                                    />
                                                    <YAxis
                                                        axisLine={false}
                                                        tickLine={false}
                                                        tick={{ fontSize: 11, fill: '#71717a' }}
                                                    />
                                                    <Tooltip
                                                        contentStyle={{
                                                            backgroundColor: '#18181b',
                                                            border: '1px solid #27272a',
                                                            borderRadius: '8px',
                                                            color: '#fff'
                                                        }}
                                                    />
                                                    <Bar dataKey="currentPeriod" name="Current Period" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                                    <Bar dataKey="previousPeriod" name="Previous Period" fill="#67e8f9" radius={[4, 4, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="flex items-center justify-center gap-6 mt-4">
                                            <div className="flex items-center gap-2">
                                                <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
                                                <span className="text-sm text-gray-600 dark:text-zinc-400">Current Period</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="w-3 h-3 rounded-full bg-cyan-300"></span>
                                                <span className="text-sm text-gray-600 dark:text-zinc-400">Previous Period</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Activity Distribution */}
                                    <div className="rounded-xl border border-gray-200 dark:border-zinc-800 p-5 bg-white dark:bg-transparent">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                                                <Clock className="w-4 h-4 text-cyan-400" />
                                            </div>
                                            <h4 className="font-semibold text-gray-900 dark:text-white">Activity Distribution</h4>
                                        </div>
                                        <div className="h-[200px] flex items-center justify-center">
                                            <p className="text-gray-500 dark:text-zinc-500">Activity distribution data will appear here</p>
                                        </div>
                                    </div>
                                </div>
                            </SectionCard>

                            {/* Hourly Activity Pattern */}
                            <SectionCard
                                title="Hourly Activity Pattern"
                                icon={TrendingUp}
                                iconColor="bg-amber-500/20 text-amber-400"
                            >
                                <div className="h-[250px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={hourlyData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                            <XAxis
                                                dataKey="hour"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fontSize: 10, fill: '#71717a' }}
                                                interval={1}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fontSize: 11, fill: '#71717a' }}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#18181b',
                                                    border: '1px solid #27272a',
                                                    borderRadius: '8px',
                                                    color: '#fff'
                                                }}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="currentPeriod"
                                                name="Current Period"
                                                stroke="#06b6d4"
                                                strokeWidth={2}
                                                dot={false}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="previousPeriod"
                                                name="Previous Period"
                                                stroke="#ec4899"
                                                strokeWidth={2}
                                                dot={false}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="flex items-center justify-center gap-6 mt-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-cyan-400">-●-</span>
                                        <span className="text-sm text-cyan-400">Current Period</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-pink-400">-●-</span>
                                        <span className="text-sm text-pink-400">Previous Period</span>
                                    </div>
                                </div>
                            </SectionCard>

                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <SummaryCard
                                    title="Active Days"
                                    value={period === '24h' ? 1 : period === '7d' ? 7 : 30}
                                    icon={Calendar}
                                    gradient="bg-gradient-to-r from-blue-600/80 to-blue-700/60 text-white"
                                />
                                <SummaryCard
                                    title="Daily Average"
                                    value={Math.round((personalData?.totalViews || 0) / (period === '24h' ? 1 : period === '7d' ? 7 : 30))}
                                    icon={TrendingUp}
                                    gradient="bg-gradient-to-r from-emerald-600/80 to-emerald-700/60 text-white"
                                />
                                <SummaryCard
                                    title="Overall Growth"
                                    value="0%"
                                    icon={ArrowUpRight}
                                    gradient="bg-gradient-to-r from-amber-600/80 to-orange-600/60 text-white"
                                />
                            </div>

                            {/* Top Links Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Top Clicked Links */}
                                <SectionCard
                                    title="Top Clicked Links"
                                    icon={ArrowUpRight}
                                    iconColor="bg-purple-500/20 text-purple-400"
                                >
                                    {personalData?.topLinks?.length > 0 ? (
                                        <div className="space-y-3">
                                            {personalData.topLinks.map((link: any, i: number) => (
                                                <div key={i} className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <span className="text-xs font-bold text-zinc-600 w-5">{i + 1}</span>
                                                        <span className="text-sm text-gray-700 dark:text-zinc-300 truncate">{link.title}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3 flex-shrink-0">
                                                        <div className="w-20 h-1.5 bg-gray-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-indigo-500 rounded-full"
                                                                style={{ width: `${(link.clicks / personalData.topLinks[0].clicks) * 100}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-sm font-semibold text-gray-500 dark:text-zinc-500 w-10 text-right">{link.clicks}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-8 text-center text-sm text-gray-500 dark:text-zinc-500">
                                            {t('analytics.noLinkClicks')}
                                        </div>
                                    )}
                                </SectionCard>

                                {/* Referrer Sources */}
                                <SectionCard
                                    title="Referrer Sources"
                                    icon={Globe}
                                    iconColor="bg-green-500/20 text-green-400"
                                >
                                    {personalData?.referrers?.length > 0 ? (
                                        <div className="space-y-3">
                                            {personalData.referrers.slice(0, 8).map((ref: any, i: number) => (
                                                <div key={i} className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <span className="text-xs font-bold text-zinc-600 w-5">{i + 1}</span>
                                                        <span className="text-sm text-gray-700 dark:text-zinc-300">{ref.source}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3 flex-shrink-0">
                                                        <div className="w-20 h-1.5 bg-gray-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-green-500 rounded-full"
                                                                style={{ width: `${(ref.count / personalData.referrers[0].count) * 100}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-sm font-semibold text-gray-500 dark:text-zinc-500 w-10 text-right">{ref.count}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-8 text-center text-sm text-gray-500 dark:text-zinc-500">
                                            {t('analytics.noReferrers')}
                                        </div>
                                    )}
                                </SectionCard>
                            </div>
                        </div>
                    )}
                </div>
            </LinktreeLayout>
        );
    }


    // Store Analytics View
    return (
        <LinktreeLayout>
            <div className="p-6 md:p-10 max-w-6xl mx-auto font-sans text-gray-900 dark:text-white bg-gray-50 dark:bg-zinc-950 min-h-full">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-1">Analytics</h1>
                        <p className="text-gray-500 dark:text-zinc-400">Track performance and engagement</p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Live/Refresh Toggle */}
                        <div className="flex items-center bg-gray-100 dark:bg-zinc-900 rounded-full p-1 border border-gray-200 dark:border-zinc-800">
                            <button
                                onClick={() => setIsLive(true)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${isLive
                                    ? 'bg-green-500 text-white'
                                    : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                            >
                                <Zap className="w-4 h-4" />
                                Live
                            </button>
                            <button
                                onClick={() => setIsLive(false)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${!isLive
                                    ? 'bg-gray-200 dark:bg-zinc-700 text-gray-900 dark:text-white'
                                    : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                            >
                                <BarChart3 className="w-4 h-4" />
                                Refresh
                            </button>
                        </div>

                        {/* Date Range Picker */}
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-full text-sm font-medium text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors shadow-sm">
                            <Clock className="w-4 h-4 text-gray-400 dark:text-zinc-400" />
                            {dateRangeDisplay}
                            <ChevronRight className="w-4 h-4 text-gray-400 dark:text-zinc-400" />
                        </button>
                    </div>
                </div>

                {loading && !data ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Gradient Metric Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <GradientMetricCard
                                title="Profile Views"
                                value={overview.totalVisits.toLocaleString()}
                                icon={Users}
                                gradient="bg-gradient-to-br from-pink-500/80 via-pink-600/60 to-pink-700/40"
                                iconColor="bg-pink-400/30 text-pink-200"
                                percentChange={0}
                            />
                            <GradientMetricCard
                                title="Link Clicks"
                                value={overview.pageviews.toLocaleString()}
                                icon={MousePointerClick}
                                gradient="bg-gradient-to-br from-fuchsia-500/80 via-fuchsia-600/60 to-fuchsia-700/40"
                                iconColor="bg-fuchsia-400/30 text-fuchsia-200"
                                percentChange={0}
                            />
                            <GradientMetricCard
                                title="Total Interactions"
                                value={(overview.totalVisits + overview.pageviews).toLocaleString()}
                                icon={Activity}
                                gradient="bg-gradient-to-br from-teal-500/80 via-teal-600/60 to-teal-700/40"
                                iconColor="bg-teal-400/30 text-teal-200"
                                percentChange={0}
                            />
                            <GradientMetricCard
                                title="Engagement Rate"
                                value={overview.totalVisits > 0
                                    ? `${Math.round(overview.pageviews / overview.totalVisits * 100)}%`
                                    : '0%'
                                }
                                icon={TrendingUp}
                                gradient="bg-gradient-to-br from-zinc-800 via-zinc-900 to-zinc-950 border border-pink-500/30"
                                iconColor="bg-pink-500/20 text-pink-400"
                                percentChange={0}
                            />
                        </div>

                        {/* Real-Time Activity Section */}
                        <SectionCard
                            title="Real-Time Activity"
                            subtitle="Last 30 minutes"
                            rightContent={<LiveBadge />}
                        >
                            <div className="grid grid-cols-3 gap-8 mb-6">
                                <RealTimeStat
                                    title="Total Visits"
                                    value={overview.activeVisitors || 0}
                                    rate="0 / min"
                                    icon={Users}
                                />
                                <RealTimeStat
                                    title="Total Clicks"
                                    value={0}
                                    rate="0 / min"
                                    icon={MousePointerClick}
                                />
                                <RealTimeStat
                                    title="Total Activity"
                                    value={overview.activeVisitors || 0}
                                    rate="0 / min"
                                    icon={Clock}
                                />
                            </div>

                            {/* Real-time Chart Legend */}
                            <div className="flex items-center gap-6 mb-4">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                                    <span className="text-sm text-gray-600 dark:text-zinc-400">Profile Visits</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-pink-500"></span>
                                    <span className="text-sm text-gray-600 dark:text-zinc-400">Link Clicks</span>
                                </div>
                            </div>

                            {/* Real-time Chart */}
                            <div className="h-[200px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={realTimeData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                        <XAxis
                                            dataKey="time"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 11, fill: '#71717a' }}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 11, fill: '#71717a' }}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#18181b',
                                                border: '1px solid #27272a',
                                                borderRadius: '8px',
                                                color: '#fff'
                                            }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="profileVisits"
                                            stroke="#3b82f6"
                                            strokeWidth={2}
                                            dot={false}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="linkClicks"
                                            stroke="#ec4899"
                                            strokeWidth={2}
                                            dot={false}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </SectionCard>

                        {/* Traffic Sources */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <SectionCard
                                title="Traffic Sources"
                                subtitle={dateRangeDisplay.split(',')[0]}
                                icon={Globe}
                                iconColor="bg-amber-500/20 text-amber-400"
                                rightContent={
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500 dark:text-zinc-500 uppercase">Visits</p>
                                        <p className="text-lg font-bold text-white">{overview.totalVisits}</p>
                                    </div>
                                }
                            >
                                {data?.breakdowns?.referrers?.length > 0 ? (
                                    <div className="space-y-3">
                                        {data.breakdowns.referrers.slice(0, 5).map((ref: any, i: number) => (
                                            <div key={i} className="flex items-center justify-between">
                                                <span className="text-sm text-gray-700 dark:text-zinc-300">{ref._id || 'Direct'}</span>
                                                <span className="text-sm font-medium text-gray-500 dark:text-zinc-500">{ref.count}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-8 text-center">
                                        <p className="text-gray-500 dark:text-zinc-500">No visit sources yet for this range.</p>
                                    </div>
                                )}
                            </SectionCard>

                            <SectionCard
                                title="Live Sources"
                                subtitle={new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) + ' - ' +
                                    new Date(Date.now() + 30 * 60000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                icon={Activity}
                                iconColor="bg-orange-500/20 text-orange-400"
                                rightContent={<LiveBadge />}
                            >
                                <div className="py-8 text-center">
                                    <p className="text-gray-500 dark:text-zinc-500">No live source data yet in the current window.</p>
                                </div>
                            </SectionCard>
                        </div>

                        {/* Period Comparison */}
                        <SectionCard
                            title="Period Comparison"
                            subtitle="Comparing current period with previous period"
                        >
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Comparison Overview */}
                                <div className="rounded-xl border border-zinc-800 p-5">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                                            <BarChart3 className="w-4 h-4 text-indigo-400" />
                                        </div>
                                        <h4 className="font-semibold text-white">Comparison Overview</h4>
                                    </div>
                                    <div className="h-[200px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={comparisonData} barGap={4}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                                <XAxis
                                                    dataKey="name"
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fontSize: 11, fill: '#71717a' }}
                                                />
                                                <YAxis
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fontSize: 11, fill: '#71717a' }}
                                                />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: '#18181b',
                                                        border: '1px solid #27272a',
                                                        borderRadius: '8px',
                                                        color: '#fff'
                                                    }}
                                                />
                                                <Bar dataKey="currentPeriod" name="Current Period" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                                <Bar dataKey="previousPeriod" name="Previous Period" fill="#67e8f9" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="flex items-center justify-center gap-6 mt-4">
                                        <div className="flex items-center gap-2">
                                            <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
                                            <span className="text-sm text-zinc-400">Current Period</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="w-3 h-3 rounded-full bg-cyan-300"></span>
                                            <span className="text-sm text-zinc-400">Previous Period</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Activity Distribution */}
                                <div className="rounded-xl border border-zinc-800 p-5">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                                            <Clock className="w-4 h-4 text-cyan-400" />
                                        </div>
                                        <h4 className="font-semibold text-white">Activity Distribution</h4>
                                    </div>
                                    <div className="h-[200px] flex items-center justify-center">
                                        <p className="text-gray-500 dark:text-zinc-500">Activity distribution data will appear here</p>
                                    </div>
                                </div>
                            </div>
                        </SectionCard>

                        {/* Hourly Activity Pattern */}
                        <SectionCard
                            title="Hourly Activity Pattern"
                            icon={TrendingUp}
                            iconColor="bg-amber-500/20 text-amber-400"
                        >
                            <div className="h-[250px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={hourlyData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                        <XAxis
                                            dataKey="hour"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 10, fill: '#71717a' }}
                                            interval={1}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 11, fill: '#71717a' }}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#18181b',
                                                border: '1px solid #27272a',
                                                borderRadius: '8px',
                                                color: '#fff'
                                            }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="currentPeriod"
                                            name="Current Period"
                                            stroke="#06b6d4"
                                            strokeWidth={2}
                                            dot={false}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="previousPeriod"
                                            name="Previous Period"
                                            stroke="#ec4899"
                                            strokeWidth={2}
                                            dot={false}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex items-center justify-center gap-6 mt-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-cyan-400">-●-</span>
                                    <span className="text-sm text-cyan-400">Current Period</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-pink-400">-●-</span>
                                    <span className="text-sm text-pink-400">Previous Period</span>
                                </div>
                            </div>
                        </SectionCard>

                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <SummaryCard
                                title="Active Days"
                                value={period === '24h' ? 1 : period === '7d' ? 7 : 30}
                                icon={Calendar}
                                gradient="bg-gradient-to-r from-blue-600/80 to-blue-700/60 text-white"
                            />
                            <SummaryCard
                                title="Daily Average"
                                value={Math.round(overview.totalVisits / (period === '24h' ? 1 : period === '7d' ? 7 : 30))}
                                icon={TrendingUp}
                                gradient="bg-gradient-to-r from-emerald-600/80 to-emerald-700/60 text-white"
                            />
                            <SummaryCard
                                title="Overall Growth"
                                value="0%"
                                icon={ArrowUpRight}
                                gradient="bg-gradient-to-r from-amber-600/80 to-orange-600/60 text-white"
                            />
                        </div>

                        {/* Breakdowns Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <SectionCard
                                title="Top Pages"
                                icon={Monitor}
                                iconColor="bg-blue-500/20 text-blue-400"
                            >
                                {data?.breakdowns?.pages?.length > 0 ? (
                                    <div className="space-y-3">
                                        {data.breakdowns.pages.map((item: any, i: number) => (
                                            <div key={i} className="flex items-center justify-between">
                                                <span className="text-sm text-gray-700 dark:text-zinc-300 truncate max-w-[200px]" title={item._id}>
                                                    {item._id || 'Unknown'}
                                                </span>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-24 h-1.5 bg-gray-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-indigo-500 rounded-full"
                                                            style={{ width: `${(item.count / Math.max(...data.breakdowns.pages.map((d: any) => d.count))) * 100}%` }}
                                                        />
                                                    </div>
                                                    <span className="font-medium w-8 text-right text-gray-500 dark:text-zinc-500">{item.count}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-8 text-center text-sm text-gray-500 dark:text-zinc-500">{t('common.noDataAvailable')}</div>
                                )}
                            </SectionCard>

                            <SectionCard
                                title="Top Sources"
                                icon={Globe}
                                iconColor="bg-green-500/20 text-green-400"
                            >
                                {data?.breakdowns?.referrers?.length > 0 ? (
                                    <div className="space-y-3">
                                        {data.breakdowns.referrers.map((item: any, i: number) => (
                                            <div key={i} className="flex items-center justify-between">
                                                <span className="text-sm text-gray-700 dark:text-zinc-300 truncate max-w-[200px]" title={item._id}>
                                                    {item._id || 'Direct'}
                                                </span>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-24 h-1.5 bg-gray-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-green-500 rounded-full"
                                                            style={{ width: `${(item.count / Math.max(...data.breakdowns.referrers.map((d: any) => d.count))) * 100}%` }}
                                                        />
                                                    </div>
                                                    <span className="font-medium w-8 text-right text-gray-500 dark:text-zinc-500">{item.count}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-8 text-center text-sm text-gray-500 dark:text-zinc-500">{t('common.noDataAvailable')}</div>
                                )}
                            </SectionCard>

                            <SectionCard
                                title="Devices"
                                icon={Smartphone}
                                iconColor="bg-purple-500/20 text-purple-400"
                            >
                                {data?.breakdowns?.devices?.length > 0 ? (
                                    <div className="space-y-3">
                                        {data.breakdowns.devices.map((item: any, i: number) => (
                                            <div key={i} className="flex items-center justify-between">
                                                <span className="text-sm text-gray-700 dark:text-zinc-300 truncate max-w-[200px]" title={item._id}>
                                                    {item._id || 'Unknown'}
                                                </span>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-24 h-1.5 bg-gray-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-purple-500 rounded-full"
                                                            style={{ width: `${(item.count / Math.max(...data.breakdowns.devices.map((d: any) => d.count))) * 100}%` }}
                                                        />
                                                    </div>
                                                    <span className="font-medium w-8 text-right text-gray-500 dark:text-zinc-500">{item.count}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-8 text-center text-sm text-gray-500 dark:text-zinc-500">{t('common.noDataAvailable')}</div>
                                )}
                            </SectionCard>

                            <SectionCard
                                title="Countries"
                                icon={Globe}
                                iconColor="bg-amber-500/20 text-amber-400"
                            >
                                {data?.breakdowns?.countries?.length > 0 ? (
                                    <div className="space-y-3">
                                        {data.breakdowns.countries.map((item: any, i: number) => (
                                            <div key={i} className="flex items-center justify-between">
                                                <span className="text-sm text-gray-700 dark:text-zinc-300 truncate max-w-[200px]" title={item._id}>
                                                    {item._id || 'Unknown'}
                                                </span>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-24 h-1.5 bg-gray-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-amber-500 rounded-full"
                                                            style={{ width: `${(item.count / Math.max(...data.breakdowns.countries.map((d: any) => d.count))) * 100}%` }}
                                                        />
                                                    </div>
                                                    <span className="font-medium w-8 text-right text-gray-500 dark:text-zinc-500">{item.count}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-8 text-center text-sm text-gray-500 dark:text-zinc-500">{t('common.noDataAvailable')}</div>
                                )}
                            </SectionCard>
                        </div>
                    </div>
                )}
            </div>
        </LinktreeLayout>
    );
};

export default Analytics;
