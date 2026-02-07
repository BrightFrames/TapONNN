import React from 'react';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeatureCardProps {
    icon: React.ElementType;
    title: string;
    description: string;
    onClick?: () => void;
    className?: string;
}

const FeatureCard = ({ icon: Icon, title, description, onClick, className }: FeatureCardProps) => {
    return (
        <div 
            onClick={onClick}
            className={cn(
                "group flex items-center justify-between p-4 bg-[#111111] hover:bg-[#1A1A1A] border border-zinc-800 rounded-2xl cursor-pointer transition-all active:scale-[0.98]",
                className
            )}
        >
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 flex items-center justify-center bg-[#1A1A1A] group-hover:bg-[#222222] rounded-xl border border-zinc-800">
                    <Icon className="w-5 h-5 text-zinc-100" />
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-semibold text-zinc-100">{title}</span>
                    <span className="text-xs text-zinc-500 line-clamp-1">{description}</span>
                </div>
            </div>
            <div className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-800 transition-colors">
                <Plus className="w-4 h-4 text-zinc-400 group-hover:text-zinc-100" />
            </div>
        </div>
    );
};

export default FeatureCard;
