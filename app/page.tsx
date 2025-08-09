'use client';

export default function HomePage() {
  return (
    <>
      {/* Airmail banner */}
      <div className="airmail-banner"></div>

      {/* Header */}
      <header>
        <div className="header-content">
          <h1>Yo Tengo Por Voy</h1>
          <p className="tagline">&quot;I have to go&quot; - Everett&apos;s broken Spanish that touched so many hearts</p>
          <div className="journey-info">
            <span>📍 Tampico, Illinois → Costa Rica</span>
            <span>👨‍👩‍👧‍👦 Everett & Emma Gene Ulrich + 7 children</span>
            <span>✈️ Journey began 1968</span>
          </div>
        </div>
        <div className="postmark">
          <div>TAMPICO</div>
          <div className="year">1968</div>
          <div>ILLINOIS</div>
        </div>
      </header>

      {/* Navigation */}
      <nav>
        <ul>
          <li><a href="#stories">Stories</a></li>
          <li><a href="#photos">Photos</a></li>
          <li><a href="#letters">Letters</a></li>
          <li><a href="#timeline">Timeline</a></li>
          <li><a href="#interviews">Interviews</a></li>
          <li><a href="#contribute">Contribute</a></li>
        </ul>
      </nav>

      {/* Main content */}
      <main>
        {/* Hero section */}
        <section className="hero-section">
          <h2>From Amish Mennonite Roots to Costa Rican Mission</h2>
          <p className="hero-quote">&quot;Leaving everything familiar behind to answer God&apos;s call&quot;</p>
          <p>In 1968, Everett and Emma Gene Ulrich made the extraordinary decision to leave their Amish Mennonite community in Tampico, Illinois, taking their seven children on a journey that would change countless lives. This is their story, and the story of all who came after.</p>
        </section>

        {/* Collections Grid */}
        <section className="collections">
          <div className="collection-card">
            <h3>📚 Diaries & Journals</h3>
            <p>Personal accounts from the journey and early days in Costa Rica</p>
            <span className="collection-count">23 entries</span>
          </div>
          
          <div className="collection-card">
            <h3>✉️ Letters Home</h3>
            <p>Correspondence between Costa Rica and Illinois</p>
            <span className="collection-count">147 letters</span>
          </div>
          
          <div className="collection-card">
            <h3>📸 Photography</h3>
            <p>Visual memories from 1968 to present</p>
            <span className="collection-count">892 photos</span>
          </div>
          
          <div className="collection-card">
            <h3>🎙️ Oral Histories</h3>
            <p>Recorded interviews and stories</p>
            <span className="collection-count">34 recordings</span>
          </div>
          
          <div className="collection-card">
            <h3>📰 News Clippings</h3>
            <p>Press coverage and community newsletters</p>
            <span className="collection-count">56 articles</span>
          </div>
          
          <div className="collection-card">
            <h3>💭 Anecdotes</h3>
            <p>Short memories and moments</p>
            <span className="collection-count">108 stories</span>
          </div>
        </section>

        {/* Contribute Section */}
        <section id="contribute" className="contribute-section">
          <h2>Share Your Memories</h2>
          <p>Every story matters. Whether you have photos, letters, or just a memory to share, we want to hear from you.</p>
          
          <div className="phone-number">
            📞 Call or Text: 1-800-MEMORIA
          </div>
          <p style={{color: '#666', fontSize: '0.9rem'}}>Leave a voice message with your story anytime</p>
          
          <div className="contribute-options">
            <a href="/upload" className="contribute-btn">
              📷 Upload Photos
            </a>
            <a href="/write" className="contribute-btn">
              ✍️ Write a Memory
            </a>
            <a href="/record" className="contribute-btn">
              🎤 Record Audio
            </a>
          </div>
        </section>

        {/* Timeline Preview */}
        <section className="timeline-preview">
          <h2>Journey Milestones</h2>
          
          <div className="timeline-item">
            <div className="timeline-year">1968</div>
            <div className="timeline-content">
              <h4>The Decision</h4>
              <p>Everett and Emma Gene feel called to serve at the children&apos;s home in Costa Rica</p>
            </div>
          </div>
          
          <div className="timeline-item">
            <div className="timeline-year">1968</div>
            <div className="timeline-content">
              <h4>Departure from Tampico</h4>
              <p>The family of nine leaves the Amish Mennonite community</p>
            </div>
          </div>
          
          <div className="timeline-item">
            <div className="timeline-year">1969</div>
            <div className="timeline-content">
              <h4>First Year at the Children&apos;s Home</h4>
              <p>Establishing new routines and building relationships</p>
            </div>
          </div>
          
          <div className="timeline-item">
            <div className="timeline-year">Today</div>
            <div className="timeline-content">
              <h4>Living Legacy</h4>
              <p>Generations continue the mission of service and faith</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer>
        <p>© 2024 Yo Tengo Por Voy Wiki | A Family Heritage Project</p>
        <p style={{marginTop: '1rem', fontSize: '0.9rem', opacity: 0.8}}>
          Built with love to preserve the Ulrich family legacy
        </p>
      </footer>
    </>
  );
}
