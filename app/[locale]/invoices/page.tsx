import { getTranslations } from 'next-intl/server';
import InvoicesContent from '@/components/invoices/invoices-content';

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
    const params = await props.params;
    const { locale } = params;

    const t = await getTranslations({ locale, namespace: 'Invoices' });

    return {
        title: t('title')
    };
}

export default async function InvoicesPage() {
    return (
        <InvoicesContent />
    );
}
