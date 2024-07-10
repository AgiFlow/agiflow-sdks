import { createLazyFileRoute } from '@tanstack/react-router';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@agiflowai/frontend-web-ui';
import { Form } from './-ui/components/Form';

export const Route = createLazyFileRoute('/dashboard/organization/$organizationId/settings/')({
  component: Dashboard,
});

function Dashboard() {
  return (
    <div className='flex w-full flex-1 flex-col gap-3'>
      <h6 className='font-bold'>Settings</h6>
      <Tabs defaultValue='profile' className='w-full max-w-[700px]'>
        <TabsList>
          <TabsTrigger value='profile'>Profile</TabsTrigger>
        </TabsList>
        <TabsContent value='profile'>
          <Form />
        </TabsContent>
      </Tabs>
    </div>
  );
}
