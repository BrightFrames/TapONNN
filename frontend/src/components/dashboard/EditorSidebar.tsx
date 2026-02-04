import { Plus, Heart, Link2, Music, Type, Palette, ShoppingBag, Box, Settings } from "lucide-react";
// Removed unused Button import if not needed, but keeping for compatibility
// import { Button } from "@/components/ui/button";

const SidebarSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="mb-6">
        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 px-2">{title}</h3>
        <div className="space-y-1">
            {children}
        </div>
    </div>
);

const SidebarItem = ({ icon: Icon, title, subtitle, onClick }: { icon: any, title: string, subtitle: string, onClick?: () => void }) => (
    <div
        onClick={onClick}
        className="group flex items-start justify-between p-3.5 hover:bg-zinc-900 rounded-xl cursor-pointer transition-all duration-200 border border-transparent hover:border-zinc-800"
    >
        <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-lg bg-zinc-900 group-hover:bg-black border border-zinc-800 group-hover:border-zinc-700 flex items-center justify-center transition-all">
                <Icon className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
            </div>
            <div className="text-left py-0.5">
                <p className="font-medium text-zinc-200 text-sm group-hover:text-white transition-colors">{title}</p>
                <p className="text-[11px] text-zinc-500 leading-tight mt-0.5">{subtitle}</p>
            </div>
        </div>
        <Plus className="w-3.5 h-3.5 text-zinc-700 group-hover:text-zinc-500 mt-2.5 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
    </div>
);

const EditorSidebar = ({ onAddContent }: { onAddContent: () => void }) => {
    return (
        <div className="h-full overflow-y-auto px-6 py-8 custom-scrollbar bg-black">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-white tracking-tight">Add Content</h2>
            </div>

            <SidebarSection title="Experience">
                <SidebarItem
                    icon={Heart}
                    title="Manage Platforms"
                    subtitle="Add or edit platform links"
                    onClick={() => { }}
                />
                <SidebarItem
                    icon={Link2}
                    title="Featured Links"
                    subtitle="Add link (URL)"
                    onClick={onAddContent}
                />
                <SidebarItem
                    icon={Music}
                    title="Music Smart Link"
                    subtitle="Embed music players"
                />
            </SidebarSection>

            <SidebarSection title="Design & Layout">
                <SidebarItem
                    icon={Type}
                    title="Add a Header"
                    subtitle="Section titles for links"
                />
                <SidebarItem
                    icon={Palette}
                    title="Profile Customization"
                    subtitle="Themes, fonts & colors"
                />
            </SidebarSection>

            <SidebarSection title="Monetization">
                <SidebarItem
                    icon={ShoppingBag}
                    title="New Merch"
                    subtitle="Sell physical goods"
                />
                <SidebarItem
                    icon={Box}
                    title="Digital Product"
                    subtitle="Sell ebooks, files, art"
                />
            </SidebarSection>

        </div>
    );
};

export default EditorSidebar;
