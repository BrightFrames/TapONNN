import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';

interface Block {
    _id?: string;
    block_type: string;
    title: string;
    content: any;
    cta_type: string;
    cta_label: string;
    cta_requires_login: boolean;
    is_active: boolean;
    thumbnail?: string;
}

interface BlockEditorModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    block: Block | null;
    onSave: (block: Block) => Promise<void>;
}

const ctaOptions = [
    { value: 'none', label: 'No CTA' },
    { value: 'visit', label: 'Visit Link' },
    { value: 'buy_now', label: 'Buy Now' },
    { value: 'enquire', label: 'Enquire' },
    { value: 'contact', label: 'Contact' },
    { value: 'download', label: 'Download' },
    { value: 'book', label: 'Book' },
    { value: 'donate', label: 'Donate' },
    { value: 'custom', label: 'Custom' }
];

const BlockEditorModal = ({ open, onOpenChange, block, onSave }: BlockEditorModalProps) => {
    const [formData, setFormData] = useState<Block>({
        block_type: 'link',
        title: '',
        content: {},
        cta_type: 'none',
        cta_label: '',
        cta_requires_login: false,
        is_active: true
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (block) {
            setFormData({
                ...block,
                content: block.content || {}
            });
        } else {
            setFormData({
                block_type: 'link',
                title: '',
                content: {},
                cta_type: 'visit',
                cta_label: '',
                cta_requires_login: false,
                is_active: true
            });
        }
    }, [block, open]);

    // Auto-switch to favicon if URL provided and no thumbnail
    useEffect(() => {
        if (formData.block_type === 'link' && formData.content.url && !block?.thumbnail) { // block?.thumbnail check prevents overwriting existing custom thumbnail on edit, but if it was empty, we overwrite
            // Actually, if user clears thumbnail manually, we might re-add it. Let's strictly check if it's empty.
            // Better: Only if it's a NEW block or thumbnail is empty.
            try {
                const urlObj = new URL(formData.content.url);
                const faviconUrl = `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=128`;
                // Only set if current thumbnail is empty or equals previous auto-generated one
                setFormData(prev => {
                    if (!prev.thumbnail || prev.thumbnail.includes('google.com/s2/favicons')) {
                        return { ...prev, thumbnail: faviconUrl };
                    }
                    return prev;
                });
            } catch (e) { }
        }
    }, [formData.content.url]);

    // Auto-switch to favicon if URL provided and no thumbnail
    useEffect(() => {
        if (formData.block_type === 'link' && formData.content.url) {
            try {
                const urlObj = new URL(formData.content.url);
                const faviconUrl = `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=128`;
                // Only set if current thumbnail is empty or looks like an auto-generated one
                setFormData(prev => {
                    if (!prev.thumbnail || prev.thumbnail.includes('google.com/s2/favicons')) {
                        return { ...prev, thumbnail: faviconUrl };
                    }
                    return prev;
                });
            } catch (e) { }
        }
    }, [formData.content.url, formData.block_type]);

    const handleSave = async () => {
        if (!formData.title.trim()) return;

        setSaving(true);
        try {
            await onSave(formData);
            onOpenChange(false);
        } catch (err) {
            console.error('Error saving block:', err);
        } finally {
            setSaving(false);
        }
    };

    const updateContent = (key: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            content: { ...prev.content, [key]: value }
        }));
    };



    const renderContentFields = () => {
        switch (formData.block_type) {
            case 'link':
                return (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>URL</Label>
                            <Input
                                type="url"
                                placeholder="https://example.com"
                                value={formData.content.url || ''}
                                onChange={(e) => updateContent('url', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Description (optional)</Label>
                            <Textarea
                                placeholder="Short description..."
                                value={formData.content.description || ''}
                                onChange={(e) => updateContent('description', e.target.value)}
                                rows={2}
                            />
                        </div>
                    </div>
                );

            case 'product':
            case 'service':
                return (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Price</Label>
                            <Input
                                type="number"
                                placeholder="0.00"
                                value={formData.content.price || ''}
                                onChange={(e) => updateContent('price', parseFloat(e.target.value))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                                placeholder="Describe your product/service..."
                                value={formData.content.description || ''}
                                onChange={(e) => updateContent('description', e.target.value)}
                                rows={3}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Image URL (optional)</Label>
                            <Input
                                type="url"
                                placeholder="https://..."
                                value={formData.content.image_url || ''}
                                onChange={(e) => updateContent('image_url', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Product Type</Label>
                            <Select
                                value={formData.content.product_type || 'physical_product'}
                                onValueChange={(v) => updateContent('product_type', v)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="digital_product">Digital Product</SelectItem>
                                    <SelectItem value="physical_product">Physical Product</SelectItem>
                                    <SelectItem value="physical_service">Physical Service</SelectItem>
                                    <SelectItem value="digital_service">Digital Service</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                );

            case 'contact_card':
                return (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Phone</Label>
                            <Input
                                type="tel"
                                placeholder="+91 XXXXX XXXXX"
                                value={formData.content.phone || ''}
                                onChange={(e) => updateContent('phone', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input
                                type="email"
                                placeholder="email@example.com"
                                value={formData.content.email || ''}
                                onChange={(e) => updateContent('email', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Address (optional)</Label>
                            <Textarea
                                placeholder="Your address..."
                                value={formData.content.address || ''}
                                onChange={(e) => updateContent('address', e.target.value)}
                                rows={2}
                            />
                        </div>
                    </div>
                );

            case 'whatsapp':
                return (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>WhatsApp Number</Label>
                            <Input
                                type="tel"
                                placeholder="+91 XXXXX XXXXX"
                                value={formData.content.phone || ''}
                                onChange={(e) => updateContent('phone', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Default Message (optional)</Label>
                            <Textarea
                                placeholder="Hi, I'm interested in..."
                                value={formData.content.message || ''}
                                onChange={(e) => updateContent('message', e.target.value)}
                                rows={2}
                            />
                        </div>
                    </div>
                );

            case 'text':
                return (
                    <div className="space-y-2">
                        <Label>Content</Label>
                        <Textarea
                            placeholder="Enter your text content..."
                            value={formData.content.body || ''}
                            onChange={(e) => updateContent('body', e.target.value)}
                            rows={5}
                        />
                    </div>
                );

            default:
                return (
                    <div className="space-y-2">
                        <Label>URL (optional)</Label>
                        <Input
                            type="url"
                            placeholder="https://..."
                            value={formData.content.url || ''}
                            onChange={(e) => updateContent('url', e.target.value)}
                        />
                    </div>
                );
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>{block?._id ? 'Edit Block' : 'Add Block'}</DialogTitle>
                    <DialogDescription>
                        Configure your {formData.block_type} block
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Title */}
                    <div className="space-y-2">
                        <Label>Title *</Label>
                        <Input
                            placeholder="Block title"
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        />
                    </div>


                    {/* Thumbnail Preview/Input */}
                    <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="shrink-0 w-12 h-12 rounded-lg bg-white border border-slate-200 flex items-center justify-center overflow-hidden relative shadow-sm">
                            {formData.thumbnail ? (
                                <img src={formData.thumbnail} alt="Thumbnail" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-[10px] text-slate-400 font-medium">Icon</span>
                            )}
                        </div>
                        <div className="flex-1 space-y-1">
                            <Label className="text-xs">Thumbnail URL</Label>
                            <Input
                                className="h-8 text-xs bg-white"
                                placeholder="https://..."
                                value={formData.thumbnail || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, thumbnail: e.target.value }))}
                            />
                        </div>
                    </div>

                    {/* Content Fields (dynamic based on block_type) */}
                    {renderContentFields()}


                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={saving || !formData.title.trim()}>
                        {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {block?._id ? 'Save Changes' : 'Add Block'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default BlockEditorModal;
