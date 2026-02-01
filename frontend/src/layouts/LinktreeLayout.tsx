import { ReactNode, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    LayoutGrid,
    List,
    Store,
    Palette,
    Settings,
    Users,
    BarChart3,
    Zap,
    Megaphone,
    ChevronDown,
    Coins,
    Menu,
    LogOut,
    ExternalLink,
    DollarSign,
    Building2,
    Package,
    Sparkles,
    MessageCircle,
    Image,
    Smartphone,
    Languages,
    Moon,
    Sun,
    Grid,
    ChevronRight,
    Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetTitle,
} from "@/components/ui/sheet";
import ShareModal from "@/components/ShareModal";
import { useAuth } from "@/contexts/AuthContext";
import { LanguageSelectorDialog } from "@/components/LanguageSelectorDialog";
import ProfileSwitcher from "@/components/ProfileSwitcher";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

// 21st.dev style navigation item
const NavItem = ({ icon: Icon, label, active = false, count, isNew, onClick }: {
    icon: any,
    label: string,
    active?: boolean,
    count?: number,
    isNew?: boolean,
    onClick?: () => void
}) => (
    <div
        className={cn(
            "group flex items-center justify-between px-2 py-1.5 text-[15px] rounded-md transition-all cursor-pointer select-none mx-2",
            active
                ? "text-white font-medium bg-[#1A1A1A]/80"
                : "text-zinc-500 hover:text-zinc-100 hover:bg-[#1A1A1A]/40",
        )}
        onClick={onClick}
    >
        <div className="flex items-center gap-3">
            <Icon className={cn("w-4 h-4", active ? "text-zinc-100" : "text-zinc-500 group-hover:text-zinc-300")} />
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
        </div>
    </div>
);

const SidebarSectionTitle = ({ children }: { children: ReactNode }) => (
    <div className="px-4 mb-2 mt-6 text-xs font-medium text-zinc-600 uppercase tracking-wider">
        {children}
    </div>
);

// Sidebar content component for reuse in desktop and mobile
const SidebarContent = ({ navigate, location, onClose, onShare, onLogout }: {
    navigate: (path: string) => void,
    location: { pathname: string },
    onClose?: () => void,
    onShare: () => void,
    onLogout: () => void
}) => {
    const [isLanguageOpen, setIsLanguageOpen] = useState(false);
    const { t } = useTranslation();
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

    const handleNav = (path: string) => {
        navigate(path);
        onClose?.();
    };

    const { user } = useAuth();
    const isStoreMode = user?.active_profile_mode === 'store';

    return (
        <div className="flex flex-col h-full bg-[#050505] text-zinc-100 font-sans">
            {/* Header */}
            <div className="p-4 pt-5 pb-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-zinc-100 text-black w-8 h-8 flex items-center justify-center rounded-sm font-bold text-lg">
                        T
                    </div>
                    <span className="text-zinc-100 font-bold text-lg tracking-tight">TapONNN</span>
                </div>
            </div>

            {/* Profile Switcher */}
            <div className="px-3 py-2">
                <ProfileSwitcher />
            </div>

            {/* Main Navigation */}
            <nav className="flex-1 px-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 hover:scrollbar-thumb-zinc-700 py-2">

                <SidebarSectionTitle>{t('nav.manage')}</SidebarSectionTitle>
                <div className="space-y-[1px]">
                    <NavItem
                        icon={List}
                        label={t('nav.links')}
                        active={location.pathname === '/dashboard'}
                        onClick={() => handleNav('/dashboard')}
                    />
                    <NavItem
                        icon={Palette}
                        label={t('nav.design')}
                        active={location.pathname === '/design'}
                        onClick={() => handleNav('/design')}
                    />
                    <NavItem
                        icon={Image}
                        label={t('nav.media')}
                        active={location.pathname === '/media'}
                        onClick={() => handleNav('/media')}
                        count={142}
                    />
                    <NavItem
                        icon={Store}
                        label={t('nav.offerings')}
                        active={location.pathname === '/dashboard/business' || location.pathname.includes('shop')}
                        onClick={() => handleNav('/dashboard/business?tab=shop')}
                    />
                    <NavItem
                        icon={DollarSign}
                        label={t('nav.vault')}
                        active={location.pathname === '/earnings'}
                        onClick={() => handleNav('/earnings')}
                    />
                </div>

                <SidebarSectionTitle>{t('nav.growth')}</SidebarSectionTitle>
                <div className="space-y-[1px]">
                    {/* Explore - Only for Personal Profile */}
                    {!isStoreMode && (
                        <>
                            <NavItem
                                icon={Grid}
                                label="Explore"
                                active={location.pathname === '/explore'}
                                onClick={() => handleNav('/explore')}
                            />
                            <NavItem
                                icon={Heart}
                                label="Liked"
                                active={location.pathname === '/liked'}
                                onClick={() => handleNav('/liked')}
                            />
                        </>
                    )}
                    <NavItem
                        icon={BarChart3}
                        label={t('nav.analytics')}
                        active={location.pathname === '/analytics'}
                        onClick={() => handleNav('/analytics')}
                    />
                    <NavItem
                        icon={MessageCircle}
                        label={isStoreMode ? t('nav.lead') : t('nav.message')}
                        active={location.pathname === '/enquiries'}
                        onClick={() => handleNav('/enquiries')}
                    />
                    <NavItem
                        icon={Smartphone}
                        label={t('nav.nfcCards')}
                        active={location.pathname === '/nfc-cards'}
                        onClick={() => handleNav('/nfc-cards')}
                    />
                    <NavItem
                        icon={Sparkles}
                        label={t('nav.marketplace')}
                        active={location.pathname === '/marketplace'}
                        onClick={() => handleNav('/marketplace')}
                    />
                </div>

                <SidebarSectionTitle>{t('nav.system')}</SidebarSectionTitle>
                <div className="space-y-[1px]">
                    <NavItem
                        icon={Settings}
                        label={t('nav.settings')}
                        active={location.pathname === '/settings'}
                        onClick={() => handleNav('/settings')}
                    />
                    <NavItem
                        icon={Languages}
                        label={t('nav.language')}
                        active={false}
                        onClick={() => setIsLanguageOpen(true)}
                    />
                </div>
            </nav>

            {/* Language Dialog */}
            <LanguageSelectorDialog open={isLanguageOpen} onOpenChange={setIsLanguageOpen} />

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
                        onClick={onLogout}
                        className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-[#1A1A1A]"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>{t('nav.logout')}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

const LinktreeLayout = ({ children }: { children: ReactNode }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [shareOpen, setShareOpen] = useState(false);
    const { user, logout } = useAuth();
    const { t } = useTranslation();

    const shareUrl = `${window.location.origin}/${user?.username}`;

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileOpen(false);
    }, [location.pathname]);

    return (
        <div className="h-screen bg-white dark:bg-black flex font-sans overflow-hidden">

            <div className="flex flex-1 overflow-hidden h-full">

                {/* Mobile Header */}
                <header className="lg:hidden bg-white dark:bg-[#050505] border-b border-gray-200 dark:border-[#1A1A1A] p-4 flex items-center justify-between sticky top-0 z-40">
                    <div className="flex items-center gap-4">
                        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="-ml-2">
                                    <Menu className="w-6 h-6" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="p-0 w-[280px] z-[60] border-r border-[#1A1A1A]">
                                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                                <SidebarContent navigate={navigate} location={location} onClose={() => setIsMobileOpen(false)} onShare={() => setShareOpen(true)} onLogout={handleLogout} />
                            </SheetContent>
                        </Sheet>
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-black dark:text-white text-xs font-bold">
                                T
                            </div>
                            <span className="font-bold text-lg tracking-tight">TapONNN</span>
                        </div>
                    </div>
                </header>

                {/* Desktop Sidebar - 21st.dev Style */}
                <aside className="w-[280px] bg-[#050505] border-r border-[#1A1A1A] hidden lg:flex flex-col h-full overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 hover:scrollbar-thumb-zinc-700">
                    <SidebarContent navigate={navigate} location={location} onShare={() => setShareOpen(true)} onLogout={handleLogout} />
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 min-w-0 h-full overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 hover:scrollbar-thumb-zinc-700 bg-[#0A0A0A] transition-colors duration-300">
                    {children}
                </main>
            </div>

            {user?.username && (
                <ShareModal
                    open={shareOpen}
                    onOpenChange={setShareOpen}
                    username={user.username}
                    url={shareUrl}
                />
            )}
        </div>
    );
};

export default LinktreeLayout;
