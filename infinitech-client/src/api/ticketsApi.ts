import { baseApi } from './baseApi';
import type { RepairTicket, PagedResult, TicketStatus } from '../types';

export const ticketsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    createTicket: build.mutation<RepairTicket, FormData>({
      query: (body) => ({ url: '/tickets', method: 'POST', body }),
      invalidatesTags: ['Tickets'],
    }),
    getMyTickets: build.query<PagedResult<RepairTicket>, { page?: number; pageSize?: number }>({
      query: (params) => ({ url: '/tickets', params }),
      providesTags: ['Tickets'],
    }),
    getTicket: build.query<RepairTicket, string>({
      query: (id) => `/tickets/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Tickets', id }],
    }),
    addTicketPhotos: build.mutation<void, { id: string; formData: FormData }>({
      query: ({ id, formData }) => ({ url: `/tickets/${id}/photos`, method: 'POST', body: formData }),
      invalidatesTags: ['Tickets'],
    }),
    getMasterTickets: build.query<PagedResult<RepairTicket>, { page?: number; pageSize?: number; status?: string }>({
      query: (params) => ({ url: '/master/tickets', params }),
      providesTags: ['Tickets'],
    }),
    assignTicket: build.mutation<RepairTicket, string>({
      query: (id) => ({ url: `/master/tickets/${id}/assign`, method: 'POST' }),
      invalidatesTags: ['Tickets'],
    }),
    updateTicketStatus: build.mutation<RepairTicket, { id: string; status: TicketStatus; diagnosisResult?: string; repairCost?: number }>({
      query: ({ id, ...body }) => ({ url: `/master/tickets/${id}/status`, method: 'PUT', body }),
      invalidatesTags: ['Tickets'],
    }),
    addComment: build.mutation<void, { id: string; content: string; isInternal: boolean }>({
      query: ({ id, ...body }) => ({ url: `/master/tickets/${id}/comments`, method: 'POST', body }),
      invalidatesTags: ['Tickets'],
    }),
    getAdminTickets: build.query<PagedResult<RepairTicket>, { page?: number; pageSize?: number; status?: string }>({
      query: (params) => ({ url: '/admin/tickets', params }),
      providesTags: ['Tickets'],
    }),
    adminUpdateTicket: build.mutation<RepairTicket, { id: string; [key: string]: unknown }>({
      query: ({ id, ...body }) => ({ url: `/admin/tickets/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Tickets'],
    }),
  }),
});

export const {
  useCreateTicketMutation,
  useGetMyTicketsQuery,
  useGetTicketQuery,
  useAddTicketPhotosMutation,
  useGetMasterTicketsQuery,
  useAssignTicketMutation,
  useUpdateTicketStatusMutation,
  useAddCommentMutation,
  useGetAdminTicketsQuery,
  useAdminUpdateTicketMutation,
} = ticketsApi;
