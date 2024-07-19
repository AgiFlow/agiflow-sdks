import {
  Button,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  Badge,
} from '@agiflowai/frontend-web-ui';
import { Link } from '@tanstack/react-router';
import { ColumnDef } from '@tanstack/react-table';
import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import dayjs from 'dayjs';
import { Action } from '../../queries';
import { ActionStatus } from '../ActionStatus';

export const columns: ColumnDef<Action>[] = [
  {
    accessorKey: 'trace_id',
    header: () => <div>Id</div>,
    cell: ({ row }) => {
      return (
        <div className='max-w-[98px] overflow-hidden text-ellipsis break-words text-right font-medium'>
          {row.getValue('trace_id')}
        </div>
      );
    },
  },
  {
    accessorKey: 'name',
    header: () => <div>Name</div>,
    cell: ({ row }) => {
      return <div className='max-[10vw] w-full min-w-[64px] break-all font-medium'>{row.getValue('name')}</div>;
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <div className='capitalize'>
        {(row.getValue('status') as number[]).map(status => (
          <ActionStatus status={status} key={status} />
        ))}
        {row.original.feedback_required ? <Badge variant='outline'>Feedback Required</Badge> : null}
      </div>
    ),
  },
  {
    accessorKey: 'input',
    header: () => <div>Input</div>,
    cell: ({ row }) => {
      return <div className='line-clamp-3 w-full min-w-[120px] max-w-[20vw] font-medium'>{row.getValue('input')}</div>;
    },
  },
  {
    accessorKey: 'output',
    header: () => <div>Ouput</div>,
    cell: ({ row }) => {
      return <div className='line-clamp-3 w-full min-w-[120px] max-w-[20vw] font-medium'>{row.getValue('output')}</div>;
    },
  },
  {
    accessorKey: 'created_at',
    header: () => <div className='text-right'>Timestamp</div>,
    cell: ({ row }) => {
      return <div className='text-right font-medium'>{dayjs(row.getValue('created_at')).format('HH:mm:ss DD/MM')}</div>;
    },
  },
  {
    accessorKey: 'app_version',
    header: () => <div className='text-right'>Version</div>,
    cell: ({ row }) => {
      return <div className='text-right font-medium'>{row.getValue('app_version')}</div>;
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const id = row.original.id;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <span className='sr-only'>Open menu</span>
              <DotsHorizontalIcon className='size-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <Link
              from='/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/logs'
              to='/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/logs/$actionId'
              params={{
                actionId: id,
              }}
            >
              <DropdownMenuItem>View Log</DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
