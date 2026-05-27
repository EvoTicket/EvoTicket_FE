import localFont from "next/font/local";
import { Inter } from "next/font/google";

export const fontSans = Inter({
  subsets: ["latin", "vietnamese"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "900"],
  variable: "--font-sans",
  display: "swap",
});

export const fontCamaro = localFont({
  src: "../../public/fonts/1FTV-Camaro.woff2",
  variable: "--font-camaro",
  display: "swap",
});