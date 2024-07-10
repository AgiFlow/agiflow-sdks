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
import { IModels } from '../../queries';

type IModel = NonNullable<IModels[0]>;

export const columns: ColumnDef<IModel>[] = [
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
    accessorKey: 'version',
    header: () => <div>Version</div>,
    cell: ({ row }) => {
      const version = (row.original as unknown as IModel)?.latestVersion?.version;
      return <div className='font-medium'>{version}</div>;
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
              from='/dashboard/organization/$organizationId/models'
              to='/dashboard/organization/$organizationId/models/$modelId'
              params={{
                modelId: id,
              }}
            >
              <DropdownMenuItem>View Model</DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
