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
  dataCheckId: string;
}
export const Nav = ({ dataCheckId }: NavProps) => {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <Link
            from='/dashboard/organization/$organizationId/project/$projectId/data-sets/$dataSetId/checks/$dataCheckId'
            to='/dashboard/organization/$organizationId/project/$projectId/data-sets/$dataSetId'
          >
            <BreadcrumbLink className='underline' href='/'>
              DataSet
            </BreadcrumbLink>
          </Link>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{dataCheckId}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
};
