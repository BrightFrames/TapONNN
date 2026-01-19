import { MarketplaceCategory, marketplaceItems, MARKETPLACE_CATEGORIES } from "@/data/marketplaceData";

interface CategorySidebarProps {
    selectedCategory: MarketplaceCategory;
    onCategoryChange: (category: MarketplaceCategory) => void;
}

const CategorySidebar = ({ selectedCategory, onCategoryChange }: CategorySidebarProps) => {
    // Get count for each category
    const getCategoryCount = (category: MarketplaceCategory): number => {
        if (category === "All") {
            return marketplaceItems.length;
        }
        return marketplaceItems.filter(item => item.category === category).length;
    };

    return (
        <div className="w-full lg:w-64 flex-shrink-0">
            <div className="flex flex-row lg:flex-col flex-wrap gap-3 sticky top-8">
                {MARKETPLACE_CATEGORIES.map((category) => {
                    const isActive = selectedCategory === category;
                    const count = getCategoryCount(category);

                    return (
                        <button
                            key={category}
                            onClick={() => onCategoryChange(category)}
                            className={`
                                px-6 py-3 rounded-full text-sm font-semibold
                                transition-all duration-200 ease-in-out
                                text-left whitespace-nowrap
                                flex items-center justify-between gap-3
                                ${isActive
                                    ? 'bg-[#1E2330] text-white border-[#1E2330] shadow-lg'
                                    : 'bg-white text-[#1E2330] border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                                }
                            `}
                        >
                            <span>{category}</span>
                            <span
                                className={`
                                    text-xs font-medium px-2 py-0.5 rounded-full
                                    ${isActive
                                        ? 'bg-white/20 text-white'
                                        : 'bg-gray-100 text-gray-500'
                                    }
                                `}
                            >
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default CategorySidebar;
