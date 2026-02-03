import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
    Mail,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Send
} from "lucide-react";

interface EmailVerificationProps {
    email: string;
    isVerified: boolean;
}

const EmailVerification = ({ email, isVerified }: EmailVerificationProps) => {
    const [sending, setSending] = useState(false);

    const handleResendVerification = async () => {
        if (!email) {
            toast.error("No email address found");
            return;
        }

        setSending(true);

        try {
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: email
            });

            if (error) {
                toast.error(error.message);
            } else {
                toast.success("Verification email sent! Check your inbox.");
            }
        } catch (err) {
            console.error("Error sending verification email:", err);
            toast.error("Failed to send verification email");
        } finally {
            setSending(false);
        }
    };

    return (
        <Card className="border-0 shadow-sm">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg flex items-center gap-2 dark:text-zinc-100">
                            <Mail className="w-5 h-5 dark:text-zinc-400" />
                            Email Verification
                        </CardTitle>
                        <CardDescription className="dark:text-zinc-400">
                            Verify your email address to secure your account
                        </CardDescription>
                    </div>
                    {isVerified ? (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Verified
                        </Badge>
                    ) : (
                        <Badge variant="outline" className="border-amber-300 text-amber-700 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Unverified
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-xl border border-gray-100 dark:border-zinc-700/50">
                    <div>
                        <p className="font-medium text-sm dark:text-zinc-200">{email}</p>
                        {isVerified ? (
                            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                Your email address has been verified
                            </p>
                        ) : (
                            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                                Please check your inbox to verify your email
                            </p>
                        )}
                    </div>

                    {!isVerified && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleResendVerification}
                            disabled={sending}
                            className="rounded-xl gap-2"
                        >
                            {sending ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" />
                                    Resend Email
                                </>
                            )}
                        </Button>
                    )}
                </div>

                {!isVerified && (
                    <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-xl">
                        <h4 className="text-sm font-medium text-amber-800 dark:text-amber-500 mb-2">
                            Why verify your email?
                        </h4>
                        <ul className="text-xs text-amber-700 dark:text-amber-400/80 space-y-1">
                            <li>• Secure your account with password recovery</li>
                            <li>• Receive important updates about your profile</li>
                            <li>• Access all premium features</li>
                        </ul>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default EmailVerification;
