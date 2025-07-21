'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type Letter = {
  id: string;
  title: string;
  date?: string;
  created_at?: string;
};

export default function HomePage() {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLetters() {
      const { data, error } = await supabase
        .from<Letter>('letters')
        .select('*');

      if (error) {
        setError(error.message);
      } else {
        setLetters(data || []);
      }
    }

    fetchLetters();
  }, []);

  function formatDate(dateString?: string) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  return (
    <main className="p-6 font-mono">
      <h1 className="text-xl mb-4">📜 Letters (Test)</h1>
      {error && <div className="text-red-500">Error: {error}</div>}
      {letters.length === 0 && !error && <p>No letters found.</p>}
      <ul className="list-disc pl-5">
        {letters.map((letter) => (
          <li key={letter.id}>
            <strong>{letter.title}</strong>{' '}
            ({formatDate(letter.created_at)})
          </li>
        ))}
      </ul>
    </main>
  );
}
