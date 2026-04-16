import { redirect } from 'next/navigation';
import { defaultLocale, locales, LocaleType } from '../../i18n/request';
import { headers } from 'next/headers';

export default async function RootPage() {
    const headersList = await headers();
    const acceptLanguage = headersList.get('accept-language');

    let preferredLocale: LocaleType = defaultLocale;

    if (acceptLanguage) {
        const preferredLanguages = acceptLanguage.split(',').map((lang: string) => lang.split(';')[0].trim().substring(0, 2));
        for (const lang of preferredLanguages) {
            if ((locales as readonly string[]).includes(lang)) {
                preferredLocale = lang as LocaleType;
                break;
            }
        }
    }

    redirect(`/${preferredLocale}/user/homepage`);
}
