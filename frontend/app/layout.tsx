import type { Metadata, Viewport } from "next";
import { Geist_Mono, Inter, Fira_Sans } from "next/font/google";
import "./globals.css";
import Providers from "@/lib/tanstack/provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { CommandPalette } from "@/components/site/command-palette";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const firaSans = Fira_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nepal Horizon | Trekking Tours",
  description: "Journey through the world's highest peaks with hand-curated trekking expeditions.",
};

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={cn(
        "h-full",
        "antialiased",
        inter.variable,
        firaSans.variable,
        geistMono.variable,
        "font-sans",
      )}
    >
      <body className="min-h-full flex flex-col">
        {/*
          Every journey photograph is served from Cloudinary. The handshake is
          cheap, the images are not — open the connection early.
        */}
        <link rel="preconnect" href="https://res.cloudinary.com" />

        <ThemeProvider>
          <Providers>
            {children}
            <Toaster position="bottom-right" />
            <CommandPalette />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
