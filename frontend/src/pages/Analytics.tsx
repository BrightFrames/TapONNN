import { useState, useEffect } from "react";
import LinktreeLayout from "@/layouts/LinktreeLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    Globe,
    Smartphone,
    Monitor,
    ChevronDown,
    Loader2,
    Zap
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";

// Chart config
const chartConfig = {
    visitors: {
        label: "Visitors",
        color: "#6366f1", // Indigo
    },
    pageviews: {
        label: "Pageviews",
        color: "#8b5cf6", // Purple
    },
};

const Analytics = () => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const [period, setPeriod] = useState("30d");
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

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
        // Poll for active visitors every 60s
        const interval = setInterval(fetchStats, 60000);
        return () => clearInterval(interval);
    }, [period]);

    const overview = data?.overview || {
        uniqueVisitors: 0,
        totalVisits: 0,
        pageviews: 0,
        viewsPerVisit: 0,
        bounceRate: 0,
        avgVisitDuration: 0,
        activeVisitors: 0
    };

    const formatDuration = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}m ${s}s`;
    };

    const MetricsCard = ({ title, value, subtext }: { title: string, value: string | number, subtext?: React.ReactNode }) => (
        <div className="flex flex-col p-4">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{title}</span>
            <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900">{value}</span>
                {subtext}
            </div>
        </div>
    );

    const BreakdownTable = ({ title, data, icon: Icon }: { title: string, data: any[], icon: any }) => (
        <Card className="border-gray-100 shadow-sm h-full">
            <CardHeader className="pb-2 border-b border-gray-50">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-gray-700">
                    <Icon className="w-4 h-4 text-gray-400" /> {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                {data && data.length > 0 ? (
                    <div className="divide-y divide-gray-50">
                        {data.map((item, i) => (
                            <div key={i} className="flex items-center justify-between px-4 py-3 text-sm">
                                <span className="truncate max-w-[200px] text-gray-700" title={item._id}>{item._id || 'Unknown'}</span>
                                <div className="flex items-center gap-3">
                                    <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-indigo-500 rounded-full"
                                            style={{ width: `${(item.count / Math.max(...data.map((d: any) => d.count))) * 100}%` }}
                                        />
                                    </div>
                                    <span className="font-medium w-8 text-right text-gray-600">{item.count}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center text-xs text-gray-400">{t('common.noDataAvailable')}</div>
                )}
            </CardContent>
        </Card>
    );

    // Restrict access to Store Accounts only
    if (user && !user.has_store) {
        return (
            <LinktreeLayout>
                <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 text-center space-y-8 animate-in fade-in zoom-in duration-500">
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl mb-4">
                        <Zap className="w-10 h-10 text-white" />
                    </div>

                    <div className="space-y-4 max-w-2xl">
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900">{t('analytics.unlockTitle')}</h1>
                        <p className="text-gray-500 text-lg leading-relaxed">
                            {t('analytics.unlockDesc')} <span className="font-semibold text-gray-900">{t('analytics.storeAccounts')}</span>.
                            <br />{t('analytics.upgradeProfile')}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center hover:shadow-md transition-shadow">
                            <span className="text-3xl font-bold text-gray-900 mb-1">{t('common.live')}</span>
                            <span className="text-sm font-medium text-gray-500">{t('analytics.realtimeVisitor')}</span>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center hover:shadow-md transition-shadow">
                            <span className="text-3xl font-bold text-gray-900 mb-1">{t('common.deep')}</span>
                            <span className="text-sm font-medium text-gray-500">{t('analytics.locationDeviceData')}</span>
                        </div>
                    </div>

                    <Button
                        size="lg"
                        className="rounded-full px-10 py-6 text-lg font-bold bg-gray-900 hover:bg-gray-800 text-white shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all mt-6"
                        onClick={() => window.location.href = '/pricing?tab=store'}
                    >
                        {t('analytics.upgradeToStore')} <ArrowUpRight className="w-5 h-5 ml-2" />
                    </Button>
                </div>
            </LinktreeLayout>
        );
    }

    return (
        <LinktreeLayout>
            <div className="p-6 md:p-10 max-w-7xl mx-auto font-sans text-gray-900 bg-gray-50/50 min-h-full">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                            <Zap className="w-5 h-5 text-indigo-600 fill-indigo-100" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-gray-900">{t('analytics.title')}</h1>
                            <div className="flex items-center gap-2 text-sm mt-0.5">
                                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium animate-pulse">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                    </span>
                                    {overview.activeVisitors} {t('analytics.currentVisitors')}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Select value={period} onValueChange={setPeriod}>
                            <SelectTrigger className="w-[140px] bg-white border-gray-200 shadow-sm font-medium">
                                <Clock className="w-4 h-4 mr-2 text-gray-400" />
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="24h">{t('analytics.last24Hours')}</SelectItem>
                                <SelectItem value="7d">{t('analytics.last7Days')}</SelectItem>
                                <SelectItem value="30d">{t('analytics.last30Days')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {loading && !data ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Metrics Overview */}
                        <Card className="border-gray-200 shadow-sm bg-white overflow-hidden">
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 divide-x divide-y md:divide-y-0 divide-gray-100">
                                <MetricsCard
                                    title={t('analytics.uniqueVisitors')}
                                    value={overview.uniqueVisitors.toLocaleString()}
                                    subtext={<span className="text-xs text-green-600 ml-1 font-medium">{t('analytics.unique')}</span>}
                                />
                                <MetricsCard
                                    title={t('analytics.totalVisits')}
                                    value={overview.totalVisits.toLocaleString()}
                                />
                                <MetricsCard
                                    title={t('analytics.totalPageviews')}
                                    value={overview.pageviews.toLocaleString()}
                                />
                                <MetricsCard
                                    title={t('analytics.viewsPerVisit')}
                                    value={overview.viewsPerVisit}
                                />
                                <MetricsCard
                                    title={t('analytics.bounceRate')}
                                    value={`${overview.bounceRate}%`}
                                />
                                <MetricsCard
                                    title={t('analytics.visitDuration')}
                                    value={formatDuration(overview.avgVisitDuration)}
                                />
                            </div>

                            {/* Main Chart */}
                            <div className="p-6 border-t border-gray-100 bg-white">
                                <div className="h-[350px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={data?.chart || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="colorPageviews" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1} />
                                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                            <XAxis
                                                dataKey="date"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fontSize: 12, fill: '#6b7280' }}
                                                dy={10}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fontSize: 12, fill: '#6b7280' }}
                                            />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                itemStyle={{ fontSize: '12px', fontWeight: 500 }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="visitors"
                                                name={t('analytics.visitors')}
                                                stroke="#6366f1"
                                                strokeWidth={2}
                                                fillOpacity={1}
                                                fill="url(#colorVisitors)"
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="pageviews"
                                                name={t('analytics.pageviews')}
                                                stroke="#8b5cf6"
                                                strokeWidth={2}
                                                fillOpacity={1}
                                                fill="url(#colorPageviews)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </Card>

                        {/* Breakdowns Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <BreakdownTable
                                title={t('analytics.topPages')}
                                data={data?.breakdowns?.pages}
                                icon={Monitor}
                            />
                            <BreakdownTable
                                title={t('analytics.topSources')}
                                data={data?.breakdowns?.referrers}
                                icon={Globe}
                            />
                            <BreakdownTable
                                title={t('analytics.devices')}
                                data={data?.breakdowns?.devices}
                                icon={Smartphone}
                            />
                            <BreakdownTable
                                title={t('analytics.countries')}
                                data={data?.breakdowns?.countries}
                                icon={Globe}
                            />
                        </div>
                    </div>
                )}
            </div>
        </LinktreeLayout>
    );
};

export default Analytics;
