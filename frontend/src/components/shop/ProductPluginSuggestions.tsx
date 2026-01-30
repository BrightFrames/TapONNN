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
        ['shiprocket', 'delhivery', 'razorpay', 'stripe'].includes(p.slug?.toLowerCase()) // Safety check if categories drift
    );

    if (relevantPlugins.length === 0) return null;

    return (
        <div className="mt-6 border-t pt-4">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Truck className="w-4 h-4 text-purple-600" />
                Shipping & Payments
                <Badge variant="secondary" className="text-[10px] h-5">Recommended</Badge>
            </h4>
            <div className="grid grid-cols-1 gap-3">
                {relevantPlugins.slice(0, 3).map(plugin => { // Show top 3 relevant
                    const isInstalled = installedPluginIds.includes(plugin._id);
                    const isInstalling = installingId === plugin._id;

                    return (
                        <div key={plugin._id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50/50 hover:border-purple-100 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-lg">
                                    {/* Simple icon mapping or fallback */}
                                    {plugin.icon === 'truck' ? <Truck className="w-4 h-4 text-blue-600" /> :
                                        plugin.icon === 'credit-card' ? <CreditCard className="w-4 h-4 text-green-600" /> :
                                            <span className="text-xs">⚡</span>}
                                </div>
                                <div>
                                    <div className="font-medium text-sm flex items-center gap-1">
                                        {plugin.name}
                                        {plugin.is_premium && <span className="text-[10px] text-amber-600 bg-amber-50 px-1 rounded">Pro</span>}
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-1">{plugin.description}</p>
                                </div>
                            </div>

                            {isInstalled ? (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-xs gap-1"
                                    onClick={() => onConfigure(plugin)}
                                    type="button" // Prevent form submit
                                >
                                    <Settings className="w-3 h-3" /> Configure
                                </Button>
                            ) : (
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    className="h-7 text-xs bg-white border border-gray-200 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200"
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
