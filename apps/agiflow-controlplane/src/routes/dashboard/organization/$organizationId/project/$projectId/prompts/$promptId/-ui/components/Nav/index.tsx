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
  promptId: string;
}
export const Nav = ({ promptId }: NavProps) => {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <Link
            from='/dashboard/organization/$organizationId/project/$projectId/prompts/$promptId'
            to='/dashboard/organization/$organizationId/project/$projectId/prompts'
          >
            <BreadcrumbLink className='underline' href='/'>
              Prompts
            </BreadcrumbLink>
          </Link>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{promptId}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
};
