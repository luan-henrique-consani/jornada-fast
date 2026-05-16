import { useState, useEffect, useCallback } from 'react'
import { estimativaService } from '../services/estimativaService'
import type { Estimativa, EstimativaRequest, Page } from '../types'

export function useEstimativas(pageInicial = 0) {
  const [data, setData] = useState<Page<Estimativa> | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(pageInicial)
  const [preview, setPreview] = useState<Estimativa | null>(null)

  const carregar = useCallback(async (p = page) => {
    setLoading(true)
    setError(null)
    try {
      const res = await estimativaService.listar(p)
      setData(res)
      setPage(p)
    } catch {
      setError('Erro ao carregar estimativas')
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => { carregar(pageInicial) }, [])

  const calcular = async (req: EstimativaRequest) => {
    setLoading(true)
    setError(null)
    try {
      const res = await estimativaService.calcular(req)
      setPreview(res)
      return res
    } catch {
      setError('Erro ao calcular estimativa')
      return null
    } finally {
      setLoading(false)
    }
  }

  const salvar = async (req: EstimativaRequest) => {
    const res = await estimativaService.salvar(req)
    await carregar(0)
    return res
  }

  const limparPreview = () => setPreview(null)

  return { data, loading, error, page, preview, carregar, calcular, salvar, limparPreview }
}