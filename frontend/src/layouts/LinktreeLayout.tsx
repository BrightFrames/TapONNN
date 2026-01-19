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
    Sparkles
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
    const handleNav = (path: string) => {
        navigate(path);
        onClose?.();
    };

    return (
        <div className="flex flex-col py-6 px-4 h-full bg-sidebar/50 text-sidebar-foreground">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8 px-2 cursor-pointer" onClick={() => handleNav('/')}>
                <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold">
                    T2
                </div>
                <span className="font-bold text-lg tracking-tight">Tap2</span>
            </div>

            {/* Menu Group 1 - Collapsible */}
            <Collapsible defaultOpen className="mb-6 space-y-1">
                <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md transition-colors group">
                    <div className="flex items-center gap-2">
                        <LayoutGrid className="w-4 h-4" />
                        <span>My Tap2</span>
                    </div>
                    <ChevronDown className="w-4 h-4 transition-transform duration-200 group-data-[state=open]:rotate-180 opacity-50" />
                </CollapsibleTrigger>

                <CollapsibleContent className="space-y-1 pt-2 pl-2">
                    <NavItem icon={List} label="Links" active={location.pathname === '/dashboard'} onClick={() => handleNav('/dashboard')} />
                    <NavItem icon={Palette} label="Design" active={location.pathname === '/design'} onClick={() => handleNav('/design')} />
                </CollapsibleContent>
            </Collapsible>

            {/* Business Profile Group - Collapsible */}
            <Collapsible className="mb-6 space-y-1">
                <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md transition-colors group">
                    <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        <span>Business Profile</span>
                    </div>
                    <ChevronDown className="w-4 h-4 transition-transform duration-200 group-data-[state=open]:rotate-180 opacity-50" />
                </CollapsibleTrigger>

                <CollapsibleContent className="space-y-1 pt-2 pl-2">
                    <NavItem icon={LayoutGrid} label="Integrations" active={location.pathname === '/dashboard/business' && !location.search.includes('tab=')} onClick={() => handleNav('/dashboard/business')} />
                    <NavItem icon={Store} label="My Shop" active={location.search.includes('tab=shop')} onClick={() => handleNav('/dashboard/business?tab=shop')} />
                    <NavItem icon={Coins} label="Earn" active={location.search.includes('tab=earn')} onClick={() => handleNav('/dashboard/business?tab=earn')} />
                </CollapsibleContent>
            </Collapsible>

            {/* Marketplace Group - Collapsible */}
            <Collapsible className="mb-6 space-y-1">
                <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md transition-colors group">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        <span>Marketplace</span>
                    </div>
                    <ChevronDown className="w-4 h-4 transition-transform duration-200 group-data-[state=open]:rotate-180 opacity-50" />
                </CollapsibleTrigger>

                <CollapsibleContent className="space-y-1 pt-2 pl-2">
                    <NavItem icon={Sparkles} label="Browse Apps" active={location.pathname === '/marketplace'} onClick={() => handleNav('/marketplace')} />
                    <NavItem icon={Package} label="My Apps" active={location.pathname === '/my-apps'} onClick={() => handleNav('/my-apps')} />
                </CollapsibleContent>
            </Collapsible>

            <div className="space-y-1 mb-6 px-2">
                <NavItem
                    icon={Users}
                    label="Join community"
                    onClick={() => window.open('https://t.me/tap2community', '_blank')}
                />
            </div>

            {/* Menu Group 2 */}
            <div className="space-y-1 mb-6 px-2">
                <NavItem icon={LayoutGrid} label="Overview" active={location.pathname === '/overview'} onClick={() => handleNav('/overview')} />
                <NavItem icon={BarChart3} label="Analytics" active={location.pathname === '/analytics'} onClick={() => handleNav('/analytics')} />
                <NavItem icon={Coins} label="Earnings" active={location.pathname === '/earnings'} onClick={() => handleNav('/earnings')} />
                <NavItem icon={Settings} label="Settings" active={location.pathname === '/settings'} onClick={() => handleNav('/settings')} />
            </div>

            {/* Logout Button */}
            <div className="px-2 mb-4">
                <Button
                    variant="ghost"
                    onClick={onLogout}
                    className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                </Button>
            </div>

            {/* Bottom Status */}
            <div className="mt-auto px-1">
                <div className="p-4 bg-muted/50 rounded-xl border border-border">
                    <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent flex items-center justify-center text-[10px] font-bold text-primary animate-spin-slow" style={{ animationDuration: '3s' }}>
                            50%
                        </div>
                        <span className="text-xs text-muted-foreground">3/6</span>
                    </div>
                    <h4 className="font-semibold text-sm mb-1">Setup Progress</h4>
                    <p className="text-xs text-muted-foreground mb-3">Complete your profile to go live.</p>
                    <Button size="sm" className="w-full text-xs" variant="default">Finish setup</Button>
                </div>
                <div className="flex gap-2 mt-4 text-muted-foreground">
                    <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full ml-auto" onClick={() => handleNav('/settings')}><Settings className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full" onClick={onShare}><Megaphone className="w-4 h-4" /></Button>
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
                <span className="hidden sm:inline">Unlock more tools to grow your audience faster.</span>
                <span className="sm:hidden">Upgrade to unlock more tools.</span>
                <Button size="sm" variant="secondary" className="h-7 px-3 text-xs rounded-full gap-1" onClick={() => navigate('/pricing')}>
                    <Zap className="w-3 h-3 fill-current" /> Upgrade
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
