import { Button, cn, ControlledPagination, LabelledItem, Badge } from '@agiflowai/frontend-web-ui';
import { PlusIcon } from '@radix-ui/react-icons';
import { useParams, useSearch, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { getDateTime } from '@/libs/datetime';
import z from 'zod';
import { RunValidation } from './RunValidation';
import { DataSet } from '../../../../-ui/queries';
import { dataChecksQueryOptions } from '../../queries';
import { Options } from './Options';
import { useMemo } from 'react';

const SearchSchema = z.object({
  page: z.number().nullish().default(1),
  checkId: z.string().nullish(),
});

interface DataChecksProps {
  dataset: DataSet;
}
export const DataChecks = ({ dataset }: DataChecksProps) => {
  const params = useParams({
    from: '/dashboard/organization/$organizationId/project/$projectId/data-sets/$dataSetId/',
  });
  const navigate = useNavigate({
    from: '/dashboard/organization/$organizationId/project/$projectId/data-sets/$dataSetId',
  });
  const search = useSearch({
    from: '/dashboard/organization/$organizationId/project/$projectId/data-sets/$dataSetId/',
    select: s => SearchSchema.parse(s),
  });
  const { data } = useQuery(dataChecksQueryOptions({ path: params }));
  const { item, id } = useMemo(() => {
    const list = data?.data?.list || [];
    let selectedItem = list.find(item => item.id === search.checkId);
    if (!selectedItem) {
      selectedItem = list[0];
    }
    return {
      id: selectedItem?.id,
      item: selectedItem,
    };
  }, [data, search]);

  return (
    <div className='grid w-full grid-cols-12 gap-4'>
      <div className='col-span-8 min-h-[200px] rounded-md border-2 border-border p-3'>
        {item ? (
          <div>
            <div className='inline-flex w-full items-center gap-3'>
              <h6 className='flex-1'>{getDateTime(item.created_at)}</h6>
              <Badge variant={item.status === 1 ? 'default' : 'secondary'}>
                {item.status === 1 ? 'Running' : 'Completed'}
              </Badge>
              <Options check={item} />
            </div>
            <LabelledItem label={'Model'} value={item?.modelVersion?.model?.name} />
            <LabelledItem label={'Model Version'} value={item?.modelVersion?.version} />
            <LabelledItem label={'Prompt'} value={item?.promptVersion?.prompt?.name} />
            <LabelledItem label={'Prompt Version'} value={item?.promptVersion?.version} />
          </div>
        ) : (
          <div className='flex w-full flex-col items-center gap-3'>
            <h5>Your first validation!</h5>
            <p>Run validation on this dataset in combination with your model and prompt.</p>
            <RunValidation dataset={dataset}>
              {({ setOpen }) => <Button onClick={() => setOpen(true)}>Create first validation!</Button>}
            </RunValidation>
          </div>
        )}
      </div>
      <div className='col-span-4'>
        <div className='flex flex-col gap-2'>
          <div className='inline-flex items-center rounded-md bg-background-shade p-2'>
            <h6 className='flex-1'>RUNS</h6>
            <RunValidation dataset={dataset}>
              {({ setOpen }) => (
                <Button className='h-8 w-8 p-2' variant='outline' onClick={() => setOpen(true)}>
                  <PlusIcon />
                </Button>
              )}
            </RunValidation>
          </div>
          <ul className='flex w-full flex-col p-1'>
            {(data?.data?.list || []).map(item => (
              <li
                key={item.id}
                className={cn('w-full p-3 text-xs', id === item.id ? 'rounded-md border-2 border-primary' : '')}
                onClick={() => {
                  navigate({
                    search: {
                      ...search,
                      checkId: item.id,
                    },
                  });
                }}
              >
                <div className='inline-flex w-full'>
                  <p className='flex-1'>{item.id}</p>
                  <span className='text-3xs'>{getDateTime(item.created_at)}</span>
                </div>
                <div className='inline-flex w-full'>
                  <p className='text-2xs text-mono-light'>
                    {item.modelVersion?.model?.name} - {item.promptVersion?.prompt?.name}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <ControlledPagination
            className='justify-end'
            currentPage={search.page || 1}
            totalPage={Math.ceil(dataset.checksCount / 10) || 1}
            pageShown={3}
            onNavigate={page => {
              navigate({
                to: `/dashboard/organization/$organizationId/project/$projectId/data-sets/$dataSetId`,
                search: {
                  ...search,
                  page,
                },
                replace: true,
              });
            }}
          />
        </div>
      </div>
    </div>
  );
};
