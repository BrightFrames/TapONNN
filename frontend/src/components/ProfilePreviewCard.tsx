import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Store } from "lucide-react";

interface DesignConfig {
    backgroundImage?: string;
    backgroundColor?: string;
    theme?: string;
    bgType?: 'color' | 'gradient' | 'image' | 'video' | 'youtube';
    bgVideoUrl?: string;
    bgYoutubeUrl?: string;
    bgGradient?: string;
}

interface ProfilePreviewCardProps {
    store_name: string;
    store_username: string;
    store_avatar_url: string;
    design_config?: DesignConfig;
    store_design_config?: DesignConfig;
    store_selected_theme?: string;
}

export const ProfilePreviewCard = ({
    store_name,
    store_username,
    store_avatar_url,
    design_config,
    store_design_config,
    store_selected_theme
}: ProfilePreviewCardProps) => {
    // Prioritize store_design_config for stores, fallback to design_config
    const activeDesignConfig = store_design_config || design_config;

    // Determine background style from design_config
    const bgImage = activeDesignConfig?.backgroundImage;
    const bgColor = activeDesignConfig?.backgroundColor || '#1a1a1a';

    const containerStyle: React.CSSProperties = bgImage
        ? {
            backgroundImage: `url(${bgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
        }
        : { backgroundColor: bgColor };

    return (
        <div className="relative aspect-[9/16] w-full overflow-hidden rounded-2xl shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            {/* User's Background */}
            <div
                className="absolute inset-0"
                style={containerStyle}
            >
                {/* Video Background Support */}
                {activeDesignConfig?.bgType === 'video' && activeDesignConfig.bgVideoUrl && (
                    <video
                        src={activeDesignConfig.bgVideoUrl}
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                )}
                {activeDesignConfig?.bgType === 'youtube' && activeDesignConfig.bgYoutubeUrl && (
                    <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
                        {/* Static thumbnail for YouTube in small cards to save resources/performance ?? Or load iframe? 
                            Let's try iframe but might be heavy for a list. 
                            Actually, for cards, a thumbnail is better. 
                            Let's use hqdefault for thumbnail.
                        */}
                        <img
                            src={`https://img.youtube.com/vi/${(() => {
                                const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
                                const match = activeDesignConfig.bgYoutubeUrl?.match(regExp);
                                return (match && match[2].length === 11) ? match[2] : null;
                            })()}/hqdefault.jpg`}
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                    </div>
                )}
            </div>

            {/* Overlay for contrast */}
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

            {/* Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center z-10">
                {/* Avatar */}
                <div className="mb-3 transform transition-transform duration-300 group-hover:scale-105">
                    <Avatar className="w-14 h-14 sm:w-16 sm:h-16 border-2 border-white shadow-md">
                        <AvatarImage src={store_avatar_url} alt={store_name} className="object-cover" />
                        <AvatarFallback className="bg-gray-200 text-gray-500">
                            <Store className="w-6 h-6" />
                        </AvatarFallback>
                    </Avatar>
                </div>

                {/* Username */}
                <h3 className="text-white font-bold text-sm sm:text-base mb-0.5 drop-shadow-md truncate w-full px-1">
                    @{store_username}
                </h3>

                {store_name && (
                    <p className="text-white/90 text-[10px] sm:text-xs font-medium mb-4 drop-shadow-sm truncate w-full px-1">
                        {store_name}
                    </p>
                )}

                {/* "Visit" Button */}
                <div className="absolute bottom-4 w-full px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-full py-1.5 bg-white/20 backdrop-blur-md border border-white/40 text-white text-[10px] font-bold rounded-full hover:bg-white hover:text-black transition-colors">
                        Visit
                    </div>
                </div>
            </div>
        </div>
    );
};
