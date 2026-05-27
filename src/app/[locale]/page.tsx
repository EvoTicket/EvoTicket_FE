import { redirect } from 'next/navigation';
import { locales, LocaleType } from '../../i18n/request';

type Props = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function LocalePage({ params }: Props) {
  const { locale } = await params;

  if (!locales.includes(locale as LocaleType)) {
    redirect("/");
  }

  redirect(`/${locale}/user/homepage`);
}