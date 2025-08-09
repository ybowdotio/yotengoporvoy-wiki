'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { supabase } from '@/lib/supabase';

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
        let filePath = fileName;
        
        // Map content types to appropriate buckets
        if (formData.type === 'photo' || ['jpg', 'jpeg', 'png', 'gif'].includes(fileExt?.toLowerCase() || '')) {
          bucketName = 'photos';
        } else if (formData.type === 'recording' || ['mp3', 'wav', 'ogg', 'm4a'].includes(fileExt?.toLowerCase() || '')) {
          bucketName = 'audio';
        } else if (['mp4', 'mov', 'avi'].includes(fileExt?.toLowerCase() || '')) {
          bucketName = 'video';
        }

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(filePath, file);

        if (uploadError) throw uploadError;
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath);
          
        fileUrl = publicUrl;
      }

      // Insert into content_items
      const { error: dbError } = await supabase
        .from('content_items')
        .insert({
          type: formData.type,
          title: formData.title,
          description: formData.description,
          content_text: formData.content_text,
          contributor_name: formData.contributor_name,
          contributor_phone: formData.contributor_phone,
          contributor_email: formData.contributor_email,
          content_date: formData.content_date || null,
          date_is_approximate: formData.date_is_approximate,
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
      
    } catch (error: any) {
      setMessage('❌ Error: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files?.[0];
    setFile(uploaded || null);
  };

  return (
    <main className="max-w-2xl mx-auto p-6">
      <div className="paper-texture">
        <h1 className="text-3xl font-bold mb-6 typewriter">CONTRIBUTE TO THE ARCHIVE</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Content Type */}
          <div>
            <label className="block mb-2 font-bold">Type of Content</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full p-2 border-2 border-gray-300 rounded"
              required
            >
              <option value="letter">Letter</option>
              <option value="diary">Diary Entry</option>
              <option value="photo">Photograph</option>
              <option value="recording">Audio Recording</option>
              <option value="anecdote">Story/Anecdote</option>
              <option value="news_clipping">News Clipping</option>
              <option value="document">Other Document</option>
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block mb-2 font-bold">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full p-2 border-2 border-gray-300 rounded"
              placeholder="e.g., Letter from Emma Gene to her mother"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block mb-2 font-bold">Brief Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full p-2 border-2 border-gray-300 rounded h-24"
              placeholder="Provide context about this item..."
            />
          </div>

          {/* Content/Transcription */}
          <div>
            <label className="block mb-2 font-bold">
              Content/Transcription (if applicable)
            </label>
            <textarea
              name="content_text"
              value={formData.content_text}
              onChange={handleInputChange}
              className="w-full p-2 border-2 border-gray-300 rounded h-32 font-mono text-sm"
              placeholder="Type or paste the full text here..."
            />
          </div>

          {/* Date */}
          <div>
            <label className="block mb-2 font-bold">Date (when was this created?)</label>
            <input
              type="date"
              name="content_date"
              value={formData.content_date}
              onChange={handleInputChange}
              className="w-full p-2 border-2 border-gray-300 rounded"
            />
            <label className="flex items-center mt-2">
              <input
                type="checkbox"
                name="date_is_approximate"
                checked={formData.date_is_approximate}
                onChange={handleInputChange}
                className="mr-2"
              />
              This date is approximate
            </label>
          </div>

          {/* File Upload */}
          <div>
            <label className="block mb-2 font-bold">Upload File (optional)</label>
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full p-2 border-2 border-gray-300 rounded"
              accept=".jpg,.jpeg,.png,.pdf,.mp3,.wav,.doc,.docx"
            />
            <p className="text-sm text-gray-600 mt-1">
              Supported: Images, PDFs, Audio files, Word documents
            </p>
          </div>

          {/* Contributor Info */}
          <div className="border-t-2 border-gray-300 pt-4 mt-6">
            <h3 className="font-bold mb-4">Your Information (Optional)</h3>
            
            <div className="space-y-3">
              <input
                type="text"
                name="contributor_name"
                value={formData.contributor_name}
                onChange={handleInputChange}
                className="w-full p-2 border-2 border-gray-300 rounded"
                placeholder="Your name"
              />
              
              <input
                type="email"
                name="contributor_email"
                value={formData.contributor_email}
                onChange={handleInputChange}
                className="w-full p-2 border-2 border-gray-300 rounded"
                placeholder="Your email"
              />
              
              <input
                type="tel"
                name="contributor_phone"
                value={formData.contributor_phone}
                onChange={handleInputChange}
                className="w-full p-2 border-2 border-gray-300 rounded"
                placeholder="Your phone number"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn-vintage w-full"
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Submit to Archive'}
          </button>
        </form>

        {/* Message */}
        {message && (
          <div className={`mt-6 p-4 rounded ${message.includes('✅') ? 'bg-green-100' : 'bg-red-100'}`}>
            {message}
          </div>
        )}
      </div>
    </main>
  );
}
