import { useQuery } from '@tanstack/react-query';
import {
  TableFooter,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@agiflowai/frontend-web-ui';
import { PlusIcon, DotsVerticalIcon, TrashIcon, Pencil1Icon } from '@radix-ui/react-icons';
import dayjs from 'dayjs';
import { ApiKeysParams, apiKeysQueryOptions } from '../../queries';

interface ApiKeysProps {
  params: ApiKeysParams['path'];
  onCreate: () => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string) => void;
}
export const ApiKeys = ({ params, onCreate, onDelete, onUpdate }: ApiKeysProps) => {
  const { data } = useQuery(
    apiKeysQueryOptions({
      path: {
        ...params,
      },
    }),
  );

  return (
    <Table>
      <TableCaption>Api Keys</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Key</TableHead>
          <TableHead>Secret</TableHead>
          <TableHead className='text-right'>Timestamp</TableHead>
          <TableHead className='text-right' />
        </TableRow>
      </TableHeader>
      <TableBody>
        {data?.data?.map(api => (
          <TableRow key={api.id}>
            <TableCell className='max-w-[220px] text-wrap break-words'>{api.token || ''}</TableCell>
            <TableCell>{api.secret_short}*******************</TableCell>
            <TableCell className='text-right'>{dayjs(api.created_at).format('HH:mm:ss DD/MM')}</TableCell>
            <TableCell className='w-10'>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className='h-8 w-8 p-2' variant={'ghost'}>
                    <DotsVerticalIcon />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className='w-56'>
                  <DropdownMenuItem onClick={() => onUpdate(api.id)}>
                    <div className='inline-flex gap-2 p-2'>
                      <Pencil1Icon className='icon-md' />
                      Update
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDelete(api.id)}>
                    <div className='inline-flex gap-2 p-2'>
                      <TrashIcon className='icon-md' />
                      Delete
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={2} />
          <TableCell className='text-right' colSpan={2}>
            <Button variant={'outline'} onClick={() => onCreate()}>
              <PlusIcon className='mr-2 icon-md' />
              Create new key
            </Button>
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
};
