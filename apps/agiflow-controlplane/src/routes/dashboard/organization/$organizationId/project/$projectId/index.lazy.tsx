import { createLazyFileRoute } from '@tanstack/react-router';
import { useParams } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { environmentsQueryOptions } from './-ui/queries';
import { NewEnvironment } from './-ui/components/NewEnvironment';
import { EnvironmentCard } from './-ui/components/EnvironmentCard';

export const Route = createLazyFileRoute('/dashboard/organization/$organizationId/project/$projectId/')({
  component: Dashboard,
});

function Dashboard() {
  const params = useParams({
    from: '/dashboard/organization/$organizationId/project/$projectId',
  });
  const { data } = useQuery(environmentsQueryOptions({ path: params }));
  return (
    <div className='w-full'>
      <div className='mb-4 flex max-w-[700px] flex-col gap-2 text-sm'>
        <h3 className='text-h5 font-bold'>Environments</h3>
        <p>
          AGIFlow's Analytics and monitoring is collected per environment (dev, test, staging, prod, etc...). User
          feedbacks are also based on environment so you can setup "Test" environment for QA, and "Staging" for business
          to streamline feedback loop.
        </p>
      </div>
      <div className='grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
        <NewEnvironment />
        {(data?.data || []).map(environment => (
          <EnvironmentCard key={environment.id} environment={environment} />
        ))}
      </div>
    </div>
  );
}
