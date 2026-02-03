import { useState, useEffect } from "react";
import { toast } from "sonner";
import LinktreeLayout from "@/layouts/LinktreeLayout";
import BlockEditorModal from "@/components/BlockEditorModal";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import ProfilePreview from "@/components/dashboard/ProfilePreview";
import EditorSidebar from "@/components/dashboard/EditorSidebar";
import { useTranslation } from "react-i18next";

const Dashboard = () => {
    const { t } = useTranslation();
    const { user, addBlock, updateBlock } = useAuth();
    const [isAddingBlock, setIsAddingBlock] = useState(false);

    // We can re-use these for the "Featured Links" functionality later
    // const { blocks, updateBlock, deleteBlock, reorderBlocks } = useAuth();

    return (
        <LinktreeLayout>
            <div className="flex h-full w-full bg-black min-h-screen font-sans overflow-hidden">
                {/* Center Panel - Profile Preview */}
                <div className="flex-1 flex flex-col items-center justify-center p-8 bg-black relative overflow-y-auto custom-scrollbar">
                    {/* Top Bar for Center Panel (optional breadcrumbs or status) */}
                    <div className="absolute top-6 left-8 flex items-center gap-2 text-zinc-500 text-sm">
                        <span className="text-zinc-600 font-semibold">Edit Profile</span>
                    </div>

                    <div className="absolute top-6 right-8 flex items-center gap-3">
                        <div className="bg-zinc-900 border border-zinc-800 rounded-full px-4 py-1.5 flex items-center gap-2 text-sm text-zinc-400">
                            <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"></span>
                            Your Bio Link
                            <span className="text-zinc-600">|</span>
                            <span className="text-zinc-300">link.me/{user?.username}</span>
                        </div>
                    </div>

                    <ProfilePreview />
                </div>

                {/* Right Panel - Editor Tools */}
                <div className="w-[380px] border-l border-zinc-800 bg-black flex flex-col">
                    <EditorSidebar onAddContent={() => setIsAddingBlock(true)} />
                </div>
            </div>

            {/* Block Editor Modal (Reused) */}
            <BlockEditorModal
                open={isAddingBlock}
                onOpenChange={setIsAddingBlock}
                onSave={async (block) => {
                    await addBlock(block);
                    setIsAddingBlock(false);
                }}
            />
        </LinktreeLayout>
    );
};

export default Dashboard;
