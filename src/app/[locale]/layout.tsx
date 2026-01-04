import { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { notFound, redirect } from 'next/navigation';
import { locales, defaultLocale, LocaleType } from '@/src/i18n/request';
import { ThemeProvider } from '../../components/theme-provider';
import '../globals.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ChatBot } from '@/src/components/chatbot';

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

// Load messages theo locale
async function getMessages(locale: LocaleType) {
  try {
    return (await import(`@/messages/${locale}.json`)).default;
  } catch {
    notFound();
  }
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale: requested } = await params;

  // locale không hợp lệ → redirect
  if (!locales.includes(requested as LocaleType)) {
    redirect(`/${defaultLocale}/auth/login`);
  }

  const locale = requested as LocaleType;
  const messages = await getMessages(locale);

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
          >
            {children}
            <ToastContainer />
            <ChatBot />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
