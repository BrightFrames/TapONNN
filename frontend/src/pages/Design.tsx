
import React, { useState } from "react";
import LinktreeLayout from "@/layouts/LinktreeLayout";
import { templates, TemplateData, getButtonIcon } from "@/data/templates";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

// Reuse TemplateCard but with selection overlay
const DesignTemplateCard = ({
    template,
    isSelected,
    onSelect
}: {
    template: TemplateData;
    isSelected: boolean;
    onSelect: (id: string) => void;
}) => {
    return (
        <div className="flex flex-col items-center gap-4 group">
            {/* Phone Frame */}
            <div className="relative">
                <div
                    className={`relative w-[280px] h-[580px] rounded-[3rem] overflow-hidden shadow-2xl transition-transform duration-300 border-[6px] border-black/5 ${template.bgClass || ''} ${isSelected ? 'ring-4 ring-offset-4 ring-purple-600 scale-[1.02]' : 'group-hover:-translate-y-2'}`}
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

                    {/* Selection Overlay */}
                    {isSelected && (
                        <div className="absolute inset-0 bg-purple-900/10 flex items-center justify-center z-20 pointer-events-none">
                            <div className="bg-white rounded-full p-2 shadow-lg">
                                <Check className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Selection Controls */}
            <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{template.name}</h3>
                <Button
                    onClick={() => onSelect(template.id)}
                    variant={isSelected ? "secondary" : "default"}
                    className={isSelected ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-purple-600 hover:bg-purple-700"}
                >
                    {isSelected ? "Active Template" : "Use this template"}
                </Button>
            </div>
        </div>
    );
};

const Design = () => {
    const [selectedTemplate, setSelectedTemplate] = useState<string>("artemis");

    return (
        <LinktreeLayout>
            <div className="flex-1 min-h-screen bg-gray-50/50 p-8 overflow-y-auto">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Design</h1>
                        <p className="text-gray-500 mt-2">
                            Choose a template to customize the look and feel of your Tap2 page.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-x-8 gap-y-12 justify-items-center">
                        {templates.map((t) => (
                            <DesignTemplateCard
                                key={t.id}
                                template={t}
                                isSelected={selectedTemplate === t.id}
                                onSelect={setSelectedTemplate}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </LinktreeLayout>
    );
};

export default Design;
