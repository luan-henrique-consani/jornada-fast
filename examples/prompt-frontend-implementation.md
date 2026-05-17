# PROMPT — FRONTEND ENTERPRISE: Fast Gôndulas Logistics Platform
## Especificação Técnica Completa v1.0

---

## 1. CONTEXTO DO SISTEMA

Você irá implementar o **frontend enterprise** da plataforma logística **Fast Gôndulas**. O backend é Java Spring Boot e já está implementado — o frontend **não faz nenhum cálculo de negócio**. Toda regra de cálculo (volumetria, cubagem, frete, pedágio, recomendação de veículos) reside exclusivamente no backend.

O frontend:
- Coleta inputs do usuário (upload de arquivos, ajustes de veículos)
- Envia ao backend via API REST
- Recebe os resultados calculados
- Renderiza os dados em telas operacionais de alta densidade
- Mantém sincronização em tempo real via SSE/WebSocket
- Permite edição inline com recálculo imediato via API

**Domínio de negócio:** Fast Gôndulas fabrica equipamentos para varejo (gôndolas, expositores refrigerados, checkouts). O sistema digitaliza o fluxo: OC em PDF/Excel → extração de peças → cubagem → logística → proposta de frete → PDF final.

---

## 2. STACK TÉCNICA DEFINITIVA

```
Runtime:        Node 20+ / Vite 5+
Framework:      React 18 (StrictMode, concurrent features)
Linguagem:      TypeScript 5.x (strict mode, noUncheckedIndexedAccess)
Estilo:         TailwindCSS 3.x + shadcn/ui (Radix UI primitives)
State Server:   TanStack Query v5 (React Query)
State Client:   Zustand 4.x
Formulários:    React Hook Form 7.x + Zod 3.x
HTTP:           Axios 1.x
Roteamento:     React Router 6.x (Data Router)
PDF View:       @react-pdf-viewer/core + pdfjs-dist
PDF Export:     @react-pdf/renderer
Tabelas:        TanStack Table v8
Virtualização:  TanStack Virtual v3
Gráficos:       Recharts 2.x
Notificações:   Sonner (toast)
Datas:          date-fns + react-day-picker
Máscaras:       react-imask
Ícones:         lucide-react
Testes:         Vitest + Testing Library + MSW
```

---

## 3. ESTRUTURA DE PASTAS (Feature-Driven + Domain-Oriented)

```
src/
├── app/                        # Configuração global da aplicação
│   ├── App.tsx                 # Root component
│   ├── providers.tsx           # QueryClient, Zustand, Toast, etc.
│   └── router.tsx              # React Router 6 Data Router config
│
├── assets/                     # Estáticos: imagens, fontes, svgs
│
├── config/                     # Configurações de ambiente e constantes
│   ├── env.ts                  # Variáveis de ambiente tipadas (z.env)
│   ├── api.ts                  # Axios instance base config
│   └── queryClient.ts          # TanStack Query global config
│
├── lib/                        # Utilitários sem lógica de domínio
│   ├── utils.ts                # cn(), formatCurrency(), formatM3(), etc.
│   ├── validators.ts           # Zod schemas reutilizáveis
│   ├── masks.ts                # Configurações react-imask (CNPJ, CEP, R$)
│   └── errors.ts               # Error classes e handlers
│
├── shared/                     # Componentes e hooks genéricos (sem domínio)
│   ├── components/
│   │   ├── ui/                 # Re-exports shadcn/ui customizados
│   │   ├── data-table/         # DataTable genérico (TanStack Table)
│   │   ├── file-uploader/      # Upload drag-and-drop reutilizável
│   │   ├── metric-card/        # KPI card genérico
│   │   ├── status-badge/       # Badge de status com mapa de cores
│   │   ├── empty-state/        # Empty state com ilustração
│   │   ├── page-header/        # Header de página com breadcrumb
│   │   └── confirm-dialog/     # Modal de confirmação de ação destrutiva
│   ├── hooks/
│   │   ├── useDebounce.ts
│   │   ├── usePagination.ts
│   │   ├── useLocalStorage.ts
│   │   └── usePermissions.ts
│   └── types/
│       ├── common.ts           # PaginatedResponse, ApiError, etc.
│       └── auth.ts             # User, Role, Session
│
├── features/                   # Módulos por domínio de negócio
│   ├── auth/
│   │   ├── components/         # LoginForm, ForgotPasswordForm
│   │   ├── hooks/              # useLogin, useLogout, useRefreshToken
│   │   ├── services/           # authService.ts (Axios calls)
│   │   ├── store/              # authStore.ts (Zustand)
│   │   ├── types/              # AuthDTO, LoginRequest, TokenResponse
│   │   └── pages/
│   │       ├── LoginPage.tsx
│   │       └── ForgotPasswordPage.tsx
│   │
│   ├── dashboard/
│   │   ├── components/
│   │   │   ├── KpiGrid.tsx
│   │   │   ├── PropostasRecentesTable.tsx
│   │   │   ├── VolumeChart.tsx
│   │   │   └── ModalDistributionChart.tsx
│   │   ├── hooks/
│   │   │   └── useDashboardData.ts
│   │   ├── services/
│   │   │   └── dashboardService.ts
│   │   ├── types/
│   │   │   └── dashboard.types.ts
│   │   └── pages/
│   │       └── DashboardPage.tsx
│   │
│   ├── proposta/               # DOMÍNIO PRINCIPAL
│   │   ├── components/
│   │   │   ├── upload/
│   │   │   │   ├── UploadDropzone.tsx
│   │   │   │   ├── FileList.tsx
│   │   │   │   └── ProcessingOverlay.tsx
│   │   │   ├── pecas/
│   │   │   │   ├── PecasTable.tsx
│   │   │   │   ├── PecaRow.tsx
│   │   │   │   └── PecaEditableCell.tsx
│   │   │   ├── logistica/
│   │   │   │   ├── VolumetriaCategoria.tsx
│   │   │   │   ├── LogisticaSummary.tsx
│   │   │   │   └── MontanteToggle.tsx
│   │   │   ├── veiculos/
│   │   │   │   ├── VeiculoCard.tsx
│   │   │   │   ├── VeiculoGrid.tsx
│   │   │   │   ├── OcupacaoGauge.tsx
│   │   │   │   └── VeiculoCustomModal.tsx
│   │   │   ├── frete/
│   │   │   │   ├── FreteComparativoTable.tsx
│   │   │   │   ├── FreteByModal.tsx
│   │   │   │   └── TrechoTable.tsx
│   │   │   ├── resumo/
│   │   │   │   ├── ResumoFinanceiro.tsx
│   │   │   │   ├── ComposicaoCusto.tsx
│   │   │   │   └── StickyResumoPanel.tsx
│   │   │   └── pdf/
│   │   │       ├── PdfViewer.tsx
│   │   │       ├── PropostaPreview.tsx
│   │   │       └── PropostaDocument.tsx  # @react-pdf/renderer
│   │   ├── hooks/
│   │   │   ├── useUpload.ts
│   │   │   ├── usePecas.ts
│   │   │   ├── useVolumetria.ts
│   │   │   ├── useVeiculos.ts
│   │   │   ├── useFrete.ts
│   │   │   ├── useResumoFinanceiro.ts
│   │   │   ├── usePropostaSSE.ts       # SSE para atualizações em tempo real
│   │   │   └── usePropostaStore.ts     # Selector do Zustand store
│   │   ├── services/
│   │   │   ├── uploadService.ts
│   │   │   ├── pecasService.ts
│   │   │   ├── volumetriaService.ts
│   │   │   ├── veiculosService.ts
│   │   │   ├── freteService.ts
│   │   │   └── propostaService.ts
│   │   ├── store/
│   │   │   └── propostaStore.ts        # Estado cliente da proposta corrente
│   │   ├── types/
│   │   │   ├── proposta.types.ts
│   │   │   ├── peca.types.ts
│   │   │   ├── logistica.types.ts
│   │   │   ├── veiculo.types.ts
│   │   │   └── frete.types.ts
│   │   └── pages/
│   │       ├── UploadPage.tsx
│   │       ├── PdfViewerPage.tsx
│   │       ├── PecasPage.tsx
│   │       ├── LogisticaPage.tsx
│   │       ├── VeiculosPage.tsx
│   │       ├── EdicaoManualPage.tsx
│   │       ├── FretePage.tsx
│   │       ├── ResumoFinanceiroPage.tsx
│   │       └── GeracaoPropostaPage.tsx
│   │
│   ├── historico/
│   │   ├── components/
│   │   │   ├── HistoricoTable.tsx
│   │   │   ├── PropostaDetailDrawer.tsx
│   │   │   └── StatusTimeline.tsx
│   │   ├── hooks/
│   │   │   └── useHistorico.ts
│   │   ├── services/
│   │   │   └── historicoService.ts
│   │   ├── types/
│   │   │   └── historico.types.ts
│   │   └── pages/
│   │       └── HistoricoPage.tsx
│   │
│   ├── auditoria/
│   │   ├── components/
│   │   │   ├── AuditoriaTimeline.tsx
│   │   │   └── AuditoriaFilter.tsx
│   │   ├── services/
│   │   │   └── auditoriaService.ts
│   │   ├── types/
│   │   │   └── auditoria.types.ts
│   │   └── pages/
│   │       └── AuditoriaPage.tsx
│   │
│   └── admin/
│       ├── transportadoras/
│       │   ├── components/
│       │   │   ├── TransportadoraTable.tsx
│       │   │   └── TransportadoraForm.tsx
│       │   ├── services/
│       │   │   └── transportadoraService.ts
│       │   ├── types/
│       │   │   └── transportadora.types.ts
│       │   └── pages/
│       │       └── TransportadorasPage.tsx
│       ├── tabelas-frete/
│       │   └── ...
│       └── centros-distribuicao/
│           └── ...
│
└── layout/                     # Shells de layout
    ├── AppLayout.tsx           # Sidebar + Header + Outlet
    ├── AppSidebar.tsx          # Navegação principal
    ├── AppHeader.tsx           # Top bar
    ├── AuthLayout.tsx          # Layout de auth (sem sidebar)
    └── PropostaWizardLayout.tsx # Layout com stepper + sticky panel
```

---

## 4. DTOs TYPESCRIPT (Contratos com o Backend)

```typescript
// === AUTENTICAÇÃO ===
export interface LoginRequestDTO {
  email: string;
  senha: string;
}

export interface TokenResponseDTO {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface UserDTO {
  id: string;
  nome: string;
  email: string;
  role: 'COMERCIAL' | 'OPERADOR' | 'GESTOR' | 'ADMIN';
  avatar?: string;
}

// === PROPOSTA ===
export type StatusProposta =
  | 'RASCUNHO'
  | 'EM_ANALISE'
  | 'CALCULADO'
  | 'EM_REVISAO'
  | 'APROVADO'
  | 'EXPORTADO'
  | 'CANCELADO';

export interface PropostaDTO {
  id: string;
  numeroOC: string;
  clienteNome: string;
  clienteCNPJ: string;
  dataEmissao: string; // ISO 8601
  status: StatusProposta;
  operadorId: string;
  createdAt: string;
  updatedAt: string;
}

// === PEÇAS ===
export type CategoriaPeca =
  | 'LSG'
  | 'MOBILIAS'
  | 'RACK_SLIM'
  | 'CHECKOUTS'
  | 'PORTA_PALLETS'
  | 'LINHA_FRIA';

export type StatusPeca = 'VALIDO' | 'SEM_QTD_M3' | 'NAO_ENCONTRADO';

export interface PecaDTO {
  id: string;
  codigoProduto: string;
  descricao: string;
  categoria: CategoriaPeca;
  quantidade: number;
  qtdPorM3: number | null;
  volumeM3: number | null;
  status: StatusPeca;
}

export interface AtualizarQuantidadePecaDTO {
  pecaId: string;
  novaQuantidade: number;
}

// === VOLUMETRIA ===
export type StatusMontagem = 'MONTADOS' | 'DESMONTADOS';
export type Modal = 'CAMINHAO' | 'CONTAINER' | 'AMBOS';

export interface VolumetriaResultDTO {
  volumeTotal: number;
  detalhePorCategoria: Record<CategoriaPeca, {
    volumeBruto: number;
    volumeAjustado: number;
    fatorAjuste: number;
    quantidadeItens: number;
  }>;
  logistica: {
    caminhao: LogisticaModalDTO;
    container: LogisticaModalDTO;
  };
}

export interface LogisticaModalDTO {
  metrosBase: number;
  metrosNViA: number;
  metrosVenda: number;
}

// === VEÍCULOS ===
export type TipoVeiculo =
  | 'TOCO'
  | 'TRUCK'
  | 'CARRETA'
  | 'CONTAINER_20'
  | 'CONTAINER_40'
  | 'BITRUCK'
  | 'VAN';

export interface VeiculoRecomendadoDTO {
  tipo: TipoVeiculo;
  quantidadeRecomendada: number;
  capacidadeM3: number;
  capacidadeMetrosLineares: number;
  ocupacaoPercentual: number;
  freteUnitario: number;
  freteTotal: number;
  isRecomendacaoPrimaria: boolean;
}

export interface AjusteVeiculoDTO {
  tipo: TipoVeiculo;
  quantidade: number;
}

export interface RecalculoVeiculosRequestDTO {
  propostaId: string;
  veiculos: AjusteVeiculoDTO[];
  modal: Modal;
  statusMontagem: StatusMontagem;
}

export interface RecalculoVeiculosResultDTO {
  veiculos: VeiculoRecomendadoDTO[];
  volumetriaAtualizada: VolumetriaResultDTO;
  freteAtualizado: FreteResultDTO;
  resumoFinanceiro: ResumoFinanceiroDTO;
}

// === FRETE ===
export interface FreteResultDTO {
  modal: Modal;
  metrosBase: number;
  metrosNViA: number;
  metrosVenda: number;
  tarifaPorMetro: number;
  subtotalFrete: number;
  pedagio: number;
  totalFrete: number;
}

export interface TrechoFreteDTO {
  origem: string;
  destino: string;
  distanciaKm: number;
  pedagioR: number;
  freteR: number;
}

// === RESUMO FINANCEIRO ===
export interface ResumoFinanceiroDTO {
  freteBruto: number;
  pedagios: number;
  adicionais: number;
  subtotalOperacional: number;
  margemPercentual: number;
  valorFinalCliente: number;
  validadeAte: string;
  condicaoPagamento: string;
}

// === HISTÓRICO ===
export interface PropostaResumoDTO extends PropostaDTO {
  volumeM3: number;
  modal: Modal;
  valorTotal: number;
  operadorNome: string;
}

// === AUDITORIA ===
export type TipoAcaoAuditoria =
  | 'UPLOAD_ARQUIVO'
  | 'EXTRACAO_CONCLUIDA'
  | 'VEICULO_ALTERADO'
  | 'RECALCULO_SOLICITADO'
  | 'PROPOSTA_APROVADA'
  | 'PDF_EXPORTADO'
  | 'PROPOSTA_CANCELADA';

export interface AuditoriaEventoDTO {
  id: string;
  tipo: TipoAcaoAuditoria;
  usuarioNome: string;
  usuarioRole: string;
  propostaId?: string;
  timestamp: string;
  descricao: string;
  dadosAntes?: Record<string, unknown>;
  dadosDepois?: Record<string, unknown>;
}

// === ADMIN ===
export interface TransportadoraDTO {
  id: string;
  razaoSocial: string;
  cnpj: string;
  contato: string;
  email: string;
  modaisAtendidos: Modal[];
  ativo: boolean;
}

export interface TabelaFreteDTO {
  id: string;
  transportadoraId: string;
  transportadoraNome: string;
  origem: string;
  destino: string;
  modal: Modal;
  tarifaPorMetro: number;
  pedagioBase: number;
  vigenciaInicio: string;
  vigenciaFim: string;
}

export interface CentroDistribuicaoDTO {
  id: string;
  nome: string;
  cep: string;
  logradouro: string;
  cidade: string;
  estado: string;
  capacidadeM2: number;
  operadorResponsavel: string;
  ativo: boolean;
}

// === API GENÉRICA ===
export interface PaginatedResponseDTO<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface ApiErrorDTO {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  validationErrors?: Record<string, string[]>;
}
```

---

## 5. CONFIGURAÇÃO AXIOS — INTERCEPTORS

```typescript
// src/config/api.ts
import axios from 'axios';
import { useAuthStore } from '@/features/auth/store/authStore';
import { authService } from '@/features/auth/services/authService';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
});

// REQUEST: injeta Bearer token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// RESPONSE: refresh token automático em 401
let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: string) => void; reject: (e: unknown) => void }> = [];

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(normalizeApiError(error));
    }
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      });
    }
    original._retry = true;
    isRefreshing = true;
    try {
      const refreshToken = useAuthStore.getState().refreshToken;
      const { accessToken } = await authService.refresh(refreshToken!);
      useAuthStore.getState().setTokens(accessToken, refreshToken!);
      failedQueue.forEach((p) => p.resolve(accessToken));
      original.headers.Authorization = `Bearer ${accessToken}`;
      return api(original);
    } catch (e) {
      failedQueue.forEach((p) => p.reject(e));
      useAuthStore.getState().logout();
      window.location.href = '/login';
      return Promise.reject(e);
    } finally {
      isRefreshing = false;
      failedQueue = [];
    }
  }
);

function normalizeApiError(error: unknown): ApiErrorDTO {
  // normaliza erros de rede, timeout e respostas do backend
}

export { api };
```

---

## 6. ZUSTAND STORES

```typescript
// src/features/auth/store/authStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { UserDTO } from '../types/auth.types';

interface AuthState {
  user: UserDTO | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setTokens: (access: string, refresh: string) => void;
  setUser: (user: UserDTO) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      setTokens: (access, refresh) =>
        set({ accessToken: access, refreshToken: refresh, isAuthenticated: true }),
      setUser: (user) => set({ user }),
      logout: () =>
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false }),
    }),
    { name: 'fast-auth', storage: createJSONStorage(() => sessionStorage) }
  )
);

// src/features/proposta/store/propostaStore.ts
import { create } from 'zustand';
import type { AjusteVeiculoDTO, StatusMontagem, Modal } from '../types';

interface PropostaClientState {
  propostaId: string | null;
  statusMontagem: StatusMontagem;
  modalSelecionado: Modal;
  veiculosSelecionados: AjusteVeiculoDTO[];
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  syncError: string | null;

  setPropostaId: (id: string) => void;
  setStatusMontagem: (s: StatusMontagem) => void;
  setModalSelecionado: (m: Modal) => void;
  updateVeiculo: (ajuste: AjusteVeiculoDTO) => void;
  removeVeiculo: (tipo: string) => void;
  setSyncing: (syncing: boolean) => void;
  setSyncError: (error: string | null) => void;
  resetProposta: () => void;
}

export const usePropostaStore = create<PropostaClientState>()((set) => ({
  propostaId: null,
  statusMontagem: 'MONTADOS',
  modalSelecionado: 'CAMINHAO',
  veiculosSelecionados: [],
  isSyncing: false,
  lastSyncedAt: null,
  syncError: null,
  setPropostaId: (id) => set({ propostaId: id }),
  setStatusMontagem: (s) => set({ statusMontagem: s }),
  setModalSelecionado: (m) => set({ modalSelecionado: m }),
  updateVeiculo: (ajuste) =>
    set((state) => ({
      veiculosSelecionados: state.veiculosSelecionados
        .filter((v) => v.tipo !== ajuste.tipo)
        .concat(ajuste.quantidade > 0 ? [ajuste] : []),
    })),
  removeVeiculo: (tipo) =>
    set((state) => ({
      veiculosSelecionados: state.veiculosSelecionados.filter((v) => v.tipo !== tipo),
    })),
  setSyncing: (syncing) =>
    set({ isSyncing: syncing, lastSyncedAt: syncing ? null : new Date(), syncError: null }),
  setSyncError: (error) => set({ syncError: error, isSyncing: false }),
  resetProposta: () =>
    set({
      propostaId: null,
      veiculosSelecionados: [],
      statusMontagem: 'MONTADOS',
      modalSelecionado: 'CAMINHAO',
      isSyncing: false,
      lastSyncedAt: null,
      syncError: null,
    }),
}));
```

---

## 7. REACT QUERY — HOOKS DE DADOS

```typescript
// src/features/proposta/hooks/useVolumetria.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { volumetriaService } from '../services/volumetriaService';
import { usePropostaStore } from '../store/propostaStore';
import type { VolumetriaResultDTO } from '../types';

export const volumetriaKeys = {
  all: ['volumetria'] as const,
  byProposta: (id: string) => [...volumetriaKeys.all, id] as const,
};

export function useVolumetria(propostaId: string) {
  return useQuery({
    queryKey: volumetriaKeys.byProposta(propostaId),
    queryFn: () => volumetriaService.get(propostaId),
    staleTime: 30_000,           // 30s — dado calculado, raramente muda espontaneamente
    gcTime: 5 * 60_000,          // 5min no cache
    enabled: !!propostaId,
    placeholderData: (prev) => prev, // mantém dado antigo durante refetch (sem flash)
  });
}

// src/features/proposta/hooks/useRecalculo.ts
export function useRecalculo() {
  const queryClient = useQueryClient();
  const { setSyncing, setSyncError } = usePropostaStore();

  return useMutation({
    mutationFn: veiculosService.recalcular,
    onMutate: async (request) => {
      setSyncing(true);
      // snapshot para rollback
      const snapshot = queryClient.getQueryData<VolumetriaResultDTO>(
        volumetriaKeys.byProposta(request.propostaId)
      );
      return { snapshot };
    },
    onSuccess: (result, request) => {
      // Atualiza múltiplas queries em cascata
      queryClient.setQueryData(volumetriaKeys.byProposta(request.propostaId), result.volumetriaAtualizada);
      queryClient.setQueryData(freteKeys.byProposta(request.propostaId), result.freteAtualizado);
      queryClient.setQueryData(resumoKeys.byProposta(request.propostaId), result.resumoFinanceiro);
      setSyncing(false);
    },
    onError: (error, request, context) => {
      // Rollback: restaura snapshot
      if (context?.snapshot) {
        queryClient.setQueryData(volumetriaKeys.byProposta(request.propostaId), context.snapshot);
      }
      setSyncError((error as Error).message);
    },
  });
}

// src/features/proposta/hooks/usePropostaSSE.ts
import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export function usePropostaSSE(propostaId: string | null) {
  const queryClient = useQueryClient();
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!propostaId) return;

    const token = useAuthStore.getState().accessToken;
    const url = `${import.meta.env.VITE_API_URL}/api/v1/propostas/${propostaId}/eventos?token=${token}`;
    esRef.current = new EventSource(url);

    esRef.current.addEventListener('RECALCULO_CONCLUIDO', (e) => {
      const data = JSON.parse(e.data);
      // invalida queries relevantes para forçar refetch
      queryClient.invalidateQueries({ queryKey: volumetriaKeys.byProposta(propostaId) });
      queryClient.invalidateQueries({ queryKey: freteKeys.byProposta(propostaId) });
      queryClient.invalidateQueries({ queryKey: resumoKeys.byProposta(propostaId) });
    });

    esRef.current.addEventListener('STATUS_CHANGED', (e) => {
      const { status } = JSON.parse(e.data);
      queryClient.setQueryData(['proposta', propostaId], (old: PropostaDTO | undefined) =>
        old ? { ...old, status } : old
      );
    });

    esRef.current.onerror = () => {
      // reconexão automática — EventSource faz isso nativamente
    };

    return () => esRef.current?.close();
  }, [propostaId, queryClient]);
}
```

---

## 8. ROTEAMENTO (React Router 6 Data Router)

```typescript
// src/app/router.tsx
import { createBrowserRouter, redirect } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AppLayout } from '@/layout/AppLayout';
import { AuthLayout } from '@/layout/AuthLayout';
import { PropostaWizardLayout } from '@/layout/PropostaWizardLayout';
import { authGuard, roleGuard } from './guards';

// Lazy loading por feature
const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage'));
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));
const UploadPage = lazy(() => import('@/features/proposta/pages/UploadPage'));
const PecasPage = lazy(() => import('@/features/proposta/pages/PecasPage'));
const LogisticaPage = lazy(() => import('@/features/proposta/pages/LogisticaPage'));
const VeiculosPage = lazy(() => import('@/features/proposta/pages/VeiculosPage'));
const EdicaoManualPage = lazy(() => import('@/features/proposta/pages/EdicaoManualPage'));
const FretePage = lazy(() => import('@/features/proposta/pages/FretePage'));
const ResumoFinanceiroPage = lazy(() => import('@/features/proposta/pages/ResumoFinanceiroPage'));
const GeracaoPropostaPage = lazy(() => import('@/features/proposta/pages/GeracaoPropostaPage'));
const HistoricoPage = lazy(() => import('@/features/historico/pages/HistoricoPage'));
const AuditoriaPage = lazy(() => import('@/features/auditoria/pages/AuditoriaPage'));
const TransportadorasPage = lazy(() => import('@/features/admin/transportadoras/pages/TransportadorasPage'));
const TabelasPage = lazy(() => import('@/features/admin/tabelas-frete/pages/TabelasPage'));
const CDsPage = lazy(() => import('@/features/admin/centros-distribuicao/pages/CDsPage'));

export const router = createBrowserRouter([
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { index: true, loader: () => redirect('/auth/login') },
      { path: 'login', element: <LoginPage /> },
      { path: 'esqueci-senha', element: <ForgotPasswordPage /> },
    ],
  },
  {
    path: '/',
    element: <AppLayout />,
    loader: authGuard,
    children: [
      { index: true, loader: () => redirect('/dashboard') },
      { path: 'dashboard', element: <DashboardPage /> },
      {
        path: 'propostas/nova',
        element: <PropostaWizardLayout />,
        children: [
          { index: true, element: <UploadPage /> },
          { path: ':propostaId/pecas', element: <PecasPage /> },
          { path: ':propostaId/logistica', element: <LogisticaPage /> },
          { path: ':propostaId/veiculos', element: <VeiculosPage /> },
          { path: ':propostaId/edicao', element: <EdicaoManualPage /> },
          { path: ':propostaId/frete', element: <FretePage /> },
          { path: ':propostaId/resumo', element: <ResumoFinanceiroPage /> },
          { path: ':propostaId/gerar', element: <GeracaoPropostaPage /> },
        ],
      },
      { path: 'historico', element: <HistoricoPage /> },
      {
        path: 'admin',
        loader: roleGuard(['ADMIN', 'GESTOR']),
        children: [
          { path: 'auditoria', element: <AuditoriaPage /> },
          { path: 'transportadoras', element: <TransportadorasPage /> },
          { path: 'tabelas-frete', element: <TabelasPage /> },
          { path: 'centros-distribuicao', element: <CDsPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);

// Guards
async function authGuard() {
  const token = useAuthStore.getState().accessToken;
  if (!token) return redirect('/auth/login');
  return null;
}

function roleGuard(allowedRoles: string[]) {
  return async function () {
    const user = useAuthStore.getState().user;
    if (!user || !allowedRoles.includes(user.role)) return redirect('/dashboard');
    return null;
  };
}
```

---

## 9. PERMISSÕES POR ROLE

```typescript
// src/shared/hooks/usePermissions.ts
import { useAuthStore } from '@/features/auth/store/authStore';

type Permission =
  | 'proposta:upload'
  | 'proposta:editar-veiculos'
  | 'proposta:aprovar'
  | 'proposta:exportar-pdf'
  | 'proposta:cancelar'
  | 'admin:transportadoras'
  | 'admin:tabelas-frete'
  | 'admin:centros-distribuicao'
  | 'auditoria:visualizar';

const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  COMERCIAL: ['proposta:upload', 'proposta:exportar-pdf'],
  OPERADOR: ['proposta:upload', 'proposta:editar-veiculos', 'proposta:exportar-pdf'],
  GESTOR: [
    'proposta:upload', 'proposta:editar-veiculos', 'proposta:aprovar',
    'proposta:exportar-pdf', 'proposta:cancelar', 'auditoria:visualizar',
  ],
  ADMIN: Object.keys({} as Record<Permission, true>) as Permission[], // tudo
};

export function usePermissions() {
  const role = useAuthStore((s) => s.user?.role);
  const permissions = role ? ROLE_PERMISSIONS[role] ?? [] : [];
  return {
    can: (permission: Permission) => permissions.includes(permission),
    role,
  };
}

// Uso nos componentes:
// const { can } = usePermissions();
// {can('proposta:editar-veiculos') && <EditarVeiculosButton />}
```

---

## 10. FORMULÁRIOS COM ZOD

```typescript
// src/features/proposta/components/veiculos/VeiculoCustomModal.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const veiculoCustomSchema = z.object({
  tipo: z.enum(['TOCO', 'TRUCK', 'CARRETA', 'CONTAINER_20', 'CONTAINER_40', 'BITRUCK', 'VAN'], {
    errorMap: () => ({ message: 'Selecione um tipo de veículo válido' }),
  }),
  quantidade: z
    .number({ invalid_type_error: 'Quantidade deve ser um número' })
    .int('Quantidade deve ser inteira')
    .min(1, 'Mínimo 1 veículo')
    .max(20, 'Máximo 20 veículos por tipo'),
});

type VeiculoCustomForm = z.infer<typeof veiculoCustomSchema>;

export function VeiculoCustomModal({ onAdd }: { onAdd: (data: VeiculoCustomForm) => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<VeiculoCustomForm>({
    resolver: zodResolver(veiculoCustomSchema),
    defaultValues: { quantidade: 1 },
  });

  return (
    <form onSubmit={handleSubmit(onAdd)}>
      {/* shadcn/ui FormField, Select, Input */}
    </form>
  );
}

// Zod schema para transportadora (com máscara CNPJ)
const transportadoraSchema = z.object({
  razaoSocial: z.string().min(3, 'Razão social muito curta').max(200),
  cnpj: z.string().regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, 'CNPJ inválido'),
  contato: z.string().min(2),
  email: z.string().email('E-mail inválido'),
  modaisAtendidos: z.array(z.enum(['CAMINHAO', 'CONTAINER', 'AMBOS'])).min(1, 'Selecione ao menos um modal'),
  ativo: z.boolean().default(true),
});
```

---

## 11. COMPONENTES-CHAVE

### DataTable Genérico (TanStack Table v8)

```typescript
// src/shared/components/data-table/DataTable.tsx
import { useReactTable, getCoreRowModel, getSortedRowModel,
  getFilteredRowModel, getPaginationRowModel, flexRender } from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';

// Para tabelas > 500 linhas, ativa virtualização automática
interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  virtualizeRows?: boolean; // ativa @tanstack/virtual para tabelas grandes
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
  emptyMessage?: string;
}
```

### SyncIndicator — Status de Sincronização

```typescript
// src/shared/components/SyncIndicator.tsx
export function SyncIndicator() {
  const { isSyncing, lastSyncedAt, syncError } = usePropostaStore();

  if (syncError) return (
    <span className="flex items-center gap-1.5 text-destructive text-sm">
      <XCircle className="h-4 w-4" /> Erro de sincronização
    </span>
  );
  if (isSyncing) return (
    <span className="flex items-center gap-1.5 text-amber-600 text-sm animate-pulse">
      <Loader2 className="h-4 w-4 animate-spin" /> Recalculando...
    </span>
  );
  return (
    <span className="flex items-center gap-1.5 text-green-600 text-sm">
      <CheckCircle2 className="h-4 w-4" />
      Atualizado às {lastSyncedAt ? format(lastSyncedAt, 'HH:mm:ss') : '--:--:--'}
    </span>
  );
}
```

### OcupacaoGauge — Indicador Circular

```typescript
// src/features/proposta/components/veiculos/OcupacaoGauge.tsx
// SVG gauge circular com cor dinâmica baseada no threshold
function getOcupacaoColor(pct: number): string {
  if (pct < 80) return 'text-green-600';
  if (pct < 95) return 'text-amber-500';
  return 'text-red-600';
}
```

---

## 12. ESTRATÉGIAS DE PERFORMANCE

### Evitar Re-renderização

```typescript
// Selectors atômicos no Zustand — componente re-renderiza apenas quando o campo específico muda
const isSyncing = usePropostaStore((s) => s.isSyncing); // ✓ atômico
const store = usePropostaStore(); // ✗ renderiza para qualquer mudança no store

// React.memo para rows de tabela
const PecaRow = React.memo(({ peca, onQuantidadeChange }) => {
  // ...
}, (prev, next) => prev.peca.id === next.peca.id && prev.peca.quantidade === next.peca.quantidade);

// useCallback para handlers
const handleQuantidadeChange = useCallback((pecaId: string, qty: number) => {
  // debounce 300ms antes de chamar API
}, []);
```

### Virtualização para Tabelas Grandes

```typescript
// Ativar quando a lista de peças > 200 itens
// Usa @tanstack/react-virtual dentro do DataTable genérico
// Altura das linhas: 40px (compact) / 52px (default) — fixo para virtualização correta
```

### Code Splitting

```typescript
// Todas as páginas são lazy()
// Chunks separados por feature (vite.config.ts):
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'vendor-react': ['react', 'react-dom', 'react-router-dom'],
        'vendor-query': ['@tanstack/react-query', 'zustand'],
        'vendor-table': ['@tanstack/react-table', '@tanstack/react-virtual'],
        'vendor-charts': ['recharts'],
        'vendor-pdf': ['@react-pdf-viewer/core', '@react-pdf/renderer'],
        'vendor-forms': ['react-hook-form', 'zod', '@hookform/resolvers'],
      },
    },
  },
},
```

---

## 13. ANTI-PATTERNS A EVITAR

| Anti-pattern | Problema | Solução |
|---|---|---|
| Lógica de cálculo no frontend | Duplicação de regra de negócio, divergência com backend | Todo cálculo via API |
| Polling em vez de SSE | Overhead de rede desnecessário | EventSource nativo |
| `useEffect` para busca de dados | Race conditions, loading states manuais | TanStack Query |
| Estado global para tudo | Store inflado, re-renders desnecessários | Server state no Query, client state no Zustand |
| Invalidar todas as queries no recálculo | Refetch de dados não relacionados | Invalidação seletiva por query key |
| `any` no TypeScript | Perde tipagem, bugs em runtime | Zod parse no boundary da API |
| Tabela sem virtualização (> 500 linhas) | DOM lento, scroll travado | @tanstack/react-virtual |
| Armazenar tokens em localStorage | XSS pode roubar token | sessionStorage + httpOnly cookie para refresh |
| Mutation sem rollback | Usuário vê estado errado se API falhar | onMutate snapshot + onError restore |

---

## 14. TRATAMENTO DE ERROS E NOTIFICAÇÕES

```typescript
// src/lib/errors.ts
export class ApiError extends Error {
  constructor(
    public status: number,
    public serverMessage: string,
    public validationErrors?: Record<string, string[]>
  ) {
    super(serverMessage);
  }
}

// Toast handler global no TanStack Query
const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      onError: (error) => {
        if (error instanceof ApiError) {
          toast.error(error.serverMessage, { description: 'Tente novamente ou contate o suporte.' });
        }
      },
    },
    queries: {
      retry: (failureCount, error) => {
        if (error instanceof ApiError && error.status < 500) return false; // 4xx não tenta de novo
        return failureCount < 2;
      },
    },
  },
});
```

---

## 15. CONFIGURAÇÃO REACT QUERY GLOBAL

```typescript
// src/config/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,           // 1min default
      gcTime: 10 * 60_000,         // 10min no cache
      refetchOnWindowFocus: false, // operadores não querem recargas inesperadas
      refetchOnReconnect: true,
      retry: 2,
    },
  },
});

// Query Keys por domínio (evita colisão e facilita invalidação cirúrgica)
export const queryKeys = {
  dashboard: { kpis: ['dashboard', 'kpis'], charts: ['dashboard', 'charts'] },
  proposta: {
    detail: (id: string) => ['proposta', id],
    pecas: (id: string) => ['proposta', id, 'pecas'],
    volumetria: (id: string) => ['proposta', id, 'volumetria'],
    veiculos: (id: string) => ['proposta', id, 'veiculos'],
    frete: (id: string) => ['proposta', id, 'frete'],
    resumo: (id: string) => ['proposta', id, 'resumo'],
  },
  historico: { list: (filters: object) => ['historico', filters] },
  admin: {
    transportadoras: ['admin', 'transportadoras'],
    tabelasFrete: (filters: object) => ['admin', 'tabelas-frete', filters],
    cds: ['admin', 'centros-distribuicao'],
  },
};
```

---

## 16. VARIÁVEIS DE AMBIENTE

```bash
# .env.local
VITE_API_URL=http://localhost:8080
VITE_SSE_RECONNECT_DELAY=3000
VITE_APP_VERSION=$npm_package_version
VITE_SENTRY_DSN=  # monitoramento de erros (Sentry)
```

---

## 17. IMPLEMENTAÇÃO DO DESIGN SYSTEM (Pós-Figma)

Após receber o design do Figma:

1. **Extrair tokens** do Figma para `tailwind.config.ts`:
   ```typescript
   theme: {
     extend: {
       colors: {
         primary: { DEFAULT: '#1E3A5F', light: '#2D5F9E' },
         accent: '#F97316',
         // ... todos os tokens do Figma
       },
       fontFamily: {
         sans: ['Inter', 'sans-serif'],
         mono: ['JetBrains Mono', 'monospace'],
       },
     },
   }
   ```

2. **Instalar shadcn/ui** e configurar com o tema extraído:
   ```bash
   npx shadcn-ui@latest init
   npx shadcn-ui@latest add button card table dialog form input select badge
   ```

3. **Customizar componentes shadcn** em `src/shared/components/ui/` para refletir o design system.

4. **Implementar cada tela** seguindo a hierarquia de componentes do design, do mais atômico ao mais composto.

---

## 18. ORDEM DE IMPLEMENTAÇÃO SUGERIDA

```
Fase 1 — Fundação (Sprint 1)
  ├── Vite + TypeScript + Tailwind + shadcn/ui
  ├── React Router + layouts (App, Auth, Wizard)
  ├── Axios + interceptors + error handling
  ├── TanStack Query + queryClient config
  ├── Zustand stores (auth + proposta)
  └── Design tokens do Figma → Tailwind

Fase 2 — Auth e Dashboard (Sprint 2)
  ├── LoginPage + authService + authStore
  ├── Guards de rota
  ├── AppSidebar + AppHeader
  └── DashboardPage (KPIs + charts + tabela recente)

Fase 3 — Fluxo Principal da Proposta (Sprint 3-4)
  ├── UploadPage (dropzone + processamento)
  ├── PecasPage (tabela editável + virtualização)
  ├── LogisticaPage (volumetria por categoria)
  ├── VeiculosPage (cards + gauge + recálculo)
  ├── EdicaoManualPage (tabela editável + before/after)
  ├── FretePage (tabs + comparativo)
  ├── ResumoFinanceiroPage (accordion + sticky panel)
  └── GeracaoPropostaPage (preview A4 + export PDF)

Fase 4 — SSE e Tempo Real (Sprint 5)
  ├── usePropostaSSE hook
  ├── SyncIndicator component
  ├── Optimistic updates + rollback nas mutations
  └── Testes de sincronização

Fase 5 — Admin e Histórico (Sprint 6)
  ├── HistoricoPage + PropostaDetailDrawer
  ├── AuditoriaPage + timeline
  ├── TransportadorasPage (CRUD)
  ├── TabelasPage (CRUD + validação vigência)
  └── CDsPage (CRUD + integração CEP)

Fase 6 — QA e Performance (Sprint 7)
  ├── Vitest unit tests (services, hooks, utils)
  ├── Testing Library integration tests
  ├── MSW mocks para testes
  ├── Lighthouse audit (target: > 90 performance)
  └── Bundle analysis + otimizações
```
