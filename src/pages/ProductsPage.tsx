import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import Pagination from '../components/Pagination'
import ProductCard from '../components/ProductCard'
import ProductForm from '../components/ProductForm'
import { useProducts, useDeleteProduct } from '../hooks/useProducts'
import { PAGE_SIZE } from '../services/productService'
import { useAuthStore } from '../store/authStore'
import { getErrorMessage } from '../utils/errorHandler'

// TODO 2.3 (Listado): la página y la búsqueda deben vivir en la URL (?page=2&q=texto) con useSearchParams.
//  - parsePage: devuelva un entero >= 1; cualquier valor inválido (page=abc, page=-3) es la página 1.
//  - Al buscar (botón Buscar o Enter) escriba q en la URL y vuelva a la página 1; al paginar cambie solo page.
//  - Al recargar la página o compartir el enlace debe verse la misma lista.
function parsePage(raw: string | null): number {
  if (!raw || !/^\d+$/.test(raw)) return 1
  const page = Number(raw)
  return Number.isSafeInteger(page) && page >= 1 ? page : 1
}

function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = parsePage(searchParams.get('page'))
  const q = searchParams.get('q') ?? ''
  const [showForm, setShowForm] = useState(false)
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  // TODO 2.2: useProducts({ page, q }) ya devuelve los datos cuando complete el hook.
  const { data, isLoading, isError, error, refetch } = useProducts({ page, q })
  const remove = useDeleteProduct()

  const search = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const nextParams = new URLSearchParams()
    const nextQuery = String(formData.get('q') ?? '').trim()
    if (nextQuery) nextParams.set('q', nextQuery)
    setSearchParams(nextParams)
  }

  const changePage = (n: number) => {
    const nextParams = new URLSearchParams(searchParams)
    if (n <= 1) nextParams.delete('page')
    else nextParams.set('page', String(n))
    setSearchParams(nextParams)
  }

  const onDelete = (item: { id: number; title: string }) => {
    if (window.confirm(`¿Seguro que desea eliminar "${item.title}"?`)) {
      remove.mutate(item.id)
    }
  }

  const salir = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1

  return (
    <>
      <header className="border-b border-slate-200 bg-brand-800 text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <span className="text-lg font-bold">Catálogo de productos</span>
          <div className="flex items-center gap-3 text-sm">
            {user && <span className="hidden sm:inline">{user.firstName} {user.lastName}</span>}
            <Button variant="secondary" size="sm" onClick={salir}>Cerrar sesión</Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl overflow-x-clip p-4">
        <form onSubmit={search} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label htmlFor="q" className="text-sm font-medium">Buscar</label>
            <input id="q" name="q" type="search" key={q} defaultValue={q} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <Button type="submit" variant="outline">Buscar</Button>
          <Button type="button" onClick={() => setShowForm(true)}>Nuevo producto</Button>
        </form>

        {isLoading && <p className="mt-8 text-center text-slate-500" role="status">Cargando…</p>}

        {isError && (
          <Alert variant="destructive" className="mt-6">
            <AlertDescription>{getErrorMessage(error)}</AlertDescription>
            <Button className="mt-3" variant="outline" onClick={() => void refetch()}>
              Reintentar
            </Button>
          </Alert>
        )}

        {data && data.products.length === 0 && (
          <p className="mt-8 text-center text-slate-500">No hay resultados para la búsqueda.</p>
        )}

        {data && data.products.length > 0 && (
          <>
            <p className="mt-4 text-sm text-slate-500">{data.total} resultados</p>
            <div className="mt-2 grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {data.products.map((item) => (
                <ProductCard key={item.id} item={item} onDelete={onDelete} />
              ))}
            </div>
            <Pagination page={page} totalPages={totalPages} onChange={changePage} />
          </>
        )}
      </main>

      {showForm && <ProductForm onClose={() => setShowForm(false)} />}
    </>
  )
}

export default ProductsPage
