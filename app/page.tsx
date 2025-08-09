'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type ContentStats = {
  letters: number;
  photos: number;
  diaries: number;
  recordings: number;
  news: number;
  anecdotes: number;
};

type RecentItem = {
  id: string;
  title: string;
  type: string;
  content_date: string;
  description: string;
  contributor_name: string;
};

export default function HomePage() {
  const [stats, setStats] = useState<ContentStats>({
    letters: 0,
    photos: 0,
    diaries: 0,
    recordings: 0,
    news: 0,
    anecdotes: 0
  });
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent();
  }, []);

  async function fetchContent() {
    try {
      // Fetch counts by type
      const { data: letterCount } = await supabase
        .from('content_items')
        .select('*', { count: 'exact', head: true })
        .eq('type', 'letter');

      const { data: photoCount } = await supabase
        .from('content_items')
        .select('*', { count: 'exact', head: true })
        .eq('type', 'photo');

      const { data: diaryCount } = await supabase
        .from('content_items')
        .select('*', { count: 'exact', head: true })
        .eq('type', 'diary');

      const { data: recordingCount } = await supabase
        .from('content_items')
        .select('*', { count: 'exact', head: true })
        .eq('type', 'recording');

      const { data: newsCount } = await supabase
        .from('content_items')
        .select('*', { count: 'exact', head: true })
        .eq('type', 'news_clipping');

      const { data: anecdoteCount } = await supabase
        .from('content_items')
        .select('*', { count: 'exact', head: true })
        .eq('type', 'anecdote');

      // Get recent items
      const { data: recent } = await supabase
        .from('content_items')
        .select('id, title, type, content_date, description, contributor_name')
        .order('created_at', { ascending: false })
        .limit(6);

      setStats({
        letters: letterCount?.count || 0,
        photos: photoCount?.count || 0,
        diaries: diaryCount?.count || 0,
        recordings: recordingCount?.count || 0,
        news: newsCount?.count || 0,
        anecdotes: anecdoteCount?.count || 0
      });

      setRecentItems(recent || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching content:', error);
      setLoading(false);
    }
  }

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
          <li><a href="/browse?type=anecdote">Stories</a></li>
          <li><a href="/browse?type=photo">Photos</a></li>
          <li><a href="/browse?type=letter">Letters</a></li>
          <li><a href="/timeline">Timeline</a></li>
          <li><a href="/browse?type=recording">Interviews</a></li>
          <li><a href="/upload">Contribute</a></li>
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

        {/* Collections Grid with Real Data */}
        <section className="collections">
          <div className="collection-card" onClick={() => window.location.href='/browse?type=diary'}>
            <h3>📚 Diaries & Journals</h3>
            <p>Personal accounts from the journey and early days in Costa Rica</p>
            <span className="collection-count">{loading ? '...' : `${stats.diaries} entries`}</span>
          </div>
          
          <div className="collection-card" onClick={() => window.location.href='/browse?type=letter'}>
            <h3>✉️ Letters Home</h3>
            <p>Correspondence between Costa Rica and Illinois</p>
            <span className="collection-count">{loading ? '...' : `${stats.letters} letters`}</span>
          </div>
          
          <div className="collection-card" onClick={() => window.location.href='/browse?type=photo'}>
            <h3>📸 Photography</h3>
            <p>Visual memories from 1968 to present</p>
            <span className="collection-count">{loading ? '...' : `${stats.photos} photos`}</span>
          </div>
          
          <div className="collection-card" onClick={() => window.location.href='/browse?type=recording'}>
            <h3>🎙️ Oral Histories</h3>
            <p>Recorded interviews and stories</p>
            <span className="collection-count">{loading ? '...' : `${stats.recordings} recordings`}</span>
          </div>
          
          <div className="collection-card" onClick={() => window.location.href='/browse?type=news_clipping'}>
            <h3>📰 News Clippings</h3>
            <p>Press coverage and community newsletters</p>
            <span className="collection-count">{loading ? '...' : `${stats.news} articles`}</span>
          </div>
          
          <div className="collection-card" onClick={() => window.location.href='/browse?type=anecdote'}>
            <h3>💭 Anecdotes</h3>
            <p>Short memories and moments</p>
            <span className="collection-count">{loading ? '...' : `${stats.anecdotes} stories`}</span>
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

        {/* Recent Additions - Real Data */}
        {recentItems.length > 0 && (
          <section className="timeline-preview">
            <h2>Recently Added</h2>
            {recentItems.map(item => (
              <div key={item.id} className="timeline-item">
                <div className="timeline-year">
                  {item.content_date ? new Date(item.content_date).getFullYear() : 'Date Unknown'}
                </div>
                <div className="timeline-content">
                  <h4>{item.title || 'Untitled'}</h4>
                  <p>{item.description || `A ${item.type} contributed by ${item.contributor_name || 'Anonymous'}`}</p>
                  <small style={{color: '#666'}}>Type: {item.type}</small>
                </div>
              </div>
            ))}
          </section>
        )}
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
