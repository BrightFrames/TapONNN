import { useState, useEffect } from "react";
import { toast } from "sonner";
import LinktreeLayout from "@/layouts/LinktreeLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

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
                toast.success(checked ? "Store published!" : "Store unpublished");
            } else {
                toast.error("Failed to update store settings");
            }
        } catch (err) {
            console.error("Error updating store:", err);
            toast.error("Failed to update store");
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

    const handleDeleteAccount = async () => {
        const confirmed = window.confirm(
            "Are you sure you want to delete your account? This action cannot be undone."
        );

        if (!confirmed) return;

        // Double confirmation for safety
        const doubleConfirmed = window.confirm(
            "This will permanently delete:\n\n• Your profile and all links\n• All analytics and click data\n• All products and orders\n• Your username (may be claimed by others)\n\nType 'DELETE' in the next prompt to confirm."
        );

        if (!doubleConfirmed) return;

        const finalConfirm = window.prompt("Type DELETE to confirm account deletion:");
        if (finalConfirm !== "DELETE") {
            toast.info("Account deletion cancelled.");
            return;
        }

        setDeleting(true);
        const token = localStorage.getItem('auth_token');

        try {
            const response = await fetch(`${API_URL}/auth/delete-account`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
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
        <>
            <LinktreeLayout>
                <div className="flex-1 py-4 sm:py-8 px-4 sm:px-6 md:px-10 overflow-y-auto">
                    <div className="max-w-3xl mx-auto">
                        {/* Header */}
                        <div className="mb-4 sm:mb-8">
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{t('settings.title')}</h1>
                            <p className="text-gray-500 text-xs sm:text-sm mt-1">{t('settings.subtitle')}</p>
                        </div>

                        <Tabs defaultValue="profile" className="space-y-4 sm:space-y-6">
                            <TabsList className="grid w-full grid-cols-4 h-auto gap-1 sm:gap-2 bg-transparent p-0">
                                <TabsTrigger
                                    value="profile"
                                    className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 rounded-xl py-3 px-4 gap-2"
                                >
                                    <User className="w-4 h-4" />
                                    <span className="hidden sm:inline">{t('settings.profile')}</span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="security"
                                    className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 rounded-xl py-3 px-4 gap-2"
                                >
                                    <Lock className="w-4 h-4" />
                                    <span className="hidden sm:inline">{t('settings.security')}</span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="notifications"
                                    className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 rounded-xl py-3 px-4 gap-2"
                                >
                                    <Bell className="w-4 h-4" />
                                    <span className="hidden sm:inline">{t('settings.notifications')}</span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="danger"
                                    className="data-[state=active]:bg-red-100 data-[state=active]:text-red-700 rounded-xl py-3 px-4 gap-2"
                                >
                                    <Shield className="w-4 h-4" />
                                    <span className="hidden sm:inline">{t('settings.dangerZone')}</span>
                                </TabsTrigger>
                            </TabsList>

                            {/* Profile Tab */}
                            <TabsContent value="profile" className="space-y-4 sm:space-y-6">
                                <Card className="border-0 shadow-sm">
                                    <CardHeader className="p-4 sm:p-6">
                                        <CardTitle className="text-base sm:text-lg">{t('settings.profileInfo')}</CardTitle>
                                        <CardDescription className="text-xs sm:text-sm">{t('settings.profileDesc')}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6 pt-0 sm:pt-0">
                                        {/* Avatar Upload */}
                                        <AvatarUpload
                                            currentAvatarUrl={avatarUrl}
                                            userName={fullName}
                                            onUploadComplete={handleAvatarUpload}
                                        />

                                        {/* Form Fields */}
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="fullName" className="flex items-center gap-2">
                                                    <User className="w-4 h-4 text-gray-400" />
                                                    {t('settings.fullName')}
                                                </Label>
                                                <Input
                                                    id="fullName"
                                                    value={fullName}
                                                    onChange={(e) => setFullName(e.target.value)}
                                                    placeholder={t('settings.fullName')}
                                                    className="rounded-xl"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="username" className="flex items-center gap-2">
                                                    <AtSign className="w-4 h-4 text-gray-400" />
                                                    {t('settings.username')}
                                                </Label>
                                                <Input
                                                    id="username"
                                                    value={username}
                                                    disabled
                                                    className="rounded-xl bg-gray-50"
                                                />
                                                <p className="text-xs text-gray-500">{t('settings.usernameImmutable')}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="flex items-center gap-2">
                                                <Mail className="w-4 h-4 text-gray-400" />
                                                {t('settings.email')}
                                            </Label>
                                            <Input
                                                id="email"
                                                value={user?.email || ""}
                                                disabled
                                                className="rounded-xl bg-gray-50"
                                            />
                                            <p className="text-xs text-gray-500">{t('settings.emailNote')}</p>
                                        </div>



                                        <Button
                                            onClick={handleSaveProfile}
                                            disabled={saving}
                                            className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-xl gap-2"
                                        >
                                            {saving ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Save className="w-4 h-4" />
                                            )}
                                            {t('settings.saveChanges')}
                                        </Button>
                                    </CardContent>
                                </Card>


                            </TabsContent>

                            {/* Security Tab */}
                            <TabsContent value="security" className="space-y-6">
                                {/* Email Verification */}
                                <EmailVerification
                                    email={user?.email || ""}
                                    isVerified={user?.email_confirmed_at ? true : false}
                                />

                                <Card className="border-0 shadow-sm">
                                    <CardHeader>
                                        <CardTitle className="text-lg">{t('settings.changePassword')}</CardTitle>
                                        <CardDescription>{t('settings.changePasswordDesc')}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="newPassword">{t('settings.newPassword')}</Label>
                                            <Input
                                                id="newPassword"
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                placeholder={t('settings.newPassword')}
                                                className="rounded-xl"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="confirmPassword">{t('settings.confirmPassword')}</Label>
                                            <Input
                                                id="confirmPassword"
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder={t('settings.confirmPassword')}
                                                className="rounded-xl"
                                            />
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <Button
                                                onClick={handleChangePassword}
                                                disabled={saving || !newPassword}
                                                className="rounded-xl gap-2"
                                            >
                                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                                                {t('settings.updatePassword')}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={handleResetPassword}
                                                className="rounded-xl"
                                            >
                                                {t('settings.sendResetEmail')}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-0 shadow-sm">
                                    <CardHeader>
                                        <CardTitle className="text-lg">{t('settings.twoFactor')}</CardTitle>
                                        <CardDescription>{t('settings.twoFactorDesc')}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">{t('settings.enable2FA')}</p>
                                                <p className="text-sm text-gray-500">{t('settings.enable2FADesc')}</p>
                                            </div>
                                            <Switch disabled />
                                        </div>
                                        <p className="text-xs text-gray-400 mt-2">{t('settings.comingSoon')}</p>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Notifications Tab */}
                            <TabsContent value="notifications" className="space-y-6">
                                <Card className="border-0 shadow-sm">
                                    <CardHeader>
                                        <CardTitle className="text-lg">{t('settings.emailNotifications')}</CardTitle>
                                        <CardDescription>{t('settings.emailNotificationsDesc')}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">{t('settings.weeklyAnalytics')}</p>
                                                <p className="text-sm text-gray-500">{t('settings.weeklyAnalyticsDesc')}</p>
                                            </div>
                                            <Switch defaultChecked />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">{t('settings.newFeatures')}</p>
                                                <p className="text-sm text-gray-500">{t('settings.newFeaturesDesc')}</p>
                                            </div>
                                            <Switch defaultChecked />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">{t('settings.marketingEmails')}</p>
                                                <p className="text-sm text-gray-500">{t('settings.marketingEmailsDesc')}</p>
                                            </div>
                                            <Switch />
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Danger Zone Tab */}
                            <TabsContent value="danger" className="space-y-6">
                                <Card className="border-0 shadow-sm border-red-200 bg-red-50/50">
                                    <CardHeader>
                                        <CardTitle className="text-lg text-red-700">{t('settings.deleteAccount')}</CardTitle>
                                        <CardDescription className="text-red-600">
                                            {t('settings.deleteAccountDesc')}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-gray-600 mb-4">
                                            {t('settings.deleteWarning')}
                                        </p>
                                        <ul className="list-disc list-inside text-sm text-gray-600 mb-6 space-y-1">
                                            <li>{t('settings.deleteItem1')}</li>
                                            <li>{t('settings.deleteItem2')}</li>
                                            <li>{t('settings.deleteItem3')}</li>
                                        </ul>
                                        <Button
                                            variant="destructive"
                                            onClick={handleDeleteAccount}
                                            disabled={deleting}
                                            className="rounded-xl gap-2"
                                        >
                                            {deleting ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="w-4 h-4" />
                                            )}
                                            {deleting ? t('settings.deleting') : t('settings.deleteButton')}
                                        </Button>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </LinktreeLayout>

            {/* Store Share Modal */}
            <ShareModal
                open={storeShareOpen}
                onOpenChange={setStoreShareOpen}
                username={username}
                url={`${window.location.origin}/${username}/store`}
                type="store"
            />
        </>
    );
};

export default Settings;
