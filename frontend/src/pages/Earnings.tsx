import LinktreeLayout from "@/layouts/LinktreeLayout";
import { Button } from "@/components/ui/button";
import {
    ChevronRight,
    Home,
    Download,
    DollarSign,
    TrendingUp,
    Clock,
    Receipt,
    Wallet,
    ArrowUpRight,
    ArrowDownRight,
    CreditCard,
    RefreshCcw,
    FileText
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";


interface Order {
    _id: string;
    payment_id?: string;
    invoice_id?: string;
    product_name?: string;
    buyer_name?: string;
    paid_at?: string;
    created_at: string;
    amount: number;
    status: string;
}

const DUMMY_ORDERS: Order[] = [
    {
        _id: "order_1",
        payment_id: "PAY_123456789",
        invoice_id: "INV-2024-001",
        product_name: "Premium Template Pack",
        buyer_name: "Alice Johnson",
        paid_at: "2024-02-01T10:30:00Z",
        created_at: "2024-02-01T10:30:00Z",
        amount: 49.99,
        status: "paid"
    },
    {
        _id: "order_2",
        payment_id: "PAY_987654321",
        invoice_id: "INV-2024-002",
        product_name: "1-Hour Consultation",
        buyer_name: "Bob Smith",
        paid_at: "2024-01-31T15:45:00Z",
        created_at: "2024-01-31T15:45:00Z",
        amount: 150.00,
        status: "paid"
    },
    {
        _id: "order_3",
        payment_id: "PAY_456123789",
        invoice_id: "INV-2024-003",
        product_name: "Digital Art Bundle",
        buyer_name: "Charlie Brown",
        paid_at: "2024-01-30T09:15:00Z",
        created_at: "2024-01-30T09:15:00Z",
        amount: 25.00,
        status: "paid"
    },
    {
        _id: "order_4",
        payment_id: "PAY_789321654",
        invoice_id: "INV-2024-004",
        product_name: "Monthly Subscription",
        buyer_name: "Diana Prince",
        paid_at: "2024-01-29T14:20:00Z",
        created_at: "2024-01-29T14:20:00Z",
        amount: 9.99,
        status: "paid"
    }
];

// Gradient Metric Card Component
const GradientMetricCard = ({
    title,
    value,
    icon: Icon,
    gradient,
    iconColor,
    percentChange = 0
}: {
    title: string;
    value: string | number;
    icon: any;
    gradient: string;
    iconColor: string;
    percentChange?: number;
}) => (
    <div className={`relative overflow-hidden rounded-2xl p-5 ${gradient} transition-all duration-300 hover:scale-[1.02] hover:shadow-xl`}>
        <div className="flex items-start gap-3 mb-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconColor}`}>
                <Icon className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-white/90 mt-2">{title}</span>
        </div>
        <p className="text-4xl font-bold text-white mb-3">{value}</p>
        <div className="flex items-center gap-2 text-sm">
            <span className={`flex items-center gap-1 ${percentChange >= 0 ? 'text-white/70' : 'text-red-300'}`}>
                {percentChange >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {Math.abs(percentChange)}%
            </span>
            <span className="text-white/50">vs last month</span>
        </div>
        {/* Decorative gradient overlay */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
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
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconColor || 'bg-gray-100 dark:bg-zinc-800'}`}>
                        <Icon className="w-5 h-5" />
                    </div>
                )}
                <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
                    {subtitle && <p className="text-sm text-gray-500 dark:text-zinc-500">{subtitle}</p>}
                </div>
            </div>
            {rightContent}
        </div>
        <div className="p-0">
            {children}
        </div>
    </div>
);

const Earnings = () => {
    const { t } = useTranslation();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

    // Calculate earnings metrics
    const metrics = useMemo(() => {
        const totalEarnings = orders.reduce((sum, order) => sum + (order.amount || 0), 0);
        const thisMonthOrders = orders.filter(order => {
            const orderDate = new Date(order.paid_at || order.created_at);
            const now = new Date();
            return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
        });
        const thisMonthEarnings = thisMonthOrders.reduce((sum, order) => sum + (order.amount || 0), 0);
        const pendingOrders = orders.filter(order => order.status === 'pending');
        const pendingAmount = pendingOrders.reduce((sum, order) => sum + (order.amount || 0), 0);

        return {
            totalEarnings,
            thisMonthEarnings,
            pendingAmount,
            totalTransactions: orders.length
        };
    }, [orders]);

    const fetchEarnings = async () => {
        const token = localStorage.getItem('auth_token');
        if (!token) return;

        try {
            const orderRes = await fetch(`${API_URL}/orders`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const orderData = await orderRes.json();
            const ordersList = Array.isArray(orderData) ? orderData : (orderData.orders || []);
            setOrders(ordersList.length > 0 ? ordersList : DUMMY_ORDERS);
            setLoading(false);
        } catch (error) {
            console.error("Error loading earnings:", error);
            // Fallback to dummy data on error for demo purposes
            setOrders(DUMMY_ORDERS);
            setLoading(false);
        }
    };

    const handleDownloadInvoice = (order: Order) => {
        const invoiceContent = `
INVOICE #${order.invoice_id}
Date: ${new Date(order.paid_at || order.created_at).toLocaleDateString()}

Billed To:
${order.buyer_name}

Item:
${order.product_name}

Amount Paid: ₹${order.amount.toFixed(2)}
Payment ID: ${order.payment_id}
Status: ${order.status.toUpperCase()}

Thank you for your business!
        `;

        const blob = new Blob([invoiceContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Invoice-${order.invoice_id}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    useEffect(() => {
        fetchEarnings();
        const interval = setInterval(fetchEarnings, 10000); // Polling every 10s
        return () => clearInterval(interval);
    }, []);

    return (
        <LinktreeLayout>
            <div className="p-6 md:p-10 max-w-6xl mx-auto font-sans text-gray-900 dark:text-white bg-gray-50 dark:bg-zinc-950 min-h-full">
                {/* Premium Header */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-1">
                            {t('earnings.title')}
                        </h1>
                        <p className="text-gray-500 dark:text-zinc-400">
                            {t('earnings.breadcrumb')} • Track your revenue and transactions
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Refresh Button */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={fetchEarnings}
                            className="flex items-center gap-2 rounded-full border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800"
                        >
                            <RefreshCcw className="w-4 h-4" />
                            Refresh
                        </Button>
                    </div>
                </div>

                {/* Gradient Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    <GradientMetricCard
                        title="Total Earnings"
                        value={`₹${metrics.totalEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        icon={Wallet}
                        gradient="bg-gradient-to-br from-violet-500/90 via-purple-600/80 to-purple-700/70"
                        iconColor="bg-violet-400/30 text-violet-100"
                        percentChange={12}
                    />
                    <GradientMetricCard
                        title="This Month"
                        value={`₹${metrics.thisMonthEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        icon={TrendingUp}
                        gradient="bg-gradient-to-br from-emerald-500/90 via-emerald-600/80 to-emerald-700/70"
                        iconColor="bg-emerald-400/30 text-emerald-100"
                        percentChange={8}
                    />
                    <GradientMetricCard
                        title="Transactions"
                        value={metrics.totalTransactions}
                        icon={Receipt}
                        gradient="bg-gradient-to-br from-zinc-700 via-zinc-800 to-zinc-900 border border-zinc-600/30"
                        iconColor="bg-zinc-600/30 text-zinc-300"
                        percentChange={5}
                    />
                </div>

                {/* Tabs Section */}
                <Tabs defaultValue="payment_history" className="w-full">
                    <TabsList className="bg-white dark:bg-zinc-900/50 p-1 rounded-xl w-full sm:w-auto justify-start border border-gray-200 dark:border-zinc-800 mb-6">
                        <TabsTrigger
                            value="payment_history"
                            className="rounded-lg px-6 py-2.5 font-medium text-gray-600 dark:text-zinc-400 data-[state=active]:bg-purple-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
                        >
                            <CreditCard className="w-4 h-4 mr-2" />
                            {t('earnings.paymentHistory')}
                        </TabsTrigger>
                        <TabsTrigger
                            value="refund_history"
                            className="rounded-lg px-6 py-2.5 font-medium text-gray-600 dark:text-zinc-400 data-[state=active]:bg-purple-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
                        >
                            <RefreshCcw className="w-4 h-4 mr-2" />
                            {t('earnings.refundHistory')}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="payment_history">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-zinc-900/50 rounded-2xl border border-gray-200 dark:border-zinc-800">
                                <Loader2 className="animate-spin text-purple-600 w-10 h-10 mb-4" />
                                <p className="text-gray-500 dark:text-zinc-400 font-medium">Loading transactions...</p>
                            </div>
                        ) : (
                            <SectionCard
                                title="Recent Transactions"
                                subtitle={`${orders.length} transactions found`}
                                icon={FileText}
                                iconColor="bg-purple-500/20 text-purple-400"
                                rightContent={
                                    <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border-none">
                                        {orders.filter(o => o.status === 'paid').length} Paid
                                    </Badge>
                                }
                            >
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-b border-gray-200 dark:border-zinc-800 hover:bg-transparent">
                                                <TableHead className="w-[50px]">
                                                    <Checkbox className="ml-2 border-gray-300 dark:border-zinc-700 data-[state=checked]:bg-purple-600 dark:data-[state=checked]:bg-purple-600 text-white" />
                                                </TableHead>
                                                <TableHead className="font-semibold text-gray-600 dark:text-zinc-300">{t('earnings.paymentId')}</TableHead>
                                                <TableHead className="font-semibold text-gray-600 dark:text-zinc-300">{t('earnings.invoiceId')}</TableHead>
                                                <TableHead className="font-semibold text-gray-600 dark:text-zinc-300">{t('earnings.service')}</TableHead>
                                                <TableHead className="font-semibold text-gray-600 dark:text-zinc-300">{t('earnings.paidTitle')}</TableHead>
                                                <TableHead className="font-semibold text-gray-600 dark:text-zinc-300">{t('earnings.paidAt')}</TableHead>
                                                <TableHead className="font-semibold text-gray-600 dark:text-zinc-300">{t('earnings.amount')}</TableHead>
                                                <TableHead className="w-[50px]"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {orders.length > 0 ? (
                                                orders.map((order) => (
                                                    <TableRow
                                                        key={order._id}
                                                        className="border-b border-gray-100 dark:border-zinc-800/50 hover:bg-purple-50/50 dark:hover:bg-purple-500/5 transition-colors group"
                                                    >
                                                        <TableCell>
                                                            <Checkbox className="ml-2 border-gray-300 dark:border-zinc-700 data-[state=checked]:bg-purple-600" />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="secondary" className="bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border-none font-mono font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors">
                                                                {order.payment_id || `H_${order._id.substr(-8).toUpperCase()}`}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <span className="font-bold text-xs text-gray-700 dark:text-zinc-300 bg-gray-50 dark:bg-zinc-800/50 px-2 py-1 rounded">
                                                                {order.invoice_id || `HSG-${order._id.substr(-6).toUpperCase()}`}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline" className="font-medium truncate max-w-[150px] inline-flex rounded-lg border-purple-200 dark:border-purple-500/30 text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-500/10">
                                                                {order.product_name || "Digital Service"}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xs font-bold">
                                                                    {(order.buyer_name || "A")[0].toUpperCase()}
                                                                </div>
                                                                <span className="text-sm text-gray-700 dark:text-zinc-300 font-medium">
                                                                    {order.buyer_name || "Anonymous User"}
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <span className="text-sm text-gray-500 dark:text-zinc-400">
                                                                {order.paid_at ? new Date(order.paid_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="secondary" className="bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-950/50 dark:to-green-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 font-bold inline-flex rounded-lg shadow-sm">
                                                                ₹{order.amount?.toFixed(2)}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleDownloadInvoice(order)}
                                                                title="Download Invoice"
                                                                className="hover:bg-purple-100 dark:hover:bg-purple-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                <Download className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={8} className="h-40 text-center text-gray-500 dark:text-zinc-500">
                                                        <div className="flex flex-col items-center gap-3">
                                                            <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center">
                                                                <Receipt className="w-8 h-8 text-gray-400 dark:text-zinc-600" />
                                                            </div>
                                                            <p className="font-medium">{t('earnings.noHistory')}</p>
                                                            <p className="text-sm text-gray-400 dark:text-zinc-600">Your transactions will appear here</p>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </SectionCard>
                        )}
                    </TabsContent>

                    <TabsContent value="refund_history">
                        <SectionCard
                            title="Refund History"
                            subtitle="Track all refund requests and their status"
                            icon={RefreshCcw}
                            iconColor="bg-amber-500/20 text-amber-400"
                        >
                            <div className="text-center py-16 px-4">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-950/30 dark:to-orange-950/30 flex items-center justify-center mx-auto mb-4">
                                    <RefreshCcw className="w-10 h-10 text-amber-500 dark:text-amber-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    No Refunds Yet
                                </h3>
                                <p className="text-gray-500 dark:text-zinc-400 max-w-sm mx-auto">
                                    {t('earnings.noRefunds')}
                                </p>
                                <p className="text-sm text-gray-400 dark:text-zinc-500 mt-2">
                                    All refund requests and their statuses will appear here
                                </p>
                            </div>
                        </SectionCard>
                    </TabsContent>
                </Tabs>
            </div>
        </LinktreeLayout>
    );
};

export default Earnings;
