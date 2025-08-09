'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
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
};

export default function BrowsePage() {
  const searchParams = useSearchParams();
  const type = searchParams.get('type') || 'all';
  
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);

  useEffect(() => {
    fetchItems();
  }, [type]);

  async function fetchItems() {
    setLoading(true);
    try {
      let query = supabase
        .from('content_items')
        .select('*')
        .order('content_date', { ascending: false });

      if (type !== 'all') {
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
  }

  const typeLabels: Record<string, string> = {
    letter: '✉️ Letters',
    diary: '📚 Diaries',
    photo: '📸 Photos',
    recording: '🎙️ Recordings',
    news_clipping: '📰 News',
    anecdote: '💭 Stories',
    all: '📁 All Items'
  };

  return (
    <>
      <div className="airmail-banner"></div>
      
      <header>
        <div className="header-content">
          <h1>Archive Browser</h1>
          <p className="tagline">Explore the Ulrich Family Collection</p>
        </div>
      </header>

      <nav>
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/browse?type=all" className={type === 'all' ? 'active' : ''}>All</a></li>
          <li><a href="/browse?type=letter" className={type === 'letter' ? 'active' : ''}>Letters</a></li>
          <li><a href="/browse?type=diary" className={type === 'diary' ? 'active' : ''}>Diaries</a></li>
          <li><a href="/browse?type=photo" className={type === 'photo' ? 'active' : ''}>Photos</a></li>
          <li><a href="/browse?type=recording" className={type === 'recording' ? 'active' : ''}>Recordings</a></li>
          <li><a href="/browse?type=anecdote" className={type === 'anecdote' ? 'active' : ''}>Stories</a></li>
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
          <div className="no-items">No items found in this category yet.</div>
        ) : (
          <div className="items-grid">
            {items.map(item => (
              <div 
                key={item.id} 
                className="item-card"
                onClick={() => setSelectedItem(item)}
              >
                <div className="item-date">
                  {item.content_date 
                    ? new Date(item.content_date).toLocaleDateString() 
                    : 'Date unknown'}
                </div>
                <h3>{item.title || 'Untitled'}</h3>
                <p className="item-description">
                  {item.description || item.content_text?.substring(0, 150) + '...'}
                </p>
                <div className="item-meta">
                  <span className="item-type">{item.type}</span>
                  {item.contributor_name && (
                    <span className="item-contributor">By: {item.contributor_name}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal for viewing items */}
        {selectedItem && (
          <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setSelectedItem(null)}>×</button>
              <h2>{selectedItem.title || 'Untitled'}</h2>
              <div className="modal-meta">
                <span>{selectedItem.content_date ? new Date(selectedItem.content_date).toLocaleDateString() : 'Date unknown'}</span>
                <span>{selectedItem.type}</span>
                {selectedItem.contributor_name && <span>Contributed by: {selectedItem.contributor_name}</span>}
              </div>
              {selectedItem.content_text && (
                <div className="modal-text">
                  {selectedItem.content_text.split('\n').map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <style jsx>{`
        .browse-header {
          max-width: 1200px;
          margin: 2rem auto;
          padding: 0 1rem;
        }

        .items-grid {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        .item-card {
          background: white;
          border: 2px solid #3a3226;
          border-radius: 8px;
          padding: 1.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .item-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 6px 12px rgba(0,0,0,0.1);
        }

        .item-date {
          color: #666;
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
        }

        .item-card h3 {
          margin-bottom: 0.5rem;
          color: #2c2416;
        }

        .item-description {
          color: #666;
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }

        .item-meta {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          color: #999;
        }

        .item-type {
          background: #f4f1e8;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
        }

        .loading, .no-items {
          text-align: center;
          padding: 3rem;
          color: #666;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          max-width: 800px;
          max-height: 80vh;
          overflow-y: auto;
          padding: 2rem;
          border-radius: 8px;
          position: relative;
          width: 90%;
        }

        .modal-close {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: none;
          border: none;
          font-size: 2rem;
          cursor: pointer;
          color: #666;
        }

        .modal-meta {
          display: flex;
          gap: 1rem;
          color: #666;
          font-size: 0.9rem;
          margin: 1rem 0;
          padding-bottom: 1rem;
          border-bottom: 1px solid #ddd;
        }

        .modal-text {
          margin-top: 1.5rem;
          line-height: 1.8;
          font-family: 'Courier New', monospace;
        }

        .modal-text p {
          margin-bottom: 1rem;
        }

        nav a.active {
          background: rgba(244, 241, 232, 0.2);
          font-weight: bold;
        }
      `}</style>
    </>
  );
}
