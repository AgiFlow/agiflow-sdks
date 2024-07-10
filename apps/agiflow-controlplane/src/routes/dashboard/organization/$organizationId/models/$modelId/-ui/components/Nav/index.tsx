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
  modelId: string;
}
export const Nav = ({ modelId }: NavProps) => {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <Link
            from='/dashboard/organization/$organizationId/models/$modelId'
            to='/dashboard/organization/$organizationId/models'
          >
            <BreadcrumbLink className='underline' href='/'>
              Models
            </BreadcrumbLink>
          </Link>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{modelId}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
};
