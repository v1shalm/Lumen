import "./globals.css";
import "sileo/styles.css";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { AppSidebar } from "@/components/AppSidebar";
import { TopNavbar } from "@/components/TopNavbar";
import { ToastProvider } from "@/components/ToastProvider";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lumen – AI Research Workspace",
  description: "AI-powered knowledge synthesis and research workspace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}
      style={{ scrollbarGutter: "stable" }}
    >
      <body className="min-h-full bg-background text-foreground font-sans">
        <AppSidebar />
        <TopNavbar />
        <main className="pl-60 pt-14 min-h-screen flex flex-col">
          <div className="flex-1 px-8 py-8 md:px-10">
            {children}
          </div>
        </main>
        <ToastProvider />
      </body>
    </html>
  );
}
