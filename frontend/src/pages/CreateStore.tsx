import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import TapxLayout from "@/layouts/TapxLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Check, X, Store, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

const CreateStore = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [checkingUsername, setCheckingUsername] = useState(false);
    const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
    const [usernameMessage, setUsernameMessage] = useState("");
    
    const [formData, setFormData] = useState({
        username: "",
        store_name: "",
        bio: "",
        category: ""
    });

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

    // Debounce timer
    let usernameCheckTimeout: NodeJS.Timeout;

    const checkUsernameAvailability = async (username: string) => {
        if (!username || username.length < 3) {
            setUsernameAvailable(null);
            setUsernameMessage("");
            return;
        }

        // Validate username format (alphanumeric, underscore, hyphen)
        const usernameRegex = /^[a-zA-Z0-9_-]+$/;
        if (!usernameRegex.test(username)) {
            setUsernameAvailable(false);
            setUsernameMessage("Username can only contain letters, numbers, _ and -");
            return;
        }

        setCheckingUsername(true);
        try {
            const response = await fetch(`${API_URL}/stores/check-username/${username}`);
            const data = await response.json();
            
            setUsernameAvailable(data.available);
            setUsernameMessage(data.message);
        } catch (err) {
            console.error("Error checking username:", err);
            setUsernameAvailable(null);
            setUsernameMessage("Error checking username");
        } finally {
            setCheckingUsername(false);
        }
    };

    const handleUsernameChange = (value: string) => {
        const sanitized = value.toLowerCase().trim();
        setFormData({ ...formData, username: sanitized });
        
        // Clear previous timeout
        if (usernameCheckTimeout) clearTimeout(usernameCheckTimeout);
        
        // Debounce username check
        usernameCheckTimeout = setTimeout(() => {
            checkUsernameAvailability(sanitized);
        }, 500);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!usernameAvailable) {
            toast.error("Please choose an available username");
            return;
        }

        if (!formData.store_name.trim()) {
            toast.error("Shop name is required");
            return;
        }

        setLoading(true);
        const token = localStorage.getItem('auth_token');

        try {
            const response = await fetch(`${API_URL}/stores`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const data = await response.json();
                toast.success("Shop created successfully!");
                navigate('/settings'); // Or navigate to store management page
            } else {
                const error = await response.json();
                toast.error(error.error || "Failed to create shop");
            }
        } catch (err) {
            console.error("Error creating store:", err);
            toast.error("Failed to create shop");
        } finally {
            setLoading(false);
        }
    };

    return (
        <TapxLayout>
            <div className="max-w-2xl mx-auto p-6">
                <Button
                    variant="ghost"
                    onClick={() => navigate(-1)}
                    className="mb-6"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-800 to-black dark:from-gray-700 dark:to-gray-900 flex items-center justify-center">
                                <Store className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl">Create New Shop</CardTitle>
                                <CardDescription>
                                    Set up your digital shop in minutes
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Username Field */}
                            <div className="space-y-2">
                                <Label htmlFor="username">
                                    Shop Username <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground">tapx.bio/</span>
                                        <Input
                                            id="username"
                                            type="text"
                                            placeholder="mystorename"
                                            value={formData.username}
                                            onChange={(e) => handleUsernameChange(e.target.value)}
                                            className="flex-1"
                                            required
                                            minLength={3}
                                        />
                                        {checkingUsername && (
                                            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                                        )}
                                        {!checkingUsername && usernameAvailable === true && (
                                            <Check className="w-5 h-5 text-green-500" />
                                        )}
                                        {!checkingUsername && usernameAvailable === false && (
                                            <X className="w-5 h-5 text-red-500" />
                                        )}
                                    </div>
                                    {usernameMessage && (
                                        <p className={`text-sm mt-1 ${usernameAvailable ? 'text-green-600' : 'text-red-600'}`}>
                                            {usernameMessage}
                                        </p>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    This will be your shop's unique URL. Use only letters, numbers, _ and -
                                </p>
                            </div>

                            {/* Store Name */}
                            <div className="space-y-2">
                                <Label htmlFor="store_name">
                                    Shop Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="store_name"
                                    type="text"
                                    placeholder="My Amazing Shop"
                                    value={formData.store_name}
                                    onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
                                    required
                                />
                                <p className="text-xs text-muted-foreground">
                                    This is the display name that visitors will see
                                </p>
                            </div>

                            {/* Bio */}
                            <div className="space-y-2">
                                <Label htmlFor="bio">Shop Description</Label>
                                <Textarea
                                    id="bio"
                                    placeholder="Tell people what your shop is about..."
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    rows={4}
                                />
                            </div>

                            {/* Category */}
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Input
                                    id="category"
                                    type="text"
                                    placeholder="e.g., Fashion, Electronics, Art"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                />
                            </div>

                            {/* Submit Button */}
                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate(-1)}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={loading || !usernameAvailable || checkingUsername}
                                    className="flex-1 bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <Store className="w-4 h-4 mr-2" />
                                            Create Shop
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Preview Section */}
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle className="text-lg">Preview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-muted rounded-lg p-6 text-center">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-800 to-black dark:from-gray-700 dark:to-gray-900 flex items-center justify-center mx-auto mb-4">
                                <Store className="w-10 h-10 text-white" />
                            </div>
                            <h3 className="font-bold text-xl mb-2">
                                {formData.store_name || "Your Shop Name"}
                            </h3>
                            {formData.username && (
                                <p className="text-sm text-muted-foreground mb-2">
                                    @{formData.username}
                                </p>
                            )}
                            {formData.bio && (
                                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                                    {formData.bio}
                                </p>
                            )}
                            {formData.category && (
                                <div className="mt-3">
                                    <span className="inline-block bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-1 rounded-full text-xs">
                                        {formData.category}
                                    </span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </TapxLayout>
    );
};

export default CreateStore;
