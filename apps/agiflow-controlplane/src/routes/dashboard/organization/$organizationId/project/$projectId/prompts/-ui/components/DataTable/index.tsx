import { withDataTable } from '@/ui/dataTable';
import { columns } from './columns';
import { Prompts } from '../../queries';

export const DataTable = withDataTable<Prompts[0]>(columns);
