import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Camera, Loader2, X } from "lucide-react";

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

    const handleRemoveAvatar = () => {
        setPreviewUrl(null);
        onUploadComplete("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const displayUrl = previewUrl || currentAvatarUrl;

    return (
        <div className="flex items-center gap-6">
            <div className="relative group">
                <Avatar className="w-24 h-24 border-4 border-gray-100">
                    <AvatarImage src={displayUrl} />
                    <AvatarFallback className="bg-purple-100 text-purple-700 text-2xl font-bold">
                        {userInitial}
                    </AvatarFallback>
                </Avatar>

                {/* Upload overlay */}
                <div
                    className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                >
                    {uploading ? (
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                    ) : (
                        <Camera className="w-6 h-6 text-white" />
                    )}
                </div>

                {/* Remove button */}
                {displayUrl && !uploading && (
                    <button
                        onClick={handleRemoveAvatar}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                        <X className="w-3 h-3" />
                    </button>
                )}
            </div>

            <div className="space-y-2">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                />
                <Button
                    variant="outline"
                    className="gap-2 rounded-xl"
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
                            <Camera className="w-4 h-4" />
                            Change Avatar
                        </>
                    )}
                </Button>
                <p className="text-xs text-gray-500">JPG, PNG or GIF. Max 2MB.</p>
            </div>
        </div>
    );
};

export default AvatarUpload;
