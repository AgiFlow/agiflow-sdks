import createClient from 'openapi-fetch';

import { paths } from '@agiflowai/dataplane-api-client';

import { getUserSession, setUserSession } from '../modules/sessionStorage';

export interface ApiClientConfig {
  endpoint: string;
  key: string;
}

export const fetchApi = async (url: string | URL | globalThis.Request, opts?: RequestInit) => {
  const fetchOption: RequestInit = opts || {};
  if (!fetchOption.headers) {
    fetchOption.headers = {};
  }
  const session = getUserSession();
  fetchOption.headers['Content-Type'] = 'application/json';
  if (session) {
    fetchOption.headers['Authorization'] = `Bearer ${session.token}`;
  }
  const res = await fetch(url, fetchOption);
  if (session) {
    const token = res.headers.get('x-token-id');
    if (token && token !== session.token) {
      setUserSession(session.sessionId, token);
    }
  }
  return res;
};

export const getApiClient = (endpoint: string) =>
  createClient<paths>({
    baseUrl: endpoint,
    fetch: fetchApi,
  });
