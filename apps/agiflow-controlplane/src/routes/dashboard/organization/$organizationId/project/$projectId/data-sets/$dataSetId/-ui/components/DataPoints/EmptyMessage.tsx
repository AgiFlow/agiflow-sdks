import { Upload } from './Upload';

export const EmptyMessage = ({ schema }: { schema: any }) => {
  return (
    <div className='flex w-full flex-col items-center gap-4 p-4'>
      <h5>You haven't added any data yet!</h5>
      <p>Upload your dataset or add new data point from log traces and tasks.</p>
      <Upload schema={schema} />
    </div>
  );
};
