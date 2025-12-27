import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/auth-context";
import { SupabaseCheck } from "@/components/supabase-check";
import { TRPCProvider } from "@/lib/trpc/provider";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Xero CRM - Modern CRM Solution",
  description: "Modern CRM solution for your business",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`} suppressHydrationWarning>
        <TRPCProvider>
          <ThemeProvider defaultTheme="system" storageKey="xero-crm-theme">
            <AuthProvider>
              <SupabaseCheck />
              {children}
              <Toaster position="top-right" />
            </AuthProvider>
          </ThemeProvider>
        </TRPCProvider>
      </body>
    </html>
  );
}
