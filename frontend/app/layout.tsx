import type { Metadata, Viewport } from "next";
import { Geist_Mono, Inter, Fira_Sans } from "next/font/google";
import "./globals.css";
import Providers from "@/lib/tanstack/provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
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
  metadataBase: new URL("https://nepalhorizon.vercel.app"),
  title: {
    default: "Nepal Horizon | Trekking Tours in Nepal",
    template: "%s | Nepal Horizon",
  },
  description:
    "Hand-curated small-group trekking journeys through Nepal's quietest high places — Everest, Annapurna, Manaslu, Mustang and beyond. Built around weather, local knowledge and time to look up.",
  keywords: [
    "Nepal trekking",
    "Nepal Horizon",
    "trekking in Nepal",
    "Himalayan treks",
    "Everest Base Camp trek",
    "Annapurna circuit",
    "Manaslu circuit",
    "Upper Mustang trek",
    "small group trekking Nepal",
    "Nepal tourism",
  ],
  applicationName: "Nepal Horizon",
  authors: [{ name: "Nepal Horizon" }],
  creator: "Nepal Horizon",
  publisher: "Nepal Horizon",
  category: "Travel",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "https://nepalhorizon.vercel.app",
    siteName: "Nepal Horizon",
    title: "Nepal Horizon | Trekking Tours in Nepal",
    description:
      "Hand-curated small-group trekking journeys through Nepal's quietest high places.",
    images: [
      {
        url: "https://res.cloudinary.com/dshcoqzuu/image/upload/v1793007884/hg9k0aupufvgvgqikngh.jpg",
        width: 1200,
        height: 630,
        alt: "Nepal Horizon — trekking journeys through Nepal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nepal Horizon | Trekking Tours in Nepal",
    description:
      "Hand-curated small-group trekking journeys through Nepal's quietest high places.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
  },
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

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "TravelAgency",
              name: "Nepal Horizon",
              url: "https://nepalhorizon.vercel.app",
              description:
                "Hand-curated small-group trekking journeys through Nepal's quietest high places.",
              areaServed: "Nepal",
              email: "keshwor12@gmail.com",
            }),
          }}
        />

        <ThemeProvider>
          <Providers>
            {children}
            <Toaster position="bottom-right" />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
