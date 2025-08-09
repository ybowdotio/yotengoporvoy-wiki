'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

type ContentItem = {
  id: string;
  type: string;
  title: string;
  description: string;
  content_text: string;
  content_date: string;
  contributor_name: string;
  created_at: string;
  source_details?: any;
};

function BrowseContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get('type') || 'all';
  
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('content_items')
        .select('*')
        .eq('is_public', true)  // Only show public items
        .order('content_date', { ascending: false });

      // Map URL params to database enum values
      const typeMapping: Record<string, string> = {
        'letters': 'letter',
        'diaries': 'diary_entry',
        'photos': 'photo',
        'recordings': 'audio_recording',
        'stories': 'anecdote',
        'videos': 'video',
        'news': 'news_clipping',
        'interviews': 'interview',
        'documents': 'document',
        'transcripts': 'transcript'
      };

      if (type !== 'all' && typeMapping[type]) {
        query = query.eq('type', typeMapping[type]);
      } else if (type !== 'all') {
        query = query.eq('type', type);
      }

      const { data, error } = await query;
      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const typeLabels: Record<string, string> = {
    letter: '✉️ Letters',
    diary_entry: '📚 Diaries',
    photo: '📸 Photos',
    audio_recording: '🎙️ Recordings',
    video: '📹 Videos',
    news_clipping: '📰 News',
    anecdote: '💭 Stories',
    interview: '🎤 Interviews',
    document: '📄 Documents',
    transcript: '📝 Transcripts',
    all: '📁 All Items'
  };

  return (
    <>
      <nav>
        <ul>
          <li><Link href="/">Home</Link></li>
          <li><Link href="/browse?type=all" className={type === 'all' ? 'active' : ''}>All</Link></li>
          <li><Link href="/browse?type=letters" className={type === 'letters' ? 'active' : ''}>Letters</Link></li>
          <li><Link href="/browse?type=diaries" className={type === 'diaries' ? 'active' : ''}>Diaries</Link></li>
          <li><Link href="/browse?type=photos" className={type === 'photos' ? 'active' : ''}>Photos</Link></li>
          <li><Link href="/browse?type=recordings" className={type === 'recordings' ? 'active' : ''}>Recordings</Link></li>
          <li><Link href="/browse?type=stories" className={type === 'stories' ? 'active' : ''}>Stories</Link></li>
        </ul>
      </nav>

      <main>
        <div className="browse-header">
          <h2>{typeLabels[type] || 'Browse'}</h2>
          <p>{loading ? 'Loading...' : `${items.length} items found`}</p>
        </div>

        {loading ? (
          <div className="loading">Loading content...</div>
        ) : items.length === 0 ? (
          <div className="no-items">No items found in this category.</div>
        ) : (
          <div className="content-grid">
            {items.map(item => (
              <div 
                key={item.id} 
                className="content-card"
                onClick={() => setSelectedItem(item)}
                style={{ cursor: 'pointer' }}
              >
                <div className="card-date">
                  {item.content_date ? new Date(item.content_date).toLocaleDateString() : 'Date unknown'}
                </div>
                <h3>{item.title || 'Untitled'}</h3>
                <p className="card-description">
                  {item.description || item.content_text?.substring(0, 150) || 'No description available'}
                  {(item.description?.length || item.content_text?.length || 0) > 150 && '...'}
                </p>
                <div className="card-meta">
                  <span className="card-type">{item.type?.replace(/_/g, ' ')}</span>
                  {item.contributor_name && (
                    <span className="card-contributor">By: {item.contributor_name}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal for viewing full content */}
        {selectedItem && (
          <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setSelectedItem(null)}>×</button>
              
              <h2>{selectedItem.title || 'Untitled'}</h2>
              
              <div className="modal-meta">
                <span>Type: {selectedItem.type?.replace(/_/g, ' ')}</span>
                {selectedItem.content_date && (
                  <span>Date: {new Date(selectedItem.content_date).toLocaleDateString()}</span>
                )}
                {selectedItem.contributor_name && (
                  <span>Contributor: {selectedItem.contributor_name}</span>
                )}
              </div>

              {selectedItem.description && (
                <div className="modal-section">
                  <h4>Description</h4>
                  <p>{selectedItem.description}</p>
                </div>
              )}

              {selectedItem.content_text && (
                <div className="modal-section">
                  <h4>Content</h4>
                  <p style={{ whiteSpace: 'pre-wrap' }}>{selectedItem.content_text}</p>
                </div>
              )}

              {selectedItem.type === 'audio_recording' && selectedItem.source_details?.audio_url && (
                <div className="modal-section">
                  <h4>Audio Recording</h4>
                  <audio controls style={{ width: '100%' }}>
                    <source src={selectedItem.source_details.audio_url} type="audio/webm" />
                    <source src={selectedItem.source_details.audio_url} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}

              {selectedItem.type === 'photo' && selectedItem.source_details?.original_file_url && (
                <div className="modal-section">
                  <h4>Photo</h4>
                  <img 
                    src={selectedItem.source_details.original_file_url} 
                    alt={selectedItem.title || 'Photo'} 
                    style={{ maxWidth: '100%', height: 'auto' }}
                  />
                </div>
              )}

              <div className="modal-footer">
                <small>Added: {new Date(selectedItem.created_at).toLocaleString()}</small>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

export default function BrowsePage() {
  return (
    <>
      <div className="airmail-banner"></div>
      
      <header>
        <div className="header-content">
          <h1>Archive Browser</h1>
          <p className="tagline">Explore the Ulrich Family Collection</p>
        </div>
      </header>

      <Suspense fallback={<div className="loading">Loading...</div>}>
        <BrowseContent />
      </Suspense>
    </>
  );
}
