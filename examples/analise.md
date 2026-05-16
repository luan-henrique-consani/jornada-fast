# FAST GÔNDULAS — ENGENHARIA REVERSA COMPLETA DE REGRAS DE NEGÓCIO
### Documento técnico para desenvolvimento de sistema ERP/Logística
**Preparado por:** Análise de Sistemas Sênior  
**Data:** 16/06/2025  
**Versão:** 1.0  
**Classificação:** Documentação Oficial de Desenvolvimento

---

## 1. VISÃO GERAL DO NEGÓCIO

### O que a empresa faz

A **Fast Gôndulas Ind. Com. Ltda.** (CNPJ 12.345.678/0001-90) é uma indústria e comércio de **equipamentos para varejo supermercadista**, fabricando e fornecendo:

1. **Linha Seca (LSG — Linha de Gôndolas):** Gôndolas, bases, colunas, painéis, prateleiras, checkouts, mobílias de caixa (checkstands), rack slim e porta-pallets para área seca de supermercados.
2. **Linha Refrigerada/Fria (SK e RFG):** Expositores refrigerados, ilhas de congelamento, expositores verticais (NLIM/LIM), expositores de vidro curvo/reto, ilhas promotoras abertas, Dry Aged, Self Checkouts — toda a linha de frio para supermercados.

A empresa opera como **fabricante-vendedor**: recebe pedidos de clientes (ex.: Supermercados Bom Preço), emite Ordens de Compra, calcula cubagem/volumetria para logística, estima o frete por modal (caminhão ou container), e despacha com agendamento obrigatório.

### Como os arquivos se conectam

```
PDF (OC-2025-00847)
  └─► Ordem de Compra do cliente → define ITENS e QUANTIDADES

Excel 08 (ESTIMATIVA LINHA SECA)
  └─► Recebe qtds da OC → calcula VOLUMETRIA por produto → calcula MTS de carroceria
      → gera VOLUME TOTAL (m³) para CAMINHÃO e para CONTAINER
      → aplica FATORES DE AJUSTE por categoria de produto
      → aplica fator MONTADO/DESMONTADO para porta-pallets

Excel 07 (ESTIMATIVA SK E RFG)
  └─► Catálogo de produtos de linha refrigerada
      → Mapeamento de nomenclatura antiga → nova → nova v2
      → Dimensões físicas (Comprimento × Largura × Altura)
      → Pesos (bruto e líquido) por SKU
      → Suporte a configurador de produto, render, corte e estrutura
```

### Fluxo operacional identificado

```
PEDIDO DO CLIENTE (OC)
    ↓
LANÇAMENTO DE QUANTIDADES (Excel Estimativa)
    ↓
CÁLCULO DE VOLUMETRIA POR ITEM (Qtd ÷ Qtd/m³)
    ↓
TOTALIZAÇÃO POR CATEGORIA (GÔNDOLAS, MOBÍLIAS, CHECKOUTS, RACK SLIM, PORTA PALLETS)
    ↓
APLICAÇÃO DO FATOR DE AJUSTE POR CATEGORIA (1.4 LSG / 1.2 MOB / 1.0 CHK / etc.)
    ↓
CÁLCULO DO VOLUME TOTAL (m³) = soma de todos os totais ajustados
    ↓
CÁLCULO DE METROS DE CARROCERIA (Vol_total × 12 ÷ 60 para caminhão / × 12 ÷ 45 para container)
    ↓
PROJEÇÕES COM MARGEM (+10% NViA / +20% Venda)
    ↓
DECISÃO DE MODAL E AGENDAMENTO DE ENTREGA
```

### Objetivo de cada arquivo

| Arquivo | Objetivo |
|---|---|
| `08_ESTIMATIVA_LINHA_SECA` | Ferramenta de cálculo de volumetria e logística para a linha seca. Entrada de quantidades → saída em m³ e metros de carroceria por modal. |
| `07_ESTIMATIVA_SK_E_RFG` | Catálogo dimensional e de nomenclatura da linha refrigerada. Serve de tabela de referência para configurador, dimensionamento e cálculo de volumetria da linha fria. |
| `PDF_FAST.pdf` | Ordem de Compra real (OC-2025-00847) emitida pelo cliente Supermercados Bom Preço, filial Maringá. Define os itens, quantidades, condições e regras de entrega. |

---

## 2. ANÁLISE COMPLETA DOS EXCELS

---

### 2.1 EXCEL 08 — ESTIMATIVA LINHA SECA (20250616)

#### 2.1.1 Estrutura das Abas

| Aba | Função |
|---|---|
| `Estimativa` | Entrada de quantidades e cálculo de volumetria + logística |
| `Fatores de Ajuste` | Tabela de constantes/multiplicadores por categoria |
| `Validações` | Planilha de histórico/exemplos reais de pedidos anteriores para validação |

---

#### 2.1.2 ABA: Estimativa — Estrutura de Colunas

**BLOCO GÔNDOLAS (Linha Seca — LSG) — Colunas B a F:**

| Coluna | Nome | Tipo | Obrigatório | Calculado |
|---|---|---|---|---|
| B | Categoria (ex.: GÔNDOLAS) | Label/texto | Não | Não |
| C | ITEM (nome do produto) | Texto | Sim | Não |
| D | Qtd | Número inteiro | Sim (input manual) | Não |
| E | Qtd/m³ | Número decimal | Sim (constante pré-definida ou calculada) | Parcialmente |
| F | Vol (m³) | Número decimal | Calculado | Sim |

**BLOCO RACK SLIM / CHECKOUTS — Colunas H a L:**

| Coluna | Nome | Tipo | Obrigatório | Calculado |
|---|---|---|---|---|
| H | Categoria | Label | Não | Não |
| I | ITEM | Texto | Sim | Não |
| J | Qtd | Número inteiro | Sim (input manual) | Não |
| K | Qtd/m³ | Número decimal | Sim (constante ou VLOOKUP) | Parcialmente |
| L | Vol (m³) | Número decimal | Calculado | Sim |

**BLOCO MOBILIAS — Colunas B a F (linhas 21–28):**  
Mesma estrutura do bloco Gôndolas, compartilha colunas B–F mas nas linhas seguintes.

**BLOCO PORTA PALLETS — Colunas H a L (linhas 22–39):**  
Inclui a variável especial `N22` (MONT/DESM.) que controla o fator de volume dos montantes.

**BLOCO SAÍDAS LOGÍSTICAS — Colunas Q a T:**

| Coluna | Linha | Nome | Tipo | Descrição |
|---|---|---|---|---|
| Q | 2 | VOLUME TOTAL (M³) | Label | — |
| R | 2 | Volume Total Caminhão | Decimal calculado | Soma de todos os totais ajustados |
| T | 2 | Volume Total Container | Decimal calculado | Igual ao caminhão |
| Q | 3 | MTS DE CARROCERIA | Label | — |
| R | 3 | Metros de Carroceria (Caminhão) | Decimal calculado | |
| T | 3 | Metros de Carroceria (Container) | Decimal calculado | |
| R | 4 | MTS +10% (NVIA) | Decimal calculado | Margem operacional |
| T | 4 | MTS +10% (NVIA) | Decimal calculado | |
| R | 5 | MTS +20% (VENDA) | Decimal calculado | Margem comercial |
| T | 5 | MTS +20% (VENDA) | Decimal calculado | |

---

#### 2.1.3 ABA: Fatores de Ajuste — Estrutura Completa

```
A1: "Fatores de Reajuste das Peças"
A2: LSG         B2: 1.4
A3: MOBÍLIAS    B3: 1.2
A4: RACK SLIM   B4: 1.2
A5: CHECKOUTS   B5: 1.0

A7: "Lista de Montantes"
A8: MONTADOS    B8: 1
A9: DESMONTADOS B9: 4
```

**Interpretação:**
- **LSG (Linha Seca / Gôndolas):** fator 1.4 = volume calculado puro × 1.4 (40% de acréscimo logístico)
- **MOBÍLIAS:** fator 1.2 = 20% de acréscimo
- **RACK SLIM:** fator 1.2 = 20% de acréscimo
- **CHECKOUTS:** fator 1.0 = sem acréscimo (volume já declarado é final)
- **MONTADOS:** fator 1 — Qtd/m³ base é a padrão do produto
- **DESMONTADOS:** fator 4 — a Qtd/m³ é multiplicada por 4 (produto desmontado cabe 4× mais por m³)

---

#### 2.1.4 TODAS AS FÓRMULAS — ABA ESTIMATIVA

**FÓRMULA F3 a F16 — Volume por item (Gôndolas/Mobílias):**
```
=(D/E)
```
- **Objetivo:** Calcular o volume em m³ de um item
- **Campos:** D = Quantidade; E = Quantidade de peças que cabem em 1 m³
- **Matemática:** Volume (m³) = Quantidade ÷ (Peças por m³)
- **Linguagem humana:** "Se 1 m³ comporta E peças e eu tenho D peças, quantos m³ preciso?"
- **Pseudocódigo:**
```
volumeItem = quantidade / pecasPorM3
```
- **Java:**
```java
BigDecimal volumeItem = quantidade.divide(pecasPorM3, 10, RoundingMode.HALF_UP);
```

---

**FÓRMULA F18 — Total bruto de volume (Gôndolas):**
```
=SUM(F3:F17)
```
- **Objetivo:** Somar todos os volumes individuais dos itens de gôndola
- **Java:**
```java
BigDecimal totalBruto = itens.stream()
    .map(Item::getVolume)
    .reduce(BigDecimal.ZERO, BigDecimal::add);
```

---

**FÓRMULA F19 — Total ajustado (Gôndolas LSG):**
```
=F18 * 'Fatores de Ajuste'!$B$2
```
- **Objetivo:** Aplicar o fator logístico da categoria LSG (1.4) ao total bruto
- **Matemática:** TotalAjustado = TotalBruto × 1.4
- **Linguagem humana:** "O volume real de transporte de gôndolas é 40% maior que o volume calculado das peças"
- **Pseudocódigo:**
```
totalAjustadoLSG = totalBrutoGondolas * fatorLSG  // fatorLSG = 1.4
```
- **Java:**
```java
BigDecimal totalAjustadoLSG = totalBrutoGondolas.multiply(fatores.getFatorLSG());
```

---

**FÓRMULA F28 — Total ajustado (Mobílias):**
```
=F27 * 'Fatores de Ajuste'!$B$3
```
- Mesma lógica do F19, mas com fator MOBÍLIAS = 1.2
- **Java:**
```java
BigDecimal totalAjustadoMobilias = totalBrutoMobilias.multiply(fatores.getFatorMobilias());
```

---

**FÓRMULA L6 — Total ajustado (Rack Slim):**
```
=L5 * 'Fatores de Ajuste'!$B$4
```
- Fator RACK SLIM = 1.2
- L5 = soma L3+L4 (volumes dos itens de Rack Slim)

---

**FÓRMULA L17 — Total bruto (Checkouts):**
```
=L9+L10+L11+L12+L13+L14+L15+L16
```
- Soma explícita (não usa SUM) dos volumes individuais dos checkouts

---

**FÓRMULA L18 — Total ajustado (Checkouts):**
```
=L17 * 'Fatores de Ajuste'!$B$5
```
- Fator CHECKOUTS = 1.0 (sem ajuste)

---

**FÓRMULAS K24 a K32 — Qtd/m³ dinâmica para Montantes de Porta Pallets:**
```
K24: =6.73 * VLOOKUP($N$22, 'Fatores de Ajuste'!$A$8:$B$9, 2, 0)
K25: =3.46 * VLOOKUP($N$22, 'Fatores de Ajuste'!$A$8:$B$9, 2, 0)
K26: =2.39 * VLOOKUP($N$22, 'Fatores de Ajuste'!$A$8:$B$9, 2, 0)
K27: =1.77 * VLOOKUP($N$22, 'Fatores de Ajuste'!$A$8:$B$9, 2, 0)
K28: =1.19 * VLOOKUP($N$22, 'Fatores de Ajuste'!$A$8:$B$9, 2, 0)
K29: =0.90 * VLOOKUP($N$22, 'Fatores de Ajuste'!$A$8:$B$9, 2, 0)
K30: =0.81 * VLOOKUP($N$22, 'Fatores de Ajuste'!$A$8:$B$9, 2, 0)
K31: =0.72 * VLOOKUP($N$22, 'Fatores de Ajuste'!$A$8:$B$9, 2, 0)
K32: =0.60 * VLOOKUP($N$22, 'Fatores de Ajuste'!$A$8:$B$9, 2, 0)
```
- **VLOOKUP:** Busca o valor de $N$22 (que é "MONTADOS" ou "DESMONTADOS") na tabela $A$8:$B$9 e retorna o fator correspondente (1 ou 4)
- **Objetivo:** O número de peças que cabem em 1 m³ muda conforme o produto vai montado (fator 1) ou desmontado (fator 4)
- **Linguagem humana:** "Se os montantes forem desmontados, cabem 4× mais por m³; se montados, usa a capacidade padrão"
- **Pseudocódigo:**
```
fatorMontagem = (statusMontagem == "MONTADOS") ? 1 : 4
qtdPorM3Montante1M = 6.73 * fatorMontagem
qtdPorM3Montante2M = 3.46 * fatorMontagem
// ... etc.
```
- **Java:**
```java
int fatorMontagem = StatusMontagem.MONTADOS.equals(status) ? 1 : 4;
BigDecimal qtdPorM3 = capacidadeBase.multiply(BigDecimal.valueOf(fatorMontagem));
```

---

**FÓRMULA L38 — Total bruto (Porta Pallets):**
```
=SUM(L22:L37)
```

---

**FÓRMULA L39 — Total ajustado (Porta Pallets):**
```
=L38 * '[1]Fatores de Ajuste'!$B$6
```
- **ATENÇÃO:** Referência a `$B$6` que na aba "Fatores de Ajuste" está vazia (B6 não aparece nos dados). Isso indica ou um fator ainda não definido, ou erro de referência. Provável que seja o fator de PORTA PALLETS, atualmente indefinido/1.0.

---

**FÓRMULA R2 — Volume Total (Caminhão):**
```
=F19 + F28 + L6 + L18 + L39
```
- **Objetivo:** Somar todos os totais ajustados de todas as categorias
- **Componentes:**
  - F19 = Total Ajustado GÔNDOLAS (LSG)
  - F28 = Total Ajustado MOBÍLIAS
  - L6  = Total Ajustado RACK SLIM
  - L18 = Total Ajustado CHECKOUTS
  - L39 = Total Ajustado PORTA PALLETS
- **Java:**
```java
BigDecimal volumeTotal = totalAjustadoLSG
    .add(totalAjustadoMobilias)
    .add(totalAjustadoRackSlim)
    .add(totalAjustadoCheckouts)
    .add(totalAjustadoPortaPallets);
```

---

**FÓRMULA T2 — Volume Total (Container):**
```
=R2
```
- Igual ao volume total do caminhão. A diferença está apenas no cálculo de metros de carroceria.

---

**FÓRMULA R3 — Metros de Carroceria (Caminhão):**
```
=R2 * 12 / 60
```
- **Matemática:** MtsCaminhão = VolumeTotal × 12 ÷ 60 = VolumeTotal × 0,2
- **Interpretação:** Um caminhão tem seção transversal de referência 60 m² (5m × 12m de altura útil?). A constante 12 representa a altura interna (em metros) × alguma dimensão fixa. Mais provavelmente: a carroceria tem largura e altura fixas; 60 = Largura × Altura da seção transversal interna em dm² ou outra convenção da empresa. **Resultado prático:** para cada m³, ocupa 0,2 metros de comprimento de carroceria.
- **Pseudocódigo:**
```
metrosCarroceriaCaminhao = volumeTotal * 12 / 60
```
- **Java:**
```java
BigDecimal metrosCaminhao = volumeTotal
    .multiply(BigDecimal.valueOf(12))
    .divide(BigDecimal.valueOf(60), 10, RoundingMode.HALF_UP);
```

---

**FÓRMULA T3 — Metros de Carroceria (Container):**
```
=T2 * 12 / 45
```
- **Matemática:** MtsContainer = VolumeTotal × 12 ÷ 45 = VolumeTotal × 0,2667
- **Interpretação:** Container tem seção transversal menor (45 vs 60), portanto ocupa mais metros lineares por m³ de carga.
- **Pseudocódigo:**
```
metrosCarroceriaContainer = volumeTotal * 12 / 45
```

---

**FÓRMULA R4 — Metros +10% (Caminhão, margem NViA):**
```
=R3 * 110%
```
- **Objetivo:** Projeção com 10% de folga operacional (margem de segurança para negociação com transportadora/NViA)
- **Java:**
```java
BigDecimal metrosCaminhaoNViA = metrosCaminhao.multiply(new BigDecimal("1.10"));
```

---

**FÓRMULA R5 — Metros +20% (Caminhão, margem de venda):**
```
=R3 * 120%
```
- **Objetivo:** Projeção com 20% de margem para precificação de frete ao cliente
- **Java:**
```java
BigDecimal metrosCaminhaoVenda = metrosCaminhao.multiply(new BigDecimal("1.20"));
```

---

**FÓRMULA T4, T5 — Mesmas margens para Container:**
```
T4: =T3 * 110%
T5: =T3 * 120%
```

---

**FÓRMULA T8 — Valor auxiliar (Container):**
```
=T5 / 12
```
- Divide os metros de carroceria +20% do container por 12. Pode representar custo por unidade ou segmentação por módulo de 1 metro.

---

**CONSTANTES PRÉ-DEFINIDAS (Qtd/m³ por produto):**

| Produto | Qtd/m³ | Tipo |
|---|---|---|
| APARADOR ACRÍLICO | 1092 | Constante fixa |
| BASE DE GÔNDOLA | 124 | Constante fixa |
| COLUNA DE GÔNDOLA | 300 | Constante fixa |
| CONJUNTO FUNDO | =120/5 = 24 | Fórmula (derivada) |
| PAINEL COMUM | =120 (constante via fórmula) | Constante via fórmula |
| PAINEL MF | 500 | Constante fixa |
| CONJUNTO GANCHO | 820 | Constante fixa |
| PRATELEIRAS 200MM | 120 | Constante fixa |
| PRATELEIRAS 500MM | 70 | Constante fixa |
| PRATELEIRAS 800MM | 35 | Constante fixa |
| PICKBOX GRANDE / CESTO | 5 | Constante fixa |
| PODIUM | 8 | Constante fixa |
| PORTA ETIQUETAS COMPRIDOS | 1400 | Constante fixa |
| RÉGUA | 220 | Constante fixa |
| CHECKSTAND 500×1715×1250 | 0.42 | Constante fixa (baixa densidade) |
| CHECKSTAND 500×1280×1150 | 1 | Constante fixa |
| PRATELEIRA 250×500×100 | 70 | Constante fixa |
| TABLADO 1000×1200 | 3 | Constante fixa |
| CHECK OUT 2000 | 0.5254988913525499 | Constante decimal precisa |
| CHECK OUT 2400 | 0.46711012564671106 | Constante decimal precisa |
| CHECK OUT 2800 | 0.40872135994087216 | Constante decimal precisa |
| CHECK OUT 3200 | 0.37076866223207688 | Constante decimal precisa |
| CHECK OUT 3600 | 0.32989652623798971 | Constante decimal precisa |
| CHECK OUT 4200 | 0.29194382852919443 | Constante decimal precisa |
| SELF CHECK OUTS | 0.25 | Constante fixa |
| LONGARINAS | 23 | Constante fixa |
| LUMINÁRIAS | 150 | Constante fixa |
| MONTANTE 1M | 6.73 × fator | Dinâmica (VLOOKUP) |
| MONTANTE 2M | 3.46 × fator | Dinâmica (VLOOKUP) |
| MONTANTE 3M | 2.39 × fator | Dinâmica (VLOOKUP) |
| MONTANTE 4M | 1.77 × fator | Dinâmica (VLOOKUP) |
| MONTANTE 6M | 1.19 × fator | Dinâmica (VLOOKUP) |
| MONTANTE 8M | 0.90 × fator | Dinâmica (VLOOKUP) |
| MONTANTE 9M | 0.81 × fator | Dinâmica (VLOOKUP) |
| MONTANTE 10M | 0.72 × fator | Dinâmica (VLOOKUP) |
| MONTANTE 12M | 0.60 × fator | Dinâmica (VLOOKUP) |
| PAINEL RI | 50 | Constante fixa |
| PRATELEIRAS DD | 300 | Constante fixa |
| PRATELEIRA MDF | 33 | Constante fixa |
| PROTETOR DE COLUNA | 80 | Constante fixa |

**OBSERVAÇÃO CRÍTICA:** Os valores de Qtd/m³ dos Checkouts têm precisão de 16 casas decimais. Isso indica que foram calculados a partir de dimensões físicas exatas (L×A×P do equipamento), mas o cálculo original não está exposto na planilha — apenas o resultado. O sistema deve armazenar essas constantes com alta precisão decimal (mínimo 10 casas).

---

#### 2.1.5 ABA: Validações — Estrutura e Regras

Esta aba contém **3 pedidos reais** usados como histórico de validação, identificados pelos códigos:
- `5307224-3` — MÊS, 180m³, fator 1.4
- `5109124-5` — MÊS, 130m³, fator 120 (referência de peças)
- `12207924-3` — MÊS, 113m², fator 140

Cada bloco replica exatamente a estrutura da aba Estimativa (Qtd, Qtd/m³, Vol m³, Total, Total Ajustado), demonstrando que as fórmulas são idênticas.

**Regras adicionais descobertas na aba Validações:**
- O campo "PAINEL MF" pode ter Qtd sem Qtd/m³ definida (linha PainelMF=1850 sem Qtd/m³ no pedido 5307224-3), resultando em volume = 0. **Regra implícita:** produto sem Qtd/m³ cadastrada não contribui para o volume.
- A aba confirma que `PRATELEIRAS 400MM` existe como produto mas não está na aba Estimativa principal. Indica que a lista de produtos é expansível/editável.
- O `PICKBOX GRANDE` tem Qtd/m³ variável entre pedidos: 10 no pedido 1, 5 nos pedidos 2 e 3 — sugere que o valor de Qtd/m³ pode ser ajustado manualmente por pedido.

---

### 2.2 EXCEL 07 — ESTIMATIVA SK E RFG (Linha Refrigerada)

#### 2.2.1 Estrutura das Abas

| Aba | Função |
|---|---|
| `NOMENCLATURA ATUAL` | Mapeamento linha atual → linha nova com status de documentação |
| `PROPOSTA NOVA NUMENCLATURA 1` | Refinamento da nomenclatura com estrutura semântica da codificação |
| `PROPOSTA NOVA NUMENCLATURA 2` | Catálogo dimensional completo com pesos bruto e líquido |

---

#### 2.2.2 ABA: NOMENCLATURA ATUAL — Estrutura de Colunas

| Coluna | Nome | Tipo | Descrição |
|---|---|---|---|
| A | LINHA ATUAL (código) | Texto | Código antigo do produto (ex.: NEH2P-4i 1,00M) |
| B | LINHA ATUAL (descrição) | Texto | Descrição completa antiga |
| D | LINHA NOVA (código) | Texto | Novo código (ex.: FCA-4 1,00M) |
| E | LINHA NOVA (descrição) | Texto | Nova descrição completa |
| F | ESTRUTURA | Número | Número de estrutura técnica do produto |
| G | CONFIGURADOR | Flag (X) | Indica se produto tem configurador digital |
| H | RENDER | Flag (X) | Indica se produto tem render 3D disponível |
| I | CORTE | Flag (X) | Indica se produto tem corte técnico disponível |
| J | INFORMAÇÕES | Texto | Observações especiais |

**Status de documentação por produto (flags X):**
- Um produto pode ter todas as flags (X em ESTRUTURA, CONFIGURADOR, RENDER, CORTE) ou nenhuma
- Produtos sem nenhuma flag estão em processo de documentação
- Alguns têm apenas CORTE (sem configurador/render)

---

#### 2.2.3 ABA: PROPOSTA NOVA NUMENCLATURA 1 — Lógica Semântica da Codificação

Esta aba revela a **gramática de nomenclatura** dos produtos:

**Estrutura do código novo:** `F[família][variante temperatura]_[comprimento]`

| Posição | Significado | Valores |
|---|---|---|
| F | Fast (marca) | Sempre "F" |
| C/R/V/I | Formato: Curvo, Reto, Vertical, Ilha | C=Curvo, R=Reto, V=Vertical, I=Ilha |
| A/F/P/D | Fechamento: Aberto, Fechado, Porta, Dry Aged | — |
| -0/-4/-6/-18/-Q/-S | Temperatura | 0=0°C, 4=-4°C, 6=-6°C, 18=-18°C, Q=Quente, S=Seco |
| comprimento | Em metros (ex.: 1.00, 1.25, 1.87, 2.40) | — |

**Exemplos decodificados:**
- `FCA-4 1,00M` = Fast, Curvo, Aberto, -4°C, 1,00m
- `FCF-0 1,25M` = Fast, Curvo, Fechado, 0°C, 1,25m
- `FCP-6 1,87M` = Fast, Curvo, Porta, -6°C, 1,87m
- `FVP-0 1,80M` = Fast, Vertical, Porta, 0°C, 1,80m
- `FVA-4 1,00M` = Fast, Vertical, Aberto, -4°C, 1,00m
- `FRF-S 1,25M` = Fast, Reto, Fechado, Seco, 1,25m
- `FICFD TS 1,85` = Fast, Ilha, Compacta, Fechada, Degelo, Terminal, Sólida, 1,85m

**FVPP** = Fast, Vertical, Porta, Plug-In  
**FVPC** = Fast, Vertical, Porta, Combinado  
**FVPT** = Fast, Vertical, Porta, UC Teto  
**FVPD** = Fast, Vertical, Dry Aged  

---

#### 2.2.4 ABA: PROPOSTA NOVA NUMENCLATURA 2 — Catálogo Dimensional

**Colunas:**

| Coluna | Nome | Tipo | Obrigatório |
|---|---|---|---|
| A | Código Antigo | Texto | Sim |
| B | Código Atual | Texto | Sim |
| C | Descrição | Texto | Sim |
| D | Comprimento (m) | Decimal | Sim |
| E | Largura (m) | Decimal | Sim |
| F | Altura (m) | Decimal | Sim |
| G | Peso Bruto (kg) | Inteiro | Sim |
| H | Peso Líquido (kg) | Inteiro/??? | Sim (alguns com "???") |

**Dados dimensionais dos produtos (linha refrigerada):**

| Código Atual | Comprimento | Largura | Altura | Peso Bruto | Peso Líq. |
|---|---|---|---|---|---|
| F01 CA-4 1,00 | 1.56m | 1.20m | 1.72m | 281kg | 226kg |
| F01 CA-4 1,25 | 1.56m | 1.20m | 1.72m | 281kg | 226kg |
| F01 CF-0 1,25 | 1.56m | 1.20m | 1.72m | 281kg | 226kg |
| F01 CF-0 1,87 | 2.30m | 1.20m | 1.72m | 319kg | 244kg |
| F01 CP-0 1,87 | 2.30m | 1.20m | 1.72m | 366kg | 290kg |
| F01 RF-0 1,25 | 1.56m | 1.20m | 1.72m | 281kg | 226kg |
| F01 RF-0 1,87 | 2.30m | 1.20m | 1.72m | 319kg | 244kg |
| F01 VP-0 1,20 | 1.42m | 1.00m | 2.32m | 296kg | 267kg |
| F01 VP-0 1,80 | 2.00m | 1.00m | 2.32m | 475kg | 425kg |
| F01 VP-0 2,40 | 2.64m | 1.00m | 2.32m | 550kg | 530kg |
| F01 VA-4 1,00 | 1.39m | 1.00m | 2.00m | 276kg | 247kg |
| F01 VD-0 1,20 | 1.53m | 1.16m | 2.48m | 296kg | 256kg |
| F01 VPP-0 2,50 | 2.68m | 0.96m | 2.55m | 606kg | 556kg |
| F01 VPC-18 2,10 | 2.48m | 1.16m | 2.59m | 524kg | ??? |
| F01 VPC-18 2,50 | 2.86m | 1.16m | 2.59m | 624kg | ??? |
| F01 ICFD TS 1,85 | 1.92m | 0.95m | 1.01m | 160kg | 144kg |
| F01 ICFD TS 2,10 | 2.19m | 0.95m | 1.01m | 178kg | 160kg |
| F01 ICFD CS 2,50 | 2.62m | 0.95m | 1.01m | 208kg | 187kg |
| F01 IAP-0 V 1,00 | 1.15m | 1.16m | 1.23m | 178kg | 160kg |
| F01 IAP-0 V 0,70 | 1.13m | 1.13m | 1.25m | 150kg | 142kg |
| F01 IAP-0 S 1,50 | 1.72m | 1.20m | 1.20m | 275kg | 200kg |
| F01 IAP-0 S 2,00 | 2.18m | 1.20m | 1.20m | 297kg | 222kg |
| F01 IAPP-0 1,25 | 1.56m | 1.50m | 1.72m | 230kg | 207kg |
| F01 VPT-0 1,80 | 2.00m | 1.00m | 2.32m | 475kg | 425kg |
| F01 VPT-0 2,40 | 2.64m | 1.00m | 2.32m | 550kg | 530kg |

**Volume calculável:** Para cada produto da linha fria, o volume cúbico é:
```
Volume_m³ = Comprimento × Largura × Altura
```
Ex.: F01 VP-0 1,80 → 2.00 × 1.00 × 2.32 = **4.64 m³** por unidade

---

## 3. ANÁLISE DA VOLUMETRIA

### 3.1 Modelo Matemático Completo

A volumetria da Fast Gôndulas opera em dois paradigmas distintos:

**PARADIGMA A — Linha Seca (tabela Qtd/m³):**
O volume é calculado por densidade de empilhamento — quantas peças daquele produto cabem em 1 m³ de espaço de transporte. Esta abordagem é usada para produtos pequenos/empilháveis (painel, prateleira, gancho, etc.).

```
Volume_item = Qtd_item / Qtd_por_m3_item
Volume_bruto_categoria = Σ Volume_item (todos itens da categoria)
Volume_ajustado_categoria = Volume_bruto_categoria × Fator_categoria
Volume_total = Σ Volume_ajustado (todas as categorias)
```

**PARADIGMA B — Linha Fria (dimensões físicas):**
O volume é calculado diretamente pelas dimensões do produto (L × A × H), pois são equipamentos grandes e não empilháveis.

```
Volume_unidade = Comprimento × Largura × Altura
Volume_item = Volume_unidade × Qtd
Volume_total_linha_fria = Σ Volume_item
```

**INTEGRAÇÃO:** Uma estimativa completa (linha seca + linha fria) requer a soma dos dois paradigmas.

### 3.2 Fórmulas Centrais

```
// LINHA SECA
Vol(item) = Qtd(item) / QtdPorM3(item)
Vol_bruto(cat) = Σ Vol(item)
Vol_ajust(cat) = Vol_bruto(cat) × Fator(cat)
Vol_total = Σ Vol_ajust(LSG, MOB, RACK, CHK, PORTAL)

// MONTANTES (porta-pallets) — fator dinâmico
QtdPorM3_efetivo = QtdPorM3_base × FatorMontagem  // 1 se montado, 4 se desmontado

// LOGÍSTICA
Mts_carroceria_caminhao = Vol_total × 12 / 60     = Vol_total × 0.20
Mts_carroceria_container = Vol_total × 12 / 45    = Vol_total × 0.2667
Mts_+10%(NViA) = Mts_carroceria × 1.10
Mts_+20%(Venda) = Mts_carroceria × 1.20

// LINHA FRIA
Vol_unitario(sku) = Comprimento(sku) × Largura(sku) × Altura(sku)
Vol_item(sku) = Vol_unitario(sku) × Qtd(sku)
```

### 3.3 Fatores de Ajuste por Categoria

| Categoria | Fator | Lógica |
|---|---|---|
| LSG (Gôndolas) | 1.40 | +40% logístico (embalagens, folga, irregularidade) |
| MOBÍLIAS | 1.20 | +20% logístico |
| RACK SLIM | 1.20 | +20% logístico |
| CHECKOUTS | 1.00 | Volume já preciso |
| PORTA PALLETS | indefinido (ref. B6) | A definir |

### 3.4 Pseudocódigo do Motor de Volumetria

```
FUNCTION calcularVolumetria(pedido, statusMontagem):
  // FASE 1: Calcular volumes individuais
  FOR EACH item IN pedido.itens:
    qtdPorM3 = obterQtdPorM3(item.codigo, statusMontagem)
    IF qtdPorM3 == 0 OR qtdPorM3 IS NULL:
      item.volume = 0  // produto sem capacidade definida não contribui
    ELSE:
      item.volume = item.quantidade / qtdPorM3

  // FASE 2: Totalizar por categoria
  vol_gondolas = SUM(item.volume WHERE item.categoria == 'LSG')
  vol_mobilias = SUM(item.volume WHERE item.categoria == 'MOBILIAS')
  vol_rack = SUM(item.volume WHERE item.categoria == 'RACK_SLIM')
  vol_checkouts = SUM(item.volume WHERE item.categoria == 'CHECKOUTS')
  vol_portapallets = SUM(item.volume WHERE item.categoria == 'PORTA_PALLETS')

  // FASE 3: Aplicar fatores
  vol_adj_gondolas = vol_gondolas * FATOR_LSG          // 1.4
  vol_adj_mobilias = vol_mobilias * FATOR_MOBILIAS     // 1.2
  vol_adj_rack = vol_rack * FATOR_RACK                 // 1.2
  vol_adj_checkouts = vol_checkouts * FATOR_CHECKOUTS  // 1.0
  vol_adj_portapallets = vol_portapallets * FATOR_PORTA_PALLETS

  // FASE 4: Volume total
  volume_total = vol_adj_gondolas + vol_adj_mobilias + vol_adj_rack
                 + vol_adj_checkouts + vol_adj_portapallets

  // FASE 5: Logística
  mts_caminhao = volume_total * 12 / 60
  mts_container = volume_total * 12 / 45
  mts_caminhao_nvia = mts_caminhao * 1.10
  mts_caminhao_venda = mts_caminhao * 1.20
  mts_container_nvia = mts_container * 1.10
  mts_container_venda = mts_container * 1.20

  RETURN VolumetriaResult {
    volumeTotal, mts_caminhao, mts_container,
    mts_caminhao_nvia, mts_caminhao_venda,
    mts_container_nvia, mts_container_venda,
    detalhePorCategoria: [...]
  }
```

### 3.5 Implementação Java Sugerida

```java
@Service
public class VolumetriaService {

    private static final BigDecimal FATOR_LSG = new BigDecimal("1.4");
    private static final BigDecimal FATOR_MOBILIAS = new BigDecimal("1.2");
    private static final BigDecimal FATOR_RACK_SLIM = new BigDecimal("1.2");
    private static final BigDecimal FATOR_CHECKOUTS = new BigDecimal("1.0");
    private static final BigDecimal CONST_CAMINHAO_NUMERADOR = new BigDecimal("12");
    private static final BigDecimal CONST_CAMINHAO_DENOMINADOR = new BigDecimal("60");
    private static final BigDecimal CONST_CONTAINER_DENOMINADOR = new BigDecimal("45");
    private static final BigDecimal MARGEM_NVIA = new BigDecimal("1.10");
    private static final BigDecimal MARGEM_VENDA = new BigDecimal("1.20");

    @Autowired
    private ProdutoRepository produtoRepository;

    public VolumetriaResultDTO calcular(EstimativaInputDTO input) {
        Map<Categoria, BigDecimal> volumesBrutos = new EnumMap<>(Categoria.class);
        Arrays.stream(Categoria.values()).forEach(c -> volumesBrutos.put(c, BigDecimal.ZERO));

        // Calcular volume por item
        List<ItemVolumeDTO> detalhes = new ArrayList<>();
        for (ItemPedidoDTO itemInput : input.getItens()) {
            Produto produto = produtoRepository.findByCodigo(itemInput.getCodigo())
                .orElseThrow(() -> new ProdutoNaoEncontradoException(itemInput.getCodigo()));

            BigDecimal qtdPorM3 = resolverQtdPorM3(produto, input.getStatusMontagem());
            BigDecimal volume = qtdPorM3.compareTo(BigDecimal.ZERO) == 0
                ? BigDecimal.ZERO
                : new BigDecimal(itemInput.getQuantidade())
                    .divide(qtdPorM3, 10, RoundingMode.HALF_UP);

            volumesBrutos.merge(produto.getCategoria(), volume, BigDecimal::add);
            detalhes.add(new ItemVolumeDTO(itemInput.getCodigo(), itemInput.getQuantidade(),
                qtdPorM3, volume));
        }

        // Aplicar fatores
        BigDecimal volLSG = volumesBrutos.get(Categoria.LSG).multiply(FATOR_LSG);
        BigDecimal volMob = volumesBrutos.get(Categoria.MOBILIAS).multiply(FATOR_MOBILIAS);
        BigDecimal volRack = volumesBrutos.get(Categoria.RACK_SLIM).multiply(FATOR_RACK_SLIM);
        BigDecimal volChk = volumesBrutos.get(Categoria.CHECKOUTS).multiply(FATOR_CHECKOUTS);
        BigDecimal volPP = volumesBrutos.get(Categoria.PORTA_PALLETS)
            .multiply(resolverFatorPortaPallets());

        BigDecimal volumeTotal = volLSG.add(volMob).add(volRack).add(volChk).add(volPP);

        // Logística
        BigDecimal mtsCaminhao = volumeTotal.multiply(CONST_CAMINHAO_NUMERADOR)
            .divide(CONST_CAMINHAO_DENOMINADOR, 4, RoundingMode.HALF_UP);
        BigDecimal mtsContainer = volumeTotal.multiply(CONST_CAMINHAO_NUMERADOR)
            .divide(CONST_CONTAINER_DENOMINADOR, 4, RoundingMode.HALF_UP);

        return VolumetriaResultDTO.builder()
            .volumeTotal(volumeTotal)
            .metrosCarroceriaCaminhao(mtsCaminhao)
            .metrosCarroceriaContainer(mtsContainer)
            .metrosCaminhaoNViA(mtsCaminhao.multiply(MARGEM_NVIA))
            .metrosCaminhaoVenda(mtsCaminhao.multiply(MARGEM_VENDA))
            .metrosContainerNViA(mtsContainer.multiply(MARGEM_NVIA))
            .metrosContainerVenda(mtsContainer.multiply(MARGEM_VENDA))
            .detalhePorCategoria(Map.of(
                "LSG", volLSG, "MOBILIAS", volMob,
                "RACK_SLIM", volRack, "CHECKOUTS", volChk,
                "PORTA_PALLETS", volPP))
            .itens(detalhes)
            .build();
    }

    private BigDecimal resolverQtdPorM3(Produto produto, StatusMontagem status) {
        if (produto.getCategoria() == Categoria.PORTA_PALLETS
                && produto.isMontante()) {
            int fator = StatusMontagem.DESMONTADOS.equals(status) ? 4 : 1;
            return produto.getQtdPorM3Base()
                .multiply(BigDecimal.valueOf(fator));
        }
        return produto.getQtdPorM3();
    }
}
```

### 3.6 API REST — Volumetria

```
POST /api/v1/estimativas/volumetria
Body: EstimativaInputDTO {
  pedidoId: String (opcional),
  statusMontagem: enum [MONTADOS, DESMONTADOS],
  modal: enum [CAMINHAO, CONTAINER, AMBOS],
  itens: [{ codigo: String, quantidade: int }]
}
Response: VolumetriaResultDTO {
  volumeTotal: decimal,
  metrosCarroceriaCaminhao: decimal,
  metrosCarroceriaContainer: decimal,
  metrosCaminhaoNViA: decimal,
  metrosCaminhaoVenda: decimal,
  metrosContainerNViA: decimal,
  metrosContainerVenda: decimal,
  detalhePorCategoria: { LSG: decimal, MOBILIAS: decimal, ... },
  itens: [{ codigo, quantidade, qtdPorM3, volume }]
}

GET /api/v1/estimativas/{id}
GET /api/v1/estimativas/historico?clienteId=&dataInicio=&dataFim=
```

### 3.7 Modelo de Banco — Volumetria

```sql
CREATE TABLE produto (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    codigo_legado VARCHAR(50),
    descricao VARCHAR(255) NOT NULL,
    categoria VARCHAR(30) NOT NULL,  -- LSG, MOBILIAS, RACK_SLIM, CHECKOUTS, PORTA_PALLETS
    qtd_por_m3 NUMERIC(18,10),       -- peças por m³ (alta precisão)
    qtd_por_m3_base NUMERIC(18,10),  -- base para montantes (antes do fator)
    is_montante BOOLEAN DEFAULT FALSE,
    comprimento_m NUMERIC(8,4),
    largura_m NUMERIC(8,4),
    altura_m NUMERIC(8,4),
    peso_bruto_kg NUMERIC(10,2),
    peso_liquido_kg NUMERIC(10,2),
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT NOW(),
    atualizado_em TIMESTAMP DEFAULT NOW()
);

CREATE TABLE fator_ajuste (
    id BIGSERIAL PRIMARY KEY,
    categoria VARCHAR(30) UNIQUE NOT NULL,
    fator NUMERIC(6,4) NOT NULL,
    descricao VARCHAR(100),
    ativo BOOLEAN DEFAULT TRUE
);

CREATE TABLE fator_montagem (
    id BIGSERIAL PRIMARY KEY,
    status VARCHAR(20) UNIQUE NOT NULL,  -- MONTADOS, DESMONTADOS
    fator INTEGER NOT NULL
);

CREATE TABLE estimativa (
    id BIGSERIAL PRIMARY KEY,
    numero_oc VARCHAR(50),
    cliente_id BIGINT REFERENCES cliente(id),
    status_montagem VARCHAR(20) NOT NULL,
    volume_total_m3 NUMERIC(12,4),
    mts_caminhao NUMERIC(10,4),
    mts_container NUMERIC(10,4),
    mts_caminhao_nvia NUMERIC(10,4),
    mts_caminhao_venda NUMERIC(10,4),
    mts_container_nvia NUMERIC(10,4),
    mts_container_venda NUMERIC(10,4),
    criado_por VARCHAR(100),
    criado_em TIMESTAMP DEFAULT NOW()
);

CREATE TABLE estimativa_item (
    id BIGSERIAL PRIMARY KEY,
    estimativa_id BIGINT REFERENCES estimativa(id),
    produto_id BIGINT REFERENCES produto(id),
    quantidade INTEGER NOT NULL,
    qtd_por_m3_utilizado NUMERIC(18,10),
    volume_m3 NUMERIC(12,6),
    volume_ajustado_m3 NUMERIC(12,6)
);

CREATE INDEX idx_produto_codigo ON produto(codigo);
CREATE INDEX idx_produto_categoria ON produto(categoria);
CREATE INDEX idx_estimativa_cliente ON estimativa(cliente_id);
CREATE INDEX idx_estimativa_item_estimativa ON estimativa_item(estimativa_id);
```

---

## 4. ANÁLISE DO FRETE

### 4.1 Modelo de Frete Identificado

O Excel não possui uma seção de frete monetário explícita, mas o modelo logístico que serve de base para precificação do frete é o cálculo de **metros de carroceria**, que é a unidade comercial para contratação de fretes rodoviários no Brasil.

**Regras comerciais identificadas:**

| Variável | Valor | Fonte |
|---|---|---|
| Seção transversal caminhão | 60 (constante) | Fórmula R3 |
| Seção transversal container | 45 (constante) | Fórmula T3 |
| Fator altura referência | 12 | Constante nas fórmulas |
| Margem NViA (custo real) | +10% | Fórmulas R4/T4 |
| Margem Venda (preço cliente) | +20% | Fórmulas R5/T5 |
| Condição de pagamento (OC) | 28 DDL | PDF |

**Modalidades de transporte:**
- **Caminhão:** carga completa ou fracionada, medido em metros de carroceria
- **Container:** marítimo ou rodoviário intermodal, com seção menor (45 vs 60)

**Interpretação das constantes:**
- A constante `12` provavelmente representa a área da seção transversal interna da carroceria em m² (ex.: 2.4m largura × 5m altura = 12 m²) ou é o fator de conversão entre o volume e o espaço linear
- A constante `60` para caminhão = referência de capacidade em volume de um caminhão padrão (ex.: comprimento 10m × área 6 m² da seção = 60 m³ total)  
- A constante `45` para container = capacidade de referência do container (20 pés ≈ 33 m³, 40 pés ≈ 67 m³; o valor 45 pode ser específico ao modelo da empresa)

**Resultado:** `MtsCarroceria = VolumeTotal × 12 / constante_modal`

Simplificando: para o caminhão, cada metro linear de carroceria comporta `60/12 = 5 m³` de carga. Para o container, cada metro linear comporta `45/12 = 3.75 m³`.

### 4.2 Fórmulas de Frete

```
// Conversão volume → metros lineares
MetrosLinearCaminhao = VolumeTotalM3 / 5.0
MetrosLinearContainer = VolumeTotalM3 / 3.75

// Equivalente com as constantes originais
MetrosLinearCaminhao = VolumeTotalM3 × 12 / 60
MetrosLinearContainer = VolumeTotalM3 × 12 / 45

// Margens
MetrosFreteCustoNViA = MetrosLinear × 1.10
MetrosFretePreclienteVenda = MetrosLinear × 1.20
```

### 4.3 Pseudocódigo de Frete

```
FUNCTION calcularFrete(volumeTotal, modal, tipoCalculo):
  IF modal == CAMINHAO:
    metrosBase = volumeTotal * 12 / 60
  ELIF modal == CONTAINER:
    metrosBase = volumeTotal * 12 / 45

  metrosNViA = metrosBase * 1.10     // custo real
  metrosVenda = metrosBase * 1.20   // preço ao cliente

  IF tipoCalculo == NVIA:
    RETURN metrosNViA
  ELIF tipoCalculo == VENDA:
    RETURN metrosVenda
  ELSE:
    RETURN metrosBase
```

### 4.4 Implementação Java Sugerida

```java
@Service
public class FreteService {

    private static final Map<Modal, BigDecimal> CONSTANTES_MODAL = Map.of(
        Modal.CAMINHAO, new BigDecimal("60"),
        Modal.CONTAINER, new BigDecimal("45")
    );
    private static final BigDecimal FATOR_ALTURA = new BigDecimal("12");

    public FreteResultDTO calcular(BigDecimal volumeTotalM3, Modal modal) {
        BigDecimal denominador = CONSTANTES_MODAL.get(modal);
        BigDecimal metrosBase = volumeTotalM3
            .multiply(FATOR_ALTURA)
            .divide(denominador, 4, RoundingMode.HALF_UP);

        return FreteResultDTO.builder()
            .modal(modal)
            .metrosBase(metrosBase)
            .metrosNViA(metrosBase.multiply(new BigDecimal("1.10")))
            .metrosVenda(metrosBase.multiply(new BigDecimal("1.20")))
            .build();
    }

    public FreteComparativoDTO compararModais(BigDecimal volumeTotalM3) {
        return FreteComparativoDTO.builder()
            .caminhao(calcular(volumeTotalM3, Modal.CAMINHAO))
            .container(calcular(volumeTotalM3, Modal.CONTAINER))
            .build();
    }
}
```

### 4.5 API REST — Frete

```
POST /api/v1/frete/calcular
Body: {
  volumeTotalM3: decimal,
  modal: enum [CAMINHAO, CONTAINER, AMBOS]
}
Response: {
  caminhao?: { metrosBase, metrosNViA, metrosVenda },
  container?: { metrosBase, metrosNViA, metrosVenda }
}

GET /api/v1/frete/tabela-modais
Response: { constanteCaminhao: 60, constanteContainer: 45, fatorAltura: 12 }

PUT /api/v1/frete/parametros
Body: { modal, constante }  // para atualização futura dos parâmetros
```

### 4.6 Modelo de Banco — Frete

```sql
CREATE TABLE parametro_frete (
    id BIGSERIAL PRIMARY KEY,
    modal VARCHAR(20) NOT NULL,       -- CAMINHAO, CONTAINER
    constante_secao NUMERIC(8,2) NOT NULL,
    fator_altura NUMERIC(8,2) NOT NULL,
    margem_nvia NUMERIC(6,4) DEFAULT 1.10,
    margem_venda NUMERIC(6,4) DEFAULT 1.20,
    ativo BOOLEAN DEFAULT TRUE,
    vigente_desde DATE NOT NULL,
    criado_em TIMESTAMP DEFAULT NOW()
);

INSERT INTO parametro_frete (modal, constante_secao, fator_altura, vigente_desde)
VALUES ('CAMINHAO', 60, 12, '2024-01-01'),
       ('CONTAINER', 45, 12, '2024-01-01');
```

---

## 5. REQUISITOS FUNCIONAIS

### RF-001 — Cadastro de Produtos (Linha Seca)
O sistema deve permitir cadastrar e manter produtos da linha seca (LSG) com: código, descrição, categoria, Qtd/m³ (peças por metro cúbico), indicação se é montante, e Qtd/m³ base para montantes.

### RF-002 — Cadastro de Produtos (Linha Fria/Refrigerada)
O sistema deve permitir cadastrar produtos da linha fria com: código atual, código legado, descrição, comprimento, largura, altura, peso bruto, peso líquido, flags de documentação (ESTRUTURA, CONFIGURADOR, RENDER, CORTE).

### RF-003 — Mapeamento de Nomenclatura
O sistema deve manter o mapeamento entre código antigo e código atual de todos os produtos da linha fria (SK e RFG), com status de migração e disponibilidade de documentação técnica.

### RF-004 — Cálculo de Volumetria por Item
O sistema deve calcular automaticamente o volume em m³ de cada item de um pedido, dado a quantidade e o Qtd/m³ do produto.

### RF-005 — Cálculo de Volumetria por Categoria
O sistema deve totalizar os volumes por categoria (LSG, MOBÍLIAS, RACK SLIM, CHECKOUTS, PORTA PALLETS) e aplicar os fatores de ajuste correspondentes.

### RF-006 — Cálculo de Volume Total
O sistema deve calcular o volume total consolidado somando todos os totais ajustados por categoria.

### RF-007 — Fator de Montagem Dinâmico
O sistema deve permitir selecionar o status de montagem (MONTADOS ou DESMONTADOS) para os montantes de porta-pallets, alterando automaticamente o Qtd/m³ efetivo (multiplicado por 1 ou 4, respectivamente).

### RF-008 — Cálculo de Metros de Carroceria
O sistema deve calcular os metros lineares de carroceria necessários para o transporte, para os modais Caminhão e Container, usando as constantes configuráveis.

### RF-009 — Projeções com Margens
O sistema deve calcular e exibir os metros de carroceria com margem +10% (NViA/custo) e +20% (Venda/preço ao cliente).

### RF-010 — Gestão de Fatores de Ajuste
O sistema deve manter e permitir atualizar os fatores de ajuste por categoria (LSG=1.4, MOBÍLIAS=1.2, RACK SLIM=1.2, CHECKOUTS=1.0).

### RF-011 — Gestão de Parâmetros Logísticos
O sistema deve manter os parâmetros de conversão (constante do caminhão=60, constante do container=45, fator de altura=12) e permitir sua atualização com histórico de vigência.

### RF-012 — Criação de Estimativas
O sistema deve permitir criar uma estimativa de volumetria associada a uma Ordem de Compra ou a um cliente, inserindo itens e quantidades.

### RF-013 — Histórico de Estimativas
O sistema deve manter histórico de todas as estimativas calculadas, com data, operador, cliente, OC vinculada e resultado.

### RF-014 — Validação de Pedido vs. Catálogo
O sistema deve validar que todos os itens de um pedido existem no cadastro de produtos antes de calcular a volumetria.

### RF-015 — Importação de Ordem de Compra (PDF)
O sistema deve permitir importar itens e quantidades a partir de uma Ordem de Compra em PDF, extraindo automaticamente os dados estruturados.

### RF-016 — Cadastro de Clientes
O sistema deve cadastrar clientes com razão social, CNPJ, contatos, endereços de entrega, responsável pelo recebimento, horário de entrega e observações.

### RF-017 — Gestão de Ordens de Compra
O sistema deve registrar e gerenciar ordens de compra com: número, status (APROVADO, PENDENTE, ENTREGUE), emissão, entrega prevista, comprador, fornecedor, condição de pagamento, itens e quantidades.

### RF-018 — Agendamento de Entrega
O sistema deve suportar o registro e controle do agendamento de entregas (mínimo 48h de antecedência, conforme regra da OC).

### RF-019 — Regras de Recebimento
O sistema deve registrar e exibir as regras de recebimento por cliente (horário, responsável, observações, necessidade de empilhadeira).

### RF-020 — Dashboard de Volumetria
O sistema deve apresentar um dashboard com os volumes calculados por modal, por categoria, e comparativo entre opções de margem.

### RF-021 — Exportação de Estimativa
O sistema deve permitir exportar a estimativa em formato Excel (replicando o layout atual) e PDF.

### RF-022 — Configurador de Produto (Linha Fria)
O sistema deve suportar a geração de configurações de produto (os flags CONFIGURADOR, RENDER, CORTE indicam documentação necessária).

### RF-023 — Cálculo de Volume Linha Fria
Para produtos da linha fria, o sistema deve calcular o volume unitário via dimensões físicas (C × L × A) e o volume total por quantidade.

### RF-024 — Comparativo de Modalidades
O sistema deve comparar as necessidades logísticas para Caminhão vs. Container em um único relatório, auxiliando na decisão de modal.

---

## 6. REQUISITOS NÃO FUNCIONAIS

### RNF-001 — Precisão Matemática
Todos os cálculos de volume devem usar aritmética de ponto fixo com mínimo de 10 casas decimais durante o processamento (`BigDecimal` em Java). Os valores de Qtd/m³ devem ser armazenados com mínimo de 10 casas decimais. Arredondamento final para 4 casas decimais usando `HALF_UP`.

### RNF-002 — Performance
O cálculo de volumetria para um pedido com até 500 itens deve retornar em menos de 2 segundos. Consultas de histórico devem retornar em menos de 3 segundos com índices adequados.

### RNF-003 — Auditoria
Todas as alterações em fatores de ajuste e parâmetros logísticos devem ser auditadas com: data, usuário, valor anterior e novo valor. Todas as estimativas criadas devem ser imutáveis após geração (versionamento).

### RNF-004 — Segurança
Acesso por perfis: ADMIN (todos os recursos), VENDAS (criar/ver estimativas), FINANCEIRO (ver estimativas e OC), LOGISTICA (criar/ver estimativas e OC). Autenticação via JWT. HTTPS obrigatório.

### RNF-005 — Validação de Dados
Quantidades devem ser inteiros positivos (> 0). Qtd/m³ deve ser decimal positivo (> 0). Fatores de ajuste devem ser decimais entre 0.1 e 10.0. Dimensões físicas devem ser positivas.

### RNF-006 — Logs
Log de todas as chamadas de API (endpoint, usuário, tempo de resposta, status HTTP). Log de todos os cálculos de volumetria (inputs e outputs). Log de erros com stack trace completo.

### RNF-007 — Escalabilidade
A arquitetura deve suportar múltiplos usuários simultâneos calculando estimativas sem interferência (stateless). O banco deve suportar crescimento de 10.000 estimativas/mês.

### RNF-008 — Disponibilidade
99.5% de uptime em horário comercial (07h–19h). Manutenção agendada fora do horário comercial.

### RNF-009 — Internacionalização
Interface em português brasileiro. Formato de datas: dd/MM/yyyy. Separador decimal: vírgula (PT-BR). Separador de milhar: ponto.

### RNF-010 — Integridade Referencial
Não permitir exclusão de produto que tenha estimativas associadas (soft delete). Fatores de ajuste historicizados com data de vigência.

---

## 7. MODELAGEM BACKEND (SPRING BOOT)

### 7.1 Estrutura de Pacotes

```
com.fastgondulas
├── config/
│   ├── SecurityConfig.java
│   ├── JpaConfig.java
│   └── CacheConfig.java
├── domain/
│   ├── produto/
│   │   ├── Produto.java              (entidade)
│   │   ├── Categoria.java            (enum)
│   │   ├── LinhaFria.java            (entidade)
│   │   └── NomenclaturaMapping.java  (entidade)
│   ├── estimativa/
│   │   ├── Estimativa.java
│   │   ├── EstimativaItem.java
│   │   ├── StatusMontagem.java       (enum)
│   │   └── Modal.java                (enum)
│   ├── pedido/
│   │   ├── OrdemCompra.java
│   │   ├── ItemPedido.java
│   │   └── StatusOC.java             (enum)
│   ├── cliente/
│   │   ├── Cliente.java
│   │   └── EnderecoEntrega.java
│   └── parametro/
│       ├── FatorAjuste.java
│       └── ParametroFrete.java
├── application/
│   ├── volumetria/
│   │   ├── VolumetriaService.java
│   │   ├── VolumetriaInputDTO.java
│   │   └── VolumetriaResultDTO.java
│   ├── frete/
│   │   ├── FreteService.java
│   │   └── FreteResultDTO.java
│   ├── produto/
│   │   └── ProdutoService.java
│   ├── pedido/
│   │   └── OrdemCompraService.java
│   └── importacao/
│       └── ImportacaoPDFService.java
├── infrastructure/
│   ├── persistence/
│   │   ├── ProdutoRepository.java
│   │   ├── EstimativaRepository.java
│   │   └── OrdemCompraRepository.java
│   └── pdf/
│       └── PDFExtractorAdapter.java
└── web/
    ├── produto/
    │   └── ProdutoController.java
    ├── estimativa/
    │   └── EstimativaController.java
    ├── frete/
    │   └── FreteController.java
    ├── pedido/
    │   └── OrdemCompraController.java
    └── parametro/
        └── ParametroController.java
```

### 7.2 Entidades Principais

```java
@Entity
@Table(name = "produto")
public class Produto {
    @Id @GeneratedValue
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String codigo;
    
    private String codigoLegado;
    private String descricao;
    
    @Enumerated(EnumType.STRING)
    private Categoria categoria;
    
    @Column(precision = 18, scale = 10)
    private BigDecimal qtdPorM3;
    
    @Column(precision = 18, scale = 10)
    private BigDecimal qtdPorM3Base;  // para montantes
    
    private Boolean isMontante = false;
    
    @Column(precision = 8, scale = 4)
    private BigDecimal comprimentoM;
    
    @Column(precision = 8, scale = 4)
    private BigDecimal larguraM;
    
    @Column(precision = 8, scale = 4)
    private BigDecimal alturaM;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal pesoBrutoKg;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal pesoLiquidoKg;
    
    private Boolean ativo = true;
    
    @CreationTimestamp
    private LocalDateTime criadoEm;
}

@Entity
@Table(name = "estimativa")
public class Estimativa {
    @Id @GeneratedValue
    private Long id;
    private String numeroOC;
    
    @ManyToOne
    private Cliente cliente;
    
    @Enumerated(EnumType.STRING)
    private StatusMontagem statusMontagem;
    
    @Column(precision = 12, scale = 4)
    private BigDecimal volumeTotalM3;
    
    @Column(precision = 10, scale = 4)
    private BigDecimal metrosCaminhao;
    
    @Column(precision = 10, scale = 4)
    private BigDecimal metrosContainer;
    
    @Column(precision = 10, scale = 4)
    private BigDecimal metrosCaminhaoNViA;
    
    @Column(precision = 10, scale = 4)
    private BigDecimal metrosCaminhaoVenda;
    
    @Column(precision = 10, scale = 4)
    private BigDecimal metrosContainerNViA;
    
    @Column(precision = 10, scale = 4)
    private BigDecimal metrosContainerVenda;
    
    private String criadoPor;
    
    @CreationTimestamp
    private LocalDateTime criadoEm;
    
    @OneToMany(mappedBy = "estimativa", cascade = CascadeType.ALL)
    private List<EstimativaItem> itens;
}
```

### 7.3 Design Patterns Recomendados

- **Strategy Pattern:** Para resolução do fator de montagem (MontadoStrategy vs DesmontadoStrategy)
- **Factory Pattern:** Para criação de calculadores de volume por categoria
- **Builder Pattern:** Para montagem dos DTOs de resultado (VolumetriaResultDTO)
- **Repository Pattern:** Spring Data JPA para todos os repositórios
- **Facade Pattern:** VolumetriaService encapsulando os sub-cálculos
- **Template Method:** Para cálculo de volume por modal (caminhão e container compartilham a mesma estrutura, diferenciando apenas a constante)

---

## 8. MODELAGEM FRONTEND (REACT)

### 8.1 Telas Necessárias

| Tela | Rota | Descrição |
|---|---|---|
| Dashboard | `/` | Visão geral: últimas estimativas, KPIs de volume |
| Nova Estimativa | `/estimativas/nova` | Formulário de entrada de itens + cálculo |
| Detalhe Estimativa | `/estimativas/:id` | Resultado com detalhamento por categoria |
| Histórico | `/estimativas` | Lista com filtros por cliente, data, OC |
| Produtos (Seca) | `/produtos/linha-seca` | CRUD de produtos LSG |
| Produtos (Fria) | `/produtos/linha-fria` | CRUD de produtos refrigerados |
| Catálogo Linha Fria | `/catalogo/nomenclatura` | Mapeamento nomenclaturas antigas/novas |
| Ordens de Compra | `/ordens-compra` | Lista e detalhe de OC |
| Nova OC | `/ordens-compra/nova` | Formulário de criação de OC |
| Parametrização | `/admin/parametros` | Fatores de ajuste e parâmetros de frete |
| Clientes | `/clientes` | CRUD de clientes |

### 8.2 Componentes Chave

```
components/
├── estimativa/
│   ├── FormularioEstimativa/         # Entrada de itens + qtds
│   ├── TabelaItens/                  # Grid editável com volume por item
│   ├── ResultadoVolumetria/          # Card com volume total e projeções
│   ├── ComparativoModal/             # Caminhão vs Container side by side
│   └── SeletorMontagem/             # Toggle MONTADOS / DESMONTADOS
├── produto/
│   ├── TabelaProdutos/
│   ├── FormularioProduto/
│   └── SeletorCategoria/
├── catalogo/
│   ├── TabelaNomenclaturas/
│   └── BadgeDocumentacao/           # ESTRUTURA / CONFIGURADOR / RENDER / CORTE
├── oc/
│   ├── FormularioOC/
│   ├── ListaItensOC/
│   └── StatusBadge/                 # APROVADO / PENDENTE / ENTREGUE
└── shared/
    ├── NumberInput/                 # Input com validação decimal/inteiro
    ├── ExportButton/               # Exportar para Excel/PDF
    └── AuditTrail/                 # Histórico de alterações
```

### 8.3 Fluxo Principal (Nova Estimativa)

```
1. Usuário acessa /estimativas/nova
2. Seleciona cliente (opcional) e número OC (opcional)
3. Seleciona status de montagem (MONTADOS / DESMONTADOS)
4. Adiciona itens:
   a. Busca produto por código ou nome
   b. Informa quantidade
   c. Sistema mostra Qtd/m³ e Volume calculado em tempo real
5. Pode adicionar "OUTROS" (texto livre, sem cálculo)
6. Clica em "Calcular Volumetria"
7. Sistema exibe:
   - Volume por categoria (bruto e ajustado)
   - Volume total
   - Metros de carroceria (caminhão e container)
   - Projeções +10% e +20%
8. Usuário pode exportar ou salvar
```

### 8.4 Estados Globais (Redux/Zustand)

```javascript
estimativaAtual: {
  itens: [{ codigo, descricao, quantidade, qtdPorM3, volume }],
  statusMontagem: 'MONTADOS' | 'DESMONTADOS',
  resultado: {
    volumeTotal, metrosCaminhao, metrosContainer, ...detalhePorCategoria
  },
  loading: boolean,
  errors: {}
}
```

---

## 9. MODELAGEM DE BANCO DE DADOS

### 9.1 Diagrama Relacional

```sql
-- CLIENTES
CREATE TABLE cliente (
    id BIGSERIAL PRIMARY KEY,
    razao_social VARCHAR(255) NOT NULL,
    cnpj VARCHAR(18) UNIQUE NOT NULL,
    contato_nome VARCHAR(100),
    contato_email VARCHAR(150),
    contato_fone VARCHAR(20),
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT NOW()
);

-- ENDEREÇOS DE ENTREGA
CREATE TABLE endereco_entrega (
    id BIGSERIAL PRIMARY KEY,
    cliente_id BIGINT REFERENCES cliente(id),
    descricao VARCHAR(100),
    logradouro VARCHAR(255),
    numero VARCHAR(20),
    complemento VARCHAR(100),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    uf CHAR(2),
    cep VARCHAR(9),
    responsavel_nome VARCHAR(100),
    responsavel_fone VARCHAR(20),
    horario_recebimento VARCHAR(100),
    observacoes TEXT,
    tem_empilhadeira BOOLEAN DEFAULT FALSE,
    principal BOOLEAN DEFAULT FALSE
);

-- PRODUTOS - LINHA SECA
CREATE TABLE produto (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    codigo_legado VARCHAR(50),
    descricao VARCHAR(255) NOT NULL,
    categoria VARCHAR(30) NOT NULL
        CHECK (categoria IN ('LSG','MOBILIAS','RACK_SLIM','CHECKOUTS','PORTA_PALLETS')),
    qtd_por_m3 NUMERIC(18,10),
    qtd_por_m3_base NUMERIC(18,10),
    is_montante BOOLEAN DEFAULT FALSE,
    comprimento_m NUMERIC(8,4),
    largura_m NUMERIC(8,4),
    altura_m NUMERIC(8,4),
    peso_bruto_kg NUMERIC(10,2),
    peso_liquido_kg NUMERIC(10,2),
    tem_configurador BOOLEAN DEFAULT FALSE,
    tem_render BOOLEAN DEFAULT FALSE,
    tem_corte BOOLEAN DEFAULT FALSE,
    tem_estrutura BOOLEAN DEFAULT FALSE,
    numero_estrutura INTEGER,
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT NOW(),
    atualizado_em TIMESTAMP DEFAULT NOW()
);

-- MAPEAMENTO NOMENCLATURA (Linha Fria)
CREATE TABLE nomenclatura_mapping (
    id BIGSERIAL PRIMARY KEY,
    codigo_antigo VARCHAR(100),
    descricao_antiga VARCHAR(255),
    codigo_novo_v1 VARCHAR(100),
    descricao_nova_v1 VARCHAR(255),
    codigo_novo_v2 VARCHAR(100),
    descricao_nova_v2 VARCHAR(255),
    familia VARCHAR(20),       -- Fast
    formato VARCHAR(20),       -- Curvo, Reto, Vertical, Ilha
    fechamento VARCHAR(30),    -- Aberto, Fechado, Porta, Dry Aged
    temperatura VARCHAR(10),   -- 0, -4, -6, -18, Quente, Seco
    comprimento_m NUMERIC(8,4),
    largura_m NUMERIC(8,4),
    altura_m NUMERIC(8,4),
    peso_bruto_kg NUMERIC(10,2),
    peso_liquido_kg NUMERIC(10,2),
    observacoes TEXT
);

-- FATORES DE AJUSTE (com histórico)
CREATE TABLE fator_ajuste (
    id BIGSERIAL PRIMARY KEY,
    categoria VARCHAR(30) NOT NULL,
    fator NUMERIC(6,4) NOT NULL,
    vigente_desde DATE NOT NULL,
    vigente_ate DATE,
    criado_por VARCHAR(100),
    criado_em TIMESTAMP DEFAULT NOW()
);

-- FATORES DE MONTAGEM
CREATE TABLE fator_montagem (
    id BIGSERIAL PRIMARY KEY,
    status VARCHAR(20) UNIQUE NOT NULL CHECK (status IN ('MONTADOS','DESMONTADOS')),
    fator NUMERIC(4,2) NOT NULL
);

INSERT INTO fator_montagem VALUES (1, 'MONTADOS', 1), (2, 'DESMONTADOS', 4);

-- PARÂMETROS DE FRETE (com histórico)
CREATE TABLE parametro_frete (
    id BIGSERIAL PRIMARY KEY,
    modal VARCHAR(20) NOT NULL CHECK (modal IN ('CAMINHAO','CONTAINER')),
    constante_secao NUMERIC(8,2) NOT NULL,
    fator_altura NUMERIC(8,2) NOT NULL DEFAULT 12,
    margem_nvia NUMERIC(6,4) DEFAULT 1.10,
    margem_venda NUMERIC(6,4) DEFAULT 1.20,
    vigente_desde DATE NOT NULL,
    vigente_ate DATE,
    criado_por VARCHAR(100),
    criado_em TIMESTAMP DEFAULT NOW()
);

INSERT INTO parametro_frete (modal, constante_secao, fator_altura, vigente_desde)
VALUES ('CAMINHAO', 60, 12, '2024-01-01'),
       ('CONTAINER', 45, 12, '2024-01-01');

-- ORDENS DE COMPRA
CREATE TABLE ordem_compra (
    id BIGSERIAL PRIMARY KEY,
    numero VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDENTE'
        CHECK (status IN ('PENDENTE','APROVADO','ENTREGUE','CANCELADO')),
    emissao DATE NOT NULL,
    entrega_prevista DATE,
    comprador_nome VARCHAR(100),
    centro_custo VARCHAR(50),
    condicao_pagamento VARCHAR(50),
    cliente_id BIGINT REFERENCES cliente(id),
    endereco_entrega_id BIGINT REFERENCES endereco_entrega(id),
    agendamento_obrigatorio BOOLEAN DEFAULT TRUE,
    prazo_agendamento_horas INTEGER DEFAULT 48,
    observacoes TEXT,
    criado_em TIMESTAMP DEFAULT NOW()
);

-- ITENS DA ORDEM DE COMPRA
CREATE TABLE item_ordem_compra (
    id BIGSERIAL PRIMARY KEY,
    ordem_compra_id BIGINT REFERENCES ordem_compra(id),
    numero_item INTEGER NOT NULL,
    produto_codigo VARCHAR(50) NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    quantidade INTEGER NOT NULL CHECK (quantidade > 0),
    unidade VARCHAR(10) DEFAULT 'PC'
);

-- ESTIMATIVAS
CREATE TABLE estimativa (
    id BIGSERIAL PRIMARY KEY,
    numero_oc VARCHAR(50),
    cliente_id BIGINT REFERENCES cliente(id),
    ordem_compra_id BIGINT REFERENCES ordem_compra(id),
    status_montagem VARCHAR(20) NOT NULL,
    volume_lsg_bruto NUMERIC(12,6),
    volume_lsg_ajustado NUMERIC(12,6),
    volume_mobilias_bruto NUMERIC(12,6),
    volume_mobilias_ajustado NUMERIC(12,6),
    volume_rack_bruto NUMERIC(12,6),
    volume_rack_ajustado NUMERIC(12,6),
    volume_checkouts_bruto NUMERIC(12,6),
    volume_checkouts_ajustado NUMERIC(12,6),
    volume_porta_pallets_bruto NUMERIC(12,6),
    volume_porta_pallets_ajustado NUMERIC(12,6),
    volume_total_m3 NUMERIC(12,4),
    mts_caminhao NUMERIC(10,4),
    mts_container NUMERIC(10,4),
    mts_caminhao_nvia NUMERIC(10,4),
    mts_caminhao_venda NUMERIC(10,4),
    mts_container_nvia NUMERIC(10,4),
    mts_container_venda NUMERIC(10,4),
    criado_por VARCHAR(100),
    criado_em TIMESTAMP DEFAULT NOW()
);

-- ITENS DA ESTIMATIVA
CREATE TABLE estimativa_item (
    id BIGSERIAL PRIMARY KEY,
    estimativa_id BIGINT REFERENCES estimativa(id) ON DELETE CASCADE,
    produto_id BIGINT REFERENCES produto(id),
    produto_codigo VARCHAR(50) NOT NULL,
    produto_descricao VARCHAR(255),
    categoria VARCHAR(30),
    quantidade INTEGER NOT NULL,
    qtd_por_m3_utilizado NUMERIC(18,10),
    volume_m3 NUMERIC(12,6)
);

-- ÍNDICES
CREATE INDEX idx_produto_codigo ON produto(codigo);
CREATE INDEX idx_produto_categoria ON produto(categoria);
CREATE INDEX idx_produto_ativo ON produto(ativo);
CREATE INDEX idx_estimativa_cliente ON estimativa(cliente_id);
CREATE INDEX idx_estimativa_oc ON estimativa(ordem_compra_id);
CREATE INDEX idx_estimativa_criado_em ON estimativa(criado_em DESC);
CREATE INDEX idx_item_estimativa ON estimativa_item(estimativa_id);
CREATE INDEX idx_item_oc ON item_ordem_compra(ordem_compra_id);
CREATE INDEX idx_nomenclatura_codigo_antigo ON nomenclatura_mapping(codigo_antigo);
CREATE INDEX idx_nomenclatura_codigo_novo ON nomenclatura_mapping(codigo_novo_v2);
CREATE INDEX idx_fator_categoria ON fator_ajuste(categoria, vigente_desde);
```

---

## 10. RISCOS E DÚVIDAS

### R-001 — Referência vazia em L39 (Porta Pallets)
A fórmula `=L38 * '[1]Fatores de Ajuste'!$B$6` referencia a célula B6 da aba "Fatores de Ajuste", que está **vazia**. Isso significa que o volume de PORTA PALLETS está sendo multiplicado por 0 ou gerando erro silencioso. **Ação requerida:** Confirmar com a empresa qual é o fator de ajuste para Porta Pallets (sugestão: 1.0 como padrão, ou o mesmo 1.2 do Rack Slim).

### R-002 — Peso líquido indefinido nos produtos VPC-18
Os produtos XICFD 2100 e XICFD 2500 têm peso líquido marcado como `???`. O sistema deve tratar este campo como opcional para esses SKUs, mas alertar no cadastro.

### R-003 — Qtd/m³ variável do PICKBOX GRANDE
Nos pedidos de validação, o PICKBOX GRANDE tem Qtd/m³ = 10 em um pedido e 5 em outros dois. Pode haver versões diferentes do produto (PICKBOX GRANDE vs CESTO) ou o valor é ajustável por pedido. **Ação:** Confirmar se há SKUs distintos ou se o campo é editável por estimativa.

### R-004 — PAINEL MF sem Qtd/m³ em alguns pedidos
O produto PAINEL MF (Qtd/m³ padrão = 500) aparece sem Qtd/m³ no pedido de validação 5307224-3, resultando em volume = 0 para 1850 unidades. Isso pode ser um erro de preenchimento ou o produto foi comercializado sem cálculo de frete (ex.: cliente buscou). **Ação:** Validar com a operação se é aceitável ter volume zero para produto com quantidade > 0.

### R-005 — Constantes de Checkout com alta precisão
Os valores de Qtd/m³ dos checkouts (ex.: 0.5254988913525499) são muito precisos para serem inseridos manualmente. Eles foram calculados por alguma fórmula não exposta (provavelmente C × L × A ÷ volume de referência). O sistema deve manter essa precisão e, idealmente, recalcular automaticamente a partir das dimensões físicas quando essas estiverem cadastradas.

### R-006 — Coluna PRATELEIRAS 400MM ausente na Estimativa
A aba Validações contém o produto "PRATELEIRAS 400MM" (Qtd/m³=70) que não existe na aba Estimativa principal. Sugere que a lista de produtos é dinâmica e não fixa. O sistema deve tratá-la como catálogo extensível.

### R-007 — Cálculo de metros de carroceria: interpretação das constantes 60 e 45
As constantes 60 e 45 parecem representar a capacidade volumétrica de referência de cada modal (m³), não dimensões diretas. Precisam ser validadas com a equipe logística. Se 1 caminhão = 60 m³ e a carroceria tem 12m de comprimento, então a seção transversal é 5 m². Se 1 container = 45 m³ com o mesmo comprimento referência de 12m, a seção seria 3.75 m². Esses valores precisam ser confirmados.

### R-008 — Linha nova v1 vs v2 sem critério claro de vigência
O arquivo 07 apresenta duas propostas de nomenclatura nova sem indicar qual é a vigente atual. A aba "PROPOSTA NOVA NUMENCLATURA 2" (com código F01 CA-4 1,00) parece ser mais recente. O sistema deve registrar todas as versões históricas e indicar a versão ativa.

### R-009 — CONJUNTO FUNDO tem Qtd/m³ = 120/5 = 24
A fórmula `=120/5` para o CONJUNTO FUNDO sugere que ele é composto de 5 partes e segue a mesma densidade do PAINEL COMUM (120/m³). É uma relação de componentes. O sistema deve suportar regras derivadas de Qtd/m³.

### R-010 — Ausência de preços na planilha de estimativa
A planilha de estimativa não inclui preços unitários nem valores monetários de frete. O sistema completo precisará de uma camada de precificação não capturada nos arquivos atuais.

---

## 11. RESULTADO FINAL

### 11.1 Resumo Técnico

A Fast Gôndulas opera um fluxo de **estimativa logística** baseado em dois arquivos Excel que funcionam como ferramentas manuais de cálculo. O sistema atual tem as seguintes características:

- **Linha Seca:** 14 SKUs principais + "OUTROS" (campo livre). Cálculo por densidade de empilhamento (Qtd/m³). 5 categorias com fatores distintos. Fator dinâmico para montantes.
- **Linha Fria:** ~60+ SKUs com nomenclatura em migração. Cálculo por dimensões físicas. Catálogo dimensional completo.
- **Logística:** Cálculo de metros de carroceria para 2 modais. Margens de 10% e 20% para negociação e venda.
- **Ordens de Compra:** Estruturadas com 22 tipos de itens, regras de entrega rígidas, agendamento obrigatório, condições de pagamento (28 DDL).

### 11.2 Arquitetura Sugerida

```
┌─────────────────────────────────────────────────────────────────┐
│                     FAST GÔNDULAS ERP                          │
├──────────────┬──────────────────────────────────────────────────┤
│   FRONTEND   │              React + TypeScript                  │
│   (React)    │  Vite | React Router | Zustand | Tailwind CSS   │
│              │  React Hook Form | React Query | Recharts        │
├──────────────┼──────────────────────────────────────────────────┤
│     API      │           Java 17 + Spring Boot 3.x              │
│  (REST/JSON) │  Spring Security | Spring Data JPA | Lombok      │
│              │  MapStruct | Validation | OpenAPI/Swagger        │
├──────────────┼──────────────────────────────────────────────────┤
│    BANCO     │              PostgreSQL 15+                       │
│              │  Flyway (migrations) | HikariCP (pool)           │
├──────────────┼──────────────────────────────────────────────────┤
│  INFRA       │  Docker + Docker Compose | Nginx (reverse proxy) │
│              │  GitHub Actions (CI/CD) | MinIO (arquivos PDF)   │
└──────────────┴──────────────────────────────────────────────────┘
```

### 11.3 Endpoints REST Recomendados

```
// PRODUTOS
GET    /api/v1/produtos                          # listar (filtros: categoria, ativo, q)
POST   /api/v1/produtos                          # criar
GET    /api/v1/produtos/{codigo}                 # detalhar
PUT    /api/v1/produtos/{id}                     # atualizar
DELETE /api/v1/produtos/{id}                     # soft delete

// LINHA FRIA - CATÁLOGO
GET    /api/v1/produtos/linha-fria               # listar com dimensões
GET    /api/v1/produtos/nomenclaturas            # mapeamento antigo/novo
POST   /api/v1/produtos/nomenclaturas            # criar mapeamento

// ESTIMATIVAS
POST   /api/v1/estimativas/calcular              # calcular sem salvar (preview)
POST   /api/v1/estimativas                       # criar e salvar
GET    /api/v1/estimativas                       # listar histórico
GET    /api/v1/estimativas/{id}                  # detalhar
GET    /api/v1/estimativas/{id}/exportar/excel   # download Excel
GET    /api/v1/estimativas/{id}/exportar/pdf     # download PDF

// FRETE
POST   /api/v1/frete/calcular                    # calcular metros de carroceria

// ORDENS DE COMPRA
GET    /api/v1/ordens-compra                     # listar
POST   /api/v1/ordens-compra                     # criar
GET    /api/v1/ordens-compra/{id}                # detalhar
PUT    /api/v1/ordens-compra/{id}/status         # atualizar status
POST   /api/v1/ordens-compra/importar-pdf        # importar OC de PDF

// CLIENTES
GET    /api/v1/clientes
POST   /api/v1/clientes
GET    /api/v1/clientes/{id}
PUT    /api/v1/clientes/{id}

// PARAMETRIZAÇÃO
GET    /api/v1/parametros/fatores-ajuste         # listar fatores vigentes
PUT    /api/v1/parametros/fatores-ajuste         # atualizar fator
GET    /api/v1/parametros/frete                  # listar parâmetros de frete
PUT    /api/v1/parametros/frete                  # atualizar parâmetros

// AUTH
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout
```

### 11.4 Prioridades de Implementação

**Sprint 1 — MVP Core (Volumetria):**
1. Banco de dados + migrations Flyway
2. CRUD de Produtos (linha seca com Qtd/m³)
3. Motor de cálculo de Volumetria (VolumetriaService completo)
4. API REST de estimativas (calcular + salvar + listar)
5. Frontend: Tela Nova Estimativa com cálculo em tempo real

**Sprint 2 — Ordens de Compra:**
6. CRUD de Clientes + Endereços
7. CRUD de Ordens de Compra
8. Vinculação OC → Estimativa
9. Frontend: Telas de OC e Clientes

**Sprint 3 — Linha Fria:**
10. Catálogo de produtos linha fria (dimensões + pesos)
11. Mapeamento de nomenclaturas
12. Cálculo de volume por dimensões físicas
13. Frontend: Catálogo linha fria

**Sprint 4 — Exportação e Relatórios:**
14. Exportação de estimativa para Excel (replicando layout original)
15. Exportação para PDF
16. Dashboard com KPIs
17. Importação de OC via PDF

**Sprint 5 — Parametrização e Admin:**
18. Tela de parametrização (fatores, constantes de frete)
19. Auditoria e logs
20. Gestão de usuários e perfis
21. Histórico de alterações em parâmetros

**Sprint 6 — Otimização:**
22. Cache de produtos (Qtd/m³ raramente muda)
23. Testes de carga
24. Otimização de queries
25. Documentação OpenAPI completa

---

*Documento gerado a partir da engenharia reversa completa dos arquivos:*  
*- 08_ESTIMATIVA_LINHA_SECA_20250616.xlsx*  
*- 07_ESTIMATIVA_SK_E_RFG.xlsx*  
*- OC-2025-00847 (PDF_FAST.pdf)*