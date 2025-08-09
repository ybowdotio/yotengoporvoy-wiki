'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function RecordPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
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
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
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
      
      // First check if bucket exists and is accessible
      const { data: buckets } = await supabase.storage.listBuckets();
      console.log('Available buckets:', buckets);
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('audio')
        .upload(fileName, audioBlob, {
          contentType: 'audio/webm',
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
          type: 'recording',
          title: formData.title || 'Audio Recording',
          description: formData.description,
          content_date: formData.content_date || null,
          date_is_approximate: formData.date_is_approximate,
          contributor_name: formData.contributor_name,
          contributor_email: formData.contributor_email,
          contributor_phone: formData.contributor_phone,
          source: 'web_recording',
          source_details: {
            audio_url: publicUrl,
            duration: recordingTime,
            recorded_at: new Date().toISOString()
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
      <div className="airmail-banner"></div>
      
      <header>
        <div className="header-content">
          <h1>Record Your Story</h1>
          <p className="tagline">Share your voice with future generations</p>
        </div>
      </header>

      <nav>
        <ul>
          <li><Link href="/">Home</Link></li>
          <li><Link href="/browse">Browse</Link></li>
          <li><Link href="/timeline">Timeline</Link></li>
          <li><Link href="/upload">Upload Files</Link></li>
          <li><Link href="/write">Write</Link></li>
          <li><Link href="/record" className="active">Record</Link></li>
        </ul>
      </nav>

      <main className="record-container">
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

        <div className="recorder-section">
          <div className="recorder-controls">
            {!isRecording && !audioUrl && (
              <button onClick={startRecording} className="record-btn">
                🔴 Start Recording
              </button>
            )}
            
            {isRecording && (
              <>
                <div className="recording-indicator">
                  <span className="recording-dot"></span>
                  Recording... {formatTime(recordingTime)}
                </div>
                <button onClick={stopRecording} className="stop-btn">
                  ⏹️ Stop Recording
                </button>
              </>
            )}

            {audioUrl && !isRecording && (
              <div className="playback-section">
                <audio controls src={audioUrl} />
                <div className="playback-controls">
                  <button onClick={() => {
                    setAudioUrl(null);
                    setAudioBlob(null);
                    setRecordingTime(0);
                  }} className="rerecord-btn">
                    🔄 Record Again
                  </button>
                </div>
              </div>
            )}
          </div>

          {audioUrl && (
            <form onSubmit={handleSubmit} className="recording-form">
              <h3>Add Details to Your Recording</h3>
              
              <div className="form-group">
                <label>Title for your recording</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g., My memories of the journey to Costa Rica"
                  required
                />
              </div>

              <div className="form-group">
                <label>Brief description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="What is this recording about?"
                  rows={3}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>When is this story from?</label>
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
                    Date is approximate
                  </label>
                </div>
              </div>

              <div className="contributor-section">
                <h4>Your Information (Optional)</h4>
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
              </div>

              <button type="submit" className="submit-btn" disabled={uploading}>
                {uploading ? 'Uploading...' : '📤 Upload Recording'}
              </button>
            </form>
          )}
        </div>

        {message && (
          <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <div className="alternative-section">
          <h3>Or Call Our Story Line</h3>
          <div className="phone-number">📞 1-800-MEMORIA</div>
          <p>Call anytime to leave your story as a voice message</p>
        </div>
      </main>

      <style jsx>{`
        .record-container {
          max-width: 800px;
          margin: 2rem auto;
          padding: 0 1rem;
        }

        .recording-tips {
          background: #fff;
          border: 2px solid #3a3226;
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }

        .recording-tips h3 {
          margin-bottom: 1rem;
          color: #3a3226;
        }

        .recording-tips ul {
          list-style: none;
          padding-left: 1rem;
        }

        .recording-tips li {
          margin-bottom: 0.5rem;
          color: #666;
        }

        .recording-tips li::before {
          content: "• ";
          color: #3a3226;
          font-weight: bold;
        }

        .recorder-section {
          background: white;
          border: 2px solid #3a3226;
          border-radius: 8px;
          padding: 2rem;
          margin-bottom: 2rem;
        }

        .recorder-controls {
          text-align: center;
          padding: 2rem 0;
        }

        .record-btn, .stop-btn, .rerecord-btn {
          padding: 1rem 2rem;
          font-size: 1.2rem;
          border: none;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .record-btn {
          background: #d32f2f;
          color: white;
        }

        .record-btn:hover {
          background: #b71c1c;
          transform: scale(1.05);
        }

        .stop-btn {
          background: #666;
          color: white;
        }

        .stop-btn:hover {
          background: #444;
        }

        .rerecord-btn {
          background: #f4f1e8;
          color: #3a3226;
          border: 2px solid #3a3226;
          margin-top: 1rem;
        }

        .rerecord-btn:hover {
          background: #3a3226;
          color: #f4f1e8;
        }

        .recording-indicator {
          font-size: 1.5rem;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .recording-dot {
          width: 12px;
          height: 12px;
          background: #d32f2f;
          border-radius: 50%;
          animation: pulse 1s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .playback-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .playback-section audio {
          width: 100%;
          max-width: 400px;
        }

        .recording-form {
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 2px dashed #ddd;
        }

        .recording-form h3 {
          margin-bottom: 1.5rem;
          color: #3a3226;
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
        .form-group textarea {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #ddd;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr;
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
          margin-top: 1.5rem;
          padding-top: 1.5rem;
        }

        .contributor-section h4 {
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
          margin: 2rem 0;
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

        .alternative-section {
          background: #fff;
          border: 2px dashed #3a3226;
          border-radius: 8px;
          padding: 2rem;
          text-align: center;
        }

        .alternative-section h3 {
          margin-bottom: 1rem;
          color: #3a3226;
        }

        .phone-number {
          font-size: 2rem;
          font-weight: bold;
          color: #d32f2f;
          margin: 1rem 0;
        }

        .alternative-section p {
          color: #666;
        }

        nav a.active {
          background: rgba(244, 241, 232, 0.2);
          font-weight: bold;
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
