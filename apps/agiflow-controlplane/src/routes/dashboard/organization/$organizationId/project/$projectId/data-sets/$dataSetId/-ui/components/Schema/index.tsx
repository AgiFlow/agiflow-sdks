import { LabelledItem } from '@agiflowai/frontend-web-ui';
import { DataSet } from '../../../../-ui/queries';

interface DataSetSchemaProps {
  dataset: DataSet;
}
export const DataSetSchema = ({ dataset }: DataSetSchemaProps) => {
  return (
    <div className='grid w-full grid-cols-12 gap-4'>
      <div className='col-span-8 min-h-[200px] rounded-md border-2 border-border p-3'>
        <LabelledItem label='Schema' value={dataset.schema} />
      </div>
      <div className='col-span-4' />
    </div>
  );
};
