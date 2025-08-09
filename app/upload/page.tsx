'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function UploadPage() {
  const [formData, setFormData] = useState({
    type: 'letter',
    title: '',
    description: '',
    content_text: '',
    contributor_name: '',
    contributor_email: '',
    contributor_phone: '',
    content_date: '',
    date_is_approximate: false
  });
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setMessage('');

    try {
      let fileUrl = null;
      
      // Upload file if present
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${file.name}`;
        
        // Determine which bucket to use based on file type
        let bucketName = 'documents'; // default
        const filePath = fileName;
        
        // Map content types to appropriate buckets
        if (formData.type === 'photo' || ['jpg', 'jpeg', 'png', 'gif'].includes(fileExt?.toLowerCase() || '')) {
          bucketName = 'photos';
        } else if (formData.type === 'audio_recording' || ['mp3', 'wav', 'ogg', 'm4a', 'webm'].includes(fileExt?.toLowerCase() || '')) {
          bucketName = 'audio';
        } else if (formData.type === 'video' || ['mp4', 'mov', 'avi'].includes(fileExt?.toLowerCase() || '')) {
          bucketName = 'video';
        }

        const { error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(filePath, file);

        if (uploadError) throw uploadError;
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath);
          
        fileUrl = publicUrl;
      }

      // Insert into content_items with correct field names
      const { error: dbError } = await supabase
        .from('content_items')
        .insert({
          type: formData.type, // This maps to the content_type enum
          title: formData.title,
          description: formData.description,
          content_text: formData.content_text,
          contributor_name: formData.contributor_name,
          contributor_phone: formData.contributor_phone,
          contributor_email: formData.contributor_email,
          content_date: formData.content_date || null,
          date_is_approximate: formData.date_is_approximate,
          is_public: true,
          is_sensitive: false,
          source: 'web_upload',
          source_details: {
            original_file_url: fileUrl,
            uploaded_at: new Date().toISOString()
          }
        });

      if (dbError) throw dbError;

      setMessage('✅ Thank you for contributing! Your content has been uploaded successfully.');
      
      // Reset form
      setFormData({
        type: 'letter',
        title: '',
        description: '',
        content_text: '',
        contributor_name: '',
        contributor_email: '',
        contributor_phone: '',
        content_date: '',
        date_is_approximate: false
      });
      setFile(null);
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setMessage(`❌ Error: ${errorMessage}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Header />

      <main>
        <h1 style={{textAlign: 'center', marginBottom: '1rem'}}>Contribute to the Archive</h1>
        <p style={{textAlign: 'center', marginBottom: '2rem', color: '#666'}}>Share your piece of the family story</p>
        
        <form onSubmit={handleSubmit} className="upload-form">
          <div className="form-group">
            <label htmlFor="type">Type of Content</label>
            <select 
              id="type"
              name="type" 
              value={formData.type} 
              onChange={handleChange}
              required
            >
              <option value="letter">Letter</option>
              <option value="diary_entry">Diary Entry</option>
              <option value="photo">Photo</option>
              <option value="audio_recording">Audio Recording</option>
              <option value="video">Video</option>
              <option value="news_clipping">News Clipping</option>
              <option value="anecdote">Anecdote/Story</option>
              <option value="interview">Interview</option>
              <option value="document">Document</option>
              <option value="transcript">Transcript</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Letter from Emma Gene to her mother"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Brief Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Provide context about this item..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="content_text">Content/Transcription (if applicable)</label>
            <textarea
              id="content_text"
              name="content_text"
              value={formData.content_text}
              onChange={handleChange}
              rows={8}
              placeholder="Type or paste the full text here..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="content_date">Date (when was this created?)</label>
            <input
              type="date"
              id="content_date"
              name="content_date"
              value={formData.content_date}
              onChange={handleChange}
            />
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="date_is_approximate"
                checked={formData.date_is_approximate}
                onChange={handleChange}
              />
              This date is approximate
            </label>
          </div>

          <div className="form-group">
            <label htmlFor="file">Upload File (optional)</label>
            <input
              type="file"
              id="file"
              onChange={handleFileChange}
              accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.txt"
            />
            <small>Supported: Images, PDFs, Audio files, Word documents</small>
          </div>

          <fieldset>
            <legend>Your Information (Optional)</legend>
            
            <div className="form-group">
              <label htmlFor="contributor_name">Your name</label>
              <input
                type="text"
                id="contributor_name"
                name="contributor_name"
                value={formData.contributor_name}
                onChange={handleChange}
                placeholder="Your name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="contributor_email">Your email</label>
              <input
                type="email"
                id="contributor_email"
                name="contributor_email"
                value={formData.contributor_email}
                onChange={handleChange}
                placeholder="your.email@example.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="contributor_phone">Your phone number</label>
              <input
                type="tel"
                id="contributor_phone"
                name="contributor_phone"
                value={formData.contributor_phone}
                onChange={handleChange}
                placeholder="(555) 123-4567"
              />
            </div>
          </fieldset>

          <button type="submit" disabled={uploading} className="submit-button">
            {uploading ? 'Uploading...' : 'Submit to Archive'}
          </button>

          {message && (
            <div className={`message ${message.startsWith('✅') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}
        </form>

        <div className="phone-cta">
          <h3>Or Call Our Story Line</h3>
          <p className="phone-number">📞 (618) 3-PORVOY</p>
          <p>Call anytime to leave your story as a voice message</p>
        </div>
      </main>

      <Footer />
    </>
  );
}
