import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Link {
    id: string;
    title: string;
    url: string;
    isActive: boolean;
}

const PhonePreview = ({
    username,
    userImage,
    links
}: {
    username: string;
    userImage?: string;
    links: Link[];
}) => {
    return (
        <div className="fixed top-24 right-8 w-[350px] h-[700px] bg-black rounded-[3rem] border-8 border-gray-900 shadow-2xl overflow-hidden hidden xl:block">
            {/* Status Bar Mock */}
            <div className="h-6 w-full bg-black/90 flex items-center justify-between px-6 text-[10px] text-white font-medium">
                <span>9:41</span>
                <div className="flex gap-1">
                    <span>Signal</span>
                    <span>Wifi</span>
                    <span>Bat</span>
                </div>
            </div>

            {/* Screen Content */}
            <div className="h-full w-full bg-[#132c25] overflow-y-auto text-white p-6 relative">
                {/* Share Button Mock */}
                <div className="absolute top-4 right-4 w-8 h-8 bg-gray-600/50 rounded-full flex items-center justify-center text-xs">
                    ...
                </div>

                <div className="flex flex-col items-center mt-12 space-y-4">
                    <Avatar className="w-24 h-24 border-2 border-white/20">
                        <AvatarImage src={userImage} />
                        <AvatarFallback className="bg-gray-400 text-xl">{username[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <h2 className="text-xl font-bold tracking-tight">@{username}</h2>
                    <div className="flex gap-3 mt-2">
                        {/* Social Icons Mock */}
                        <div className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer">
                            <span className="sr-only">Instagram</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
                        </div>
                    </div>
                </div>

                <div className="mt-8 space-y-4">
                    {links.filter(l => l.isActive).map((link) => (
                        <a
                            key={link.id}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full py-4 px-6 bg-[#e9f6e3] text-[#132c25] rounded-full text-center font-semibold hover:scale-[1.02] transition-transform text-sm"
                        >
                            {link.title}
                        </a>
                    ))}
                    {links.filter(l => l.isActive).length === 0 && (
                        <div className="text-center text-white/50 text-sm mt-10">Add links to see them here</div>
                    )}
                </div>
                <div className="mt-auto absolute bottom-8 w-full left-0 flex flex-col items-center gap-2">
                    <button className="bg-white text-black px-4 py-2 rounded-full text-xs font-bold">Join @{username} on Tap2</button>
                    <div className="text-[10px] text-white/40">Report • Privacy</div>
=======
                <div className="relative z-10 mt-auto absolute bottom-6 w-full left-0 flex flex-col items-center gap-3">
                    {!isShopPreview && <button className="bg-white text-black px-4 py-2 rounded-full text-xs font-bold">Join @{username} on Linktree</button>}

                    {isShopPreview && (
                        <div className="flex flex-col items-center gap-3">
                            <div className="flex items-center gap-2 text-white">
                                <span className="font-bold text-lg tracking-tight">Linktree*</span>
                                <span className="text-base font-light opacity-80">✕</span>
                                <span className="text-sm font-light italic opacity-90">Daniel Triendl</span>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-2 text-[10px] text-white/50 font-medium">
                        <span>Report</span>
                        <span>•</span>
                        <span>Privacy</span>
                    </div>

                <div className="mt-auto absolute bottom-8 w-full left-0 flex flex-col items-center gap-2">
                    <button className="bg-white text-black px-4 py-2 rounded-full text-xs font-bold">Join @{username} on Tap2</button>
                    <div className="text-[10px] text-white/40">Report • Privacy</div>


                </div>
            </div>
        </div>
    );
};

export default PhonePreview;
