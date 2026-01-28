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
    Languages
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


const NavItem = ({ icon: Icon, label, active = false, badge, onClick }: { icon: any, label: string, active?: boolean, badge?: string, onClick?: () => void }) => (
    <Button
        variant={active ? "secondary" : "ghost"}
        onClick={onClick}
        className={`w-full justify-start gap-3 mb-1 font-normal ${active ? 'font-medium' : 'text-muted-foreground'}`}
    >
        <Icon className={`w-4 h-4 ${active ? 'text-primary' : ''}`} />
        <span className="flex-1 text-left">{label}</span>
        {badge && <span className="text-xs bg-muted px-1.5 py-0.5 rounded-md text-muted-foreground">{badge}</span>}
    </Button>
)

// Sidebar content component for reuse in desktop and mobile
const SidebarContent = ({ navigate, location, onClose, onShare, onLogout }: { navigate: (path: string) => void, location: { pathname: string }, onClose?: () => void, onShare: () => void, onLogout: () => void }) => {
    const [isLanguageOpen, setIsLanguageOpen] = useState(false);
    const { t } = useTranslation();

    const handleNav = (path: string) => {
        navigate(path);
        onClose?.();
    };

    const { user } = useAuth(); // Enhanced to get user details for switcher
    const isStoreMode = user?.active_profile_mode === 'store';

    return (
        <div className="flex flex-col h-full bg-sidebar/50 text-sidebar-foreground">
            {/* Profile Switcher */}
            <ProfileSwitcher />

            <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">

                {/* 1. Manage Group */}
                <div className="space-y-1">
                    <h4 className="px-4 text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">{t('nav.manage')}</h4>
                    {!isStoreMode && (
                        <>
                            <NavItem icon={List} label={t('nav.links')} active={location.pathname === '/dashboard'} onClick={() => handleNav('/dashboard')} />
                            <NavItem icon={Palette} label={t('nav.design')} active={location.pathname === '/design'} onClick={() => handleNav('/design')} />
                        </>
                    )}
                    {isStoreMode && (
                        <>
                            <NavItem icon={Store} label={t('nav.offerings')} active={location.pathname === '/dashboard/business' || location.pathname.includes('shop')} onClick={() => handleNav('/dashboard/business?tab=shop')} />
                            <NavItem icon={DollarSign} label={t('nav.vault')} active={location.pathname === '/earnings'} onClick={() => handleNav('/earnings')} />
                        </>
                    )}
                    {!isStoreMode && (
                        <NavItem icon={Image} label={t('nav.media')} active={location.pathname === '/media'} onClick={() => handleNav('/media')} />
                    )}
                </div>

                {/* 2. Growth Group */}
                <div className="space-y-1">
                    <h4 className="px-4 text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">{t('nav.growth')}</h4>
                    <NavItem icon={BarChart3} label={t('nav.analytics')} active={location.pathname === '/analytics'} onClick={() => handleNav('/analytics')} />
                    <NavItem icon={MessageCircle} label={isStoreMode ? t('nav.lead') : t('nav.message')} active={location.pathname === '/enquiries'} onClick={() => handleNav('/enquiries')} />
                    {!isStoreMode && (
                        <NavItem icon={Smartphone} label={t('nav.nfcCards')} active={location.pathname === '/nfc-cards'} onClick={() => handleNav('/nfc-cards')} />
                    )}
                    <NavItem icon={Sparkles} label={t('nav.marketplace')} active={location.pathname === '/marketplace'} onClick={() => handleNav('/marketplace')} />
                </div>

                {/* 3. System Group */}
                <div className="space-y-1">
                    <h4 className="px-4 text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">{t('nav.system')}</h4>
                    <NavItem icon={Settings} label={t('nav.settings')} active={location.pathname === '/settings'} onClick={() => handleNav('/settings')} />
                    <NavItem icon={Languages} label={t('nav.language')} active={false} onClick={() => setIsLanguageOpen(true)} />
                </div>
            </div>

            {/* Language Dialog */}
            <LanguageSelectorDialog open={isLanguageOpen} onOpenChange={setIsLanguageOpen} />

            {/* Bottom Actions */}
            <div className="p-4 border-t border-sidebar-border/50 space-y-2">
                <Button
                    variant="ghost"
                    onClick={() => window.open(`/${user?.username}`, '_blank')}
                    className="w-full justify-start gap-3"
                >
                    <ExternalLink className="w-4 h-4" />
                    <span>{t('nav.viewProfile')}</span>
                </Button>
                <Button
                    variant="ghost"
                    onClick={onLogout}
                    className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                    <LogOut className="w-4 h-4" />
                    <span>{t('nav.logout')}</span>
                </Button>
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
        <div className="min-h-screen bg-background flex flex-col font-sans">
            {/* Top Banner */}
            <div className="bg-primary text-primary-foreground py-2 px-4 text-center text-xs font-medium flex justify-center items-center gap-4">
                <span className="hidden sm:inline">{t('banner.upgradeText')}</span>
                <span className="sm:hidden">{t('banner.upgradeTextMobile')}</span>
                <Button size="sm" variant="secondary" className="h-7 px-3 text-xs rounded-full gap-1" onClick={() => navigate('/pricing')}>
                    <Zap className="w-3 h-3 fill-current" /> {t('common.upgrade')}
                </Button>
            </div>


            <div className="flex flex-1 overflow-hidden">

                {/* Mobile Header */}
                <header className="lg:hidden bg-background border-b p-4 flex items-center justify-between sticky top-0 z-40">
                    <div className="flex items-center gap-4">
                        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="-ml-2">
                                    <Menu className="w-6 h-6" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="p-0 w-[280px] z-[60] border-r">
                                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                                <SidebarContent navigate={navigate} location={location} onClose={() => setIsMobileOpen(false)} onShare={() => setShareOpen(true)} onLogout={handleLogout} />
                            </SheetContent>
                        </Sheet>
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                                T2
                            </div>
                            <span className="font-bold text-lg tracking-tight">Tap2</span>
                        </div>
                    </div>
                </header>

                {/* Desktop Sidebar */}
                <aside className="w-64 bg-sidebar border-r hidden lg:block h-full overflow-y-auto">
                    <SidebarContent navigate={navigate} location={location} onShare={() => setShareOpen(true)} onLogout={handleLogout} />
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 min-w-0 overflow-y-auto bg-muted/10">
                    {children}
                </main>
            </div >

            {user?.username && (
                <ShareModal
                    open={shareOpen}
                    onOpenChange={setShareOpen}
                    username={user.username}
                    url={shareUrl}
                />
            )}
        </div >

    )
}

export default LinktreeLayout;
