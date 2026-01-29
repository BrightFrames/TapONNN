import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, User, Store, Check, Sparkles, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const ProfileSwitcher = () => {
    const { user, switchProfileMode } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    if (!user) return null;

    const isSuperUser = user.role === 'super';
    const currentMode = user.active_profile_mode || 'personal';
    const hasStore = user.has_store;

    const handleSwitch = async (mode: 'personal' | 'store') => {
        if (mode === currentMode) return;

        await switchProfileMode(mode);

        // Navigate based on mode
        if (mode === 'store') {
            navigate('/dashboard/business');
        } else {
            navigate('/dashboard');
        }

        setIsOpen(false);
    };

    // Always show the full profile switcher to allow discovery of features
    // Personal users will see "Store" as disabled/locked until they upgrade

    // Super users see the full profile switcher
    return (
        <div className="p-4 border-b border-sidebar-border/50">
            <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        className="w-full justify-between px-2 h-auto py-2 hover:bg-sidebar-accent group"
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w - 8 h - 8 rounded - full flex items - center justify - center font - bold border ${currentMode === 'store'
                                ? 'bg-orange-500/10 text-orange-600 border-orange-500/20'
                                : 'bg-primary/10 text-primary border-primary/20'
                                } `}>
                                {currentMode === 'store' ? (
                                    <Store className="w-4 h-4" />
                                ) : (
                                    user.username?.[0]?.toUpperCase() || 'U'
                                )}
                            </div>
                            <div className="text-left">
                                <div className="text-sm font-semibold leading-none flex items-center gap-2">
                                    {currentMode === 'store' ? `${user.username} 's Store` : user.username}
                                    < Badge variant="secondary" className="text-[10px] px-1 h-4 font-normal" >
                                        {currentMode === 'store' ? 'Store' : 'Personal'}
                                    </Badge >
                                </div >
                                {isSuperUser && (
                                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                        <Sparkles className="w-3 h-3" /> Super User
                                    </div>
                                )}
                            </div >
                        </div >
                        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </Button >
                </DropdownMenuTrigger >

                <DropdownMenuContent align="start" className="w-[240px]">
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Switch Profile
                    </div>
                    <DropdownMenuSeparator />

                    {/* Personal Profile Option */}
                    <DropdownMenuItem
                        onClick={() => handleSwitch('personal')}
                        className="flex items-center justify-between cursor-pointer"
                    >
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="w-3 h-3 text-primary" />
                            </div>
                            <div>
                                <div className="text-sm font-medium">@{user.username}</div>
                                <div className="text-[10px] text-muted-foreground">Personal Profile</div>
                            </div>
                        </div>
                        {currentMode === 'personal' && <Check className="w-4 h-4 text-green-500" />}
                    </DropdownMenuItem>

                    {/* Store Profile Option */}
                    {/* Store Profile Option - Conditional */}
                    {hasStore ? (
                        <DropdownMenuItem
                            onClick={() => handleSwitch('store')}
                            className="flex items-center justify-between cursor-pointer"
                        >
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-orange-500/10 flex items-center justify-center">
                                    <Store className="w-3 h-3 text-orange-500" />
                                </div>
                                <div>
                                    <div className="text-sm font-medium">{user.username}'s Store</div>
                                    <div className="text-[10px] text-muted-foreground">
                                        Digital Store
                                    </div>
                                </div>
                            </div>

                            {currentMode === 'store' && <Check className="w-4 h-4 text-green-500" />}
                        </DropdownMenuItem>
                    ) : (
                        <DropdownMenuItem
                            onClick={() => navigate('/pricing?tab=store')}
                            className="flex items-center justify-between cursor-pointer opacity-75 hover:opacity-100"
                        >
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                                    <Lock className="w-3 h-3 text-gray-500" />
                                </div>
                                <div>
                                    <div className="text-sm font-medium">Upgrade for Store</div>
                                    <div className="text-[10px] text-muted-foreground">
                                        Unlock Store Features
                                    </div>
                                </div>
                            </div>
                            <div className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-gradient-to-r from-orange-400 to-pink-500 text-white shadow-sm">
                                NEW
                            </div>
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu >
        </div >
    );
};

export default ProfileSwitcher;
