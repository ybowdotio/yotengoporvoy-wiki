import type { Metadata } from "next";
import Link from "next/link";
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
      <body>
        {/* Airmail Banner - Top of every page */}
        <div className="airmail-banner"></div>
        
        {/* Header with Phone Number */}
        <header>
          <div className="header-content">
            <h1>Yo Tengo Por Voy</h1>
            <p className="tagline">&ldquo;I have to go&rdquo; - Everett&apos;s broken Spanish that touched hearts</p>
            
            <div className="journey-info">
              <span>📍 Tampico, Illinois → Costa Rica</span>
              <span>📅 Journey began 1968</span>
              <span>👨‍👩‍👧‍👦 7 Children</span>
            </div>
            
            {/* Every Memory Matters - Phone CTA */}
            <div className="header-phone-cta">
              <h2 className="memory-matters">EVERY MEMORY MATTERS</h2>
              <p className="phone-subtitle">From handwritten letters to voice recordings, your contributions help preserve our family heritage</p>
              
              <div className="phone-display">
                <div className="phone-methods">
                  <span>📞 Voice</span>
                  <span>💬 SMS/MMS</span>
                  <span>📠 Fax</span>
                </div>
                <a href="tel:6183767869" className="phone-number-main">
                  (618) 3-PORVOY
                </a>
                <p className="phone-instruction">Call anytime • Send photos via text • Fax documents 24/7</p>
              </div>
            </div>
            
            {/* Postmark stamp */}
            <div className="postmark">
              <span>TAMPICO</span>
              <span className="year">1968</span>
              <span>ILLINOIS</span>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav>
          <ul>
            <li><Link href="/">Home</Link></li>
            <li><Link href="/browse">Browse Archive</Link></li>
            <li><Link href="/timeline">Timeline</Link></li>
            <li><Link href="/upload">Upload</Link></li>
            <li><Link href="/write">Write Memory</Link></li>
            <li><Link href="/record">Record Story</Link></li>
          </ul>
        </nav>

        {/* Main Content */}
        {children}

        {/* Simple Footer - Consistent across all pages */}
        <footer>
          <p>© 2024 Yo Tengo Por Voy Wiki | A Family Heritage Project</p>
          <p style={{marginTop: '1rem', fontSize: '0.9rem', opacity: 0.8}}>
            Built with love to preserve the Ulrich family legacy
          </p>
        </footer>
      </body>
    </html>
  );
}
