import { useState } from 'react';
import { ArrowRight, Sparkles, ShoppingCart, Info, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import TapxLayout from '@/layouts/TapxLayout';

const NFC_PRODUCTS = [
    {
        id: 'metal',
        name: 'TapX Metal',
        tag: 'Most Popular',
        tagColor: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
        price: 'Coming Soon',
        image: '/tapx_nfc_card_black.png',
        description: 'Networking forged in Stainless Steel.',
        features: ['Matte Black Finish', 'Laser Engraved', 'Premium Weight']
    },
    {
        id: 'coin',
        name: 'TapX Coin',
        tag: 'New',
        tagColor: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
        price: 'Coming Soon',
        image: '/tapx_nfc_coin_white.png',
        description: 'Fits Under A Phone Case.',
        features: ['Ultra Thin', 'Strong Adhesive', 'Universal Fit']
    },
    {
        id: 'band',
        name: 'TapX Band',
        tag: 'Trending',
        tagColor: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
        price: 'Coming Soon',
        image: '/tapx_nfc_band_sport.png',
        description: 'Wear. Share. Repeat.',
        features: ['Waterproof', 'Durable Silicone', 'Comfort Fit']
    },
    {
        id: 'bundle',
        name: 'TapX Bundle',
        tag: 'Best Value',
        tagColor: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
        price: 'Coming Soon',
        image: '/tapx_nfc_bundle.png',
        description: 'The complete networking kit.',
        features: ['Metal Card', 'Coin', 'Wristband']
    },
    {
        id: 'custom',
        name: 'TapX Custom',
        tag: 'Exclusive',
        tagColor: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400',
        price: 'Coming Soon',
        image: '/tapx_nfc_custom_card.png',
        description: 'Your design, your brand.',
        features: ['Custom Print', 'Glossy Finish', 'Unique ID']
    }
];

const ProductCard = ({ product }: { product: typeof NFC_PRODUCTS[0] }) => (
    <div className="group relative bg-white dark:bg-[#0A0A0A] rounded-3xl border border-zinc-200 dark:border-[#1A1A1A] p-4 flex flex-col transition-all hover:shadow-xl hover:border-zinc-300 dark:hover:border-zinc-700">
        <div className="absolute top-4 left-4 z-10">
            <Badge variant="secondary" className={`font-semibold ${product.tagColor} border-none`}>
                {product.tag === 'New' && <Sparkles className="w-3 h-3 mr-1" />}
                {product.tag}
            </Badge>
        </div>

        <div className="aspect-square w-full rounded-2xl bg-zinc-50 dark:bg-[#111] mb-6 overflow-hidden relative">
            <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-end">
                <Button size="sm" className="bg-white text-black hover:bg-zinc-200 rounded-full">
                    View Details
                </Button>
            </div>
        </div>

        <div className="flex items-start justify-between mb-2">
            <div>
                <h3 className="font-bold text-2xl tracking-tight text-zinc-900 dark:text-zinc-100 mb-1 font-serif">
                    {product.name}
                </h3>
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-4 h-1 rounded-full bg-gradient-to-r from-blue-400 to-purple-500" />)}
                </div>
            </div>
            <span className="font-bold text-lg text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 px-3 py-1 rounded-full bg-zinc-50 dark:bg-zinc-900">
                {product.price}
            </span>
        </div>

        <h4 className="font-bold text-lg mb-2 text-zinc-800 dark:text-zinc-200">
            {product.description}
        </h4>

        <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6 flex-grow">
            Unlock Maximum Connection Potential with the smartest business card on the market.
        </p>

        <Button className="w-full rounded-full font-bold h-12 bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-colors group-hover:shadow-lg" disabled>
            <ShoppingCart className="w-4 h-4 mr-2" />
            Coming Soon
        </Button>
    </div>
);

const NfcStore = () => {
    return (
        <TapxLayout>
            <div className="max-w-7xl mx-auto p-6 md:p-8">
                <div className="mb-10 text-center">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 dark:text-white">
                        Connect Your World
                    </h1>
                    <p className="text-lg text-zinc-500 max-w-2xl mx-auto">
                        Choose from our premium selection of NFC-enabled devices to instantly share your TapX profile, contact info, and more.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {NFC_PRODUCTS.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </TapxLayout>
    );
};

export default NfcStore;
