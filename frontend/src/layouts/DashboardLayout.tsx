import { ReactNode, useState, useEffect } from "react";
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
    Sparkles,
    Search,
    AppWindow,
    Zap,
    BarChart3,
    Settings,
    Grid,
    ChevronDown,
    ChevronRight,
    Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarItemProps {
    icon?: any;
    label: string;
    to?: string;
    active?: boolean;
    onClick?: () => void;
    count?: number;
    isNew?: boolean;
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
    count,
    isNew,
    subItems
}: SidebarItemProps) => {
    const location = useLocation();
    const isSubItemActive = subItems?.some(item => item.to === location.pathname);
    const isActive = active || isSubItemActive;
    const [isOpen, setIsOpen] = useState(isSubItemActive);

    const toggleOpen = () => setIsOpen(!isOpen);

    const content = (
        <div
            className={cn(
                "group flex items-center justify-between px-2 py-1.5 text-[15px] rounded-md transition-all cursor-pointer select-none mx-2",
                isActive
                    ? "text-white font-medium bg-[#1A1A1A]/80"
                    : "text-zinc-500 hover:text-zinc-100 hover:bg-[#1A1A1A]/40",
            )}
            onClick={subItems ? toggleOpen : onClick}
        >
            <div className="flex items-center gap-3">
                {Icon && <Icon className={cn("w-4 h-4", isActive ? "text-zinc-100" : "text-zinc-500 group-hover:text-zinc-300")} />}
                <span>{label}</span>
            </div>
            <div className="flex items-center gap-2">
                {count !== undefined && (
                    <span className="text-[10px] text-zinc-600 font-medium">{count}</span>
                )}
                {isNew && (
                    <span className="bg-[#ADFA1D] text-black text-[10px] px-1.5 py-0.5 rounded-sm font-bold leading-none">
                        new
                    </span>
                )}
                {subItems && (
                    isOpen ? <ChevronDown className="w-3.5 h-3.5 opacity-50" /> : <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                )}
            </div>
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
                <div className="ml-4 mt-0.5 space-y-0.5 pl-4 border-l border-zinc-800/50">
                    {subItems.map((item, index) => (
                        <Link
                            key={index}
                            to={item.to || "#"}
                            className={cn(
                                "flex items-center justify-between px-3 py-1.5 text-sm rounded-md transition-colors",
                                item.to === location.pathname
                                    ? "text-zinc-100 bg-zinc-800/50"
                                    : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/30"
                            )}
                        >
                            <span>{item.label}</span>
                            {item.badge && (
                                <span className="bg-zinc-800 text-zinc-400 text-[10px] px-1.5 py-0.5 rounded dark:bg-zinc-800 dark:text-zinc-400">
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

const SidebarSectionTitle = ({ children }: { children: ReactNode }) => (
    <div className="px-4 mb-2 mt-6 text-xs font-medium text-zinc-600 uppercase tracking-wider">
        {children}
    </div>
);

const DashboardLayout = ({ children }: { children: ReactNode }) => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Theme toggling logic
    const [isDark, setIsDark] = useState(() => {
        if (typeof window !== "undefined") {
            return document.documentElement.classList.contains("dark") ||
                localStorage.getItem("theme") === "dark";
        }
        return true; // Default to dark for this aesthetic
    });

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    }, [isDark]);

    const toggleTheme = () => setIsDark(!isDark);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div className="flex h-screen bg-black overflow-hidden font-sans">
            {/* Sidebar - 21st.dev Style */}
            <aside className="w-[280px] bg-[#050505] border-r border-[#1A1A1A] flex flex-col fixed h-full z-20 hidden md:flex transition-all duration-300">
                {/* Header */}
                <div className="p-4 pt-5 pb-2 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-zinc-100 text-black w-8 h-8 flex items-center justify-center rounded-sm font-bold text-lg">
                            T
                        </div>
                        <span className="text-zinc-100 font-bold text-lg tracking-tight">TapONNN</span>
                    </div>
                </div>

                {/* Main Navigation */}
                <nav className="flex-1 px-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 hover:scrollbar-thumb-zinc-700 py-2">

                    {/* Hero Item */}
                    <div className="mb-4 mt-2 px-2">
                        <div className="group flex flex-col gap-1 px-3 py-3 bg-[#0A0A0A] border border-[#1A1A1A] rounded-xl hover:border-zinc-700 transition-all cursor-pointer">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-zinc-200 font-medium">
                                    <Sparkles className="w-4 h-4 text-[#ADFA1D]" />
                                    <span>Premium Plan</span>
                                </div>
                                <span className="bg-[#ADFA1D] text-black text-[10px] px-1.5 py-0.5 rounded font-bold">new</span>
                            </div>
                            <span className="text-[11px] text-zinc-500 pl-6">Unlock all premium features</span>
                        </div>
                    </div>

                    <SidebarSectionTitle>Menu</SidebarSectionTitle>
                    <div className="space-y-[1px]">
                        <SidebarItem
                            icon={LayoutDashboard}
                            label="Dashboard"
                            to="/dashboard"
                            active={location.pathname === "/dashboard"}
                        />
                        <SidebarItem
                            icon={Grid}
                            label="Feed"
                            to="/explore"
                            active={location.pathname === "/explore"}
                        />
                        <SidebarItem
                            icon={BarChart3}
                            label="Analytics"
                            to="/analytics"
                            active={location.pathname === "/analytics"}
                        />
                        <SidebarItem
                            icon={User}
                            label="My Profile"
                            to="/settings"
                            active={location.pathname === "/settings"}
                        />
                    </div>

                    <SidebarSectionTitle>Tools</SidebarSectionTitle>
                    <div className="space-y-[1px]">
                        <SidebarItem
                            icon={ShoppingBag}
                            label="Offerings"
                            to="/dashboard/business"
                            active={location.pathname === "/dashboard/business"}
                            count={12}
                        />
                        <SidebarItem
                            icon={CreditCard}
                            label="Business Cards"
                            to="/nfc-cards"
                            count={3}
                        />
                        <SidebarItem
                            icon={ShoppingCart}
                            label="Order NFC Card"
                            to="/shop"
                        />
                        <SidebarItem
                            icon={NFCCard}
                            label="My NFC Cards"
                            to="/nfc-cards"
                        />
                        <SidebarItem
                            icon={AppWindow}
                            label="My Apps"
                            to="/my-apps"
                        />
                    </div>

                    <SidebarSectionTitle>Management</SidebarSectionTitle>
                    <div className="space-y-[1px]">
                        <SidebarItem icon={Share2} label="Referral" to="/referral" />
                        <SidebarItem icon={Image} label="Media" to="/media" count={142} />
                        <SidebarItem icon={List} label="Plans" to="/plans" />
                        <SidebarItem icon={DollarSign} label="Transactions" to="/dashboard/earn/history" />
                    </div>
                </nav>

                {/* Footer */}
                <div className="p-3 border-t border-[#1A1A1A] bg-[#050505]">

                    <div className="flex items-center justify-between px-2 py-2">
                        <button
                            className="flex items-center gap-2 group"
                            onClick={toggleTheme}
                        >
                            <div className="w-8 h-8 rounded-full bg-[#111] border border-[#222] flex items-center justify-center text-zinc-500 group-hover:text-zinc-200 group-hover:border-zinc-600 transition-all">
                                {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                            </div>
                            <span className="text-xs text-zinc-500 group-hover:text-zinc-300 transition-colors">
                                {isDark ? "Dark" : "Light"}
                            </span>
                        </button>

                        <button
                            onClick={handleLogout}
                            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-[#1A1A1A]"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Log out</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-[280px] overflow-auto bg-white dark:bg-black transition-colors duration-300">
                {/* Mobile Header (visible only on small screens) */}
                <header className="md:hidden h-14 bg-white dark:bg-[#050505] border-b border-gray-200 dark:border-[#1A1A1A] flex items-center justify-between px-4 sticky top-0 z-10">
                    <span className="font-bold text-lg dark:text-white">TapONNN</span>
                    <Button variant="ghost" size="icon" onClick={toggleTheme}>
                        {isDark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                    </Button>
                </header>

                <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in min-h-screen">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
