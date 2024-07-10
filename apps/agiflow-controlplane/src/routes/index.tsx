import { createFileRoute, redirect, Outlet } from '@tanstack/react-router';
import { isAuthenticated } from '@/libs/supabase';

export const Route = createFileRoute('/')({
  beforeLoad: async ({ location }) => {
    const isAuthed = await isAuthenticated();
    if (!isAuthed) {
      throw redirect({
        to: '/auth',
        search: {
          redirect: location.href,
        },
      });
    } else {
      throw redirect({
        to: '/dashboard',
        search: {
          redirect: location.href,
        },
      });
    }
  },
  component: Index,
});

function Index() {
  return (
    <div className='bg-background p-2'>
      <Outlet />
      <h3>Welcome Home!</h3>
    </div>
  );
}
