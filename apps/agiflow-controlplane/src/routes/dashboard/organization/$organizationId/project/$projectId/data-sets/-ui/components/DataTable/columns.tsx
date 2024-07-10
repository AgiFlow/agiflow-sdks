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
import { getDateTime } from '@/libs/datetime';
import { DataSets } from '../../queries';

export const columns: ColumnDef<DataSets[0]>[] = [
  {
    accessorKey: 'id',
    header: () => <div>Id</div>,
    cell: ({ row }) => {
      return (
        <div className='max-w-[260px] overflow-hidden text-ellipsis break-words font-medium'>{row.getValue('id')}</div>
      );
    },
  },
  {
    accessorKey: 'name',
    header: () => <div>Name</div>,
    cell: ({ row }) => {
      return <div className='w-[120px] break-all font-medium'>{row.getValue('name')}</div>;
    },
  },
  {
    accessorKey: 'run_at',
    header: () => <div>Last Run</div>,
    cell: ({ row }) => {
      const createdAt = (row.original as unknown as DataSets[0])?.latestCheck?.created_at;
      if (!createdAt) {
        return <div />;
      }
      return <div className='font-medium'>{getDateTime(createdAt)}</div>;
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
              from='/dashboard/organization/$organizationId/project/$projectId/data-sets'
              to='/dashboard/organization/$organizationId/project/$projectId/data-sets/$dataSetId'
              params={{
                dataSetId: id,
              }}
            >
              <DropdownMenuItem>View DataSet</DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
