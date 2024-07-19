import {
  Input,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Button,
  Checkbox,
  Separator,
} from '@agiflowai/frontend-web-ui';
import { useForm, FormProvider, useController } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAtom } from 'jotai';
import { filterAtom } from '../../states';

const formSchema = z.object({
  min: z.coerce.number().nullish().default(0),
  spanNames: z.array(z.string()).default([]),
});

interface FilterProps {
  spanNames: string[];
  onClose: () => void;
}
export const Filter = ({ onClose, spanNames }: FilterProps) => {
  const [filter, setFilter] = useAtom(filterAtom);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: filter,
  });

  const { field } = useController({
    name: 'spanNames',
    control: form.control,
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setFilter(values as any);
    onClose();
  };

  return (
    <FormProvider {...form}>
      <form className='grid gap-5 pt-3' onSubmit={form.handleSubmit(onSubmit)}>
        <h6>Span filter</h6>
        <FormField
          control={form.control}
          name='min'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Show long-running span by milliseconds</FormLabel>
              <FormControl>
                <Input placeholder='Min milliseconds' {...field} value={(field.value || 0).toString()} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Separator />
        <div className='grid gap-2'>
          <FormLabel>Hide span names:</FormLabel>
          {spanNames.map(name => (
            <div className={'inline-flex w-full items-center'}>
              <p className='flex-1 text-xs'>- {name}</p>
              <Checkbox
                checked={field.value.findIndex(x => x === name) > -1}
                onCheckedChange={() => {
                  const list = [...(field.value || [])];
                  const idx = field.value.findIndex(x => x === name);
                  if (idx > -1) {
                    list.splice(idx, 1);
                    field.onChange(list);
                  } else {
                    field.onChange([...list, name]);
                  }
                }}
              />
            </div>
          ))}
        </div>
        <Button>Apply Filter</Button>
        <Button
          variant='outline'
          onClick={e => {
            e.stopPropagation();
            e.preventDefault();
            setFilter({ spanNames: [] });
            onClose();
          }}
        >
          Clear Filter
        </Button>
      </form>
    </FormProvider>
  );
};
