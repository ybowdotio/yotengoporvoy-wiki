'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
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
      const { count: letterCount } = await supabase
        .from('content_items')
        .select('*', { count: 'exact', head: true })
        .eq('type', 'letter');

      const { count: photoCount } = await supabase
        .from('content_items')
        .select('*', { count: 'exact', head: true })
        .eq('type', 'photo');

      const { count: diaryCount } = await supabase
        .from('content_items')
        .select('*', { count: 'exact', head: true })
        .eq('type', 'diary');

      const { count: recordingCount } = await supabase
        .from('content_items')
        .select('*', { count: 'exact', head: true })
        .eq('type', 'recording');

      const { count: newsCount } = await supabase
        .from('content_items')
        .select('*', { count: 'exact', head: true })
        .eq('type', 'news_clipping');

      const { count: anecdoteCount } = await supabase
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
        letters: letterCount || 0,
        photos: photoCount || 0,
        diaries: diaryCount || 0,
        recordings: recordingCount || 0,
        news: newsCount || 0,
        anecdotes: anecdoteCount || 0
      });

      setRecentItems(recent || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching content:', error);
      setLoading(false);
    }
  }

  return (
    <main>
      {/* Hero section */}
      <section className="hero-section">
        <h2>From Amish Mennonite Roots to Costa Rican Mission</h2>
        <p className="hero-quote">&ldquo;Leaving everything familiar behind to answer God&apos;s call&rdquo;</p>
        <p>In 1968, Everett and Emma Gene Ulrich made the extraordinary decision to leave their Amish Mennonite community in Tampico, Illinois, taking their seven children on a journey that would change countless lives. This is their story, and the story of all who came after.</p>
      </section>

      {/* Collections Grid with Real Data */}
      <section className="collections">
        <Link href="/browse?type=diary" className="collection-card">
          <h3>📚 Diaries & Journals</h3>
          <p>Personal accounts from the journey and early days in Costa Rica</p>
          <span className="collection-count">{loading ? '...' : `${stats.diaries} entries`}</span>
        </Link>
        
        <Link href="/browse?type=letter" className="collection-card">
          <h3>✉️ Letters Home</h3>
          <p>Correspondence between Costa Rica and Illinois</p>
          <span className="collection-count">{loading ? '...' : `${stats.letters} letters`}</span>
        </Link>
        
        <Link href="/browse?type=photo" className="collection-card">
          <h3>📸 Photography</h3>
          <p>Visual memories from 1968 to present</p>
          <span className="collection-count">{loading ? '...' : `${stats.photos} photos`}</span>
        </Link>
        
        <Link href="/browse?type=recording" className="collection-card">
          <h3>🎙️ Oral Histories</h3>
          <p>Recorded interviews and stories</p>
          <span className="collection-count">{loading ? '...' : `${stats.recordings} recordings`}</span>
        </Link>
        
        <Link href="/browse?type=news_clipping" className="collection-card">
          <h3>📰 News Clippings</h3>
          <p>Press coverage and community newsletters</p>
          <span className="collection-count">{loading ? '...' : `${stats.news} articles`}</span>
        </Link>
        
        <Link href="/browse?type=anecdote" className="collection-card">
          <h3>💭 Anecdotes</h3>
          <p>Short memories and moments</p>
          <span className="collection-count">{loading ? '...' : `${stats.anecdotes} stories`}</span>
        </Link>
      </section>

      {/* Contribute Section */}
      <section id="contribute" className="contribute-section">
        <h2>Share Your Memories</h2>
        <p>Every story matters. Whether you have photos, letters, or just a memory to share, we want to hear from you.</p>
        
        <div className="phone-number">
          📞 Call or Text: (618) 3-PORVOY
        </div>
        <p style={{color: '#666', fontSize: '0.9rem'}}>Leave a voice message, send photos via text, or fax documents anytime</p>
        
        <div className="contribute-options">
          <Link href="/upload" className="contribute-btn">
            📷 Upload Photos
          </Link>
          <Link href="/write" className="contribute-btn">
            ✍️ Write a Memory
          </Link>
          <Link href="/record" className="contribute-btn">
            🎤 Record Audio
          </Link>
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
  );
}
