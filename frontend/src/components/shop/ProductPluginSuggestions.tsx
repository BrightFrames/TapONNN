import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Plus, Truck, CreditCard, Settings, Loader2 } from "lucide-react";

interface Plugin {
    _id: string;
    name: string;
    description: string;
    icon: string;
    category: string;
    is_premium: boolean;
}

interface ProductPluginSuggestionsProps {
    plugins: Plugin[];
    installedPluginIds: string[];
    onInstall: (pluginId: string) => void;
    onConfigure: (plugin: Plugin) => void;
    installingId: string | null;
}

export const ProductPluginSuggestions = ({
    plugins,
    installedPluginIds,
    onInstall,
    onConfigure,
    installingId
}: ProductPluginSuggestionsProps) => {
    // Filter for relevant categories (Commerce, Shipping, Payments)
    // Note: Adjust categories based on your actual seed data categories
    const relevantPlugins = plugins.filter(p =>
        ['Commerce', 'Scheduling'].includes(p.category) ||
        ['shiprocket', 'delhivery', 'razorpay', 'stripe'].includes(p.slug?.toLowerCase())
    );

    if (relevantPlugins.length === 0) return null;

    return (
        <div className="mt-6 border-t border-neutral-800 pt-4">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-white">
                <Truck className="w-4 h-4 text-purple-400" />
                Shipping & Payments
                <Badge className="bg-purple-900/30 text-purple-300 text-[10px] h-5 hover:bg-purple-900/50 border-purple-800/50">Recommended</Badge>
            </h4>
            <div className="grid grid-cols-1 gap-3">
                {relevantPlugins.slice(0, 3).map(plugin => { // Show top 3 relevant
                    const isInstalled = installedPluginIds.includes(plugin._id);
                    const isInstalling = installingId === plugin._id;

                    return (
                        <div key={plugin._id} className="flex items-center justify-between p-3 rounded-lg border border-neutral-800 bg-neutral-900/50 hover:border-purple-500/30 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-lg shadow-sm">
                                    {/* Simple icon mapping or fallback */}
                                    {plugin.icon === 'truck' ? <Truck className="w-4 h-4 text-blue-400" /> :
                                        plugin.icon === 'credit-card' ? <CreditCard className="w-4 h-4 text-green-400" /> :
                                            <span className="text-xs">⚡</span>}
                                </div>
                                <div>
                                    <div className="font-medium text-sm flex items-center gap-1 text-white">
                                        {plugin.name}
                                        {plugin.is_premium && <span className="text-[10px] text-amber-400 bg-amber-900/30 px-1 rounded border border-amber-900/50">Pro</span>}
                                    </div>
                                    <p className="text-xs text-neutral-400 line-clamp-1 group-hover:text-neutral-300 transition-colors">{plugin.description}</p>
                                </div>
                            </div>

                            {isInstalled ? (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-xs gap-1 border-neutral-700 bg-transparent text-neutral-400 hover:text-white hover:bg-neutral-800"
                                    onClick={() => onConfigure(plugin)}
                                    type="button" // Prevent form submit
                                >
                                    <Settings className="w-3 h-3" /> Configure
                                </Button>
                            ) : (
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    className="h-7 text-xs bg-white text-black hover:bg-neutral-200 border-none"
                                    onClick={() => onInstall(plugin._id)}
                                    disabled={!!installingId}
                                    type="button" // Prevent form submit
                                >
                                    {isInstalling ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3 mr-1" />}
                                    Connect
                                </Button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
