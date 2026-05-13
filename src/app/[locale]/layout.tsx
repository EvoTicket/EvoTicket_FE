import { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { notFound, redirect } from 'next/navigation';
import { locales, defaultLocale, LocaleType } from '@/src/i18n/request';
import { ThemeProvider } from '../../components/theme-provider';
import StoreProvider from '@/src/store/StoreProvider';
import '../globals.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ChatBot } from '@/src/components/chatbot';
import { GoogleOAuthProvider } from '@react-oauth/google';

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
    redirect(`/${defaultLocale}/user/homepage`);
  }

  const locale = requested as LocaleType;
  const messages = await getMessages(locale);

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <StoreProvider>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
            >
              <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
                {children}
              </GoogleOAuthProvider>
              <ToastContainer />
              <ChatBot />
            </ThemeProvider>
          </NextIntlClientProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
