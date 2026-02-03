import { Plus, Heart, Link2, Music, Type, Palette, ShoppingBag, Box, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

const SidebarSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="mb-6">
        <h3 className="text-sm font-semibold text-zinc-400 mb-3 px-1">{title}</h3>
        <div className="space-y-2">
            {children}
        </div>
    </div>
);

const SidebarItem = ({ icon: Icon, title, subtitle, onClick }: { icon: any, title: string, subtitle: string, onClick?: () => void }) => (
    <div
        onClick={onClick}
        className="group flex items-center justify-between p-3 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 rounded-xl cursor-pointer transition-all active:scale-[0.98]"
    >
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-800 group-hover:bg-zinc-700 flex items-center justify-center transition-colors">
                <Icon className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
                <p className="font-semibold text-white text-sm">{title}</p>
                <p className="text-xs text-zinc-500">{subtitle}</p>
            </div>
        </div>
        <Plus className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400" />
    </div>
);

const EditorSidebar = ({ onAddContent }: { onAddContent: () => void }) => {
    return (
        <div className="h-full overflow-y-auto px-4 py-6 custom-scrollbar">
            <h2 className="text-xl font-bold text-white mb-6">Add Content</h2>

            <SidebarSection title="My Links">
                <SidebarItem
                    icon={Heart}
                    title="Manage Platforms"
                    subtitle="Add or edit platform links"
                    onClick={() => { }}
                />
                <SidebarItem
                    icon={Link2}
                    title="Featured Links"
                    subtitle="Add link"
                    onClick={onAddContent}
                />
                <SidebarItem
                    icon={Music}
                    title="Music Smart Link"
                    subtitle="Add music links for multiple platforms"
                />
            </SidebarSection>

            <SidebarSection title="Appearance">
                <SidebarItem
                    icon={Type}
                    title="Add a Header"
                    subtitle="Add custom titles above your links"
                />
                <SidebarItem
                    icon={Palette}
                    title="Profile Customization"
                    subtitle="Choose fonts, background and text colors"
                />
            </SidebarSection>

            <SidebarSection title="E-commerce">
                <SidebarItem
                    icon={ShoppingBag}
                    title="New Merch"
                    subtitle="Add merch"
                />
            </SidebarSection>

            <SidebarSection title="Product">
                <SidebarItem
                    icon={Box}
                    title="Digital Product"
                    subtitle="Sell digital files"
                />
                <SidebarItem
                    icon={Settings}
                    title="Affiliate Product"
                    subtitle="Earn commissions"
                />
            </SidebarSection>
        </div>
    );
};

export default EditorSidebar;
