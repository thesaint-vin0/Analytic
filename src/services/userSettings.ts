import { supabase } from './supabase';

export interface UserSettings {
  user_id: string;
  session_timeout_minutes: number;
  two_factor_enabled: boolean;
  two_factor_secret: string | null;
  two_factor_backup_codes: string[] | null;
  updated_at: string;
}

export async function getUserSettings(userId: string): Promise<UserSettings | null> {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) {
    console.error('Failed to load user settings:', error);
    return null;
  }
  if (!data) {
    // Create default settings row
    const { data: created, error: insErr } = await supabase
      .from('user_settings')
      .insert({ user_id: userId })
      .select('*')
      .single();
    if (insErr) {
      console.error('Failed to create user settings:', insErr);
      return null;
    }
    return created as UserSettings;
  }
  return data as UserSettings;
}

export async function updateSessionTimeout(userId: string, minutes: number): Promise<boolean> {
  const { error } = await supabase
    .from('user_settings')
    .update({ session_timeout_minutes: minutes })
    .eq('user_id', userId);
  if (error) {
    console.error('Failed to update session timeout:', error);
    return false;
  }
  return true;
}

export async function enableTwoFactor(
  userId: string,
  secret: string,
  backupCodes: string[],
): Promise<boolean> {
  const { error } = await supabase
    .from('user_settings')
    .update({
      two_factor_enabled: true,
      two_factor_secret: secret,
      two_factor_backup_codes: backupCodes,
    })
    .eq('user_id', userId);
  if (error) {
    console.error('Failed to enable 2FA:', error);
    return false;
  }
  return true;
}

export async function disableTwoFactor(userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('user_settings')
    .update({
      two_factor_enabled: false,
      two_factor_secret: null,
      two_factor_backup_codes: null,
    })
    .eq('user_id', userId);
  if (error) {
    console.error('Failed to disable 2FA:', error);
    return false;
  }
  return true;
}
