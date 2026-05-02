import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { RealtimeSessionSync } from "@/components/RealtimeSessionSync";

export const viewport: Viewport = {
  themeColor: "#db2777",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Tambola Housie",
  description: "The ultimate platform to host, manage, and play Tambola.",
  manifest: "/manifest.json",
  applicationName: "Tambola Housie",
  category: "entertainment",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Tambola",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/apple-touch-icon.svg",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <RealtimeSessionSync />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
