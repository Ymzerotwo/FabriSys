import { useTranslations } from "next-intl";

export default function SuppliersPage() {
    const t = useTranslations('Navigation');

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">{t('suppliers')}</h2>
            </div>
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                <p className="text-muted-foreground">Suppliers Management Module - Coming Soon</p>
            </div>
        </div>
    );
}
