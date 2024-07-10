import { withDataTable } from '@/ui/dataTable';
import { columns } from './columns';
import { IModels } from '../../queries';

export const DataTable = withDataTable<NonNullable<IModels[0]>>(columns);
