import { useState } from "react";
import { Upload, X, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface FileUploadProps {
    value?: string;
    onChange: (url: string) => void;
    onUploadStart?: () => void;
    onUploadEnd?: () => void;
    maxSizeMB?: number;
    accept?: string;
    label?: string;
    endpoint?: string;
    type?: string;
}

export const FileUpload = ({
    value,
    onChange,
    onUploadStart,
    onUploadEnd,
    maxSizeMB = 15,
    accept = "*/*",
    label = "Upload File",
    endpoint = "/api/upload",
    type = "product_file"
}: FileUploadProps) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

    const handleFile = async (file: File) => {
        setError(null);

        // Validation
        if (file.size > maxSizeMB * 1024 * 1024) {
            setError(`File size exceeds ${maxSizeMB}MB limit.`);
            toast.error(`File must be smaller than ${maxSizeMB}MB`);
            return;
        }

        setIsUploading(true);
        if (onUploadStart) onUploadStart();

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch(`${API_URL}/upload?type=${type}`, {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();

            if (res.ok) {
                onChange(data.url);
                toast.success("File uploaded successfully");
            } else {
                setError(data.error || "Upload failed");
                toast.error(data.error || "Upload failed");
            }
        } catch (err) {
            setError("Network error during upload");
            toast.error("Network error during upload");
        } finally {
            setIsUploading(false);
            if (onUploadEnd) onUploadEnd();
        }
    };

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const onDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const onSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    return (
        <div className="w-full space-y-3">
            {!value ? (
                <div
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    className={`
                        relative border-2 border-dashed rounded-xl p-8 transition-all
                        flex flex-col items-center justify-center text-center cursor-pointer
                        ${isDragging
                            ? "border-green-500 bg-green-500/10"
                            : "border-neutral-700 hover:border-neutral-500 bg-neutral-800/50"
                        }
                        ${error ? "border-red-500/50 bg-red-500/5" : ""}
                    `}
                >
                    <input
                        type="file"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={onSelect}
                        accept={accept}
                        disabled={isUploading}
                    />

                    {isUploading ? (
                        <>
                            <Loader2 className="w-10 h-10 text-green-500 animate-spin mb-3" />
                            <p className="text-sm font-medium text-neutral-300">Uploading...</p>
                        </>
                    ) : (
                        <>
                            <div className="w-12 h-12 rounded-full bg-neutral-700/50 flex items-center justify-center mb-3 text-neutral-400">
                                <Upload className="w-6 h-6" />
                            </div>
                            <h3 className="text-sm font-semibold text-white mb-1">{label}</h3>
                            <p className="text-xs text-neutral-500">
                                Drag & drop or click to browse <br />
                                (Max {maxSizeMB}MB)
                            </p>
                        </>
                    )}
                </div>
            ) : (
                <div className="relative bg-neutral-800 rounded-xl p-4 border border-neutral-700 flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-lg bg-green-500/20 text-green-500 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white truncate">Uploaded File</p>
                        <p className="text-xs text-green-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Ready to share
                        </p>
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-full"
                        onClick={() => onChange("")}
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            )}

            {error && (
                <div className="text-xs text-red-400 flex items-center gap-1.5 px-1">
                    <AlertCircle className="w-3 h-3" />
                    {error}
                </div>
            )}
        </div>
    );
};
