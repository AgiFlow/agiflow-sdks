import { Fragment } from 'react';
import {
  Avatar,
  AvatarFallback,
  Badge,
  Separator,
  Skeleton,
  DropdownMenu,
  DropdownMenuTrigger,
  Button,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@agiflowai/frontend-web-ui';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/libs/api';
import { useParams } from '@tanstack/react-router';
import { DotsVerticalIcon, TrashIcon } from '@radix-ui/react-icons';
import { membersQueryOptions, IMember } from '../../queries';

const MemberSkeleton = () => (
  <div className='inline-flex w-full items-center gap-2 py-2'>
    <Skeleton className='h-10 w-10 rounded-full' />
    <Skeleton className='h-6 w-[64px] rounded-[16px]' />
  </div>
);

interface MemberItemProps {
  member: IMember;
}
const MemberItem = ({ member }: MemberItemProps) => {
  const params = useParams({
    from: '/dashboard/organization/$organizationId',
  });
  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: () => {
      return apiClient.DELETE('/organizations/{organizationId}/members/{memberId}', {
        params: {
          path: {
            ...params,
            memberId: member.id,
          },
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`members-${params.organizationId}`],
      });
    },
  });

  return (
    <div className='inline-flex w-full items-center gap-2 py-2'>
      <Avatar>
        <AvatarFallback name={member?.user?.user_metadata?.full_name || member?.user?.email} />
      </Avatar>
      <div className='flex-1'>
        <p className='mb-0 pb-0 text-sm font-bold'>{member?.user?.user_metadata?.full_name}</p>
        <Badge>Admin</Badge>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button className='h-8 w-8 p-2' variant='ghost'>
            <DotsVerticalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Member Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {member.isOwner ? null : (
            <DropdownMenuItem
              onClick={() => {
                deleteMutation.mutate();
              }}
              className='inline-flex w-full gap-2 p-2'
            >
              <TrashIcon className='icon-md' />
              Remove
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export const Members = () => {
  const params = useParams({
    from: '/dashboard/organization/$organizationId',
  });
  const { data, isLoading } = useQuery(membersQueryOptions({ path: params }));
  return (
    <div className='rounded-md bg-background-shade p-3'>
      {(data?.data || []).map((member, index) => (
        <Fragment key={member.id}>
          {index !== 0 ? <Separator /> : null}
          <MemberItem member={member} />
        </Fragment>
      ))}
      {isLoading ? <MemberSkeleton /> : null}
    </div>
  );
};
