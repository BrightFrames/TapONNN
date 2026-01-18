import LinktreeLayout from "@/layouts/LinktreeLayout";
import { Button } from "@/components/ui/button";
import { Settings, Bell, User, List, Plus } from "lucide-react";
import { useState } from "react";

const Audience = () => {
    const [activeTab, setActiveTab] = useState("contacts");

    return (
        <LinktreeLayout>
            <div className="p-6 max-w-5xl mx-auto font-sans">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-6">
                        <h1 className="text-2xl font-bold text-gray-900">Audience</h1>
                        <div className="flex bg-gray-100/50 p-1 rounded-full">
                            <button
                                onClick={() => setActiveTab("contacts")}
                                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${activeTab === "contacts"
                                    ? "bg-gray-200 text-gray-900"
                                    : "text-gray-500 hover:text-gray-900"
                                    }`}
                            >
                                Contacts
                            </button>
                            <button
                                onClick={() => setActiveTab("integrations")}
                                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${activeTab === "integrations"
                                    ? "bg-gray-200 text-gray-900"
                                    : "text-gray-500 hover:text-gray-900"
                                    }`}
                            >
                                Integrations
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" className="rounded-full bg-white border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold h-10 px-4">
                            <Plus className="w-4 h-4 mr-2" />
                            Add growth tools
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-full w-10 h-10 hover:bg-gray-100 text-gray-500">
                            <Settings className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                {/* Content Card */}
                <div className="bg-white rounded-[2rem] p-12 min-h-[600px] flex flex-col items-center justify-center text-center shadow-sm border border-gray-100">
                    {/* Illustration Construction */}
                    <div className="relative mb-8">
                        {/* Background Card */}
                        <div className="w-48 h-32 bg-gray-50 rounded-xl border border-gray-100 shadow-sm flex flex-col p-4 gap-3">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                                    <User className="w-4 h-4 text-red-500" />
                                </div>
                                <div className="h-2 w-20 bg-gray-200 rounded-full" />
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center">
                                    <User className="w-4 h-4 text-pink-500" />
                                </div>
                                <div className="h-2 w-20 bg-gray-200 rounded-full" />
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                    <User className="w-4 h-4 text-green-500" />
                                </div>
                                <div className="h-2 w-20 bg-gray-200 rounded-full" />
                            </div>
                        </div>
                        {/* Notification Bubble */}
                        <div className="absolute -top-3 -right-3 w-10 h-10 bg-[#d2e823] rounded-full border-4 border-white flex items-center justify-center shadow-sm z-10">
                            <Bell className="w-4 h-4 text-black fill-current" />
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                        Let visitors subscribe to your Tap2 for updates
                    </h2>
                    <p className="text-gray-500 mb-8 font-medium">
                        Let's start growing your contact list.
                    </p>
                    <Button className="bg-[#7535f5] hover:bg-[#6025d5] text-white rounded-full px-8 h-12 text-base font-semibold transition-all">
                        Turn on Subscribe
                    </Button>
                </div>
            </div>
        </LinktreeLayout>
    );
};

export default Audience;
