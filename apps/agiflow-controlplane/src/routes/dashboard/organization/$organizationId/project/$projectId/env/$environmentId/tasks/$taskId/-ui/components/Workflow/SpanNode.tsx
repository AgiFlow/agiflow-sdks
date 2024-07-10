import { SpanNode as Node, ISpanNodeProps } from '@/ui/workflow/SpanNode';
import { Button } from '@agiflowai/frontend-web-ui';
import { EyeOpenIcon } from '@radix-ui/react-icons';
import { useSearch, useNavigate } from '@tanstack/react-router';
import { useSetAtom } from 'jotai';
import { actionViewAtom } from '../../states/actionView';

export const SpanNode = (props: ISpanNodeProps) => {
  const setAction = useSetAtom(actionViewAtom);
  const navigate = useNavigate({
    from: '/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/tasks/$taskId',
  });
  const stepId = useSearch({
    from: '/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/tasks/$taskId/',
    select: (q: any) => q?.stepId,
  });
  const selected = props.data.id === stepId;
  return (
    <Node {...props} selected={selected}>
      <Button
        className='h-9 w-9 rounded-full p-2'
        variant={selected ? 'default' : 'outline'}
        onClick={() => {
          navigate({
            search: { stepId: props.data.id },
          });
          setAction(undefined);
        }}
      >
        <EyeOpenIcon />
      </Button>
    </Node>
  );
};
