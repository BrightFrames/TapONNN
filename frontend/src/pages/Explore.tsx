import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Store, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface DesignConfig {
    backgroundImage?: string;
    backgroundColor?: string;
    theme?: string;
}

interface Business {
    store_name: string;
    store_username: string;
    store_bio: string;
    store_avatar_url: string;
    store_category: string;
    user_id: string;
    design_config?: DesignConfig;
    store_selected_theme?: string;
}

import { useTranslation } from "react-i18next";

const Explore = () => {
    const { t } = useTranslation();
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [filteredBusinesses, setFilteredBusinesses] = useState<Business[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchBusinesses = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/explore/all`);
                setBusinesses(response.data);
                setFilteredBusinesses(response.data);
            } catch (err) {
                console.error('Error fetching businesses:', err);
                setError('Failed to load businesses');
            } finally {
                setLoading(false);
            }
        };

        fetchBusinesses();
    }, []);

    useEffect(() => {
        const lowerQuery = searchQuery.toLowerCase();
        const filtered = businesses.filter(business =>
            business.store_username?.toLowerCase().includes(lowerQuery) ||
            business.store_name?.toLowerCase().includes(lowerQuery)
        );
        setFilteredBusinesses(filtered);
    }, [searchQuery, businesses]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen text-red-500 bg-gray-50">
                {error}
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-gray-50 pt-20 px-4 pb-12">
            {/* Search Header */}
            <div className="container mx-auto max-w-[1600px] mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{t('explore.title')}</h1>
                        <p className="text-gray-500">{t('explore.desc')}</p>
                    </div>
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            type="text"
                            placeholder={t('explore.search')}
                            className="pl-10 bg-white border-gray-200 focus:bg-white"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Grid Layout - Mobile: 2/3 cols, Desktop: 5/6 cols */}
            <div className="container mx-auto max-w-[1600px] grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {filteredBusinesses.map((business, index) => {
                    // Determine background style
                    const bgImage = business.design_config?.backgroundImage;
                    const bgColor = business.design_config?.backgroundColor || '#1a1a1a';

                    const containerStyle = bgImage
                        ? { backgroundImage: `url(${bgImage})` }
                        : { backgroundColor: bgColor };

                    return (
                        <a
                            key={index}
                            href={`/${business.store_username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block group"
                        >
                            {/* Card - 9:16 Aspect Ratio (Mobile Screen) */}
                            <div className="relative aspect-[9/16] w-full overflow-hidden rounded-[20px] shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-gray-200">
                                {/* User's Background */}
                                <div
                                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                                    style={containerStyle}
                                />

                                {/* Overlay for contrast */}
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                                {/* Content */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center z-10">

                                    {/* Avatar */}
                                    <div className="mb-4 transform transition-transform duration-300 group-hover:scale-105">
                                        <Avatar className="w-20 h-20 border-2 border-white shadow-md">
                                            <AvatarImage src={business.store_avatar_url} alt={business.store_name} className="object-cover" />
                                            <AvatarFallback className="bg-gray-200 text-gray-500">
                                                <Store className="w-8 h-8" />
                                            </AvatarFallback>
                                        </Avatar>
                                    </div>

                                    {/* Username */}
                                    <h3 className="text-white font-bold text-lg mb-1 drop-shadow-md truncate w-full p-1 rounded">
                                        @{business.store_username}
                                    </h3>

                                    {business.store_name && (
                                        <p className="text-white/90 text-xs font-medium mb-6 drop-shadow-sm truncate w-full">
                                            {business.store_name}
                                        </p>
                                    )}

                                    {/* "Join/View" Button (always visible but highlighted on hover) */}
                                    <div className="absolute bottom-6 w-full px-4">
                                        <div className="w-full py-2 bg-white/20 backdrop-blur-md border border-white/40 text-white text-xs font-bold rounded-full transition-all duration-300 group-hover:bg-white group-hover:text-black">
                                            {t('explore.viewProfile')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </a>
                    );
                })}
            </div>

            {filteredBusinesses.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <Search className="w-12 h-12 mb-4 opacity-20" />
                    <p>{t('explore.noResults')} "{searchQuery}".</p>
                </div>
            )}
        </div>
    );
};

export default Explore;
