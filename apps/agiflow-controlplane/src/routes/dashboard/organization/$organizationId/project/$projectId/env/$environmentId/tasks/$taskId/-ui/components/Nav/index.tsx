import { Link } from '@tanstack/react-router';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@agiflowai/frontend-web-ui';

interface NavProps {
  taskId: string;
}
export const Nav = ({ taskId }: NavProps) => {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <Link
            from='/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/tasks/$taskId'
            to='/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/tasks'
          >
            <BreadcrumbLink className='underline' href='/'>
              Tasks
            </BreadcrumbLink>
          </Link>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{taskId}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
};
