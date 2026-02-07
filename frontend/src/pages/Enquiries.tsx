import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Search,
    Filter,
    MoreVertical,
    CheckCircle,
    Circle,
    Clock,
    Phone,
    Mail,
    MapPin,
    Tag,
    Share2,
    MessageSquare,
    Users,
    ArrowUp,
    Zap,
    FileText,
    CreditCard,
    Mic,
    Send,
    Paperclip,
    Smile,
    X,
    Layout,
    ArrowLeft,
    PieChart,
    Globe,
    Smartphone,
    Wifi,
    Maximize2,
    MoreHorizontal,
    Trash2,
    Archive,
    Star,
    AlertTriangle,
    Check,
    ChevronRight,
    Play,
    Pause,
    ShoppingBag,
    Layers,
    MousePointer,
    Plus
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

// --- Types ---
interface Message {
    id: number;
    from: 'me' | 'them' | 'sys';
    text?: string;
    time: string;
    type?: 'text' | 'audio' | 'product';
    title?: string;
    price?: string;
    translated?: boolean;
}

interface JourneyStep {
    text: string;
    sub: string;
    icon: any;
    time: string;
    color?: string;
}

interface Lead {
    id: any; // Changed from number to support MongoDB ID
    name: string;
    role: 'visitor' | 'user';
    source: string;
    email: string;
    phone: string;
    truecaller: string;
    isSpam: boolean;
    avatar: string;
    status: 'unread' | 'read' | 'replied';
    crmStatus: string;
    internalNotes: { text: string; date: string }[];
    labels: { text: string; color: string }[];
    score: number;
    scoreFactors: string[];
    preview: string;
    time: string;
    location: string;
    duration: string;
    device: string;
    os: string;
    resolution: string;
    network: string;
    visits: number;
    lastSeen: string;
    utm: { source: string; medium: string; campaign: string; term: string };
    messages: Message[];
    journey: JourneyStep[];
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// --- Utility Functions ---

// Calculate Biolink AI Score (0-100)
const calculateBiolinkScore = (lead: Lead): number => {
    let score = 50; // Base score

    // High-quality source bonus
    const source = lead.source.toLowerCase();
    if (source.includes('indiamart') || source.includes('justdial')) score += 20;
    else if (source.includes('instagram') || source.includes('facebook')) score += 10;
    else if (source.includes('direct') || source.includes('google')) score += 15;

    // Message quality bonus
    if (lead.preview.length > 50) score += 10;
    if (lead.preview.length > 100) score += 5;

    // Registered user bonus
    if (lead.role === 'user') score += 10;

    // Verified phone bonus
    if (lead.phone && lead.phone.length >= 10) score += 5;

    // Clamp between 0-100
    return Math.min(100, Math.max(0, score));
};

// Get score factors for display
const getScoreFactors = (lead: Lead): string[] => {
    const factors: string[] = [];
    const source = lead.source.toLowerCase();

    if (source.includes('indiamart') || source.includes('justdial')) factors.push('High Intent Source');
    if (lead.preview.length > 100) factors.push('Detailed Enquiry');
    if (lead.phone && lead.phone.length >= 10) factors.push('Verified Number');
    if (lead.role === 'user') factors.push('Registered User');

    return factors;
};

// Detect source platform and return badge config
const getSourceBadge = (source: string): { label: string; color: string; emoji?: string } => {
    const s = source.toLowerCase();

    if (s.includes('indiamart')) return { label: 'INDIAMART', color: 'bg-orange-100 text-orange-800 border-orange-200', emoji: '🛒' };
    if (s.includes('justdial')) return { label: 'JUSTDIAL', color: 'bg-red-100 text-red-800 border-red-200', emoji: '📞' };
    if (s.includes('instagram')) return { label: 'INSTAGRAM', color: 'bg-pink-100 text-pink-800 border-pink-200', emoji: '📸' };
    if (s.includes('facebook')) return { label: 'FACEBOOK', color: 'bg-blue-100 text-blue-800 border-blue-200', emoji: '👥' };
    if (s.includes('whatsapp')) return { label: 'WHATSAPP', color: 'bg-green-100 text-green-800 border-green-200', emoji: '💬' };

    return { label: 'PLATFORM', color: 'bg-zinc-800 text-white border-zinc-900' };
};

// Format timestamp intelligently
const formatTimestamp = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    // Less than 5 minutes ago = "Just now"
    if (diffMins < 5) return 'Just now';

    // Less than 1 hour = "Xm ago"
    if (diffMins < 60) return `${diffMins}m ago`;

    // Today = time format
    if (diffHours < 24 && date.getDate() === now.getDate()) {
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    }

    // Yesterday
    if (diffDays === 1) return 'Yesterday';

    // This week = day name
    if (diffDays < 7) {
        return date.toLocaleDateString('en-US', { weekday: 'short' });
    }

    // Older = date
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Calculate percentage change
const calculatePercentageChange = (current: number, previous: number): string => {
    if (previous === 0) return '+100%';
    const change = ((current - previous) / previous) * 100;
    return `${change >= 0 ? '↑' : '↓'} ${Math.abs(Math.round(change))}%`;
};

// --- Mock Data ---
// --- Mock Data Removed ---
// --- Mock Data ---
const DUMMY_LEADS: Lead[] = [
    {
        id: "lead_1",
        name: "Rahul Sharma",
        role: "visitor",
        source: "Instagram",
        email: "rahul.s@example.com",
        phone: "9876543210",
        truecaller: "Rahul S",
        isSpam: false,
        avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=rahul",
        status: "unread",
        crmStatus: "New",
        internalNotes: [],
        labels: [{ text: "High Intent", color: "blue" }],
        score: 85,
        scoreFactors: ["High Quality Source", "Verified Number"],
        preview: "I'm interested in the premium package...",
        time: new Date().toISOString(),
        location: "Mumbai, India",
        duration: "2m 30s",
        device: "iPhone",
        os: "iOS 17",
        resolution: "390x844",
        network: "4G",
        visits: 3,
        lastSeen: "Just now",
        utm: { source: "instagram", medium: "social", campaign: "summer_sale", term: "" },
        messages: [
            { id: 1, from: "them", text: "Hi, I saw your post on Instagram.", time: "10:30 AM", type: "text" },
            { id: 2, from: "them", text: "I'm interested in the premium package. Can you tell me more about the features?", time: "10:31 AM", type: "text" }
        ],
        journey: [
            { text: "Visited Profile", sub: "Direct Link", icon: User, time: "10:28 AM" },
            { text: "Clicked 'Pricing'", sub: "Link Click", icon: MousePointer, time: "10:29 AM" },
            { text: "Sent Message", sub: "Enquiry", icon: MessageSquare, time: "10:30 AM" }
        ]
    },
    {
        id: "lead_2",
        name: "Sarah Jenkins",
        role: "user",
        source: "Google",
        email: "sarah.j@example.com",
        phone: "+15551234567",
        truecaller: "Unknown",
        isSpam: false,
        avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=sarah",
        status: "read",
        crmStatus: "Contacted",
        internalNotes: [{ text: "Sent price list", date: "Yesterday" }],
        labels: [],
        score: 60,
        scoreFactors: ["Registered User"],
        preview: "Do you offer international shipping?",
        time: new Date(Date.now() - 86400000).toISOString(),
        location: "New York, USA",
        duration: "5m 10s",
        device: "Desktop",
        os: "Windows 11",
        resolution: "1920x1080",
        network: "Fiber",
        visits: 1,
        lastSeen: "Yesterday",
        utm: { source: "google", medium: "organic", campaign: "", term: "" },
        messages: [
            { id: 1, from: "them", text: "Hello", time: "Yesterday", type: "text" },
            { id: 2, from: "them", text: "Do you offer international shipping?", time: "Yesterday", type: "text" },
            { id: 3, from: "me", text: "Yes, we ship worldwide! Shipping costs depend on the destination.", time: "Yesterday", type: "text" }
        ],
        journey: [
            { text: "Search: 'Custom Art'", sub: "Google Search", icon: Search, time: "Yesterday" },
            { text: "Viewed Shop", sub: "Page Visit", icon: ShoppingBag, time: "Yesterday" }
        ]
    },
    {
        id: "lead_3",
        name: "David Lee",
        role: "visitor",
        source: "Direct",
        email: "david.lee@test.com",
        phone: "",
        truecaller: "",
        isSpam: false,
        avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=david",
        status: "read",
        crmStatus: "Closed",
        internalNotes: [],
        labels: [{ text: "VIP", color: "yellow" }],
        score: 95,
        scoreFactors: ["Repeat Visitor", "High Engagement"],
        preview: "Thanks for the quick delivery!",
        time: new Date(Date.now() - 172800000).toISOString(),
        location: "London, UK",
        duration: "1m",
        device: "Android",
        os: "Android 14",
        resolution: "1080x2400",
        network: "5G",
        visits: 12,
        lastSeen: "2 days ago",
        utm: { source: "direct", medium: "", campaign: "", term: "" },
        messages: [
            { id: 1, from: "them", text: "Order received.", time: "2 days ago", type: "text" },
            { id: 2, from: "them", text: "Thanks for the quick delivery! The quality is amazing.", time: "2 days ago", type: "text" },
            { id: 3, from: "me", text: "You're welcome, David! Glad you liked it.", time: "2 days ago", type: "text" }
        ],
        journey: []
    }
];

import { User, Settings } from 'lucide-react'; // Late import for mock usage

const Enquiries = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // State
    const [leads, setLeads] = useState<Lead[]>([]);
    const [stats, setStats] = useState({ total: 0, new: 0, recent: 0, avgResponse: '-' }); // Add Stats State
    const [isLoading, setIsLoading] = useState(true);

    // Fetch Enquiries
    useEffect(() => {
        const fetchEnquiries = async () => {
            if (!user) return;
            try {
                setIsLoading(true);
                const token = localStorage.getItem('auth_token');
                if (!token) return;

                const res = await axios.get(`${API_URL}/enquiries`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // Fetch Stats
                const statsRes = await axios.get(`${API_URL}/enquiries/stats`, {
                    headers: { Authorization: `Bearer ${token}` }
                });


                if (res.data && res.data.enquiries) {
                    let mappedLeads: Lead[] = [];

                    if (res.data && res.data.enquiries) {
                        mappedLeads = res.data.enquiries.map((e: any) => {
                            const lead = {
                                id: e._id,
                                name: e.visitor_name || e.visitor_email.split('@')[0] || "Guest",
                                role: e.visitor_id ? 'user' : 'visitor',
                                source: e.metadata?.source || 'Profile',
                                email: e.visitor_email,
                                phone: e.visitor_phone || "",
                                truecaller: e.visitor_phone ? "Verified" : "Unknown",
                                isSpam: false,
                                avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${e.visitor_email}`,
                                status: e.status === 'new' ? 'unread' : 'read',
                                crmStatus: e.status === 'new' ? 'New' : 'Contacted',
                                internalNotes: [],
                                labels: [],
                                score: 50,
                                scoreFactors: [] as string[],
                                preview: e.message || 'No message content',
                                time: e.created_at,
                                location: "Unknown",
                                duration: "0s",
                                device: e.metadata?.device || "Unknown",
                                os: "-",
                                resolution: "-",
                                network: "-",
                                visits: 1,
                                lastSeen: new Date(e.created_at).toLocaleTimeString(),
                                utm: { source: e.metadata?.source || "-", medium: "-", campaign: "-", term: "-" },
                                messages: [
                                    {
                                        id: Date.parse(e.created_at),
                                        from: 'them',
                                        text: e.message || '(No message part)',
                                        time: new Date(e.created_at).toLocaleTimeString()
                                    },
                                    ...(e.seller_response ? [{
                                        id: Date.parse(e.responded_at || new Date().toISOString()),
                                        from: 'me',
                                        text: e.seller_response,
                                        time: new Date(e.responded_at || new Date()).toLocaleTimeString()
                                    }] : [])
                                ],
                                journey: []
                            };

                            // Calculate dynamic score and factors
                            lead.score = calculateBiolinkScore(lead);
                            lead.scoreFactors = getScoreFactors(lead);

                            return lead;
                        });
                        setLeads(mappedLeads);
                    }

                    // Dynamically count hot prospects
                    const hotProspects = mappedLeads.filter(l => l.score >= 70).length;

                    setStats({
                        total: statsRes.data.total || 0,
                        new: hotProspects, // Display hot prospects instead of just new
                        recent: statsRes.data.recent || 0,
                        avgResponse: '12m' // Placeholder until backend tracks response time
                    });
                }

                if (mappedLeads.length === 0) {
                    setLeads(DUMMY_LEADS);
                }

            } catch (error) {
                console.error("Error fetching enquiries:", error);
                // Fallback to dummy data
                setLeads(DUMMY_LEADS);
                // toast.error("Failed to load enquiries");
            } finally {
                setIsLoading(false);
            }
        };

        fetchEnquiries();
    }, [user]);
    const [activeId, setActiveId] = useState<any | null>(null);
    const [isInfoPanelOpen, setIsInfoPanelOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [chatInput, setChatInput] = useState('');
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [selectedLeads, setSelectedLeads] = useState<Set<any>>(new Set());
    const [activeTab, setActiveTab] = useState<'info' | 'crm'>('info');
    const [quoteModalOpen, setQuoteModalOpen] = useState(false);
    const [quoteData, setQuoteData] = useState({ item: '', amount: '' });

    // Computed
    const activeLead = leads.find(l => l.id === activeId);
    const filteredLeads = leads.filter(l => l.name.toLowerCase().includes(searchTerm.toLowerCase()));

    // Effects
    useEffect(() => {
        // Auto-open panel on desktop when chat selected
        if (activeId && window.innerWidth >= 1024) {
            setIsInfoPanelOpen(true);
        }
    }, [activeId]);

    // Handlers
    const handleSendMessage = (type: 'text' | 'audio' = 'text', content?: string) => {
        if (!activeLead) return;
        const text = content || chatInput;
        if (!text.trim() && type === 'text') return;

        const newMessage: Message = {
            id: Date.now(),
            from: 'me',
            text: type === 'text' ? text : undefined,
            type: type,
            time: 'Just now'
        };

        const updatedLeads = leads.map(l => {
            if (l.id === activeId) {
                return { ...l, messages: [...l.messages, newMessage] };
            }
            return l;
        });

        setLeads(updatedLeads);
        setChatInput('');
    };

    const handleCRMUpdate = (leadId: any, status?: string, note?: string) => {
        const updatedLeads = leads.map(l => {
            if (l.id === leadId) {
                return {
                    ...l,
                    crmStatus: status || l.crmStatus,
                    internalNotes: note ? [{ text: note, date: 'Just now' }, ...l.internalNotes] : l.internalNotes
                };
            }
            return l;
        });
        setLeads(updatedLeads);
        toast.success("CRM Updated Successfully");
    };

    const toggleSelect = (id: any) => {
        const newSelected = new Set(selectedLeads);
        if (newSelected.has(id)) newSelected.delete(id);
        else newSelected.add(id);
        setSelectedLeads(newSelected);
    };

    const bulkAction = (action: string) => {
        toast.success(`Performed ${action} on ${selectedLeads.size} items`);
        setIsBulkMode(false);
        setSelectedLeads(new Set());
    };

    const insertTemplate = (text: string) => setChatInput(text);

    // Determine mode
    const isPersonalMode = user?.active_profile_mode === 'personal';

    return (
        <div className="h-screen w-full bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-zinc-950 dark:via-black dark:to-zinc-950 flex items-center justify-center p-0 sm:p-3 overflow-hidden font-sans">
            {/* Main Window */}
            <div className="w-full h-full sm:h-[96vh] sm:w-[98vw] max-w-[1800px] bg-white dark:bg-zinc-900 rounded-none sm:rounded-2xl shadow-[0_20px_60px_-12px_rgba(0,0,0,0.25)] dark:shadow-[0_20px_60px_-12px_rgba(0,0,0,0.5)] border border-gray-200/60 dark:border-zinc-800/60 flex overflow-hidden relative">

                {/* --- LEFT PANEL: LEADS LIST --- */}
                <div className="w-full sm:w-[400px] flex flex-col border-r border-gray-200/60 dark:border-zinc-800/60 bg-gradient-to-b from-white/98 to-gray-50/95 dark:from-zinc-900/98 dark:to-zinc-950/95 backdrop-blur-xl z-20 shrink-0">

                    {/* Header */}
                    <div className="h-16 px-6 border-b border-gray-200/60 dark:border-zinc-800/60 flex items-center justify-between shrink-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="-ml-2 mr-1 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                                onClick={() => navigate('/dashboard')}
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                            <div className="relative group">
                                <Avatar className="w-10 h-10 border-2 border-gray-200 dark:border-zinc-700 shadow-lg group-hover:shadow-xl transition-all duration-300">
                                    <AvatarImage src={user?.avatar || user?.photo_url} />
                                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold">{user?.username?.[0] || 'ME'}</AvatarFallback>
                                </Avatar>
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-zinc-900 rounded-full shadow-sm"></span>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-sm text-gray-900 dark:text-zinc-50">{isPersonalMode ? 'Messages' : 'Inbox'}</span>
                                <span className="text-[10px] text-gray-500 dark:text-zinc-500 font-semibold uppercase tracking-wider">
                                    {isPersonalMode ? 'Personal' : 'All Enquiries'}
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-1">
                            {!isPersonalMode && (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setIsBulkMode(!isBulkMode)}
                                                className={`h-8 w-8 ${isBulkMode ? 'bg-blue-500/10 text-blue-500' : 'text-zinc-400 hover:text-zinc-100'}`}
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Bulk Actions</TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-100">
                                <Search className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Search & Tabs */}
                    <div className="p-4 border-b border-gray-200/60 dark:border-zinc-800/60 space-y-3 bg-gradient-to-b from-white to-gray-50/80 dark:from-zinc-900/50 dark:to-zinc-950/50">
                        <div className="relative group">
                            <Search className="absolute left-3.5 top-3 text-gray-400 dark:text-zinc-500 w-4 h-4 group-focus-within:text-blue-500 dark:group-focus-within:text-emerald-400 transition-colors" />
                            <Input
                                placeholder={isPersonalMode ? "Search conversations..." : "Search leads, email, phone..."}
                                className="pl-10 h-11 bg-white dark:bg-zinc-950 border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-zinc-200 placeholder:text-gray-400 dark:placeholder:text-zinc-600 focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-emerald-500 focus-visible:border-transparent transition-all rounded-xl shadow-sm font-medium"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {!isPersonalMode && (
                            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                                <Badge
                                    variant="outline"
                                    className="cursor-pointer bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 border-0 px-4 py-1.5 h-8 shadow-lg shadow-blue-500/20 font-semibold"
                                >
                                    All
                                </Badge>
                                <Badge
                                    variant="outline"
                                    className="cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200 border-gray-300 dark:border-zinc-700 px-4 py-1.5 h-8 font-semibold transition-all"
                                >
                                    Unread
                                </Badge>
                                <Badge
                                    variant="outline"
                                    className="cursor-pointer hover:bg-orange-50 dark:hover:bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-500/20 px-4 py-1.5 h-8 flex gap-1.5 font-semibold transition-all"
                                >
                                    <Zap className="w-3.5 h-3.5" /> Hot
                                </Badge>
                            </div>
                        )}
                    </div>

                    {/* Leads List */}
                    <ScrollArea className="flex-1 bg-gray-50/30 dark:bg-zinc-900/30">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center h-40 space-y-3">
                                <div className="w-6 h-6 border-2 border-zinc-600 border-t-transparent rounded-full animate-spin"></div>
                                <div className="text-xs text-zinc-500">Syncing conversations...</div>
                            </div>
                        ) : filteredLeads.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-[50vh] text-center px-8">
                                <div className="w-16 h-16 bg-zinc-800/50 rounded-2xl flex items-center justify-center mb-4 ring-1 ring-zinc-700/50">
                                    <MessageSquare className="w-8 h-8 text-zinc-500" />
                                </div>
                                <h3 className="text-sm font-medium text-zinc-200">No messages found</h3>
                                <p className="text-xs text-zinc-500 mt-2 leading-relaxed max-w-[220px]">
                                    {searchTerm ? "Try adjusting your search terms." : "Share your link to start receiving enquiries."}
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col">
                                {filteredLeads.map(lead => (
                                    <div
                                        key={lead.id}
                                        onClick={() => isBulkMode ? toggleSelect(lead.id) : setActiveId(lead.id)}
                                        className={`
                                            group flex items-start gap-4 p-4 cursor-pointer border-b border-gray-100/60 dark:border-zinc-800/40 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-transparent dark:hover:from-zinc-800/40 dark:hover:to-transparent transition-all duration-200 relative
                                            ${activeId === lead.id && !isBulkMode ? 'bg-gradient-to-r from-blue-50 to-transparent dark:from-zinc-800/60 dark:to-transparent border-l-[3px] border-l-blue-500 dark:border-l-emerald-400 shadow-sm' : 'border-l-[3px] border-l-transparent'}
                                        `}
                                    >
                                        {isBulkMode && (
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                                                <Checkbox
                                                    checked={selectedLeads.has(lead.id)}
                                                    onCheckedChange={() => toggleSelect(lead.id)}
                                                    className="w-5 h-5 rounded-md border-zinc-600 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                                                />
                                            </div>
                                        )}

                                        <div className={`relative shrink-0 ${isBulkMode ? 'opacity-0' : 'opacity-100'} transition-opacity`}>
                                            <Avatar className="w-12 h-12 border-2 border-gray-200 dark:border-zinc-700 shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-200">
                                                <AvatarImage src={lead.avatar} />
                                                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-600 text-white text-sm font-bold">{lead.name[0]}</AvatarFallback>
                                            </Avatar>
                                            {lead.status === 'unread' && (
                                                <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 ring-2 ring-white dark:ring-zinc-900"></span>
                                                </span>
                                            )}
                                            {!isPersonalMode && getSourceBadge(lead.source).emoji && (
                                                <div className="absolute -bottom-1 -right-1 bg-zinc-900 rounded-full p-0.5 border border-zinc-700 text-[10px]" title={lead.source}>
                                                    {getSourceBadge(lead.source).emoji}
                                                </div>
                                            )}
                                        </div>

                                        <div className={`flex-1 min-w-0 flex flex-col gap-1 ${isBulkMode ? 'pl-8' : ''} transition-all`}>
                                            <div className="flex justify-between items-start gap-2">
                                                <span className={`text-sm truncate ${lead.status === 'unread' ? 'font-bold text-gray-900 dark:text-white' : 'font-semibold text-gray-700 dark:text-zinc-300 group-hover:text-gray-900 dark:group-hover:text-zinc-100'}`}>
                                                    {lead.name}
                                                </span>
                                                <span className={`text-[10px] whitespace-nowrap font-semibold ${lead.status === 'unread' ? 'text-emerald-500' : 'text-gray-400 dark:text-zinc-500'}`}>
                                                    {formatTimestamp(lead.time)}
                                                </span>
                                            </div>

                                            <p className={`text-xs truncate leading-relaxed ${lead.status === 'unread' ? 'text-gray-700 dark:text-zinc-300 font-medium' : 'text-gray-500 dark:text-zinc-500 group-hover:text-gray-600 dark:group-hover:text-zinc-400'}`}>
                                                {lead.from === 'me' && <span className="text-blue-600 dark:text-blue-400 mr-1 font-semibold">You:</span>}
                                                {lead.preview}
                                            </p>

                                            {/* Labels / Badges */}
                                            {!isPersonalMode && (
                                                <div className="flex gap-1.5 items-center flex-wrap mt-1.5">
                                                    {lead.score >= 70 && (
                                                        <Badge variant="secondary" className="text-[9px] px-2 h-5 bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 pointer-events-none font-bold shadow-sm">
                                                            🔥 High Intent
                                                        </Badge>
                                                    )}
                                                    {lead.labels.map((lbl, idx) => (
                                                        <span key={idx} className={`text-[9px] px-1.5 py-0.5 rounded-[3px] border ${lbl.color === 'yellow' ? 'border-yellow-500/20 text-yellow-500 bg-yellow-500/5' : 'border-blue-500/20 text-blue-500 bg-blue-500/5'}`}>
                                                            {lbl.text}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>

                    {/* Bulk Action Bar - Overlay */}
                    <div className={`absolute bottom-4 left-4 right-4 bg-zinc-800 border border-zinc-700 text-white p-3 rounded-lg shadow-2xl flex items-center justify-between z-30 transition-all duration-300 ${isBulkMode && selectedLeads.size > 0 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
                        <span className="text-xs font-medium text-zinc-300">{selectedLeads.size} selected</span>
                        <div className="flex gap-2">
                            <Button size="sm" variant="ghost" onClick={() => bulkAction('export')} className="h-7 text-[10px] hover:bg-zinc-700 px-2 text-zinc-300">
                                <FileText className="w-3 h-3 mr-1.5" /> Export
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => bulkAction('label')} className="h-7 text-[10px] hover:bg-zinc-700 px-2 text-zinc-300">
                                <Tag className="w-3 h-3 mr-1.5" /> Label
                            </Button>
                            <div className="w-px h-4 bg-zinc-700 mx-1 self-center"></div>
                            <Button size="sm" variant="ghost" onClick={() => { setIsBulkMode(false); setSelectedLeads(new Set()); }} className="h-7 w-7 p-0 text-zinc-400 hover:text-white">
                                <X className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* --- MIDDLE PANEL: ACTIVE CHAT --- */}
                {activeLead ? (
                    <div className="flex flex-col flex-1 h-full w-full relative bg-gradient-to-b from-gray-50/30 via-white to-gray-50/30 dark:from-zinc-950/30 dark:via-black dark:to-zinc-950/30 backdrop-blur-sm">
                        {/* Chat Header */}
                        <div className="h-16 px-6 border-b border-gray-200/60 dark:border-zinc-800/60 flex items-center justify-between shrink-0 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl z-20 shadow-sm">
                            <div className="flex items-center gap-3">
                                <Avatar className="w-11 h-11 border-2 border-gray-200 dark:border-zinc-700 shadow-md">
                                    <AvatarImage src={activeLead.avatar} />
                                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-600 text-white font-bold">{activeLead.name[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h2 className="font-bold text-base text-gray-900 dark:text-zinc-50 flex items-center gap-2">
                                        {activeLead.name}
                                        {!isPersonalMode && activeLead.score >= 70 && <Badge variant="destructive" className="h-5 px-2 text-[10px] bg-gradient-to-r from-orange-500 to-red-500 border-0 font-bold shadow-lg">🔥 HOT</Badge>}
                                    </h2>
                                    <p className="text-xs text-gray-600 dark:text-zinc-400 flex items-center gap-1.5 font-medium">
                                        {activeLead.role === 'user' && <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />}
                                        {activeLead.email}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white" onClick={() => setIsInfoPanelOpen(!isInfoPanelOpen)}>
                                    <Layout className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>

                        {/* Chat Area */}
                        <ScrollArea className="flex-1 p-6 bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-[#0A0A0A] dark:via-black dark:to-[#0A0A0A]">
                            {/* Background Pattern */}
                            <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle, #888 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>

                            <div className="space-y-6 max-w-4xl mx-auto relative z-10 py-6">
                                <div className="flex justify-center mb-8">
                                    <span className="bg-white/90 dark:bg-zinc-900/90 border border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-400 text-[10px] font-semibold px-4 py-1.5 rounded-full backdrop-blur-md shadow-sm">
                                        Today
                                    </span>
                                </div>

                                {activeLead.messages.map((msg) => (
                                    <div key={msg.id} className={`flex w-full ${msg.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`flex max-w-[75%] ${msg.from === 'me' ? 'flex-row-reverse' : 'flex-row'} items-end gap-2.5`}>
                                            {/* Avatar only for 'them' */}
                                            {msg.from === 'them' && (
                                                <Avatar className="w-7 h-7 border-2 border-gray-200 dark:border-zinc-700 mb-1 shadow-sm">
                                                    <AvatarImage src={activeLead.avatar} />
                                                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-600 text-white text-xs font-bold">{activeLead.name[0]}</AvatarFallback>
                                                </Avatar>
                                            )}

                                            <div className={`
                                                relative px-4 py-3 text-sm shadow-md
                                                ${msg.from === 'me'
                                                    ? 'bg-gradient-to-br from-blue-600 to-blue-700 dark:from-zinc-100 dark:to-gray-100 text-white dark:text-black rounded-[20px_20px_4px_20px] font-medium'
                                                    : 'bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 border border-gray-200 dark:border-zinc-700/60 rounded-[20px_20px_20px_4px]'}
                                            `}>
                                                {msg.type === 'product' ? (
                                                    <div className="w-[220px] bg-white text-black rounded-lg overflow-hidden border border-zinc-200">
                                                        <div className="h-28 bg-zinc-50 flex items-center justify-center border-b border-zinc-100">
                                                            <ShoppingBag className="w-10 h-10 text-zinc-300" />
                                                        </div>
                                                        <div className="p-3">
                                                            <div className="font-bold text-sm leading-tight mb-1">{msg.title}</div>
                                                            <div className="text-emerald-600 font-bold text-sm">{msg.price}</div>
                                                            <Button size="sm" className="w-full mt-3 h-8 text-xs font-semibold bg-black hover:bg-zinc-800 text-white">View Product</Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="leading-relaxed">{msg.text}</p>
                                                )}

                                                <span className={`text-[10px] absolute -bottom-5 ${msg.from === 'me' ? 'right-1' : 'left-1'} text-zinc-500 font-medium whitespace-nowrap`}>
                                                    {msg.time}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>

                        {/* Input Area */}
                        <div className="p-5 bg-white dark:bg-zinc-900 border-t border-gray-200/60 dark:border-zinc-800/60 shrink-0 shadow-lg">
                            <div className="max-w-4xl mx-auto flex items-end gap-2 bg-gradient-to-r from-gray-50 to-white dark:from-zinc-950 dark:to-zinc-900 p-3 rounded-2xl border-2 border-gray-200 dark:border-zinc-800 focus-within:border-blue-400 dark:focus-within:border-emerald-500 transition-all shadow-md">
                                <Button size="icon" variant="ghost" className="h-10 w-10 text-zinc-400 hover:text-white rounded-lg">
                                    <Plus className="w-5 h-5" />
                                </Button>
                                <Textarea
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 min-h-[42px] max-h-[120px] bg-transparent border-0 focus-visible:ring-0 resize-none py-2.5 text-gray-900 dark:text-zinc-200 placeholder:text-gray-400 dark:placeholder:text-zinc-500 font-medium"
                                    rows={1}
                                />
                                <div className="flex items-center gap-1 pb-1">
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-500 hover:text-zinc-300">
                                        <Smile className="w-5 h-5" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        className="h-10 w-10 bg-gradient-to-br from-blue-600 to-blue-700 dark:from-zinc-100 dark:to-white text-white dark:text-black hover:from-blue-700 hover:to-blue-800 dark:hover:from-white dark:hover:to-gray-100 rounded-xl ml-1 shadow-lg shadow-blue-500/30 dark:shadow-white/20 transition-all hover:scale-105 active:scale-95"
                                        onClick={() => handleSendMessage('text')}
                                    >
                                        <Send className="w-4.5 h-4.5" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    // EMPTY STATE
                    isPersonalMode ? (
                        // Personal Mode Empty State
                        <div className="flex-1 hidden md:flex flex-col items-center justify-center bg-gray-50 dark:bg-zinc-900 text-center p-8">
                            <div className="w-16 h-16 bg-white dark:bg-zinc-100 rounded-full flex items-center justify-center mb-6 shadow-sm border border-gray-100 dark:border-transparent">
                                <MessageSquare className="w-8 h-8 text-gray-400 dark:text-zinc-400" />
                            </div>
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Your Conversations</h2>
                            <p className="text-gray-500 dark:text-zinc-400 mt-2 max-w-sm">Select a chat from the sidebar to view messages.</p>
                        </div>
                    ) : (
                        // Store Mode Empty State - DASHBOARD OVERVIEW
                        <div className="flex-1 hidden md:flex flex-col items-center justify-center bg-gray-50 dark:bg-zinc-900 text-center p-8">
                            <div className="w-20 h-20 bg-white dark:bg-zinc-100 rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-gray-100 dark:border-transparent">
                                <PieChart className="w-10 h-10 text-gray-400 dark:text-zinc-400" />
                            </div>
                            <h1 className="text-2xl font-normal text-gray-900 dark:text-white">Dashboard Overview</h1>
                            <p className="text-gray-500 dark:text-zinc-400 text-sm mt-1 max-w-md">Platform Intelligence Summary</p>

                            <div className="grid grid-cols-3 gap-6 mt-12 w-full max-w-4xl px-4">
                                {[
                                    {
                                        label: 'Total Leads',
                                        val: stats.total,
                                        icon: Users,
                                        color: 'text-blue-600',
                                        bg: 'bg-blue-50',
                                        border: 'border-blue-100',
                                        desc: 'Lifetime enquiries'
                                    },
                                    {
                                        label: 'Hot Prospects',
                                        val: stats.new,
                                        icon: Zap,
                                        color: 'text-orange-600',
                                        bg: 'bg-orange-50',
                                        border: 'border-orange-100',
                                        desc: stats.new > 0 ? 'Action required' : 'All caught up'
                                    },
                                    {
                                        label: 'Response Time',
                                        val: stats.avgResponse,
                                        icon: Clock,
                                        color: 'text-green-600',
                                        bg: 'bg-green-50',
                                        border: 'border-green-100',
                                        desc: 'Average specific'
                                    }
                                ].map((stat, i) => (
                                    <div key={i} className={`p-6 rounded-2xl bg-white dark:bg-zinc-800 border ${stat.border} shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group`}>
                                        <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                                            <stat.icon className="w-6 h-6" />
                                        </div>
                                        <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1 tracking-tight">{stat.val}</div>
                                        <div className="font-semibold text-gray-700 dark:text-zinc-200 text-sm">{stat.label}</div>
                                        <div className="text-xs text-gray-500 dark:text-zinc-500 mt-2 font-medium">{stat.desc}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-16 flex flex-col items-center opacity-40">
                                <Smartphone className="w-12 h-12 mb-4 text-gray-400 dark:text-zinc-300 stroke-1" />
                                <p className="text-gray-500 dark:text-zinc-500 text-sm max-w-sm">Select a conversation from the sidebar to view full history, visitor analytics, and smart insights.</p>
                            </div>
                        </div>
                    )
                )}

                {/* --- RIGHT PANEL: INFO SIDEBAR - Store Mode Only --- */}
                {activeLead && !isPersonalMode && (
                    <div
                        className={`absolute top-0 right-0 h-full w-[380px] bg-gradient-to-b from-white via-gray-50/50 to-white dark:from-zinc-900 dark:via-zinc-950/50 dark:to-zinc-900 border-l border-gray-200/60 dark:border-zinc-800/60 shadow-2xl transform transition-transform duration-300 z-50 flex flex-col
                        ${isInfoPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}
                    >
                        <div className="h-16 px-6 border-b border-gray-200/60 dark:border-zinc-800/60 flex items-center justify-between shrink-0 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md shadow-sm">
                            <span className="text-sm font-bold text-gray-900 dark:text-zinc-50 uppercase tracking-wider">Lead Intelligence</span>
                            <Button variant="ghost" size="icon" onClick={() => setIsInfoPanelOpen(false)} className="text-zinc-500 hover:text-white">
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        <Tabs defaultValue="info" value={activeTab} onValueChange={(v) => setActiveTab(v as 'info' | 'crm')} className="flex flex-col h-[calc(100%-4rem)]">
                            <TabsList className="w-full justify-start rounded-none border-b border-gray-200/60 dark:border-zinc-800/60 bg-gradient-to-r from-white to-gray-50/50 dark:from-zinc-900 dark:to-zinc-950/50 p-0 h-11">
                                <TabsTrigger
                                    value="info"
                                    className="flex-1 h-full text-[11px] font-bold rounded-none border-b-[3px] border-transparent data-[state=active]:border-emerald-500 dark:data-[state=active]:border-emerald-400 data-[state=active]:bg-gradient-to-b data-[state=active]:from-emerald-50/50 data-[state=active]:to-transparent dark:data-[state=active]:from-emerald-500/10 dark:data-[state=active]:to-transparent data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 uppercase tracking-wider text-gray-500 dark:text-zinc-500 hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-all"
                                >
                                    Insights
                                </TabsTrigger>
                                <TabsTrigger
                                    value="crm"
                                    className="flex-1 h-full text-[11px] font-bold rounded-none border-b-[3px] border-transparent data-[state=active]:border-emerald-500 dark:data-[state=active]:border-emerald-400 data-[state=active]:bg-gradient-to-b data-[state=active]:from-emerald-50/50 data-[state=active]:to-transparent dark:data-[state=active]:from-emerald-500/10 dark:data-[state=active]:to-transparent data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 uppercase tracking-wider text-gray-500 dark:text-zinc-500 hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-all"
                                >
                                    Actions & CRM
                                </TabsTrigger>
                            </TabsList>

                            <ScrollArea className="flex-1 bg-gradient-to-b from-gray-50/80 via-white to-gray-50/80 dark:from-zinc-950/80 dark:via-black dark:to-zinc-950/80">
                                <div className="p-6">
                                    <TabsContent value="info" className="mt-0 focus-visible:ring-0 space-y-6">

                                        {/* Score Widget */}
                                        <div className="bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-emerald-950/30 dark:via-zinc-900 dark:to-blue-950/30 border-2 border-emerald-200 dark:border-emerald-900/50 rounded-2xl p-6 relative overflow-hidden group shadow-lg hover:shadow-xl transition-all">
                                            <div className="absolute -top-4 -right-4 opacity-[0.07] dark:opacity-[0.15] group-hover:opacity-[0.12] dark:group-hover:opacity-[0.2] transition-opacity">
                                                <Zap className="w-28 h-28 text-emerald-500" />
                                            </div>

                                            <div className="flex justify-between items-start mb-5 relative z-10">
                                                <div>
                                                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-2 block">Lead Score</span>
                                                    <div className="text-5xl font-black bg-gradient-to-br from-emerald-600 to-blue-600 dark:from-emerald-400 dark:to-blue-400 bg-clip-text text-transparent tracking-tight">{activeLead.score}</div>
                                                </div>
                                                <div className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-md ${activeLead.score >= 70 ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white' : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'}`}>
                                                    {activeLead.score >= 70 ? 'High Intent' : 'Moderate'}
                                                </div>
                                            </div>

                                            <div className="space-y-2.5 relative z-10">
                                                {activeLead.scoreFactors?.slice(0, 2).map((f, i) => (
                                                    <div key={i} className="flex items-center gap-2.5 text-xs text-gray-700 dark:text-zinc-300 font-semibold">
                                                        <CheckCircle className="w-4 h-4 text-emerald-500 dark:text-emerald-400" /> {f}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Identity Card */}
                                        <div className="bg-white dark:bg-zinc-900 border-2 border-gray-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-md hover:shadow-lg transition-all">
                                            <div className="flex items-center gap-4 border-b border-gray-100 dark:border-zinc-800 pb-4">
                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center text-2xl shadow-sm">
                                                    {getSourceBadge(activeLead.source).emoji || '👤'}
                                                </div>
                                                <div>
                                                    <div className="text-[10px] font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-wider">Source</div>
                                                    <div className="font-bold text-base text-gray-900 dark:text-zinc-100">{activeLead.source}</div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="bg-gradient-to-br from-gray-50 to-white dark:from-zinc-950 dark:to-zinc-900 p-3 rounded-xl border border-gray-200 dark:border-zinc-800/50 shadow-sm hover:shadow-md transition-all">
                                                    <div className="text-[10px] text-gray-500 dark:text-zinc-500 uppercase font-bold tracking-wider mb-1">Device</div>
                                                    <div className="text-xs font-bold text-gray-800 dark:text-zinc-200 truncate" title={activeLead.device}>{activeLead.device}</div>
                                                </div>
                                                <div className="bg-gradient-to-br from-gray-50 to-white dark:from-zinc-950 dark:to-zinc-900 p-3 rounded-xl border border-gray-200 dark:border-zinc-800/50 shadow-sm hover:shadow-md transition-all">
                                                    <div className="text-[10px] text-gray-500 dark:text-zinc-500 uppercase font-bold tracking-wider mb-1">Location</div>
                                                    <div className="text-xs font-bold text-gray-800 dark:text-zinc-200 truncate" title={activeLead.location}>{activeLead.location}</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Journey Timeline */}
                                        <div className="space-y-4">
                                            <h4 className="text-[11px] font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest pl-1">Customer Journey</h4>
                                            <div className="relative pl-4 border-l border-gray-200 dark:border-zinc-800 space-y-6 ml-2">
                                                {activeLead.journey.map((step, i) => (
                                                    <div key={i} className="relative group">
                                                        <div className={`absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border-2 border-gray-50 dark:border-zinc-950 ${i === activeLead.journey.length - 1 ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300 dark:bg-zinc-600'}`}></div>
                                                        <div className="flex flex-col gap-0.5">
                                                            <div className="text-xs font-semibold text-gray-900 dark:text-zinc-200 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">{step.text}</div>
                                                            <div className="text-[10px] text-gray-500 dark:text-zinc-500 flex items-center gap-1.5">
                                                                <Clock className="w-3 h-3" /> {step.time}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                    </TabsContent>

                                    <TabsContent value="crm" className="mt-0 focus-visible:ring-0 space-y-6">

                                        {/* Status Control */}
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Pipeline Status</label>
                                            <Select
                                                value={activeLead.crmStatus}
                                                onValueChange={(val) => handleCRMUpdate(activeLead.id, val)}
                                            >
                                                <SelectTrigger className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-zinc-200 h-9">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-zinc-200">
                                                    <SelectItem value="New">New Lead</SelectItem>
                                                    <SelectItem value="Contacted">Contacted</SelectItem>
                                                    <SelectItem value="Negotiating">Negotiating</SelectItem>
                                                    <SelectItem value="Closed">Closed Won</SelectItem>
                                                    <SelectItem value="Lost">Closed Lost</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Quick Actions */}
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Quick Actions</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <Button variant="outline" className="h-9 text-xs border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white justify-start" onClick={() => setQuoteModalOpen(true)}>
                                                    <FileText className="w-3.5 h-3.5 mr-2 text-emerald-500" /> Quote
                                                </Button>
                                                <Button variant="outline" className="h-9 text-xs border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white justify-start" onClick={() => toast("Contact Saved")}>
                                                    <Users className="w-3.5 h-3.5 mr-2 text-blue-500" /> Save Contact
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Notes Section */}
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest">Internal Notes</label>
                                            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg p-1 focus-within:ring-1 focus-within:ring-zinc-400 dark:focus-within:ring-zinc-700 transition-all">
                                                <Textarea
                                                    placeholder="Add a private note..."
                                                    className="min-h-[80px] bg-transparent border-0 focus-visible:ring-0 text-xs text-gray-900 dark:text-zinc-300 resize-none"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && !e.shiftKey) {
                                                            e.preventDefault();
                                                            handleCRMUpdate(activeLead.id, undefined, e.currentTarget.value);
                                                            e.currentTarget.value = '';
                                                        }
                                                    }}
                                                />
                                                <div className="flex justify-end px-2 pb-2">
                                                    <span className="text-[9px] text-zinc-600">Press Enter to save</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Recent Notes List */}
                                        <div className="space-y-3 pt-2">
                                            {activeLead.internalNotes.length > 0 && activeLead.internalNotes.map((n, i) => (
                                                <div key={i} className="bg-gray-50 dark:bg-zinc-900/50 p-3 rounded-lg border border-gray-200 dark:border-zinc-800/50">
                                                    <p className="text-xs text-gray-700 dark:text-zinc-300 leading-relaxed">{n.text}</p>
                                                    <p className="text-[9px] text-gray-500 dark:text-zinc-600 text-right mt-1.5">{n.date}</p>
                                                </div>
                                            ))}
                                        </div>

                                    </TabsContent>
                                </div>
                            </ScrollArea>
                        </Tabs>
                    </div>
                )}
            </div>

            {/* Helper Modals */}
            <Dialog open={quoteModalOpen} onOpenChange={setQuoteModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Generate Quick Quote</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 py-4">
                        <Input placeholder="Item Name (e.g. Cotton Sheets)" value={quoteData.item} onChange={e => setQuoteData({ ...quoteData, item: e.target.value })} />
                        <Input placeholder="Amount (e.g. 5000)" type="number" value={quoteData.amount} onChange={e => setQuoteData({ ...quoteData, amount: e.target.value })} />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setQuoteModalOpen(false)}>Cancel</Button>
                        <Button onClick={() => {
                            if (quoteData.item && quoteData.amount) insertTemplate(`Invoice for ${quoteData.item}: ₹${quoteData.amount}. Pay here: https://pay.link/123`);
                            setQuoteModalOpen(false);
                            setQuoteData({ item: '', amount: '' });
                        }}>Generate Link</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div >
    );
};

export default Enquiries;
