import TapxLayout from "@/layouts/TapxLayout";
import { Smartphone, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useTranslation } from "react-i18next";

const NFCCards = () => {
    const { t } = useTranslation();
    return (
        <TapxLayout>
            <div className="flex flex-col items-center justify-center h-full p-8 text-center text-muted-foreground">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
                    <Smartphone className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">{t('nfc.title')}</h2>
                <p className="max-w-md mb-8">{t('nfc.desc')}</p>
                <Button className="gap-2">
                    <CreditCard className="w-4 h-4" /> {t('nfc.order')}
                </Button>
                <div className="mt-12 p-4 bg-muted/30 rounded-lg text-sm border border-border">
                    <p>{t('media.comingSoon')}</p>
                </div>
            </div>
        </TapxLayout>
    );
};

export default NFCCards;
