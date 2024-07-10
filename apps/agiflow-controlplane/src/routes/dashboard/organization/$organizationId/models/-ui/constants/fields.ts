import { MODELS, VENDORS } from './models';

const getFlatModels = (models: Record<string, string[]>) => {
  return Object.entries(models)
    .map(([type, arr]) => arr.map(model => [model, type]))
    .reduce((prev, cur) => [...prev, ...cur], []);
};

const FIELDS = {
  API_BASE: 'api_base',
  API_KEY: 'api_key',
  API_VERSION: 'api_version',
  VERTEX_PROJECT: 'vertex_project',
  VERTEX_LOCATION: 'vertex_location',
  VERTEX_CREDENTIALS: 'vertex_credentials',
} as const;

export const DEFAULT_LABELS = {
  vendor: 'Provider',
  name: 'Model Name',
  [FIELDS.API_BASE]: 'API Endpoint',
  [FIELDS.API_KEY]: 'API Key',
  [FIELDS.API_VERSION]: 'Version',
  [FIELDS.VERTEX_PROJECT]: 'Vertex Project',
  [FIELDS.VERTEX_LOCATION]: 'Vertex Location',
  [FIELDS.VERTEX_CREDENTIALS]: 'Vertex Credentials',
} as const;

export const CONFIG_FIELDS = [
  {
    name: 'Open AI',
    vendor: VENDORS.openai,
    fields: [FIELDS.API_BASE, FIELDS.API_KEY],
    models: getFlatModels(MODELS[VENDORS.openai]),
    labels: DEFAULT_LABELS,
  },
  {
    name: 'Azure',
    vendor: VENDORS.azure,
    fields: [FIELDS.API_BASE, FIELDS.API_KEY, FIELDS.API_VERSION],
    models: undefined,
    labels: {
      ...DEFAULT_LABELS,
      [FIELDS.API_VERSION]: 'API Version',
      name: 'Deployment',
    },
  },
  {
    name: 'Vertex AI',
    vendor: VENDORS.vertex_ai,
    fields: [FIELDS.API_KEY, FIELDS.VERTEX_PROJECT, FIELDS.VERTEX_LOCATION, FIELDS.VERTEX_CREDENTIALS],
    models: getFlatModels(MODELS[VENDORS.vertex_ai]),
    labels: DEFAULT_LABELS,
  },
  {
    name: 'Gemini',
    vendor: VENDORS.gemini,
    fields: [FIELDS.API_KEY, FIELDS.VERTEX_PROJECT, FIELDS.VERTEX_LOCATION, FIELDS.VERTEX_CREDENTIALS],
    models: getFlatModels(MODELS[VENDORS.gemini]),
    labels: DEFAULT_LABELS,
  },
  {
    name: 'Anthropic',
    vendor: VENDORS.anthropic,
    fields: [FIELDS.API_KEY],
    models: getFlatModels(MODELS[VENDORS.anthropic]),
    labels: DEFAULT_LABELS,
  },
  {
    name: 'Mistral',
    vendor: VENDORS.mistral,
    fields: [FIELDS.API_BASE, FIELDS.API_KEY],
    models: getFlatModels(MODELS[VENDORS.mistral]),
    labels: DEFAULT_LABELS,
  },
  {
    name: 'Perplexity',
    vendor: VENDORS.perplexity,
    fields: [FIELDS.API_BASE, FIELDS.API_KEY],
    models: getFlatModels(MODELS[VENDORS.perplexity]),
    labels: DEFAULT_LABELS,
  },
  {
    name: 'Groq',
    vendor: VENDORS.groq,
    fields: [FIELDS.API_BASE, FIELDS.API_KEY],
    models: getFlatModels(MODELS[VENDORS.groq]),
    labels: DEFAULT_LABELS,
  },
];
