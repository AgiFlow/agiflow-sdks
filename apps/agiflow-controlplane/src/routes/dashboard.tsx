import { createFileRoute, redirect, Outlet } from '@tanstack/react-router';
import { useEffect } from 'react';
import { isAuthenticated, onAuthStateChange } from '@/libs/supabase';

export const Route = createFileRoute('/dashboard')({
  beforeLoad: async ({ location }) => {
    const isAuthed = await isAuthenticated();
    if (!isAuthed) {
      throw redirect({
        to: '/auth',
        search: {
          redirect: location.href,
        },
      });
    }
  },
  component: Dashboard,
});

function Dashboard() {
  const navigate = Route.useNavigate();

  useEffect(() => {
    const {
      data: { subscription },
    } = onAuthStateChange((_event, session) => {
      if (!session) {
        navigate({
          to: '/auth',
        });
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  return <Outlet />;
}
