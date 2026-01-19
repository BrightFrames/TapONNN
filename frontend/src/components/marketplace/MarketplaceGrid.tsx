import { MarketplaceItem } from "@/data/marketplaceData";
import MarketplaceItemCard from "./MarketplaceItemCard";

interface MarketplaceGridProps {
    items: MarketplaceItem[];
    categoryName: string;
}

const MarketplaceGrid = ({ items, categoryName }: MarketplaceGridProps) => {
    return (
        <div className="flex-1">
            {/* Category Header */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">
                    {categoryName === "All" ? "All Templates" : categoryName}
                </h2>
                <p className="text-gray-500 mt-1">
                    {items.length} template{items.length !== 1 ? 's' : ''} available
                </p>
            </div>

            {/* Grid */}
            {items.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map((item) => (
                        <MarketplaceItemCard key={item.id} item={item} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-gray-50 rounded-2xl">
                    <p className="text-gray-500">No templates found in this category.</p>
                </div>
            )}
        </div>
    );
};

export default MarketplaceGrid;
