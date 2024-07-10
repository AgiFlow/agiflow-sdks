import { Tabs, TabsList, TabsContent, TabsTrigger } from '@agiflowai/frontend-web-ui';
import { Code } from '../Code';

const nodejsInitCode = `
import * as agiflow from '@agiflowai/node-sdk';

agiflow.initialize({
  appName: '<YOUR APP NAME>',
  apiKey: process.env.AGIFLOW_API_KEY,
});
`;

const pythonInitCode = `from agiflow import Agiflow

Agiflow.init(
  app_name="<YOUR_APP_NAME>",
  api_key="<AGIFLOW_API_KEY>"
)`;

export const ServerOnboarding = () => {
  return (
    <div className='flex flex-col gap-4'>
      <h5 className='underline'>Server Side</h5>
      <div className='flex flex-col gap-3'>
        <p>
          AGIFlow server sdks automatically collect LLM & Embedding traces and send telemetry data to AGIFlow backend
          using OpenTelemetry. Simply install the sdks with below commands:
        </p>
        <Tabs defaultValue={'python'}>
          <TabsList>
            <TabsTrigger value='python'>Python</TabsTrigger>
          </TabsList>
          <TabsContent value='nodejs'>
            <Code code={`pnpm install @agiflowai/node-sdk`} language='sh' />
          </TabsContent>
          <TabsContent value='python'>
            <Code code={`pip install agiflow-sdk`} language='sh' />
          </TabsContent>
        </Tabs>
      </div>
      <div className='flex flex-col gap-3'>
        <p>Then initialise client to enabled automatic tracing.</p>
        <Tabs defaultValue={'python'}>
          <TabsList>
            <TabsTrigger value='python'>Python</TabsTrigger>
          </TabsList>
          <TabsContent value='nodejs'>
            <Code code={nodejsInitCode} language='ts' />
          </TabsContent>
          <TabsContent value='python'>
            <Code code={pythonInitCode} language='python' />
          </TabsContent>
        </Tabs>
      </div>
      <p>
        For complete tracing setup, please visit our{' '}
        <a className='underline' href='https://docs.agiflow.io/libraries/python/tracing' target='__blank'>
          Python
        </a>{' '}
        documentation for more information.
      </p>
    </div>
  );
};
