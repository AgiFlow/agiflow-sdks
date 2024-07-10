export type RefetchArgs = Parameters<typeof fetch>;
export const refetch = (...args: RefetchArgs) => {
  return fetch(args[0], {
    ...(args[1] || {}),
    credentials: 'include',
  });
};
