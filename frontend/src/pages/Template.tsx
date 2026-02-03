
import React, { useState } from "react";
import { templates, TemplateData, getButtonIcon, categories } from "../data/templates";

const TemplateCard = ({ template }: { template: TemplateData }) => {
    return (
        <div className="flex flex-col items-center gap-4 group">
            {/* Phone Frame */}
            <div
                className={`relative w-[280px] h-[580px] rounded-[3rem] overflow-hidden shadow-2xl transition-transform duration-300 group-hover:-translate-y-2 border-[6px] border-black/5 ${template.bgClass || ''}`}
                style={template.bgImage ? { backgroundImage: `url(${template.bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
            >
                {/* Overlay for readability if image */}
                {template.bgImage && <div className="absolute inset-0 bg-black/20" />}

                {/* Content */}
                <div className="relative h-full flex flex-col items-center pt-16 px-6 pb-8 z-10">

                    {/* Avatar */}
                    <div className="mb-4">
                        {template.avatar.startsWith('http') ? (
                            <img src={template.avatar} alt={template.creator} className="w-20 h-20 rounded-full object-cover border-2 border-white/20" />
                        ) : (
                            <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold ${template.id === 'artemis' ? 'bg-[#3A4D3F] text-[#E07F4F]' : 'bg-red-600 text-white'}`}>
                                {template.avatar}
                            </div>
                        )}
                    </div>

                    {/* Header Text */}
                    <h3 className={`text-xl font-bold mb-1 text-center ${template.textColor}`}>{template.creator}</h3>
                    <p className={`text-xs text-center opacity-90 mb-8 max-w-[200px] leading-tight ${template.textColor}`}>{template.role}</p>

                    {/* Links */}
                    <div className="w-full flex-1 flex flex-col gap-3">
                        {template.links.map((link, i) => (
                            <button key={i} className={template.buttonStyle}>
                                {template.hasIconsInButtons && getButtonIcon(i)}
                                {link}
                            </button>
                        ))}
                    </div>

                    {/* Social Icons */}
                    <div className={`flex gap-4 mt-auto justify-center ${template.textColor}`}>
                        {template.icons.map((icon, i) => (
                            <div key={i} className="hover:opacity-80 cursor-pointer">
                                {icon}
                            </div>
                        ))}
                    </div>

                </div>
            </div>

            {/* Template Name */}
            <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
        </div>
    );
};

const Template = () => {
    const [selectedCategory, setSelectedCategory] = useState<string>("All");

    // Filter templates based on selected category
    const filteredTemplates = selectedCategory === "All"
        ? templates
        : templates.filter(t => t.category === selectedCategory);

    return (
        <div className="min-h-screen bg-[#F9F9F9] text-[#1E2330] font-sans">
            <div className="container mx-auto px-4 py-20">

                {/* Hero Section */}
                <div className="text-center mb-24">
                    <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tight text-[#1E2330]">
                        A TapX template to<br />suit every brand and<br />creator
                    </h1>
                    <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        Different Link Apps, integrations and visual styles can help you create a TapX that looks and feels like you and your brand. Explore our library of custom templates to grow and connect with your audience even more easily!
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-12 items-start">

                    {/* Categories Sidebar/List */}
                    <div className="w-full lg:w-64 flex-shrink-0">
                        <div className="flex flex-row lg:flex-col flex-wrap gap-3 sticky top-8">
                            {categories.map((cat, i) => (
                                <button
                                    key={i}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-6 py-3 rounded-full border text-sm font-semibold transition-all text-left whitespace-nowrap ${selectedCategory === cat
                                        ? 'bg-[#1E2330] text-white border-[#1E2330] shadow-lg'
                                        : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300'
                                        }`}
                                >
                                    {cat}
                                    {cat !== "All" && (
                                        <span className={`ml-2 text-xs ${selectedCategory === cat ? 'text-gray-300' : 'text-gray-400'}`}>
                                            ({templates.filter(t => t.category === cat).length})
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Templates Grid */}
                    <div className="flex-1">
                        {/* Category Header */}
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {selectedCategory === "All" ? "All Templates" : selectedCategory}
                            </h2>
                            <p className="text-gray-500 mt-1">
                                {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} available
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16 justify-items-center">
                            {filteredTemplates.map((t) => (
                                <TemplateCard key={t.id} template={t} />
                            ))}
                        </div>

                        {/* Empty State */}
                        {filteredTemplates.length === 0 && (
                            <div className="text-center py-16">
                                <p className="text-gray-500">No templates found in this category.</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Template;

