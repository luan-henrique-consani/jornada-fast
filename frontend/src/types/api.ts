import type { Categoria, Modal, StatusMontagem } from './common'

export interface ClienteRequest {
  razaoSocial: string
  cnpj: string
  contatoNome: string
  contatoEmail: string
  contatoFone: string
}

export interface EnderecoEntregaRequest {
  descricao: string
  logradouro: string
  numero: string
  complemento?: string
  bairro: string
  cidade: string
  uf: string
  cep: string
  responsavelNome?: string
  responsavelFone?: string
  horarioRecebimento?: string
  observacoes?: string
  temEmpilhadeira: boolean
  principal: boolean
}

export interface ProdutoRequest {
  codigo: string
  codigoLegado?: string
  descricao: string
  categoria: Categoria
  qtdPorM3?: number
  qtdPorM3Base?: number
  isMontante: boolean
  comprimentoM?: number
  larguraM?: number
  alturaM?: number
  pesoBrutoKg?: number
  pesoLiquidoKg?: number
  temConfigurador: boolean
  temRender: boolean
  temCorte: boolean
  temEstrutura: boolean
  numeroEstrutura?: string
}

export interface NomenclaturaRequest {
  codigoAntigo: string
  descricaoAntiga: string
  codigoNovoV1?: string
  descricaoNovaV1?: string
  codigoNovoV2?: string
  descricaoNovaV2?: string
  familia?: string
  formato?: string
  fechamento?: string
  temperatura?: string
  comprimentoM?: number
  larguraM?: number
  alturaM?: number
  pesoBrutoKg?: number
  pesoLiquidoKg?: number
  observacoes?: string
}

export interface ItemOrdemCompraRequest {
  numeroItem: number
  produtoCodigo: string
  descricao: string
  quantidade: number
  unidade: string
}

export interface OrdemCompraRequest {
  numero: string
  emissao: string
  entregaPrevista?: string
  compradorNome?: string
  centroCusto?: string
  condicaoPagamento?: string
  clienteId: number
  enderecoEntregaId?: number
  agendamentoObrigatorio: boolean
  prazoAgendamentoHoras?: number
  observacoes?: string
  itens: ItemOrdemCompraRequest[]
}

export interface EstimativaItemRequest {
  produtoId: number
  quantidade: number
}

export interface EstimativaRequest {
  numeroOc?: string
  clienteId: number
  ordemCompraId?: number
  statusMontagem: StatusMontagem
  itens: EstimativaItemRequest[]
}

export interface FatorAjusteRequest {
  categoria: Categoria
  fator: number
}

export interface ParametroFreteRequest {
  modal: Modal
  constanteSecao: number
  fatorAltura: number
  margemNvia: number
  margemVenda: number
}
