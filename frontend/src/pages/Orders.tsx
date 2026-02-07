import LinktreeLayout from "@/layouts/LinktreeLayout";
import { Button } from "@/components/ui/button";
import {
    Package,
    Search,
    Filter,
    CheckCircle,
    Clock,
    XCircle,
    Truck,
    MoreVertical,
    Eye,
    Download,
    Mail,
    Phone,
    MapPin,
    Calendar,
    ArrowUpRight
} from "lucide-react";
import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

interface Order {
    _id: string;
    payment_id?: string;
    invoice_id?: string;
    product_name?: string;
    buyer_name?: string;
    buyer_email?: string;
    paid_at?: string;
    created_at: string;
    amount: number;
    status: string;
    delivery_status?: string;
    customer_details?: {
        name?: string;
        phone?: string;
        address?: string;
    };
    product_type?: string;
}

const Orders = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

    const fetchOrders = async () => {
        const token = localStorage.getItem('auth_token');
        if (!token) return;

        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/orders?status=${statusFilter}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            const ordersList = Array.isArray(data) ? data : (data.orders || []);
            setOrders(ordersList);
        } catch (error) {
            console.error("Error loading orders:", error);
            toast.error("Failed to load orders");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [statusFilter]);

    const updateOrderStatus = async (orderId: string, status: string, delivery_status?: string) => {
        const token = localStorage.getItem('auth_token');
        if (!token) return;

        try {
            const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status, delivery_status })
            });

            const data = await response.json();
            
            if (data.success) {
                toast.success('Order status updated successfully');
                setOrders(orders.map(order => 
                    order._id === orderId 
                        ? { ...order, status, delivery_status: delivery_status || order.delivery_status }
                        : order
                ));
                if (selectedOrder?._id === orderId) {
                    setSelectedOrder({ ...selectedOrder, status, delivery_status: delivery_status || selectedOrder.delivery_status });
                }
            } else {
                toast.error('Failed to update order status');
            }
        } catch (error) {
            console.error('Error updating order status:', error);
            toast.error('Failed to update order status');
        }
    };

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
            pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Clock },
            paid: { label: 'Paid', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle },
            processing: { label: 'Processing', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', icon: Package },
            completed: { label: 'Completed', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400', icon: CheckCircle },
            cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', icon: XCircle },
            failed: { label: 'Failed', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400', icon: XCircle },
        };

        const config = statusConfig[status] || statusConfig.pending;
        const Icon = config.icon;

        return (
            <Badge className={`${config.color} flex items-center gap-1 px-2 py-0.5 text-xs font-medium border-0`}>
                <Icon className="w-3 h-3" />
                {config.label}
            </Badge>
        );
    };

    const getDeliveryBadge = (status?: string) => {
        if (!status) return null;
        
        const deliveryConfig: Record<string, { label: string; color: string }> = {
            pending: { label: 'Not Shipped', color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400' },
            delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
            failed: { label: 'Failed', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
        };

        const config = deliveryConfig[status] || deliveryConfig.pending;

        return (
            <Badge className={`${config.color} px-2 py-0.5 text-xs font-medium border-0`}>
                {config.label}
            </Badge>
        );
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = !searchQuery.trim() || 
            order.product_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.buyer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.payment_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.invoice_id?.toLowerCase().includes(searchQuery.toLowerCase());
        
        return matchesSearch;
    });

    const orderStats = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending' || o.status === 'paid').length,
        processing: orders.filter(o => o.status === 'processing').length,
        completed: orders.filter(o => o.status === 'completed').length,
    };

    return (
        <LinktreeLayout>
            <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto font-sans min-h-full bg-slate-50 dark:bg-[#0a0a0a]">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                                Orders
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                                Manage and fulfill your store orders
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Total Orders</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{orderStats.total}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                                <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Pending</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{orderStats.pending}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <Truck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Processing</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{orderStats.processing}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Completed</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{orderStats.completed}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    placeholder="Search orders by product, customer, or payment ID..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full sm:w-auto">
                                <TabsList className="grid grid-cols-5 w-full sm:w-auto">
                                    <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                                    <TabsTrigger value="pending" className="text-xs">Pending</TabsTrigger>
                                    <TabsTrigger value="processing" className="text-xs">Processing</TabsTrigger>
                                    <TabsTrigger value="completed" className="text-xs">Completed</TabsTrigger>
                                    <TabsTrigger value="cancelled" className="text-xs">Cancelled</TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>
                    </div>

                    {/* Orders Table */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <Loader2 className="animate-spin text-blue-600 w-8 h-8 mb-3" />
                            <p className="text-slate-500 dark:text-slate-400 text-sm">Loading orders...</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-b border-slate-100 dark:border-slate-800 hover:bg-transparent">
                                        <TableHead className="font-medium text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Order ID</TableHead>
                                        <TableHead className="font-medium text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Product</TableHead>
                                        <TableHead className="font-medium text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Customer</TableHead>
                                        <TableHead className="font-medium text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Amount</TableHead>
                                        <TableHead className="font-medium text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Status</TableHead>
                                        <TableHead className="font-medium text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Delivery</TableHead>
                                        <TableHead className="font-medium text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Date</TableHead>
                                        <TableHead className="w-[80px] text-center">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredOrders.length > 0 ? (
                                        filteredOrders.map((order) => (
                                            <TableRow
                                                key={order._id}
                                                className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group cursor-pointer"
                                                onClick={() => {
                                                    setSelectedOrder(order);
                                                    setDetailsOpen(true);
                                                }}
                                            >
                                                <TableCell>
                                                    <code className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-1 rounded font-mono">
                                                        {order.payment_id?.slice(-12) || `ORD-${order._id.substr(-8).toUpperCase()}`}
                                                    </code>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-sm font-medium text-slate-800 dark:text-slate-200 line-clamp-1">
                                                        {order.product_name || "Unknown Product"}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                                                            {order.buyer_name || "Guest"}
                                                        </span>
                                                        <span className="text-xs text-slate-500 dark:text-slate-400">
                                                            {order.buyer_email}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                                                        ₹{order.amount?.toFixed(2)}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusBadge(order.status)}
                                                </TableCell>
                                                <TableCell>
                                                    {getDeliveryBadge(order.delivery_status)}
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
                                                <TableCell onClick={(e) => e.stopPropagation()}>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                                                            >
                                                                <MoreVertical className="w-4 h-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-48">
                                                            <DropdownMenuItem onClick={() => {
                                                                setSelectedOrder(order);
                                                                setDetailsOpen(true);
                                                            }}>
                                                                <Eye className="w-4 h-4 mr-2" />
                                                                View Details
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => updateOrderStatus(order._id, 'processing')}>
                                                                <Truck className="w-4 h-4 mr-2" />
                                                                Mark as Processing
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => updateOrderStatus(order._id, 'completed', 'delivered')}>
                                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                                Mark as Delivered
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={8} className="h-40 text-center">
                                                <div className="flex flex-col items-center gap-2">
                                                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                        <Package className="w-6 h-6 text-slate-400" />
                                                    </div>
                                                    <p className="text-slate-500 dark:text-slate-400 font-medium">
                                                        {searchQuery ? "No matching orders" : "No orders yet"}
                                                    </p>
                                                    <p className="text-sm text-slate-400 dark:text-slate-500">
                                                        {searchQuery ? "Try a different search term" : "Orders will appear here when customers make purchases"}
                                                    </p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>

                {/* Order Details Dialog */}
                <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold">Order Details</DialogTitle>
                            <DialogDescription>
                                Complete information about this order
                            </DialogDescription>
                        </DialogHeader>

                        {selectedOrder && (
                            <div className="space-y-6">
                                {/* Order Info */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-medium mb-1">Order ID</p>
                                        <code className="text-sm bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                                            {selectedOrder.payment_id || selectedOrder._id}
                                        </code>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-medium mb-1">Invoice</p>
                                        <code className="text-sm bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                                            {selectedOrder.invoice_id || 'N/A'}
                                        </code>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-medium mb-1">Status</p>
                                        {getStatusBadge(selectedOrder.status)}
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-medium mb-1">Delivery Status</p>
                                        {getDeliveryBadge(selectedOrder.delivery_status)}
                                    </div>
                                </div>

                                {/* Product Info */}
                                <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                                    <h3 className="font-semibold text-sm mb-3">Product Information</h3>
                                    <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                                        <p className="font-medium text-slate-900 dark:text-white mb-2">{selectedOrder.product_name}</p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-slate-500">Amount</span>
                                            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">₹{selectedOrder.amount?.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Customer Info */}
                                <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                                    <h3 className="font-semibold text-sm mb-3">Customer Information</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-slate-400" />
                                            <span className="text-sm">{selectedOrder.customer_details?.name || selectedOrder.buyer_name || 'N/A'}</span>
                                        </div>
                                        {selectedOrder.buyer_email && (
                                            <div className="flex items-center gap-2">
                                                <Mail className="w-4 h-4 text-slate-400" />
                                                <span className="text-sm">{selectedOrder.buyer_email}</span>
                                            </div>
                                        )}
                                        {selectedOrder.customer_details?.phone && (
                                            <div className="flex items-center gap-2">
                                                <Phone className="w-4 h-4 text-slate-400" />
                                                <span className="text-sm">{selectedOrder.customer_details.phone}</span>
                                            </div>
                                        )}
                                        {selectedOrder.customer_details?.address && (
                                            <div className="flex items-start gap-2">
                                                <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                                                <span className="text-sm">{selectedOrder.customer_details.address}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Timeline */}
                                <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                                    <h3 className="font-semibold text-sm mb-3">Timeline</h3>
                                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                        <Calendar className="w-4 h-4" />
                                        <span>Ordered on {new Date(selectedOrder.created_at).toLocaleString('en-IN')}</span>
                                    </div>
                                    {selectedOrder.paid_at && (
                                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mt-2">
                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                            <span>Paid on {new Date(selectedOrder.paid_at).toLocaleString('en-IN')}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="border-t border-slate-200 dark:border-slate-700 pt-4 flex gap-2">
                                    <Button
                                        onClick={() => updateOrderStatus(selectedOrder._id, 'processing')}
                                        variant="outline"
                                        className="flex-1"
                                        disabled={selectedOrder.status === 'processing' || selectedOrder.status === 'completed'}
                                    >
                                        <Truck className="w-4 h-4 mr-2" />
                                        Mark Processing
                                    </Button>
                                    <Button
                                        onClick={() => updateOrderStatus(selectedOrder._id, 'completed', 'delivered')}
                                        className="flex-1 bg-green-600 hover:bg-green-700"
                                        disabled={selectedOrder.status === 'completed'}
                                    >
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Mark Delivered
                                    </Button>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </LinktreeLayout>
    );
};

export default Orders;
