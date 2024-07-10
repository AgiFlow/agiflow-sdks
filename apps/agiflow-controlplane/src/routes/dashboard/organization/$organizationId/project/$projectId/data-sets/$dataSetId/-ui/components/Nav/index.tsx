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
  dataSetId: string;
}
export const Nav = ({ dataSetId }: NavProps) => {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <Link
            from='/dashboard/organization/$organizationId/project/$projectId/data-sets/$dataSetId'
            to='/dashboard/organization/$organizationId/project/$projectId/data-sets'
          >
            <BreadcrumbLink className='underline' href='/'>
              Datasets
            </BreadcrumbLink>
          </Link>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{dataSetId}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
};
