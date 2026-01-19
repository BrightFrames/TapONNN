import { useState, useEffect } from "react";
import { toast } from "sonner";
import LinktreeLayout from "@/layouts/LinktreeLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import AvatarUpload from "@/components/AvatarUpload";
import SocialLinksManager from "@/components/SocialLinksManager";
import EmailVerification from "@/components/EmailVerification";
import ShareModal from "@/components/ShareModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
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
    FileText,
    ShoppingBag,
    Share2
} from "lucide-react";

const Settings = () => {
    const { user, isAuthenticated, refreshProfile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Profile form state
    const [fullName, setFullName] = useState(user?.name || "");
    const [username, setUsername] = useState(user?.username || "");
    const [bio, setBio] = useState("");
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
                    setBio(data.bio || "");
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

        if (isAuthenticated) {
            loadProfile();
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
                    username,
                    bio,
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

    const handleDeleteAccount = async () => {
        const confirmed = window.confirm(
            "Are you sure you want to delete your account? This action cannot be undone."
        );

        if (!confirmed) return;

        toast.error("Account deletion is not yet implemented for safety. Contact support.");
    };

    return (
        <>
            <LinktreeLayout>
                <div className="flex-1 py-8 px-6 md:px-10 overflow-y-auto">
                    <div className="max-w-3xl mx-auto">
                        {/* Header */}
                        <div className="mb-8">
                            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                            <p className="text-gray-500 text-sm mt-1">Manage your account and preferences</p>
                        </div>

                        <Tabs defaultValue="profile" className="space-y-6">
                            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-4 h-auto gap-2 bg-transparent p-0">
                                <TabsTrigger
                                    value="profile"
                                    className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 rounded-xl py-3 px-4 gap-2"
                                >
                                    <User className="w-4 h-4" />
                                    <span className="hidden sm:inline">Profile</span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="security"
                                    className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 rounded-xl py-3 px-4 gap-2"
                                >
                                    <Lock className="w-4 h-4" />
                                    <span className="hidden sm:inline">Security</span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="notifications"
                                    className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 rounded-xl py-3 px-4 gap-2"
                                >
                                    <Bell className="w-4 h-4" />
                                    <span className="hidden sm:inline">Notifications</span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="danger"
                                    className="data-[state=active]:bg-red-100 data-[state=active]:text-red-700 rounded-xl py-3 px-4 gap-2"
                                >
                                    <Shield className="w-4 h-4" />
                                    <span className="hidden sm:inline">Danger Zone</span>
                                </TabsTrigger>
                            </TabsList>

                            {/* Profile Tab */}
                            <TabsContent value="profile" className="space-y-6">
                                <Card className="border-0 shadow-sm">
                                    <CardHeader>
                                        <CardTitle className="text-lg">Profile Information</CardTitle>
                                        <CardDescription>Update your profile details and public information</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
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
                                                    Full Name
                                                </Label>
                                                <Input
                                                    id="fullName"
                                                    value={fullName}
                                                    onChange={(e) => setFullName(e.target.value)}
                                                    placeholder="Your full name"
                                                    className="rounded-xl"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="username" className="flex items-center gap-2">
                                                    <AtSign className="w-4 h-4 text-gray-400" />
                                                    Username
                                                </Label>
                                                <Input
                                                    id="username"
                                                    value={username}
                                                    onChange={(e) => setUsername(e.target.value)}
                                                    placeholder="your-username"
                                                    className="rounded-xl"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="flex items-center gap-2">
                                                <Mail className="w-4 h-4 text-gray-400" />
                                                Email
                                            </Label>
                                            <Input
                                                id="email"
                                                value={user?.email || ""}
                                                disabled
                                                className="rounded-xl bg-gray-50"
                                            />
                                            <p className="text-xs text-gray-500">Email cannot be changed directly. Contact support.</p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="bio" className="flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-gray-400" />
                                                Bio
                                            </Label>
                                            <Textarea
                                                id="bio"
                                                value={bio}
                                                onChange={(e) => setBio(e.target.value)}
                                                placeholder="Tell visitors about yourself..."
                                                className="rounded-xl resize-none min-h-[100px]"
                                                maxLength={200}
                                            />
                                            <p className="text-xs text-gray-500 text-right">{bio.length}/200</p>
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
                                            Save Changes
                                        </Button>
                                    </CardContent>
                                </Card>

                                {/* Social Links Card */}
                                <Card className="border-0 shadow-sm">
                                    <CardHeader>
                                        <CardTitle className="text-lg">Social Links</CardTitle>
                                        <CardDescription>Add links to your social media profiles</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <SocialLinksManager
                                            socialLinks={[]}
                                            onUpdate={(links) => {
                                                console.log("Social links updated:", links);
                                                // TODO: Save to backend when social_links table is created
                                            }}
                                        />
                                    </CardContent>
                                </Card>

                                {/* Store Profile Card - Only visible if user has products */}
                                {hasStore && (
                                    <Card className="border-0 shadow-sm border-purple-100 bg-gradient-to-r from-purple-50 to-pink-50">
                                        <CardHeader>
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <ShoppingBag className="w-5 h-5 text-purple-600" />
                                                Store Profile
                                            </CardTitle>
                                            <CardDescription>Share your store separately from your main profile</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium">Publish Store</p>
                                                    <p className="text-sm text-gray-500">Make your store visible at /{username}/store</p>
                                                </div>
                                                <Switch
                                                    checked={storePublished}
                                                    onCheckedChange={handleStorePublishToggle}
                                                    disabled={savingStore}
                                                />
                                            </div>

                                            {storePublished && (
                                                <div className="pt-2 border-t">
                                                    <p className="text-sm text-gray-600 mb-3">Your store is live! Share it with your audience.</p>
                                                    <Button
                                                        onClick={() => setStoreShareOpen(true)}
                                                        className="gap-2 bg-purple-600 hover:bg-purple-700 rounded-xl"
                                                    >
                                                        <Share2 className="w-4 h-4" />
                                                        Share Store
                                                    </Button>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}
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
                                        <CardTitle className="text-lg">Change Password</CardTitle>
                                        <CardDescription>Update your password to keep your account secure</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="newPassword">New Password</Label>
                                            <Input
                                                id="newPassword"
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                placeholder="Enter new password"
                                                className="rounded-xl"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                            <Input
                                                id="confirmPassword"
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder="Confirm new password"
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
                                                Update Password
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={handleResetPassword}
                                                className="rounded-xl"
                                            >
                                                Send Reset Email
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-0 shadow-sm">
                                    <CardHeader>
                                        <CardTitle className="text-lg">Two-Factor Authentication</CardTitle>
                                        <CardDescription>Add an extra layer of security to your account</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">Enable 2FA</p>
                                                <p className="text-sm text-gray-500">Require a code when signing in</p>
                                            </div>
                                            <Switch disabled />
                                        </div>
                                        <p className="text-xs text-gray-400 mt-2">Coming soon</p>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Notifications Tab */}
                            <TabsContent value="notifications" className="space-y-6">
                                <Card className="border-0 shadow-sm">
                                    <CardHeader>
                                        <CardTitle className="text-lg">Email Notifications</CardTitle>
                                        <CardDescription>Choose what emails you receive</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">Weekly Analytics</p>
                                                <p className="text-sm text-gray-500">Get a weekly summary of your profile performance</p>
                                            </div>
                                            <Switch defaultChecked />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">New Features</p>
                                                <p className="text-sm text-gray-500">Be the first to know about new features</p>
                                            </div>
                                            <Switch defaultChecked />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">Marketing Emails</p>
                                                <p className="text-sm text-gray-500">Tips, offers, and promotional content</p>
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
                                        <CardTitle className="text-lg text-red-700">Delete Account</CardTitle>
                                        <CardDescription className="text-red-600">
                                            Permanently delete your account and all associated data
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-gray-600 mb-4">
                                            Once you delete your account, there is no going back. This will permanently delete:
                                        </p>
                                        <ul className="list-disc list-inside text-sm text-gray-600 mb-6 space-y-1">
                                            <li>Your profile and all links</li>
                                            <li>All analytics and click data</li>
                                            <li>Your username (may be claimed by others)</li>
                                        </ul>
                                        <Button
                                            variant="destructive"
                                            onClick={handleDeleteAccount}
                                            className="rounded-xl gap-2"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Delete My Account
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
