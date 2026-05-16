import { useState, useEffect, useCallback } from 'react'
import { ordemCompraService } from '../services/ordemCompraService'
import type { OrdemCompra, OrdemCompraRequest, Page, StatusOrdem } from '../types'

export function useOrdemCompra(pageInicial = 0) {
  const [data, setData] = useState<Page<OrdemCompra> | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(pageInicial)

  const carregar = useCallback(async (p = page) => {
    setLoading(true)
    setError(null)
    try {
      const res = await ordemCompraService.listar(p)
      setData(res)
      setPage(p)
    } catch {
      setError('Erro ao carregar ordens de compra')
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => { carregar(pageInicial) }, [])

  const criar = async (req: OrdemCompraRequest) => {
    await ordemCompraService.criar(req)
    await carregar(0)
  }

  const atualizarStatus = async (id: number, status: StatusOrdem) => {
    await ordemCompraService.atualizarStatus(id, status)
    await carregar(page)
  }

  return { data, loading, error, page, carregar, criar, atualizarStatus }
}