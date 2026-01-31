import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/ImageUpload";
import { Trash2 } from "lucide-react";

interface ThumbnailSelectorProps {
    currentThumbnail?: string;
    onSelect: (thumbnail: string) => void;
    children: React.ReactNode;
}

export const ThumbnailSelector = ({ currentThumbnail, onSelect, children }: ThumbnailSelectorProps) => {
    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Upload Thumbnail</DialogTitle>
                </DialogHeader>

                <div className="py-4">
                    <ImageUpload
                        value={currentThumbnail && currentThumbnail.startsWith('http') ? currentThumbnail : ''}
                        onChange={(url) => onSelect(url)}
                        label="Upload Thumbnail"
                    />
                </div>

                <div className="flex justify-end">
                    <Button variant="ghost" onClick={() => onSelect('')} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove Thumbnail
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
