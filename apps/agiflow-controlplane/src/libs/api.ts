import createClient from 'openapi-fetch';
import { paths } from '@agiflowai/controlplane-api-client';
import { supabase } from '@/libs/supabase';
import { refetch } from './fetch';
import { config } from './config';

export const endPoint = config.VITE_CONTROLPLANE_API_ENDPOINT;

const setAuthHeader = async (headers: any) => {
  const session = await supabase?.auth.getSession();
  if (session?.data?.session) {
    headers.Authorization = `Bearer ${session.data.session?.access_token}`;
  }
};

export const fetchApi = async (url: string | URL | globalThis.Request, opts?: RequestInit) => {
  const fetchOption: RequestInit = opts || {};
  if (!fetchOption.headers) {
    fetchOption.headers = {};
  }
  if (!('Content-Type' in fetchOption.headers)) {
    fetchOption.headers['Content-Type'] = 'application/json';
  }
  if (fetchOption.headers['Content-Type'] === undefined) {
    delete fetchOption.headers['Content-Type'];
  }
  await setAuthHeader(fetchOption.headers);
  let res = await refetch(url, fetchOption);
  if (res.status === 401) {
    const refreshed = await supabase?.auth.refreshSession();
    const isAuthed = !!refreshed?.data?.session;
    if (isAuthed) {
      await setAuthHeader(fetchOption.headers);
      res = await refetch(url, fetchOption);
    }
  }
  return res;
};

export const apiClient = createClient<paths>({
  baseUrl: endPoint,
  fetch: fetchApi,
});
