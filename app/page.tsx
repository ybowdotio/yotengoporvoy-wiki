'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type Letter = {
  id: string;
  title: string;
  created_at: string;
  date_written: string | null;
  author_id: string | null;
};

export default function HomePage() {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLetters() {
      const { data, error } = await supabase
        .from('letters')
        .select('id, title, created_at, date_written, author_id');

      if (error) {
        setError(error.message);
      } else {
        setLetters(data as Letter[]);
      }
    }

    fetchLetters();
  }, []);

  function formatDate(dateString: string | null) {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  return (
    <main className="p-6 font-mono">
      <h1 className="text-xl mb-4">📜 Letters</h1>
      {error && <div className="text-red-500">Error: {error}</div>}
      {letters.length === 0 && !error && <p>No letters found.</p>}
      <ul className="list-disc pl-5 space-y-2">
        {letters.map((letter) => (
          <li key={letter.id}>
            <strong>{letter.title}</strong>{' '}
            <span className="text-gray-600">
              ({formatDate(letter.date_written)})
            </span>
          </li>
        ))}
      </ul>
    </main>
  );
}
