import { supabase } from './supabase';

export async function seedNotificationsIfEmpty(userId: string) {
  const { data } = await supabase
    .from('notifications')
    .select('id')
    .eq('user_id', userId)
    .limit(1);

  if (data && data.length > 0) return;

  const notifications = [
    { user_id: userId, title: 'Welcome to Pulse Analytics', message: 'Your dashboard is ready. Connect a data source to start visualizing.', type: 'success' },
    { user_id: userId, title: 'Revenue milestone', message: 'Monthly revenue exceeded $1.2M target.', type: 'success' },
    { user_id: userId, title: 'Anomaly detected', message: 'Unusual spike in traffic from APAC region.', type: 'warning' },
    { user_id: userId, title: 'Report ready', message: 'Q3 financial report is available for download.', type: 'info' },
    { user_id: userId, title: 'New integration available', message: 'Google Sheets connector is now configured.', type: 'info' },
  ];

  await supabase.from('notifications').insert(notifications);
}
