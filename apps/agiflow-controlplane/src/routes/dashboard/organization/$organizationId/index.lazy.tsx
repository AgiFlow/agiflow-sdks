import { createLazyFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { projectsQueryOptions } from './-ui/queries';
import { NewProject } from './-ui/components/NewProject';
import { ProjectCard } from './-ui/components/ProjectCard';

export const Route = createLazyFileRoute('/dashboard/organization/$organizationId/')({
  component: Dashboard,
});

function Dashboard() {
  const params = Route.useParams();
  const { data } = useQuery(projectsQueryOptions({ path: params }));
  return (
    <div className='w-full'>
      <div className='mb-4 flex max-w-[700px] flex-col gap-2 text-sm'>
        <h3 className='text-h5 font-bold'>Projects</h3>
        <p>Your organisation can have multiple projects depending on your subscription plan.</p>
        <p>
          Within AGIFlow's project, you can create multiple environments (dev, test, staging, prod, etc...) for
          analytics and monitoring, as well as manage project datasets and prompts registry.
        </p>
      </div>
      <div className='grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
        <NewProject />
        {(data?.data || []).map(project => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}
