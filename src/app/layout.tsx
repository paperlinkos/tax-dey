import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/header";
import { LanguageProvider } from "@/components/language-provider";

export const metadata: Metadata = { title: "Tax De | Nigerian tax estimates", description: "Simple Nigerian personal income tax estimates." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body suppressHydrationWarning><LanguageProvider><Header/>{children}</LanguageProvider></body></html>; }
