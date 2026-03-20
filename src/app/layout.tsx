import "@/styles/globals.css";

import { type Metadata } from "next";
import { Open_Sans } from "next/font/google";
import localFont from "next/font/local";
import { Toaster } from "sonner";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { TRPCReactProvider } from "@/trpc/react";
import { TooltipProvider } from "@/components/ui/tooltip";

export const metadata: Metadata = {
  title: "DraftCV",
  description: "Build tailored resumes with drag & drop",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const openSans = Open_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-open-sans",
});

const georgiaPro = localFont({
  src: [
    {
      path: "../../public/fonts/GeorgiaPro/GeorgiaPro-Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/GeorgiaPro/GeorgiaPro-LightItalic.ttf",
      weight: "300",
      style: "italic",
    },
    {
      path: "../../public/fonts/GeorgiaPro/GeorgiaPro-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/GeorgiaPro/GeorgiaPro-Italic.ttf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../../public/fonts/GeorgiaPro/GeorgiaPro-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/GeorgiaPro/GeorgiaPro-SemiBoldItalic.ttf",
      weight: "600",
      style: "italic",
    },
    {
      path: "../../public/fonts/GeorgiaPro/GeorgiaPro-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/GeorgiaPro/GeorgiaPro-BoldItalic.ttf",
      weight: "700",
      style: "italic",
    },
    {
      path: "../../public/fonts/GeorgiaPro/GeorgiaPro-Black.ttf",
      weight: "900",
      style: "normal",
    },
    {
      path: "../../public/fonts/GeorgiaPro/GeorgiaPro-BlackItalic.ttf",
      weight: "900",
      style: "italic",
    },
  ],
  display: "swap",
  variable: "--font-georgia-pro",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${openSans.variable} ${georgiaPro.variable}`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <NuqsAdapter>
          <TRPCReactProvider>
            <TooltipProvider>
              {children}
              <Toaster />
            </TooltipProvider>
          </TRPCReactProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
