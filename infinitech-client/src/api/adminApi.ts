import { baseApi } from './baseApi';
import type { DashboardStats, UserDetail, PagedResult, User, UserRole } from '../types';

export const adminApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getDashboard: build.query<DashboardStats, void>({
      query: () => '/admin/dashboard',
      providesTags: ['Dashboard'],
    }),
    getAdminUsers: build.query<PagedResult<User>, { page?: number; pageSize?: number; role?: UserRole; isActive?: boolean; search?: string }>({
      query: (params) => ({ url: '/admin/users', params }),
      providesTags: ['Users'],
    }),
    getUserDetail: build.query<UserDetail, string>({
      query: (id) => `/admin/users/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Users', id }],
    }),
    changeUserStatus: build.mutation<void, { id: string; isActive: boolean }>({
      query: ({ id, isActive }) => ({ url: `/admin/users/${id}/status`, method: 'PUT', body: { isActive } }),
      invalidatesTags: ['Users'],
    }),
    changeUserRole: build.mutation<void, { id: string; role: UserRole }>({
      query: ({ id, role }) => ({ url: `/admin/users/${id}/role`, method: 'PUT', body: { role } }),
      invalidatesTags: ['Users'],
    }),
    createAdminUser: build.mutation<User, { email: string; password: string; firstName: string; lastName: string; phone?: string; role: UserRole }>({
      query: (body) => ({ url: '/admin/users', method: 'POST', body }),
      invalidatesTags: ['Users'],
    }),
    deleteAdminUser: build.mutation<void, string>({
      query: (id) => ({ url: `/admin/users/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Users'],
    }),
    adminChangePassword: build.mutation<void, { id: string; newPassword: string }>({
      query: ({ id, newPassword }) => ({ url: `/admin/users/${id}/password`, method: 'PUT', body: { newPassword } }),
    }),
    adminResetPassword: build.mutation<{ temporaryPassword: string }, string>({
      query: (id) => ({ url: `/admin/users/${id}/reset-password`, method: 'POST' }),
    }),
  }),
});

export const {
  useGetDashboardQuery,
  useGetAdminUsersQuery,
  useGetUserDetailQuery,
  useChangeUserStatusMutation,
  useChangeUserRoleMutation,
  useCreateAdminUserMutation,
  useDeleteAdminUserMutation,
  useAdminChangePasswordMutation,
  useAdminResetPasswordMutation,
} = adminApi;
