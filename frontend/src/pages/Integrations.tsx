import LinktreeLayout from "@/layouts/LinktreeLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, ShoppingCart, Music, Video, Plus } from "lucide-react";

const integrations = [
    {
        id: "amazon",
        name: "Amazon Storefront",
        description: "Display your Amazon products directly on your profile.",
        icon: ShoppingCart,
        connected: false
    },
    {
        id: "shopify",
        name: "Shopify",
        description: "Sync your Shopify products and sell seamlessly.",
        icon: Store,
        connected: false
    },
    {
        id: "spotify",
        name: "Spotify",
        description: "Share your latest tracks and playlists.",
        icon: Music,
        connected: false
    },
    {
        id: "youtube",
        name: "YouTube",
        description: "Embed your videos and grow your subscribers.",
        icon: Video,
        connected: false
    }
];

const Integrations = () => {
    return (
        <LinktreeLayout>
            <div className="flex-1 py-10 px-6 md:px-10 overflow-y-auto w-full max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold mb-2">Integrations</h1>
                        <p className="text-gray-500">Connect your favorite tools and platforms to your Business Profile.</p>
                    </div>
                    <Button>
                        <Plus className="w-4 h-4 mr-2" /> Request Integration
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {integrations.map((item) => (
                        <Card key={item.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                                <div className="p-3 bg-primary/10 rounded-xl">
                                    <item.icon className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">{item.name}</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="text-sm">
                                    {item.description}
                                </CardDescription>
                            </CardContent>
                            <CardFooter>
                                <Button variant="outline" className="w-full">
                                    Connect
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </LinktreeLayout>
    );
};

export default Integrations;
