import { api, tokenStore } from './api'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8081'

export interface CargoItemDTO {
  codigo: string
  descricao: string
  quantidade: number
  pesoUnitarioKg: number
  pesoTotalKg: number
  alturaM: number
  larguraM: number
  comprimentoM: number
}

export interface ExtractedPdfDataDTO {
  numeroProposta: string
  cliente: string
  dataDocumento: string
  cidadeOrigem: string
  estadoOrigem: string
  cepOrigem: string
  cidadeDestino: string
  estadoDestino: string
  cepDestino: string
  observacoes: string
  itens: CargoItemDTO[]
}

export interface RouteResponseDTO {
  origem: string
  destino: string
  distanciaKm: number
  duracaoHoras: number
  provider: string
}

export interface TollResponseDTO {
  quantidadePedagios: number
  valorTotalReais: number
  provider: string
}

export interface VolumetricResultDTO {
  volumeTotalM3: number
  pesoTotalKg: number
  metrosCaminhao: number
  metrosCaminhaoNvia: number
  metrosCaminhaoVenda: number
  totalVolumes: number
}

export interface FreightResultDTO {
  rota: RouteResponseDTO
  pedagios: TollResponseDTO
  volumetria: VolumetricResultDTO
  valorFreteBase: number
  valorFreteNvia: number
  valorFreteVenda: number
  tipoVeiculo: string
}

export interface CotacaoResponseDTO {
  estimativaId: number
  publicId: string
  cliente: string
  origem: string
  destino: string
  dadosExtraidos: ExtractedPdfDataDTO
  frete: FreightResultDTO
  criadoEm: string
}

export const cotacaoService = {
  uploadPdf: async (file: File): Promise<CotacaoResponseDTO> => {
    const token = tokenStore.get()
    const form = new FormData()
    form.append('file', file)
    const res = await fetch(`${BASE_URL}/api/cotacoes/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw Object.assign(new Error(body.message ?? `HTTP ${res.status}`), { status: res.status })
    }
    return res.json()
  },
}

export type StatusMontagem = 'MONTADOS' | 'DESMONTADOS'
export type TipoVeiculo = 'CARRETA_NORMAL' | 'CARRETA_EXTENDIDA' | 'CAMINHAO_TRUQUE'

export interface FreteCalcularRequest {
  cidadeOrigem: string
  ufOrigem: string
  cidadeDestino: string
  ufDestino: string
  itens: CargoItemDTO[]
  statusMontagem?: StatusMontagem
  tipoVeiculo?: TipoVeiculo
}

export const freteService = {
  calcular: (payload: FreteCalcularRequest) =>
    api.post<FreightResultDTO>('/api/frete/calcular', payload),
}
