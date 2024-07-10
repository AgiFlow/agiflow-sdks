import { useMemo } from 'react';
import { redirect, createFileRoute, useParams, Outlet, Link } from '@tanstack/react-router';
import { isAuthenticated } from '@/libs/supabase';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  Avatar,
  AvatarFallback,
  Button,
  Badge,
} from '@agiflowai/frontend-web-ui';
import { QuestionMarkIcon } from '@radix-ui/react-icons';
import { config } from '@/libs/config';
import { useQuery } from '@tanstack/react-query';
import { orgsQueryOptions } from '@/routes/dashboard/-ui/queries';
import { isHobby } from '@/constants/pricing';

import { UserMenu } from './-ui/components/UserMenu';

export const Route = createFileRoute('/dashboard/organization')({
  beforeLoad: async ({ location }) => {
    const isAuthed = await isAuthenticated();
    if (!isAuthed) {
      throw redirect({
        to: '/',
        search: {
          redirect: location.href,
        },
      });
    }
  },
  component: Dashboard,
});

function Dashboard() {
  const { data } = useQuery(orgsQueryOptions);
  const params = useParams({
    select: (params: { organizationId?: string; projectId?: string; environmentId?: string }) => ({
      organizationId: params?.organizationId,
      projectId: params?.projectId,
      environmentId: params?.environmentId,
    }),
    strict: false,
  });

  const { org, project, env } = useMemo(() => {
    const org = data?.data?.find(o => o.id === params.organizationId);
    const project = org?.projects?.find(p => p.id === params.projectId);
    const env = project?.environments?.find(p => p.id === params.environmentId);
    return {
      org,
      project,
      env,
    };
  }, [data, params]);

  return (
    <>
      <nav className='fixed left-0 top-0 z-20 inline-flex w-full flex-row border-b-2 border-b-accent bg-background p-4'>
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>
                {org?.name ? (
                  <div className='inline-flex items-center gap-2 text-text'>
                    <Avatar>
                      <AvatarFallback name={org.name} />
                    </Avatar>
                    {org.name}
                  </div>
                ) : (
                  'Select organization'
                )}
              </NavigationMenuTrigger>
              <NavigationMenuContent className='grid min-w-[350px] max-w-[100vw] gap-3 p-4 text-text'>
                <h6 className='font-bold underline'>Organizations</h6>
                {(data?.data || []).map(org => (
                  <Link
                    to={'/dashboard/organization/$organizationId'}
                    params={{
                      organizationId: org?.id || '',
                    }}
                    className='rounded-md p-2 transition-all hover:bg-background-shade'
                    activeOptions={{ exact: false }}
                    activeProps={{
                      className: 'bg-background-shade p-2 rounded-md',
                    }}
                    key={org.id}
                  >
                    <NavigationMenuLink key={org.id} className='inline-flex items-center gap-2'>
                      <Avatar>
                        <AvatarFallback name={org.name} />
                      </Avatar>
                      {org.name}
                    </NavigationMenuLink>
                  </Link>
                ))}
              </NavigationMenuContent>
            </NavigationMenuItem>
            {org?.projects ? (
              <NavigationMenuItem>
                <NavigationMenuTrigger>
                  <div className='text-text'>{project?.name || 'Select project'}</div>
                </NavigationMenuTrigger>
                <NavigationMenuContent className='grid min-w-[350px] max-w-[100vw] gap-3 p-4 text-text'>
                  <h6 className='font-bold underline'>Projects</h6>
                  {org.projects.map(project => (
                    <Link
                      key={project.id}
                      to={'/dashboard/organization/$organizationId/project/$projectId'}
                      params={{
                        organizationId: org?.id || '',
                        projectId: project?.id || '',
                      }}
                      className='rounded-md p-2 transition-all hover:bg-background-shade'
                      activeOptions={{ exact: false }}
                      activeProps={{
                        className: 'bg-background-shade p-2 rounded-md',
                      }}
                    >
                      <NavigationMenuLink key={project.id} className='text-text'>
                        {project.name}
                      </NavigationMenuLink>
                    </Link>
                  ))}
                </NavigationMenuContent>
              </NavigationMenuItem>
            ) : null}
            {project?.environments ? (
              <NavigationMenuItem>
                <NavigationMenuTrigger>
                  <div className='text-text'>{env?.name || 'Select environment'}</div>
                </NavigationMenuTrigger>
                <NavigationMenuContent className='grid min-w-[350px] max-w-[100vw] gap-3 p-4 text-text'>
                  <h6 className='font-bold underline'>Environments</h6>
                  {project.environments.map(env => (
                    <Link
                      key={env.id}
                      to={'/dashboard/organization/$organizationId/project/$projectId/env/$environmentId'}
                      params={{
                        organizationId: org?.id || '',
                        projectId: project?.id || '',
                        environmentId: env?.id || '',
                      }}
                      className='rounded-md p-2 transition-all hover:bg-background-shade'
                      activeOptions={{ exact: false }}
                      activeProps={{
                        className: 'bg-background-shade p-2 rounded-md',
                      }}
                    >
                      <NavigationMenuLink key={env.id}>{env.name}</NavigationMenuLink>
                    </Link>
                  ))}
                </NavigationMenuContent>
              </NavigationMenuItem>
            ) : null}
          </NavigationMenuList>
        </NavigationMenu>
        <div className='flex-1' />
        <div className='inline-flex gap-3'>
          <div id='timeframe-selection' />
          {!isHobby(org?.sub) ? null : (
            <Link
              from='/dashboard/organization/$organizationId'
              to='/dashboard/organization/$organizationId/payment'
              className='flex flex-col justify-center'
            >
              <Badge variant='secondary'>Hobby</Badge>
            </Link>
          )}
          {org?.quota_exceeded ? (
            <Link
              from='/dashboard/organization/$organizationId'
              to='/dashboard/organization/$organizationId/payment'
              className='flex flex-col justify-center'
            >
              <Badge variant='destructive'>Quota Exceeded</Badge>
            </Link>
          ) : null}
          <a href={config.VITE_AGIFLOW_DOCS_WEBSITE} target='__blank'>
            <Button className='h-10 w-10 rounded-full p-2' variant='outline'>
              <QuestionMarkIcon className='text-text' />
            </Button>
          </a>
          <UserMenu />
        </div>
      </nav>
      <div className='min-h-screen bg-background'>
        <div className='h-[64px]' />
        <Outlet />
      </div>
    </>
  );
}
