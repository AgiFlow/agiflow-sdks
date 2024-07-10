import {
  Button,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
  ClipBoardButton,
} from '@agiflowai/frontend-web-ui';

interface KeyViewProps {
  title: string;
  description?: string;
  open: boolean;
  apiKey?: string;
  apiSecret?: string;
  onClose: () => void;
}
export const KeyView = ({
  title,
  description = 'Please store API secret on secured place to protect your app.',
  open,
  apiKey,
  apiSecret,
  onClose,
}: KeyViewProps) => {
  return (
    <Drawer open={open}>
      <DrawerContent>
        <div className='mx-auto w-full max-w-sm'>
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>{description}</DrawerDescription>
          </DrawerHeader>
          <div className='grid gap-3 p-4 pb-0'>
            <p className='text-sm font-bold'>API Key:</p>
            <ClipBoardButton text={apiKey || ''} variant={'ghost'} className='max-w-sm justify-between' />
            <p className='text-sm font-bold'>API Secret:</p>
            <ClipBoardButton
              text={apiSecret || ''}
              variant={'ghost'}
              className='inline-flex h-fit max-w-sm justify-between'
            />
          </div>
          <DrawerFooter>
            <DrawerClose asChild onClick={() => onClose()}>
              <Button variant='outline'>Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
