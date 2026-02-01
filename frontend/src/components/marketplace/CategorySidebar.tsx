import { MarketplaceCategory, marketplaceItems, MARKETPLACE_CATEGORIES } from "@/data/marketplaceData";
import { Button } from "@/components/ui/button";

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
                        <Button
                            key={category}
                            variant={isActive ? "default" : "outline"}
                            onClick={() => onCategoryChange(category)}
                            className={`
                                rounded-full text-sm font-semibold h-auto py-3 px-6 w-full
                                transition-all duration-200 ease-in-out
                                justify-between gap-3
                                ${isActive
                                    ? 'shadow-lg hover:bg-zinc-800'
                                    : 'bg-white hover:bg-gray-50 border-gray-200'
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
                        </Button>
                    );
                })}
            </div>
        </div>
    );
};

export default CategorySidebar;
