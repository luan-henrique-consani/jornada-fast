import type { CotacaoResponseDTO } from '@/services/cotacao.service'

export const MOCK_COTACAO_OC_2025_00847: CotacaoResponseDTO = {
  estimativaId: 1001,
  publicId: 'oc-2025-00847',
  cliente: 'Supermercados Bom Preço · Filial Maringá',
  origem: 'Joinville/SC',
  destino: 'Maringá/PR',
  criadoEm: new Date().toISOString(),

  dadosExtraidos: {
    numeroProposta: 'OC-2025-00847',
    cliente: 'Supermercados Bom Preço · Filial Maringá',
    dataDocumento: '10/06/2025',
    cidadeOrigem: 'Joinville',
    estadoOrigem: 'SC',
    cepOrigem: '89.201-020',
    cidadeDestino: 'Maringá',
    estadoDestino: 'PR',
    cepDestino: '87.020-050',
    observacoes:
      'Agendamento obrigatório com 48h de antecedência. Entrega somente com NF. Horário: Seg–Sex 07h–17h. Contato: Sr. Marcos Rodrigues.',
    itens: [
      {
        codigo: 'BASE-125',
        descricao: 'Base de Gôndola 125cm',
        quantidade: 48,
        pesoUnitarioKg: 3.2,
        pesoTotalKg: 153.6,
        alturaM: 0.08,
        larguraM: 0.45,
        comprimentoM: 1.25,
      },
      {
        codigo: 'COL-125',
        descricao: 'Coluna 1,25m',
        quantidade: 96,
        pesoUnitarioKg: 1.8,
        pesoTotalKg: 172.8,
        alturaM: 1.25,
        larguraM: 0.04,
        comprimentoM: 0.04,
      },
      {
        codigo: 'PTR-500',
        descricao: 'Painel Traseiro 500×1250mm',
        quantidade: 192,
        pesoUnitarioKg: 1.1,
        pesoTotalKg: 211.2,
        alturaM: 1.25,
        larguraM: 0.5,
        comprimentoM: 0.008,
      },
      {
        codigo: 'PRT-400',
        descricao: 'Prateleira 400×500mm',
        quantidade: 240,
        pesoUnitarioKg: 0.9,
        pesoTotalKg: 216.0,
        alturaM: 0.02,
        larguraM: 0.4,
        comprimentoM: 0.5,
      },
      {
        codigo: 'PRT-600',
        descricao: 'Prateleira 600×500mm',
        quantidade: 144,
        pesoUnitarioKg: 1.1,
        pesoTotalKg: 158.4,
        alturaM: 0.02,
        larguraM: 0.6,
        comprimentoM: 0.5,
      },
      {
        codigo: 'PRT-900',
        descricao: 'Prateleira 900×500mm',
        quantidade: 96,
        pesoUnitarioKg: 1.4,
        pesoTotalKg: 134.4,
        alturaM: 0.02,
        larguraM: 0.9,
        comprimentoM: 0.5,
      },
      {
        codigo: 'DIV-400',
        descricao: 'Divisor de Prateleira 400mm',
        quantidade: 384,
        pesoUnitarioKg: 0.3,
        pesoTotalKg: 115.2,
        alturaM: 0.15,
        larguraM: 0.004,
        comprimentoM: 0.4,
      },
      {
        codigo: 'GAN-150',
        descricao: 'Gancho Simples 150mm',
        quantidade: 240,
        pesoUnitarioKg: 0.08,
        pesoTotalKg: 19.2,
        alturaM: 0.15,
        larguraM: 0.006,
        comprimentoM: 0.15,
      },
      {
        codigo: 'PROT-COL',
        descricao: 'Protetor de Coluna',
        quantidade: 48,
        pesoUnitarioKg: 0.5,
        pesoTotalKg: 24.0,
        alturaM: 1.0,
        larguraM: 0.05,
        comprimentoM: 0.05,
      },
      {
        codigo: 'CHK-FRT',
        descricao: 'Checkout Frente de Caixa',
        quantidade: 6,
        pesoUnitarioKg: 52.0,
        pesoTotalKg: 312.0,
        alturaM: 1.0,
        larguraM: 0.85,
        comprimentoM: 2.2,
      },
    ],
  },

  frete: {
    rota: {
      origem: 'Joinville/SC',
      destino: 'Maringá/PR',
      distanciaKm: 534,
      duracaoHoras: 6.5,
      provider: 'mock',
    },
    pedagios: {
      quantidadePedagios: 7,
      valorTotalReais: 182.4,
      provider: 'mock',
    },
    volumetria: {
      volumeTotalM3: 33.23,
      pesoTotalKg: 1516.8,
      metrosCaminhao: 6.646,
      metrosCaminhaoNvia: 7.311,
      metrosCaminhaoVenda: 7.975,
      totalVolumes: 1254,
    },
    valorFreteBase: 2326.1,
    valorFreteNvia: 2558.85,
    valorFreteVenda: 2791.25,
    tipoVeiculo: 'CAMINHAO_TRUQUE',
  },
}

// ─── breakdown por categoria (dado extra para o front) ──────────────────────

export interface CategoriaVolume {
  categoria: string
  label: string
  volumeBruto: number
  volumeAjustado: number
  fator: number
  itens: number
}

export const MOCK_BREAKDOWN_CATEGORIAS: CategoriaVolume[] = [
  {
    categoria: 'LSG',
    label: 'Gôndolas (LSG)',
    volumeBruto: 15.58,
    volumeAjustado: 21.81,
    fator: 1.4,
    itens: 9,
  },
  {
    categoria: 'CHECKOUTS',
    label: 'Checkouts',
    volumeBruto: 11.42,
    volumeAjustado: 11.42,
    fator: 1.0,
    itens: 1,
  },
]

// ─── itens com volume calculado (dado extra para o front) ─────────────────────

export interface ItemComVolume {
  codigo: string
  descricao: string
  categoria: string
  quantidade: number
  qtdPorM3: number
  volume: number
  pesoTotalKg: number
}

export const MOCK_ITENS_VOLUME: ItemComVolume[] = [
  { codigo: 'BASE-125', descricao: 'Base de Gôndola 125cm',    categoria: 'LSG',       quantidade: 48,  qtdPorM3: 124.0,  volume: 0.387, pesoTotalKg: 153.6 },
  { codigo: 'COL-125',  descricao: 'Coluna 1,25m',             categoria: 'LSG',       quantidade: 96,  qtdPorM3: 86.0,   volume: 1.116, pesoTotalKg: 172.8 },
  { codigo: 'PTR-500',  descricao: 'Painel Traseiro 500×1250', categoria: 'LSG',       quantidade: 192, qtdPorM3: 120.0,  volume: 1.600, pesoTotalKg: 211.2 },
  { codigo: 'PRT-400',  descricao: 'Prateleira 400×500mm',     categoria: 'LSG',       quantidade: 240, qtdPorM3: 70.0,   volume: 3.429, pesoTotalKg: 216.0 },
  { codigo: 'PRT-600',  descricao: 'Prateleira 600×500mm',     categoria: 'LSG',       quantidade: 144, qtdPorM3: 55.0,   volume: 2.618, pesoTotalKg: 158.4 },
  { codigo: 'PRT-900',  descricao: 'Prateleira 900×500mm',     categoria: 'LSG',       quantidade: 96,  qtdPorM3: 40.0,   volume: 2.400, pesoTotalKg: 134.4 },
  { codigo: 'DIV-400',  descricao: 'Divisor de Prateleira 400mm', categoria: 'LSG',   quantidade: 384, qtdPorM3: 140.0,  volume: 2.743, pesoTotalKg: 115.2 },
  { codigo: 'GAN-150',  descricao: 'Gancho Simples 150mm',     categoria: 'LSG',       quantidade: 240, qtdPorM3: 350.0,  volume: 0.686, pesoTotalKg: 19.2  },
  { codigo: 'PROT-COL', descricao: 'Protetor de Coluna',       categoria: 'LSG',       quantidade: 48,  qtdPorM3: 80.0,   volume: 0.600, pesoTotalKg: 24.0  },
  { codigo: 'CHK-FRT',  descricao: 'Checkout Frente de Caixa', categoria: 'CHECKOUTS', quantidade: 6,   qtdPorM3: 0.525,  volume: 11.42, pesoTotalKg: 312.0 },
]
