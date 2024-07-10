import { useNavigate } from '@tanstack/react-router';
import {
  Avatar,
  AvatarFallback,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@agiflowai/frontend-web-ui';
import { onAuthStateChange, supabase } from '@/libs/supabase';
import { useEffect, useState } from 'react';

export const UserMenu = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any | undefined>(undefined);
  useEffect(() => {
    const {
      data: { subscription },
    } = onAuthStateChange((_event, session) => {
      if (!session) {
        navigate({
          to: '/auth',
        });
      } else {
        setUser(session?.user);
      }
    });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar>
          <AvatarFallback className='text-text' name={user?.user_metadata?.full_name || user?.email} />
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>My account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            supabase?.auth.signOut();
          }}
        >
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
