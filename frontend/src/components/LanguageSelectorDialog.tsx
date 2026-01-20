import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Search, Globe, Languages } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface LanguageSelectorDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const INDIAN_LANGUAGES = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
    { code: 'bn', name: 'Bengali', native: 'বাংলা' },
    { code: 'te', name: 'Telugu', native: 'తెలుగు' },
    { code: 'mr', name: 'Marathi', native: 'मराठी' },
    { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
    { code: 'ur', name: 'Urdu', native: 'اردو' },
    { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
    { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
    { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
    { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
    { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ' },
    { code: 'as', name: 'Assamese', native: 'অসমীয়া' },
    { code: 'ma', name: 'Maithili', native: 'मैथिली' },
    { code: 'sa', name: 'Sanskrit', native: 'संस्कृतम्' },
    { code: 'ks', name: 'Kashmiri', native: 'कॉशुर' },
    { code: 'ne', name: 'Nepali', native: 'नेपाली' },
    { code: 'sd', name: 'Sindhi', native: 'سنڌي' },
    { code: 'kok', name: 'Konkani', native: 'कोंकणी' },
    { code: 'doi', name: 'Dogri', native: 'डोगरी' },
    { code: 'mni', name: 'Manipuri', native: 'মৈতৈলোন্' },
    { code: 'bho', name: 'Bhojpuri', native: 'भोजपुरी' }
];

export function LanguageSelectorDialog({ open, onOpenChange }: LanguageSelectorDialogProps) {
    const { user, updateProfile } = useAuth();
    const [searchQuery, setSearchQuery] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);

    const filteredLanguages = INDIAN_LANGUAGES.filter(lang =>
        lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lang.native.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelectLanguage = async (langCode: string) => {
        if (!user) return;

        setIsUpdating(true);
        try {
            await updateProfile({ language: langCode });
            toast.success("Language updated successfully");
            onOpenChange(false);
            // Ideally validation/reload would happen here if we had actual translations
        } catch (error) {
            console.error("Failed to update language", error);
            toast.error("Failed to update language");
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden gap-0">
                <DialogHeader className="p-4 pb-2">
                    <DialogTitle className="flex items-center gap-2">
                        <Languages className="w-5 h-5" />
                        Select Language
                    </DialogTitle>
                </DialogHeader>

                <div className="p-4 pt-0">
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Search language..."
                            className="pl-9 bg-gray-50"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto pr-1">
                        {filteredLanguages.map((lang) => {
                            const isSelected = user?.language === lang.code || (!user?.language && lang.code === 'en');
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
                            No languages found
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
