export type StatusProposta = 'Em análise' | 'Aprovada' | 'Calculada' | 'Exportada' | 'Erro'

export interface PropostaMock {
  id: string
  oc: string
  cliente: string
  clienteUF: string
  data: string
  volume: string
  metrosCarroceria: string
  veiculo: string
  status: StatusProposta
  criadoPor: string
}

export const MOCK_PROPOSTAS: PropostaMock[] = [
  {
    id: 'oc-2025-00847',
    oc: 'OC-2025-00847',
    cliente: 'Supermercados Bom Preço · Maringá',
    clienteUF: 'PR',
    data: '18/06/2026 · 14h08',
    volume: '33,23 m³',
    metrosCarroceria: '6,65 m',
    veiculo: 'Caminhão Truque',
    status: 'Calculada',
    criadoPor: 'Carolina Santos',
  },
  {
    id: 'oc-2025-00841',
    oc: 'OC-2025-00841',
    cliente: 'Atacadão · Loja 312 SP',
    clienteUF: 'SP',
    data: '17/06/2026 · 14h22',
    volume: '48,90 m³',
    metrosCarroceria: '9,78 m',
    veiculo: 'Carreta Normal',
    status: 'Em análise',
    criadoPor: 'Carolina Santos',
  },
  {
    id: 'oc-2025-00838',
    oc: 'OC-2025-00838',
    cliente: 'Carrefour · CD Recife',
    clienteUF: 'PE',
    data: '17/06/2026 · 13h08',
    volume: '28,60 m³',
    metrosCarroceria: '5,72 m',
    veiculo: 'Caminhão Truque',
    status: 'Aprovada',
    criadoPor: 'Rafael Mendes',
  },
  {
    id: 'oc-2025-00835',
    oc: 'OC-2025-00835',
    cliente: 'Grupo Mateus · São Luís MA',
    clienteUF: 'MA',
    data: '17/06/2026 · 11h41',
    volume: '57,20 m³',
    metrosCarroceria: '11,44 m',
    veiculo: 'Carreta Normal',
    status: 'Exportada',
    criadoPor: 'Carolina Santos',
  },
  {
    id: 'oc-2025-00832',
    oc: 'OC-2025-00832',
    cliente: 'Assaí · Pacajus CE',
    clienteUF: 'CE',
    data: '17/06/2026 · 10h12',
    volume: '39,40 m³',
    metrosCarroceria: '7,88 m',
    veiculo: 'Caminhão Truque',
    status: 'Exportada',
    criadoPor: 'Rafael Mendes',
  },
  {
    id: 'oc-2025-00828',
    oc: 'OC-2025-00828',
    cliente: 'Tenda · Guarulhos SP',
    clienteUF: 'SP',
    data: '17/06/2026 · 09h33',
    volume: '18,90 m³',
    metrosCarroceria: '3,78 m',
    veiculo: 'Caminhão Truque',
    status: 'Erro',
    criadoPor: 'Carolina Santos',
  },
  {
    id: 'oc-2025-00824',
    oc: 'OC-2025-00824',
    cliente: 'Coop · Santo André SP',
    clienteUF: 'SP',
    data: '16/06/2026 · 18h05',
    volume: '51,80 m³',
    metrosCarroceria: '10,36 m',
    veiculo: 'Carreta Normal',
    status: 'Aprovada',
    criadoPor: 'Rafael Mendes',
  },
  {
    id: 'oc-2025-00820',
    oc: 'OC-2025-00820',
    cliente: 'BIG · Curitiba PR',
    clienteUF: 'PR',
    data: '16/06/2026 · 16h28',
    volume: '44,60 m³',
    metrosCarroceria: '8,92 m',
    veiculo: 'Caminhão Truque',
    status: 'Aprovada',
    criadoPor: 'Carolina Santos',
  },
  {
    id: 'oc-2025-00815',
    oc: 'OC-2025-00815',
    cliente: 'Cencosud · Curitiba PR',
    clienteUF: 'PR',
    data: '15/06/2026 · 15h50',
    volume: '62,10 m³',
    metrosCarroceria: '12,42 m',
    veiculo: 'Carreta Extendida',
    status: 'Exportada',
    criadoPor: 'Rafael Mendes',
  },
]
