import { useTranslations } from "next-intl";

export default function DashboardPage() {
    const t = useTranslations('Navigation');
    const home = useTranslations('HomePage');

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">{t('dashboard')}</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {['Total Revenue', 'Subscriptions', 'Active Now', 'Sales'].map((item, i) => (
                    <div key={i} className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">{item}</h3>
                        </div>
                        <div className="text-2xl font-bold">$45,231.89</div>
                        <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                    </div>
                ))}
            </div>

            <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 min-h-[400px] flex items-center justify-center text-muted-foreground">
                Chart Placeholder (Statistics will go here)
            </div>
        </div>
    );
}
