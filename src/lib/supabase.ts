import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface GalleryPhoto {
  id: string;
  title: string;
  image_url: string;
  created_at: string;
}

let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (_supabase) return _supabase;

  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      'Supabase belum dikonfigurasi. Set VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di file .env'
    );
  }

  _supabase = createClient(url, key);
  return _supabase;
}
