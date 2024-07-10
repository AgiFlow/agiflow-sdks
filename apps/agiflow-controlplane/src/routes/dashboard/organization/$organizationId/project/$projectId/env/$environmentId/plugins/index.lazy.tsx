import { createLazyFileRoute, useParams } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { PLUGIN_CATEGORIES, PLUGIN_CATEGORY_NAMES } from '@/constants/plugin';

import { Plugin } from './-ui/components/Plugin';
import { pluginsQueryOptions } from './-ui/queries';
import { modelsQueryOptions } from '../../../../../models/-ui/queries';

export const Route = createLazyFileRoute(
  '/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/plugins/',
)({
  component: Dashboard,
});

const plugins = [
  {
    category: PLUGIN_CATEGORIES.PII,
    title: PLUGIN_CATEGORY_NAMES[PLUGIN_CATEGORIES.PII],
    description: 'Check whether you are sending PII information to AI. Also apply PII masking to log saved in Agiflow.',
    body: (
      <p>
        <b>Required:</b> content
      </p>
    ),
  },
  {
    category: PLUGIN_CATEGORIES.ANSWER_RELEVANCY,
    title: PLUGIN_CATEGORY_NAMES[PLUGIN_CATEGORIES.ANSWER_RELEVANCY],
    description: 'Measure how relevant LLM output to provided input.',
    body: (
      <p>
        <b>Optional:</b> retrieval_context
      </p>
    ),
  },
  {
    category: PLUGIN_CATEGORIES.BIAS,
    title: PLUGIN_CATEGORY_NAMES[PLUGIN_CATEGORIES.BIAS],
    description: 'Check whether LLM output contain gender, racial or political bias.',
    body: <p />,
  },
  {
    category: PLUGIN_CATEGORIES.CONTEXTUAL_RELEVANCY,
    title: PLUGIN_CATEGORY_NAMES[PLUGIN_CATEGORIES.CONTEXTUAL_RELEVANCY],
    description: 'Measure how relevant LLM output compared to RAG retrieval context.',
    body: (
      <p>
        <b>Required:</b> retrieval_context
      </p>
    ),
  },
  {
    category: PLUGIN_CATEGORIES.FAITHFULNESS,
    title: PLUGIN_CATEGORY_NAMES[PLUGIN_CATEGORIES.FAITHFULNESS],
    description: 'Measure number of truthfull claims from LLM output compared to RAG retrieval context.',
    body: (
      <p>
        <b>Required:</b> retrieval_context
      </p>
    ),
  },
  {
    category: PLUGIN_CATEGORIES.HALLUCINATION,
    title: PLUGIN_CATEGORY_NAMES[PLUGIN_CATEGORIES.HALLUCINATION],
    description: 'Check whether LLM provide factual correct information.',
    body: (
      <p>
        <b>Required:</b> context
      </p>
    ),
  },
  {
    category: PLUGIN_CATEGORIES.TOXICITY,
    title: PLUGIN_CATEGORY_NAMES[PLUGIN_CATEGORIES.TOXICITY],
    description: 'Evaluate the toxicity of LLM output.',
    body: <p />,
  },
];
function Dashboard() {
  const params = useParams({
    from: '/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/plugins/',
  });
  const { data, isFetching } = useQuery(
    pluginsQueryOptions({
      path: params,
    }),
  );
  const { data: modelsData } = useQuery(
    modelsQueryOptions({
      path: params,
    }),
  );
  return (
    <div className='flex flex-1 flex-col items-start justify-center gap-3 md:p-4 lg:p-6'>
      <h4>Guardrails</h4>
      <p>
        Extra cost might be applied when you enable below guardrail. There is no performance penalty on your application
        as these rails are asynchronously applied.
      </p>
      <div className='grid w-full grid-cols-3 gap-4'>
        {plugins.map(plugin => (
          <Plugin
            key={`${plugin.category}`}
            title={plugin.title}
            description={plugin.description}
            loading={isFetching}
            plugin={(data?.data || []).find(x => x.category === plugin.category)}
            category={plugin.category}
            models={modelsData?.data || []}
          >
            {plugin.body}
          </Plugin>
        ))}
      </div>
    </div>
  );
}
