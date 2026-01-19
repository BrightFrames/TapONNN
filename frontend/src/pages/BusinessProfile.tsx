import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Coins, Plug, ExternalLink, Plus, Check } from "lucide-react";
import Shop from "./Shop";
import EarnOverview from "./EarnOverview";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";

const BusinessProfile = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();

    // Default to 'integrations' or read from URL query param ?tab=...
    const currentTab = searchParams.get("tab") || "integrations";

    const handleTabChange = (value: string) => {
        setSearchParams({ tab: value });
    };

    // Mock Integrations Data
    const integrations = [
        {
            id: "amazon",
            name: "Amazon Storefront",
            description: "Showcase your Amazon products directly on your profile.",
            icon: "https://upload.wikimedia.org/wikipedia/commons/4/4a/Amazon_icon.svg", // Placeholder or use Lucide
            connected: false,
            category: "E-commerce"
        },
        {
            id: "shopify",
            name: "Shopify",
            description: "Sync your Shopify inventory and sell seamlessly.",
            icon: "https://cdn.icon-icons.com/icons2/2429/PNG/512/shopify_logo_icon_147264.png",
            connected: false,
            category: "E-commerce"
        },
        {
            id: "instagram",
            name: "Instagram Shopping",
            description: "Tag products from your catalog on Instagram posts.",
            icon: "https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg",
            connected: true,
            category: "Social"
        },
        {
            id: "mailchimp",
            name: "Mailchimp",
            description: "Collect emails and send newsletters automatically.",
            icon: "https://cdn.icon-icons.com/icons2/2699/PNG/512/mailchimp_logo_icon_168863.png",
            connected: false,
            category: "Marketing"
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Business Profile</h1>
                <p className="text-muted-foreground">Manage your shop, earnings, and external integrations.</p>
            </div>

            <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-6">
                <TabsList className="bg-white dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700 h-auto">
                    <TabsTrigger
                        value="integrations"
                        className="rounded-lg px-4 py-2 data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700 data-[state=active]:text-primary"
                    >
                        <Plug className="w-4 h-4 mr-2" />
                        Integrations
                    </TabsTrigger>
                    <TabsTrigger
                        value="shop"
                        className="rounded-lg px-4 py-2 data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700 data-[state=active]:text-primary"
                    >
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        My Shop
                    </TabsTrigger>
                    <TabsTrigger
                        value="earn"
                        className="rounded-lg px-4 py-2 data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700 data-[state=active]:text-primary"
                    >
                        <Coins className="w-4 h-4 mr-2" />
                        Earn
                    </TabsTrigger>
                </TabsList>

                {/* Integrations Tab */}
                <TabsContent value="integrations" className="space-y-6 animate-in fade-in-50 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {integrations.map((app) => (
                            <Card key={app.id} className="overflow-hidden border-gray-200 dark:border-gray-800 hover:shadow-md transition-shadow">
                                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                    <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center p-2 border border-gray-100">
                                        {/* Fallback icon if image fails or placeholder */}
                                        <img src={app.icon} alt={app.name} className="w-full h-full object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement.innerHTML = '🔌'; }} />
                                    </div>
                                    <Badge variant={app.connected ? "default" : "secondary"} className={app.connected ? "bg-green-100 text-green-700 hover:bg-green-100" : ""}>
                                        {app.connected ? "Active" : "Connect"}
                                    </Badge>
                                </CardHeader>
                                <CardContent className="pt-4">
                                    <div className="mb-2">
                                        <CardTitle className="text-lg">{app.name}</CardTitle>
                                        <span className="text-xs text-muted-foreground">{app.category}</span>
                                    </div>
                                    <CardDescription className="text-sm line-clamp-2">
                                        {app.description}
                                    </CardDescription>
                                </CardContent>
                                <CardFooter>
                                    {app.connected ? (
                                        <Button variant="outline" className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700">
                                            Disconnect
                                        </Button>
                                    ) : (
                                        <Button className="w-full bg-black text-white hover:bg-black/90">
                                            <Plus className="w-4 h-4 mr-2" /> Connect
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        ))}

                        {/* More placeholders */}
                        <Card className="flex flex-col items-center justify-center border-dashed border-2 p-6 text-center text-muted-foreground hover:bg-gray-50/50 transition-colors cursor-pointer">
                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                                <Plus className="w-6 h-6" />
                            </div>
                            <h3 className="font-semibold">Request Integration</h3>
                            <p className="text-sm">Don't see what you need?</p>
                        </Card>
                    </div>
                </TabsContent>

                {/* Shop Tab */}
                <TabsContent value="shop" className="animate-in fade-in-50 duration-300">
                    <Shop />
                </TabsContent>

                {/* Earn Tab */}
                <TabsContent value="earn" className="animate-in fade-in-50 duration-300">
                    <EarnOverview />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default BusinessProfile;
