import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import { Search } from "lucide-react";

interface Link {
    id: string;
    title: string;
    url: string;
    isActive: boolean;
}

interface Product {
    id: string;
    title: string;
    description?: string;
    price: number;
    image_url?: string;
    file_url?: string;
}

const PhonePreview = ({
    username,
    userImage,
    links,
    products = [] // New prop
}: {
    username: string;
    userImage?: string;
    links: Link[];
    products?: Product[];
}) => {
    const [previewTab, setPreviewTab] = useState<'links' | 'shop'>('links');

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

                    {/* Preview Tabs (Links | Shop) - Only show if there are products */}
                    <div className="mt-2 flex bg-black/20 backdrop-blur-sm p-1 rounded-full">
                        <button
                            onClick={() => setPreviewTab('links')}
                            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${previewTab === 'links' ? 'bg-white text-black shadow-sm' : 'text-white/70 hover:text-white'}`}
                        >
                            Links
                        </button>
                        <button
                            onClick={() => setPreviewTab('shop')}
                            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${previewTab === 'shop' ? 'bg-white text-black shadow-sm' : 'text-white/70 hover:text-white'}`}
                        >
                            Shop
                        </button>
                    </div>
                </div>

                <div className="mt-8 space-y-4">
                    {previewTab === 'links' ? (
                        <>
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
                        </>
                    ) : (
                        // Shop View
                        <div className="space-y-4">
                            {/* Search Bar */}
                            <div className="relative w-full">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-50 text-current" />
                                <input
                                    type="text"
                                    placeholder={`Search products`}
                                    className="w-full pl-8 pr-4 py-2.5 rounded-xl text-xs bg-white/10 backdrop-blur-md border border-white/10 placeholder:text-white/50 focus:outline-none focus:ring-1 focus:ring-white/30 transition-all font-medium text-white"
                                />
                            </div>

                            {products.length > 0 ? (
                                <div className="grid gap-3">
                                    {products.map(product => (
                                        <div
                                            key={product.id}
                                            className="bg-white rounded-xl overflow-hidden shadow-sm"
                                        >
                                            <div className="aspect-[4/3] bg-gray-100 relative">
                                                {product.image_url ? (
                                                    <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-2xl">🛍️</div>
                                                )}
                                            </div>
                                            <div className="p-3 text-black">
                                                <h3 className="font-bold text-sm leading-tight mb-1">{product.title}</h3>
                                                <div className="flex items-center justify-between mt-2">
                                                    <span className="font-bold text-sm">${product.price}</span>
                                                    <div className="flex gap-1">
                                                        <button className="h-7 px-2 text-[10px] font-bold rounded-full bg-white border border-gray-200 text-black hover:bg-gray-50">
                                                            Enquiry
                                                        </button>
                                                        <button className="h-7 px-3 text-[10px] font-bold rounded-full bg-black text-white hover:bg-black/80">
                                                            Buy
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center text-white/50 text-sm mt-10">No products added yet</div>
                            )}
                        </div>
                    )}
                </div>

                <div className="mt-auto absolute bottom-8 w-full left-0 flex flex-col items-center gap-2">
                    <button className="bg-white text-black px-4 py-2 rounded-full text-xs font-bold">Join @{username} on Tap2</button>
                </div>
            </div>
        </div>
    );
};

export default PhonePreview;
