import LinktreeLayout from "@/layouts/LinktreeLayout";
import { Button } from "@/components/ui/button";
import {
    Download,
    TrendingUp,
    Receipt,
    Wallet,
    ArrowUpRight,
    CreditCard,
    RefreshCcw,
    FileText,
    ChevronDown,
    Search,
    Filter
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

const Earnings = () => {
    const { t } = useTranslation();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

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

        return {
            totalEarnings,
            thisMonthEarnings,
            totalTransactions: orders.length
        };
    }, [orders]);

    // Filter orders based on search
    const filteredOrders = useMemo(() => {
        if (!searchQuery.trim()) return orders;
        const query = searchQuery.toLowerCase();
        return orders.filter(order =>
            order.product_name?.toLowerCase().includes(query) ||
            order.buyer_name?.toLowerCase().includes(query) ||
            order.payment_id?.toLowerCase().includes(query) ||
            order.invoice_id?.toLowerCase().includes(query)
        );
    }, [orders, searchQuery]);

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
        const interval = setInterval(fetchEarnings, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <LinktreeLayout>
            <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto font-sans min-h-full bg-slate-50 dark:bg-[#0a0a0a]">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                                {t('earnings.title')}
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                                Manage your earnings and transaction history
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={fetchEarnings}
                            className="w-fit flex items-center gap-2 rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-sm"
                        >
                            <RefreshCcw className="w-4 h-4" />
                            Sync
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    {/* Total Earnings - Vibrant Blue-Purple */}
                    <div className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-[#6366F1] via-[#8B5CF6] to-[#A855F7] shadow-lg shadow-indigo-500/25 dark:shadow-indigo-500/15 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/30 cursor-pointer group">
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Wallet className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-sm font-medium text-white/90">Total Earnings</span>
                            </div>
                            <p className="text-3xl sm:text-4xl font-bold text-white mb-2">
                                ₹{metrics.totalEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                            <div className="flex items-center gap-1.5 text-sm text-white/70">
                                <ArrowUpRight className="w-3.5 h-3.5" />
                                <span>12% vs last month</span>
                            </div>
                        </div>
                        {/* Decorative circles */}
                        <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all" />
                        <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-purple-300/20 rounded-full blur-xl" />
                    </div>

                    {/* This Month - Vibrant Teal-Cyan */}
                    <div className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-[#14B8A6] via-[#0D9488] to-[#0F766E] shadow-lg shadow-teal-500/25 dark:shadow-teal-500/15 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:shadow-teal-500/30 cursor-pointer group">
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <TrendingUp className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-sm font-medium text-white/90">This Month</span>
                            </div>
                            <p className="text-3xl sm:text-4xl font-bold text-white mb-2">
                                ₹{metrics.thisMonthEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                            <div className="flex items-center gap-1.5 text-sm text-white/70">
                                <ArrowUpRight className="w-3.5 h-3.5" />
                                <span>8% vs last month</span>
                            </div>
                        </div>
                        <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all" />
                        <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-cyan-300/20 rounded-full blur-xl" />
                    </div>

                    {/* Transactions - Slate with subtle blue tint */}
                    <div className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-[#334155] via-[#1E293B] to-[#0F172A] shadow-lg shadow-slate-500/25 dark:shadow-black/40 sm:col-span-2 lg:col-span-1 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-500/30 cursor-pointer group">
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                                    <Receipt className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-sm font-medium text-white/90">Transactions</span>
                            </div>
                            <p className="text-3xl sm:text-4xl font-bold text-white mb-2">
                                {metrics.totalTransactions}
                            </p>
                            <div className="flex items-center gap-1.5 text-sm text-white/60">
                                <ArrowUpRight className="w-3.5 h-3.5" />
                                <span>5% vs last month</span>
                            </div>
                        </div>
                        <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all" />
                        <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-blue-500/10 rounded-full blur-xl" />
                    </div>
                </div>

                {/* Transactions Section */}
                <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    {/* Tabs */}
                    <Tabs defaultValue="payment_history" className="w-full">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border-b border-slate-100 dark:border-slate-800">
                            <TabsList className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg w-fit">
                                <TabsTrigger
                                    value="payment_history"
                                    className="rounded-md px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm transition-all"
                                >
                                    <CreditCard className="w-4 h-4 mr-2 inline" />
                                    {t('earnings.paymentHistory')}
                                </TabsTrigger>
                                <TabsTrigger
                                    value="refund_history"
                                    className="rounded-md px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm transition-all"
                                >
                                    <RefreshCcw className="w-4 h-4 mr-2 inline" />
                                    {t('earnings.refundHistory')}
                                </TabsTrigger>
                            </TabsList>

                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search transactions..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 pr-4 py-2 w-full sm:w-64 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                                />
                            </div>
                        </div>

                        <TabsContent value="payment_history" className="m-0">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-16">
                                    <Loader2 className="animate-spin text-purple-600 w-8 h-8 mb-3" />
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">Loading transactions...</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-b border-slate-100 dark:border-slate-800 hover:bg-transparent">
                                                <TableHead className="w-[40px] pl-4">
                                                    <Checkbox className="border-slate-300 dark:border-slate-600" />
                                                </TableHead>
                                                <TableHead className="font-medium text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">{t('earnings.paymentId')}</TableHead>
                                                <TableHead className="font-medium text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">{t('earnings.service')}</TableHead>
                                                <TableHead className="font-medium text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">{t('earnings.paidTitle')}</TableHead>
                                                <TableHead className="font-medium text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">{t('earnings.paidAt')}</TableHead>
                                                <TableHead className="font-medium text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider text-right">{t('earnings.amount')}</TableHead>
                                                <TableHead className="w-[60px]"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredOrders.length > 0 ? (
                                                filteredOrders.map((order, index) => (
                                                    <TableRow
                                                        key={order._id}
                                                        className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group"
                                                    >
                                                        <TableCell className="pl-4">
                                                            <Checkbox className="border-slate-300 dark:border-slate-600" />
                                                        </TableCell>
                                                        <TableCell>
                                                            <code className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-1 rounded font-mono">
                                                                {order.payment_id?.slice(-12) || `H_${order._id.substr(-8).toUpperCase()}`}
                                                            </code>
                                                        </TableCell>
                                                        <TableCell>
                                                            <span className="text-sm font-medium text-slate-800 dark:text-slate-200 line-clamp-1">
                                                                {order.product_name || "Digital Service"}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                                                                    {(order.buyer_name || "A")[0].toUpperCase()}
                                                                </div>
                                                                <span className="text-sm text-slate-600 dark:text-slate-300 truncate max-w-[120px]">
                                                                    {order.buyer_name || "Anonymous"}
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <span className="text-sm text-slate-500 dark:text-slate-400">
                                                                {new Date(order.paid_at || order.created_at).toLocaleDateString('en-IN', {
                                                                    day: 'numeric',
                                                                    month: 'short',
                                                                    year: 'numeric'
                                                                })}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <span className="inline-flex items-center text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                                                                ₹{order.amount?.toFixed(2)}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleDownloadInvoice(order)}
                                                                title="Download Invoice"
                                                                className="h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                                            >
                                                                <Download className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={7} className="h-40 text-center">
                                                        <div className="flex flex-col items-center gap-2">
                                                            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                                <Receipt className="w-6 h-6 text-slate-400" />
                                                            </div>
                                                            <p className="text-slate-500 dark:text-slate-400 font-medium">
                                                                {searchQuery ? "No matching transactions" : t('earnings.noHistory')}
                                                            </p>
                                                            <p className="text-sm text-slate-400 dark:text-slate-500">
                                                                {searchQuery ? "Try a different search term" : "Your transactions will appear here"}
                                                            </p>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="refund_history" className="m-0">
                            <div className="text-center py-16 px-4">
                                <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                                    <RefreshCcw className="w-7 h-7 text-slate-400 dark:text-slate-500" />
                                </div>
                                <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-1">
                                    No Refunds
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs mx-auto">
                                    {t('earnings.noRefunds')}
                                </p>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </LinktreeLayout>
    );
};

export default Earnings;
