
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Check, Download, Link as LinkIcon, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// White versions of brand icons for ShareModal buttons
const WhatsAppIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
);

const TwitterIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
);

const TelegramIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg" fill="currentColor">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
    </svg>
);

const LinkedInIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
);

const MessengerIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg" fill="currentColor">
        <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.092.3 2.246.464 3.443.464 6.627 0 12-4.974 12-11.111S18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8l3.131 3.259L19.752 8l-6.561 6.963z"/>
    </svg>
);

const EmailIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg" fill="currentColor">
        <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
    </svg>
);

const SMSIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg" fill="currentColor">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
        <circle cx="8" cy="10" r="1.5"/>
        <circle cx="12" cy="10" r="1.5"/>
        <circle cx="16" cy="10" r="1.5"/>
    </svg>
);

const PinterestIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg" fill="currentColor">
        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z"/>
    </svg>
);

const RedditIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg" fill="currentColor">
        <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
    </svg>
);

const ThreadsIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg" fill="currentColor">
        <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.96-.065-1.182.408-2.256 1.33-3.022.88-.73 2.132-1.13 3.628-1.154 1.12-.018 2.142.127 3.055.433-.039-1.16-.303-2.05-.8-2.648-.522-.628-1.303-.941-2.386-.958-.876.012-1.612.252-2.128.698-.49.423-.793 1-.9 1.712l-2.04-.34c.165-1.108.64-2.037 1.413-2.762 1.014-.952 2.429-1.442 4.206-1.455h.06c1.753.015 3.128.532 4.088 1.535.896.935 1.393 2.257 1.478 3.928.506.238.959.522 1.353.849 1.014.84 1.721 1.954 2.105 3.315.391 1.39.299 3.008-.274 4.81-.826 2.6-2.654 4.393-5.275 5.184-1.232.372-2.531.558-3.861.555zm.008-2.116h-.001c1.12.002 2.216-.152 3.256-.457 2.053-.62 3.464-1.947 4.071-3.83.49-1.522.48-2.723.205-3.64-.276-.92-.798-1.604-1.592-2.086l-.111-.068c-.087.808-.258 1.544-.514 2.21l-.057.145c-.122.302-.263.59-.422.864l-.14.23c-.357.555-.79 1.018-1.29 1.381l-.187.13c-.556.371-1.185.643-1.873.81l-.242.055c-.49.101-.997.152-1.508.152-.236 0-.474-.011-.714-.033l-.282-.03c-.556-.07-1.092-.21-1.596-.418l-.252-.11c-.505-.232-.961-.535-1.358-.9l-.21-.202c-.398-.404-.722-.874-.962-1.399l-.119-.276c-.113-.283-.204-.58-.272-.889-.316.21-.585.486-.79.827-.352.586-.489 1.318-.386 2.058.093.675.41 1.24.917 1.633.583.452 1.382.695 2.313.703h.092c1.144-.054 2.034-.447 2.647-1.169.524-.617.87-1.497.975-2.479.087-.03.173-.062.258-.095.316.12.645.218.983.295l.238.05c.114.022.228.042.343.059l.234.03c.152.018.305.032.46.042.13.63.186 1.286.17 1.954-.048 1.99-.642 3.675-1.764 5.009-1.09 1.295-2.62 2.136-4.55 2.497-.414.077-.84.119-1.275.125zm-2.154-7.39c-.025 0-.05 0-.075.002-.993.024-1.78.272-2.342.739-.541.45-.783 1.003-.72 1.646.056.576.333 1.027.825 1.344.542.35 1.315.52 2.161.478 1.078-.053 1.88-.406 2.38-1.051.435-.56.709-1.355.766-2.231-.893-.287-1.92-.449-2.995-.927z"/>
    </svg>
);

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
            name: 'Copy Link',
            icon: LinkIcon,
            color: 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700',
            onClick: handleCopy
        },
        {
            name: 'WhatsApp',
            icon: WhatsAppIcon,
            color: 'bg-[#25D366] hover:bg-[#128C7E] text-white',
            onClick: () => window.open(`https://wa.me/?text=${encodeURIComponent(shareMessage)}`, '_blank')
        },
        {
            name: 'Instagram',
            icon: InstagramIcon,
            color: 'bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-90 text-white',
            onClick: () => {
                navigator.clipboard.writeText(url);
                toast.success("Link copied! Share it on Instagram Stories");
            }
        },
        {
            name: 'X',
            icon: TwitterIcon,
            color: 'bg-black hover:bg-zinc-800 text-white',
            onClick: () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}`, '_blank')
        },
        {
            name: 'Facebook',
            icon: FacebookIcon,
            color: 'bg-[#1877F2] hover:bg-[#0C63D4] text-white',
            onClick: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
        },
        {
            name: 'Telegram',
            icon: TelegramIcon,
            color: 'bg-[#0088CC] hover:bg-[#006699] text-white',
            onClick: () => window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareMessage)}`, '_blank')
        },
        {
            name: 'LinkedIn',
            icon: LinkedInIcon,
            color: 'bg-[#0A66C2] hover:bg-[#004182] text-white',
            onClick: () => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank')
        },
        {
            name: 'Messenger',
            icon: MessengerIcon,
            color: 'bg-gradient-to-br from-[#00B2FF] to-[#006AFF] hover:opacity-90 text-white',
            onClick: () => window.open(`https://www.facebook.com/dialog/send?link=${encodeURIComponent(url)}&app_id=291494419107518&redirect_uri=${encodeURIComponent(url)}`, '_blank')
        },
        {
            name: 'Email',
            icon: EmailIcon,
            color: 'bg-[#EA4335] hover:bg-[#C5221F] text-white',
            onClick: () => window.open(`mailto:?subject=${encodeURIComponent(`Check out ${username}'s profile`)}&body=${encodeURIComponent(shareMessage)}`, '_blank')
        },
        {
            name: 'SMS',
            icon: SMSIcon,
            color: 'bg-[#34C759] hover:bg-[#28A745] text-white',
            onClick: () => window.open(`sms:?body=${encodeURIComponent(shareMessage)}`, '_blank')
        },
        {
            name: 'Pinterest',
            icon: PinterestIcon,
            color: 'bg-[#E60023] hover:bg-[#C5001E] text-white',
            onClick: () => window.open(`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(shareMessage)}`, '_blank')
        },
        {
            name: 'Reddit',
            icon: RedditIcon,
            color: 'bg-[#FF4500] hover:bg-[#CC3700] text-white',
            onClick: () => window.open(`https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(shareMessage)}`, '_blank')
        },
        {
            name: 'Threads',
            icon: ThreadsIcon,
            color: 'bg-black hover:bg-zinc-800 text-white',
            onClick: () => {
                navigator.clipboard.writeText(url);
                toast.success("Link copied! Paste it on Threads");
            }
        },
        {
            name: 'More',
            icon: MoreHorizontal,
            color: 'bg-zinc-200 hover:bg-zinc-300 text-zinc-700',
            onClick: async () => {
                if (navigator.share) {
                    try {
                        await navigator.share({
                            title: `${username}'s Profile`,
                            text: shareMessage,
                            url: url
                        });
                    } catch (err) {
                        console.log('Share cancelled');
                    }
                } else {
                    handleCopy();
                }
            }
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
                        <div className="grid grid-cols-7 gap-2 max-h-[180px] overflow-y-auto pr-1">
                            {socialButtons.map((button) => (
                                <div key={button.name} className="flex flex-col items-center gap-1">
                                    <button
                                        onClick={button.onClick}
                                        className={`w-10 h-10 rounded-full ${button.color} flex items-center justify-center transition-transform hover:scale-110 active:scale-95 shadow-md`}
                                    >
                                        <button.icon className="w-4 h-4" />
                                    </button>
                                    <span className="text-[9px] text-gray-600 text-center leading-tight truncate w-full">{button.name}</span>
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
