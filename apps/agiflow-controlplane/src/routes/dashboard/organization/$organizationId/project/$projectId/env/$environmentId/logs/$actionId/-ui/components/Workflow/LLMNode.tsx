import { LLMNode as Node, ILLMNodeProps } from '@/ui/workflow/LLMNode';
import { Button } from '@agiflowai/frontend-web-ui';
import { Pencil1Icon } from '@radix-ui/react-icons';
import { useSearch, useNavigate } from '@tanstack/react-router';
import { useSetAtom } from 'jotai';
import { workflowViewAtom } from '../../states';

export const LLMNode = (props: ILLMNodeProps) => {
  const setWorkflow = useSetAtom(workflowViewAtom);
  const navigate = useNavigate({
    from: '/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/logs/$actionId',
  });
  const stepId = useSearch({
    from: '/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/logs/$actionId/',
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
          setWorkflow(false);
        }}
      >
        <Pencil1Icon />
      </Button>
    </Node>
  );
};
