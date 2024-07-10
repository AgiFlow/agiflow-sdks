import { withDataTable } from '@/ui/dataTable';
import { columns } from './columns';
import { DataSets } from '../../queries';

export const DataTable = withDataTable<DataSets[0]>(columns);
