import { createLazyFileRoute } from '@tanstack/react-router';
import { Form } from './-ui/components/Form';

export const Route = createLazyFileRoute('/dashboard/organization/$organizationId/project/$projectId/settings/')({
  component: Dashboard,
});

function Dashboard() {
  return (
    <div className='flex w-full flex-1 flex-col gap-3 md:p-4 lg:p-6'>
      <h6 className='font-bold'>Settings</h6>
      <Form />
    </div>
  );
}
