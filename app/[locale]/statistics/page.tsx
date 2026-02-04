import { useTranslations } from "next-intl";

export default function StatisticsPage() {
    const t = useTranslations('Navigation');

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">{t('statistics')}</h2>
            </div>
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                <p className="text-muted-foreground">Advanced Analytics Module - Coming Soon</p>
            </div>
        </div>
    );
}
