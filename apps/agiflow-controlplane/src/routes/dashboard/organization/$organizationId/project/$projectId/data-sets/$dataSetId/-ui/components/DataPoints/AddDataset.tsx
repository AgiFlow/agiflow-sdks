import { Button, Sheet, SheetContent } from '@agiflowai/frontend-web-ui';
import { PlusIcon } from '@radix-ui/react-icons';
import { useState } from 'react';
import { Upload } from './Upload';

export const AddDataset = ({ schema }: { schema: any }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button className='h-8 w-8 p-2' variant='outline' onClick={() => setOpen(true)}>
        <PlusIcon />
      </Button>
      <Sheet open={open} onOpenChange={() => setOpen(false)}>
        <SheetContent>
          <div className='flex w-full flex-col gap-3'>
            <h6>Bulk upload data</h6>
            <Upload onClose={() => setOpen(false)} schema={schema} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
