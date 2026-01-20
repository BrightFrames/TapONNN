import { useState, useEffect } from 'react';
import LinktreeLayout from '@/layouts/LinktreeLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    MessageCircle,
    Mail,
    Phone,
    Clock,
    MoreVertical,
    Check,
    Reply,
    Trash2,
    Eye,
    Users,
    TrendingUp,
    Loader2,
    Inbox,
    CheckCircle,
    XCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface Enquiry {
    _id: string;
    visitor_name: string;
    visitor_email: string;
    visitor_phone: string;
    block_title: string;
    block_type: string;
    cta_type: string;
    message: string;
    status: string;
    seller_response: string;
    created_at: string;
}

interface Stats {
    total: number;
    new: number;
    read: number;
    responded: number;
    converted: number;
    closed: number;
    recent: number;
}

const Enquiries = () => {
    const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
    const [responseText, setResponseText] = useState('');
    const [responding, setResponding] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        fetchEnquiries();
        fetchStats();
    }, [activeTab]);

    const getToken = () => localStorage.getItem('auth_token');

    const fetchEnquiries = async () => {
        setLoading(true);
        try {
            const status = activeTab === 'all' ? '' : activeTab;
            const url = status
                ? `${API_URL}/enquiries?status=${status}`
                : `${API_URL}/enquiries`;

            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });

            if (response.ok) {
                const data = await response.json();
                setEnquiries(data.enquiries || []);
            }
        } catch (err) {
            console.error('Error fetching enquiries:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await fetch(`${API_URL}/enquiries/stats`, {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });

            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (err) {
            console.error('Error fetching stats:', err);
        }
    };

    const updateStatus = async (enquiryId: string, status: string, response?: string) => {
        try {
            const res = await fetch(`${API_URL}/enquiries/${enquiryId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify({ status, seller_response: response })
            });

            if (res.ok) {
                toast.success('Status updated');
                fetchEnquiries();
                fetchStats();
            }
        } catch (err) {
            console.error('Error updating status:', err);
            toast.error('Failed to update status');
        }
    };

    const handleRespond = async () => {
        if (!selectedEnquiry || !responseText.trim()) return;

        setResponding(true);
        await updateStatus(selectedEnquiry._id, 'responded', responseText);
        setSelectedEnquiry(null);
        setResponseText('');
        setResponding(false);
    };

    const deleteEnquiry = async (enquiryId: string) => {
        if (!confirm('Delete this enquiry?')) return;

        try {
            const res = await fetch(`${API_URL}/enquiries/${enquiryId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });

            if (res.ok) {
                toast.success('Enquiry deleted');
                fetchEnquiries();
                fetchStats();
            }
        } catch (err) {
            console.error('Error deleting enquiry:', err);
            toast.error('Failed to delete');
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));

        if (hours < 1) return 'Just now';
        if (hours < 24) return `${hours}h ago`;
        if (hours < 48) return 'Yesterday';
        return date.toLocaleDateString();
    };

    const statusColors: Record<string, string> = {
        new: 'bg-blue-100 text-blue-700',
        read: 'bg-gray-100 text-gray-700',
        responded: 'bg-green-100 text-green-700',
        converted: 'bg-purple-100 text-purple-700',
        closed: 'bg-red-100 text-red-700'
    };

    return (
        <LinktreeLayout>
            <div className="flex-1 py-4 sm:py-8 px-4 sm:px-6 md:px-10 overflow-y-auto">
                <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-xl sm:text-2xl font-bold">Enquiries</h1>
                        <p className="text-muted-foreground text-sm">Manage incoming enquiries from your profile</p>
                    </div>

                    {/* Stats Cards */}
                    {stats && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                            <Card>
                                <CardContent className="pt-4 pb-3">
                                    <div className="flex items-center gap-2">
                                        <Inbox className="w-4 h-4 text-blue-500" />
                                        <span className="text-2xl font-bold">{stats.new}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">New</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-4 pb-3">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        <span className="text-2xl font-bold">{stats.responded}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Responded</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-4 pb-3">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4 text-purple-500" />
                                        <span className="text-2xl font-bold">{stats.converted}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Converted</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-4 pb-3">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-amber-500" />
                                        <span className="text-2xl font-bold">{stats.total}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Total</p>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Tabs & List */}
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="mb-4">
                            <TabsTrigger value="all">All</TabsTrigger>
                            <TabsTrigger value="new">New</TabsTrigger>
                            <TabsTrigger value="responded">Responded</TabsTrigger>
                            <TabsTrigger value="converted">Converted</TabsTrigger>
                        </TabsList>

                        <TabsContent value={activeTab} className="mt-0">
                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : enquiries.length === 0 ? (
                                <Card>
                                    <CardContent className="py-12 text-center">
                                        <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                        <h3 className="font-medium mb-1">No enquiries yet</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Enquiries from your profile visitors will appear here
                                        </p>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="space-y-3">
                                    {enquiries.map((enquiry) => (
                                        <Card key={enquiry._id} className="hover:bg-muted/50 transition-colors">
                                            <CardContent className="p-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                                        <span className="text-sm font-bold text-primary">
                                                            {enquiry.visitor_name?.[0]?.toUpperCase() || enquiry.visitor_email[0].toUpperCase()}
                                                        </span>
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className="font-medium text-sm">
                                                                {enquiry.visitor_name || enquiry.visitor_email.split('@')[0]}
                                                            </span>
                                                            <Badge className={`text-[10px] ${statusColors[enquiry.status]}`}>
                                                                {enquiry.status}
                                                            </Badge>
                                                            <span className="text-xs text-muted-foreground">
                                                                {formatDate(enquiry.created_at)}
                                                            </span>
                                                        </div>

                                                        <p className="text-xs text-muted-foreground mt-0.5">
                                                            <Mail className="w-3 h-3 inline mr-1" />
                                                            {enquiry.visitor_email}
                                                            {enquiry.visitor_phone && (
                                                                <>
                                                                    <span className="mx-2">•</span>
                                                                    <Phone className="w-3 h-3 inline mr-1" />
                                                                    {enquiry.visitor_phone}
                                                                </>
                                                            )}
                                                        </p>

                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            Interested in: <span className="font-medium">{enquiry.block_title}</span>
                                                        </p>

                                                        {enquiry.message && (
                                                            <p className="text-sm mt-2 line-clamp-2">{enquiry.message}</p>
                                                        )}
                                                    </div>

                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                <MoreVertical className="w-4 h-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            {enquiry.status === 'new' && (
                                                                <DropdownMenuItem onClick={() => updateStatus(enquiry._id, 'read')}>
                                                                    <Eye className="w-4 h-4 mr-2" />
                                                                    Mark as Read
                                                                </DropdownMenuItem>
                                                            )}
                                                            <DropdownMenuItem onClick={() => setSelectedEnquiry(enquiry)}>
                                                                <Reply className="w-4 h-4 mr-2" />
                                                                Respond
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => updateStatus(enquiry._id, 'converted')}>
                                                                <Check className="w-4 h-4 mr-2" />
                                                                Mark Converted
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => deleteEnquiry(enquiry._id)}
                                                                className="text-red-600"
                                                            >
                                                                <Trash2 className="w-4 h-4 mr-2" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            {/* Response Dialog */}
            <Dialog open={!!selectedEnquiry} onOpenChange={() => setSelectedEnquiry(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Respond to Enquiry</DialogTitle>
                        <DialogDescription>
                            From: {selectedEnquiry?.visitor_name || selectedEnquiry?.visitor_email}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {selectedEnquiry?.message && (
                            <div className="p-3 bg-muted rounded-lg">
                                <p className="text-xs text-muted-foreground mb-1">Their message:</p>
                                <p className="text-sm">{selectedEnquiry.message}</p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <p className="text-sm font-medium">Your response (notes)</p>
                            <Textarea
                                placeholder="Add notes about how you responded..."
                                value={responseText}
                                onChange={(e) => setResponseText(e.target.value)}
                                rows={4}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedEnquiry(null)}>
                            Cancel
                        </Button>
                        <Button onClick={handleRespond} disabled={responding}>
                            {responding && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Mark as Responded
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </LinktreeLayout>
    );
};

export default Enquiries;
