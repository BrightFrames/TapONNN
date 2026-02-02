
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Check, Share2, Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ShareModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    username: string;
    url: string;
    type?: 'profile' | 'store';
}

const ShareModal = ({ open, onOpenChange, username, url, type = 'profile' }: ShareModalProps) => {
    const [copied, setCopied] = useState(false);

    const title = type === 'store' ? 'Share your Store' : 'Share your TapONN';
    const shareMessage = type === 'store'
        ? `Check out my store: ${url}`
        : `Check out my TapONN profile: ${url}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success("Link copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const svg = document.getElementById("qr-code-svg");
        if (!svg) return;

        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx?.drawImage(img, 0, 0);
            const pngFile = canvas.toDataURL("image/png");

            const downloadLink = document.createElement("a");
            downloadLink.download = `taponn-${username}-${type}-qr.png`;
            downloadLink.href = pngFile;
            downloadLink.click();
            toast.success("QR Code downloaded");
        };

        img.src = "data:image/svg+xml;base64," + btoa(svgData);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-center text-xl">{title}</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col items-center justify-center py-6 space-y-6">
                    <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100 relative group">
                        <div className="bg-white p-2 rounded-lg">
                            <QRCodeSVG
                                id="qr-code-svg"
                                value={url}
                                size={200}
                                level={"H"}
                                includeMargin={true}
                                imageSettings={{
                                    src: "/logo.png", // We'll just assume logo might not be there or handle error
                                    x: undefined,
                                    y: undefined,
                                    height: 24,
                                    width: 24,
                                    excavate: true,
                                }}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 w-full">
                        <div className="grid flex-1 gap-2">
                            <Button variant="outline" className="w-full justify-start text-muted-foreground bg-muted/30" onClick={handleCopy}>
                                <Share2 className="w-4 h-4 mr-2" />
                                <span className="truncate">{url}</span>
                            </Button>
                        </div>
                        <Button size="icon" className="shrink-0" onClick={handleCopy}>
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 w-full">
                        <Button variant="secondary" onClick={handleDownload} className="w-full">
                            <Download className="w-4 h-4 mr-2" />
                            Download QR
                        </Button>
                        <Button className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white" onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(shareMessage)}`, '_blank')}>
                            WhatsApp
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ShareModal;
