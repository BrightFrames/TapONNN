import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Link {
    id: string;
    title: string;
    url: string;
    isActive: boolean;
    thumbnail?: string;
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
    const { t } = useTranslation();
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
                    <div className="mt-2 flex bg-black/20 backdrop-blur-sm p-1 rounded-full w-fit">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setPreviewTab('links')}
                            className={`px-4 py-1.5 h-auto rounded-full text-xs font-semibold transition-all hover:bg-white/10 ${previewTab === 'links' ? 'bg-white text-black shadow-sm hover:bg-white hover:text-black' : 'text-white/70 hover:text-white'}`}
                        >
                            {t('dashboard.links')}
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setPreviewTab('shop')}
                            className={`px-4 py-1.5 h-auto rounded-full text-xs font-semibold transition-all hover:bg-white/10 ${previewTab === 'shop' ? 'bg-white text-black shadow-sm hover:bg-white hover:text-black' : 'text-white/70 hover:text-white'}`}
                        >
                            {t('dashboard.offerings')}
                        </Button>
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
                                    className="relative flex items-center justify-center w-full py-3 px-12 bg-[#e9f6e3] text-[#132c25] rounded-full text-center font-semibold hover:scale-[1.02] transition-transform text-sm shadow-sm"
                                >
                                    {link.thumbnail && (
                                        <div className="absolute left-3 w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-white/20 p-1">
                                            <img src={link.thumbnail} alt="" className="w-full h-full object-cover rounded-full" />
                                        </div>
                                    )}
                                    <span className="truncate w-full">{link.title}</span>
                                </a>
                            ))}
                            {links.filter(l => l.isActive).length === 0 && (
                                <div className="text-center text-white/50 text-sm mt-10">{t('dashboard.addLinksHere')}</div>
                            )}
                        </>
                    ) : (
                        // Shop View
                        <div className="space-y-4">
                            {/* Search Bar */}
                            <div className="relative w-full">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-50 text-current" />
                                <Input
                                    type="text"
                                    placeholder={t('shop.searchProducts') || "Search products"}
                                    className="w-full pl-8 pr-4 py-2.5 h-auto rounded-xl text-xs bg-white/10 backdrop-blur-md border border-white/10 placeholder:text-white/50 focus-visible:ring-1 focus-visible:ring-white/30 transition-all font-medium text-white shadow-none"
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
                                                        <Button variant="outline" size="sm" className="h-7 px-2 text-[10px] font-bold rounded-full border-gray-200 text-black hover:bg-gray-50">
                                                            {t('shop.enquiry')}
                                                        </Button>
                                                        <Button size="sm" className="h-7 px-3 text-[10px] font-bold rounded-full bg-black text-white hover:bg-black/80">
                                                            {t('common.buy')}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center text-white/50 text-sm mt-10">{t('shop.noProducts')}</div>
                            )}
                        </div>
                    )}
                </div>

                <div className="mt-auto absolute bottom-8 w-full left-0 flex flex-col items-center gap-2">
                    <Button variant="secondary" className="bg-white text-black px-4 py-2 h-auto rounded-full text-xs font-bold hover:bg-white/90">
                        {t('common.joinOnTap2', { username })}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default PhonePreview;
