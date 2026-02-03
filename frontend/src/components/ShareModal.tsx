
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Check, Share2, Download, Link as LinkIcon } from "lucide-react";
import { Facebook, Twitter, Linkedin, MessageCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ShareModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    username: string;
    url: string;
    type?: 'profile' | 'store';
    userAvatar?: string;
    userName?: string;
}

const ShareModal = ({ open, onOpenChange, username, url, type = 'profile', userAvatar, userName }: ShareModalProps) => {
    const [copied, setCopied] = useState(false);

    const title = type === 'store' ? 'Share TapX' : 'Share TapX';
    const shareMessage = type === 'store'
        ? `Check out my store on TapX: ${url}`
        : `Check out my TapX profile: ${url}`;

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
            downloadLink.download = `tapx-${username}-${type}-qr.png`;
            downloadLink.href = pngFile;
            downloadLink.click();
            toast.success("QR Code downloaded");
        };

        img.src = "data:image/svg+xml;base64," + btoa(svgData);
    };

    const socialButtons = [
        {
            name: 'Copy Linktree',
            icon: LinkIcon,
            color: 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700',
            onClick: handleCopy
        },
        {
            name: 'X',
            icon: Twitter,
            color: 'bg-black hover:bg-zinc-800 text-white',
            onClick: () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}`, '_blank')
        },
        {
            name: 'Facebook',
            icon: Facebook,
            color: 'bg-[#1877F2] hover:bg-[#0C63D4] text-white',
            onClick: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
        },
        {
            name: 'WhatsApp',
            icon: MessageCircle,
            color: 'bg-[#25D366] hover:bg-[#128C7E] text-white',
            onClick: () => window.open(`https://wa.me/?text=${encodeURIComponent(shareMessage)}`, '_blank')
        },
        {
            name: 'LinkedIn',
            icon: Linkedin,
            color: 'bg-[#0A66C2] hover:bg-[#004182] text-white',
            onClick: () => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank')
        },
        {
            name: 'Messenger',
            icon: MessageCircle,
            color: 'bg-gradient-to-br from-[#00B2FF] to-[#006AFF] hover:opacity-90 text-white',
            onClick: () => window.open(`https://www.facebook.com/dialog/send?link=${encodeURIComponent(url)}&app_id=YOUR_APP_ID&redirect_uri=${encodeURIComponent(url)}`, '_blank')
        }
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-white text-black">
                <DialogHeader>
                    <DialogTitle className="text-center text-xl font-bold">{title}</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col items-center justify-center py-4 space-y-6">
                    {/* QR Code + Avatar Card */}
                    <div className="relative w-full bg-gradient-to-br from-purple-100 via-purple-50 to-blue-50 rounded-3xl p-6 overflow-hidden">
                        <div className="flex items-center justify-between gap-4">
                            {/* QR Code */}
                            <div className="bg-white p-3 rounded-2xl shadow-lg border-4 border-black flex-shrink-0">
                                <QRCodeSVG
                                    id="qr-code-svg"
                                    value={url}
                                    size={140}
                                    level={"H"}
                                    includeMargin={false}
                                    fgColor="#000000"
                                    bgColor="#FFFFFF"
                                />
                            </div>

                            {/* User Avatar */}
                            <div className="flex-1 flex items-center justify-center">
                                <div className="w-32 h-32 rounded-2xl overflow-hidden bg-gradient-to-br from-purple-200 to-purple-300 flex items-center justify-center shadow-xl border-4 border-white">
                                    {userAvatar ? (
                                        <img src={userAvatar} alt={userName || username} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-6xl text-purple-600">
                                            {(userName || username)?.[0]?.toUpperCase() || '👤'}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Social Sharing Buttons */}
                    <div className="w-full">
                        <div className="grid grid-cols-6 gap-3">
                            {socialButtons.map((button) => (
                                <div key={button.name} className="flex flex-col items-center gap-1">
                                    <button
                                        onClick={button.onClick}
                                        className={`w-12 h-12 rounded-full ${button.color} flex items-center justify-center transition-transform hover:scale-110 active:scale-95 shadow-md`}
                                    >
                                        <button.icon className="w-5 h-5" />
                                    </button>
                                    <span className="text-[10px] text-gray-600 text-center leading-tight">{button.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Promotional CTA */}
                    <div className="w-full bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-2xl p-6 text-center space-y-3">
                        <h3 className="text-white font-bold text-lg">
                            Join <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">@{username}</span> on TapX
                        </h3>
                        <p className="text-zinc-400 text-sm">
                            Get your own free TapX. The only link in bio trusted by 70M+ people.
                        </p>
                        <div className="flex gap-3 pt-2">
                            <Button
                                className="flex-1 bg-white hover:bg-zinc-100 text-black font-bold rounded-full h-11"
                                onClick={() => window.open('https://taponn.com/signup', '_blank')}
                            >
                                Join Now
                            </Button>
                            <Button
                                variant="outline"
                                className="flex-1 border-white/20 text-white hover:bg-white/10 font-bold rounded-full h-11"
                                onClick={() => window.open('https://taponn.com', '_blank')}
                            >
                                Lern More
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ShareModal;
