import { Tabs, TabsList, TabsContent, TabsTrigger } from '@agiflowai/frontend-web-ui';
import { Code } from '../Code';

const jsSdkInitCode = `import { Agiflow } from '@agiflowai/js-sdk';

const client = new Agiflow();

client.init(
  'process.env.CLIENT_KEY',
  {
    autoTrace: true,
  }
);`;

const fastApiCode = `import fastapi
from agiflow import Agiflow
from agiflow.opentelemetry import aworkflow, extract_association_properties_from_http_headers

app = fastapi.FastAPI()

# Create a middleware to add frontend trace to call context
@app.middleware("http")
async def agiflow_trace(request: fastapi.Request, call_next):
    Agiflow.set_association_properties(extract_association_properties_from_http_headers(request.headers))
    response = await call_next(request)
    return response

@app.post("/")
# Annotate the API route to get traces. With autoTrace option enabled on frontend,
# we shift the control to backend which you can use Agiflow's decorators workflows, tasks, ...
# to group traces together.
@aworkflow(name='WORKFLOW_NAME')
async def index():
   ...
`;

export const ClientOnboarding = () => {
  return (
    <div className='flex flex-col gap-4'>
      <a href='https://docs.agiflow.io/web' target='__blank'>
        <h5 className='underline'>Client Side</h5>
      </a>
      <div className='flex flex-col gap-3'>
        <p>
          AGIFlow also support frontend analytics and link it with backend tracing, enable full visibility of how your
          user interact with your application through out their lifetime or per session. The client sdk also provides
          Feedback widget out of the box. To get started, install our client sdk with below commands.
        </p>
        <Tabs defaultValue={'pnpm'}>
          <TabsList>
            <TabsTrigger value='pnpm'>pnpm</TabsTrigger>
            <TabsTrigger value='yarn'>yarn</TabsTrigger>
            <TabsTrigger value='npm'>npm</TabsTrigger>
          </TabsList>
          <TabsContent value='pnpm'>
            <Code code={`pnpm add @agiflowai/js-sdk`} language='sh' />
          </TabsContent>
          <TabsContent value='yarn'>
            <Code code={`yarn add @agiflowai/js-sdk`} language='sh' />
          </TabsContent>
          <TabsContent value='npm'>
            <Code code={`npm install @agiflowai/js-sdk`} language='sh' />
          </TabsContent>
        </Tabs>
      </div>
      <div className='flex flex-col gap-3'>
        <p>
          Then initialise client with auto-tracing enabled to get started. Once your user visit the application, this
          SDK will create a user session for analytics, and send `trace-id` to backend via header for E2E tracing.
        </p>
        <Tabs defaultValue={'js-sdk'}>
          <TabsList>
            <TabsTrigger value='js-sdk'>@agiflowai/js-sdk</TabsTrigger>
          </TabsList>
          <TabsContent value='js-sdk'>
            <Code code={jsSdkInitCode} language='ts' />
          </TabsContent>
        </Tabs>
      </div>
      <div className='flex flex-col gap-2'>
        <p>
          To connect with frontend analytics, we just need to associate backend traces with AGIFlow trace-id. You can
          create a middleware to allow trace associate on all routes like this:
        </p>
        <Tabs defaultValue={'FastAPI'}>
          <TabsList>
            <TabsTrigger value='FastAPI'>FastAPI</TabsTrigger>
          </TabsList>
          <TabsContent value='FastAPI'>
            <Code code={fastApiCode} language='python' />
          </TabsContent>
        </Tabs>
      </div>
      <p>
        This is one of many approaches we provide to captured E2E tracing. You can also use pattern matching for APIs to
        trace particular requests; or manually call client-sdk track method which provides more granual control. If you
        are backend focused, auto-trace on the frontend is easier as you can control workflow on backend.
      </p>
    </div>
  );
};
