import { useQuery } from '@tanstack/react-query';
import { useParams } from '@tanstack/react-router';
import { IdPortal } from '@agiflowai/frontend-web-ui';
import { envQueryOptions, type IEnv } from '../../queries';
import { ClientOnboarding } from '../ClientOnboarding';
import { ServerOnboarding } from '../BackendOnboarding';
import { Metrics } from '../Metrics';
import { DatePickers } from '../DatePickers';
import { AppVersionPicker } from '../AppVersionPicker';

const WelcomeMessage = () => (
  <>
    <h3>Welcome to Agiflow.</h3>
    <p>
      This onboarding section will help you quickly get AGIFlow working on your project from end-to-end. Please go
      through the following steps to get started.
    </p>
    <p>Once traces and analytics are sent to AGIFlow, this page will be replaced by metrics dashboard &#128512;.</p>
  </>
);

interface OnboardingInstructionProps {
  env?: IEnv;
}
const OnboardingInstruction = ({ env }: OnboardingInstructionProps) => {
  return (
    <div className='w-full'>
      {env?.api_connected ? null : <ServerOnboarding />}
      {env?.client_connected ? null : <ClientOnboarding />}
      {env?.client_connected && env?.api_connected ? null : (
        <p>
          For more information, please visit{' '}
          <a href='https://docs.agiflow.io' target='__blank' className='underline'>
            our documentation site.
          </a>
        </p>
      )}
    </div>
  );
};

const Main = () => {
  const params = useParams({
    from: '/dashboard/organization/$organizationId/project/$projectId/env/$environmentId',
  });
  const { data } = useQuery(envQueryOptions({ path: params }));
  const showMetrics = data?.data?.client_connected || data?.data?.api_connected;
  return (
    <div className='flex w-full flex-1 flex-col items-center justify-center md:p-4 lg:p-6'>
      <div className='grid w-full gap-3'>
        {showMetrics ? (
          <>
            <IdPortal id='timeframe-selection'>
              <div className='inline-flex gap-2'>
                <AppVersionPicker appVersion={data?.data?.app_version} />
                <DatePickers />
              </div>
            </IdPortal>
            <h3>Welcome back</h3>
            <Metrics />
          </>
        ) : (
          <WelcomeMessage />
        )}
      </div>
      <OnboardingInstruction env={data?.data} />
    </div>
  );
};

export default Main;
