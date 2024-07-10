import { apiClient } from '@/libs/api';
import { queryOptions } from '@tanstack/react-query';

export const orgsQueryOptions = queryOptions({
  queryKey: ['organizations'],
  queryFn: () => apiClient.GET('/organizations'),
});

export const myProfileQueryOptions = queryOptions({
  queryKey: ['my-profile'],
  queryFn: () => apiClient.GET('/my-profile'),
});
