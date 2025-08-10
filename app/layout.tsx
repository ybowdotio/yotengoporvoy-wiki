import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";

export const metadata: Metadata = {
  title: "Yo Tengo Por Voy - The Ulrich Family Journey",
  description: "From Amish Mennonite Illinois to Costa Rica - The Ulrich Family Story",
  metadataBase: new URL('https://yotengoporvoy.wiki'),
  openGraph: {
    title: "Yo Tengo Por Voy - The Ulrich Family Journey",
    description: "From Amish Mennonite Illinois to Costa Rica. Share your family memories: (618) 3-PORVOY",
    url: "https://yotengoporvoy.wiki",
    siteName: "Yo Tengo Por Voy",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Yo Tengo Por Voy - The Ulrich Family Journey"
      }
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Yo Tengo Por Voy - The Ulrich Family Journey",
    description: "From Amish Mennonite Illinois to Costa Rica. Share your family memories: (618) 3-PORVOY",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Header />
        {/* Main Content */}
        {children}
        <Footer />
      </body>
    </html>
  );
}
