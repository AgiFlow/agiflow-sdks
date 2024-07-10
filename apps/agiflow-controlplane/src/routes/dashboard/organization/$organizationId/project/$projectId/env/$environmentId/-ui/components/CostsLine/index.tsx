import { useMemo, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useSearch } from '@tanstack/react-router';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  Checkbox,
  buttonVariants,
  ScrollArea,
} from '@agiflowai/frontend-web-ui';
import dayjs from 'dayjs';
import baseTheme from '@agiflowai/frontend-shared-theme/configs/baseTheme.json';
import { ChevronDownIcon } from '@radix-ui/react-icons';

import { SearchSchema } from '../../validations/search';
import { costsLineQueryOptions } from '../../queries';

const colors = [
  baseTheme.colors.primary.default,
  baseTheme.colors.secondary.default,
  baseTheme.colors.primary.dark,
  baseTheme.colors.secondary.dark,
  baseTheme.colors.semantic.alert,
  baseTheme.colors.semantic.error,
  baseTheme.colors.semantic.info,
  baseTheme.colors.semantic.success,
  baseTheme.colors.primary.default,
  baseTheme.colors.secondary.default,
  baseTheme.colors.primary.dark,
  baseTheme.colors.secondary.dark,
  baseTheme.colors.semantic.alert,
  baseTheme.colors.semantic.error,
  baseTheme.colors.semantic.info,
  baseTheme.colors.semantic.success,
];

const CustomLegend = props => {
  const { payload } = props;

  return (
    <HoverCard>
      <HoverCardTrigger className='inline-flex w-full flex-row flex-wrap justify-center gap-4 pb-4 text-sm text-primary underline'>
        Legend ({payload?.length})
      </HoverCardTrigger>
      <HoverCardContent>
        <ScrollArea className='max-h-[200px] overflow-y-auto'>
          <ul className='flex w-full flex-col gap-3'>
            {payload.map((entry, index) => (
              <li className='inline-flex items-center gap-1 text-2xs' key={`item-${index}`}>
                <div style={{ backgroundColor: entry.color }} className='size-3 rounded-full' />
                <div className='flex-1'>{entry.value}</div>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </HoverCardContent>
    </HoverCard>
  );
};

export const CostsLine = () => {
  const params = useParams({
    from: '/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/',
  });
  const search = useSearch({
    from: '/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/',
    select: data => SearchSchema.parse(data),
  });
  const { data: res } = useQuery(costsLineQueryOptions({ path: params, query: search }));
  const [selected, setSelected] = useState<{ selected: boolean; selectedKeys: string[] }>({
    selected: false,
    selectedKeys: [],
  });

  const keys = useMemo(() => {
    const { group: _, ...rest } = res?.data?.[0] || ({} as any);
    const keys = Object.keys(rest);
    return keys;
  }, [Object.keys(res?.data?.[0] || {})]);

  useEffect(() => {
    const initialKeys = keys.filter(x => x.toLowerCase().includes('running cost total'));
    if (!selected?.selected && initialKeys.length) {
      setSelected({
        selected: true,
        selectedKeys: initialKeys,
      });
    }
  }, [selected?.selected, keys]);

  const { data, validKeys } = useMemo(() => {
    const toDate = dayjs(search.toDate).subtract(1, 'day');
    let walkingDay = dayjs(search.fromDate).startOf('day');
    const format = 'YYYY-MM-DD';
    const arr = [walkingDay.format(format)];
    while (walkingDay.isBefore(toDate)) {
      walkingDay = dayjs(walkingDay.toDate()).add(1, 'day');
      arr.push(walkingDay.format(format));
    }
    const list: any[] = res?.data || [];
    const validKeys = keys.filter(x => selected.selectedKeys.includes(x));
    const data = arr.map(date => {
      const idx = list.findIndex((item: any) => item.group === date);
      if (idx === -1) {
        return {
          group: date,
          ...validKeys.map(key => ({ [key]: 0 })).reduce((prev, cur) => ({ ...prev, ...cur }), {}),
        };
      } else {
        return {
          group: date,
          ...validKeys.map(key => ({ [key]: list[idx][key] })).reduce((prev, cur) => ({ ...prev, ...cur }), {}),
        };
      }
    });
    return {
      data,
      validKeys,
    };
  }, [search, res, selected, keys]);

  if (!res?.data) return null;
  return (
    <div className='size-full'>
      <div className='inline-flex w-full justify-end pb-3'>
        <HoverCard>
          <HoverCardTrigger className={buttonVariants({ variant: 'outline', size: 'sm' })}>
            Metrics
            <ChevronDownIcon className='icon-sm' />
          </HoverCardTrigger>
          <HoverCardContent>
            <ScrollArea className='max-h-[200px] overflow-y-auto'>
              <ul className='flex w-full flex-col gap-3'>
                {keys.map((entry, index) => (
                  <li className='inline-flex items-center gap-1 text-2xs' key={`item-${index}`}>
                    <Checkbox
                      checked={selected.selectedKeys.includes(entry)}
                      onCheckedChange={() => {
                        const idx = selected.selectedKeys.findIndex(x => x === entry);
                        const cp = [...selected.selectedKeys];
                        if (idx === -1) {
                          cp.push(entry);
                        } else {
                          cp.splice(idx, 1);
                        }
                        setSelected({
                          selected: true,
                          selectedKeys: cp,
                        });
                      }}
                    />
                    {entry}
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </HoverCardContent>
        </HoverCard>
      </div>
      <div className='size-full'>
        <ResponsiveContainer width='100%' height='100%'>
          <LineChart
            data={data}
            margin={{
              bottom: 64,
            }}
          >
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey='group' />
            <YAxis />
            <Tooltip />
            {validKeys.map((key, index) => (
              <Line type='monotone' key={index} dataKey={key} stroke={colors[index]} />
            ))}
            <Legend align='center' verticalAlign='bottom' content={CustomLegend} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
