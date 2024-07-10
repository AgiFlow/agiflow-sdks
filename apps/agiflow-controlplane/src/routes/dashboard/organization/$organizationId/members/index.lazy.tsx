import { createLazyFileRoute } from '@tanstack/react-router';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  CardContent,
  CardHeader,
  CardTitle,
  MeasuredContainer,
} from '@agiflowai/frontend-web-ui';
import { Members } from './-ui/components/Members';
import { Invitations } from './-ui/components/Invitations';

export const Route = createLazyFileRoute('/dashboard/organization/$organizationId/members/')({
  component: Dashboard,
});

function Dashboard() {
  return (
    <div className='w-full'>
      <MeasuredContainer>
        <ResizablePanelGroup direction='horizontal' className='min-h-[66vh] w-full max-w-[1000px]'>
          <ResizablePanel defaultSize={70}>
            <div>
              <CardHeader>
                <CardTitle className='text-h6'>Members</CardTitle>
              </CardHeader>
              <CardContent>
                <Members />
              </CardContent>
            </div>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={30}>
            <div>
              <CardHeader>
                <CardTitle className='text-h6'>Invitations</CardTitle>
              </CardHeader>
              <CardContent>
                <Invitations />
              </CardContent>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </MeasuredContainer>
    </div>
  );
}
