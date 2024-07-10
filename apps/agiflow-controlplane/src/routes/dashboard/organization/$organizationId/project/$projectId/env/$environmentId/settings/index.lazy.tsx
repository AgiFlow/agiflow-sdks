import { createLazyFileRoute } from '@tanstack/react-router';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@agiflowai/frontend-web-ui';
import { ApiKeysSection } from './-ui/components/ApiKeysSection';
import { ClientKeysSection } from './-ui/components/ClientKeysSection';

export const Route = createLazyFileRoute(
  '/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/settings/',
)({
  component: Dashboard,
});

function Dashboard() {
  const params = Route.useParams();
  return (
    <div className='flex flex-1 flex-col gap-3 md:p-4 lg:p-6'>
      <h3>Settings</h3>
      <Tabs defaultValue='clientKeys' className='w-full max-w-[700px]'>
        <TabsList>
          <TabsTrigger value='clientKeys'>Client Keys</TabsTrigger>
          <TabsTrigger value='apiKeys'>API Keys</TabsTrigger>
        </TabsList>
        <TabsContent value='clientKeys'>
          <ClientKeysSection params={params} />
        </TabsContent>
        <TabsContent value='apiKeys'>
          <ApiKeysSection params={params} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
