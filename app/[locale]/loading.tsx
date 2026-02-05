import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

export default function Loading() {
    const t = useTranslations('Loading');
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    <div className="absolute inset-0 h-16 w-16 animate-ping rounded-full bg-primary/20 duration-1000" />
                    <Loader2 className="h-16 w-16 animate-spin text-primary" />
                </div>
                <p className="mt-4 text-lg font-medium text-muted-foreground animate-pulse">
                    {t('text')}
                </p>
            </div>
        </div>
    );
}
