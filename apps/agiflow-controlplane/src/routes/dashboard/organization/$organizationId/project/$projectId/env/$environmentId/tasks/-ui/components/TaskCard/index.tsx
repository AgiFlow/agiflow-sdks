import { paths } from '@agiflowai/controlplane-api-client';
import { Card, CardContent, Badge, Separator } from '@agiflowai/frontend-web-ui';
import { Link } from '@tanstack/react-router';
import dayjs from 'dayjs';
import { TaskStatus } from '../Status';

interface TaskCardProps {
  task: NonNullable<
    paths['/organizations/{organizationId}/projects/{projectId}/environments/{environmentId}/tasks']['get']['responses'][200]
  >['content']['application/json']['list'][0];
  showBadge?: boolean;
}
export const TaskCard = ({ task, showBadge }: TaskCardProps) => {
  if (!task) return null;
  const version = task.actions?.[0]?.app_version;
  return (
    <Link
      from='/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/tasks'
      to='/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/tasks/$taskId'
      params={{ taskId: task.id }}
    >
      <Card key={task.id}>
        <CardContent className='p-3'>
          <div className='inline-flex w-full pb-3 text-sm'>
            <div className='flex-1 gap-2'>
              <h6 className='w-full text-ellipsis break-words font-bold'>{task.name}</h6>
              <p className='text-2xs'>{task.id}</p>
            </div>
            {task.ended_at ? (
              <span className='pb-3 text-2xs'>{dayjs(task.ended_at).format('DD/MM/YY HH:mm:ss')}</span>
            ) : null}
          </div>
          {(task.actions || []).map((action, index) => (
            <div className='text-sm' key={action.id}>
              <p className='line-clamp-1'>
                <b>Request: </b>
                {action.parentSteps?.[0]?.input}
              </p>
              <p className='line-clamp-2'>
                <b>Response: </b>
                {action.parentSteps?.[0]?.output}
              </p>
              {action?.steps?.length ? (
                <div className='inline-flex w-full py-2'>
                  <label className='font-bold italic'>Feedbacks: {action?.steps?.length}</label>
                </div>
              ) : (
                <div className='inline-flex w-full py-2'>
                  <label className='font-bold italic'>No feedback</label>
                </div>
              )}
              <br />
              <p className='line-clamp-1 text-xs italic'>
                {typeof action?.steps?.[0]?.correction === 'object'
                  ? JSON.stringify(action?.steps?.[0]?.correction)
                  : (action?.steps?.[0]?.correction as string)}
              </p>
              {index !== (task.actions || []).length - 1 ? (
                <>
                  <br />
                  <Separator />
                  <br />
                </>
              ) : null}
            </div>
          ))}
          <div className='inline-flex w-full items-center'>
            <div className='inline-flex flex-1'>{showBadge ? <TaskStatus status={task.status as number} /> : null}</div>
            {version ? <Badge variant={'shade'}>App version: {version}</Badge> : null}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
