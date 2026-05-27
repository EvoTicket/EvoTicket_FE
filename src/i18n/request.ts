import { getRequestConfig } from 'next-intl/server';


export type LocaleType = 'vi' | 'en';
// Định nghĩa các ngôn ngữ được hỗ trợ
export const locales: LocaleType[] = ['vi', 'en'] as const;
export const defaultLocale: LocaleType = 'vi';

export default getRequestConfig(async ({ locale }) => {
  const currentLocale = locale ?? defaultLocale;
  const messages = (await import(`@/messages/${currentLocale}.json`)).default;

  return {
    locale: currentLocale,   // thêm dòng này
    messages,
  };
});
