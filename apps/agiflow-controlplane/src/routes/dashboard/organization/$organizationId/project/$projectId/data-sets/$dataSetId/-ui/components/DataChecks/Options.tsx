import {
  Button,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@agiflowai/frontend-web-ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from '@tanstack/react-router';
import { EyeOpenIcon, DotsVerticalIcon, TrashIcon } from '@radix-ui/react-icons';
import { apiClient } from '@/libs/api';
import { DataChecks } from '../../queries';

interface OptionsProps {
  check: NonNullable<DataChecks[0]>;
}
export const Options = ({ check }: OptionsProps) => {
  const queryClient = useQueryClient();
  const params = useParams({
    from: '/dashboard/organization/$organizationId/project/$projectId/data-sets/$dataSetId/',
  });
  const navigate = useNavigate({
    from: '/dashboard/organization/$organizationId/project/$projectId/data-sets/$dataSetId',
  });
  const remove = useMutation({
    mutationFn: () => {
      return apiClient.DELETE(
        '/organizations/{organizationId}/projects/{projectId}/data-sets/{dataSetId}/data-checks/{dataCheckId}',
        {
          params: {
            path: {
              ...params,
              dataCheckId: check.id,
            },
          },
        },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`data-checks-${params.dataSetId}`],
      });
      queryClient.invalidateQueries({
        queryKey: [`data-set-${params.dataSetId}`],
      });
    },
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button className='h-8 w-8 p-2' variant='ghost'>
          <DotsVerticalIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Model Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className='inline-flex w-full gap-2 p-2'
          onClick={() =>
            navigate({
              to: '/dashboard/organization/$organizationId/project/$projectId/data-sets/$dataSetId/checks/$dataCheckId',
              params: {
                dataCheckId: check.id,
              },
            })
          }
        >
          <EyeOpenIcon className='icon-md' />
          View
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => remove.mutate()} className='inline-flex w-full gap-2 p-2'>
          <TrashIcon className='icon-md' />
          Remove
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
