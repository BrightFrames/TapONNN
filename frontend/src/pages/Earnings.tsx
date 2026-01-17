import LinktreeLayout from "@/layouts/LinktreeLayout";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, CreditCard, ArrowRight, HelpCircle } from "lucide-react";
import { useEffect, useState } from "react";

const Earnings = () => {
    const [stats, setStats] = useState({
        lifetime: 0,
        pending: 0,
        activeProducts: 0
    });

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

    useEffect(() => {
        const fetchEarnings = async () => {
            const token = localStorage.getItem('auth_token');
            if (!token) return;

            // DUMMY USER HANDLING - return mock data
            if (token === 'dummy_token_temp_123') {
                setStats({
                    lifetime: 1249.50,
                    pending: 89.00,
                    activeProducts: 5
                });
                return;
            }

            try {
                // Fetch Orders
                const orderRes = await fetch(`${API_URL}/orders`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const orders = await orderRes.json();

                // Fetch Products for count
                const prodRes = await fetch(`${API_URL}/products`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const products = await prodRes.json();

                // Calculate Stats
                const lifetime = orders.reduce((sum: number, o: any) => sum + parseFloat(o.amount), 0);

                setStats({
                    lifetime,
                    pending: 0, // In real app, check order.status === 'pending'
                    activeProducts: products.length
                });

            } catch (error) {
                console.error("Error loading earnings:", error);
            }
        };

        fetchEarnings();
    }, []);
    return (
        <LinktreeLayout>
            <div className="p-8 max-w-6xl mx-auto font-sans">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-1">Earnings</h1>
                        <p className="text-gray-500 text-sm">Track your revenue and payouts</p>
                    </div>
                    <Button variant="outline" className="rounded-full gap-2">
                        <HelpCircle className="w-4 h-4" />
                        Help & Support
                    </Button>
                </div>

                {/* Main Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Lifetime Earnings */}
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between h-48">
                        <div className="flex items-start justify-between">
                            <div className="p-3 bg-green-50 rounded-2xl">
                                <DollarSign className="w-6 h-6 text-green-600" />
                            </div>
                            <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded-full">+12% vs last month</span>
                        </div>
                        <div>
                            <p className="text-gray-500 font-medium text-sm mb-1">Lifetime Earnings</p>
                            <h2 className="text-4xl font-extrabold text-gray-900">${stats.lifetime.toFixed(2)}</h2>
                        </div>
                    </div>

                    {/* Pending Payouts */}
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between h-48">
                        <div className="flex items-start justify-between">
                            <div className="p-3 bg-purple-50 rounded-2xl">
                                <CreditCard className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                        <div>
                            <p className="text-gray-500 font-medium text-sm mb-1">Pending Payout</p>
                            <h2 className="text-4xl font-extrabold text-gray-900">$0.00</h2>
                        </div>
                    </div>

                    {/* Active Products */}
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between h-48">
                        <div className="flex items-start justify-between">
                            <div className="p-3 bg-blue-50 rounded-2xl">
                                <TrendingUp className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                        <div>
                            <p className="text-gray-500 font-medium text-sm mb-1">Active Products</p>
                            <h2 className="text-4xl font-extrabold text-gray-900">{stats.activeProducts}</h2>
                        </div>
                    </div>
                </div>

                {/* Call to Action Banner */}
                <div className="bg-gradient-to-r from-[#1e293b] to-[#334155] rounded-3xl p-8 text-white flex items-center justify-between shadow-lg">
                    <div className="max-w-xl">
                        <h3 className="text-2xl font-bold mb-2">Start monetizing your audience today</h3>
                        <p className="text-gray-300 mb-6">Connect a payment provider to start accepting payments, tips, and selling digital products directly from your Linktree.</p>
                        <Button className="bg-[#7535f5] hover:bg-[#6025d5] text-white rounded-full px-6 py-6 h-auto text-base font-semibold">
                            Add Payment Provider <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </div>
                    {/* Decorative visual (css only) */}
                    <div className="hidden lg:block relative w-64 h-48">
                        <div className="absolute right-0 bottom-0 w-48 h-32 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 p-4 transform rotate-6 hover:rotate-0 transition-all duration-500">
                            <div className="h-2 w-24 bg-white/20 rounded-full mb-3" />
                            <div className="h-2 w-32 bg-white/20 rounded-full mb-6" />
                            <div className="flex gap-2">
                                <div className="h-8 w-8 rounded-full bg-green-400/80" />
                                <div className="h-8 w-8 rounded-full bg-purple-400/80" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </LinktreeLayout>
    );
};

export default Earnings;
