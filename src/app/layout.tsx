import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SwordCraft: Idle Forge — Кузница легендарного оружия",
  description: "Инкрементальная idle-игра про кузницу. Куйте легендарное оружие, управляйте рабочими, отправляйте искателей в подземелья!",
  keywords: ["idle game", "clicker", "forge", "crafting", "RPG", "инкрементальная игра"],
  authors: [{ name: "SwordCraft Team" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "SwordCraft: Idle Forge",
    description: "Кузница легендарного оружия — idle-игра",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SwordCraft: Idle Forge",
    description: "Кузница легендарного оружия — idle-игра",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
