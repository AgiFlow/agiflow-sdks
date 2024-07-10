/**
 * NOTE:
 * type 1: api_base, api_key, api_version
 * type 2: api_base, api_key
 * type 3: api_key
 * type 4: api_base
 * type 5: vertext_project, vertex_location, vertext_credentials, api_key
 * type 6: tenant_id, api_base api_key
 * type 2: api_base, api_key, account_id
 * type 7:
 */
export const VENDORS = {
  custom: -1, // type 2
  openai: 1, // type 2
  azure: 2, // type 1
  azure_text: 3, // type 1
  custom_openai: 4, // type 2
  anyscale: 5, // type 2
  mistral: 6, // type 2
  openrouter: 7, // type 2
  deepinfra: 8, // type 2
  perplexity: 9, // type 2
  groq: 10, // type 2
  codestral: 11, // type 2
  'text-completion-codestral': 12, // type 2
  deepseek: 13, // type 2
  'tex-completion-openai': 14,
  huggingface: 15, // type 2
  ollama: 16, // type 4
  ollama_chat: 17, // type 2
  replicate: 18,
  vertex_ai: 19, // type 5
  vertex_ai_beta: 20, // type 5
  gemini: 21, // type 5
  sagemaker: 22, // type 7
  anthropic: 23, // type 3
  predibase: 24, // type 6
  bedrock: 25, // type 7
  databricks: 26, // type 2
  clarifai: 27,
  together_ai: 28, // type 2
  'text-completion-openai': 29, // type 2
  nlp_cloud: 30, // type 2
  aleph_alpha: 31, // type 2
  cohere: 32, // type 2
  cohere_chat: 33, // type 2
  maritalk: 34, // type 2
  oobabooga: 35, // type 4
  palm: 36, // type 3
  ai21: 37, // type 2
  watsonx: 38, // type 7
  vllm: 39, // type 7
  cloudflare: 40, // type 8
  baseten: 41, // type 3
  petals: 42, // type 4
} as const;

const MODEL_TYPES = {
  CHAT_COMPLETION: 'Chat Completion',
  COMPLETION: 'Completion',
  VISION: 'Vision',
  INSTRUCT: 'Instruct',
  MULTI: 'Multi Modals',
  CODE: 'Code',
  EMBEDDING: 'Embedding',
};

// NOTE: only show textarea if vendor requires models
export const MODELS = {
  [VENDORS.openai]: {
    [MODEL_TYPES.CHAT_COMPLETION]: [
      'gpt-4o',
      'gpt-4o-2024-05-13',
      'gpt-4-turbo',
      'gpt-4-turbo-preview',
      'gpt-4-0125-preview',
      'gpt-4-1106-preview',
      'gpt-3.5-turbo-1106',
      'gpt-3.5-turbo',
      'gpt-3.5-turbo-0301',
      'gpt-3.5-turbo-0613',
      'gpt-3.5-turbo-16k',
      'gpt-3.5-turbo-16k-0613',
      'gpt-3.5-turbo-instruct',
      'gpt-4',
      'gpt-4-0314',
      'gpt-4-0613',
      'gpt-4-32k',
      'gpt-4-32k-0314',
      'gpt-4-32k-0613',
    ],
    [MODEL_TYPES.VISION]: ['gpt-4o', 'gpt-4-turbo', 'gpt-4-vision-preview'],
  },
  [VENDORS.azure]: {},
  [VENDORS.vertex_ai]: {
    [MODEL_TYPES.MULTI]: [
      'gemini-pro',
      'gemini-pro-vision',
      'gemini-1.5-pro',
      'gemini-1.5-flash-preview-0514',
      'gemini-1.5-pro-preview-0514',
      'codechat-bison',
      'codechat-bison-32k',
      'codechat-bison@001',
    ],
    [MODEL_TYPES.CHAT_COMPLETION]: [
      'claude-3-opus@20240229',
      'claude-3-sonnet@20240229',
      'claude-3-haiku@20240307',
      'llama2',
      'llama3',
      'chat-bison-32k',
      'chat-bison',
      'chat-bison@001',
    ],
    [MODEL_TYPES.COMPLETION]: ['text-bison', 'text-bison@001'],
    [MODEL_TYPES.CODE]: ['code-bison', 'code-bison@001', 'code-gecko@001', 'code-gecko@latest'],
    [MODEL_TYPES.EMBEDDING]: [
      'text-embedding-004',
      'text-multilingual-embedding-002',
      'textembedding-gecko',
      'textembedding-gecko-multilingual',
      'textembedding-gecko-multilingual@001',
      'textembedding-gecko@001',
      'textembedding-gecko@003',
      'text-embedding-preview-0409',
      'text-multilingual-embedding-preview-0409',
    ],
  },
  [VENDORS.gemini]: {
    [MODEL_TYPES.CHAT_COMPLETION]: ['gemini-pro', 'gemini-1.5-pro-latest', 'gemini-pro-vision'],
  },
  [VENDORS.anthropic]: {
    [MODEL_TYPES.CHAT_COMPLETION]: [
      'claude-3-haiku',
      'claude-3-opus',
      'claude-3-sonnet',
      'claude-2.1',
      'claude-2',
      'claude-instant-1.2',
      'claude-instant-1',
    ],
  },
  [VENDORS.mistral]: {
    [MODEL_TYPES.CHAT_COMPLETION]: [
      'mistral-small-latest',
      'mistral-medium-latest',
      'mistral-large-latest',
      'open-mistral-7b',
      'open-mixtral-8x7b',
      'open-mixtral-8x22b',
      'codestral-latest',
    ],
  },
  [VENDORS.perplexity]: {
    [MODEL_TYPES.CHAT_COMPLETION]: [
      'pplx-7b-chat',
      'pplx-70b-chat',
      'pplx-7b-online',
      'pplx-70b-online',
      'codellama-34b-instruct',
      'llama-2-13b-chat',
      'llama-2-70b-chat',
      'mistral-7b-instruct',
      'openhermes-2-mistral-7b',
      'openhermes-2.5-mistral-7b',
      'pplx-7b-chat-alpha',
      'pplx-70b-chat-alpha',
    ],
  },
  [VENDORS.groq]: {
    [MODEL_TYPES.CHAT_COMPLETION]: [
      'llama3-8b-8192',
      'llama3-70b-8192',
      'llama2-70b-4096',
      'mixtral-8x7b-32768',
      'gemma-7b-it',
    ],
  },
} satisfies Record<number, Record<string, string[]>>;

export const getVendor = (key?: number | null) => {
  return Object.entries(VENDORS).find(([_, value]) => value === key)?.[0];
};
