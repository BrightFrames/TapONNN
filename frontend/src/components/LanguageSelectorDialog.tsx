import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Search, Languages } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGUAGES } from "@/i18n";

interface LanguageSelectorDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function LanguageSelectorDialog({ open, onOpenChange }: LanguageSelectorDialogProps) {
    const { user, updateProfile } = useAuth();
    const { t, i18n } = useTranslation();
    const [searchQuery, setSearchQuery] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);

    const filteredLanguages = SUPPORTED_LANGUAGES.filter(lang =>
        lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lang.native.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sync i18n with user language on mount
    useEffect(() => {
        const savedLang = user?.language || localStorage.getItem('i18nextLng') || 'en';
        if (i18n.language !== savedLang) {
            i18n.changeLanguage(savedLang);
        }
    }, [user?.language, i18n]);

    const handleSelectLanguage = async (langCode: string) => {
        setIsUpdating(true);
        try {
            // Change i18n language immediately for instant UI update
            await i18n.changeLanguage(langCode);

            // Save to localStorage for guests
            localStorage.setItem('i18nextLng', langCode);

            // If logged in, also save to database
            if (user) {
                await updateProfile({ language: langCode });
            }

            toast.success(t('language.updated'));
            onOpenChange(false);
        } catch (error) {
            console.error("Failed to update language", error);
            toast.error("Failed to update language");
        } finally {
            setIsUpdating(false);
        }
    };

    const currentLang = i18n.language || 'en';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden gap-0">
                <DialogHeader className="p-4 pb-2">
                    <DialogTitle className="flex items-center gap-2">
                        <Languages className="w-5 h-5" />
                        {t('language.selectLanguage')}
                    </DialogTitle>
                </DialogHeader>

                <div className="p-4 pt-0">
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder={t('language.searchLanguage')}
                            className="pl-9 bg-gray-50"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto pr-1">
                        {filteredLanguages.map((lang) => {
                            const isSelected = currentLang === lang.code ||
                                (currentLang.startsWith(lang.code + '-'));
                            return (
                                <Button
                                    key={lang.code}
                                    variant={isSelected ? "default" : "outline"}
                                    className={`justify-between h-auto py-3 px-4 ${isSelected ? 'bg-purple-600 hover:bg-purple-700' : 'hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200'}`}
                                    onClick={() => handleSelectLanguage(lang.code)}
                                    disabled={isUpdating}
                                >
                                    <div className="flex flex-col items-start gap-0.5">
                                        <span className={`font-medium ${isSelected ? 'text-white' : 'text-gray-900'}`}>{lang.native}</span>
                                        <span className={`text-xs ${isSelected ? 'text-purple-100' : 'text-gray-500'}`}>{lang.name}</span>
                                    </div>
                                    {isSelected && <Check className="w-4 h-4 text-white" />}
                                </Button>
                            );
                        })}
                    </div>
                    {filteredLanguages.length === 0 && (
                        <div className="text-center py-8 text-gray-500 text-sm">
                            {t('language.noLanguagesFound')}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
