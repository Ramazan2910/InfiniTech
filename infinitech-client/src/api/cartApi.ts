import { baseApi } from './baseApi';
import type { Cart } from '../types';

export const cartApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCart: build.query<Cart, void>({
      query: () => '/cart',
      providesTags: ['Cart'],
    }),
    addToCart: build.mutation<void, { productId: string; quantity: number }>({
      query: (body) => ({ url: '/cart/items', method: 'POST', body }),
      invalidatesTags: ['Cart'],
    }),
    updateCartItem: build.mutation<void, { productId: string; quantity: number }>({
      query: ({ productId, quantity }) => ({
        url: `/cart/items/${productId}`,
        method: 'PUT',
        body: { quantity },
      }),
      invalidatesTags: ['Cart'],
    }),
    removeCartItem: build.mutation<void, string>({
      query: (productId) => ({ url: `/cart/items/${productId}`, method: 'DELETE' }),
      invalidatesTags: ['Cart'],
    }),
    clearCart: build.mutation<void, void>({
      query: () => ({ url: '/cart', method: 'DELETE' }),
      invalidatesTags: ['Cart'],
    }),
  }),
});

export const {
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
  useClearCartMutation,
} = cartApi;
