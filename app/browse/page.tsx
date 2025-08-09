function BrowseContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get('type') || 'all';
  
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('content_items')
        .select('*')
        .eq('is_public', true)  // Only show public items
        .order('content_date', { ascending: false });

      // Map URL params to database enum values
      const typeMapping: Record<string, string> = {
        'letters': 'letter',
        'diaries': 'diary_entry',
        'photos': 'photo',
        'recordings': 'audio_recording',
        'stories': 'anecdote',
        'videos': 'video',
        'news': 'news_clipping',
        'interviews': 'interview',
        'documents': 'document',
        'transcripts': 'transcript'
      };

      if (type !== 'all' && typeMapping[type]) {
        query = query.eq('type', typeMapping[type]);
      } else if (type !== 'all') {
        query = query.eq('type', type);
      }

      const { data, error } = await query;
      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const typeLabels: Record<string, string> = {
    letter: '✉️ Letters',
    diary_entry: '📚 Diaries',
    photo: '📸 Photos',
    audio_recording: '🎙️ Recordings',
    video: '📹 Videos',
    news_clipping: '📰 News',
    anecdote: '💭 Stories',
    interview: '🎤 Interviews',
    document: '📄 Documents',
    transcript: '📝 Transcripts',
    all: '📁 All Items'
  };
