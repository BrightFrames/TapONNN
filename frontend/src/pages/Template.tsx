
import React from "react";
import { templates, TemplateData, getButtonIcon } from "../data/templates";

const categories = [
    "Fashion", "Health and Fitness", "Influencer and Creator", "Marketing",
    "Music", "Small Business", "Social Media", "Sports", "Telegram", "Whatsapp"
];

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
    return (
        <div className="min-h-screen bg-[#F9F9F9] text-[#1E2330] font-sans">
            <div className="container mx-auto px-4 py-20">

                {/* Hero Section */}
                <div className="text-center mb-24">
                    <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tight text-[#1E2330]">
                        A Tap2 template to<br />suit every brand and<br />creator
                    </h1>
                    <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        Different Link Apps, integrations and visual styles can help you create a Tap2 that looks and feels like you and your brand. Explore our library of custom templates to grow and connect with your audience even more easily!
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-12 items-start">

                    {/* Categories Sidebar/List */}
                    <div className="w-full lg:w-64 flex-shrink-0">
                        <div className="flex flex-row lg:flex-col flex-wrap gap-3 sticky top-8">
                            {categories.map((cat, i) => (
                                <button
                                    key={i}
                                    className="px-6 py-3 rounded-full border border-gray-200 bg-white text-sm font-semibold hover:bg-gray-50 hover:border-gray-300 transition-colors text-left whitespace-nowrap"
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Templates Grid */}
                    <div className="flex-1">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16 justify-items-center">
                            {templates.map((t) => (
                                <TemplateCard key={t.id} template={t} />
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Template;
