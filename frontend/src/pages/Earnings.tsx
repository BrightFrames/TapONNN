import LinktreeLayout from "@/layouts/LinktreeLayout";
import { Button } from "@/components/ui/button";
import { ChevronRight, Home } from "lucide-react";
import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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

const Earnings = () => {
    const { t } = useTranslation();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

    const fetchEarnings = async () => {
        const token = localStorage.getItem('auth_token');
        if (!token) return;

        try {
            const orderRes = await fetch(`${API_URL}/orders`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const orderData = await orderRes.json();
            const ordersList = Array.isArray(orderData) ? orderData : (orderData.orders || []);
            setOrders(ordersList);
            setLoading(false);
        } catch (error) {
            console.error("Error loading earnings:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEarnings();
        const interval = setInterval(fetchEarnings, 10000); // Polling every 10s
        return () => clearInterval(interval);
    }, []);

    return (
        <LinktreeLayout>
            <div className="p-8 max-w-6xl mx-auto font-sans bg-gray-50/50 min-h-screen">
                {/* Header / Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                    <h1 className="text-xl font-bold text-gray-900 mr-2">{t('earnings.title')}</h1>
                    <Home className="w-4 h-4" />
                    <span>- {t('earnings.breadcrumb')}</span>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="payment_history" className="w-full">
                    <TabsList className="bg-transparent p-0 border-b w-full justify-start rounded-none h-auto mb-6">
                        <TabsTrigger
                            value="payment_history"
                            className="bg-transparent border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:text-purple-600 rounded-none px-4 py-2 font-medium"
                        >
                            {t('earnings.paymentHistory')}
                        </TabsTrigger>
                        <TabsTrigger
                            value="refund_history"
                            className="bg-transparent border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:text-purple-600 rounded-none px-4 py-2 font-medium text-gray-500"
                        >
                            {t('earnings.refundHistory')}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="payment_history">
                        {loading ? (
                            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-purple-600" /></div>
                        ) : (
                            <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-gray-50/50">
                                        <TableRow>
                                            <TableHead className="w-[50px]">
                                                <input type="checkbox" className="rounded border-gray-300 ml-2" />
                                            </TableHead>
                                            <TableHead className="font-medium text-gray-500">{t('earnings.paymentId')}</TableHead>
                                            <TableHead className="font-medium text-gray-500">{t('earnings.invoiceId')}</TableHead>
                                            <TableHead className="font-medium text-gray-500">{t('earnings.service')}</TableHead>
                                            <TableHead className="font-medium text-gray-500">{t('earnings.paidTitle')}</TableHead>
                                            <TableHead className="font-medium text-gray-500">{t('earnings.paidAt')}</TableHead>
                                            <TableHead className="font-medium text-gray-500">{t('earnings.amount')}</TableHead>
                                            <TableHead className="w-[50px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {orders.length > 0 ? (
                                            orders.map((order) => (
                                                <TableRow key={order._id} className="hover:bg-gray-50/50">
                                                    <TableCell>
                                                        <input type="checkbox" className="rounded border-gray-300 ml-2" />
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="bg-red-50 text-red-600 px-2 py-1 rounded text-xs font-mono font-medium">
                                                            {order.payment_id || `H_${order._id.substr(-8).toUpperCase()}`}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="font-bold text-xs text-gray-700">
                                                            {order.invoice_id || `HSG-${order._id.substr(-6).toUpperCase()}`}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="bg-red-50 text-red-600 px-2 py-1 rounded text-xs inline-block font-medium truncate max-w-[150px]">
                                                            {order.product_name || "Digital Service"}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="bg-red-50 text-red-600 px-2 py-1 rounded text-xs inline-block font-medium truncate max-w-[200px]">
                                                            {order.buyer_name || "Anonymous User"}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="bg-red-50 text-red-600 px-2 py-1 rounded text-xs inline-block font-medium">
                                                            {order.paid_at ? new Date(order.paid_at).toISOString().split('T')[0] : new Date(order.created_at).toISOString().split('T')[0]}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="bg-red-50 text-red-600 px-2 py-1 rounded text-xs inline-block font-bold">
                                                            ${order.amount?.toFixed(2)}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <ChevronRight className="w-4 h-4 text-purple-600" />
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={8} className="h-32 text-center text-gray-500">
                                                    {t('earnings.noHistory')}
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="refund_history">
                        <div className="text-center py-20 text-gray-500 bg-white rounded-lg border border-dashed">
                            {t('earnings.noRefunds')}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </LinktreeLayout>
    );
};

export default Earnings;
