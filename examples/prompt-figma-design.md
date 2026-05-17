# PROMPT — CLAUDE DESIGN (FIGMA): Fast Gôndulas — Plataforma Logística Enterprise

## CONTEXTO DO PROJETO

Você irá criar o **design system completo e todas as telas** de uma plataforma enterprise logística chamada **Fast Gôndulas Logistics Platform**.

A empresa **Fast Gôndulas Ind. Com. Ltda.** é uma indústria de equipamentos para varejo supermercadista (gôndolas, expositores refrigerados, checkouts). A plataforma digitaliza o processo de cotação e cálculo logístico: o comercial envia pedidos em PDF/Excel, o sistema extrai as peças, calcula cubagem, recomenda veículos e gera a proposta de frete com valor total.

---

## PERSONAS E ROLES

| Role | Objetivo principal |
|---|---|
| **Comercial** | Envia arquivos de Ordem de Compra (PDF/Excel), acompanha status |
| **Operador Logístico** | Revisa cálculos, ajusta veículos manualmente, valida proposta |
| **Gestor** | Aprova propostas, analisa histórico, KPIs |
| **Admin** | Gerencia transportadoras, tabelas de frete, CDs |

---

## IDENTIDADE VISUAL

**Marca:** Fast Gôndulas  
**Paleta principal:**
- Primary: `#1E3A5F` (azul corporativo profundo — autoridade, confiança)  
- Primary Light: `#2D5F9E` (azul médio — links, CTAs secundários)  
- Accent: `#F97316` (laranja Fast — CTAs primários, alertas de ação)  
- Success: `#16A34A` (verde — aprovado, dentro da meta)  
- Warning: `#D97706` (âmbar — atenção, margem estourada)  
- Danger: `#DC2626` (vermelho — erro, ocupação crítica)  
- Background: `#F8FAFC` (cinza-gelo — tela base)  
- Surface: `#FFFFFF` (cards, modais)  
- Border: `#E2E8F0` (divisores)  
- Text Primary: `#0F172A`  
- Text Secondary: `#64748B`  
- Text Muted: `#94A3B8`  

**Tipografia:**
- Headlines: Inter Bold / Semibold  
- Body: Inter Regular / Medium  
- Monospace (dados numéricos): JetBrains Mono  
- Tamanhos: 12 / 14 / 16 / 18 / 20 / 24 / 30 / 36px  

**Espaçamento:** Sistema 4px (4, 8, 12, 16, 20, 24, 32, 40, 48, 64px)  
**Border radius:** sm=4px, md=8px, lg=12px, xl=16px  
**Sombras:** shadow-sm, shadow-md, shadow-lg (sutis, corporativas)  
**Ícones:** Lucide Icons (consistência com shadcn/ui)  

**Estilo geral:** Enterprise clean. Denso em informação, porém respira. Contraste alto. Zero ornamentos desnecessários. Dark mode opcional mas não prioridade.

---

## DESIGN SYSTEM — COMPONENTES BASE

### Átomos
- **Button:** Primary (laranja), Secondary (azul outline), Ghost, Danger, Icon-only, Loading state
- **Badge:** Status badges: Processando / Calculado / Aprovado / Exportado / Erro
- **Input:** Text, Number (com mask), Select, Multi-select, File Upload
- **Checkbox / Radio / Toggle**
- **Tooltip**
- **Spinner / Skeleton loaders**
- **Avatar**
- **Divider**

### Moléculas
- **Card:** com header, body, footer — variações: metric card, status card, table card
- **Metric Card:** Ícone + Label + Valor grande + Delta (variação) + Trend arrow
- **Alert:** Info, Success, Warning, Error com ícone e dismiss
- **Form Field:** Label + Input + Helper text + Error state
- **Tag / Chip:** removível, colorido por categoria logística
- **Progress Bar:** horizontal, com label, colorido por threshold
- **Stepper:** horizontal, para wizard de upload → análise → revisão → exportação
- **Breadcrumb:** hierarquia de navegação
- **Pagination:** com page size selector
- **Empty State:** ilustração + título + subtítulo + CTA
- **Skeleton Card / Table Row**

### Organismos
- **Data Table:** sortável, filtrável, seleção de linhas, ações em linha, paginação, densidade configurável
- **Editable Table:** células editáveis inline (para ajuste de veículos/quantidades)
- **File Uploader:** drag-and-drop, múltiplos arquivos, progress bar por arquivo, preview de nome
- **Modal:** sm / md / lg / full-screen, com header, body, footer de ações
- **Sidebar Navigation:** colapsável, ícones + labels, badges de notificação
- **Top Header:** logo + breadcrumb + notificações + avatar + menu
- **Summary Panel:** painel lateral direito com resumo financeiro em tempo real
- **Status Timeline:** histórico de estados de uma proposta

---

## TELAS A CRIAR

### 1. LOGIN / AUTH
**Layout:** Tela dividida — lado esquerdo: ilustração industrial/logística com branding Fast + tagline. Lado direito: card de login centralizado.  
**Componentes:** Logo, Input email, Input senha (show/hide), Botão "Entrar", Link "Esqueci senha", Mensagem de erro.  
**Estados:** Default / Loading / Error / Success.  

---

### 2. DASHBOARD (Home)
**Objetivo:** Visão executiva de KPIs e atividade recente.  
**Layout:** Sidebar fixa esquerda + Top header + Conteúdo principal com grid.  

**Grid de KPIs (topo):** 4 Metric Cards lado a lado:
- Propostas Hoje (número + delta vs ontem)
- Volume Total Calculado (m³ — mês atual)
- Frete Médio (R$/metro — mês atual)
- Propostas Aprovadas (% do total)

**Gráfico de barras:** Propostas por dia (últimos 30 dias) — libary: Recharts  
**Gráfico de pizza/donut:** Distribuição de modal (Caminhão vs Container)  
**Tabela Recente:** Últimas 10 propostas com colunas: OC / Cliente / Data / Volume m³ / Status / Ações  
**Painel de alertas:** Propostas pendentes de revisão (badge com número na sidebar)  

---

### 3. UPLOAD DE PROPOSTA (Wizard — 3 Passos)

**Passo 1 — Upload de Arquivo**  
Área de drag-and-drop grande (80% da tela) com:
- Ícone de upload animado
- Texto "Arraste o PDF ou Excel aqui ou clique para selecionar"
- Formatos aceitos: .pdf, .xlsx, .xls
- Limite: 50MB
- Lista de arquivos selecionados com: nome, tamanho, ícone de tipo, progresso de upload, botão remover
- Botão "Processar Arquivos" (primário, grande)

**Passo 2 — Processamento (Loading State)**  
- Skeleton da próxima tela atrás
- Overlay de progresso com steps animados:
  - ✓ Arquivo recebido
  - → Extraindo dados...  
  - → Calculando volumetria...
  - → Analisando logística...
  - → Recomendando veículos...
- Estimativa de tempo restante
- Botão cancelar

**Passo 3 — Confirmação de Dados Extraídos**  
- Preview dos dados encontrados: número da OC, cliente, quantidade de itens
- Botão "Revisar Proposta" (navega para tela de revisão)

---

### 4. VISUALIZAÇÃO DO PDF
**Layout:** Split view: PDF à esquerda (60%) + Dados extraídos à direita (40%)  
**PDF Viewer:** Toolbar com: zoom in/out, fit page, navigate pages, download  
**Painel direito:** Tabs — "Dados da OC" | "Itens Extraídos"  
- Dados da OC: número, cliente, data, condição de pagamento
- Itens Extraídos: tabela com código, descrição, quantidade — itens com problema destacados em âmbar

---

### 5. TABELA DE PEÇAS (Itens Extraídos)
**Objetivo:** Revisão detalhada de todos os itens extraídos do PDF/Excel.  
**Toolbar:** Busca, Filtro por categoria, Exportar CSV, Densidade (compact/default/relaxed)  
**Tabela de alta densidade** com colunas:
- # (índice)
- Código do produto
- Descrição
- Categoria (badge colorido: LSG=azul, MOBÍLIAS=roxo, RACK SLIM=ciano, CHECKOUTS=verde, PORTA PALLETS=laranja, LINHA FRIA=vermelho)
- Quantidade (editável inline)
- Qtd/m³ (dado do backend)
- Volume Calculado (m³) — destacado
- Status (✓ válido / ⚠ sem Qtd/m³ / ✗ produto não encontrado)

**Rodapé:** Totais por categoria + Total geral  
**Ações:** Editar quantidade individual, Adicionar item manualmente, Remover item

---

### 6. TELA DE LOGÍSTICA (Volumetria)
**Objetivo:** Resultado visual completo do cálculo de cubagem.  
**Layout:** Duas colunas — esquerda: detalhes por categoria | direita: resumo logístico  

**Seção Esquerda — Detalhes por Categoria:**  
Cards empilhados, um por categoria (LSG, MOBÍLIAS, RACK SLIM, CHECKOUTS, PORTA PALLETS, LINHA FRIA):
- Header: nome da categoria + badge de fator (ex: "×1.4")
- Volume bruto (m³)
- Volume ajustado (m³) — maior, destaque
- Barra de progresso proporcional ao total
- Número de itens da categoria

**Toggle especial:** "Montantes: MONTADOS / DESMONTADOS" — Toggle switch grande, com explicação do impacto (fator ×1 ou ×4)

**Seção Direita — Resumo Logístico:**  
Card principal com:
- Volume Total: número grande, fonte monospace
- Tabs: CAMINHÃO | CONTAINER
  - Metros de Carroceria Base
  - Metros +10% (NViA/Custo)
  - Metros +20% (Venda/Cliente)
- Gráfico de barras horizontal comparando caminhão vs container

---

### 7. TELA DE RECOMENDAÇÃO DE VEÍCULOS
**Objetivo:** Backend recomenda veículos. Operador pode aceitar ou alterar.  
**Layout:** Grid de cards de veículos + Painel lateral de resumo

**Cards de Veículos Recomendados:**  
Grid 3 colunas (ou 2 em tablets). Cada card:
- Ícone do tipo de veículo (caminhão toco, truck, carreta, container 20', 40')
- Nome do tipo
- Badge "RECOMENDADO" (verde) ou "ALTERNATIVA" (azul)
- Capacidade: X m³ / Y metros lineares
- Ocupação atual: Progress bar circular + porcentagem (verde < 80%, âmbar 80-95%, vermelho > 95%)
- Quantidade selecionada: controle numérico − / N / +
- Custo estimado de frete: R$ XX.XXX,XX

**Veículo customizado:** Botão "Adicionar Veículo Customizado" abre modal com select de tipo e input de quantidade.  

**Painel Lateral Direito — Resumo em Tempo Real:**  
Card sticky com:
- Total de veículos: N unidades
- Ocupação total: XX% (barra colorida)
- Custo total de frete: R$
- Valor de pedágio estimado: R$
- Valor total: R$
- Estado de sincronização: "Recalculando..." (spinner) / "Atualizado às HH:mm:ss" (check verde)
- Botão "Aceitar Configuração" (primário)

---

### 8. TELA DE EDIÇÃO MANUAL
**Objetivo:** Operador modifica veículos e vê recálculo instantâneo.  
**Layout:** Tabela editável + Painel de impacto ao lado

**Tabela de Veículos (editável):**  
| Tipo | Qtd | Capacidade m³ | Ocupação | Frete Unit. | Frete Total |  
Células de quantidade e tipo editáveis inline. Linha "Total" fixada no rodapé.

**Painel de Impacto (direita):**  
Antes x Depois side-by-side:
- Ocupação: Antes XX% → Depois YY% (delta colorido)
- Frete: Antes R$X → Depois R$Y (delta colorido)
- Pedágio: Antes R$X → Depois R$Y
- Total: Antes R$X → Depois R$Y
- Botão "Aplicar Alterações" (envia ao backend, mostra loading)
- Botão "Desfazer" (rollback para último estado salvo)

**Indicador de sincronização:** Pill no topo: "● Sincronizado" (verde) / "⟳ Recalculando" (âmbar girando) / "✗ Erro de sincronização" (vermelho)

---

### 9. TELA DE CÁLCULO DE FRETE
**Objetivo:** Detalhamento completo dos custos de frete.  
**Layout:** Card principal com tabs + tabela de composição de custo

**Tabs:** POR MODAL | POR TRECHO | COMPARATIVO  

**Por Modal:**  
Dois cards lado a lado — Caminhão e Container:
- Metros lineares: Base / +10% / +20%
- Tarifa por metro (R$/m — vem do backend/tabela de frete)
- Subtotal
- Campo de observação/ajuste manual

**Por Trecho:**  
Tabela: Origem → Destino | Distância km | Pedágio R$ | Frete Trecho R$  
Mapa estilizado (opcional) com rota destacada

**Comparativo:**  
Gráfico de barras agrupadas: caminhão vs container por variável (custo, tempo, prazo)

---

### 10. TELA DE RESUMO FINANCEIRO
**Objetivo:** Visão consolidada de todos os custos antes da geração da proposta.  
**Layout:** Duas colunas — Detalhamento (esquerda) + Resumo executivo (direita)

**Detalhamento (esquerda):**  
Accordion por seção:
- Composição de Frete: metros × tarifa = subtotal (por veículo/modal)
- Pedágios: tabela trecho a trecho
- Adicionais: seguros, manuseio, outros (editáveis)
- Descontos/Negociações (campo livre com justificativa)

**Resumo Executivo (direita):**  
Card fixo com:
- Frete bruto: R$
- Pedágios: R$
- Adicionais: R$
- Subtotal operacional: R$
- Margem Fast: XX% (configurável)
- **VALOR FINAL AO CLIENTE: R$** (destaque máximo, fonte grande)
- Validade da proposta: data (seletor de data)
- Condição de pagamento: campo editável
- Botão "Gerar Proposta" (CTA principal, laranja, full-width)

---

### 11. TELA DE GERAÇÃO DE PROPOSTA
**Objetivo:** Preview da proposta antes de exportar.  
**Layout:** Preview da proposta em formato A4 simulado + painel de configurações à direita

**Preview A4 (esquerda):**  
Documento simulado com:
- Header Fast Gôndulas (logo + dados empresa)
- Dados da OC e do cliente
- Tabela de itens (resumida)
- Quadro de logística
- Quadro financeiro
- Condições e observações
- Assinatura

**Painel de Configurações (direita):**  
- Observações da proposta (textarea)
- Validade (date picker)
- Condições de pagamento (select + campo livre)
- Incluir: [ ] Detalhamento de itens [ ] Mapa de rota [ ] Comparativo de modais
- Botão "Exportar PDF" (primário)
- Botão "Enviar por Email" (secundário)
- Botão "Salvar Rascunho" (ghost)

---

### 12. EXPORTAÇÃO PDF
**Estado durante exportação:**  
Overlay com progresso: "Gerando PDF..." + spinner + etapas (Montando dados → Renderizando → Otimizando → Pronto)  
**Estado após exportação:**  
Card de sucesso com:
- Ícone check verde
- Nome do arquivo gerado
- Botão "Baixar PDF"
- Botão "Abrir Preview"
- Botão "Nova Proposta"
- Botão "Ver Histórico"

---

### 13. HISTÓRICO DE PROPOSTAS
**Objetivo:** Lista completa de todas as propostas com busca e filtros avançados.  
**Filtros (toolbar):** Período, Cliente, Status, Operador, Modal  
**Tabela principal:**  
| OC | Cliente | Data | Operador | Volume m³ | Modal | Valor Total | Status | Ações |  
Status com badge colorido: Rascunho (cinza) / Em Análise (azul) / Aprovada (verde) / Exportada (roxo) / Cancelada (vermelho)  
**Ações:** Ver | Editar | Clonar | Exportar PDF | Cancelar  
**Painel de detalhe:** Click na linha abre sidebar direita com resumo completo da proposta (sem sair da lista)

---

### 14. AUDITORIA
**Objetivo:** Log de todas as ações realizadas no sistema.  
**Filtros:** Usuário, Tipo de ação, Data, Proposta  
**Timeline vertical:** Cada evento como um item na timeline com: ícone tipo de ação | usuário | timestamp | descrição | dados antes/depois (expandível)  
**Tipos de ação visualizados:** Upload arquivo / Extração concluída / Veículo alterado / Recálculo solicitado / Proposta aprovada / PDF exportado

---

### 15. GESTÃO DE TRANSPORTADORAS
**Layout CRUD padrão:** Tabela + Modal de criação/edição  
**Campos:** Razão social, CNPJ (com máscara), Contato, Email, Modais atendidos (multi-select), Status ativo/inativo  
**Tabela:** Nome | CNPJ | Modais | Contato | Status | Ações (editar/desativar)

---

### 16. GESTÃO DE TABELAS DE FRETE
**Objetivo:** Manter tarifas de frete por rota e transportadora.  
**Filtros:** Transportadora, Modal, Origem, Destino, Vigência  
**Tabela:** Origem | Destino | Modal | R$/metro | Pedágio | Transportadora | Vigência | Ações  
**Modal de criação:** Formulário completo com validação de sobreposição de vigência

---

### 17. GESTÃO DE CENTROS DE DISTRIBUIÇÃO
**Layout:** Tabela + Mapa (pins dos CDs) + Modal de criação/edição  
**Campos:** Nome, Endereço completo (com CEP e busca automática), Estado, Capacidade m², Operador responsável, Status  
**Tabela:** Nome | Estado | Capacidade | Status | Ações

---

## FLUXO DE NAVEGAÇÃO (User Flow)

```
Login
  └── Dashboard
        ├── Nova Proposta (Wizard)
        │     ├── Upload → Processando → Dados Confirmados
        │     ├── Visualizar PDF / Tabela de Peças
        │     ├── Logística (Volumetria)
        │     ├── Recomendação de Veículos
        │     ├── Edição Manual
        │     ├── Cálculo de Frete
        │     ├── Resumo Financeiro
        │     └── Gerar / Exportar Proposta
        ├── Histórico de Propostas
        │     └── Detalhe da Proposta
        ├── Configurações
        │     ├── Transportadoras
        │     ├── Tabelas de Frete
        │     └── Centros de Distribuição
        └── Auditoria
```

---

## REQUISITOS DE UX PARA OPERADORES

1. **Densidade:** Operadores logísticos preferem muita informação por tela. Tabelas compactas, sem excesso de whitespace.
2. **Teclado-first:** Tab navigation, atalhos de teclado documentados, Enter para confirmar edições inline.
3. **Feedback imediato:** Toda ação tem resposta visual em < 100ms (loading state, toast, badge).
4. **Cores com significado:** Verde = OK, Âmbar = Atenção, Vermelho = Problema — nunca use como decoração.
5. **Números legíveis:** Valores monetários e m³ com separadores de milhar. Fontes monoespaçadas para dados numéricos.
6. **Estado vazio informativo:** Telas sem dados mostram orientação clara de próximo passo.
7. **Confirmação para ações destrutivas:** Modais de confirmação para excluir/cancelar.
8. **Responsivo secundário:** Desktop-first (operadores usam tela cheia), mas tablets devem funcionar.

---

## ESPECIFICAÇÕES ADICIONAIS DE DESIGN

**Sidebar Navigation:**
- Largura: 240px expandida / 64px colapsada
- Ícones: Lucide
- Seções: Principal (Dashboard, Nova Proposta, Histórico) / Admin (Transportadoras, Fretes, CDs, Auditoria)
- Badge de count em "Propostas Pendentes"
- Footer: avatar do usuário + role + logout

**Toasts/Notificações:**
- Posição: top-right
- Tipos: success (verde) / error (vermelho) / warning (âmbar) / info (azul)
- Auto-dismiss: 4s (success/info) / manual (error)

**Estados de Loading:**
- Skeleton para dados tabulares (nunca spinner giratório em tabelas)
- Spinner apenas para ações pontuais (salvar, exportar)
- Progress bar para uploads e geração de PDF

**Indicadores em Tempo Real (WebSocket/SSE):**
- Pill pulsante "● Ao Vivo" quando há conexão SSE ativa
- Animação suave de atualização de valores (transição de número)
- Sem "page flash" — apenas as células/cards que mudaram animam

---

## ENTREGÁVEIS ESPERADOS NO FIGMA

1. **Design Tokens** (cores, tipografia, espaçamento, sombras, radius) como Figma Variables
2. **Component Library** com todos os átomos, moléculas e organismos em Auto Layout
3. **17 telas completas** em resolução 1440px de largura (desktop)
4. **Versões mobile/tablet** das telas principais (Dashboard, Upload, Histórico)
5. **Prototype** com fluxo completo: Login → Upload → Análise → Revisão → Exportação
6. **States** para cada componente interativo (default, hover, focus, active, disabled, loading, error)
7. **Dark mode** (opcional — apenas tokens e Dashboard)
8. **Handoff annotations** com medidas, cores e comportamentos para o desenvolvedor

---

## NOTAS TÉCNICAS PARA O DESIGN

- Todos os valores numéricos nas telas devem usar fonte **JetBrains Mono** para legibilidade
- Tabelas devem ter **linha alternada** (zebra striping) em tons muito sutis
- Barra de ocupação de carga: `0-79%` = verde, `80-94%` = âmbar, `95-100%` = vermelho
- Cards de veículo recomendado devem ter **borda lateral colorida** indicando tipo de recomendação
- O **painel de resumo financeiro** deve ser sempre visível durante o fluxo de proposta (sticky/fixed)
- Usar **skeleton loaders** (não spinners) sempre que dados ainda estão carregando
- **Animações:** apenas quando agregam contexto (transição de valor numérico, loading states). Nunca decorativas.
