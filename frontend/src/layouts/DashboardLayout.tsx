import { ReactNode } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
    LayoutDashboard,
    CreditCard,
    ShoppingCart,
    ShoppingBag,
    CreditCard as NFCCard,
    Share2,
    Image,
    List,
    DollarSign,
    User,
    LogOut,
    Moon,
    Sun
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const SidebarItem = ({
    icon: Icon,
    label,
    to,
    active = false,
    onClick,
}: {
    icon: any;
    label: string;
    to?: string;
    active?: boolean;
    onClick?: () => void;
}) => {
    const content = (
        <div
            className={cn(
                "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors cursor-pointer",
                active
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            )}
            onClick={onClick}
        >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
            {/* Chevron right only if it has sub-menu, skipping for now for simplicity unless specified */}
        </div>
    );

    if (to) {
        return <Link to={to}>{content}</Link>;
    }

    return content;
};

const DashboardLayout = ({ children }: { children: ReactNode }) => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-black">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col fixed h-full z-10 hidden md:flex">
                <div className="p-6">
                    <h1 className="text-2xl font-bold tracking-tight">tapvisit</h1>
                </div>

                <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                    <SidebarItem
                        icon={LayoutDashboard}
                        label="Dashboard"
                        to="/dashboard"
                        active={location.pathname === "/dashboard"}
                    />
                    <SidebarItem icon={CreditCard} label="Business Cards" />
                    <SidebarItem icon={ShoppingCart} label="Order NFC Card" />
                    <SidebarItem icon={ShoppingBag} label="My Orders" />
                    <SidebarItem icon={NFCCard} label="My NFC Cards" />
                    <SidebarItem icon={Share2} label="Referral" />
                    <SidebarItem icon={Image} label="Media" />
                    <SidebarItem icon={List} label="Plans" />
                    <SidebarItem icon={DollarSign} label="Transactions" />
                    <SidebarItem icon={User} label="My Account" />
                    <SidebarItem icon={LogOut} label="Logout" onClick={handleLogout} />
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 overflow-auto">
                <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-end px-6 sticky top-0 z-10">
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <Moon className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Sun className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        <span className="sr-only">Toggle theme</span>
                    </Button>
                </header>
                <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
