import { getTranslations } from 'next-intl/server';
import { ShoppingCart } from 'lucide-react';

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
    const params = await props.params;
    const { locale } = params;

    const t = await getTranslations({ locale, namespace: 'Navigation' });

    return {
        title: t('orders')
    };
}

export default async function OrdersPage() {
    return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
            <div className="p-4 bg-muted rounded-full">
                <ShoppingCart className="h-12 w-12 text-muted-foreground" />
            </div>
            <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">Orders Management</h2>
                <p className="text-muted-foreground">This module is currently under development.</p>
            </div>
        </div>
    );
}
