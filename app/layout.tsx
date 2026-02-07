import type { Metadata } from "next";
import { fontSerif, fontSans, fontMono } from "./fonts";
import { cn } from "@/lib/utils";
import "./globals.css";

export const metadata: Metadata = {
  title: "LogoLoom",
  description: "Tisser votre identité numérique.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased text-foreground selection:bg-accent-primary selection:text-background",
          fontSerif.variable,
          fontSans.variable,
          fontMono.variable
        )}
      >
        {children}
      </body>
    </html>
  );
}
