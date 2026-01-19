import { useState, useMemo } from "react";
import { CategorySidebar, MarketplaceGrid } from "@/components/marketplace";
import { marketplaceItems, MarketplaceCategory } from "@/data/marketplaceData";

const TemplateMarketplace = () => {
    const [selectedCategory, setSelectedCategory] = useState<MarketplaceCategory>("All");

    // Filter items based on selected category - memoized for performance
    const filteredItems = useMemo(() => {
        if (selectedCategory === "All") {
            return marketplaceItems;
        }
        return marketplaceItems.filter(item => item.category === selectedCategory);
    }, [selectedCategory]);

    // Handle category change
    const handleCategoryChange = (category: MarketplaceCategory) => {
        setSelectedCategory(category);
    };

    return (
        <div className="min-h-screen bg-[#F9F9F9] text-[#1E2330] font-sans">
            <div className="container mx-auto px-4 py-12 lg:py-20">

                {/* Hero Section */}
                <div className="text-center mb-16 lg:mb-24">
                    <h1 className="text-4xl md:text-5xl lg:text-7xl font-black mb-6 lg:mb-8 tracking-tight text-[#1E2330]">
                        Template Marketplace
                    </h1>
                    <p className="text-base md:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        Discover plug-and-play templates designed by top creators.
                        Choose from categories and find templates that solve real problems.
                    </p>
                </div>

                {/* Main Layout */}
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">

                    {/* Category Sidebar */}
                    <CategorySidebar
                        selectedCategory={selectedCategory}
                        onCategoryChange={handleCategoryChange}
                    />

                    {/* Marketplace Grid */}
                    <MarketplaceGrid
                        items={filteredItems}
                        categoryName={selectedCategory}
                    />

                </div>
            </div>
        </div>
    );
};

export default TemplateMarketplace;
