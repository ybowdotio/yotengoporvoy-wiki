// app/components/Header.tsx
import Link from "next/link";

export default function Header() {
  return (
    <>
      {/* Airmail Banner */}
      <div className="airmail-banner"></div>
      
      {/* Header */}
      <header>
        <div className="header-content">
          {/* Phone Bar - Compact and integrated */}
          <div className="phone-bar">
            <span className="memory-text">EVERY MEMORY MATTERS</span>
            <span className="divider">•</span>
            <a href="tel:6183767869" className="phone-link">
              <span className="phone-icon">📞</span>
              (618) 3-PORVOY
            </a>
            <span className="divider">•</span>
            <span className="contact-methods">Call • Text • Fax</span>
          </div>

          <h1>Yo Tengo Por Voy</h1>
          <p className="tagline">&ldquo;I have to go&rdquo; - Everett&apos;s broken Spanish that touched hearts</p>
          
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
    </>
  );
}
