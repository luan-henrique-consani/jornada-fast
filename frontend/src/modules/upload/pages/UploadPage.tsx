import { useState, useCallback } from 'react'
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader } from 'lucide-react'
import { cn } from '@/lib/cn'

type FileStatus = 'idle' | 'uploading' | 'success' | 'error'

interface UploadedFile {
  id: string
  name: string
  size: number
  status: FileStatus
  progress: number
  errorMessage?: string
}

export default function UploadPage() {
  const [dragOver, setDragOver] = useState(false)
  const [files, setFiles] = useState<UploadedFile[]>([])

  const processFiles = useCallback((fileList: FileList | null) => {
    if (!fileList) return
    const newFiles: UploadedFile[] = Array.from(fileList)
      .filter((f) => f.type === 'application/pdf' || f.name.endsWith('.xlsx') || f.name.endsWith('.xls'))
      .map((f) => ({
        id: `${f.name}-${Date.now()}`,
        name: f.name,
        size: f.size,
        status: 'uploading',
        progress: 0,
      }))

    setFiles((prev) => [...prev, ...newFiles])

    newFiles.forEach((file) => {
      let progress = 0
      const interval = setInterval(() => {
        progress += Math.random() * 25
        if (progress >= 100) {
          clearInterval(interval)
          setFiles((prev) =>
            prev.map((f) => f.id === file.id ? { ...f, status: 'success', progress: 100 } : f)
          )
        } else {
          setFiles((prev) =>
            prev.map((f) => f.id === file.id ? { ...f, progress: Math.min(progress, 95) } : f)
          )
        }
      }, 400)
    })
  }, [])

  function removeFile(id: string) {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-tx">Nova Proposta</h1>
        <p className="text-tx-3 text-[13.5px] mt-1">Envie um PDF ou Excel para extração automática de dados</p>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); processFiles(e.dataTransfer.files) }}
        className={cn(
          'border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer',
          dragOver ? 'border-accent bg-accent-50' : 'border-border hover:border-primary-light hover:bg-primary-50'
        )}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          accept=".pdf,.xlsx,.xls"
          multiple
          className="hidden"
          onChange={(e) => processFiles(e.target.files)}
        />
        <div className={cn(
          'w-12 h-12 rounded-full grid place-items-center mx-auto mb-4 transition-colors',
          dragOver ? 'bg-accent text-white' : 'bg-primary-50 text-primary-light'
        )}>
          <Upload size={22} />
        </div>
        <p className="font-semibold text-tx text-[15px] mb-1">
          {dragOver ? 'Solte o arquivo aqui' : 'Arraste e solte ou clique para selecionar'}
        </p>
        <p className="text-tx-3 text-[13px]">PDF ou Excel · até 50 MB por arquivo</p>
      </div>

      {files.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-[13px] font-semibold text-tx-3 uppercase tracking-wide">Arquivos</h3>
          {files.map((file) => (
            <div key={file.id} className="bg-white border border-border rounded-xl p-4 flex items-center gap-4">
              <div className="w-9 h-9 bg-primary-50 rounded-lg grid place-items-center flex-shrink-0">
                <FileText size={18} className="text-primary-light" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-[13.5px] text-tx truncate">{file.name}</span>
                  <span className="text-[12px] text-tx-muted ml-2 flex-shrink-0">{formatSize(file.size)}</span>
                </div>
                {file.status === 'uploading' && (
                  <div className="w-full h-1.5 bg-surface-2 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-light rounded-full transition-all duration-300" style={{ width: `${file.progress}%` }} />
                  </div>
                )}
                {file.status === 'success' && (
                  <div className="flex items-center gap-1.5 text-success text-[12px]">
                    <CheckCircle size={13} />Processado com sucesso
                  </div>
                )}
                {file.status === 'error' && (
                  <div className="flex items-center gap-1.5 text-danger text-[12px]">
                    <AlertCircle size={13} />{file.errorMessage ?? 'Erro ao processar'}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {file.status === 'uploading' && <Loader size={16} className="text-primary-light animate-spin" />}
                {file.status === 'success' && <CheckCircle size={16} className="text-success" />}
                <button onClick={() => removeFile(file.id)} className="text-tx-muted hover:text-danger transition-colors p-1 rounded">
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 text-[13px] text-primary-light">
        <strong className="font-semibold">O sistema irá automaticamente:</strong>
        <ul className="mt-2 flex flex-col gap-1.5 list-disc list-inside text-primary/80">
          <li>Extrair itens, quantidades e dimensões do documento</li>
          <li>Identificar origem e destino da entrega</li>
          <li>Calcular rota, pedágios e volumetria</li>
          <li>Gerar proposta de frete completa</li>
        </ul>
      </div>
    </div>
  )
}
