import type { Metadata } from "next";
import { AppQueryProvider } from "../src/shared/providers/QueryProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Volt",
  description: "Volt Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AppQueryProvider>{children}</AppQueryProvider>
      </body>
    </html>
  );
}
