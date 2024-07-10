import { Calendar, Popover, PopoverContent, PopoverTrigger, Button, cn } from '@agiflowai/frontend-web-ui';
import { useSearch, useNavigate } from '@tanstack/react-router';
import { CalendarIcon } from '@radix-ui/react-icons';
import dayjs from 'dayjs';
import { SearchSchema } from '../../validations/search';
import { useState, useEffect } from 'react';

export const DatePickers = () => {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<{ from: Date; to?: Date }>({ from: new Date() });
  const navigate = useNavigate({
    from: '/dashboard/organization/$organizationId/project/$projectId/env/$environmentId',
  });
  const search = useSearch({
    from: '/dashboard/organization/$organizationId/project/$projectId/env/$environmentId',
    select: data => SearchSchema.parse(data),
  });

  useEffect(() => {
    if (open) {
      setState({
        from: new Date(search.fromDate),
        to: new Date(search.toDate),
      });
    }
    // eslint-disable-next-line
  }, [open]);

  return (
    <Popover open={open} onOpenChange={state => setOpen(state)}>
      <PopoverTrigger asChild onClick={() => setOpen(true)}>
        <Button variant={'outline'} className={cn('justify-start text-left font-normal')}>
          <CalendarIcon className='mr-2 h-4' />
          <span>
            {dayjs(search.fromDate).format('DD/MM/YYYY')} - {dayjs(search.toDate).format('DD/MM/YYYY')}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0'>
        <div className='inline-flex gap-2'>
          <div>
            <label className='px-4 text-xs font-bold'>From: {dayjs(state.from).format('DD/MM/YYYY')}</label>
            {state?.to ? (
              <label className='px-4 text-xs font-bold'>To: {dayjs(state.to).format('DD/MM/YYYY')}</label>
            ) : null}
            <Calendar
              mode='range'
              selected={state}
              onSelect={(range: any) => {
                setState(range || {});
              }}
            />
            <Button
              className='w-full'
              onClick={() => {
                navigate({
                  to: '/dashboard/organization/$organizationId/project/$projectId/env/$environmentId',
                  search: {
                    fromDate: state.from.toISOString(),
                    toDate: state.to?.toISOString(),
                  },
                });
                setOpen(false);
              }}
            >
              Submit
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
