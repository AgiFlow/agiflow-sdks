import { LabelledItem } from '@agiflowai/frontend-web-ui';
import { Action } from '../../queries';
import { ActionStatus } from '../../../../-ui/components/ActionStatus';
import { ReactNode } from 'react';

interface ActionCompProps {
  action: Action;
  topSlot?: ReactNode;
}

export const ActionComp = ({ action, topSlot }: ActionCompProps) => {
  return (
    <div className='grid gap-2 p-2'>
      <div className='inline-flex items-center gap-3'>
        <div className='inline-flex w-full items-center'>
          <h6 className='flex-1'>TRACE</h6>
          {topSlot}
        </div>
        {action.status.map(status => (
          <ActionStatus status={status} key={status} />
        ))}
      </div>
      <LabelledItem label={'Input'} value={action.input} />
      <LabelledItem label={'Ouput'} value={action.output} />
    </div>
  );
};
