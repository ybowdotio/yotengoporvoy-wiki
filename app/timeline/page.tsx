'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

type TimelineItem = {
  id: string;
  type: string;
  title: string;
  description: string;
  content_date: string;
  contributor_name: string;
};

export default function TimelinePage() {
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  useEffect(() => {
    fetchTimelineItems();
  }, []);

  async function fetchTimelineItems() {
    try {
      const { data, error } = await supabase
        .from('content_items')
        .select('id, type, title, description, content_date, contributor_name')
        .not('content_date', 'is', null)
        .order('content_date', { ascending: true });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching timeline:', error);
    } finally {
      setLoading(false);
    }
  }

  // Group items by year
  const itemsByYear = items.reduce((acc, item) => {
    const year = new Date(item.content_date).getFullYear();
    if (!acc[year]) acc[year] = [];
    acc[year].push(item);
    return acc;
  }, {} as Record<number, TimelineItem[]>);

  const years = Object.keys(itemsByYear).map(Number).sort();

  return (
    <>
      <Header />

      <main className="timeline-container">
        <h1 style={{textAlign: 'center', marginBottom: '2rem'}}>Family Timeline</h1>
        
        {loading ? (
          <div className="loading">Loading timeline...</div>
        ) : (
          <>
            {/* Year selector */}
            <div className="year-selector">
              <button 
                onClick={() => setSelectedYear(null)}
                className={selectedYear === null ? 'active' : ''}
              >
                All Years
              </button>
              {years.map(year => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={selectedYear === year ? 'active' : ''}
                >
                  {year}
                </button>
              ))}
            </div>

            {/* Timeline */}
            <div className="timeline">
              {years
                .filter(year => selectedYear === null || year === selectedYear)
                .map(year => (
                  <div key={year} className="year-section">
                    <h2 className="year-header">{year}</h2>
                    <div className="year-items">
                      {itemsByYear[year].map(item => (
                        <div key={item.id} className="timeline-item">
                          <div className="timeline-date">
                            {new Date(item.content_date).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                          <div className="timeline-content">
                            <h3>{item.title || 'Untitled'}</h3>
                            <p>{item.description || `A ${item.type} from this date`}</p>
                            <div className="timeline-meta">
                              <span className="type-badge">{item.type}</span>
                              {item.contributor_name && (
                                <span className="contributor">• {item.contributor_name}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </>
        )}
      </main>

      <Footer />

      <style jsx>{`
        .timeline-container {
          max-width: 1000px;
          margin: 2rem auto;
          padding: 0 1rem;
        }

        .year-selector {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          margin-bottom: 2rem;
          padding: 1rem;
          background: white;
          border: 2px solid #3a3226;
          border-radius: 8px;
        }

        .year-selector button {
          padding: 0.5rem 1rem;
          background: #f4f1e8;
          border: 1px solid #3a3226;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: 'Courier New', monospace;
        }

        .year-selector button:hover {
          background: #3a3226;
          color: #f4f1e8;
        }

        .year-selector button.active {
          background: #3a3226;
          color: #f4f1e8;
        }

        .timeline {
          position: relative;
          padding-left: 2rem;
        }

        .timeline::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background: #3a3226;
        }

        .year-section {
          margin-bottom: 3rem;
        }

        .year-header {
          font-size: 2rem;
          color: #3a3226;
          margin-bottom: 1rem;
          position: relative;
        }

        .year-header::before {
          content: '';
          position: absolute;
          left: -2.5rem;
          top: 50%;
          transform: translateY(-50%);
          width: 15px;
          height: 15px;
          background: #3a3226;
          border-radius: 50%;
          border: 3px solid #f4f1e8;
        }

        .year-items {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .timeline-item {
          display: flex;
          gap: 1rem;
          background: white;
          border: 2px solid #3a3226;
          border-radius: 8px;
          padding: 1rem;
          position: relative;
        }

        .timeline-item::before {
          content: '';
          position: absolute;
          left: -2rem;
          top: 1.5rem;
          width: 8px;
          height: 8px;
          background: #d32f2f;
          border-radius: 50%;
        }

        .timeline-date {
          min-width: 100px;
          color: #666;
          font-size: 0.9rem;
          padding-top: 0.2rem;
        }

        .timeline-content {
          flex: 1;
        }

        .timeline-content h3 {
          margin-bottom: 0.5rem;
          color: #2c2416;
        }

        .timeline-content p {
          color: #666;
          margin-bottom: 0.5rem;
        }

        .timeline-meta {
          display: flex;
          gap: 1rem;
          font-size: 0.8rem;
          color: #999;
        }

        .type-badge {
          background: #f4f1e8;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
        }

        .loading {
          text-align: center;
          padding: 3rem;
          color: #666;
        }
      `}</style>
    </>
  );
}
