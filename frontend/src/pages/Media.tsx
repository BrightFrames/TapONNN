import TapxLayout from "@/layouts/TapxLayout";
import { Image, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useTranslation } from "react-i18next";

const Media = () => {
    const { t } = useTranslation();
    return (
        <TapxLayout>
            <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-in fade-in zoom-in duration-500 font-sans">
                <div className="max-w-md w-full space-y-8">

                    <div className="relative w-32 h-32 mx-auto group">
                        <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-blue-500/20 rounded-full blur-2xl animate-pulse group-hover:from-purple-500/30 group-hover:to-blue-500/30 transition-all" />
                        <div className="relative w-full h-full bg-white dark:bg-zinc-900/80 backdrop-blur-xl border border-gray-100 dark:border-zinc-800 rounded-[2.5rem] flex items-center justify-center shadow-2xl group-hover:scale-105 transition-transform duration-500">
                            <Image className="w-12 h-12 text-gray-400 dark:text-zinc-400 group-hover:text-purple-600 dark:group-hover:text-white transition-colors" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white drop-shadow-sm">{t('media.title')}</h2>
                        <p className="text-gray-500 dark:text-zinc-400 text-lg leading-relaxed">{t('media.desc')}</p>
                    </div>

                    <div className="pt-8 flex flex-col items-center gap-4">
                        <Button className="h-14 px-8 rounded-full bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-zinc-200 font-bold text-base shadow-[0_0_20px_rgba(0,0,0,0.1)] dark:shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:scale-105 transition-all gap-2">
                            <Upload className="w-5 h-5" /> {t('media.upload')}
                        </Button>
                        <div className="mt-8 px-5 py-2 rounded-full bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-zinc-500 text-sm flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            {t('media.comingSoon')}
                        </div>
                    </div>

                </div>
            </div>
        </TapxLayout>
    );
};

export default Media;
