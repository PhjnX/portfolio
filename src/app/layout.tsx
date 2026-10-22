import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Providers, bootScript } from "@/components/Providers";
import { profile } from "@/content/site";
import "./globals.css";

// One readable family with full Vietnamese support for headings and text. Upright only: no italics.
const body = Plus_Jakarta_Sans({
  subsets: ["latin", "vietnamese"],
  style: ["normal"],
  variable: "--font-body",
  display: "swap",
});

const description =
  "Phjn Hoang (Bùi Hoàng Phi), front-end developer in Ho Chi Minh City. React, React Native, TypeScript, Next.js, WordPress and WooCommerce.";

export const metadata: Metadata = {
  metadataBase: new URL(profile.siteUrl),
  title: {
    default: `${profile.nickname} · Front-end Developer`,
    template: `%s · ${profile.nickname}`,
  },
  description,
  openGraph: {
    title: `${profile.nickname} · Front-end Developer`,
    description,
    url: profile.siteUrl,
    siteName: profile.nickname,
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#08080c" },
    { media: "(prefers-color-scheme: light)", color: "#eeedf3" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${body.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body className="min-h-dvh">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
