import { createFileRoute, redirect } from '@tanstack/react-router';
import { useEffect } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { isAuthenticated, onAuthStateChange, supabase } from '@/libs/supabase';
import { useDarkMode } from 'usehooks-ts';
import darkTheme from '@agiflowai/frontend-shared-theme/configs/darkTheme.json';

import fullLogo from '../../../public/full-logo.svg';
import img from '../../../public/login_image.jpg';

export const Route = createFileRoute('/auth/')({
  beforeLoad: async ({ location }) => {
    const isAuthed = await isAuthenticated();
    if (isAuthed) {
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
  const { isDarkMode } = useDarkMode();
  const navigate = Route.useNavigate();
  useEffect(() => {
    const {
      data: { subscription },
    } = onAuthStateChange((_event, session) => {
      if (session) {
        navigate({
          to: '/dashboard',
        });
      }
    });
    return () => subscription.unsubscribe();
  }, []);
  if (!supabase) return null;
  return (
    <div className='grid min-h-screen grid-cols-2 bg-background'>
      <div className='h-screen w-full'>
        <img src={img} className='size-full object-cover' />
      </div>
      <div className='flex size-full min-h-screen flex-col items-center justify-center space-y-3 p-4'>
        <img src={fullLogo} className='h-[64px] w-[160px]' />
        <h1 className='max-w-[500px] pb-6 text-center text-lg text-mono-light'>
          Welcome! Sign-up or login again to streamline feedback loop on your AI agents.
        </h1>
        <div className='min-w-[300px]'>
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {},
                dark: {
                  colors: {
                    inputText: darkTheme.colors.text.default,
                  },
                },
              },
            }}
            theme={isDarkMode ? 'dark' : 'light'}
            socialLayout='horizontal'
            providers={['github', 'google']}
          />
        </div>
      </div>
    </div>
  );
}
