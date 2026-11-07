import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { productService } from '../services/productService'
import type { Product, ListFilters, ProductsResponse } from '../types'
import { getErrorMessage } from '../utils/errorHandler'

// TODO 2.2 (Listado): useProducts(filters) con useQuery. La queryKey debe incluir los filtros y la
// consulta no debe parpadear al cambiar de página (placeholderData: keepPreviousData).
export function useProducts(filters: ListFilters) {
  return useQuery<ProductsResponse, Error>({
    queryKey: ['products', filters.page, filters.q],
    queryFn: () => productService.list(filters),
    placeholderData: keepPreviousData,
  })
}

export function useProduct(id: number) {
  return useQuery<Product, Error>({
    queryKey: ['product', id],
    queryFn: () => productService.getById(id),
    enabled: Number.isSafeInteger(id) && id > 0,
    retry: false,
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: FormData) => productService.create(body),
    onSuccess: async () => {
      toast.success('Producto creado correctamente')
      await queryClient.invalidateQueries({ queryKey: ['products'] })
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => productService.remove(id),
    onSuccess: async () => {
      toast.success('Producto eliminado correctamente')
      await queryClient.invalidateQueries({ queryKey: ['products'] })
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  })
}
