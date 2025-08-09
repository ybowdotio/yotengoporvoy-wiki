'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

export default function RecordPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content_date: '',
    date_is_approximate: false,
    contributor_name: '',
    contributor_email: '',
    contributor_phone: ''
  });

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [audioUrl]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setMessage('❌ Unable to access microphone. Please check your permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!audioBlob) {
      setMessage('❌ Please record audio first');
      return;
    }

    setUploading(true);
    setMessage('');

    try {
      // Upload audio file
      const fileName = `recording-${Date.now()}.webm`;
      
      // Debug: Check blob details
      console.log('Blob details:', {
        type: audioBlob.type,
        size: audioBlob.size,
        sizeInMB: (audioBlob.size / 1024 / 1024).toFixed(2)
      });
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('audio')
        .upload(fileName, audioBlob, {
          contentType: audioBlob.type || 'audio/webm',
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(uploadError.message || 'Failed to upload audio');
      }

      console.log('Upload successful:', uploadData);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('audio')
        .getPublicUrl(fileName);

      // Save to database
      const { error: dbError } = await supabase
        .from('content_items')
        .insert({
          type: 'audio_recording', // Using 'type' field with 'audio_recording' value
          title: formData.title || 'Audio Recording',
          description: formData.description,
          content_date: formData.content_date || null,
          date_is_approximate: formData.date_is_approximate,
          contributor_name: formData.contributor_name,
          contributor_email: formData.contributor_email,
          contributor_phone: formData.contributor_phone,
          is_public: true,
          is_sensitive: false,
          source: 'web_upload',
          source_details: {
            audio_url: publicUrl,
            duration: recordingTime,
            recorded_at: new Date().toISOString(),
            recording_method: 'browser_recording'
          }
        });

      if (dbError) throw dbError;

      setMessage('✅ Your recording has been uploaded successfully!');
      
      // Reset
      setAudioBlob(null);
      setAudioUrl(null);
      setRecordingTime(0);
      setFormData({
        title: '',
        description: '',
        content_date: '',
        date_is_approximate: false,
        contributor_name: '',
        contributor_email: '',
        contributor_phone: ''
      });

    } catch (error: unknown) {
      console.error('Full error:', error);
      let errorMessage = 'An unknown error occurred';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Check for specific storage errors
        if (errorMessage.includes('400') || errorMessage.includes('not found')) {
          errorMessage = 'Storage bucket "audio" may not be configured. Please check Supabase storage settings.';
        }
      }
      
      setMessage('❌ Error: ' + errorMessage);
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Header />

      <main className="record-container">
        <h1 style={{textAlign: 'center', marginBottom: '0.5rem'}}>Record Your Story</h1>
        <p style={{textAlign: 'center', marginBottom: '2rem', color: '#666'}}>Share your voice with future generations</p>
        
        <div className="recording-tips">
          <h3>🎤 Recording Tips</h3>
          <ul>
            <li>Find a quiet space with minimal background noise</li>
            <li>Speak clearly and at a comfortable pace</li>
            <li>Share names, dates, and places when you remember them</li>
            <li>Feel free to pause and gather your thoughts</li>
            <li>Maximum recording time: 10 minutes</li>
          </ul>
        </div>

        <div className="recording-interface">
          {!isRecording && !audioUrl && (
            <button onClick={startRecording} className="record-button">
              🔴 Start Recording
            </button>
          )}

          {isRecording && (
            <div className="recording-active">
              <div className="recording-indicator">
                <span className="pulse"></span>
                Recording... {formatTime(recordingTime)}
              </div>
              <button onClick={stopRecording} className="stop-button">
                ⏹️ Stop Recording
              </button>
            </div>
          )}

          {audioUrl && !isRecording && (
            <div className="playback-section">
              <h3>Review Your Recording</h3>
              <audio controls src={audioUrl} />
              <div className="recording-actions">
                <button onClick={startRecording} className="rerecord-button">
                  🔄 Record Again
                </button>
              </div>
            </div>
          )}
        </div>

        {audioUrl && (
          <form onSubmit={handleSubmit} className="record-form">
            <h3>Add Details About Your Recording</h3>
            
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Memories of the journey to Costa Rica"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                placeholder="What is this recording about?"
              />
            </div>

            <div className="form-group">
              <label htmlFor="content_date">Date (when did this happen?)</label>
              <input
                type="date"
                id="content_date"
                name="content_date"
                value={formData.content_date}
                onChange={handleInputChange}
              />
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="date_is_approximate"
                  checked={formData.date_is_approximate}
                  onChange={handleInputChange}
                />
                This date is approximate
              </label>
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
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="contributor_email">Your email</label>
                <input
                  type="email"
                  id="contributor_email"
                  name="contributor_email"
                  value={formData.contributor_email}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="contributor_phone">Your phone</label>
                <input
                  type="tel"
                  id="contributor_phone"
                  name="contributor_phone"
                  value={formData.contributor_phone}
                  onChange={handleInputChange}
                />
              </div>
            </fieldset>

            <button type="submit" disabled={uploading} className="submit-button">
              {uploading ? 'Uploading...' : 'Save Recording'}
            </button>
          </form>
        )}

        {message && (
          <div className={`message ${message.startsWith('✅') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

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
