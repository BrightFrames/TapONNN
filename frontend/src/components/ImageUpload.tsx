import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, X, ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadProps {
    value?: string;
    onChange: (url: string) => void;
    label?: string;
    className?: string;
}

export function ImageUpload({ value, onChange, label = "Upload Image", className = "" }: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validation (Max 5MB, Images only)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("File size must be less than 5MB");
            return;
        }
        if (!file.type.startsWith('image/')) {
            toast.error("Only image files are allowed");
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const token = localStorage.getItem('auth_token');
            // Note: Upload endpoint might not be authenticated yet based on my implementation, 
            // but passing token is good practice if we add auth later.

            const res = await fetch(`${API_URL}/upload`, {
                method: 'POST',
                body: formData,
                headers: token ? {
                    'Authorization': `Bearer ${token}`
                } : {}
            });

            if (!res.ok) {
                throw new Error("Upload failed");
            }

            const data = await res.json();
            if (data.success && data.url) {
                onChange(data.url);
                toast.success("Image uploaded successfully");
            } else {
                throw new Error(data.error || "Upload failed");
            }

        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Failed to upload image");
        } finally {
            setIsUploading(false);
            // Reset input so same file can be selected again if needed
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleRemove = () => {
        onChange("");
    };

    return (
        <div className={`space-y-2 ${className}`}>
            {value ? (
                <div className="relative aspect-video w-full max-w-xs rounded-xl overflow-hidden border border-gray-200 group">
                    <img
                        src={value}
                        alt="Uploaded"
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={handleRemove}
                            className="rounded-full w-9 h-9"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            ) : (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-purple-500 hover:bg-purple-50/50 transition-all group"
                >
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-purple-100 group-hover:text-purple-600 transition-colors">
                        {isUploading ? (
                            <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                        ) : (
                            <Upload className="w-5 h-5 text-gray-500 group-hover:text-purple-600" />
                        )}
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-medium text-gray-700 group-hover:text-purple-700">
                            {isUploading ? "Uploading..." : label}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            Max 5MB. JPG, PNG, GIF
                        </p>
                    </div>
                </div>
            )}

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
            />
        </div>
    );
}
