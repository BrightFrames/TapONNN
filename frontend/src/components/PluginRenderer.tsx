import { Instagram, Twitter, Youtube, Music, Calendar, Phone, CreditCard, Globe, MessageCircle } from "lucide-react";

interface Plugin {
    _id: string;
    plugin_id: {
        _id: string;
        name: string;
        slug: string;
        description: string;
        icon: string;
        category: string;
        type: string;
    };
    is_active: boolean;
    config: Record<string, any>;
}

interface PluginRendererProps {
    plugins: Plugin[];
    cardBgColor?: string;
    cardBgType?: string;
    theme?: any;
}

const getPluginIcon = (iconName: string) => {
    const icons: Record<string, any> = {
        'instagram': Instagram,
        'twitter': Twitter,
        'youtube': Youtube,
        'spotify': Music,
        'calendar': Calendar,
        'phone': Phone,
        'whatsapp': MessageCircle,
        'credit-card': CreditCard,
        'globe': Globe,
    };
    return icons[iconName] || Globe;
};

const PluginRenderer = ({ plugins, cardBgColor = '#ffffff', cardBgType = 'color', theme }: PluginRendererProps) => {
    if (!plugins || plugins.length === 0) return null;

    return (
        <div className="space-y-3">
            {plugins.map((plugin) => {
                const { plugin_id, config } = plugin;
                const Icon = getPluginIcon(plugin_id.icon);

                // Render different plugin types
                switch (plugin_id.slug) {
                    case 'whatsapp':
                        if (config.phone_number) {
                            const whatsappUrl = `https://wa.me/${config.phone_number.replace(/[^0-9]/g, '')}`;
                            return (
                                <a
                                    key={plugin._id}
                                    href={whatsappUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full p-4 rounded-2xl transition-all hover:scale-[1.02] hover:shadow-lg"
                                    style={{
                                        backgroundColor: cardBgType === 'color' ? cardBgColor : undefined,
                                        backgroundImage: cardBgType === 'gradient' ? cardBgColor : undefined,
                                    }}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                                            <Icon className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900 dark:text-white">Chat on WhatsApp</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{config.phone_number}</p>
                                        </div>
                                    </div>
                                </a>
                            );
                        }
                        break;

                    case 'calendly':
                        if (config.scheduling_url) {
                            return (
                                <a
                                    key={plugin._id}
                                    href={config.scheduling_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full p-4 rounded-2xl transition-all hover:scale-[1.02] hover:shadow-lg"
                                    style={{
                                        backgroundColor: cardBgType === 'color' ? cardBgColor : undefined,
                                        backgroundImage: cardBgType === 'gradient' ? cardBgColor : undefined,
                                    }}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                                            <Icon className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900 dark:text-white">Schedule a Meeting</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Book time with me</p>
                                        </div>
                                    </div>
                                </a>
                            );
                        }
                        break;

                    case 'razorpay':
                    case 'stripe':
                        // Payment plugins are integrated into product checkout
                        return null;

                    case 'shopify':
                        if (config.shop_url) {
                            return (
                                <a
                                    key={plugin._id}
                                    href={config.shop_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full p-4 rounded-2xl transition-all hover:scale-[1.02] hover:shadow-lg"
                                    style={{
                                        backgroundColor: cardBgType === 'color' ? cardBgColor : undefined,
                                        backgroundImage: cardBgType === 'gradient' ? cardBgColor : undefined,
                                    }}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center">
                                            <Icon className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900 dark:text-white">Visit My Shop</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Powered by Shopify</p>
                                        </div>
                                    </div>
                                </a>
                            );
                        }
                        break;

                    default:
                        // Generic plugin display
                        return (
                            <div
                                key={plugin._id}
                                className="block w-full p-4 rounded-2xl"
                                style={{
                                    backgroundColor: cardBgType === 'color' ? cardBgColor : undefined,
                                    backgroundImage: cardBgType === 'gradient' ? cardBgColor : undefined,
                                }}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 dark:text-white">{plugin_id.name}</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{plugin_id.description}</p>
                                    </div>
                                </div>
                            </div>
                        );
                }

                return null;
            })}
        </div>
    );
};

export default PluginRenderer;
