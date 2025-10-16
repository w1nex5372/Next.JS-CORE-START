import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

export type TelegramUserRow = {
  id: number;
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  photo_url: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export function getSupabaseClient(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_KEY;
  if (!url || !key) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_KEY environment variables.');
  }
  if (!client) {
    client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}