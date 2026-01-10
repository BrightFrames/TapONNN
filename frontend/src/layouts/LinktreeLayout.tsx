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
    Menu // Added Menu icon
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
} from "@/components/ui/sheet";

const NavItem = ({ icon: Icon, label, active = false, badge }: { icon: any, label: string, active?: boolean, badge?: string }) => (
    <div className={`
        flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors
        ${active ? 'bg-gray-100 text-gray-900 font-semibold' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}
    `}>
        <Icon className={`w-4 h-4 ${active ? 'text-gray-900' : 'text-gray-500'}`} />
        <span className="flex-1">{label}</span>
        {badge && <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">{badge}</span>}
    </div>
)

const SidebarContent = ({ navigate, location, onClose }: { navigate: any, location: any, onClose?: () => void }) => {
    const handleNav = (path: string) => {
        navigate(path);
        if (onClose) onClose();
    }

    return (
        <div className="flex flex-col h-full py-6 px-4 lg:px-6 overflow-y-auto">
            {/* User */}
            <div className="flex items-center gap-3 mb-8 px-2">
                <img src="/logotap2.png" alt="Tap2" className="w-8 h-8" />
            </div>

            {/* Menu Group 1 - Collapsible */}
            <Collapsible defaultOpen className="mb-6 space-y-1">
                <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 text-sm font-semibold text-gray-900 bg-[#E8E6E1] rounded-lg group hover:bg-[#E0DED9] transition-colors">
                    <div className="flex items-center gap-2">
                        <LayoutGrid className="w-4 h-4" />
                        <span>My Tap2</span>
                    </div>
                    <ChevronDown className="w-4 h-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </CollapsibleTrigger>

                <CollapsibleContent className="space-y-1 pt-1">
                    <div className="pl-0">
                        <div onClick={() => handleNav('/dashboard')}>
                            <NavItem icon={List} label="Links" active={location.pathname === '/dashboard'} />
                        </div>
                        <div onClick={() => handleNav('/shop')}>
                            <NavItem icon={Store} label="Shop" active={location.pathname === '/shop'} />
                        </div>
                        <div onClick={() => handleNav('/design')}>
                            <NavItem icon={Palette} label="Design" active={location.pathname === '/design'} />
                        </div>
                    </div>
                </CollapsibleContent>
            </Collapsible>

            <div className="space-y-1 mb-6">
                <NavItem icon={Users} label="Join community" />
            </div>

            {/* Menu Group 2 */}
            <div className="space-y-1 mb-6">
                <Collapsible defaultOpen={location.pathname.includes('/overview') || location.pathname.includes('/earnings')} className="space-y-1">
                    <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900 rounded-lg group transition-colors">
                        <div className="flex items-center gap-3">
                            <Coins className="w-4 h-4" />
                            <span>Earn</span>
                        </div>
                        <ChevronDown className="w-4 h-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-1 pt-1">
                        <div className="pl-4 border-l border-gray-100 ml-5 space-y-1">
                            <div onClick={() => handleNav('/overview')}>
                                <div className={`
                                    flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors
                                    ${location.pathname === '/overview' ? 'text-gray-900 font-semibold bg-gray-100' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}
                                `}>
                                    <span className="flex-1">Overview</span>
                                </div>
                            </div>
                            <div onClick={() => handleNav('/earnings')}>
                                <div className={`
                                    flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors
                                    ${location.pathname === '/earnings' ? 'text-gray-900 font-semibold bg-gray-100' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}
                                `}>
                                    <span className="flex-1">Earnings</span>
                                    <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-500 border border-gray-200">$0.00</span>
                                </div>
                            </div>
                        </div>
                    </CollapsibleContent>
                </Collapsible>
                <div onClick={() => handleNav('/audience')}>
                    <NavItem icon={Users} label="Audience" active={location.pathname === '/audience'} />
                </div>
                <div onClick={() => handleNav('/insights')}>
                    <NavItem icon={BarChart3} label="Insights" active={location.pathname === '/insights'} />
                </div>
                <NavItem icon={Settings} label="Settings" />
            </div>

            {/* Bottom Status */}
            <div className="mt-auto px-1">
                <div className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                    <div className="w-10 h-10 rounded-full border-4 border-purple-100 border-t-purple-500 mb-3 flex items-center justify-center text-xs font-bold text-purple-600">
                        50%
                    </div>
                    <h4 className="font-bold text-sm mb-1">Your setup checklist</h4>
                    <p className="text-xs text-gray-500 mb-3">3 of 6 complete</p>
                    <Button className="w-full bg-[#7535f5] hover:bg-[#6025d5] text-white rounded-full">Finish setup</Button>
                </div>
                <div className="flex gap-4 mt-6 px-2 text-gray-400">
                    <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full"><Settings className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full"><Megaphone className="w-4 h-4" /></Button>
                </div>
            </div>
        </div>
    );
};

const LinktreeLayout = ({ children }: { children: ReactNode }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileOpen(false);
    }, [location.pathname]);

    return (
        <div className="min-h-screen bg-gray-50/50 flex flex-col font-sans">
            {/* Top Banner */}
            <div className="bg-[#1e293b] text-white py-3 px-4 lg:px-6 text-center text-xs sm:text-sm font-medium flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4">
                <span>Unlock more tools to grow your audience faster.</span>
                <Button size="sm" className="bg-[#24a35a] hover:bg-[#1f8c4d] text-white rounded-full px-4 h-8 gap-1 w-full sm:w-auto">
                    <Zap className="w-3 h-3 fill-current" /> Upgrade
                </Button>
            </div>

            <div className="flex flex-1 flex-col lg:flex-row">

                {/* Mobile Header */}
                <header className="lg:hidden bg-white border-b border-gray-100 p-4 flex items-center justify-between sticky top-0 z-40">
                    <div className="flex items-center gap-4">
                        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="-ml-2">
                                    <Menu className="w-6 h-6" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="p-0 w-[300px] z-[60]">
                                <SidebarContent navigate={navigate} location={location} onClose={() => setIsMobileOpen(false)} />
                            </SheetContent>
                        </Sheet>
                        <div className="flex items-center gap-2">
                            <img src="/logotap2.png" alt="Tap2" className="w-8 h-8" />
                            <span className="font-bold text-lg">Tap2</span>
                        </div>
                    </div>
                </header>

                {/* Desktop Sidebar */}
                <aside className="w-64 bg-white border-r border-gray-100 hidden lg:block h-[calc(100vh-48px)] sticky top-0">
                    <SidebarContent navigate={navigate} location={location} />
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 min-w-0">
                    {children}
                </main>
            </div>
        </div>
    )
}

export default LinktreeLayout;
