import { redirect } from 'next/navigation';
import { locales, LocaleType } from '../../i18n/request';

type Props = { params: { locale: string } };

export default function LocalePage({ params }: Props) {
  const locale = params?.locale as LocaleType;

  if (!locales.includes(locale)) {
    redirect('/'); // nếu locale invalid → quay về root
  }

  // Redirect thẳng tới homepage
  redirect(`/${locale}/user/homepage`);
}
