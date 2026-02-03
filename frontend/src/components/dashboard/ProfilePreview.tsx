import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Plus, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const ProfilePreview = () => {
    const { user } = useAuth();
    const username = user?.username || "user";
    const displayName = user?.name || "Display Name";
    const userInitial = displayName[0]?.toUpperCase() || "U";
    const avatarUrl = user?.avatar;

    return (
        <div className="flex flex-col items-center justify-center p-8 w-full max-w-md mx-auto">
            {/* Card Container */}
            <div className="relative w-full aspect-[4/5] rounded-[2.5rem] overflow-hidden flex flex-col items-center justify-center text-white p-8 group transition-all duration-500 hover:shadow-[0_0_50px_-12px_rgba(255,255,255,0.1)]">

                {/* Background with Mesh Gradient */}
                <div className="absolute inset-0 bg-[#0A0A0A]">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-pink-500/20 opacity-80" />
                    <div className="absolute -top-20 -right-20 w-60 h-60 bg-blue-600/30 rounded-full blur-[80px]" />
                    <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-purple-600/30 rounded-full blur-[80px]" />
                </div>

                {/* Content Layer */}
                <div className="relative z-10 flex flex-col items-center w-full">
                    {/* Avatar */}
                    <div className="relative mb-6">
                        <div className="w-28 h-28 rounded-[2rem] border-2 border-white/10 shadow-2xl overflow-hidden relative rotate-3 group-hover:rotate-0 transition-all duration-500 bg-zinc-900">
                            <Avatar className="w-full h-full">
                                <AvatarImage src={avatarUrl} className="object-cover" />
                                <AvatarFallback className="bg-zinc-800 text-white text-3xl font-bold">{userInitial}</AvatarFallback>
                            </Avatar>
                        </div>
                        <div className="absolute -bottom-3 -right-3">
                            <Button size="icon" className="w-10 h-10 rounded-xl bg-white text-black hover:bg-zinc-200 shadow-lg border border-zinc-200" title="Change Avatar">
                                <User className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>

                    {/* Name & Bio */}
                    <h2 className="text-2xl font-bold text-center tracking-tight mb-1">{displayName}</h2>
                    <p className="text-zinc-400 font-medium text-sm mb-6">@{username}</p>

                    {/* Action Bar (Different from reference) */}
                    <div className="flex items-center gap-3 w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-2 shadow-lg">
                        <Button className="flex-1 bg-white text-black hover:bg-zinc-200 rounded-xl font-semibold h-10 text-sm">
                            <Plus className="w-4 h-4 mr-2" /> Add Link
                        </Button>
                        <Button size="icon" className="w-10 h-10 rounded-xl bg-transparent hover:bg-white/10 border border-white/5">
                            <img src="/logo.svg" className="w-5 h-5 invert opacity-80" alt="TapX" />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="mt-8 flex items-center gap-2 text-zinc-600 text-xs uppercase tracking-widest font-semibold cursor-pointer hover:text-white transition-colors">
                <span>Reset Design</span>
            </div>
        </div>
    );
};

export default ProfilePreview;
