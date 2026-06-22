import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { jsPDF } from 'jspdf'
import {
  ArrowLeft, MapPin, Package, Ruler, Truck, Clock,
  AlertCircle, CheckCircle, Info, ChevronRight,
  FileDown, Star, Weight, BarChart3, SlidersHorizontal,
  FileText, Loader, ThumbsUp,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import {
  MOCK_COTACAO_OC_2025_00847,
  MOCK_BREAKDOWN_CATEGORIAS,
  MOCK_ITENS_VOLUME,
} from '@/mocks/cotacao'
import { MOCK_PROPOSTAS } from '@/mocks/propostas'

// ─── TIPOS ────────────────────────────────────────────────────────────────────

interface Veiculo {
  id: string
  nome: string
  capacidadeM3: [number, number]
  comprimentoM: number
  descricao: string
  ocupacaoPct: number
  metrosNecessarios: number
  freteBRL: number
  recomendado: boolean
}

type StepId = 'proposta' | 'pecas' | 'veiculos' | 'revisao'

// ─── DADOS ────────────────────────────────────────────────────────────────────

const CATEGORIA_LABELS: Record<string, string> = {
  LSG: 'Gôndolas (LSG)',
  MOBILIAS: 'Mobílias',
  RACK_SLIM: 'Rack Slim',
  CHECKOUTS: 'Checkouts',
  PORTA_PALLETS: 'Porta Pallets',
}

const CATEGORIA_COLORS: Record<string, string> = {
  LSG: 'bg-primary-light',
  CHECKOUTS: 'bg-accent',
  MOBILIAS: 'bg-success',
  RACK_SLIM: 'bg-warning',
  PORTA_PALLETS: 'bg-violet-500',
}

const VEICULOS: Veiculo[] = [
  {
    id: 'CAMINHAO_TRUQUE',
    nome: 'Caminhão Truque',
    capacidadeM3: [35, 40],
    comprimentoM: 7.0,
    descricao: 'Ideal para entregas urbanas e locais com espaço limitado de manobra.',
    ocupacaoPct: Math.round((33.23 / 37.5) * 100),
    metrosNecessarios: 6.65,
    freteBRL: 2791.25,
    recomendado: true,
  },
  {
    id: 'CARRETA_NORMAL',
    nome: 'Carreta Normal',
    capacidadeM3: [55, 60],
    comprimentoM: 12.3,
    descricao: 'Melhor custo por m³ em cargas maiores. Requer doca adequada.',
    ocupacaoPct: Math.round((33.23 / 57.5) * 100),
    metrosNecessarios: 6.65,
    freteBRL: 3450.0,
    recomendado: false,
  },
  {
    id: 'CARRETA_EXTENDIDA',
    nome: 'Carreta Extendida',
    capacidadeM3: [60, 70],
    comprimentoM: 14.0,
    descricao: 'Para volumes acima de 55 m³. Baixa ocupação para esta carga.',
    ocupacaoPct: Math.round((33.23 / 65) * 100),
    metrosNecessarios: 6.65,
    freteBRL: 3850.0,
    recomendado: false,
  },
]

const STEPS: { id: StepId; label: string; short: string }[] = [
  { id: 'proposta', label: 'Proposta',  short: '1' },
  { id: 'pecas',    label: 'Peças',     short: '2' },
  { id: 'veiculos', label: 'Veículos',  short: '3' },
  { id: 'revisao',  label: 'Revisão',   short: '4' },
]

function fmt(n: number, dec = 2) {
  return n.toFixed(dec).replace('.', ',')
}
function brl(n: number) {
  return `R$ ${n.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`
}

// ─── STEP 1 — PROPOSTA ────────────────────────────────────────────────────────

function StepProposta() {
  const c = MOCK_COTACAO_OC_2025_00847
  const vol = c.frete.volumetria
  const rota = c.frete.rota
  const pedagios = c.frete.pedagios
  const breakdown = MOCK_BREAKDOWN_CATEGORIAS

  return (
    <div className="flex flex-col gap-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Volume total',   value: `${fmt(vol.volumeTotalM3)} m³`,    sub: '10 itens extraídos',          icon: <Package size={15} className="text-primary-light" /> },
          { label: 'Peso total',      value: `${fmt(vol.pesoTotalKg, 0)} kg`,   sub: `${vol.totalVolumes} peças`,   icon: <Weight size={15} className="text-accent" /> },
          { label: 'Mts carroceria',  value: `${fmt(vol.metrosCaminhao)} m`,    sub: `Venda: ${fmt(vol.metrosCaminhaoVenda)} m`, icon: <Ruler size={15} className="text-success" /> },
          { label: 'Distância',       value: `${rota.distanciaKm} km`,          sub: `${rota.duracaoHoras}h estimado`,icon: <MapPin size={15} className="text-warning" /> },
        ].map((k) => (
          <div key={k.label} className="bg-white border border-border rounded-xl p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[12px] text-tx-3">{k.icon}{k.label}</div>
            <div className="font-bold text-tx text-[21px] font-mono leading-none">{k.value}</div>
            <div className="text-[11.5px] text-tx-muted">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Rota */}
        <div className="bg-white border border-border rounded-xl p-5 flex flex-col gap-4">
          <h3 className="font-semibold text-tx text-[14.5px] flex items-center gap-2">
            <MapPin size={15} className="text-primary-light" />Rota
          </h3>
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary-light mt-1.5 flex-shrink-0" />
              <div>
                <div className="text-[11px] text-tx-muted uppercase tracking-wide">Origem</div>
                <div className="font-semibold text-tx">{c.dadosExtraidos.cidadeOrigem}/{c.dadosExtraidos.estadoOrigem}</div>
                <div className="text-[12px] text-tx-3">LOGFAST · CEP {c.dadosExtraidos.cepOrigem}</div>
              </div>
            </div>
            <div className="w-px h-4 bg-border ml-[3.5px]" />
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-accent mt-1.5 flex-shrink-0" />
              <div>
                <div className="text-[11px] text-tx-muted uppercase tracking-wide">Destino</div>
                <div className="font-semibold text-tx">{c.dadosExtraidos.cidadeDestino}/{c.dadosExtraidos.estadoDestino}</div>
                <div className="text-[12px] text-tx-3">CEP {c.dadosExtraidos.cepDestino}</div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border text-center">
            <div><div className="font-mono font-bold text-tx text-[17px]">{rota.distanciaKm}</div><div className="text-[11px] text-tx-muted">km</div></div>
            <div><div className="font-mono font-bold text-tx text-[17px]">{rota.duracaoHoras}h</div><div className="text-[11px] text-tx-muted">duração</div></div>
            <div><div className="font-mono font-bold text-tx text-[17px]">{pedagios.quantidadePedagios}</div><div className="text-[11px] text-tx-muted">pedágios</div></div>
          </div>
        </div>

        {/* Volumetria por categoria */}
        <div className="bg-white border border-border rounded-xl p-5 flex flex-col gap-4">
          <h3 className="font-semibold text-tx text-[14.5px] flex items-center gap-2">
            <BarChart3 size={15} className="text-primary-light" />Volumetria por Categoria
          </h3>
          <div className="flex flex-col gap-3">
            {breakdown.map((cat) => {
              const pct = (cat.volumeAjustado / vol.volumeTotalM3) * 100
              return (
                <div key={cat.categoria}>
                  <div className="flex items-center justify-between mb-1.5 text-[12.5px]">
                    <div className="flex items-center gap-1.5">
                      <span className={cn('w-2 h-2 rounded-sm flex-shrink-0', CATEGORIA_COLORS[cat.categoria] ?? 'bg-tx-muted')} />
                      <span className="text-tx font-medium">{cat.label}</span>
                      <span className="text-tx-muted">×{cat.fator}</span>
                    </div>
                    <span className="font-mono font-semibold text-tx">{fmt(cat.volumeAjustado)} m³</span>
                  </div>
                  <div className="w-full h-2 bg-surface-2 rounded-full overflow-hidden">
                    <div className={cn('h-full rounded-full', CATEGORIA_COLORS[cat.categoria])} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
            <div className="pt-2 border-t border-border flex items-center justify-between text-[13.5px] font-semibold">
              <span className="text-tx">Total ajustado</span>
              <span className="font-mono text-[17px] text-tx">{fmt(vol.volumeTotalM3)} m³</span>
            </div>
          </div>
        </div>
      </div>

      {/* Obs OC */}
      <div className="bg-warning-50 border border-yellow-200 rounded-xl p-4 flex gap-3 text-[13px]">
        <AlertCircle size={15} className="text-warning flex-shrink-0 mt-0.5" />
        <div>
          <div className="font-semibold text-warning mb-1">Observações da OC</div>
          <div className="text-tx-2">{c.dadosExtraidos.observacoes}</div>
        </div>
      </div>
    </div>
  )
}

// ─── STEP 2 — PEÇAS ──────────────────────────────────────────────────────────

function StepPecas() {
  const itens = MOCK_ITENS_VOLUME
  const totalPeso = itens.reduce((s, i) => s + i.pesoTotalKg, 0)
  const totalVol  = itens.reduce((s, i) => s + i.volume, 0)
  const totalQtd  = itens.reduce((s, i) => s + i.quantidade, 0)

  return (
    <div className="flex flex-col gap-6">
      {/* KPIs peças */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total de itens',  value: String(itens.length),          sub: 'tipos de produto' },
          { label: 'Total de peças',  value: totalQtd.toLocaleString('pt-BR'), sub: 'unidades' },
          { label: 'Peso total',      value: `${fmt(totalPeso, 0)} kg`,      sub: `≈ ${fmt(totalPeso / 1000, 2)} t` },
          { label: 'Volume bruto',    value: `${fmt(totalVol)} m³`,          sub: 'antes do fator' },
        ].map((k) => (
          <div key={k.label} className="bg-white border border-border rounded-xl p-4 flex flex-col gap-1">
            <div className="text-[12px] text-tx-3">{k.label}</div>
            <div className="font-bold text-tx text-[21px] font-mono leading-none">{k.value}</div>
            <div className="text-[11.5px] text-tx-muted">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Tabela detalhada */}
      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center gap-3">
          <Package size={15} className="text-primary-light" />
          <h3 className="font-semibold text-tx text-[14.5px]">Detalhamento de Peças</h3>
          <span className="ml-auto text-[12px] text-tx-muted bg-surface-2 px-2 py-0.5 rounded font-mono">{itens.length} SKUs</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="border-b border-border bg-surface-1">
                {['Código','Descrição','Cat.','Qtd','Qtd/m³','Vol (m³)','Peso un.','Peso tot.','C × L × A'].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left font-semibold text-tx-3 text-[11px] uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {itens.map((item) => {
                const oc = MOCK_COTACAO_OC_2025_00847.dadosExtraidos.itens.find((i) => i.codigo === item.codigo)
                return (
                  <tr key={item.codigo} className="hover:bg-surface-1 transition-colors">
                    <td className="px-4 py-2.5 font-mono text-[12px] text-tx-2 whitespace-nowrap">{item.codigo}</td>
                    <td className="px-4 py-2.5 text-tx max-w-[180px] truncate">{item.descricao}</td>
                    <td className="px-4 py-2.5">
                      <span className={cn('text-[10.5px] font-semibold px-1.5 py-px rounded text-white whitespace-nowrap', CATEGORIA_COLORS[item.categoria] ?? 'bg-tx-muted')}>
                        {CATEGORIA_LABELS[item.categoria] ?? item.categoria}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-tx text-right">{item.quantidade}</td>
                    <td className="px-4 py-2.5 font-mono text-tx-3 text-right">
                      {item.qtdPorM3 < 1 ? fmt(item.qtdPorM3, 3) : fmt(item.qtdPorM3, 0)}
                    </td>
                    <td className="px-4 py-2.5 font-mono font-semibold text-tx text-right">{fmt(item.volume, 3)}</td>
                    <td className="px-4 py-2.5 font-mono text-tx-3 text-right">{oc ? fmt(oc.pesoUnitarioKg, 1) : '—'} kg</td>
                    <td className="px-4 py-2.5 font-mono text-tx-3 text-right">{fmt(item.pesoTotalKg, 1)} kg</td>
                    <td className="px-4 py-2.5 font-mono text-tx-3 text-right whitespace-nowrap">
                      {oc ? `${fmt(oc.comprimentoM, 2)}×${fmt(oc.larguraM, 2)}×${fmt(oc.alturaM, 2)}` : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="bg-surface-1 border-t-2 border-border font-semibold text-[12.5px]">
                <td colSpan={3} className="px-4 py-2.5 text-tx">Total</td>
                <td className="px-4 py-2.5 font-mono text-right text-tx">{totalQtd}</td>
                <td />
                <td className="px-4 py-2.5 font-mono text-right text-tx">{fmt(totalVol, 3)}</td>
                <td />
                <td className="px-4 py-2.5 font-mono text-right text-tx">{fmt(totalPeso, 1)} kg</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Breakdown por categoria */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(
          itens.reduce<Record<string, { itens: number; qtd: number; vol: number; peso: number }>>((acc, i) => {
            if (!acc[i.categoria]) acc[i.categoria] = { itens: 0, qtd: 0, vol: 0, peso: 0 }
            acc[i.categoria].itens++
            acc[i.categoria].qtd += i.quantidade
            acc[i.categoria].vol += i.volume
            acc[i.categoria].peso += i.pesoTotalKg
            return acc
          }, {})
        ).map(([cat, data]) => (
          <div key={cat} className="bg-white border border-border rounded-xl p-4 flex items-center gap-4">
            <div className={cn('w-10 h-10 rounded-lg grid place-items-center flex-shrink-0', CATEGORIA_COLORS[cat] ?? 'bg-tx-muted')}>
              <Package size={16} className="text-white" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-tx text-[13.5px]">{CATEGORIA_LABELS[cat] ?? cat}</div>
              <div className="text-[12px] text-tx-3 mt-0.5">
                {data.itens} SKU · {data.qtd} peças · {fmt(data.vol, 2)} m³ · {fmt(data.peso, 0)} kg
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── STEP 3 — VEÍCULOS ───────────────────────────────────────────────────────

function StepVeiculos({ selected, onSelect }: { selected: string; onSelect: (id: string) => void }) {
  const vol = MOCK_COTACAO_OC_2025_00847.frete.volumetria

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 flex gap-3 text-[13px] text-primary-light">
        <Info size={14} className="flex-shrink-0 mt-0.5" />
        <span>
          Volume calculado: <strong>{fmt(vol.volumeTotalM3)} m³</strong> · Metros de carroceria:{' '}
          <strong>{fmt(vol.metrosCaminhaoVenda)} m (venda)</strong>. Selecione o veículo mais adequado para esta carga.
        </span>
      </div>

      {/* Cards de veículo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {VEICULOS.map((v) => {
          const isSelected = selected === v.id
          const ocupacao = v.ocupacaoPct
          const ocupacaoCor = ocupacao >= 80 ? 'bg-success' : ocupacao >= 50 ? 'bg-warning' : 'bg-danger'

          return (
            <button
              key={v.id}
              onClick={() => onSelect(v.id)}
              className={cn(
                'text-left rounded-xl border-2 p-5 flex flex-col gap-4 transition-all',
                isSelected
                  ? 'border-accent bg-accent-50 shadow-md'
                  : 'border-border bg-white hover:border-primary-light hover:shadow-sm',
              )}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Truck size={16} className={isSelected ? 'text-accent' : 'text-primary-light'} />
                    {v.recomendado && (
                      <span className="flex items-center gap-1 text-[10.5px] font-bold text-success bg-success-50 border border-green-200 px-1.5 py-px rounded">
                        <Star size={9} />RECOMENDADO
                      </span>
                    )}
                  </div>
                  <div className={cn('font-bold text-[15px]', isSelected ? 'text-accent' : 'text-tx')}>
                    {v.nome}
                  </div>
                </div>
                <div className={cn(
                  'w-5 h-5 rounded-full border-2 flex-shrink-0 grid place-items-center mt-1',
                  isSelected ? 'border-accent bg-accent' : 'border-border',
                )}>
                  {isSelected && <CheckCircle size={12} className="text-white" />}
                </div>
              </div>

              {/* Capacidade */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-tx-3">Capacidade</span>
                  <span className="font-mono font-semibold text-tx">{v.capacidadeM3[0]}–{v.capacidadeM3[1]} m³</span>
                </div>
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-tx-3">Comprimento</span>
                  <span className="font-mono font-semibold text-tx">{v.comprimentoM} m</span>
                </div>
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-tx-3">Frete estimado</span>
                  <span className={cn('font-mono font-semibold', isSelected ? 'text-accent' : 'text-tx')}>
                    {brl(v.freteBRL)}
                  </span>
                </div>
              </div>

              {/* Ocupação */}
              <div>
                <div className="flex items-center justify-between mb-1.5 text-[12px]">
                  <span className="text-tx-3">Ocupação</span>
                  <span className={cn('font-mono font-semibold', ocupacao >= 80 ? 'text-success' : ocupacao >= 50 ? 'text-warning' : 'text-danger')}>
                    {ocupacao}%
                  </span>
                </div>
                <div className="w-full h-2 bg-surface-2 rounded-full overflow-hidden">
                  <div className={cn('h-full rounded-full transition-all', ocupacaoCor)} style={{ width: `${ocupacao}%` }} />
                </div>
              </div>

              <p className="text-[12px] text-tx-3 leading-relaxed border-t border-border/60 pt-3">{v.descricao}</p>
            </button>
          )
        })}
      </div>

      {/* Tabela comparativa */}
      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <h3 className="font-semibold text-tx text-[14px]">Comparativo de Veículos</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-surface-1 border-b border-border">
                <th className="px-4 py-2.5 text-left text-[11.5px] font-semibold text-tx-3 uppercase tracking-wide">Veículo</th>
                <th className="px-4 py-2.5 text-right text-[11.5px] font-semibold text-tx-3 uppercase tracking-wide">Capacidade</th>
                <th className="px-4 py-2.5 text-right text-[11.5px] font-semibold text-tx-3 uppercase tracking-wide">Ocupação</th>
                <th className="px-4 py-2.5 text-right text-[11.5px] font-semibold text-tx-3 uppercase tracking-wide">Mts necessários</th>
                <th className="px-4 py-2.5 text-right text-[11.5px] font-semibold text-tx-3 uppercase tracking-wide">Frete estimado</th>
                <th className="px-4 py-2.5 text-right text-[11.5px] font-semibold text-tx-3 uppercase tracking-wide">R$/m³</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {VEICULOS.map((v) => (
                <tr key={v.id} className={cn('transition-colors', selected === v.id ? 'bg-accent-50' : 'hover:bg-surface-1')}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {selected === v.id && <CheckCircle size={13} className="text-accent" />}
                      <span className={cn('font-semibold', selected === v.id ? 'text-accent' : 'text-tx')}>{v.nome}</span>
                      {v.recomendado && <span className="text-[10px] font-bold text-success bg-success-50 border border-green-200 px-1.5 py-px rounded">REC</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-tx-2">{v.capacidadeM3[0]}–{v.capacidadeM3[1]} m³</td>
                  <td className="px-4 py-3 text-right font-mono font-semibold">
                    <span className={v.ocupacaoPct >= 80 ? 'text-success' : v.ocupacaoPct >= 50 ? 'text-warning' : 'text-danger'}>
                      {v.ocupacaoPct}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-tx-2">{fmt(v.metrosNecessarios)} m</td>
                  <td className={cn('px-4 py-3 text-right font-mono font-bold', selected === v.id ? 'text-accent' : 'text-tx')}>
                    {brl(v.freteBRL)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-tx-2">
                    {brl(v.freteBRL / MOCK_COTACAO_OC_2025_00847.frete.volumetria.volumeTotalM3)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── STEP 4 — REVISÃO ────────────────────────────────────────────────────────

function StepRevisao({
  veiculoId,
  observacoes,
  onObservacoesChange,
  onDownload,
  downloading,
  downloaded,
}: {
  veiculoId: string
  observacoes: string
  onObservacoesChange: (v: string) => void
  onDownload: () => void
  downloading: boolean
  downloaded: boolean
}) {
  const c = MOCK_COTACAO_OC_2025_00847
  const vol = c.frete.volumetria
  const veiculo = VEICULOS.find((v) => v.id === veiculoId) ?? VEICULOS[0]
  const itens = MOCK_ITENS_VOLUME

  return (
    <div className="flex flex-col gap-6">
      {/* Resumo final */}
      <div className="bg-white border border-border rounded-xl p-6 flex flex-col gap-5">
        <h3 className="font-semibold text-tx text-[15px] flex items-center gap-2">
          <SlidersHorizontal size={15} className="text-primary-light" />
          Resumo da Proposta
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Dados da OC */}
          <div className="flex flex-col gap-3">
            <div className="text-[11.5px] font-semibold text-tx-3 uppercase tracking-wide">Dados da OC</div>
            {[
              ['Número',      c.dadosExtraidos.numeroProposta],
              ['Cliente',     c.cliente],
              ['Emissão',     c.dadosExtraidos.dataDocumento],
              ['Origem',      `${c.dadosExtraidos.cidadeOrigem}/${c.dadosExtraidos.estadoOrigem}`],
              ['Destino',     `${c.dadosExtraidos.cidadeDestino}/${c.dadosExtraidos.estadoDestino}`],
              ['Distância',   `${c.frete.rota.distanciaKm} km · ${c.frete.rota.duracaoHoras}h`],
              ['Pedágios',    `${c.frete.pedagios.quantidadePedagios} praças · R$ ${fmt(c.frete.pedagios.valorTotalReais)}`],
            ].map(([k, v]) => (
              <div key={k} className="flex items-start justify-between gap-4 text-[13px]">
                <span className="text-tx-3 flex-shrink-0">{k}</span>
                <span className="text-tx font-medium text-right">{v}</span>
              </div>
            ))}
          </div>

          {/* Volumetria + veículo */}
          <div className="flex flex-col gap-3">
            <div className="text-[11.5px] font-semibold text-tx-3 uppercase tracking-wide">Volumetria &amp; Frete</div>
            {[
              ['Itens',            `${itens.length} SKUs · ${itens.reduce((s, i) => s + i.quantidade, 0)} peças`],
              ['Peso total',       `${fmt(vol.pesoTotalKg, 0)} kg`],
              ['Volume total',     `${fmt(vol.volumeTotalM3)} m³`],
              ['Mts base',         `${fmt(vol.metrosCaminhao)} m`],
              ['Mts NViA (+10%)',  `${fmt(vol.metrosCaminhaoNvia)} m`],
              ['Mts Venda (+20%)', `${fmt(vol.metrosCaminhaoVenda)} m`],
              ['Veículo',          veiculo.nome],
              ['Frete estimado',   brl(veiculo.freteBRL)],
            ].map(([k, v]) => (
              <div key={k} className="flex items-start justify-between gap-4 text-[13px]">
                <span className="text-tx-3 flex-shrink-0">{k}</span>
                <span className={cn('font-medium text-right', k === 'Frete estimado' ? 'text-accent font-bold text-[15px]' : 'text-tx')}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Veículo selecionado */}
      <div className={cn(
        'border-2 rounded-xl p-5 flex items-center gap-4',
        'border-accent bg-accent-50',
      )}>
        <div className="w-11 h-11 bg-white rounded-xl grid place-items-center flex-shrink-0 shadow-sm">
          <Truck size={20} className="text-accent" />
        </div>
        <div className="flex-1">
          <div className="font-bold text-tx text-[15px]">{veiculo.nome}</div>
          <div className="text-[12.5px] text-tx-3 mt-0.5">
            Capacidade {veiculo.capacidadeM3[0]}–{veiculo.capacidadeM3[1]} m³ · Ocupação {veiculo.ocupacaoPct}% · {veiculo.comprimentoM}m de carroceria
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="font-bold text-accent text-[18px] font-mono">{brl(veiculo.freteBRL)}</div>
          <div className="text-[11.5px] text-tx-muted">frete estimado</div>
        </div>
      </div>

      {/* Observações */}
      <div className="bg-white border border-border rounded-xl p-5 flex flex-col gap-3">
        <label className="font-semibold text-tx text-[14px]">
          Observações finais <span className="text-tx-muted font-normal text-[12.5px]">(opcional)</span>
        </label>
        <textarea
          rows={4}
          value={observacoes}
          onChange={(e) => onObservacoesChange(e.target.value)}
          placeholder="Ex: confirmar agendamento com Sr. Marcos Rodrigues pelo telefone (44) 99999-0000 antes do despacho…"
          className="w-full resize-none border border-border rounded-lg px-3 py-2.5 text-[13.5px] text-tx outline-none focus:border-primary-light focus:ring-2 focus:ring-primary-light/20 placeholder:text-tx-muted"
        />
      </div>

      {/* Download PDF */}
      {!downloaded ? (
        <button
          onClick={onDownload}
          disabled={downloading}
          className={cn(
            'flex items-center justify-center gap-3 w-full py-4 rounded-xl font-bold text-[15px] transition-all',
            downloading
              ? 'bg-primary-light text-white cursor-not-allowed'
              : 'bg-accent hover:bg-accent-hover text-white shadow-md hover:shadow-lg',
          )}
        >
          {downloading ? (
            <><Loader size={18} className="animate-spin" />Gerando PDF...</>
          ) : (
            <><FileDown size={18} />Baixar Proposta em PDF</>
          )}
        </button>
      ) : (
        <div className="flex flex-col items-center gap-4 py-6 bg-success-50 border border-green-200 rounded-xl">
          <div className="w-14 h-14 bg-white rounded-full grid place-items-center shadow-sm">
            <ThumbsUp size={26} className="text-success" />
          </div>
          <div className="text-center">
            <div className="font-bold text-tx text-[16px]">PDF gerado com sucesso!</div>
            <div className="text-tx-3 text-[13px] mt-1">
              Proposta_{c.dadosExtraidos.numeroProposta}.pdf foi salvo na sua pasta de downloads.
            </div>
          </div>
          <button
            onClick={onDownload}
            className="flex items-center gap-2 px-5 py-2 bg-white border border-border rounded-lg text-[13.5px] font-semibold text-tx hover:bg-surface-2 transition-colors"
          >
            <FileText size={14} />
            Baixar novamente
          </button>
        </div>
      )}
    </div>
  )
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function PropostaDetailPage() {
  const { id } = useParams<{ id: string }>()
  const proposta = MOCK_PROPOSTAS.find((p) => p.id === id)
  const c = MOCK_COTACAO_OC_2025_00847

  const [step, setStep]         = useState<StepId>('proposta')
  const [veiculo, setVeiculo]   = useState('CAMINHAO_TRUQUE')
  const [obs, setObs]           = useState('')
  const [downloading, setDownloading] = useState(false)
  const [downloaded, setDownloaded]   = useState(false)

  if (!proposta) {
    return (
      <div className="p-8 flex flex-col gap-4">
        <h1 className="text-xl font-bold text-tx">Proposta não encontrada</h1>
        <Link to="/propostas" className="text-accent text-[14px] hover:underline">← Voltar</Link>
      </div>
    )
  }

  function handleDownload() {
    if (downloaded) {
      triggerDownload()
      return
    }
    setDownloading(true)
    setTimeout(() => {
      triggerDownload()
      setDownloading(false)
      setDownloaded(true)
    }, 2200)
  }

  function triggerDownload() {
    const veiculoObj = VEICULOS.find((v) => v.id === veiculo) ?? VEICULOS[0]
    const doc = new jsPDF({ unit: 'mm', format: 'a4' })
    const W = 210
    const mg = 18
    let y = 0

    const txt = (text: string, x: number, yy: number, opts?: { align?: 'left' | 'right' | 'center' }) =>
      doc.text(text, x, yy, opts)

    const section = (title: string) => {
      doc.setFontSize(9.5)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(28, 95, 158)
      txt(title, mg, y)
      y += 3
      doc.setDrawColor(200, 220, 240)
      doc.line(mg, y, W - mg, y)
      y += 5
    }

    const field = (label: string, value: string) => {
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(110, 110, 110)
      txt(label, mg, y)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(30, 30, 30)
      txt(value, mg + 52, y)
      y += 6.5
    }

    // CABEÇALHO
    doc.setFillColor(28, 58, 95)
    doc.rect(0, 0, W, 30, 'F')
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(255, 255, 255)
    txt('LOGFAST', mg, 13)
    doc.setFontSize(8.5)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(160, 190, 220)
    txt('PROPOSTA DE FRETE', mg, 21)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(249, 115, 22)
    txt(c.dadosExtraidos.numeroProposta, W - mg, 13, { align: 'right' })
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(160, 190, 220)
    txt(new Date().toLocaleString('pt-BR'), W - mg, 21, { align: 'right' })
    y = 40

    // DADOS DA OC
    section('DADOS DA ORDEM DE COMPRA')
    field('Número OC',    c.dadosExtraidos.numeroProposta)
    field('Cliente',      c.cliente)
    field('Emissão OC',   c.dadosExtraidos.dataDocumento)
    field('Origem',       `${c.dadosExtraidos.cidadeOrigem}/${c.dadosExtraidos.estadoOrigem}  CEP ${c.dadosExtraidos.cepOrigem}`)
    field('Destino',      `${c.dadosExtraidos.cidadeDestino}/${c.dadosExtraidos.estadoDestino}  CEP ${c.dadosExtraidos.cepDestino}`)
    field('Distância',    `${c.frete.rota.distanciaKm} km · ${c.frete.rota.duracaoHoras}h estimado`)
    field('Pedágios',     `${c.frete.pedagios.quantidadePedagios} praças — R$ ${fmt(c.frete.pedagios.valorTotalReais)}`)
    y += 3

    // ITENS
    section('ITENS DA ORDEM DE COMPRA')
    // header da tabela
    doc.setFillColor(237, 244, 255)
    doc.rect(mg, y - 1.5, W - mg * 2, 7, 'F')
    const cols = [mg, mg + 18, mg + 78, mg + 100, mg + 120, mg + 143]
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(60, 90, 140)
    ;['Cód.', 'Descrição', 'Categoria', 'Qtd', 'Qtd/m³', 'Vol (m³)'].forEach((h, i) => txt(h, cols[i], y + 4))
    y += 8.5
    MOCK_ITENS_VOLUME.forEach((item, idx) => {
      if (idx % 2 === 1) { doc.setFillColor(249, 251, 253); doc.rect(mg, y - 1, W - mg * 2, 6, 'F') }
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(40, 40, 40)
      txt(item.codigo,                         cols[0], y + 3.5)
      txt(item.descricao.substring(0, 28),      cols[1], y + 3.5)
      txt((CATEGORIA_LABELS[item.categoria] ?? item.categoria).substring(0, 12), cols[2], y + 3.5)
      txt(String(item.quantidade),             cols[3], y + 3.5)
      txt(item.qtdPorM3 < 1 ? fmt(item.qtdPorM3, 3) : fmt(item.qtdPorM3, 0), cols[4], y + 3.5)
      doc.setFont('helvetica', 'bold')
      txt(fmt(item.volume, 3),                 cols[5], y + 3.5)
      y += 6
    })
    y += 4

    // VOLUMETRIA
    section('VOLUMETRIA')
    field('Volume total ajustado',    `${fmt(c.frete.volumetria.volumeTotalM3)} m³`)
    field('Peso total',               `${fmt(c.frete.volumetria.pesoTotalKg, 0)} kg`)
    field('Metros de carroceria base',`${fmt(c.frete.volumetria.metrosCaminhao)} m`)
    field('Metros NViA (+10%)',        `${fmt(c.frete.volumetria.metrosCaminhaoNvia)} m`)
    field('Metros Venda (+20%)',       `${fmt(c.frete.volumetria.metrosCaminhaoVenda)} m`)
    y += 3

    // VEÍCULO
    section('VEÍCULO SELECIONADO')
    field('Tipo',            veiculoObj.nome)
    field('Capacidade',      `${veiculoObj.capacidadeM3[0]}–${veiculoObj.capacidadeM3[1]} m³`)
    field('Ocupação',        `${veiculoObj.ocupacaoPct}%`)
    field('Frete estimado',  brl(veiculoObj.freteBRL))
    y += 3

    // OBSERVAÇÕES
    if (obs.trim()) {
      section('OBSERVAÇÕES')
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(60, 60, 60)
      const wrapped = doc.splitTextToSize(obs, W - mg * 2)
      doc.text(wrapped, mg, y)
      y += wrapped.length * 5
    }

    // RODAPÉ
    doc.setDrawColor(210, 210, 210)
    doc.line(mg, 282, W - mg, 282)
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(150, 150, 150)
    txt('LOGFAST Logística · Documento gerado automaticamente pelo sistema', mg, 288)
    txt(new Date().toLocaleString('pt-BR'), W - mg, 288, { align: 'right' })

    doc.save(`Proposta_${c.dadosExtraidos.numeroProposta}.pdf`)
  }

  const currentIdx = STEPS.findIndex((s) => s.id === step)

  function goNext() {
    if (currentIdx < STEPS.length - 1) setStep(STEPS[currentIdx + 1].id)
  }
  function goPrev() {
    if (currentIdx > 0) setStep(STEPS[currentIdx - 1].id)
  }

  return (
    <div className="p-6 md:p-8 flex flex-col gap-6 max-w-6xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[13px] text-tx-3">
        <Link to="/propostas" className="hover:text-tx flex items-center gap-1.5 transition-colors">
          <ArrowLeft size={14} />Propostas
        </Link>
        <span>/</span>
        <span className="text-tx font-medium">{c.dadosExtraidos.numeroProposta}</span>
      </div>

      {/* Header */}
      <div className="bg-white border border-border rounded-xl px-6 py-4 flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 bg-primary-50 rounded-xl grid place-items-center flex-shrink-0">
            <FileText size={18} className="text-primary-light" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-tx tracking-tight">{c.dadosExtraidos.numeroProposta}</h1>
            <p className="text-[13px] text-tx-3">{c.cliente}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-[12.5px] text-tx-muted flex-shrink-0">
          <Clock size={13} />
          <span>Emissão OC: {c.dadosExtraidos.dataDocumento}</span>
        </div>
      </div>

      {/* Stepper */}
      <div className="bg-white border border-border rounded-xl p-4">
        <div className="flex items-center">
          {STEPS.map((s, i) => {
            const isActive   = s.id === step
            const isComplete = i < currentIdx
            return (
              <div key={s.id} className="flex items-center flex-1 last:flex-none">
                <button
                  onClick={() => setStep(s.id)}
                  className="flex items-center gap-2.5 group"
                >
                  <div className={cn(
                    'w-8 h-8 rounded-full grid place-items-center text-[13px] font-bold transition-all flex-shrink-0',
                    isActive   ? 'bg-accent text-white shadow-md shadow-accent/30' :
                    isComplete ? 'bg-success text-white' :
                                 'bg-surface-2 text-tx-3 group-hover:bg-primary-50 group-hover:text-primary-light',
                  )}>
                    {isComplete ? <CheckCircle size={14} /> : s.short}
                  </div>
                  <span className={cn(
                    'text-[13px] font-semibold hidden sm:block',
                    isActive ? 'text-accent' : isComplete ? 'text-success' : 'text-tx-3 group-hover:text-tx',
                  )}>
                    {s.label}
                  </span>
                </button>
                {i < STEPS.length - 1 && (
                  <div className={cn(
                    'flex-1 h-0.5 mx-3',
                    i < currentIdx ? 'bg-success' : 'bg-border',
                  )} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Conteúdo do step */}
      <div>
        {step === 'proposta' && <StepProposta />}
        {step === 'pecas'    && <StepPecas />}
        {step === 'veiculos' && <StepVeiculos selected={veiculo} onSelect={setVeiculo} />}
        {step === 'revisao'  && (
          <StepRevisao
            veiculoId={veiculo}
            observacoes={obs}
            onObservacoesChange={setObs}
            onDownload={handleDownload}
            downloading={downloading}
            downloaded={downloaded}
          />
        )}
      </div>

      {/* Navegação entre steps */}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <button
          onClick={goPrev}
          disabled={currentIdx === 0}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13.5px] font-semibold transition-colors',
            currentIdx === 0
              ? 'text-tx-muted cursor-not-allowed'
              : 'bg-white border border-border text-tx hover:bg-surface-2',
          )}
        >
          <ArrowLeft size={15} />
          {currentIdx > 0 ? STEPS[currentIdx - 1].label : 'Início'}
        </button>

        {step !== 'revisao' ? (
          <button
            onClick={goNext}
            className="flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-hover text-white font-semibold rounded-lg text-[13.5px] transition-colors"
          >
            {STEPS[currentIdx + 1]?.label}
            <ChevronRight size={15} />
          </button>
        ) : (
          <div className="text-[12.5px] text-tx-muted italic">
            {downloaded ? 'Proposta exportada ✓' : 'Clique em Baixar para exportar'}
          </div>
        )}
      </div>
    </div>
  )
}
