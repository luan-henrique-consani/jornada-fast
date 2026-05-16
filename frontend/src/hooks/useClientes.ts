import { useState, useEffect, useCallback } from 'react'
import { clienteService } from '../services/clienteService'
import type { Cliente, ClienteRequest, Page } from '../types'

export function useClientes(pageInicial = 0) {
  const [data, setData] = useState<Page<Cliente> | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(pageInicial)

  const carregar = useCallback(async (p = page) => {
    setLoading(true)
    setError(null)
    try {
      const res = await clienteService.listar(p)
      setData(res)
      setPage(p)
    } catch {
      setError('Erro ao carregar clientes')
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => { carregar(pageInicial) }, [])

  const criar = async (req: ClienteRequest) => {
    await clienteService.criar(req)
    await carregar(0)
  }

  const atualizar = async (id: number, req: ClienteRequest) => {
    await clienteService.atualizar(id, req)
    await carregar(page)
  }

  return { data, loading, error, page, carregar, criar, atualizar }
}