# Prompt mestre para gerar SQL PostgreSQL do sistema logístico

Quero que você atue como um **Arquiteto de Software Sênior + DBA PostgreSQL + Engenheiro de Backend Java/Spring Boot + Especialista em Logística e Volumetria**.

Seu objetivo é gerar um **SQL PostgreSQL completo**, em português, pronto para uso como base inicial de banco de dados de um sistema que:

- importa dados de planilhas Excel
- cadastra produtos e catálogos
- calcula volumetria
- calcula peso
- calcula metros de carroceria
- recomenda veículos
- calcula frete
- consolida proposta logística/comercial

Importante:

- o SQL deve estar **100% em português nos nomes descritivos, comentários e explicações**
- o banco precisa conseguir receber e armazenar **tudo o que existe nos dois Excels analisados**
- o banco deve facilitar os cálculos do backend, não dificultar
- não quero um SQL genérico
- não quero um CRUD raso
- quero um banco relacional pensado para **volumetria, logística, frete e proposta**
- o foco logístico atual é **somente rodoviário**
- a parte de carroceria deve considerar apenas:
  - **caminhão truque**
  - **carreta normal**
  - **carreta extendida**
- **não incluir container**

---

## 1. Contexto do negócio

O sistema é para uma empresa que trabalha com estruturas comerciais, gôndolas, porta pallets, checkouts, mobílias e equipamentos refrigerados.

O fluxo resumido do negócio é:

1. o comercial/projetista gera arquivos
2. esses arquivos chegam em PDF e Excel
3. o sistema extrai e normaliza os itens
4. o backend calcula cubagem e peso
5. o backend calcula necessidade logística
6. o backend recomenda veículos
7. o backend calcula frete e compõe a proposta final

O banco precisa ser preparado para:

- armazenar catálogos de produtos
- armazenar itens importados brutos
- armazenar itens normalizados
- armazenar fatores e parâmetros logísticos
- armazenar simulações de volumetria/frete
- armazenar tipos de carroceria
- armazenar regras de elegibilidade logística
- armazenar propostas e versões

---

## 2. Fontes que o SQL precisa contemplar

O modelo deve atender aos dois Excels abaixo.

### Excel 08 — Estimativa Linha Seca

Este Excel trabalha com **linha seca** e usa lógica baseada em **Qtd/m³**.

Abas relevantes:

- `Estimativa`
- `Fatores de Ajuste`
- `Validações`

#### Estrutura funcional da aba `Estimativa`

A planilha possui blocos por categoria:

- Gôndolas / LSG
- Mobílias
- Rack Slim
- Checkouts
- Porta Pallets

Cada item da linha seca pode ter:

- categoria
- nome do item
- quantidade
- `qtd_por_m3`
- volume calculado

Saídas logísticas identificadas:

- `volume_total_m3`
- `mts_caminhao`
- `mts_caminhao_nvia`
- `mts_caminhao_venda`

#### Fatores de ajuste identificados

Categorias com fator logístico:

- LSG = `1.4`
- MOBÍLIAS = `1.2`
- RACK SLIM = `1.2`
- CHECKOUTS = `1.0`

Fator de montagem:

- `MONTADOS` = `1`
- `DESMONTADOS` = `4`

Regra crítica:

Para montantes de porta pallets, o `qtd_por_m3` efetivo depende do status de montagem.

#### Regras importantes da linha seca

- o volume por item é calculado por `quantidade / qtd_por_m3`
- o volume ajustado por categoria usa fator de ajuste
- o volume total é a soma dos volumes ajustados das categorias
- há itens com `qtd_por_m3` muito preciso, então precisa de alta precisão decimal
- há produtos que podem aparecer em validações e não na aba principal, então o catálogo precisa ser extensível
- pode existir `qtd_por_m3` ajustável por estimativa/pedido
- produtos sem `qtd_por_m3` podem resultar em volume zero, então isso precisa ser tratável e auditável

### Excel 07 — Estimativa SK e RFG

Este Excel trabalha com **linha fria/refrigerada** e usa lógica baseada em **dimensões físicas**.

Abas relevantes:

- `NOMENCLATURA ATUAL`
- `PROPOSTA NOVA NUMENCLATURA 1`
- `PROPOSTA NOVA NUMENCLATURA 2`

#### Estrutura funcional da aba `NOMENCLATURA ATUAL`

Cada item pode ter:

- código antigo
- descrição antiga
- código novo
- descrição nova
- estrutura
- configurador
- render
- corte
- observações

#### Estrutura funcional da aba `PROPOSTA NOVA NUMENCLATURA 2`

Cada produto da linha fria pode ter:

- código antigo
- código atual
- descrição
- comprimento em metros
- largura em metros
- altura em metros
- peso bruto em kg
- peso líquido em kg

#### Regras importantes da linha fria

- o volume unitário é `comprimento * largura * altura`
- o volume do item é `volume_unitario * quantidade`
- a linha fria exige armazenar dimensões e pesos
- o peso líquido pode ser ausente em alguns casos
- o sistema precisa manter o mapeamento entre nomenclatura antiga e nova
- o sistema precisa suportar versões de nomenclatura

---

## 3. Regras de negócio que o banco deve suportar

O banco deve atender aos dois paradigmas:

### Linha seca

```text
volume_item = quantidade / qtd_por_m3
volume_bruto_categoria = soma(volume_item)
volume_ajustado_categoria = volume_bruto_categoria * fator_categoria
volume_total = soma(volume_ajustado_categoria)
```

### Linha fria

```text
volume_unitario = comprimento * largura * altura
volume_item = volume_unitario * quantidade
```

### Integração dos dois mundos

Uma estimativa completa pode combinar:

- itens da linha seca
- itens da linha fria

Então o banco deve permitir:

- armazenar os dois tipos de produto
- identificar qual regra de volumetria se aplica
- salvar os insumos usados no cálculo
- salvar os resultados calculados

### Frete e carroceria

No cenário atual, o sistema trabalha com metros de carroceria do transporte rodoviário.

Regra já identificada:

```text
mts_caminhao = volume_total_m3 * 12 / 60
mts_caminhao_nvia = mts_caminhao * 1.10
mts_caminhao_venda = mts_caminhao * 1.20
```

Mesmo usando a fórmula acima como referência comercial, o banco precisa ser preparado para suportar **tipos reais de veículo/carroceria**.

---

## 4. Escopo de carroceria obrigatório no banco

O banco deve modelar somente:

### Caminhão truque

Características mínimas:

- capacidade aproximada entre `35 m³` e `40 m³`
- mais adequado para área urbana
- mais adequado para locais com pouca manobra
- pode ter custo por km próprio
- pode ter restrições regionais
- pode ter restrição de altura
- pode ter limite de peso diferente

### Carreta normal

Características mínimas:

- capacidade aproximada entre `55 m³` e `60 m³`
- comprimento operacional de referência `12,3 m`
- maior capacidade que truque
- maior restrição urbana
- maior necessidade de doca e manobra
- pedágio possivelmente maior

### Carreta extendida

Características mínimas:

- comprimento operacional de referência `14 m`
- capacidade maior que a carreta normal
- custo operacional potencialmente maior
- pedágio potencialmente maior
- maior restrição de acesso

### Regras logísticas mínimas que o banco deve suportar

O banco deve permitir registrar:

- se o destino aceita carreta
- se o destino tem restrição de doca
- se o destino tem restrição de manobra
- se a região tem restrição urbana
- se a transportadora possui restrição por tipo de veículo
- limite de peso por veículo
- capacidade volumétrica nominal
- capacidade volumétrica operacional
- custo por km
- pedágio por eixo
- quantidade de eixos

---

## 5. O que o SQL precisa entregar

Quero um SQL PostgreSQL completo contendo:

1. `CREATE TABLE`
2. `PRIMARY KEY`
3. `FOREIGN KEY`
4. `UNIQUE`
5. `CHECK`
6. índices
7. colunas de auditoria
8. colunas de vigência quando fizer sentido
9. `INSERTS` iniciais mínimos para parâmetros essenciais

O SQL deve ser pensado para uso com:

- PostgreSQL
- Flyway
- backend Java 17 + Spring Boot 3

---

## 6. Modelagem mínima obrigatória

O SQL deve contemplar, no mínimo, as seguintes entidades/tabelas.

### Documentos e importação

- `documento_importado`
- `documento_importado_arquivo`
- `lote_importacao`
- `item_importado_bruto`

Essas tabelas devem permitir rastrear:

- nome do arquivo
- tipo do arquivo
- hash
- data de importação
- usuário
- origem do documento
- status de processamento
- erros de parsing

### Catálogo de produtos

- `produto`
- `produto_categoria`
- `produto_sinonimo`
- `produto_dimensao`
- `produto_peso`

O catálogo precisa suportar:

- linha seca
- linha fria
- código atual
- código legado
- descrição
- categoria
- `qtd_por_m3`
- `qtd_por_m3_base`
- indicador de montante
- dimensões
- peso bruto
- peso líquido
- ativo/inativo

### Nomenclatura e versão de catálogo da linha fria

- `nomenclatura_mapping`
- eventualmente tabela auxiliar para `versao_nomenclatura`

Precisa suportar:

- código antigo
- descrição antiga
- código novo
- descrição nova
- flags:
  - estrutura
  - configurador
  - render
  - corte
- observações
- versão vigente

### Parâmetros de volumetria

- `fator_ajuste`
- `fator_montagem`

Precisa suportar:

- categoria
- fator
- vigência
- responsável pela criação

### Estimativas e cálculo

- `estimativa`
- `estimativa_item`
- opcionalmente `estimativa_item_calculo`

Precisa suportar:

- cliente
- ordem de compra
- status de montagem
- volumes brutos por categoria
- volumes ajustados por categoria
- volume total
- metros de carroceria
- margem nvia
- margem venda
- dados da simulação
- usuário que calculou
- data/hora

### Ordens de compra e proposta

- `cliente`
- `endereco_entrega`
- `ordem_compra`
- `item_ordem_compra`
- `proposta`
- `proposta_versao`
- `proposta_item`

### Veículos, carrocerias e restrições

- `veiculo_tipo`
- `veiculo_capacidade`
- `veiculo_regra_operacional`
- `transportadora`
- `transportadora_regiao`
- `restricao_regiao`
- `restricao_destino`
- `simulacao_logistica`
- `simulacao_veiculo`

Essas tabelas devem suportar:

- tipo de veículo
- tipo de carroceria
- truque / carreta normal / carreta extendida
- comprimento
- largura
- altura
- capacidade_m3 nominal
- capacidade_m3 operacional
- peso máximo nominal
- peso máximo operacional
- quantidade de eixos
- custo por km
- pedágio por eixo
- permite área urbana
- permite carga fracionada
- restrição de altura
- exige doca
- ativo

### Frete

- `parametro_frete`
- `tabela_frete`
- `faixa_frete`
- `custo_logistico`

O SQL deve deixar claro que:

- o frete é rodoviário
- não existe container no escopo atual
- a regra de frete deve ser compatível com truque e carreta

### Auditoria

- `auditoria_evento`

Precisa registrar:

- entidade
- id da entidade
- ação
- antes
- depois
- usuário
- data/hora

---

## 7. Regras de modelagem obrigatórias

### Precisão numérica

Usar `NUMERIC`, nunca `FLOAT` ou `DOUBLE`.

Regras mínimas:

- `qtd_por_m3`: alta precisão, por exemplo `NUMERIC(18,10)` ou maior
- dimensões: pelo menos `NUMERIC(10,4)`
- pesos: pelo menos `NUMERIC(12,3)` ou equivalente
- custos: precisão monetária adequada
- percentuais: precisão suficiente para margem e fator

### Restrições e consistência

Adicionar `CHECK` para:

- quantidade > 0
- fatores > 0
- dimensões > 0 quando preenchidas
- peso >= 0
- capacidade_m3 > 0
- eixos > 0
- tipos enumeráveis coerentes

### Histórico e vigência

Onde fizer sentido, usar:

- `vigente_desde`
- `vigente_ate`
- `ativo`

### Auditoria padrão

Sempre que fizer sentido, incluir:

- `criado_em`
- `atualizado_em`
- `criado_por`
- `atualizado_por`

---

## 8. Decisões obrigatórias que o SQL deve refletir

O SQL precisa refletir estas decisões:

1. **um único banco relacional**
2. **sem separar banco documental e banco logístico**
3. **sem modelagem duplicada**
4. **preparado para receber linha seca e linha fria**
5. **preparado para cálculos no backend**
6. **preparado para histórico e auditoria**
7. **preparado para evolução de regras**
8. **preparado para múltiplas transportadoras**
9. **foco atual em truque e carreta**
10. **não incluir container**

---

## 9. Riscos reais que o SQL precisa acomodar

O desenho do banco deve prever:

- produto sem `qtd_por_m3`
- produto com `qtd_por_m3` muito preciso
- produto com peso líquido ausente
- item com nomenclatura antiga e nova
- item importado que ainda não foi normalizado
- item com conflito entre Excel e cadastro
- regra logística que muda ao longo do tempo
- destino que não aceita carreta
- região com restrição urbana
- carreta inviável por doca/manobra
- necessidade de recalcular proposta sem perder histórico
- necessidade de guardar snapshot dos valores usados no cálculo

---

## 10. Saída esperada da IA

A resposta da IA deve vir em **português** e conter:

1. breve explicação arquitetural do banco
2. SQL PostgreSQL completo
3. tabelas em ordem correta de dependência
4. `CREATE INDEX`
5. `INSERTS` iniciais mínimos
6. comentários SQL explicando as decisões críticas

O SQL deve ser suficientemente bom para virar base de um arquivo como:

- `V1__baseline.sql`

---

## 11. Restrições finais

- não usar nomes vagos demais
- não usar modelagem rasa
- não tratar volumetria como detalhe secundário
- não ignorar a diferença entre linha seca e linha fria
- não ignorar nomenclatura antiga vs nova
- não ignorar fatores de ajuste
- não ignorar fator de montagem
- não ignorar cálculo de metros de carroceria
- não ignorar truque vs carreta
- não ignorar restrição de doca, manobra, acesso urbano e região
- não incluir container

---

## 12. Pedido final

Com base em tudo acima, gere um **SQL PostgreSQL completo e coerente**, preparado para backend Spring Boot, capaz de armazenar os dados dos dois Excels, sustentar os cálculos de volumetria e frete, e suportar a recomendação logística com foco em:

- caminhão truque
- carreta normal
- carreta extendida

Entregue um resultado **muito técnico, implementável, consistente e pronto para migração inicial**.
