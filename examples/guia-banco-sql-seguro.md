# Guia prático para modelar o banco de dados SQL com segurança, rastreabilidade e automações

Este documento serve como guia de arquitetura para você criar um **script SQL forte**, preparado para:

- receber dados dos arquivos analisados
- sustentar os cálculos do backend
- manter histórico e auditoria
- suportar importação documental
- suportar volumetria e frete
- suportar recomendação logística
- manter segurança real no banco

Escopo considerado:

- **linha seca**
- **linha fria**
- **ordens de compra**
- **estimativas**
- **propostas**
- **frete rodoviário**
- **carroceria apenas com caminhão truque, carreta normal e carreta extendida**

Escopo explicitamente fora neste momento:

- frontend
- container
- modal marítimo
- modelagem intermodal

---

## 1. Objetivo do banco

O banco não deve ser pensado como um CRUD simples.
Ele precisa ser a base transacional do domínio logístico e comercial, permitindo:

1. importar documentos e rastrear origem
2. armazenar itens brutos e itens normalizados
3. manter catálogo de produtos da linha seca e da linha fria
4. sustentar cálculo de volumetria
5. sustentar cálculo de peso
6. sustentar cálculo de metros de carroceria
7. sustentar recomendação logística por tipo de veículo
8. sustentar frete, pedágio e proposta consolidada
9. preservar histórico de parâmetros e decisões

Se o banco nascer só como tabela de produto + pedido + cálculo final, ele vai quebrar rápido.

---

## 2. Estratégia correta de modelagem

A estratégia mais segura aqui é:

### 2.1 Um banco único, relacional e modular

Use **um único PostgreSQL**, mas organize o domínio por áreas claras:

- importação documental
- catálogo
- nomenclatura
- volumetria
- logística
- frete
- proposta
- auditoria

Isso evita:

- duplicação de dados
- conflito entre bases
- perda de rastreabilidade
- cálculo inconsistente

### 2.2 Separar entrada bruta de dado normalizado

Nunca grave diretamente o resultado final sobre os dados extraídos.

Mantenha camadas separadas:

1. **dado bruto importado**
2. **dado normalizado**
3. **dado calculado**
4. **snapshot da proposta/simulação**

Isso é obrigatório para:

- reprocessamento
- auditoria
- troubleshooting
- comparação entre importações
- correção de regra sem perder histórico

### 2.3 Persistir o que foi usado no cálculo

Não guarde só o resultado final.
Guarde também:

- fator usado
- `qtd_por_m3` usado
- status de montagem usado
- dimensões usadas
- peso usado
- parâmetros de frete usados
- veículo escolhido
- motivo de descarte de veículo

Sem isso, depois ninguém consegue reproduzir conta.

---

## 3. Estrutura macro recomendada

Se quiser fazer um SQL forte, organize o script por blocos nesta ordem:

1. extensões
2. schemas
3. roles
4. tabelas de domínio base
5. tabelas de relacionamento
6. tabelas de parâmetros
7. tabelas de cálculo/simulação
8. tabelas de auditoria
9. funções utilitárias
10. triggers
11. índices
12. dados seed mínimos
13. grants

Essa ordem evita erro de dependência e deixa o script limpo.

---

## 4. Schemas recomendados

Se quiser mais organização e segurança, use schemas separados:

- `core` -> cliente, endereços, usuários, transportadoras
- `documental` -> documentos importados, arquivos, itens brutos
- `catalogo` -> produtos, dimensões, pesos, nomenclaturas
- `logistica` -> estimativas, itens calculados, veículos, restrições, frete
- `auditoria` -> eventos, trilhas, histórico

Se não quiser começar com vários schemas, ainda assim mantenha nomes bem organizados.
Mas tecnicamente, usar schemas ajuda muito.

---

## 5. Tabelas obrigatórias por domínio

### 5.1 Importação documental

Você precisa de tabelas como:

- `documental.documento_importado`
- `documental.documento_importado_arquivo`
- `documental.lote_importacao`
- `documental.item_importado_bruto`

Essas tabelas devem guardar:

- nome original do arquivo
- tipo do arquivo
- hash SHA-256
- tamanho
- origem
- usuário importador
- data de importação
- status de processamento
- mensagem de erro
- conteúdo bruto extraído quando necessário
- número da linha/posição do item no documento
- confiança da extração, se existir

### 5.2 Catálogo de produtos

Você precisa de tabelas como:

- `catalogo.produto`
- `catalogo.produto_categoria`
- `catalogo.produto_dimensao`
- `catalogo.produto_peso`
- `catalogo.produto_sinonimo`
- `catalogo.nomenclatura_mapping`

O catálogo deve suportar:

- linha seca
- linha fria
- código atual
- código legado
- descrição
- categoria
- `qtd_por_m3`
- `qtd_por_m3_base`
- indicador de montante
- dimensões físicas
- peso bruto
- peso líquido
- flags de documentação
- vigência
- ativo/inativo

### 5.3 Parâmetros de volumetria

Você precisa de:

- `logistica.fator_ajuste`
- `logistica.fator_montagem`

Essas tabelas devem ter:

- categoria
- fator
- vigência
- ativo
- quem criou
- quando criou

### 5.4 Ordens de compra e proposta

Você precisa de:

- `core.cliente`
- `core.endereco_entrega`
- `core.ordem_compra`
- `core.item_ordem_compra`
- `logistica.proposta`
- `logistica.proposta_versao`
- `logistica.proposta_item`

### 5.5 Estimativas e cálculos

Você precisa de:

- `logistica.estimativa`
- `logistica.estimativa_item`
- `logistica.estimativa_item_calculo`
- `logistica.simulacao_logistica`
- `logistica.simulacao_veiculo`

Aqui deve existir:

- volume bruto por categoria
- volume ajustado por categoria
- volume total
- peso total
- metros de carroceria
- margem NViA
- margem venda
- status de montagem
- parâmetros usados
- operador responsável

### 5.6 Veículos e carroceria

Você precisa de:

- `logistica.veiculo_tipo`
- `logistica.veiculo_capacidade`
- `logistica.veiculo_regra_operacional`
- `logistica.restricao_regiao`
- `logistica.restricao_destino`
- `core.transportadora`
- `core.transportadora_regiao`

O banco deve modelar apenas:

- caminhão truque
- carreta normal
- carreta extendida

Campos importantes:

- nome
- tipo_carroceria
- categoria
- comprimento
- largura
- altura
- comprimento interno
- largura interna
- altura interna
- capacidade volumétrica nominal
- capacidade volumétrica operacional
- peso máximo nominal
- peso máximo operacional
- eixos
- custo por km
- pedágio por eixo
- permite área urbana
- permite carga fracionada
- exige doca
- restrição de altura
- ativo

### 5.7 Frete

Você precisa de:

- `logistica.parametro_frete`
- `logistica.tabela_frete`
- `logistica.faixa_frete`
- `logistica.custo_logistico`

Não trate frete como uma conta solta em runtime.
Ele precisa ser persistível, auditável e reprocessável.

### 5.8 Auditoria

Você precisa de:

- `auditoria.evento_auditoria`

Idealmente com:

- schema/tabela afetada
- id do registro
- operação
- estado anterior em JSONB
- estado novo em JSONB
- usuário
- origem da ação
- data/hora

---

## 6. Como lidar com os dois Excels corretamente

### 6.1 Linha seca

A linha seca não depende de dimensão física principal.
Ela depende de:

- quantidade
- `qtd_por_m3`
- fator de ajuste por categoria
- fator de montagem para montantes

Então o banco precisa deixar explícito:

- qual `qtd_por_m3` veio do catálogo
- qual `qtd_por_m3` foi sobrescrito na estimativa
- se o item era montante
- se o status de montagem era `MONTADOS` ou `DESMONTADOS`
- qual fator de ajuste foi aplicado

### 6.2 Linha fria

A linha fria depende de:

- comprimento
- largura
- altura
- peso bruto
- peso líquido
- mapeamento de nomenclatura

Então o banco precisa ter:

- produto
- dimensão
- peso
- versão de nomenclatura
- vínculo entre código antigo e novo

### 6.3 Regra certa de cálculo

O backend deve decidir a regra, mas o banco precisa viabilizar isso.

Sugestão:

- coluna `metodo_volumetria`
- valores possíveis:
  - `QTD_POR_M3`
  - `DIMENSAO_FISICA`

Assim o backend sabe como calcular sem inferência frágil.

---

## 7. Como modelar segurança de verdade

Aqui está o pedaço que normalmente ignoram.
Se quiser um banco seguro, faça isto.

### 7.1 Nunca usar usuário dono da migration na aplicação

Tenha usuários separados:

- usuário de migration
- usuário da aplicação leitura/escrita
- usuário somente leitura

Exemplo conceitual:

```sql
CREATE ROLE app_migracao LOGIN PASSWORD 'forte';
CREATE ROLE app_backend LOGIN PASSWORD 'forte';
CREATE ROLE app_leitura LOGIN PASSWORD 'forte';
```

### 7.2 Revogar privilégios padrão

Revogue acesso aberto do `PUBLIC`.

```sql
REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON DATABASE jornada_fast FROM PUBLIC;
```

### 7.3 Dar grant só no necessário

O backend não precisa:

- dropar tabela
- alterar schema
- criar extensão

O backend precisa no máximo:

- `SELECT`
- `INSERT`
- `UPDATE`
- talvez `DELETE` em poucos casos

### 7.4 Guardar arquivo e hash com validação

Todo documento importado deve ter:

- hash único
- tamanho
- mime type
- extensão

Isso ajuda contra:

- arquivo duplicado
- reprocessamento acidental
- origem obscura

### 7.5 Nunca confiar só no backend

Coloque `CHECK` no banco também.

Exemplos:

```sql
CHECK (quantidade > 0)
CHECK (qtd_por_m3 > 0)
CHECK (comprimento_m > 0)
CHECK (peso_bruto_kg >= 0)
CHECK (capacidade_m3_operacional > 0)
CHECK (quantidade_eixos > 0)
```

### 7.6 Usar enums ou checks fechados para domínios críticos

Para campos pequenos e controlados, use:

- enum PostgreSQL
- ou `CHECK IN (...)`

Exemplos:

- status de montagem
- tipo de documento
- status de processamento
- tipo de veículo
- tipo de carroceria
- método de volumetria

### 7.7 Se possível, usar `UUID` para entidades externas

Para entidades expostas por API:

- proposta
- estimativa
- documento importado
- simulação

`UUID` reduz previsibilidade.
Para chave interna, `BIGSERIAL` também funciona.
Estratégia híbrida é boa:

- `id BIGSERIAL`
- `public_id UUID`

### 7.8 Soft delete só onde fizer sentido

Não aplique soft delete em tudo.
Use em catálogos e parâmetros.
Para cálculo histórico, prefira:

- `ativo`
- vigência
- versionamento

---

## 8. Técnicas legais de automação no banco

Aqui está o pedaço que vai deixar o script forte.

### 8.1 Trigger para `atualizado_em`

Você deve ter uma função padrão:

```sql
CREATE OR REPLACE FUNCTION core.fn_set_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

E aplicar em tabelas importantes.

### 8.2 Trigger de auditoria

Você deve criar uma função genérica de auditoria para:

- `INSERT`
- `UPDATE`
- `DELETE`

Gravando em tabela de auditoria os dados antigos e novos em `JSONB`.

Isso te dá:

- rastreabilidade
- histórico de mudança
- diagnóstico
- segurança operacional

### 8.3 Trigger para impedir incoerência simples

Exemplo:

- impedir `qtd_por_m3_base` nulo quando `is_montante = true`
- impedir peso operacional maior que peso nominal
- impedir capacidade operacional maior que capacidade nominal

### 8.4 Seeds versionados

Crie inserts iniciais para:

- fatores de ajuste
- fatores de montagem
- tipos de veículo
- parâmetros de frete

Isso deve entrar em migration, não manualmente.

### 8.5 Views úteis para resultado

Você pode criar views seguras para consulta do backend/admin:

- `vw_estimativa_resumo`
- `vw_produto_linha_seca`
- `vw_produto_linha_fria`
- `vw_simulacao_logistica_resumo`

Isso ajuda:

- relatório
- debug
- dashboard
- consulta rápida

### 8.6 Índices parciais

Use quando fizer sentido.

Exemplo:

```sql
CREATE INDEX idx_produto_ativo_codigo
ON catalogo.produto (codigo)
WHERE ativo = TRUE;
```

### 8.7 `JSONB` só no lugar certo

Não transforme o banco todo em documento.
Use `JSONB` apenas para:

- payload bruto do documento
- erro de parsing
- auditoria
- snapshot técnico de cálculo

O resto deve continuar relacional.

---

## 9. Técnicas fortes de integridade

### 9.1 Chaves únicas importantes

Você deve proteger:

- hash do arquivo
- código do produto
- combinação de vigência de parâmetro
- combinação de versão ativa de nomenclatura
- combinação de faixa de frete por tabela

### 9.2 Constraints de vigência

Se houver histórico de parâmetros, evite registros ativos conflitantes.

Exemplo de regra:

- não pode haver dois fatores ativos para mesma categoria e mesma vigência
- não pode haver dois parâmetros de frete ativos para mesmo tipo de veículo no mesmo período

### 9.3 Snapshot da simulação

Toda simulação relevante deve salvar:

- dados de entrada
- parâmetros usados
- resultado final

Isso evita recalcular com regra nova e “reescrever o passado”.

---

## 10. Estratégia correta de migrations

### 10.1 Não fazer um arquivo monstro eterno

Faça assim:

- `V1__baseline.sql`
- `V2__catalogo_inicial.sql`
- `V3__logistica_veiculos.sql`
- `V4__auditoria.sql`
- `V5__views_consulta.sql`

Se quiser começar com tudo em um baseline porque o projeto está zerado, tudo bem.
Mas já escreva de forma modular.

### 10.2 Migration idempotente onde fizer sentido

Flyway normalmente controla execução.
Mas para seeds críticos, você pode usar:

```sql
INSERT INTO ...
ON CONFLICT DO NOTHING;
```

### 10.3 Nunca editar migration aplicada

Regra forte:

- migration aplicada não se altera
- ajuste vira nova migration

---

## 11. Modelo de segurança operacional

### 11.1 O que precisa existir no script

Seu script forte deve conter:

- `REVOKE`
- `GRANT`
- criação de roles
- schemas separados
- funções de trigger com `SECURITY DEFINER` só se realmente necessário
- sem permissões abertas demais

### 11.2 O que evitar

Evite:

- usar `public` para tudo
- deixar `PUBLIC` com acesso
- usar mesma role para migration e backend
- deixar senha hardcoded em SQL versionado
- deixar tabela sem índices mínimos
- deixar dado crítico sem `CHECK`

---

## 12. Automações de resultado que valem muito a pena

Se quiser ganhar qualidade real no banco, eu recomendo automatizar estas coisas:

### 12.1 Atualização de timestamp

Em toda tabela importante:

- `criado_em`
- `atualizado_em`

### 12.2 Auditoria de mudanças de parâmetro

Toda mudança em:

- fator de ajuste
- fator de montagem
- parâmetro de frete
- veículo
- regra operacional

deve ir para auditoria.

### 12.3 Registro do motivo de descarte logístico

Na simulação, registre por veículo:

- elegível ou não
- motivo do descarte

Exemplos:

- `DESTINO_NAO_ACEITA_CARRETA`
- `RESTRICAO_URBANA`
- `DOCA_INSUFICIENTE`
- `CAPACIDADE_VOLUMETRICA_INSUFICIENTE`
- `PESO_EXCEDIDO`

Isso vira ouro para debug.

### 12.4 Snapshot do cálculo

Na estimativa/simulação, salve um `jsonb_snapshot_calculo`.

Conteúdo útil:

- fatores aplicados
- método de volumetria
- parâmetros de frete
- veículo selecionado
- pesos e volumes consolidados

### 12.5 Views de conferência

Crie views para conferência operacional:

- produtos sem `qtd_por_m3`
- produtos linha fria sem peso líquido
- itens importados não normalizados
- estimativas com volume zero
- simulações com carreta descartada por restrição

Isso ajuda muito o time.

---

## 13. Ordem prática para você escrever o script

Se eu fosse escrever seu `V1__baseline.sql`, eu seguiria esta ordem:

1. extensões (`pgcrypto`, se for usar `gen_random_uuid()`)
2. schemas
3. tabelas mestre
   - cliente
   - endereço
   - transportadora
4. tabelas documentais
5. catálogo e nomenclatura
6. parâmetros de volumetria
7. veículos e restrições
8. ordens de compra
9. estimativas
10. simulações
11. proposta
12. frete
13. auditoria
14. funções e triggers
15. índices
16. seeds
17. grants

---

## 14. O mínimo de índices que você não deve esquecer

Índices obrigatórios:

- código do produto
- código legado
- hash do documento
- status de processamento
- estimativa por cliente
- estimativa por ordem de compra
- item por estimativa
- item por documento importado
- nomenclatura por código antigo
- nomenclatura por código novo
- veículo por tipo/carroceria
- restrição por destino
- restrição por região
- proposta por cliente
- proposta por versão

Se usar `JSONB`, indexe só quando tiver caso real.

---

## 15. Coisas que eu recomendo fortemente no seu SQL

### Recomendação 1

Tenha coluna `origem_dado` onde fizer sentido:

- `EXCEL_07`
- `EXCEL_08`
- `PDF`
- `MANUAL`
- `SISTEMA`

### Recomendação 2

Tenha colunas de vigência para parâmetros:

- `vigente_desde`
- `vigente_ate`

### Recomendação 3

Tenha flag de status do item:

- bruto
- normalizado
- validado
- rejeitado

### Recomendação 4

Guarde texto bruto importado.
Isso ajuda quando o parser errar.

### Recomendação 5

Na linha seca, permita override por estimativa para `qtd_por_m3`.

### Recomendação 6

Na linha fria, mantenha dimensão e peso em tabela própria ou ao menos bem separada logicamente.

### Recomendação 7

Não misture parâmetros de veículo com resultado de simulação na mesma tabela.

---

## 16. Erros de modelagem que você deve evitar

Não faça isto:

- tabela única gigante para tudo
- guardar cálculo só em memória
- sobrescrever produto histórico
- sobrescrever parâmetro histórico
- usar `VARCHAR` solto para tudo sem controle
- usar `FLOAT`
- ignorar auditoria
- ignorar vigência
- ignorar item bruto importado
- ignorar motivo do descarte de veículo
- misturar configuração com execução

---

## 17. Melhor estratégia de script forte

Se você quer um script realmente forte, o baseline deve ter:

1. base relacional correta
2. constraints fortes
3. precisão numérica correta
4. índices mínimos certos
5. auditoria desde o começo
6. triggers úteis
7. seeds essenciais
8. grants mínimos

Isso é muito melhor do que:

- fazer um SQL “rápido”
- e depois tentar endurecer produção em cima de base fraca

---

## 18. O que eu faria no seu lugar

Eu dividiria a construção em 3 passos:

### Etapa 1

Criar o baseline estrutural:

- schemas
- roles
- tabelas
- constraints
- índices

### Etapa 2

Criar automações:

- função `atualizado_em`
- auditoria genérica
- triggers
- views úteis

### Etapa 3

Popular dados essenciais:

- fatores de ajuste
- fatores de montagem
- tipos de veículo
- parâmetros de frete

---

## 19. Resultado final esperado

Seu banco precisa sair com estas características:

- seguro
- auditável
- rastreável
- preparado para importação
- preparado para linha seca e linha fria
- preparado para frete rodoviário
- preparado para truque e carreta
- preparado para evolução sem refatoração destrutiva

---

## 20. Próximo passo recomendado

Depois deste guia, o ideal é gerar:

1. um **prompt final de geração do SQL**
2. o arquivo real `backend/src/main/resources/db/migration/V1__baseline.sql`

Se fizer direito, esse baseline já nasce bom para:

- Spring Boot
- Flyway
- PostgreSQL
- cálculo logístico real
- auditoria forte
- evolução controlada
