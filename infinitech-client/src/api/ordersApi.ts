import { baseApi } from './baseApi';
import type { Order, PagedResult, OrderStatus } from '../types';

interface CreateOrderDto {
  deliveryAddress?: string;
  notes?: string;
}

interface AdminOrderParams {
  page?: number;
  pageSize?: number;
  status?: OrderStatus;
  dateFrom?: string;
  dateTo?: string;
}

export const ordersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    createOrder: build.mutation<Order, CreateOrderDto>({
      query: (body) => ({ url: '/orders', method: 'POST', body }),
      invalidatesTags: ['Orders', 'Cart'],
    }),
    getMyOrders: build.query<PagedResult<Order>, { page?: number; pageSize?: number }>({
      query: (params) => ({ url: '/orders', params }),
      providesTags: ['Orders'],
    }),
    getOrder: build.query<Order, string>({
      query: (id) => `/orders/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Orders', id }],
    }),
    getAdminOrders: build.query<PagedResult<Order>, AdminOrderParams>({
      query: (params) => ({ url: '/admin/orders', params }),
      providesTags: ['Orders'],
    }),
    updateOrderStatus: build.mutation<Order, { id: string; status: OrderStatus }>({
      query: ({ id, status }) => ({ url: `/admin/orders/${id}/status`, method: 'PUT', body: { status } }),
      invalidatesTags: ['Orders'],
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useGetMyOrdersQuery,
  useGetOrderQuery,
  useGetAdminOrdersQuery,
  useUpdateOrderStatusMutation,
} = ordersApi;
