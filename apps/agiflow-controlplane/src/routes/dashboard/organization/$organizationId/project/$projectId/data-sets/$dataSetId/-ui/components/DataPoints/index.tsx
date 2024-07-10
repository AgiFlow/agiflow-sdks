import { ControlledPagination, LabelledItem, cn } from '@agiflowai/frontend-web-ui';
import { useParams, useSearch, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { getDateTime } from '@/libs/datetime';
import { useMemo } from 'react';
import z from 'zod';
import { dataPointsQueryOptions } from '../../queries';
import { EmptyMessage } from './EmptyMessage';
import { AddDataset } from './AddDataset';
import { EditPoint } from './Edit';

const SearchSchema = z.object({
  page: z.number().nullish().default(1),
  pointId: z.string().nullish(),
});

interface DataPointsProps {
  count: number;
  schema: any;
}
export const DataPoints = ({ count, schema }: DataPointsProps) => {
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
  const { data } = useQuery(
    dataPointsQueryOptions({
      path: params,
    }),
  );
  const { item, id } = useMemo(() => {
    const list = data?.data?.list || [];
    let selectedItem = list.find(item => item.id === search.pointId);
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
            <div className='inline-flex w-full items-center'>
              <h6 className='flex-1'>{item.id}</h6>
              <EditPoint point={item} />
            </div>
            <LabelledItem label='Input' value={item.input} />
            <LabelledItem label='Output' value={item.output} />
            {item?.variables
              ? Object.entries(item.variables).map(([key, value]) => (
                  <LabelledItem label={key} value={value} key={key} />
                ))
              : null}
          </div>
        ) : (
          <EmptyMessage schema={schema} />
        )}
      </div>
      <div className='col-span-4'>
        <div className='flex flex-col gap-2'>
          <div className='inline-flex items-center rounded-md bg-background-shade p-2'>
            <h6 className='flex-1'>ITEMS</h6>
            <AddDataset schema={schema} />
          </div>
          <ul className='flex w-full flex-col p-1'>
            {(data?.data?.list || []).map(item => (
              <li
                key={item.id}
                className={cn(
                  'inline-flex w-full p-3 text-xs',
                  id === item.id ? 'rounded-md border-2 border-primary' : '',
                )}
                onClick={() => {
                  navigate({
                    search: {
                      ...search,
                      pointId: item.id,
                    },
                  });
                }}
              >
                <p className='flex-1'>{item.id}</p>
                <span className='text-3xs'>{getDateTime(item.created_at)}</span>
              </li>
            ))}
          </ul>
          <ControlledPagination
            className='justify-end'
            currentPage={search.page || 1}
            totalPage={Math.ceil(count / 10)}
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
