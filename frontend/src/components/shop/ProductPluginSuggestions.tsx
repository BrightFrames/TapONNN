import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Plus, Truck, CreditCard, Settings, Loader2, ExternalLink } from "lucide-react";

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
    // We keep the props to maintain interface compatibility, but we render a simple CTA.

    return (
        <div className="mt-6 border-t border-neutral-800 pt-4">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-white">
                <Truck className="w-4 h-4 text-purple-400" />
                Shipping & Payments
                <Badge className="bg-purple-900/30 text-purple-300 text-[10px] h-5 border-purple-800/50">Integration</Badge>
            </h4>

            <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/30 flex flex-col sm:flex-row items-center justify-between gap-4 group hover:border-neutral-700 transition-all">
                <div className="flex-1">
                    <p className="text-sm font-medium text-white mb-2">Connect 3rd Party Apps</p>
                    <div className="flex -space-x-2 mb-2">
                        {plugins.slice(0, 4).map((p, i) => (
                            <div key={i} className="w-6 h-6 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-[10px] text-neutral-400 z-10" title={p.name}>
                                {p.icon === 'truck' ? <Truck className="w-3 h-3" /> :
                                    p.icon === 'credit-card' ? <CreditCard className="w-3 h-3" /> :
                                        p.name.charAt(0)}
                            </div>
                        ))}
                        {plugins.length > 4 && (
                            <div className="w-6 h-6 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-[10px] text-neutral-400 z-0">
                                +
                            </div>
                        )}
                    </div>
                    <p className="text-xs text-neutral-500">Integrate shipping, payments, and more.</p>
                </div>
                <Button
                    size="sm"
                    variant="secondary"
                    className="w-full sm:w-auto gap-2 text-xs bg-white text-black hover:bg-neutral-200 shadow-sm"
                    onClick={() => window.open('/marketplace', '_blank')}
                    type="button"
                >
                    Browse Apps <ExternalLink className="w-3 h-3 opacity-50" />
                </Button>
            </div>
        </div>
    );
};
