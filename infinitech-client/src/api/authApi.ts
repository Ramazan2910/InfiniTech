import { baseApi } from './baseApi';
import type { AuthResponse, User } from '../types';

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<AuthResponse, { email: string; password: string }>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
    }),
    register: build.mutation<AuthResponse, { email: string; password: string; firstName: string; lastName: string; phone?: string }>({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
    }),
    logout: build.mutation<void, void>({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
      invalidatesTags: ['Cart'],
    }),
    getMe: build.query<User, void>({
      query: () => '/auth/me',
    }),
    refresh: build.mutation<AuthResponse, void>({
      query: () => ({ url: '/auth/refresh', method: 'POST' }),
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation, useLogoutMutation, useGetMeQuery, useRefreshMutation } = authApi;
