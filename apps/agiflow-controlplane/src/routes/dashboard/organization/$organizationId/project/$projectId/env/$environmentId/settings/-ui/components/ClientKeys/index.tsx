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
  ClipBoardButton,
} from '@agiflowai/frontend-web-ui';
import { PlusIcon, DotsVerticalIcon, TrashIcon } from '@radix-ui/react-icons';
import dayjs from 'dayjs';
import { ClientKeysParams, clientKeysQueryOptions } from '../../queries';

interface ClientKeysProps {
  params: ClientKeysParams['path'];
  onCreate: () => void;
  onDelete: (id: string) => void;
}
export const ClientKeys = ({ params, onCreate, onDelete }: ClientKeysProps) => {
  const { data } = useQuery(
    clientKeysQueryOptions({
      path: {
        ...params,
      },
    }),
  );

  return (
    <Table className='w-full'>
      <TableCaption>Client Keys</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Token</TableHead>
          <TableHead className='text-right'>Timestamp</TableHead>
          <TableHead className='text-right' />
        </TableRow>
      </TableHeader>
      <TableBody className='w-full'>
        {data?.data?.map(client => (
          <TableRow key={client.id}>
            <TableCell className='max-w-[400px] overflow-hidden text-wrap break-words'>
              <ClipBoardButton text={client.token || ''} variant={'ghost'} className='max-w-sm justify-between' />
            </TableCell>
            <TableCell className='text-right'>{dayjs(client.created_at).format('HH:mm:ss DD/MM')}</TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className='h-8 w-8 p-2' variant={'ghost'}>
                    <DotsVerticalIcon />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className='w-56'>
                  <DropdownMenuItem onClick={() => onDelete(client.id)}>
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
          <TableCell colSpan={1} />
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
