import { createClient } from '@supabase/supabase-js';
import { config } from './config';

export const supabase = config.VITE_DEV_MODE
  ? null
  : createClient(config.VITE_SUPABASE_ENDPOINT, config.VITE_SUPABASE_ANON_KEY, {});

export const isAuthenticated = async () => {
  if (config.VITE_DEV_MODE) return true;
  if (!supabase) {
    throw new Error('Supabase is not configured');
  }
  const res = await supabase.auth.getSession();
  const isAuthed = res?.data?.session;
  return isAuthed;
};

export const onAuthStateChange = cb => {
  if (config.VITE_DEV_MODE) {
    cb(null, {
      user: {
        user_metadata: {
          full_name: 'TZ',
        },
      },
    });
    return {
      data: {
        subscription: {
          unsubscribe: () => {},
        },
      },
    };
  }
  if (!supabase) {
    throw new Error('Supabase is not configured');
  }
  return supabase.auth.onAuthStateChange(cb);
};
