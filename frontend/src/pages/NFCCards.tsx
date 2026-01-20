import LinktreeLayout from "@/layouts/LinktreeLayout";
import { Smartphone, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";

const NFCCards = () => {
    return (
        <LinktreeLayout>
            <div className="flex flex-col items-center justify-center h-full p-8 text-center text-muted-foreground">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
                    <Smartphone className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">NFC Cards</h2>
                <p className="max-w-md mb-8">Link your digital profile to a physical NFC card. Tap to share instantly.</p>
                <Button className="gap-2">
                    <CreditCard className="w-4 h-4" /> Order Card
                </Button>
                <div className="mt-12 p-4 bg-muted/30 rounded-lg text-sm border border-border">
                    <p>Coming Soon in Phase 7</p>
                </div>
            </div>
        </LinktreeLayout>
    );
};

export default NFCCards;
