import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";
import { ProfilePreviewCard } from './ProfilePreviewCard';

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
    store_design_config?: DesignConfig;
    store_selected_theme?: string;
}

interface ExploreSectionProps {
    className?: string;
    hideHeader?: boolean;
}

export const ExploreSection = ({ className, hideHeader = false }: ExploreSectionProps) => {
    const { t } = useTranslation();
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [filteredBusinesses, setFilteredBusinesses] = useState<Business[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchBusinesses = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001/api'}/explore/all`);
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
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center py-20 text-red-500">
                {error}
            </div>
        );
    }

    return (
        <div className={`w-full ${className || ''}`}>
            {/* Search Header */}
            {!hideHeader && (
                <div className="mb-8">
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
            )}

            {/* If header is hidden, show just the search bar simpler */}
            {hideHeader && (
                <div className="relative w-full mb-6">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                        type="text"
                        placeholder={t('explore.search') || "Search stores..."}
                        className="pl-10 bg-white/10 backdrop-blur-md border-white/10 text-white placeholder:text-white/50 focus:bg-white/20"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            )}

            {/* Grid Layout - Responsive */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                {filteredBusinesses.map((business, index) => (
                    <a
                        key={index}
                        href={`/${business.store_username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block group"
                    >
                        <ProfilePreviewCard
                            store_name={business.store_name}
                            store_username={business.store_username}
                            store_avatar_url={business.store_avatar_url}
                            design_config={business.design_config}
                            store_design_config={business.store_design_config}
                            store_selected_theme={business.store_selected_theme}
                        />
                    </a>
                ))}
            </div>

            {filteredBusinesses.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400 opacity-60">
                    <Search className="w-10 h-10 mb-3 opacity-20" />
                    <p className="text-sm">No results found.</p>
                </div>
            )}
        </div>
    );
};
