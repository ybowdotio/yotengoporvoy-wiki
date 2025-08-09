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
            {/* Phone Number - Prominently displayed */}
            <div className="phone-ribbon">
              <span className="phone-icon">☎</span>
              <span className="phone-text">Share Your Story:</span>
              <a href="tel:6183767869" className="phone-number-header">
                (618) 3-PORVOY
              </a>
              <span className="phone-subtitle">Call • Text • Fax</span>
            </div>
            
            <h1>Yo Tengo Por Voy</h1>
            <p className="tagline">"I have to go" - Everett's broken Spanish that touched hearts</p>
            
            <div className="journey-info">
              <span>📍 Tampico, Illinois → Costa Rica</span>
              <span>📅 Journey began 1968</span>
              <span>👨‍👩‍👧‍👦 7 Children</span>
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

        {/* Footer - Consistent across all pages */}
        <footer>
          <div className="footer-content">
            {/* Call to Action Section */}
            <div className="footer-contribute">
              <h3>Every Memory Matters</h3>
              <p>From handwritten letters to voice recordings, your contributions help preserve our family heritage</p>
              
              <div className="phone-cta-footer">
                <div className="phone-methods">
                  <div className="method">
                    <span className="method-icon">📞</span>
                    <span>Voice Call</span>
                  </div>
                  <div className="method">
                    <span className="method-icon">💬</span>
                    <span>SMS/MMS</span>
                  </div>
                  <div className="method">
                    <span className="method-icon">📠</span>
                    <span>Fax</span>
                  </div>
                </div>
                
                <a href="tel:6183767869" className="phone-number-footer">
                  <span className="phone-prefix">(618)</span>
                  <span className="phone-main">3-PORVOY</span>
                </a>
                
                <p className="phone-instruction">
                  Call anytime to share your story • Send photos via text • Fax documents 24/7
                </p>
              </div>
            </div>

            {/* Project Info */}
            <div className="footer-info">
              <div className="footer-section">
                <h4>The Journey</h4>
                <p>Everett & Emma Gene Ulrich left their Amish Mennonite community in 1968 to establish a children's home in Costa Rica, bringing hope and love to countless lives.</p>
              </div>
              
              <div className="footer-section">
                <h4>Quick Links</h4>
                <ul className="footer-links">
                  <li><Link href="/about">About This Project</Link></li>
                  <li><Link href="/family-tree">Family Tree</Link></li>
                  <li><Link href="/contact">Contact Us</Link></li>
                  <li><Link href="/help">How to Contribute</Link></li>
                </ul>
              </div>
              
              <div className="footer-section">
                <h4>Archive Stats</h4>
                <ul className="footer-stats">
                  <li>Stories Collected: <span id="story-count">Loading...</span></li>
                  <li>Photos Preserved: <span id="photo-count">Loading...</span></li>
                  <li>Contributors: <span id="contributor-count">Loading...</span></li>
                </ul>
              </div>
            </div>

            {/* Copyright */}
            <div className="footer-bottom">
              <p>© 2024 Yo Tengo Por Voy Wiki | A Family Heritage Project</p>
              <p className="footer-dedication">
                Built with love to preserve the Ulrich family legacy for future generations
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
