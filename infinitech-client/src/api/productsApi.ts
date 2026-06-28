import { baseApi } from './baseApi';
import type { Product, Category, PagedResult, ProductQueryParams } from '../types';

export const productsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getProducts: build.query<PagedResult<Product>, ProductQueryParams>({
      query: (params) => ({ url: '/products', params }),
      providesTags: ['Products'],
    }),
    getProduct: build.query<Product, string>({
      query: (id) => `/products/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Products', id }],
    }),
    createProduct: build.mutation<Product, FormData>({
      query: (body) => ({ url: '/products', method: 'POST', body }),
      invalidatesTags: ['Products'],
    }),
    updateProduct: build.mutation<Product, { id: string; body: FormData }>({
      query: ({ id, body }) => ({ url: `/products/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Products'],
    }),
    deleteProduct: build.mutation<void, string>({
      query: (id) => ({ url: `/products/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Products'],
    }),
    getCategories: build.query<Category[], void>({
      query: () => '/categories',
      providesTags: ['Categories'],
    }),
    getSimilarProducts: build.query<Product[], string>({
      query: (id) => `/products/${id}/similar`,
      providesTags: (_r, _e, id) => [{ type: 'Products', id }],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetCategoriesQuery,
  useGetSimilarProductsQuery,
} = productsApi;
