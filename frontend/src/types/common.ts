// ─── Enums ────────────────────────────────────────────────────────────────────

export type Categoria =
  | 'LSG'
  | 'MOBILIAS'
  | 'RACK_SLIM'
  | 'CHECKOUTS'
  | 'PORTA_PALLETS'

export type Modal = 'CAMINHAO' | 'CONTAINER'

export type StatusMontagem = 'MONTADOS' | 'DESMONTADOS'

export type StatusOrdem =
  | 'ABERTA'
  | 'CONFIRMADA'
  | 'EM_TRANSPORTE'
  | 'ENTREGUE'
  | 'CANCELADA'

// ─── Entidades ────────────────────────────────────────────────────────────────

export interface Cliente {
  id: number
  razaoSocial: string
  cnpj: string
  contatoNome: string
  contatoEmail: string
  contatoFone: string
  ativo: boolean
  criadoEm: string
  enderecos?: EnderecoEntrega[]
}

export interface EnderecoEntrega {
  id: number
  clienteId: number
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

export interface Produto {
  id: number
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
  ativo: boolean
  criadoEm: string
  atualizadoEm: string
}

export interface NomenclaturaMapping {
  id: number
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

export interface FatorAjuste {
  id: number
  categoria: Categoria
  fator: number
  vigenteDe: string
  vigenteAte?: string
  criadoPor?: string
  criadoEm: string
}

export interface FatorMontagem {
  id: number
  status: StatusMontagem
  fator: number
}

export interface ParametroFrete {
  id: number
  modal: Modal
  constanteSecao: number
  fatorAltura: number
  margemNvia: number
  margemVenda: number
  vigenteDe: string
  vigenteAte?: string
  criadoPor?: string
  criadoEm: string
}

export interface ItemOrdemCompra {
  id: number
  ordemCompraId: number
  numeroItem: number
  produtoCodigo: string
  descricao: string
  quantidade: number
  unidade: string
}

export interface OrdemCompra {
  id: number
  numero: string
  status: StatusOrdem
  emissao: string
  entregaPrevista?: string
  compradorNome?: string
  centroCusto?: string
  condicaoPagamento?: string
  cliente: Cliente
  enderecoEntrega?: EnderecoEntrega
  agendamentoObrigatorio: boolean
  prazoAgendamentoHoras?: number
  observacoes?: string
  criadoEm: string
  itens: ItemOrdemCompra[]
}

export interface EstimativaItem {
  id: number
  estimativaId: number
  produtoId: number
  produtoCodigo: string
  produtoDescricao: string
  categoria: Categoria
  quantidade: number
  qtdPorM3Utilizado: number
  volumeM3: number
}

export interface Estimativa {
  id: number
  numeroOc?: string
  cliente: Cliente
  ordemCompraId?: number
  statusMontagem: StatusMontagem
  volumeLsgBruto: number
  volumeLsgAjustado: number
  volumeMobiliasBruto: number
  volumeMobiliasAjustado: number
  volumeRackBruto: number
  volumeRackAjustado: number
  volumeCheckoutsBruto: number
  volumeCheckoutsAjustado: number
  volumePortaPalletsBruto: number
  volumePortaPalletsAjustado: number
  volumeTotalM3: number
  mtsCaminhao: number
  mtsContainer: number
  mtsCaminhaoNvia: number
  mtsCaminhaoVenda: number
  mtsContainerNvia: number
  mtsContainerVenda: number
  criadoPor?: string
  criadoEm: string
  itens: EstimativaItem[]
}
