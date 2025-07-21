'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { supabase } from '@/lib/supabase'; // ✅ make sure your `supabase.ts` uses default export

export default function UploadPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [category, setCategory] = useState('letter');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleUpload = async (e: FormEvent) => {
    e.preventDefault();

    if (!firstName || !lastName || !category || !file) {
      setMessage('Please complete all fields.');
      return;
    }

    setUploading(true);
    setMessage('');

    const filename = `${Date.now()}-${file.name}`;
    const path = `${category}/${filename}`;

    const { error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(path, file);

    if (uploadError) {
      setMessage('Upload failed: ' + uploadError.message);
    } else {
      setMessage(`✅ Upload successful! File path: ${path}`);
    }

    setUploading(false);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files?.[0];
    setFile(uploaded || null);
  };

  return (
    <main className="p-6 font-mono max-w-xl mx-auto">
      <h1 className="text-2xl mb-4">📤 Upload a Letter, Diary, or Recording</h1>

      <form onSubmit={handleUpload} className="space-y-4">
        <input
          type="text"
          placeholder="First name"
          className="w-full border p-2"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />

        <input
          type="text"
          placeholder="Last name"
          className="w-full border p-2"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />

        <select
          className="w-full border p-2"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="letter">Letter</option>
          <option value="diary">Diary</option>
          <option value="recording">Recording</option>
          <option value="photo">Photo</option>
        </select>

        <input
          type="file"
          className="w-full"
          accept=".jpg,.jpeg,.png,.pdf,.mp3,.wav"
          onChange={handleFileChange}
        />

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </form>

      {message && <p className="mt-4">{message}</p>}
    </main>
  );
}
