import { useState, useEffect } from "react";
import { toast } from "sonner";
import TapxLayout from "@/layouts/TapxLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import AvatarUpload from "@/components/AvatarUpload";
import SocialLinksManager from "@/components/SocialLinksManager";
import EmailVerification from "@/components/EmailVerification";
import ShareModal from "@/components/ShareModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import {
    User,
    Lock,
    Bell,
    Shield,
    Trash2,
    Save,
    Loader2,
    Mail,
    AtSign,

    ShoppingBag,
    Share2,
    Truck,
    CreditCard,
    Settings as SettingsIcon,
} from "lucide-react";

interface Plugin {
    _id: string;
    plugin_id: {
        _id: string;
        name: string;
        icon: string;
    };
    config: any;
}

const Settings = () => {
    const { user, isAuthenticated, refreshProfile } = useAuth();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Profile form state
    const [fullName, setFullName] = useState(user?.name || "");
    const [username, setUsername] = useState(user?.username || "");
    const [avatarUrl, setAvatarUrl] = useState(user?.avatar || "");

    // Password form state
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Store settings state
    const [hasStore, setHasStore] = useState(false);
    const [storePublished, setStorePublished] = useState(false);
    const [storeShareOpen, setStoreShareOpen] = useState(false);
    const [savingStore, setSavingStore] = useState(false);
    const [installedPlugins, setInstalledPlugins] = useState<Plugin[]>([]);

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

    // Load profile data
    useEffect(() => {
        const loadProfile = async () => {
            const token = localStorage.getItem('auth_token');
            if (!token) return;

            try {
                const response = await fetch(`${API_URL}/auth/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    setFullName(data.full_name || data.name || "");
                    setUsername(data.username || "");
                    setAvatarUrl(data.avatar_url || "");
                    setHasStore(data.has_store || false);
                    setStorePublished(data.store_published || false);
                }

                // Check if user has products (auto-detect store)
                const productsRes = await fetch(`${API_URL}/products`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (productsRes.ok) {
                    const products = await productsRes.json();
                    if (products.length > 0) {
                        setHasStore(true);
                    }
                }
            } catch (err) {
                console.error("Error loading profile:", err);
            }
        };

        const fetchInstalledPlugins = async () => {
            const token = localStorage.getItem('auth_token');
            if (!token) return;
            try {
                const res = await fetch(`${API_URL}/marketplace/my-plugins`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setInstalledPlugins(data);
                }
            } catch (e) {
                console.error("Failed to fetch plugins", e);
            }
        };

        if (isAuthenticated) {
            loadProfile();
            fetchInstalledPlugins();
        }
    }, [isAuthenticated, API_URL]);

    const handleAvatarUpload = (url: string) => {
        setAvatarUrl(url); // This now receives base64 string
    };

    const handleStorePublishToggle = async (checked: boolean) => {
        setSavingStore(true);
        const token = localStorage.getItem('auth_token');

        try {
            const response = await fetch(`${API_URL}/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    has_store: true,
                    store_published: checked
                })
            });

            if (response.ok) {
                setStorePublished(checked);
                toast.success(checked ? "Shop published!" : "Shop unpublished");
            } else {
                toast.error("Failed to update shop settings");
            }
        } catch (err) {
            console.error("Error updating store:", err);
            toast.error("Failed to update shop");
        } finally {
            setSavingStore(false);
        }
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        const token = localStorage.getItem('auth_token');

        if (!token) {
            toast.error("Not authenticated");
            setSaving(false);
            return;
        }

        try {
            const response = await fetch(`${API_URL}/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    full_name: fullName,
                    avatar_url: avatarUrl
                })
            });

            const result = await response.json();

            if (!response.ok) {
                toast.error(result.error || "Failed to update profile");
            } else {
                toast.success("Profile updated successfully!");
                await refreshProfile(); // Refresh global context
            }
        } catch (err) {
            console.error("Error saving profile:", err);
            toast.error("Failed to save profile");
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async () => {
        if (newPassword !== confirmPassword) {
            toast.error("Passwords don't match");
            return;
        }

        if (newPassword.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        setSaving(true);
        const token = localStorage.getItem('auth_token');

        try {
            const response = await fetch(`${API_URL}/auth/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ newPassword })
            });

            const data = await response.json();

            if (!response.ok) {
                toast.error(data.error || "Failed to change password");
            } else {
                toast.success("Password updated successfully!");
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            }
        } catch (err) {
            console.error("Error changing password:", err);
            toast.error("Failed to change password");
        } finally {
            setSaving(false);
        }
    };

    const handleResetPassword = async () => {
        toast.info("Password reset via email is currently disabled. Please contact support.");
        // Requires backend SMTP integration
    };

    const [deleting, setDeleting] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deletePassword, setDeletePassword] = useState("");

    const handleDeleteAccount = () => {
        setDeleteDialogOpen(true);
    };

    const confirmDeleteAccount = async () => {
        if (!deletePassword) {
            toast.error("Please enter your password");
            return;
        }

        setDeleting(true);
        const token = localStorage.getItem('auth_token');

        try {
            const response = await fetch(`${API_URL}/auth/delete-account`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ password: deletePassword })
            });


            const data = await response.json();

            if (!response.ok) {
                toast.error(data.error || "Failed to delete account");
                return;
            }

            toast.success("Account deleted successfully. Goodbye!");

            // Clear local storage and redirect to home
            localStorage.removeItem('auth_token');
            setTimeout(() => {
                window.location.href = '/';
            }, 1500);

        } catch (err) {
            console.error("Error deleting account:", err);
            toast.error("Failed to delete account. Please try again or contact support.");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <TapxLayout>
            <div className="min-h-screen bg-gradient-to-b from-gray-50/50 to-white dark:from-black dark:to-zinc-950 p-4 md:p-8 text-gray-900 dark:text-zinc-100">
                <div className="max-w-4xl mx-auto space-y-8">
                    {/* Enhanced Header */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10 dark:from-indigo-500/5 dark:via-purple-500/5 dark:to-pink-500/5 border border-gray-200/50 dark:border-zinc-800/50 p-6 md:p-8">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/20 to-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                        <div className="relative flex items-center gap-4">
                            <div className="p-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-lg">
                                <SettingsIcon className="w-7 h-7 text-indigo-500 dark:text-indigo-400" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">{t('settings.title')}</h1>
                                <p className="text-gray-500 dark:text-zinc-400 mt-0.5">{t('settings.subtitle')}</p>
                            </div>
                        </div>
                    </div>

                    <Tabs defaultValue="profile" className="space-y-6">
                        <TabsList className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-1.5 rounded-2xl w-full sm:w-auto inline-flex shadow-sm">
                            <TabsTrigger
                                value="profile"
                                className="px-5 py-2.5 rounded-xl data-[state=active]:bg-gray-900 dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-gray-900 data-[state=active]:shadow-lg text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200 transition-all flex items-center gap-2 font-medium"
                            >
                                <User className="w-4 h-4" />
                                <span className="hidden sm:inline">{t('settings.profile')}</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="security"
                                className="px-5 py-2.5 rounded-xl data-[state=active]:bg-gray-900 dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-gray-900 data-[state=active]:shadow-lg text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200 transition-all flex items-center gap-2 font-medium"
                            >
                                <Lock className="w-4 h-4" />
                                <span className="hidden sm:inline">{t('settings.security')}</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="notifications"
                                className="px-5 py-2.5 rounded-xl data-[state=active]:bg-gray-900 dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-gray-900 data-[state=active]:shadow-lg text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200 transition-all flex items-center gap-2 font-medium"
                            >
                                <Bell className="w-4 h-4" />
                                <span className="hidden sm:inline">{t('settings.notifications')}</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="danger"
                                className="px-5 py-2.5 rounded-xl data-[state=active]:bg-red-500 data-[state=active]:text-white data-[state=active]:shadow-lg text-gray-500 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition-all flex items-center gap-2 font-medium"
                            >
                                <Shield className="w-4 h-4" />
                                <span className="hidden sm:inline">{t('settings.dangerZone')}</span>
                            </TabsTrigger>
                        </TabsList>

                        {/* Profile Tab */}
                        <TabsContent value="profile" className="space-y-6">
                            <Card className="border-gray-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900/80 backdrop-blur-sm rounded-2xl overflow-hidden">
                                <CardHeader className="border-b border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50">
                                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">{t('settings.profile')}</CardTitle>
                                    <CardDescription className="text-gray-500 dark:text-zinc-400">{t('settings.profileDesc')}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-8 p-6">
                                    <AvatarUpload
                                        currentAvatarUrl={avatarUrl}
                                        userName={fullName}
                                        onUploadComplete={handleAvatarUpload}
                                    />

                                    <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-zinc-700 to-transparent" />

                                    <div className="grid gap-6 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label className="text-gray-700 dark:text-zinc-300 flex items-center gap-2 font-medium">
                                                <User className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                                                {t('settings.fullName')}
                                            </Label>
                                            <Input
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                className="bg-white dark:bg-zinc-950/50 border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-600 focus:border-indigo-500 focus:ring-indigo-500/20 rounded-xl h-11"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-gray-700 dark:text-zinc-300 flex items-center gap-2 font-medium">
                                                <AtSign className="w-4 h-4 text-gray-400 dark:text-zinc-500" />
                                                {t('settings.username')}
                                            </Label>
                                            <Input
                                                value={username}
                                                disabled
                                                className="bg-gray-50 dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-400 dark:text-zinc-500 cursor-not-allowed rounded-xl h-11"
                                            />
                                            <p className="text-xs text-gray-400 dark:text-zinc-500">{t('settings.usernameImmutable')}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-gray-700 dark:text-zinc-300 flex items-center gap-2 font-medium">
                                            <Mail className="w-4 h-4 text-gray-400 dark:text-zinc-500" />
                                            {t('settings.email')}
                                        </Label>
                                        <Input
                                            value={user?.email || ""}
                                            disabled
                                            className="bg-gray-50 dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-400 dark:text-zinc-500 cursor-not-allowed rounded-xl h-11"
                                        />
                                        <p className="text-xs text-gray-400 dark:text-zinc-500">{t('settings.emailNote')}</p>
                                    </div>

                                    <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-zinc-700 to-transparent" />

                                    <Button
                                        onClick={handleSaveProfile}
                                        disabled={saving}
                                        className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 rounded-xl h-11 px-6 w-full sm:w-auto"
                                    >
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                        {t('settings.saveChanges')}
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Security Tab */}
                        <TabsContent value="security" className="space-y-6">
                            <EmailVerification
                                email={user?.email || ""}
                                isVerified={user?.email_confirmed_at ? true : false}
                            />

                            <Card className="border-gray-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900/80 backdrop-blur-sm rounded-2xl overflow-hidden">
                                <CardHeader className="border-b border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50">
                                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">{t('settings.changePassword')}</CardTitle>
                                    <CardDescription className="text-gray-500 dark:text-zinc-400">{t('settings.changePasswordDesc')}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6 p-6">
                                    <div className="space-y-2">
                                        <Label className="text-gray-700 dark:text-zinc-300 font-medium">{t('settings.newPassword')}</Label>
                                        <Input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="bg-white dark:bg-zinc-950/50 border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-600 rounded-xl h-11"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-gray-700 dark:text-zinc-300 font-medium">{t('settings.confirmPassword')}</Label>
                                        <Input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="bg-white dark:bg-zinc-950/50 border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-600 rounded-xl h-11"
                                        />
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                        <Button
                                            onClick={handleChangePassword}
                                            disabled={saving || !newPassword}
                                            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 rounded-xl h-11"
                                        >
                                            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
                                            {t('settings.updatePassword')}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={handleResetPassword}
                                            className="border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white rounded-xl h-11"
                                        >
                                            {t('settings.sendResetEmail')}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Notifications Tab */}
                        <TabsContent value="notifications" className="space-y-6">
                            <Card className="border-gray-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900/80 backdrop-blur-sm rounded-2xl overflow-hidden">
                                <CardHeader className="border-b border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50">
                                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">{t('settings.emailNotifications')}</CardTitle>
                                    <CardDescription className="text-gray-500 dark:text-zinc-400">{t('settings.emailNotificationsDesc')}</CardDescription>
                                </CardHeader>
                                <CardContent className="divide-y divide-gray-100 dark:divide-zinc-800 p-0">
                                    <div className="flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-zinc-200">{t('settings.weeklyAnalytics')}</p>
                                            <p className="text-sm text-gray-500 dark:text-zinc-500 mt-0.5">{t('settings.weeklyAnalyticsDesc')}</p>
                                        </div>
                                        <Switch defaultChecked />
                                    </div>
                                    <div className="flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-zinc-200">{t('settings.newFeatures')}</p>
                                            <p className="text-sm text-gray-500 dark:text-zinc-500 mt-0.5">{t('settings.newFeaturesDesc')}</p>
                                        </div>
                                        <Switch defaultChecked />
                                    </div>
                                    <div className="flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-zinc-200">{t('settings.marketingEmails')}</p>
                                            <p className="text-sm text-gray-500 dark:text-zinc-500 mt-0.5">{t('settings.marketingEmailsDesc')}</p>
                                        </div>
                                        <Switch />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Danger Zone Tab */}
                        <TabsContent value="danger" className="space-y-6">
                            <Card className="border-red-200 dark:border-red-900/30 shadow-sm bg-gradient-to-br from-red-50 to-orange-50/50 dark:from-red-950/20 dark:to-orange-950/10 backdrop-blur-sm rounded-2xl overflow-hidden">
                                <CardHeader className="border-b border-red-100 dark:border-red-900/20">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl">
                                            <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg font-semibold text-red-600 dark:text-red-400">{t('settings.deleteAccount')}</CardTitle>
                                            <CardDescription className="text-red-500/70 dark:text-red-400/70">
                                                {t('settings.deleteAccountDesc')}
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <p className="text-sm text-gray-600 dark:text-zinc-400 mb-4">
                                        {t('settings.deleteWarning')}
                                    </p>
                                    <ul className="list-none text-sm text-gray-600 dark:text-zinc-400 mb-6 space-y-2">
                                        <li className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                                            {t('settings.deleteItem1')}
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                                            {t('settings.deleteItem2')}
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                                            {t('settings.deleteItem3')}
                                        </li>
                                    </ul>
                                    <Button
                                        variant="destructive"
                                        onClick={handleDeleteAccount}
                                        disabled={deleting}
                                        className="bg-red-600 hover:bg-red-700 text-white rounded-xl h-11 shadow-lg shadow-red-500/25"
                                    >
                                        {deleting ? (
                                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        ) : (
                                            <Trash2 className="w-4 h-4 mr-2" />
                                        )}
                                        {deleting ? t('settings.deleting') : t('settings.deleteButton')}
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            <ShareModal
                open={storeShareOpen}
                onOpenChange={setStoreShareOpen}
                username={username}
                url={`${window.location.origin}/${username}/store`}
                type="store"
                userAvatar={avatarUrl}
                userName={fullName}
            />

            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="sm:max-w-md rounded-2xl">
                    <DialogHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl">
                                <Trash2 className="w-5 h-5 text-red-600" />
                            </div>
                            <DialogTitle className="text-red-600 text-xl">Delete Account</DialogTitle>
                        </div>
                        <DialogDescription className="text-gray-600 dark:text-zinc-400">
                            This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                            <br /><br />
                            Please enter your password to confirm.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="password" className="text-gray-700 dark:text-zinc-300 font-medium">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            value={deletePassword}
                            onChange={(e) => setDeletePassword(e.target.value)}
                            placeholder="Enter your password"
                            className="mt-2 rounded-xl h-11 border-gray-200 dark:border-zinc-700"
                        />
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="rounded-xl">Cancel</Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDeleteAccount}
                            disabled={deleting || !deletePassword}
                            className="bg-red-600 hover:bg-red-700 rounded-xl"
                        >
                            {deleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                            Delete Account
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </TapxLayout>
    );
};

export default Settings;
