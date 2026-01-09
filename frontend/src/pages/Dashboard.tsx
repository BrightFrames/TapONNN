import { useState } from "react";
import LinktreeLayout from "@/layouts/LinktreeLayout";
import LinkCard from "@/components/LinkCard";
import PhonePreview from "@/components/PhonePreview";
import { Button } from "@/components/ui/button";
import { Plus, Zap, Share } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Link {
    id: string;
    title: string;
    url: string;
    isActive: boolean;
}

const Dashboard = () => {
    // Mock Data State
    const [links, setLinks] = useState<Link[]>([
        { id: '1', title: 'Instagram', url: 'https://instagram.com/sourabh_upadhyay', isActive: true },
    ]);

    const addLink = () => {
        const newLink: Link = {
            id: Date.now().toString(),
            title: 'Title',
            url: '',
            isActive: true
        };
        setLinks([newLink, ...links]);
    };

    const updateLink = (id: string, field: keyof Link, value: any) => {
        setLinks(links.map(l => l.id === id ? { ...l, [field]: value } : l));
    };

    const deleteLink = (id: string) => {
        setLinks(links.filter(l => l.id !== id));
    };

    return (
        <LinktreeLayout>
            <div className="flex h-full">
                {/* Center Column: Editor */}
                <div className="flex-1 max-w-3xl mx-auto py-10 px-4 md:px-8 overflow-y-auto">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-2xl font-bold">Links</h1>
                        <div className="flex gap-3">
                            <Button variant="outline" className="rounded-full gap-2 h-10 px-6 font-medium">
                                <Zap className="w-4 h-4" /> Enhance
                            </Button>

                            <div className="relative">
                                <div className="bg-gray-100 rounded-full px-4 py-2 text-sm text-gray-500 pr-10 border border-gray-200">
                                    linktr.ee/sourbhupadhyay
                                </div>
                                <Button size="icon" variant="ghost" className="absolute right-1 top-1 h-7 w-7 rounded-full">
                                    <Share className="w-3 h-3" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Add Link Block */}
                    <Button
                        onClick={addLink}
                        className="w-full bg-[#7535f5] hover:bg-[#6025d5] text-white rounded-full h-12 text-base font-semibold mb-10 shadow-lg shadow-purple-200 transition-all hover:scale-[1.01]"
                    >
                        <Plus className="w-5 h-5 mr-2" /> Add
                    </Button>

                    {/* Empty State or List */}
                    <div className="space-y-4 pb-20">
                        {links.length === 0 && (
                            <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                <h3 className="text-lg font-medium text-gray-600">You don't have any links yet</h3>
                                <p className="text-gray-400 mt-2">Click the Add button to get started</p>
                            </div>
                        )}
                        {links.map(link => (
                            <LinkCard
                                key={link.id}
                                link={link}
                                onUpdate={updateLink}
                                onDelete={deleteLink}
                            />
                        ))}
                    </div>
                </div>

                {/* Right Column: Preview (Hidden on small screens) */}
                <div className="w-[450px] border-l border-gray-200 hidden xl:flex items-center justify-center bg-white relative">
                    <div className="sticky top-24">
                        <PhonePreview
                            username="sourabhupadhyay"
                            links={links}
                        />
                    </div>
                </div>
            </div>
        </LinktreeLayout>
    );
};

export default Dashboard;
