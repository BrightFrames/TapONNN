import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface PluginConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
    plugin: any;
    currentConfig: Record<string, any>;
    onSave: (config: Record<string, any>) => Promise<void>;
}

export const PluginConfigModal = ({ isOpen, onClose, plugin, currentConfig, onSave }: PluginConfigModalProps) => {
    const [config, setConfig] = useState<Record<string, any>>(currentConfig || {});
    const [saving, setSaving] = useState(false);

    // Reset config when modal opens or plugin changes
    useEffect(() => {
        setConfig(currentConfig || {});
    }, [isOpen, plugin, currentConfig]);

    const handleChange = (key: string, value: string) => {
        setConfig(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await onSave(config);
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    if (!plugin) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        {/* You might want to pass the Icon component or render it here if available */}
                        <DialogTitle>Configure {plugin.name}</DialogTitle>
                    </div>
                    <DialogDescription>
                        Enter your settings for {plugin.name}.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {plugin.config_schema && plugin.config_schema.length > 0 ? (
                        plugin.config_schema.map((field: any) => (
                            <div key={field.name} className="space-y-2">
                                <Label htmlFor={field.name}>{field.label}</Label>
                                <Input
                                    id={field.name}
                                    type={field.type || 'text'}
                                    placeholder={field.placeholder}
                                    value={config[field.name] || ''}
                                    onChange={(e) => handleChange(field.name, e.target.value)}
                                    required={field.required}
                                />
                                {field.helpText && (
                                    <p className="text-xs text-muted-foreground">{field.helpText}</p>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-4 text-muted-foreground">
                            No configuration required for this plugin.
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={saving}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={saving} className="bg-purple-600 hover:bg-purple-700">
                        {saving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            'Save Changes'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
