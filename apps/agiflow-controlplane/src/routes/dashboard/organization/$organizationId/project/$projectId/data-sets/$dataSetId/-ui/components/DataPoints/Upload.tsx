import { useRef, useState, useMemo } from 'react';
import { Button } from '@agiflowai/frontend-web-ui';
import { useQueryClient } from '@tanstack/react-query';
import { UploadIcon, FileIcon } from '@radix-ui/react-icons';
import { fetchApi, endPoint } from '@/libs/api';
import { useParams } from '@tanstack/react-router';
import Papa from 'papaparse';

interface UploadProps {
  onClose?: () => void;
  schema?: any;
}
export const Upload = ({ onClose, schema }: UploadProps) => {
  const ref = useRef<HTMLInputElement | null>(null);
  const queryClient = useQueryClient();
  const [file, setFile] = useState<any | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const params = useParams({
    from: '/dashboard/organization/$organizationId/project/$projectId/data-sets/$dataSetId/',
  });

  const hasError = useMemo(() => {
    const schemaKeys = Object.keys(schema || {});
    if (schemaKeys.length && headers.length && headers.findIndex(x => !schemaKeys.includes(x)) > -1) {
      return `Sorry, you can not import dataset with different schema ${schemaKeys.join(', ')}`;
    }
    if ((!headers.includes('input') || !headers.includes('output')) && file) {
      return 'Sorry, please ensure you have input and output in the dataset.';
    }
    return;
  }, [file, headers, schema]);

  return (
    <form
      onSubmit={e => {
        const body = new FormData(e.target as any);
        body.append('headers', JSON.stringify(headers));
        e.preventDefault();
        fetchApi(
          `${endPoint}/organizations/${params.organizationId}/projects/${params.projectId}/data-sets/${params.dataSetId}/data-points/upload`,
          {
            method: 'POST',
            body,
            headers: {
              'Content-Type': undefined,
            } as any,
          },
        ).then(() => {
          queryClient.invalidateQueries({
            queryKey: [`data-set-${params.dataSetId}`],
          });
          queryClient.invalidateQueries({
            queryKey: [`data-points-${params.dataSetId}`],
          });
          onClose?.();
        });
      }}
      className='flex flex-col items-center gap-4'
    >
      {hasError ? <p className='text-error'>{hasError}</p> : null}
      <input
        type='file'
        name='file'
        ref={ref}
        className='hidden'
        onChange={e => {
          if (hasError) return;
          const file = e.target.files?.[0];
          setFile(file);
          Papa.parse(file, {
            preview: 2,
            skipEmptyLines: true,
            fastMode: true,
            complete: data => {
              setHeaders(data?.data?.[0] || []);
            },
          });
        }}
      />
      <Button
        onClick={e => {
          e.preventDefault();
          e.stopPropagation();
          ref?.current?.click();
        }}
        variant='outline'
        className='flex h-[108px] flex-col gap-2'
      >
        Select File
        <FileIcon className='icon-lg' />
        {ref?.current?.files?.[0]?.name}
      </Button>
      <Button>
        Upload CSV
        <UploadIcon className='ml-2 icon-md' />
      </Button>
    </form>
  );
};
