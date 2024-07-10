import { createLazyFileRoute, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Badge, Separator, LabelledItem, cn } from '@agiflowai/frontend-web-ui';
import { getDateTime } from '@/libs/datetime';
import { promptQueryOptions } from '../-ui/queries';
import { SearchSchema } from './-ui/validators';
import { Nav } from './-ui/components/Nav';
import { EditPromptVersion } from './-ui/components/EditVersion';
import { AddPromptVersion } from './-ui/components/AddVersion';
import { EditPrompt } from './-ui/components/EditPrompt';

export const Route = createLazyFileRoute(
  '/dashboard/organization/$organizationId/project/$projectId/prompts/$promptId/',
)({
  component: Dashboard,
});

function Dashboard() {
  const params = Route.useParams();
  const navigate = useNavigate({
    from: '/dashboard/organization/$organizationId/project/$projectId/prompts/$promptId',
  });
  const { data } = useQuery(promptQueryOptions({ path: params }));
  const vid = Route.useSearch({
    select: s => SearchSchema.parse(s).versionId,
  });

  const versionId = useMemo(() => vid || data?.data?.versions?.[0]?.id, [data, vid]);

  const currentVersion = useMemo(() => {
    return data?.data?.versions?.find(v => v.id === versionId) || data?.data?.versions?.[0];
  }, [versionId, data]);

  return (
    <div className='flex w-full flex-1 flex-col gap-3'>
      <Nav promptId={params.promptId} />
      <div className='inline-flex items-center gap-4'>
        <h4>{data?.data?.name}</h4>
        {data?.data ? <EditPrompt prompt={data.data} /> : null}
      </div>
      <div className='inline-flex w-full flex-wrap gap-3'>
        <Badge variant='outline'>Updated at {getDateTime(data?.data?.updated_at)}</Badge>
      </div>
      <Separator />
      <div className='grid w-full grid-cols-12 gap-4'>
        <div className='col-span-8 min-h-[200px] rounded-md border-2 border-border p-3'>
          <div className='inline-flex w-full items-center gap-2'>
            <h6 className='flex-1 font-bold'>Version {currentVersion?.version}</h6>
            {currentVersion ? <EditPromptVersion key={currentVersion.id} promptVersion={currentVersion} /> : null}
          </div>
          <LabelledItem label='Prompt Template' value={currentVersion?.template} />
          {currentVersion?.system ? <LabelledItem label='System Prompt' value={currentVersion?.system} /> : null}
          {currentVersion?.schema ? <LabelledItem label='Schema' value={currentVersion?.schema} /> : null}
        </div>
        <div className='col-span-4'>
          <div className='flex flex-col gap-2'>
            <div className='inline-flex items-center rounded-md bg-background-shade p-2'>
              <h6 className='flex-1'>VERSIONS</h6>
              <AddPromptVersion />
            </div>
            {(data?.data?.versions || []).map(version => (
              <div
                key={version.id}
                className={cn(
                  'w-full cursor-pointer rounded-md p-2 pb-2 transition-all transition-all hover:bg-background-shade',
                  versionId === version.id ? 'border-[1px] border-primary' : undefined,
                )}
                onClick={() =>
                  navigate({
                    to: '/dashboard/organization/$organizationId/project/$projectId/prompts/$promptId',
                    search: { versionId: version.id },
                  })
                }
              >
                v{version.version}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
