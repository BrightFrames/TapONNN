import { ReactNode, useState } from "react";
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
    Sun,
    Coins,
    ChevronDown,
    ChevronRight,
    Trophy
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarItemProps {
    icon: any;
    label: string;
    to?: string;
    active?: boolean;
    onClick?: () => void;
    subItems?: Array<{
        label: string;
        to?: string;
        badge?: string;
    }>;
}

const SidebarItem = ({
    icon: Icon,
    label,
    to,
    active = false,
    onClick,
    subItems
}: SidebarItemProps) => {
    // Check if any subitem is active
    const isSubItemActive = subItems?.some(item => item.to === location.pathname);
    const isActive = active || isSubItemActive;

    const [isOpen, setIsOpen] = useState(isSubItemActive);

    const toggleOpen = () => setIsOpen(!isOpen);

    const content = (
        <div
            className={cn(
                "flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors cursor-pointer select-none",
                isActive && !subItems
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800",
                (isActive && subItems) && "bg-gray-100 dark:bg-gray-800"
            )}
            onClick={subItems ? toggleOpen : onClick}
        >
            <div className="flex items-center gap-3">
                <Icon className="w-5 h-5" />
                <span>{label}</span>
            </div>
            {subItems && (
                isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
            )}
        </div>
    );

    return (
        <div>
            {to && !subItems ? (
                <Link to={to}>{content}</Link>
            ) : (
                content
            )}

            {subItems && isOpen && (
                <div className="ml-4 mt-1 space-y-1 pl-4 border-l border-gray-200 dark:border-gray-700">
                    {subItems.map((item, index) => (
                        <Link
                            key={index}
                            to={item.to || "#"}
                            className={cn(
                                "flex items-center justify-between px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                                item.to === location.pathname
                                    ? "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20"
                                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800"
                            )}
                        >
                            <span>{item.label}</span>
                            {item.badge && (
                                <span className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full dark:bg-gray-700 dark:text-gray-300">
                                    {item.badge}
                                </span>
                            )}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
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
                    <h1 className="text-2xl font-bold tracking-tight">Tap2</h1>
                </div>

                <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                    <SidebarItem
                        icon={LayoutDashboard}
                        label="Dashboard"
                        to="/dashboard"
                        active={location.pathname === "/dashboard"}
                    />
                    <SidebarItem
                        icon={Coins}
                        label="Earn"
                        subItems={[
                            { label: "Overview", to: "/dashboard/earn" },
                            { label: "Earnings", to: "/dashboard/earn/history", badge: "$0.00" }
                        ]}
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
