import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Upload,
  FileText,
  X,
  CheckCircle,
  AlertCircle,
  Loader,
  ChevronRight,
  MapPin,
  Package,
  Ruler,
  Truck,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { MOCK_COTACAO_OC_2025_00847 } from '@/mocks/cotacao'

type FileStatus = 'idle' | 'uploading' | 'success' | 'error'
type UploadPhase = 'sending' | 'extracting' | 'calculating'

interface UploadedFile {
  id: string
  name: string
  size: number
  status: FileStatus
  progress: number
  phase: UploadPhase
  errorMessage?: string
}

const PHASE_LABELS: Record<UploadPhase, string> = {
  sending: 'Enviando arquivo...',
  extracting: 'Extraindo dados do PDF...',
  calculating: 'Calculando volumetria e frete...',
}

export default function UploadPage() {
  const navigate = useNavigate()
  const [dragOver, setDragOver] = useState(false)
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [resultId, setResultId] = useState<string | null>(null)

  const processFiles = useCallback((fileList: FileList | null) => {
    if (!fileList) return
    const newFiles: UploadedFile[] = Array.from(fileList)
      .filter((f) => f.type === 'application/pdf' || f.name.endsWith('.pdf'))
      .map((f) => ({
        id: `${f.name}-${Date.now()}`,
        name: f.name,
        size: f.size,
        status: 'uploading' as FileStatus,
        progress: 0,
        phase: 'sending' as UploadPhase,
      }))

    if (newFiles.length === 0) return
    setFiles((prev) => [...prev, ...newFiles])

    newFiles.forEach((file) => {
      simulateUpload(file.id)
    })
  }, [])

  function simulateUpload(fileId: string) {
    let progress = 0
    let phase: UploadPhase = 'sending'

    const interval = setInterval(() => {
      progress += Math.random() * 18 + 6

      if (progress >= 33 && phase === 'sending') {
        phase = 'extracting'
      } else if (progress >= 66 && phase === 'extracting') {
        phase = 'calculating'
      }

      if (progress >= 100) {
        clearInterval(interval)
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileId ? { ...f, status: 'success', progress: 100, phase: 'calculating' } : f,
          ),
        )
        setResultId(MOCK_COTACAO_OC_2025_00847.publicId)
      } else {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileId ? { ...f, progress: Math.min(progress, 95), phase } : f,
          ),
        )
      }
    }, 350)
  }

  function removeFile(id: string) {
    setFiles((prev) => prev.filter((f) => f.id !== id))
    if (files.filter((f) => f.id !== id).every((f) => f.status !== 'success')) {
      setResultId(null)
    }
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }

  const cotacao = MOCK_COTACAO_OC_2025_00847
  const hasSuccess = files.some((f) => f.status === 'success')

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-tx">Nova Proposta</h1>
        <p className="text-tx-3 text-[13.5px] mt-1">
          Envie um PDF de Ordem de Compra para extração automática de dados
        </p>
      </div>

      {/* Drop zone — oculta após upload */}
      {!hasSuccess && (
        <div
          onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragOver(true) }}
          onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setDragOver(true) }}
          onDragLeave={(e) => {
            e.preventDefault()
            // só desativa se saiu da área inteira (não apenas de um filho)
            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
              setDragOver(false)
            }
          }}
          onDrop={(e) => { e.preventDefault(); e.stopPropagation(); setDragOver(false); processFiles(e.dataTransfer.files) }}
          className={cn(
            'border-2 border-dashed rounded-xl text-center transition-all cursor-pointer select-none',
            'min-h-[220px] flex flex-col items-center justify-center gap-4 px-8 py-14',
            dragOver
              ? 'border-accent bg-accent-50 scale-[1.01]'
              : 'border-border hover:border-primary-light hover:bg-primary-50',
          )}
          onClick={() => document.getElementById('file-input')?.click()}
        >
          <input
            id="file-input"
            type="file"
            accept=".pdf"
            multiple
            className="hidden"
            onChange={(e) => processFiles(e.target.files)}
          />
          <div
            className={cn(
              'w-16 h-16 rounded-full grid place-items-center transition-colors pointer-events-none',
              dragOver ? 'bg-accent text-white' : 'bg-primary-50 text-primary-light',
            )}
          >
            <Upload size={28} />
          </div>
          <div className="pointer-events-none flex flex-col gap-1.5 items-center">
            <p className="font-semibold text-tx text-[16px]">
              {dragOver ? 'Solte o arquivo aqui' : 'Arraste e solte o PDF aqui'}
            </p>
            <p className="text-tx-3 text-[13px]">ou <span className="text-primary-light font-semibold">clique para selecionar</span></p>
            <p className="text-tx-muted text-[12px] mt-1">PDF de Ordem de Compra · até 10 MB</p>
          </div>
        </div>
      )}

      {/* Lista de arquivos */}
      {files.length > 0 && (
        <div className="flex flex-col gap-3">
          {!hasSuccess && (
            <h3 className="text-[13px] font-semibold text-tx-3 uppercase tracking-wide">
              Arquivos
            </h3>
          )}
          {files.map((file) => (
            <div
              key={file.id}
              className={cn(
                'bg-white border rounded-xl p-4 flex items-center gap-4',
                file.status === 'success' ? 'border-success/30 bg-success-50' : 'border-border',
              )}
            >
              <div
                className={cn(
                  'w-9 h-9 rounded-lg grid place-items-center flex-shrink-0',
                  file.status === 'success' ? 'bg-success/10' : 'bg-primary-50',
                )}
              >
                <FileText
                  size={18}
                  className={file.status === 'success' ? 'text-success' : 'text-primary-light'}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-[13.5px] text-tx truncate">{file.name}</span>
                  <span className="text-[12px] text-tx-muted ml-2 flex-shrink-0">
                    {formatSize(file.size)}
                  </span>
                </div>
                {file.status === 'uploading' && (
                  <div className="flex flex-col gap-1.5">
                    <div className="w-full h-1.5 bg-surface-2 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-light rounded-full transition-all duration-300"
                        style={{ width: `${file.progress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11.5px] text-tx-muted">
                      <span>{PHASE_LABELS[file.phase]}</span>
                      <span className="font-mono">{Math.round(file.progress)}%</span>
                    </div>
                  </div>
                )}
                {file.status === 'success' && (
                  <div className="flex items-center gap-1.5 text-success text-[12px] font-medium">
                    <CheckCircle size={13} />
                    Dados extraídos com sucesso · OC-2025-00847
                  </div>
                )}
                {file.status === 'error' && (
                  <div className="flex items-center gap-1.5 text-danger text-[12px]">
                    <AlertCircle size={13} />
                    {file.errorMessage ?? 'Erro ao processar'}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {file.status === 'uploading' && (
                  <Loader size={16} className="text-primary-light animate-spin" />
                )}
                {file.status === 'success' && <CheckCircle size={16} className="text-success" />}
                <button
                  onClick={() => removeFile(file.id)}
                  className="text-tx-muted hover:text-danger transition-colors p-1 rounded"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resultado rápido após sucesso */}
      {hasSuccess && resultId && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[13.5px] font-semibold text-tx uppercase tracking-wide">
              Resultado da Extração
            </h3>
            <span className="text-[12px] text-tx-muted">
              {cotacao.dadosExtraidos.dataDocumento}
            </span>
          </div>

          {/* Cards resumo */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white border border-border rounded-xl p-4 flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-tx-3 text-[12px]">
                <MapPin size={13} className="text-primary-light" />
                Rota
              </div>
              <div className="font-semibold text-tx text-[13.5px]">
                {cotacao.frete.rota.origem}
              </div>
              <div className="text-tx-3 text-[12px]">→ {cotacao.frete.rota.destino}</div>
              <div className="text-tx-muted text-[11.5px] mt-0.5 font-mono">
                {cotacao.frete.rota.distanciaKm} km · {cotacao.frete.rota.duracaoHoras}h
              </div>
            </div>

            <div className="bg-white border border-border rounded-xl p-4 flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-tx-3 text-[12px]">
                <Package size={13} className="text-primary-light" />
                Volumetria
              </div>
              <div className="font-bold text-tx text-[20px] font-mono leading-none">
                {cotacao.frete.volumetria.volumeTotalM3.toFixed(2)}{' '}
                <span className="text-[13px] font-normal text-tx-3">m³</span>
              </div>
              <div className="text-tx-muted text-[11.5px] font-mono">
                {cotacao.frete.volumetria.totalVolumes.toLocaleString('pt-BR')} volumes ·{' '}
                {cotacao.frete.volumetria.pesoTotalKg.toFixed(0)} kg
              </div>
            </div>

            <div className="bg-white border border-border rounded-xl p-4 flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-tx-3 text-[12px]">
                <Ruler size={13} className="text-primary-light" />
                Metros de carroceria
              </div>
              <div className="font-bold text-tx text-[20px] font-mono leading-none">
                {cotacao.frete.volumetria.metrosCaminhao.toFixed(2)}{' '}
                <span className="text-[13px] font-normal text-tx-3">m</span>
              </div>
              <div className="text-tx-muted text-[11.5px] font-mono">
                NViA: {cotacao.frete.volumetria.metrosCaminhaoNvia.toFixed(2)} m · Venda:{' '}
                {cotacao.frete.volumetria.metrosCaminhaoVenda.toFixed(2)} m
              </div>
            </div>

            <div className="bg-white border border-border rounded-xl p-4 flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-tx-3 text-[12px]">
                <Truck size={13} className="text-primary-light" />
                Veículo recomendado
              </div>
              <div className="font-semibold text-tx text-[13.5px]">Caminhão Truque</div>
              <div className="text-tx-muted text-[11.5px]">
                {cotacao.frete.pedagios.quantidadePedagios} pedágios · R${' '}
                {cotacao.frete.pedagios.valorTotalReais.toFixed(2).replace('.', ',')}
              </div>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={() => navigate(`/propostas/${resultId}`)}
            className="flex items-center justify-center gap-2 w-full py-3 bg-accent hover:bg-accent-hover text-white font-semibold rounded-xl text-[14px] transition-colors"
          >
            Ver proposta completa
            <ChevronRight size={16} />
          </button>

          <button
            onClick={() => { setFiles([]); setResultId(null) }}
            className="text-center text-[13px] text-tx-3 hover:text-tx transition-colors"
          >
            Enviar outro arquivo
          </button>
        </div>
      )}

      {/* Info box — só quando ainda não processou */}
      {!hasSuccess && (
        <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 text-[13px] text-primary-light">
          <strong className="font-semibold">O sistema irá automaticamente:</strong>
          <ul className="mt-2 flex flex-col gap-1.5 list-disc list-inside text-primary/80">
            <li>Extrair itens, quantidades e dimensões do documento</li>
            <li>Identificar origem e destino da entrega</li>
            <li>Calcular volumetria e metros de carroceria</li>
            <li>Recomendar modal e gerar proposta completa</li>
          </ul>
        </div>
      )}
    </div>
  )
}
