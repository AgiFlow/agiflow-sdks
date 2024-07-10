import { createLazyFileRoute } from '@tanstack/react-router';
import { useEffect } from 'react';
import { onAuthStateChange, supabase } from '@/libs/supabase';

export const Route = createLazyFileRoute('/auth/callback')({
  component: () => Dashboard(),
});

function Dashboard() {
  const navigate = Route.useNavigate();
  const code = Route.useSearch({
    select: (q: any) => q?.code,
  });
  useEffect(() => {
    const {
      data: { subscription },
    } = onAuthStateChange((_event, session) => {
      if (session) {
        navigate({
          to: '/dashboard',
        });
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (code) {
      supabase?.auth.exchangeCodeForSession(code);
    }
  }, [code]);
  return null;
}
