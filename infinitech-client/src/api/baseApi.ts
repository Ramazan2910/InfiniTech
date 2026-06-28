import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../app/store';
import { setCredentials, clearCredentials } from '../features/auth/authSlice';
import type { AuthResponse } from '../types';

const rawBase = fetchBaseQuery({
  baseUrl: '/api',
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args, api, extra
) => {
  let result = await rawBase(args, api, extra);
  if (result.error?.status === 401) {
    const refresh = await rawBase({ url: '/auth/refresh', method: 'POST' }, api, extra);
    if (refresh.data) {
      const data = refresh.data as AuthResponse;
      api.dispatch(setCredentials({ user: data.user, accessToken: data.accessToken }));
      result = await rawBase(args, api, extra);
    } else {
      api.dispatch(clearCredentials());
    }
  }
  return result;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Products', 'Categories', 'Cart', 'Orders', 'Tickets', 'Users', 'Dashboard'],
  endpoints: () => ({}),
});
