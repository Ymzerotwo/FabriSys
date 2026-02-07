
import { useTranslations } from "next-intl";

export default function UsersPage() {
    const t = useTranslations('Navigation');

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">{t('users')}</h2>
            </div>

            <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-12 text-center">
                <h3 className="text-lg font-semibold mb-2">Users Management</h3>
                <p className="text-muted-foreground">Manage system users, roles, and permissions - Coming Soon</p>
            </div>
        </div>
    );
}
