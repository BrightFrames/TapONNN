import { MarketplaceItem } from "@/data/marketplaceData";

interface MarketplaceItemCardProps {
    item: MarketplaceItem;
}

const MarketplaceItemCard = ({ item }: MarketplaceItemCardProps) => {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg hover:border-gray-200 transition-all duration-200 cursor-pointer group">
            {/* Thumbnail */}
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-2xl mb-4 group-hover:scale-105 transition-transform">
                {item.thumbnail}
            </div>

            {/* Content */}
            <h3 className="font-semibold text-gray-900 text-base mb-1 group-hover:text-[#1E2330]">
                {item.title}
            </h3>
            <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                {item.description}
            </p>

            {/* Category Badge */}
            <span className="inline-block text-xs font-medium text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
                {item.category}
            </span>

            {/* Tags */}
            {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                    {item.tags.map((tag, idx) => (
                        <span key={idx} className="text-xs text-gray-400">
                            #{tag}
                        </span>
                    ))}
                </div>
            )}

            {/* Price if available */}
            {item.price !== undefined && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                    <span className="text-sm font-semibold text-[#1E2330]">
                        ${item.price.toFixed(2)}
                    </span>
                </div>
            )}
        </div>
    );
};

export default MarketplaceItemCard;
