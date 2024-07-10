import { createLazyFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/dashboard/organization/')({
  component: Dashboard,
});

function Dashboard() {
  return (
    <div className='flex size-full min-h-screen flex-col items-center justify-center'>
      <Outlet />
    </div>
  );
}
