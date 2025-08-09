import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Yo Tengo Por Voy - The Ulrich Family Journey",
  description: "From Amish Mennonite Illinois to Costa Rica - The Ulrich Family Story",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
