import {
  Button,
  cn,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@agiflowai/frontend-web-ui';
import { useEffect, useMemo } from 'react';
import { useSearch, useParams, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { CodeIcon } from '@radix-ui/react-icons';
import { SearchSchema } from '../../validations/search';
import { appVersionsQueryOptions } from '../../queries';

interface AppVersionPickerProps {
  appVersion?: string | null;
}
export const AppVersionPicker = ({ appVersion: initialAppVersion }: AppVersionPickerProps) => {
  const navigate = useNavigate({
    from: '/dashboard/organization/$organizationId/project/$projectId/env/$environmentId',
  });
  const params = useParams({
    from: '/dashboard/organization/$organizationId/project/$projectId/env/$environmentId',
  });
  const search = useSearch({
    from: '/dashboard/organization/$organizationId/project/$projectId/env/$environmentId',
    select: data => SearchSchema.parse(data),
  });

  const { data } = useQuery(appVersionsQueryOptions({ query: search, path: params }));

  const versions = useMemo(() => {
    const list = data?.data || [];
    if (!search.appVersion) return list;
    if (list.includes(search.appVersion)) return list;
    return [search.appVersion, ...list];
  }, [search.appVersion, data]);

  useEffect(() => {
    if (!search.appVersion) {
      navigate({
        search: {
          ...search,
          appVersion: initialAppVersion,
        },
      });
    }
    // eslint-disable-next-line
  }, [initialAppVersion, search.appVersion]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={'outline'} className={cn('justify-start text-left font-normal')}>
          <CodeIcon className='mr-2 h-4' />
          <span>{search.appVersion}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-auto p-0'>
        <DropdownMenuLabel>App Version</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {versions.map(version => (
          <DropdownMenuItem
            key={version}
            onClick={() => {
              navigate({
                search: {
                  ...search,
                  appVersion: version,
                },
              });
            }}
          >
            v.{version}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
