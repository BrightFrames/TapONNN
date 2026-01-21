import { useState, useEffect, useRef } from 'react';
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
    Layers
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
    messages: Message[];
    journey: JourneyStep[];
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// --- Mock Data ---
// --- Mock Data Removed ---
const MOCK_LEADS: Lead[] = [];

import { User, Settings } from 'lucide-react'; // Late import for mock usage

const Enquiries = () => {
    const { user } = useAuth();

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
                const token = localStorage.getItem('token');
                if (!token) return;

                const res = await axios.get(`${API_URL}/enquiries`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // Fetch Stats
                const statsRes = await axios.get(`${API_URL}/enquiries/stats`, {
                    headers: { Authorization: `Bearer ${token}` }
                });


                if (res.data && res.data.enquiries) {
                    const mappedLeads: Lead[] = res.data.enquiries.map((e: any) => ({
                        id: e._id,
                        name: e.visitor_name || e.visitor_email.split('@')[0] || "Guest",
                        role: e.visitor_id ? 'user' : 'visitor',
                        source: e.metadata?.source || 'Profile',
                        email: e.visitor_email,
                        phone: e.visitor_phone || "",
                        truecaller: "Verified", // Placeholder
                        isSpam: false,
                        avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${e.visitor_email}`,
                        status: e.status === 'new' ? 'unread' : 'read',
                        crmStatus: e.status === 'new' ? 'New' : 'Contacted',
                        internalNotes: [],
                        labels: [],
                        score: 50,
                        scoreFactors: [],
                        preview: e.message || 'No message content',
                        time: new Date(e.created_at).toLocaleDateString(),
                        location: "Unknown",
                        duration: "0s",
                        device: e.metadata?.device || "Unknown",
                        os: "-",
                        resolution: "-",
                        network: "-",
                        visits: 1,
                        lastSeen: new Date(e.created_at).toLocaleTimeString(),
                        utm: { source: "-", medium: "-", campaign: "-", term: "-" },
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
                    }));
                    setLeads(mappedLeads);
                }

                if (statsRes.data) {
                    setStats({
                        total: statsRes.data.total || 0,
                        new: statsRes.data.new || 0,
                        recent: statsRes.data.recent || 0,
                        avgResponse: '12m' // Placeholder until backend tracks response time
                    });
                }

            } catch (error) {
                console.error("Error fetching enquiries:", error);
                toast.error("Failed to load enquiries");
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

    return (
        <div className="h-screen w-full bg-zinc-100 flex items-center justify-center p-0 sm:p-2 overflow-hidden font-sans">
            {/* Main Window */}
            <div className="w-full h-full sm:h-[95vh] sm:w-[98vw] max-w-[1700px] bg-background rounded-none sm:rounded-xl shadow-2xl border border-border flex overflow-hidden relative">

                {/* --- LEFT PANEL: LEADS LIST --- */}
                <div className="w-full sm:w-[350px] md:w-[380px] flex flex-col border-r border-border bg-white z-20 shrink-0">

                    {/* Header */}
                    <div className="h-16 px-4 border-b border-border flex items-center justify-between shrink-0 bg-white/50 backdrop-blur">
                        <div className="flex items-center gap-3">
                            <Avatar className="w-9 h-9 border">
                                <AvatarImage src={user?.photo_url} />
                                <AvatarFallback>{user?.username?.[0] || 'SU'}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <span className="font-medium text-sm text-foreground">{user?.username || 'Super User'}</span>
                                <span className="text-[10px] text-green-600 font-bold tracking-wide flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse"></span> ONLINE
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="icon" onClick={() => setIsBulkMode(!isBulkMode)} title="Bulk Actions">
                                <CheckCircle className={`w-4 h-4 ${isBulkMode ? 'text-primary' : 'text-muted-foreground'}`} />
                            </Button>
                            <Button variant="ghost" size="icon">
                                <MoreVertical className="w-4 h-4 text-muted-foreground" />
                            </Button>
                        </div>
                    </div>

                    {/* Search & Filter */}
                    <div className="p-3 border-b border-border space-y-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 text-muted-foreground w-4 h-4" />
                            <Input
                                placeholder="Search leads..."
                                className="pl-9 h-9 bg-muted/30"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                            <Badge variant="default" className="cursor-pointer">All</Badge>
                            <Badge variant="outline" className="cursor-pointer hover:bg-zinc-100">Hot Leads 🔥</Badge>
                            <Badge variant="outline" className="cursor-pointer hover:bg-zinc-100">Unread</Badge>
                        </div>
                    </div>

                    {/* Leads List */}
                    <ScrollArea className="flex-1 bg-white">
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="flex items-center gap-3 p-4 border-b border-border/40 animate-pulse">
                                    <div className="w-10 h-10 rounded-full bg-zinc-100 shrink-0" />
                                    <div className="flex-1 space-y-2 min-w-0">
                                        <div className="flex justify-between">
                                            <div className="h-3.5 bg-zinc-100 rounded w-24" />
                                            <div className="h-3 bg-zinc-100 rounded w-12" />
                                        </div>
                                        <div className="h-3 bg-zinc-100 rounded w-full" />
                                    </div>
                                </div>
                            ))
                        ) : filteredLeads.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-[60vh] text-center px-6">
                                <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mb-4">
                                    <MessageSquare className="w-7 h-7 text-zinc-300" />
                                </div>
                                <h3 className="text-sm font-semibold text-zinc-900">No messages yet</h3>
                                <p className="text-xs text-muted-foreground mt-2 max-w-[200px] leading-relaxed">
                                    Share your profile link to start receiving enquiries from visitors.
                                </p>
                            </div>
                        ) : (
                            filteredLeads.map(lead => (
                                <div
                                    key={lead.id}
                                    onClick={() => isBulkMode ? toggleSelect(lead.id) : setActiveId(lead.id)}
                                    className={`
                                        group flex items-start gap-3 p-4 cursor-pointer border-b border-border/40 transition-all duration-200
                                        ${activeId === lead.id && !isBulkMode ? 'bg-[#FDFDFD] border-l-2 border-l-primary shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]' : 'hover:bg-zinc-50/80 border-l-2 border-l-transparent'}
                                    `}
                                >
                                    {isBulkMode ? (
                                        <div className="w-10 h-10 flex items-center justify-center shrink-0">
                                            <input
                                                type="checkbox"
                                                checked={selectedLeads.has(lead.id)}
                                                readOnly
                                                className="w-4 h-4 accent-primary rounded cursor-pointer"
                                            />
                                        </div>
                                    ) : (
                                        <div className="relative w-10 h-10 shrink-0 mt-0.5">
                                            <Avatar className="w-full h-full border border-border/50 shadow-sm group-hover:shadow-md transition-shadow">
                                                <AvatarImage src={lead.avatar} />
                                                <AvatarFallback className="bg-primary/5 text-primary text-xs font-medium">{lead.name[0]}</AvatarFallback>
                                            </Avatar>
                                            {lead.role === 'user' && (
                                                <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-[2px] border-2 border-white" title="Registered User">
                                                    <Check className="w-2 h-2 text-white" />
                                                </div>
                                            )}
                                            {lead.status === 'unread' && (
                                                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm animate-in zoom-in"></div>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className={`text-sm truncate ${lead.status === 'unread' ? 'font-semibold text-zinc-900' : 'font-medium text-zinc-700'}`}>
                                                {lead.name}
                                            </span>
                                            <span className="text-[10px] text-zinc-400 tabular-nums shrink-0 ml-2">{lead.time}</span>
                                        </div>
                                        <p className={`text-xs truncate mb-2 ${lead.status === 'unread' ? 'text-zinc-600 font-medium' : 'text-zinc-500'}`}>
                                            {lead.preview}
                                        </p>
                                        <div className="flex gap-1.5 flex-wrap">
                                            <Badge variant="secondary" className="text-[9px] px-1.5 h-4 font-normal bg-zinc-100 text-zinc-600 border-zinc-200">
                                                {lead.source}
                                            </Badge>
                                            {lead.labels.map((lbl, idx) => (
                                                <span key={idx} className={`text-[9px] px-1.5 py-0.5 rounded-full flex items-center gap-1 ${lbl.color === 'yellow' ? 'bg-yellow-50 text-yellow-700 border border-yellow-100' : 'bg-blue-50 text-blue-700 border border-blue-100'}`}>
                                                    {lbl.text}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </ScrollArea>

                    {/* Bulk Action Bar */}
                    {isBulkMode && (
                        <div className="absolute bottom-0 left-0 w-full bg-zinc-900 text-white p-3 flex items-center justify-between z-30 animate-in slide-in-from-bottom-5">
                            <span className="text-xs font-medium">{selectedLeads.size} Selected</span>
                            <div className="flex gap-3">
                                <button onClick={() => bulkAction('export')} className="text-xs hover:text-green-400 flex items-center gap-1"><FileText className="w-3 h-3" /> Export</button>
                                <button onClick={() => bulkAction('label')} className="text-xs hover:text-blue-400 flex items-center gap-1"><Tag className="w-3 h-3" /> Label</button>
                                <button onClick={() => setIsBulkMode(false)} className="text-xs text-zinc-400 hover:text-white"><X className="w-3 h-3" /></button>
                            </div>
                        </div>
                    )}
                </div>

                {/* --- MIDDLE PANEL: ACTIVE CHAT --- */}
                {activeLead ? (
                    <div className="flex flex-col flex-1 h-full w-full relative bg-zinc-50/50">
                        {/* Chat Header */}
                        <div className="h-16 px-4 bg-white/80 border-b border-border flex items-center justify-between shrink-0 backdrop-blur-md">
                            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setIsInfoPanelOpen(!isInfoPanelOpen)}>
                                <Avatar className="w-10 h-10 border border-border">
                                    <AvatarImage src={activeLead.avatar} />
                                    <AvatarFallback>{activeLead.name[0]}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <h2 className="font-semibold text-sm text-zinc-900">{activeLead.name}</h2>
                                        <Badge variant={activeLead.score >= 70 ? 'destructive' : activeLead.score >= 30 ? 'default' : 'secondary'} className="text-[10px] px-1.5 h-5 rounded-sm">
                                            {activeLead.score} Score
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground">{activeLead.role === 'visitor' ? 'Visitor • External' : 'Registered User'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-zinc-400">
                                <Button variant="ghost" size="icon" onClick={() => setIsInfoPanelOpen(!isInfoPanelOpen)}>
                                    <Layout className="w-5 h-5 text-primary" />
                                </Button>
                            </div>
                        </div>

                        {/* Chat Area */}
                        <ScrollArea className="flex-1 p-4 sm:p-8 bg-[#e5e5e5]">
                            {/* Background Pattern */}
                            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

                            <div className="space-y-4 max-w-3xl mx-auto relative z-10">
                                <div className="flex justify-center"><span className="bg-zinc-200/50 text-zinc-500 text-[10px] font-medium px-2 py-1 rounded shadow-sm">TODAY</span></div>

                                {activeLead.messages.map((msg) => (
                                    <div key={msg.id} className={`flex w-full ${msg.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                                        {msg.from === 'sys' ? (
                                            <div className="w-full flex justify-center my-2">
                                                <div className="bg-yellow-50 text-yellow-800 border border-yellow-100 text-[10px] px-3 py-1 rounded-md shadow-sm flex items-center gap-1.5">
                                                    <Zap className="w-3 h-3 text-yellow-600" /> {msg.text}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="max-w-[75%] group relative">
                                                <div className={`px-3 py-2 text-sm shadow-sm ${msg.from === 'me'
                                                    ? 'bg-zinc-900 text-white rounded-[12px_12px_0px_12px]'
                                                    : 'bg-white border border-zinc-100 rounded-[12px_12px_12px_0px]'
                                                    }`}>
                                                    {msg.type === 'product' ? (
                                                        <div className="w-[200px] bg-white text-black rounded-md overflow-hidden border border-zinc-100">
                                                            <div className="h-24 bg-zinc-100 flex items-center justify-center">
                                                                <ShoppingBag className="w-8 h-8 text-zinc-400" />
                                                            </div>
                                                            <div className="p-3">
                                                                <div className="font-bold text-sm">{msg.title}</div>
                                                                <div className="text-green-600 font-bold text-sm mt-1">{msg.price}</div>
                                                                <Button size="sm" className="w-full mt-2 h-7 text-xs">Buy Now</Button>
                                                            </div>
                                                        </div>
                                                    ) : msg.type === 'audio' ? (
                                                        <div className="flex items-center gap-2 min-w-[160px]">
                                                            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center cursor-pointer">
                                                                <Play className="w-3 h-3 fill-current" />
                                                            </div>
                                                            <div className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                                                                <div className="h-full w-1/3 bg-white"></div>
                                                            </div>
                                                            <span className="text-[10px]">0:05</span>
                                                        </div>
                                                    ) : (
                                                        <p>{msg.text}</p>
                                                    )}
                                                </div>
                                                <span className={`text-[10px] text-zinc-400 mt-1 block ${msg.from === 'me' ? 'text-right' : 'text-left'}`}>
                                                    {msg.time}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>

                        {/* Input Area */}
                        <div className="p-4 bg-background border-t border-border shrink-0">
                            {/* Actions / Inputs */}
                            <div className="flex items-center gap-2 max-w-3xl mx-auto">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="text-muted-foreground"><Paperclip className="w-4 h-4" /></Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start">
                                        <DropdownMenuItem onClick={() => setQuoteModalOpen(true)}>
                                            <FileText className="w-4 h-4 mr-2" /> Send Quote/Invoice
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleSendMessage('product', 'MOCK PRODUCT')}>
                                            <ShoppingBag className="w-4 h-4 mr-2" /> Share Product
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="text-yellow-500"><Zap className="w-4 h-4" /></Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start" className="w-56">
                                        <DropdownMenuItem onClick={() => insertTemplate("Price list attached below.")}>
                                            <Tag className="w-4 h-4 mr-2" /> Send Price List
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => insertTemplate("Here is our office location.")}>
                                            <MapPin className="w-4 h-4 mr-2" /> Share Location
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                <div className="flex-1 relative">
                                    <Input
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                        placeholder="Type a message..."
                                        className="pr-10"
                                    />
                                    <Button size="icon" variant="ghost" className="absolute right-0 top-0 h-full text-muted-foreground hover:text-foreground">
                                        <Smile className="w-4 h-4" />
                                    </Button>
                                </div>

                                <Button size="icon" variant="outline" onClick={() => handleSendMessage('audio')}>
                                    <Mic className="w-4 h-4 text-red-500" />
                                </Button>
                                <Button size="icon" onClick={() => handleSendMessage('text')}>
                                    <Send className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                    </div>
                ) : (
                    // EMPTY STATE
                    <div className="flex-1 hidden md:flex flex-col items-center justify-center bg-zinc-50 text-center p-8">
                        <div className="w-20 h-20 bg-zinc-200 rounded-2xl flex items-center justify-center mb-6">
                            <PieChart className="w-8 h-8 text-zinc-400" />
                        </div>
                        <h1 className="text-2xl font-light text-zinc-800">Dashboard Overview</h1>
                        <p className="text-zinc-500 text-sm mt-2 max-w-sm">Select a conversation to view visitor journey, intelligence, and CRM details.</p>

                        <div className="grid grid-cols-3 gap-6 mt-12 w-full max-w-2xl">
                            {[
                                { label: 'Active Leads', val: stats.total, icon: ArrowUp, color: 'text-green-600', sub: `${stats.recent} new this week` },
                                { label: 'Unread', val: stats.new, icon: Zap, color: 'text-red-500', sub: 'Action Required' },
                                { label: 'Avg Response', val: stats.avgResponse, icon: Clock, color: 'text-blue-500', sub: 'Target: < 15m' }
                            ].map((stat, i) => (
                                <div key={i} className="bg-white p-5 rounded-lg border border-border shadow-sm">
                                    <div className="text-xs font-semibold text-muted-foreground uppercase">{stat.label}</div>
                                    <div className="text-3xl font-bold text-foreground mt-2">{stat.val}</div>
                                    <div className={`text-[10px] font-medium mt-1 flex items-center justify-center gap-1 ${stat.color}`}>
                                        <stat.icon className="w-3 h-3" /> {stat.sub}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- RIGHT PANEL: INFO SIDEBAR --- */}
                {activeLead && (
                    <div
                        className={`absolute top-0 right-0 h-full w-[350px] bg-background border-l border-border shadow-xl transform transition-transform duration-300 z-50 flex flex-col
                        ${isInfoPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}
                    >
                        <div className="h-14 px-4 border-b border-border flex items-center justify-between shrink-0 bg-zinc-50/50">
                            <span className="text-sm font-semibold text-foreground">Proprietary Insights</span>
                            <Button variant="ghost" size="icon" onClick={() => setIsInfoPanelOpen(false)}>
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        <div className="flex border-b border-border">
                            <button
                                onClick={() => setActiveTab('info')}
                                className={`flex-1 py-3 text-xs font-medium transition ${activeTab === 'info' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
                            >
                                Visitor Insights
                            </button>
                            <button
                                onClick={() => setActiveTab('crm')}
                                className={`flex-1 py-3 text-xs font-medium transition ${activeTab === 'crm' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
                            >
                                CRM & Actions
                            </button>
                        </div>

                        <ScrollArea className="flex-1 p-6 bg-white">
                            {activeTab === 'info' ? (
                                <div className="space-y-6">
                                    {/* Profile */}
                                    <div className="flex flex-col items-center">
                                        <div className="w-20 h-20 rounded-full border p-1 mb-3 relative">
                                            <Avatar className="w-full h-full">
                                                <AvatarImage src={activeLead.avatar} />
                                                <AvatarFallback>{activeLead.name[0]}</AvatarFallback>
                                            </Avatar>
                                            <span className="absolute bottom-0 right-0 bg-white border text-[10px] px-1.5 rounded-sm font-bold shadow-sm">{activeLead.source.toUpperCase()}</span>
                                        </div>
                                        <h2 className="text-lg font-semibold">{activeLead.name}</h2>

                                        {/* Truecaller / Spam Check */}
                                        {activeLead.truecaller !== "Unknown" && (
                                            <div className={`mt-2 px-2 py-0.5 rounded text-[10px] font-medium border flex items-center gap-1 ${activeLead.isSpam ? 'bg-red-50 text-red-700 border-red-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                                                {activeLead.isSpam ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                                                {activeLead.isSpam ? 'SPAM LIKELY' : `ID: ${activeLead.truecaller}`}
                                            </div>
                                        )}

                                        <div className="mt-4 w-full bg-green-50 border border-green-100 rounded-lg p-3">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-xs font-bold text-green-800 uppercase tracking-wide">Biolink Score</span>
                                                <span className="text-lg font-black text-green-700">{activeLead.score}</span>
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                                {activeLead.scoreFactors.map((f, i) => (
                                                    <span key={i} className="text-[10px] bg-white border border-green-200 text-green-700 px-1.5 py-0.5 rounded-sm flex items-center gap-1">
                                                        <Check className="w-2 h-2" /> {f}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Data Cards */}
                                    <div className="border rounded-lg overflow-hidden">
                                        <div className="bg-muted/30 px-3 py-2 border-b flex justify-between items-center">
                                            <span className="text-[10px] font-bold uppercase text-muted-foreground">Traffic Intelligence</span>
                                            <Globe className="w-3 h-3 text-blue-500" />
                                        </div>
                                        <div className="p-3 space-y-2 text-xs">
                                            <div className="flex justify-between"><span className="text-muted-foreground">Source</span><span className="font-medium">{activeLead.utm.source}</span></div>
                                            <div className="flex justify-between"><span className="text-muted-foreground">Medium</span><span className="font-medium">{activeLead.utm.medium}</span></div>
                                            <div className="flex justify-between"><span className="text-muted-foreground">Campaign</span><span className="font-medium">{activeLead.utm.campaign}</span></div>
                                        </div>
                                    </div>

                                    <div className="border rounded-lg overflow-hidden">
                                        <div className="bg-muted/30 px-3 py-2 border-b flex justify-between items-center">
                                            <span className="text-[10px] font-bold uppercase text-muted-foreground">Device Fingerprint</span>
                                            <Smartphone className="w-3 h-3 text-purple-500" />
                                        </div>
                                        <div className="p-3 space-y-2 text-xs">
                                            <div className="flex justify-between"><span className="text-muted-foreground">Device</span><span className="font-medium">{activeLead.device}</span></div>
                                            <div className="flex justify-between"><span className="text-muted-foreground">OS</span><span className="font-medium">{activeLead.os}</span></div>
                                            <div className="flex justify-between"><span className="text-muted-foreground">IP Location</span><span className="font-medium">{activeLead.location}</span></div>
                                            <div className="flex justify-between pt-2 border-t border-dashed mt-2"><span className="text-muted-foreground">Visit Count</span><span className="font-bold text-blue-600">{activeLead.visits}</span></div>
                                        </div>
                                    </div>

                                    {/* Journey */}
                                    <div>
                                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Journey Analysis</h3>
                                        <div className="space-y-6 ml-2 pl-4 border-l">
                                            {activeLead.journey.map((step, i) => (
                                                <div key={i} className="relative">
                                                    <div className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border border-border bg-white ring-2 ring-white"></div>
                                                    <div className="flex justify-between items-start">
                                                        <p className="text-xs font-medium text-foreground">{step.text}</p>
                                                        <span className="text-[9px] text-muted-foreground font-mono bg-muted px-1 rounded">{step.time}</span>
                                                    </div>
                                                    <p className={`text-[10px] text-muted-foreground flex items-center gap-1 ${step.color || ''}`}>
                                                        <step.icon className="w-3 h-3" /> {step.sub}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* Commerce Actions */}
                                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                                        <h3 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-3">Commerce Actions</h3>
                                        <div className="grid grid-cols-2 gap-2">
                                            <Button variant="outline" className="h-8 text-xs border-blue-200 text-blue-700 bg-white hover:bg-blue-50" onClick={() => toast("UPI Link Copied")}>
                                                <CreditCard className="w-3 h-3 mr-2" /> Copy UPI
                                            </Button>
                                            <Button variant="outline" className="h-8 text-xs border-blue-200 text-blue-700 bg-white hover:bg-blue-50" onClick={() => setQuoteModalOpen(true)}>
                                                <FileText className="w-3 h-3 mr-2" /> Create Quote
                                            </Button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Lead Status</label>
                                        <Select
                                            value={activeLead.crmStatus}
                                            onValueChange={(val) => handleCRMUpdate(activeLead.id, val)}
                                        >
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="New">New Lead</SelectItem>
                                                <SelectItem value="Contacted">Contacted</SelectItem>
                                                <SelectItem value="Negotiating">Negotiating</SelectItem>
                                                <SelectItem value="Closed">Closed</SelectItem>
                                                <SelectItem value="Lost">Lost</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Internal Notes</label>
                                        <Textarea placeholder="Add private team notes here..." className="min-h-[100px]" onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleCRMUpdate(activeLead.id, undefined, e.currentTarget.value);
                                                e.currentTarget.value = '';
                                            }
                                        }} />
                                        <span className="text-[10px] text-muted-foreground mt-1 block">Press Enter to save note</span>
                                    </div>

                                    <div className="pt-4 border-t border-border">
                                        <h4 className="text-xs font-semibold text-muted-foreground mb-3">Note History</h4>
                                        <div className="space-y-3">
                                            {activeLead.internalNotes.length === 0 ? (
                                                <p className="text-xs text-muted-foreground italic">No notes added yet.</p>
                                            ) : (
                                                activeLead.internalNotes.map((n, i) => (
                                                    <div key={i} className="bg-muted/50 p-2 rounded border">
                                                        <p className="text-xs text-zinc-700">{n.text}</p>
                                                        <p className="text-[10px] text-zinc-400 text-right mt-1">{n.date}</p>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </ScrollArea>
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

        </div>
    );
};

export default Enquiries;
