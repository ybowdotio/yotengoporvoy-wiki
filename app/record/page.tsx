'use client';

import { useState, useRef, useEffect } from 'react';
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
  const [showForm, setShowForm] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState('');
  
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

  const storyPrompts = [
    "Tell us about the day you left Illinois",
    "What was your first impression of Costa Rica?",
    "Share a favorite memory of Everett or Emma Gene",
    "Describe a typical day at the children's home",
    "What traditions did the family keep from the Amish community?",
    "Tell us about a challenge that became a blessing"
  ];

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
        setShowForm(true);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 600) { // 10 minutes max
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
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

  const reRecord = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    setShowForm(false);
    setMessage('');
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
      const fileName = `recording-${Date.now()}.webm`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('audio')
        .upload(fileName, audioBlob, {
          contentType: audioBlob.type || 'audio/webm',
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw new Error(uploadError.message || 'Failed to upload audio');
      }

      const { data: { publicUrl } } = supabase.storage
        .from('audio')
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase
        .from('content_items')
        .insert({
          type: 'audio_recording',
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

      setMessage('✅ Your story has been saved and will inspire future generations!');
      
      // Reset after success
      setTimeout(() => {
        reRecord();
        setFormData({
          title: '',
          description: '',
          content_date: '',
          date_is_approximate: false,
          contributor_name: '',
          contributor_email: '',
          contributor_phone: ''
        });
      }, 3000);

    } catch (error: unknown) {
      console.error('Upload error:', error);
      setMessage('❌ Error uploading. Please try again or call (618) 3-PORVOY.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Header />

      <main style={{ maxWidth: '800px', margin: '3rem auto', padding: '0 1rem' }}>
        {/* Page Header */}
        <div className="page-header-card">
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📼 Share Your Voice</h2>
          <p style={{ color: '#666', fontSize: '1.1rem' }}>Your stories keep our family history alive</p>
        </div>

        {/* Instructions Panel */}
        <div className="instructions-panel">
          <div className="instruction-card">
            <div className="instruction-icon">🎙️</div>
            <div className="instruction-title">Find Your Space</div>
            <div className="instruction-text">Choose a quiet spot where you feel comfortable sharing your memories</div>
          </div>
          <div className="instruction-card">
            <div className="instruction-icon">⏱️</div>
            <div className="instruction-title">Take Your Time</div>
            <div className="instruction-text">Up to 10 minutes to share. Pause whenever you need to gather your thoughts</div>
          </div>
          <div className="instruction-card">
            <div className="instruction-icon">💭</div>
            <div className="instruction-title">Speak Naturally</div>
            <div className="instruction-text">Share names, dates, and places as you remember them - every detail matters</div>
          </div>
        </div>

        {/* Recording Studio */}
        <div className="recording-studio">
          <div className="status-indicator">
            <div className={`status-dot ${isRecording ? 'recording' : ''}`}></div>
            <div className="status-text">
              {isRecording ? 'Recording in Progress' : audioUrl ? 'Recording Complete' : 'Ready to Record'}
            </div>
          </div>

          <div className="recording-controls">
            {!audioUrl && (
              <button 
                onClick={isRecording ? stopRecording : startRecording}
                className={`record-button ${isRecording ? 'recording' : ''}`}
              >
                <span className="record-icon">{isRecording ? '⏹️' : '🎤'}</span>
                <span>{isRecording ? 'STOP' : 'START'}</span>
              </button>
            )}
            
            {(isRecording || audioUrl) && (
              <div className="timer-display">{formatTime(recordingTime)}</div>
            )}
          </div>

          {/* Playback Section */}
          {audioUrl && !isRecording && (
            <div className="playback-section">
              <h3>Listen to Your Recording</h3>
              <audio controls src={audioUrl} style={{ width: '100%', margin: '1rem 0' }} />
              <div className="playback-actions">
                <button onClick={reRecord} className="action-button">
                  🔄 Record Again
                </button>
                <button 
                  onClick={() => setShowForm(true)} 
                  className="action-button primary"
                  style={{ background: '#2c1810', color: '#FFFDF0' }}
                >
                  ✓ Keep This Recording
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Story Prompts */}
        {!isRecording && !audioUrl && (
          <div className="prompts-section">
            <h3>💡 Not Sure Where to Start?</h3>
            <ul className="prompt-list">
              {storyPrompts.map((prompt, index) => (
                <li 
                  key={index}
                  className={`prompt-item ${selectedPrompt === prompt ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedPrompt(prompt);
                    setFormData(prev => ({ ...prev, description: prompt }));
                  }}
                >
                  {prompt}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Details Form */}
        {showForm && audioUrl && (
          <form onSubmit={handleSubmit} className="details-form">
            <h3>Add Context to Your Recording</h3>
            
            <div className="form-group">
              <label htmlFor="title">Give Your Story a Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., First Christmas in Costa Rica"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">
                Brief Description <span className="optional-tag">(optional)</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                placeholder="What is this recording about? Who is mentioned?"
              />
            </div>

            <div className="form-group">
              <label htmlFor="content_date">
                When Did This Happen? <span className="optional-tag">(optional)</span>
              </label>
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

            <div className="form-group">
              <label htmlFor="contributor_name">
                Your Name <span className="optional-tag">(optional)</span>
              </label>
              <input
                type="text"
                id="contributor_name"
                name="contributor_name"
                value={formData.contributor_name}
                onChange={handleInputChange}
                placeholder="How you'd like to be credited"
              />
            </div>

            <button type="submit" disabled={uploading} className="submit-button">
              {uploading ? 'Saving Your Story...' : 'Save My Story'}
            </button>
          </form>
        )}

        {/* Success/Error Messages */}
        {message && (
          <div className={`message ${message.startsWith('✅') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        {/* Phone Alternative */}
        <div className="phone-alternative">
          <h3>Prefer to Call?</h3>
          <div className="phone-number-display">
            <span>📞</span>
            <span>(618) 3-PORVOY</span>
          </div>
          <p>Available 24/7 • Leave a message anytime</p>
          <div className="phone-methods">
            <span>🎤 Voice Message</span>
            <span>💬 Text Your Story</span>
            <span>📠 Fax Documents</span>
          </div>
        </div>
      </main>

      <Footer />

      <style jsx>{`
        .page-header-card {
          text-align: center;
          margin-bottom: 3rem;
          padding: 2rem;
          background: white;
          border: 2px solid #3a3226;
          border-radius: 8px;
          position: relative;
          box-shadow: 3px 3px 0 rgba(58, 50, 38, 0.1);
        }

        .instructions-panel {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .instruction-card {
          background: white;
          padding: 1.5rem;
          border-radius: 8px;
          border: 1px solid #E0D5C7;
          transition: all 0.3s ease;
        }

        .instruction-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }

        .instruction-icon {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        .instruction-title {
          font-weight: bold;
          color: #2c2416;
          margin-bottom: 0.5rem;
        }

        .instruction-text {
          color: #666;
          font-size: 0.9rem;
          line-height: 1.5;
        }

        .recording-studio {
          background: #FFFDF0;
          border: 2px solid #8B7355;
          border-radius: 12px;
          padding: 2.5rem;
          margin-bottom: 2rem;
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          position: relative;
          overflow: hidden;
        }

        .recording-studio::before {
          content: '';
          position: absolute;
          top: -50px;
          right: -50px;
          width: 150px;
          height: 150px;
          background: radial-gradient(circle, rgba(178,34,34,0.1) 0%, transparent 70%);
          border-radius: 50%;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 2rem;
          padding: 1rem;
          background: white;
          border-radius: 8px;
          border: 1px dashed #8B7355;
        }

        .status-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #4CAF50;
        }

        .status-dot.recording {
          background: #d32f2f;
          animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.2); }
        }

        .status-text {
          font-size: 1.1rem;
          color: #2c2416;
          font-weight: 500;
        }

        .recording-controls {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
          margin: 2rem 0;
        }

        .record-button {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          border: 4px solid #B22222;
          background: linear-gradient(135deg, #ff6b6b 0%, #B22222 100%);
          color: white;
          font-size: 1rem;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          box-shadow: 0 4px 12px rgba(178, 34, 34, 0.3);
        }

        .record-button:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 20px rgba(178, 34, 34, 0.4);
        }

        .record-button.recording {
          background: linear-gradient(135deg, #2c2416 0%, #3a3226 100%);
          border-color: #2c2416;
          animation: recording-animation 2s ease-in-out infinite;
        }

        @keyframes recording-animation {
          0%, 100% { box-shadow: 0 4px 12px rgba(178, 34, 34, 0.3); }
          50% { box-shadow: 0 4px 20px rgba(178, 34, 34, 0.6); }
        }

        .record-icon {
          font-size: 2rem;
        }

        .timer-display {
          font-size: 2rem;
          font-weight: bold;
          color: #2c2416;
          background: white;
          padding: 0.5rem 1.5rem;
          border-radius: 8px;
          border: 2px solid #8B7355;
          min-width: 150px;
          text-align: center;
        }

        .playback-section {
          background: white;
          padding: 1.5rem;
          border-radius: 8px;
          border: 1px solid #8B7355;
          margin-top: 2rem;
        }

        .playback-section h3 {
          margin-bottom: 1rem;
          color: #2c2416;
          text-align: center;
        }

        .playback-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-top: 1rem;
        }

        .action-button {
          padding: 0.75rem 1.5rem;
          background: #fff;
          border: 2px solid #8B7355;
          color: #2c2416;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: 'Courier New', monospace;
          font-weight: bold;
          border-radius: 4px;
        }

        .action-button:hover {
          background: #8B7355;
          color: white;
          transform: translateY(-2px);
        }

        .prompts-section {
          background: #FFF8E7;
          border: 1px dashed #8B7355;
          border-radius: 8px;
          padding: 2rem;
          margin: 2rem 0;
        }

        .prompts-section h3 {
          color: #2c2416;
          margin-bottom: 1rem;
          text-align: center;
        }

        .prompt-list {
          list-style: none;
          display: grid;
          gap: 0.75rem;
        }

        .prompt-item {
          padding: 0.75rem;
          background: white;
          border-radius: 4px;
          border-left: 4px solid #B22222;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .prompt-item:hover,
        .prompt-item.selected {
          transform: translateX(8px);
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          background: #FFFDF0;
        }

        .details-form {
          background: rgba(255, 253, 240, 0.9);
          border: 1px solid #8B7355;
          border-radius: 8px;
          padding: 2rem;
          margin: 2rem 0;
        }

        .details-form h3 {
          color: #2c2416;
          margin-bottom: 1.5rem;
        }

        .optional-tag {
          font-size: 0.8rem;
          color: #666;
          font-style: italic;
          margin-left: 0.5rem;
        }

        .phone-alternative {
          text-align: center;
          margin: 3rem 0;
          padding: 2rem;
          background: white;
          border: 2px dashed #B22222;
          border-radius: 8px;
        }

        .phone-alternative h3 {
          color: #2c1810;
          margin-bottom: 1rem;
        }

        .phone-number-display {
          font-size: 2rem;
          font-weight: bold;
          color: #B22222;
          margin: 1rem 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
        }

        .phone-methods {
          display: flex;
          justify-content: center;
          gap: 2rem;
          margin-top: 1rem;
          color: #666;
        }

        @media (max-width: 768px) {
          .instructions-panel {
            grid-template-columns: 1fr;
          }
          
          .record-button {
            width: 100px;
            height: 100px;
          }

          .phone-methods {
            flex-direction: column;
            gap: 0.5rem;
          }
        }
      `}</style>
    </>
  );
}
