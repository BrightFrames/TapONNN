import { useState, useEffect } from "react";
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
import { ChevronDown, User, Store, Check, Sparkles, Lock, BadgeCheck, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface StoreData {
    id: string;
    username: string;
    store_name: string;
    avatar_url?: string;
    published: boolean;
}

const ProfileSwitcher = () => {
    const { user, switchProfileMode } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [stores, setStores] = useState<StoreData[]>([]);
    const [loadingStores, setLoadingStores] = useState(false);
    const navigate = useNavigate();

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

    // Fetch user's stores
    useEffect(() => {
        const fetchStores = async () => {
            if (!user) return;
            
            setLoadingStores(true);
            const token = localStorage.getItem('auth_token');
            
            try {
                const response = await fetch(`${API_URL}/stores/my-stores`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    setStores(data.stores || []);
                }
            } catch (err) {
                console.error("Error fetching stores:", err);
            } finally {
                setLoadingStores(false);
            }
        };

        if (isOpen) {
            fetchStores();
        }
    }, [isOpen, user, API_URL]);

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

    // 21st.dev style profile switcher for dark sidebar
    return (
        <div className="">
            <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        className="w-full justify-between px-3 h-auto py-2.5 hover:bg-gray-100 dark:hover:bg-[#1A1A1A]/60 rounded-xl border border-gray-200 dark:border-[#1A1A1A] bg-white dark:bg-[#0A0A0A]/50 group transition-all"
                    >
                        <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${currentMode === 'store'
                                ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-500/30'
                                : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-100 border border-gray-200 dark:border-zinc-700'
                                }`}>
                                {currentMode === 'store' ? (
                                    <Store className="w-4 h-4" />
                                ) : (
                                    user.username?.[0]?.toUpperCase() || 'U'
                                )}
                            </div>
                            <div className="text-left">
                                <div className="text-[13px] font-semibold leading-none text-gray-900 dark:text-zinc-100">
                                    <span className="flex items-center gap-1">
                                        {currentMode === 'store' ? `${user.username}'s Store` : user.username}
                                        {user.is_email_verified && <BadgeCheck className="w-3.5 h-3.5 text-blue-500 fill-blue-500/10" />}
                                    </span>
                                </div>
                                <div className="text-[11px] text-gray-500 dark:text-zinc-500 mt-1">
                                    {currentMode === 'store' ? 'Digital Store' : 'Personal Profile'}
                                </div>
                            </div>
                        </div>
                        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 dark:text-zinc-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="start" className="w-[240px] bg-white dark:bg-[#0A0A0A] border-gray-200 dark:border-[#1A1A1A] text-gray-900 dark:text-zinc-100">
                    <div className="px-3 py-2 text-[10px] font-semibold text-gray-500 dark:text-zinc-600 uppercase tracking-wider">
                        Switch Profile
                    </div>
                    <DropdownMenuSeparator className="bg-gray-100 dark:bg-[#1A1A1A]" />

                    {/* Personal Profile Option */}
                    <DropdownMenuItem
                        onClick={() => handleSwitch('personal')}
                        className="flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-[#1A1A1A] focus:bg-gray-50 dark:focus:bg-[#1A1A1A] text-gray-900 dark:text-zinc-100"
                    >
                        <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-zinc-800 flex items-center justify-center border border-gray-200 dark:border-zinc-700">
                                <User className="w-3.5 h-3.5 text-gray-500 dark:text-zinc-300" />
                            </div>
                            <div>
                                <div className="text-sm font-medium">@{user.username}</div>
                                <div className="text-[10px] text-gray-500 dark:text-zinc-500">Personal Profile</div>
                            </div>
                        </div>
                        {currentMode === 'personal' && <Check className="w-4 h-4 text-[#ADFA1D]" />}
                    </DropdownMenuItem>

                    {/* Store Profiles - Show all stores */}
                    {stores.length > 0 && (
                        <>
                            <DropdownMenuSeparator className="bg-gray-100 dark:bg-[#1A1A1A]" />
                            <div className="px-3 py-2 text-[10px] font-semibold text-gray-500 dark:text-zinc-600 uppercase tracking-wider">
                                Your Stores
                            </div>
                            {stores.map((store) => (
                                <DropdownMenuItem
                                    key={store.id}
                                    onClick={() => {
                                        // Navigate to store page
                                        navigate(`/${store.username}/store`);
                                        setIsOpen(false);
                                    }}
                                    className="flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-[#1A1A1A] focus:bg-gray-50 dark:focus:bg-[#1A1A1A] text-gray-900 dark:text-zinc-100"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-7 h-7 rounded-lg bg-orange-50 dark:bg-orange-500/20 flex items-center justify-center border border-orange-100 dark:border-orange-500/30">
                                            <Store className="w-3.5 h-3.5 text-orange-500 dark:text-orange-400" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium">{store.store_name}</div>
                                            <div className="text-[10px] text-gray-500 dark:text-zinc-500">
                                                @{store.username}
                                            </div>
                                        </div>
                                    </div>
                                </DropdownMenuItem>
                            ))}
                        </>
                    )}

                    {/* Old Store Profile (backward compatibility) */}
                    {hasStore && stores.length === 0 && (
                        <DropdownMenuItem
                            onClick={() => handleSwitch('store')}
                            className="flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-[#1A1A1A] focus:bg-gray-50 dark:focus:bg-[#1A1A1A] text-gray-900 dark:text-zinc-100"
                        >
                            <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-lg bg-orange-50 dark:bg-orange-500/20 flex items-center justify-center border border-orange-100 dark:border-orange-500/30">
                                    <Store className="w-3.5 h-3.5 text-orange-500 dark:text-orange-400" />
                                </div>
                                <div>
                                    <div className="text-sm font-medium">{user.username}'s Store</div>
                                    <div className="text-[10px] text-gray-500 dark:text-zinc-500">
                                        Digital Store
                                    </div>
                                </div>
                            </div>

                            {currentMode === 'store' && <Check className="w-4 h-4 text-[#ADFA1D]" />}
                        </DropdownMenuItem>
                    )}

                    {/* Manage Section */}
                    <DropdownMenuSeparator className="bg-gray-100 dark:bg-[#1A1A1A]" />
                    <div className="px-3 py-2 text-[10px] font-semibold text-gray-500 dark:text-zinc-600 uppercase tracking-wider">
                        Manage
                    </div>
                    
                    {/* Add New Store Button */}
                    <DropdownMenuItem
                        onClick={() => {
                            navigate('/create-store');
                            setIsOpen(false);
                        }}
                        className="flex items-center gap-2.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#1A1A1A] focus:bg-gray-100 dark:focus:bg-[#1A1A1A] text-gray-900 dark:text-zinc-100"
                    >
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-gray-800 to-black dark:from-gray-700 dark:to-gray-900 flex items-center justify-center">
                            <Plus className="w-3.5 h-3.5 text-white" />
                        </div>
                        <div>
                            <div className="text-sm font-semibold text-gray-900 dark:text-zinc-100">
                                Add New Store
                            </div>
                            <div className="text-[10px] text-gray-500 dark:text-zinc-500">
                                Create another store
                            </div>
                        </div>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};

export default ProfileSwitcher;
