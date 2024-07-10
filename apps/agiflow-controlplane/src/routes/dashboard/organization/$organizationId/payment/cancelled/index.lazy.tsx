import { createLazyFileRoute } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/dashboard/organization/$organizationId/payment/cancelled/')({
  component: Dashboard,
});

function Dashboard() {
  return (
    <div className='w-full'>
      <div>
        <h6 className='mb-4 font-bold'>Environments</h6>
      </div>
      <div className='grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3' />
    </div>
  );
}
