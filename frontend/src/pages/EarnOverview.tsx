import LinktreeLayout from "@/layouts/LinktreeLayout";
import { Button } from "@/components/ui/button";
import { Settings, BookOpen, Calendar, CloudDownload, ArrowRight, Video, Users, FileText, Sparkles } from "lucide-react";


const EarnOverview = () => {
    return (
        <LinktreeLayout>
            <div className="p-8 max-w-5xl mx-auto font-sans">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Earn</h1>
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <Settings className="w-5 h-5 text-gray-500" />
                    </Button>
                </div>

                {/* Warning Banner */}
                <div className="bg-[#fff9c4] border border-[#fefeeb] rounded-xl p-4 mb-8 flex flex-col gap-1 text-sm text-[#4a4a4a]">
                    <p className="font-semibold">Selling is not enabled in your country</p>
                    <p>
                        Currently you can only offer free digital products at this time.{" "}
                        <a href="#" className="underline decoration-1 underline-offset-2 hover:text-black">Learn more</a>
                    </p>
                </div>

                {/* Free Digital Products Section */}
                <div className="mb-4">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Free digital products</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Courses */}
                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-[#e91e63] flex items-center justify-center text-white">
                                    <BookOpen className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Courses</h3>
                                    <p className="text-xs text-gray-500">Share your expertise with an online course.</p>
                                </div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-gray-600 transition-colors" />
                        </div>

                        {/* Bookings */}
                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-[#7c4dff] flex items-center justify-center text-white">
                                    <Calendar className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Bookings</h3>
                                    <p className="text-xs text-gray-500">Get booked for sessions, calls, or coaching.</p>
                                </div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-gray-600 transition-colors" />
                        </div>

                        {/* Digital Products */}
                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-[#f44336] flex items-center justify-center text-white">
                                    <CloudDownload className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Digital products</h3>
                                    <p className="text-xs text-gray-500">Share downloadable content.</p>
                                </div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-gray-600 transition-colors" />
                        </div>

                        {/* Video Lessons */}
                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-[#2979ff] flex items-center justify-center text-white">
                                    <Video className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Video lessons</h3>
                                    <p className="text-xs text-gray-500">Deliver educational videos to your audience.</p>
                                </div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-gray-600 transition-colors" />
                        </div>

                        {/* Resources */}
                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-[#ff9800] flex items-center justify-center text-white">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Resources</h3>
                                    <p className="text-xs text-gray-500">Provide useful guides, templates, or tools.</p>
                                </div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-gray-600 transition-colors" />
                        </div>

                        {/* Community */}
                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-[#2e7d32] flex items-center justify-center text-white">
                                    <Users className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Community</h3>
                                    <p className="text-xs text-gray-500">Build an engaged group around your content.</p>
                                </div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-gray-600 transition-colors" />
                        </div>
                    </div>
                </div>

                {/* Footer Feedback */}
                <div className="mt-12 flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-6 h-6 rounded-full bg-[#00e676] flex items-center justify-center text-black">
                        <Sparkles className="w-3 h-3 fill-black" />
                    </div>
                    <span>Got ideas? We're listening!</span>
                    <a href="#" className="underline decoration-1 underline-offset-2 hover:text-black">Share feedback</a>
                </div>
            </div>
        </LinktreeLayout>
    );
};

export default EarnOverview;
