import { Link } from '@tanstack/react-router';
import { Badge } from '@agiflowai/frontend-web-ui';
import { getDateTime } from '@/libs';
import { ITask } from '../../queries';
import { StatusUpdate } from '../StatusUpdate';

export const Header = ({ task }: { task: ITask }) => {
  const version = task.actions[0]?.app_version;
  return (
    <>
      <div>
        <h4 className='flex-1'>{task.name}</h4>
        <p className='text-xs'>
          {getDateTime(task.started_at || task.created_at)} {task.ended_at ? `- ${getDateTime(task.ended_at)}` : null}
        </p>
      </div>
      <div className='inline-flex w-full flex-wrap gap-3'>
        <Link
          from='/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/tasks/$taskId'
          to='/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/users/$userId'
          params={{
            userId: task.session?.user_id || '',
          }}
        >
          <Badge variant='inverted'>User: {task.session?.user_id}</Badge>
        </Link>
        <Link
          from='/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/tasks/$taskId'
          to='/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/sessions/$sessionId'
          params={{
            sessionId: task.session_id || '',
          }}
        >
          <Badge variant='inverted'>Session: {task.session_id}</Badge>
        </Link>
        <StatusUpdate status={task.status as number} />
        {version ? <Badge variant='outline'>App version: {version}</Badge> : null}
      </div>
    </>
  );
};
