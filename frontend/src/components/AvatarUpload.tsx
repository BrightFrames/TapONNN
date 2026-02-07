import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Camera, Loader2, ImagePlus } from "lucide-react";
import { getImageUrl } from "@/utils/imageUtils";

interface AvatarUploadProps {
    currentAvatarUrl?: string;
    userName?: string;
    onUploadComplete: (url: string) => void;
}

const AvatarUpload = ({ currentAvatarUrl, userName, onUploadComplete }: AvatarUploadProps) => {
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const userInitial = (userName || "U")[0]?.toUpperCase();

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error("Please select an image file");
            return;
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            toast.error("Image must be less than 2MB");
            return;
        }

        // Create preview
        const preview = URL.createObjectURL(file);
        setPreviewUrl(preview);

        // Upload to Supabase Storage
        await uploadAvatar(file);
    };

    const uploadAvatar = async (file: File) => {
        setUploading(true);

        try {
            // Convert to Base64
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const base64String = reader.result as string;
                // Pass base64 string directly to parent
                // Parent (Settings.tsx) will save this to the 'avatar_url' field in profiles table
                onUploadComplete(base64String);
                toast.success("Image selected. Click 'Save Changes' to apply.");
                setUploading(false);
            };
            reader.onerror = (error) => {
                console.error("Error reading file:", error);
                toast.error("Failed to process image");
                setUploading(false);
            };
        } catch (err) {
            console.error("Upload error:", err);
            toast.error("Failed to process avatar");
            setUploading(false);
        }
    };

    const displayUrl = previewUrl || getImageUrl(currentAvatarUrl);

    return (
        <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <Avatar className="w-28 h-28 border-4 border-white dark:border-zinc-800 shadow-xl ring-4 ring-gray-100 dark:ring-zinc-800/50 relative">
                    <AvatarImage src={displayUrl} className="object-cover" />
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-3xl font-bold">
                        {userInitial}
                    </AvatarFallback>
                </Avatar>

                {/* Upload overlay */}
                <div
                    className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer backdrop-blur-sm"
                    onClick={() => fileInputRef.current?.click()}
                >
                    {uploading ? (
                        <Loader2 className="w-7 h-7 text-white animate-spin" />
                    ) : (
                        <Camera className="w-7 h-7 text-white" />
                    )}
                </div>

                {/* Camera badge */}
                <div 
                    className="absolute -bottom-1 -right-1 p-2 bg-indigo-500 rounded-full shadow-lg cursor-pointer hover:bg-indigo-600 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <Camera className="w-4 h-4 text-white" />
                </div>
            </div>

            <div className="space-y-3 text-center sm:text-left">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                />
                <Button
                    variant="outline"
                    className="gap-2 rounded-xl border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:border-gray-300 dark:hover:border-zinc-600 transition-all"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                >
                    {uploading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Uploading...
                        </>
                    ) : (
                        <>
                            <ImagePlus className="w-4 h-4" />
                            Change Avatar
                        </>
                    )}
                </Button>
                <p className="text-xs text-gray-500 dark:text-zinc-500">JPG, PNG or GIF. Max 2MB.</p>
            </div>
        </div>
    );
};

export default AvatarUpload;
