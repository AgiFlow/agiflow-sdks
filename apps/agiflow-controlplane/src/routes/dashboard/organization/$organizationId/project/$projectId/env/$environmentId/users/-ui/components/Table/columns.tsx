import {
  Button,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@agiflowai/frontend-web-ui';
import { Link } from '@tanstack/react-router';
import { ColumnDef } from '@tanstack/react-table';
import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import dayjs from 'dayjs';
import { User } from '../../queries';

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'id',
    header: () => <div>Id</div>,
    cell: ({ row }) => {
      return <div className='break-words font-medium'>{row.getValue('id')}</div>;
    },
  },
  {
    accessorKey: 'identifiers',
    header: () => <div>Identifiers</div>,
    cell: ({ row }) => {
      return (
        <div className='font-medium'>
          {row.original.u_id ? <p>User Id: {row.original.u_id}</p> : null}
          {row.original.a_id ? <p>Alias Id: {row.original.a_id}</p> : null}
        </div>
      );
    },
  },
  {
    accessorKey: 'info',
    header: () => <div>Info</div>,
    cell: ({ row }) => {
      const meta: any = row.original.meta;
      return (
        <div className=''>
          {meta?.city ? (
            <p>
              <b>City</b>: {meta.city}
            </p>
          ) : null}
          {meta?.country ? (
            <p>
              <b>Country</b>: {meta.country}
            </p>
          ) : null}
          {meta?.['ua-platform'] ? (
            <p>
              <b>Platform</b>: {meta['ua-platform']}
            </p>
          ) : null}
        </div>
      );
    },
  },
  {
    accessorKey: 'last_visit',
    header: () => <div className='text-right'>Last Visit</div>,
    cell: ({ row }) => {
      return <div className='text-right font-medium'>{dayjs(row.getValue('last_visit')).format('HH:mm:ss DD/MM')}</div>;
    },
  },
  {
    accessorKey: 'created_at',
    header: () => <div className='text-right'>Created At</div>,
    cell: ({ row }) => {
      return <div className='text-right font-medium'>{dayjs(row.getValue('created_at')).format('HH:mm:ss DD/MM')}</div>;
    },
  },
  {
    id: 'users',
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
              from='/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/users'
              to='/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/users/$userId'
              params={{
                userId: id,
              }}
            >
              <DropdownMenuItem>View User</DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
