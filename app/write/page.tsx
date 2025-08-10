'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

export default function WritePage() {
  const [formData, setFormData] = useState({
    type: 'anecdote',
    title: '',
    content_text: '',
    content_date: '',
    date_is_approximate: false,
    contributor_name: '',
    contributor_email: '',
    contributor_phone: '',
    location: '',
    people_mentioned: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      // Map form types to database enum values
      const typeMapping: Record<string, string> = {
        'anecdote': 'anecdote',
        'diary': 'diary_entry',
        'letter': 'letter',
        'tribute': 'document',
        'recipe': 'document',
        'poem': 'document'
      };

      const { error } = await supabase
        .from('content_items')
        .insert({
          type: typeMapping[formData.type] || formData.type,
          title: formData.title,
          content_text: formData.content_text,
          content_date: formData.content_date || null,
          date_is_approximate: formData.date_is_approximate,
          contributor_name: formData.contributor_name,
          contributor_email: formData.contributor_email,
          contributor_phone: formData.contributor_phone,
          is_public: true,
          is_sensitive: false,
          source: 'web_form',
          source_details: {
            location: formData.location,
            people_mentioned: formData.people_mentioned,
            submitted_at: new Date().toISOString()
          }
        });

      if (error) throw error;

      setMessage('✅ Thank you for sharing your memory! It has been submitted successfully.');
      
      // Reset form
      setFormData({
        type: 'anecdote',
        title: '',
        content_text: '',
        content_date: '',
        date_is_approximate: false,
        contributor_name: '',
        contributor_email: '',
        contributor_phone: '',
        location: '',
        people_mentioned: ''
      });
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error('Error submitting form:', error);
      setMessage('❌ Error: ' + errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header />

      <main className="write-container">
        <h1 style={{textAlign: 'center', marginBottom: '0.5rem'}}>Write a Memory</h1>
        <p style={{textAlign: 'center', marginBottom: '2rem', color: '#666'}}>Share your story with the family</p>
        
        <div className="writing-tips">
          <h3>✍️ Writing Tips</h3>
          <ul>
            <li>Be specific about dates and places if you remember them</li>
            <li>Include names of people involved</li>
            <li>Small details make stories come alive</li>
            <li>Don&apos;t worry about perfect grammar - authenticity matters most</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="write-form">
          <div className="form-group">
            <label>What type of content is this?</label>
            <select
              name="type"
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              required
            >
              <option value="anecdote">Story/Memory</option>
              <option value="diary">Diary Entry</option>
              <option value="letter">Letter</option>
              <option value="tribute">Tribute</option>
              <option value="recipe">Recipe</option>
              <option value="poem">Poem/Song</option>
            </select>
          </div>

          <div className="form-group">
            <label>Give your memory a title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="e.g., The Day We Arrived in Costa Rica"
              required
            />
          </div>

          <div className="form-group">
            <label>Write your memory</label>
            <textarea
              value={formData.content_text}
              onChange={(e) => setFormData({...formData, content_text: e.target.value})}
              placeholder="Tell your story here... What happened? Who was there? How did it feel?"
              rows={10}
              required
              style={{ minHeight: '200px' }}
            />
            <small>Take your time. Every detail matters.</small>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>When did this happen?</label>
              <input
                type="date"
                value={formData.content_date}
                onChange={(e) => setFormData({...formData, content_date: e.target.value})}
              />
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.date_is_approximate}
                  onChange={(e) => setFormData({...formData, date_is_approximate: e.target.checked})}
                />
                This date is approximate
              </label>
            </div>

            <div className="form-group">
              <label>Where did this happen?</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                placeholder="e.g., Tampico, Illinois"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Who was involved? (separate names with commas)</label>
            <input
              type="text"
              value={formData.people_mentioned}
              onChange={(e) => setFormData({...formData, people_mentioned: e.target.value})}
              placeholder="e.g., Everett Ulrich, Emma Gene, John Smith"
            />
          </div>

          <div className="contributor-section">
            <h3>About You (Optional)</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Your Name</label>
                <input
                  type="text"
                  value={formData.contributor_name}
                  onChange={(e) => setFormData({...formData, contributor_name: e.target.value})}
                  placeholder="Your name"
                />
              </div>

              <div className="form-group">
                <label>Your Email</label>
                <input
                  type="email"
                  value={formData.contributor_email}
                  onChange={(e) => setFormData({...formData, contributor_email: e.target.value})}
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Your Phone</label>
              <input
                type="tel"
                value={formData.contributor_phone}
                onChange={(e) => setFormData({...formData, contributor_phone: e.target.value})}
                placeholder="(555) 123-4567"
              />
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Share Your Memory'}
          </button>
        </form>

        {message && (
          <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}
      </main>

      <Footer />

      <style jsx>{`
        .write-container {
          max-width: 800px;
          margin: 2rem auto;
          padding: 0 1rem;
        }

        .writing-tips {
          background: #fff;
          border: 2px solid #3a3226;
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }

        .writing-tips h3 {
          margin-bottom: 1rem;
          color: #3a3226;
        }

        .writing-tips ul {
          list-style: none;
          padding-left: 1rem;
        }

        .writing-tips li {
          margin-bottom: 0.5rem;
          color: #666;
        }

        .writing-tips li::before {
          content: "• ";
          color: #3a3226;
          font-weight: bold;
        }

        .write-form {
          background: white;
          border: 2px solid #3a3226;
          border-radius: 8px;
          padding: 2rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: bold;
          color: #3a3226;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #ddd;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          font-size: 1rem;
        }

        .form-group textarea {
          resize: vertical;
          line-height: 1.5;
        }

        .form-group small {
          display: block;
          margin-top: 0.25rem;
          color: #999;
          font-size: 0.85rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          margin-top: 0.5rem;
          font-weight: normal;
        }

        .checkbox-label input {
          width: auto;
          margin-right: 0.5rem;
        }

        .contributor-section {
          border-top: 2px dashed #ddd;
          margin-top: 2rem;
          padding-top: 2rem;
        }

        .contributor-section h3 {
          margin-bottom: 1rem;
          color: #666;
        }

        .submit-btn {
          width: 100%;
          padding: 1rem 2rem;
          background: #3a3226;
          color: #f4f1e8;
          border: none;
          border-radius: 4px;
          font-size: 1.1rem;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .submit-btn:hover:not(:disabled) {
          background: #2c2416;
          transform: translateY(-2px);
        }

        .submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .message {
          margin-top: 2rem;
          padding: 1rem;
          border-radius: 4px;
          text-align: center;
        }

        .message.success {
          background: #d4edda;
          color: #155724;
          border: 2px solid #c3e6cb;
        }

        .message.error {
          background: #f8d7da;
          color: #721c24;
          border: 2px solid #f5c6cb;
        }

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}
