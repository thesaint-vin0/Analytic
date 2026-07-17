import { supabase } from './supabase';

const PREFIX = 'pk_live_';
const KEY_LENGTH = 32;

function randomHex(length: number): string {
  const bytes = new Uint8Array(length / 2);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  created_at: string;
  last_used: string | null;
}

export interface CreatedApiKey extends ApiKey {
  key: string;
}

export async function listApiKeys(userId: string): Promise<ApiKey[]> {
  const { data, error } = await supabase
    .from('api_keys')
    .select('id, name, key_prefix, created_at, last_used')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Failed to list API keys:', error);
    return [];
  }
  return (data as ApiKey[]) ?? [];
}

export async function createApiKey(userId: string, name: string): Promise<CreatedApiKey | null> {
  const rawKey = PREFIX + randomHex(KEY_LENGTH);
  const keyPrefix = rawKey.slice(0, 12) + '••••';
  const keyHash = await sha256(rawKey);

  const { data, error } = await supabase
    .from('api_keys')
    .insert({ user_id: userId, name, key_prefix: keyPrefix, key_hash: keyHash })
    .select('id, name, key_prefix, created_at, last_used')
    .single();

  if (error) {
    console.error('Failed to create API key:', error);
    return null;
  }

  return { ...(data as ApiKey), key: rawKey };
}

export async function revokeApiKey(id: string): Promise<boolean> {
  const { error } = await supabase.from('api_keys').delete().eq('id', id);
  if (error) {
    console.error('Failed to revoke API key:', error);
    return false;
  }
  return true;
}
