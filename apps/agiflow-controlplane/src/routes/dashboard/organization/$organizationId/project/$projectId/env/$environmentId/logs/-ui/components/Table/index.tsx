import { withDataTable } from '@/ui/dataTable';
import { columns } from './columns';
import { Action } from '../../queries';

export const DataTable = withDataTable<Action>(columns);
