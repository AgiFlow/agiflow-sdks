import { createLazyFileRoute, useNavigate } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Badge,
  Separator,
  LabelledItem,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
  cn,
  Button,
} from '@agiflowai/frontend-web-ui';
import { DotsVerticalIcon, EyeOpenIcon, Pencil1Icon, TrashIcon } from '@radix-ui/react-icons';
import { getDateTime } from '@/libs/datetime';
import { apiClient } from '@/libs/api';
import { modelQueryOptions, modelVersionsQueryOptions, modelVersionQueryOptions } from '../-ui/queries';
import { SearchSchema } from './-ui/validators';
import { Nav } from './-ui/components/Nav';
import { useMemo, useState } from 'react';
import { CONFIG_FIELDS, DEFAULT_LABELS } from '../-ui/constants';
import { EditModel } from './-ui/components/EditModel';
import { EditModelVersion } from './-ui/components/EditModelVersion';
import { AddModelVersion } from './-ui/components/AddModelVersion';

export const Route = createLazyFileRoute('/dashboard/organization/$organizationId/models/$modelId/')({
  component: Dashboard,
});

function Dashboard() {
  const queryClient = useQueryClient();
  const params = Route.useParams();
  const navigate = useNavigate({
    from: '/dashboard/organization/$organizationId/models/$modelId',
  });
  const [editing, setEditing] = useState(false);
  const [viewKey, setViewKey] = useState(false);
  const { data } = useQuery(modelQueryOptions({ path: params }));
  const { data: modelVersionsData } = useQuery(modelVersionsQueryOptions({ path: params }));
  const vid = Route.useSearch({
    select: s => SearchSchema.parse(s).versionId,
  });
  const versionId = useMemo(() => {
    return vid || modelVersionsData?.data?.[0]?.id;
  }, [modelVersionsData, vid]);

  const { data: modelVersionData } = useQuery({
    ...modelVersionQueryOptions({ path: { ...params, modelVersionId: versionId || '' } }),
    enabled: viewKey,
  });

  const { currentVersion, settings } = useMemo(() => {
    const version = modelVersionData?.data;
    const found = (modelVersionsData?.data || [])?.find(v => v.id === versionId);
    const currentVersion = found || modelVersionsData?.data?.[0];
    let api_key = currentVersion?.masked_key;
    if (currentVersion?.id === version?.id) {
      api_key = version?.api_key;
    }
    const settings = {
      api_key,
      api_base: currentVersion?.api_endpoint,
      api_version: currentVersion?.version,
      ...(currentVersion?.extra || {}),
    };
    return {
      currentVersion,
      settings,
    };
  }, [versionId, modelVersionsData, modelVersionData]);

  const { fields, labels, name } = useMemo(() => {
    if (!data?.data?.vendor) {
      return {
        fields: [],
        labels: DEFAULT_LABELS,
      };
    }
    const selected = CONFIG_FIELDS.find(item => item.vendor === Number(data?.data?.vendor));
    return {
      name: selected?.name,
      fields: selected?.fields || [],
      labels: selected?.labels || DEFAULT_LABELS,
    };
  }, [data?.data]);

  const removeVersion = useMutation({
    mutationFn: (modelVersionId: string) => {
      return apiClient.DELETE('/organizations/{organizationId}/models/{modelId}/model-versions/{modelVersionId}', {
        params: {
          path: {
            ...params,
            modelVersionId,
          },
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`model-versions-${params.modelId}`],
      });
    },
  });

  return (
    <div className='flex w-full flex-1 flex-col gap-3'>
      <Nav modelId={params.modelId} />
      <div className='inline-flex items-center gap-3'>
        <h4>{data?.data?.name}</h4>
        {data?.data?.id ? <EditModel model={data.data} /> : null}
      </div>
      <div className='inline-flex w-full flex-wrap gap-3'>
        <Badge variant='inverted'>{name}</Badge>
        <Badge variant='outline'>Updated at {getDateTime(data?.data?.updated_at)}</Badge>
      </div>
      <Separator />
      <div className='grid w-full grid-cols-12 gap-4'>
        <div className='col-span-8 min-h-[200px] rounded-md border-2 border-border p-3'>
          {data?.data?.id && currentVersion ? (
            <div className='inline-flex w-full pb-4'>
              <h5 className='flex-1'>{currentVersion?.version}</h5>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button className='h-8 w-8 p-2' variant='ghost'>
                    <DotsVerticalIcon />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Version Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setEditing(true)} className='inline-flex w-full gap-2 p-2'>
                    <Pencil1Icon className='icon-md' />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => removeVersion.mutate(currentVersion.id)}
                    className='inline-flex w-full gap-2 p-2'
                  >
                    <TrashIcon className='icon-md' />
                    Remove
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : null}
          {fields.map(field => {
            if (field === 'api_key') {
              return (
                <LabelledItem
                  label={labels[field]}
                  value={settings[field]}
                  key={field}
                  rightSlot={
                    <Button className='h-8 w-8 p-2' variant='ghost' onClick={() => setViewKey(true)}>
                      <EyeOpenIcon />
                    </Button>
                  }
                />
              );
            }
            return <LabelledItem label={labels[field]} value={settings[field]} key={field} />;
          })}
        </div>
        <div className='col-span-4'>
          <div className='flex flex-col gap-2'>
            <div className='inline-flex items-center rounded-md bg-background-shade p-2'>
              <h6 className='flex-1'>VERSIONS</h6>
              {data?.data?.id ? <AddModelVersion model={data.data} /> : null}
            </div>
            {(modelVersionsData?.data || []).map(version => (
              <div
                key={version.id}
                className={cn(
                  'w-full cursor-pointer rounded-md p-2 pb-2 transition-all transition-all hover:bg-background-shade',
                  versionId === version.id ? 'border-[1px] border-primary' : undefined,
                )}
                onClick={() => navigate({ search: { versionId: version.id } })}
              >
                v{version.version}
              </div>
            ))}
          </div>
        </div>
        {data?.data && editing && currentVersion ? (
          <EditModelVersion model={data.data} modelVersion={currentVersion} isOpen={editing} setOpen={setEditing} />
        ) : null}
      </div>
    </div>
  );
}
