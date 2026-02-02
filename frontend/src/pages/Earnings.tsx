import LinktreeLayout from "@/layouts/LinktreeLayout";
import { Button } from "@/components/ui/button";
import { ChevronRight, Home, Download } from "lucide-react";
import { useEffect, useState } from "react";
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

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

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

Amount Paid: $${order.amount.toFixed(2)}
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
                                                <Checkbox className="ml-2" />
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
                                                        <Checkbox className="ml-2" />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="secondary" className="bg-zinc-100 text-zinc-600 border-none font-mono font-medium rounded">
                                                            {order.payment_id || `H_${order._id.substr(-8).toUpperCase()}`}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="font-bold text-xs text-gray-700">
                                                            {order.invoice_id || `HSG-${order._id.substr(-6).toUpperCase()}`}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="font-medium truncate max-w-[150px] inline-flex rounded">
                                                            {order.product_name || "Digital Service"}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="text-sm text-zinc-600 font-medium">
                                                            {order.buyer_name || "Anonymous User"}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="text-sm text-zinc-500">
                                                            {order.paid_at ? new Date(order.paid_at).toISOString().split('T')[0] : new Date(order.created_at).toISOString().split('T')[0]}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-none font-bold inline-flex rounded">
                                                            ${order.amount?.toFixed(2)}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button variant="ghost" size="icon" onClick={() => handleDownloadInvoice(order)} title="Download Invoice">
                                                            <Download className="w-4 h-4 text-zinc-500 hover:text-zinc-900" />
                                                        </Button>
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
