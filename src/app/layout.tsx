import type { Metadata } from "next";
import "@/styles/globals.css";
import { QueryProvider } from "@/lib/query/provider";

export const metadata: Metadata = {
  title: "Tracklume",
  description: "Track tasks, bugs, and product ideas clearly.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
