import { useState } from 'react'

interface PaginationState {
  page: number
  size: number
}

interface UsePaginationReturn extends PaginationState {
  setPage: (page: number) => void
  setSize: (size: number) => void
  reset: () => void
}

export function usePagination(initialPage = 0, initialSize = 20): UsePaginationReturn {
  const [page, setPage] = useState(initialPage)
  const [size, setSize] = useState(initialSize)

  return {
    page,
    size,
    setPage,
    setSize,
    reset: () => setPage(initialPage),
  }
}
