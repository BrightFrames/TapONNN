import { ReactNode } from "react";
import {
    LayoutGrid,
    List,
    Store,
    Palette,
    Settings,
    Users,
    BarChart3,
    Zap,
    Bell,
    Megaphone
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

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

const LinktreeLayout = ({ children }: { children: ReactNode }) => {
    return (
        <div className="min-h-screen bg-gray-50/50 flex flex-col font-sans">
            {/* Top Banner */}
            <div className="bg-[#1e293b] text-white py-3 px-6 text-center text-sm font-medium flex justify-center items-center gap-4">
                <span>Unlock more tools to grow your audience faster.</span>
                <Button size="sm" className="bg-[#24a35a] hover:bg-[#1f8c4d] text-white rounded-full px-4 h-8 gap-1">
                    <Zap className="w-3 h-3 fill-current" /> Upgrade
                </Button>
            </div>

            <div className="flex flex-1">
                {/* Left Sidebar */}
                <aside className="w-64 bg-white border-r border-gray-100 hidden lg:flex flex-col py-6 pl-6 pr-2 h-[calc(100vh-48px)] sticky top-0 overflow-y-auto">
                    {/* User */}
                    <div className="flex items-center gap-3 mb-8 px-2">
                        <Button variant="ghost" size="icon" className="rounded-full w-8 h-8">
                            <span className="font-bold text-xl">🌲</span>
                        </Button>
                    </div>

                    {/* Menu Group 1 */}
                    <div className="space-y-1 mb-6">
                        <h3 className="text-xs font-semibold text-gray-500 px-3 mb-2 flex items-center justify-between">
                            My Linktree
                        </h3>
                        <NavItem icon={List} label="Links" active />
                        <NavItem icon={Store} label="Shop" />
                        <NavItem icon={Palette} label="Design" />
                        <NavItem icon={Users} label="Join community" />
                    </div>

                    {/* Menu Group 2 */}
                    <div className="space-y-1 mb-6">
                        <NavItem icon={LayoutGrid} label="Overviw" />
                        <NavItem icon={BarChart3} label="Analytics" />
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
