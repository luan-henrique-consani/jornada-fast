import { useState, useEffect, useCallback } from 'react'
import { produtoService } from '../services/produtoService'
import type { Page, Produto, ProdutoRequest } from '../types'

export function useProdutos(pageInicial = 0) {
  const [data, setData] = useState<Page<Produto> | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(pageInicial)

  const carregar = useCallback(async (p = page) => {
    setLoading(true)
    setError(null)
    try {
      const res = await produtoService.listar(p)
      setData(res)
      setPage(p)
    } catch {
      setError('Erro ao carregar produtos')
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => { carregar(pageInicial) }, [])

  const criar = async (req: ProdutoRequest) => {
    await produtoService.criar(req)
    await carregar(0)
  }

  const atualizar = async (id: number, req: ProdutoRequest) => {
    await produtoService.atualizar(id, req)
    await carregar(page)
  }

  const excluir = async (id: number) => {
    await produtoService.excluir(id)
    await carregar(page)
  }

  return { data, loading, error, page, carregar, criar, atualizar, excluir }
}