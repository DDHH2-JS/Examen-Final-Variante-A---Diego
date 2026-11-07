import { api } from './api'
import type { Product, ListFilters, ProductsResponse } from '../types'

export const PAGE_SIZE = 8

export const productService = {
  // TODO 2.1 (Listado): GET /auth/products con params limit=PAGE_SIZE y skip=(page - 1) * PAGE_SIZE.
  // Si hay texto de búsqueda (q), use GET /auth/products/search con el parámetro q.
  list: async ({ page, q }: ListFilters): Promise<ProductsResponse> => {
    const params = { limit: PAGE_SIZE, skip: (page - 1) * PAGE_SIZE }
    const query = q.trim()
    const endpoint = query ? '/auth/products/search' : '/auth/products'
    const { data } = await api.get<ProductsResponse>(endpoint, {
      params: query ? { ...params, q: query } : params,
    })
    return data
  },

  // TODO 3.1 (Detalle): GET /auth/products/{id}.
  getById: async (id: number): Promise<Product> => {
    const { data } = await api.get<Product>(`/auth/products/${id}`)
    return data
  },

  // TODO 4.3 (Crear): POST /products/add enviando el FormData (multipart/form-data).
  create: async (body: FormData): Promise<Product> => {
    const { data } = await api.post<Product>('/products/add', body, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  // TODO 4.4 (Eliminar): DELETE /products/{id}.
  remove: async (id: number): Promise<Product> => {
    const { data } = await api.delete<Product>(`/products/${id}`)
    return data
  },
}
