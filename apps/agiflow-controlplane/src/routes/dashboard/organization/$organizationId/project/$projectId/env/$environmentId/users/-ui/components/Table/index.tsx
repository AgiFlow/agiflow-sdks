import { withDataTable } from '@/ui/dataTable';
import { columns } from './columns';
import { User } from '../../queries';

export const DataTable = withDataTable<User>(columns);
