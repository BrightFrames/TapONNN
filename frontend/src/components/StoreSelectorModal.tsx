import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Store, Loader2 } from "lucide-react";

interface StoreData {
    id: string;
    username: string;
    store_name: string;
    avatar_url?: string;
    published: boolean;
}

interface StoreSelectorModalProps {
    open: boolean;
    onClose: () => void;
    currentVisibleStores: string[];
    onSave: (storeIds: string[]) => Promise<void>;
}

const StoreSelectorModal = ({ open, onClose, currentVisibleStores, onSave }: StoreSelectorModalProps) => {
    const [stores, setStores] = useState<StoreData[]>([]);
    const [selectedStores, setSelectedStores] = useState<string[]>(currentVisibleStores);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

    useEffect(() => {
        if (open) {
            fetchStores();
            setSelectedStores(currentVisibleStores);
        }
    }, [open, currentVisibleStores]);

    const fetchStores = async () => {
        setLoading(true);
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
            toast.error("Failed to load stores");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStore = (storeId: string) => {
        setSelectedStores(prev => {
            if (prev.includes(storeId)) {
                return prev.filter(id => id !== storeId);
            } else {
                return [...prev, storeId];
            }
        });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await onSave(selectedStores);
            onClose();
        } catch (err) {
            console.error("Error saving:", err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Store className="w-5 h-5" />
                        Select Stores to Display
                    </DialogTitle>
                    <DialogDescription>
                        Choose which stores to show on your personal profile. You can select multiple stores.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : stores.length === 0 ? (
                        <div className="text-center py-8">
                            <Store className="w-12 h-12 mx-auto text-muted-foreground mb-3 opacity-50" />
                            <p className="text-sm text-muted-foreground">No stores found</p>
                            <p className="text-xs text-muted-foreground mt-1">Create a store to display it on your profile</p>
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-[400px] overflow-y-auto">
                            {stores.map((store) => (
                                <div
                                    key={store.id}
                                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-900/50 transition-colors cursor-pointer"
                                    onClick={() => handleToggleStore(store.id)}
                                >
                                    <Checkbox
                                        checked={selectedStores.includes(store.id)}
                                        onCheckedChange={() => handleToggleStore(store.id)}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                    <div className="flex items-center gap-3 flex-1">
                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-800 to-black dark:from-gray-700 dark:to-gray-900 flex items-center justify-center">
                                            <Store className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-semibold text-sm text-gray-900 dark:text-white">
                                                {store.store_name}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                @{store.username}
                                            </div>
                                        </div>
                                        {store.published && (
                                            <div className="px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-medium">
                                                Published
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={saving}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={saving || loading}
                        className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            `Save Selection${selectedStores.length > 0 ? ` (${selectedStores.length})` : ''}`
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default StoreSelectorModal;
