import { getTranslations } from 'next-intl/server';
import UsersContent from '@/components/users/users-content';

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
    const params = await props.params;
    const { locale } = params;

    const t = await getTranslations({ locale, namespace: 'Users' });

    return {
        title: t('title')
    };
}

export default async function UsersPage() {
    return (
        <UsersContent />
    );
}
