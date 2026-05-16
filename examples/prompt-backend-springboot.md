# Prompt para gerar o backend Fast Gôndulas

## Objetivo

Crie uma aplicação backend completa para a **Fast Gôndulas** usando **Java 17 + Spring Boot 3.x**, baseada nas regras de negócio descritas em `analise.md`.

O sistema deve atender o contexto de:

- cadastro de produtos de linha seca e linha fria
- mapeamento de nomenclatura antiga e nova
- cálculo de volumetria por item e por categoria
- cálculo de volume total
- cálculo de frete logístico por modal
- cadastro de clientes
- cadastro de endereços de entrega
- gestão de ordens de compra
- geração e persistência de estimativas
- parametrização de fatores de ajuste, montagem e frete

## Instruções obrigatórias

- Use **POO de forma séria**, com alta coesão e baixo acoplamento.
- Use **arquitetura em camadas**: `controller`, `service`, `repository`, `domain/entity`, `dto`, `mapper`, `config`, `exception`.
- A lógica de negócio deve ficar em `service` e em objetos de domínio quando fizer sentido. Não colocar regra de negócio em controller.
- Use **Spring Boot**, **Spring Web**, **Spring Data JPA**, **Bean Validation**, **Flyway**, **PostgreSQL**, **Lombok** e **MapStruct**.
- Use **DTOs** para entrada e saída da API.
- Use **tratamento global de exceções** com respostas padronizadas.
- Use **soft delete** onde fizer sentido, principalmente em cadastros.
- Use **BigDecimal** para todos os cálculos numéricos de volumetria e frete.
- Use **enum** para categorias, status, modal e status de montagem.
- O código deve ser limpo, explícito, testável e aderente a boas práticas de Spring Boot.
- Implementar validações, paginação, filtros básicos e versionamento de API em `/api/v1`.
- Preparar o projeto para crescimento, manutenção e produção.

## Regra importante sobre banco de dados

No documento original existem blocos separados de modelagem de banco. **Não crie dois bancos, dois schemas de negócio separados, nem duas modelagens concorrentes.**

Quero **um único banco relacional PostgreSQL**, com **uma única modelagem consolidada**, centralizando:

- volumetria
- frete
- clientes
- endereços
- ordens de compra
- catálogo de produtos
- nomenclaturas
- parâmetros de negócio
- estimativas

## Stack obrigatória

- Java 17
- Spring Boot 3.x
- Spring Web
- Spring Data JPA
- Spring Validation
- Flyway
- PostgreSQL 15+
- HikariCP
- Lombok
- MapStruct
- Maven

## Estrutura esperada do projeto

Use uma estrutura semelhante a:

```text
src/main/java/com/fastgondulas/backend
├── config
├── controller
├── dto
│   ├── request
│   └── response
├── entity
├── enumtype
├── exception
├── mapper
├── repository
├── service
│   ├── impl
│   └── calculator
├── specification
└── util
```

## Domínio do negócio

A empresa fabrica e vende equipamentos para varejo supermercadista.

O backend deve suportar:

1. **Linha seca**
   - gôndolas
   - mobílias
   - rack slim
   - checkouts
   - porta pallets

2. **Linha fria**
   - catálogo dimensional
   - códigos antigos e novos
   - suporte a nomenclatura v1 e v2

3. **Logística**
   - cálculo de volume por item
   - totalização por categoria
   - aplicação de fatores de ajuste
   - regra de montagem/desmontagem para montantes
   - cálculo de metros de carroceria
   - cálculo para caminhão e container
   - margens de 10% e 20%

4. **Comercial/Operacional**
   - clientes
   - endereços de entrega
   - ordens de compra
   - itens da ordem
   - estimativas persistidas

## Regras de negócio obrigatórias

### Produtos

- O produto deve suportar tanto linha seca quanto linha fria.
- `codigo` deve ser único.
- Deve existir suporte a `codigo_legado`.
- Produtos da linha seca podem usar `qtdPorM3`.
- Produtos montantes devem permitir `qtdPorM3Base` e cálculo dinâmico conforme status de montagem.
- Produtos da linha fria devem armazenar dimensões e pesos.
- Deve ser possível marcar se o produto possui `configurador`, `render`, `corte` e `estrutura`.

### Volumetria

- Volume por item = `quantidade / qtdPorM3Utilizado`
- Total bruto por categoria = soma dos volumes dos itens da categoria
- Total ajustado por categoria = total bruto x fator de ajuste da categoria
- Volume total = soma dos totais ajustados das categorias

### Fator de montagem

- Status possíveis: `MONTADOS` e `DESMONTADOS`
- Se produto for montante:
  - `MONTADOS` => fator 1
  - `DESMONTADOS` => fator 4
- `qtdPorM3Utilizado = qtdPorM3Base x fatorMontagem`

### Frete

- Modal `CAMINHAO`: `metrosBase = volumeTotalM3 * 12 / 60`
- Modal `CONTAINER`: `metrosBase = volumeTotalM3 * 12 / 45`
- `metrosNvia = metrosBase * 1.10`
- `metrosVenda = metrosBase * 1.20`
- Os parâmetros de frete devem ser configuráveis e persistidos.

### Ordens de compra

- Ordem de compra deve ter número único.
- Deve relacionar cliente e endereço de entrega.
- Deve suportar itens com produto, descrição, quantidade e unidade.
- Deve suportar status operacional.

### Estimativas

- Deve permitir cálculo sem salvar.
- Deve permitir salvar estimativa.
- Deve armazenar itens utilizados, quantidades, `qtdPorM3Utilizado`, volume por item e resultados consolidados.
- Deve armazenar vínculo com cliente e opcionalmente ordem de compra.

## Banco de dados único consolidado

Implemente **uma única modelagem relacional** com Flyway, usando as entidades abaixo.

### Tabelas obrigatórias

#### `cliente`
- `id`
- `razao_social`
- `cnpj`
- `contato_nome`
- `contato_email`
- `contato_fone`
- `ativo`
- `criado_em`

#### `endereco_entrega`
- `id`
- `cliente_id`
- `descricao`
- `logradouro`
- `numero`
- `complemento`
- `bairro`
- `cidade`
- `uf`
- `cep`
- `responsavel_nome`
- `responsavel_fone`
- `horario_recebimento`
- `observacoes`
- `tem_empilhadeira`
- `principal`

#### `produto`
- `id`
- `codigo`
- `codigo_legado`
- `descricao`
- `categoria`
- `qtd_por_m3`
- `qtd_por_m3_base`
- `is_montante`
- `comprimento_m`
- `largura_m`
- `altura_m`
- `peso_bruto_kg`
- `peso_liquido_kg`
- `tem_configurador`
- `tem_render`
- `tem_corte`
- `tem_estrutura`
- `numero_estrutura`
- `ativo`
- `criado_em`
- `atualizado_em`

#### `nomenclatura_mapping`
- `id`
- `codigo_antigo`
- `descricao_antiga`
- `codigo_novo_v1`
- `descricao_nova_v1`
- `codigo_novo_v2`
- `descricao_nova_v2`
- `familia`
- `formato`
- `fechamento`
- `temperatura`
- `comprimento_m`
- `largura_m`
- `altura_m`
- `peso_bruto_kg`
- `peso_liquido_kg`
- `observacoes`

#### `fator_ajuste`
- `id`
- `categoria`
- `fator`
- `vigente_desde`
- `vigente_ate`
- `criado_por`
- `criado_em`

#### `fator_montagem`
- `id`
- `status`
- `fator`

#### `parametro_frete`
- `id`
- `modal`
- `constante_secao`
- `fator_altura`
- `margem_nvia`
- `margem_venda`
- `vigente_desde`
- `vigente_ate`
- `criado_por`
- `criado_em`

#### `ordem_compra`
- `id`
- `numero`
- `status`
- `emissao`
- `entrega_prevista`
- `comprador_nome`
- `centro_custo`
- `condicao_pagamento`
- `cliente_id`
- `endereco_entrega_id`
- `agendamento_obrigatorio`
- `prazo_agendamento_horas`
- `observacoes`
- `criado_em`

#### `item_ordem_compra`
- `id`
- `ordem_compra_id`
- `numero_item`
- `produto_codigo`
- `descricao`
- `quantidade`
- `unidade`

#### `estimativa`
- `id`
- `numero_oc`
- `cliente_id`
- `ordem_compra_id`
- `status_montagem`
- `volume_lsg_bruto`
- `volume_lsg_ajustado`
- `volume_mobilias_bruto`
- `volume_mobilias_ajustado`
- `volume_rack_bruto`
- `volume_rack_ajustado`
- `volume_checkouts_bruto`
- `volume_checkouts_ajustado`
- `volume_porta_pallets_bruto`
- `volume_porta_pallets_ajustado`
- `volume_total_m3`
- `mts_caminhao`
- `mts_container`
- `mts_caminhao_nvia`
- `mts_caminhao_venda`
- `mts_container_nvia`
- `mts_container_venda`
- `criado_por`
- `criado_em`

#### `estimativa_item`
- `id`
- `estimativa_id`
- `produto_id`
- `produto_codigo`
- `produto_descricao`
- `categoria`
- `quantidade`
- `qtd_por_m3_utilizado`
- `volume_m3`

### Restrições obrigatórias

- Criar chaves primárias e estrangeiras.
- Criar índices para campos de busca frequente.
- Garantir unicidade de `produto.codigo`, `cliente.cnpj` e `ordem_compra.numero`.
- Usar `ON DELETE CASCADE` em `estimativa_item` para `estimativa`.
- Criar seeds iniciais de:
  - fatores de montagem
  - parâmetros de frete
  - fatores de ajuste padrão

## Requisitos técnicos de POO

- Criar classes com responsabilidade clara.
- Encapsular regras de cálculo em serviços especializados, por exemplo:
  - `VolumetriaService`
  - `FreteService`
  - `EstimativaService`
  - `ProdutoService`
  - `OrdemCompraService`
- Separar cálculo por classes auxiliares quando necessário:
  - `CalculadoraVolumeItem`
  - `CalculadoraVolumeCategoria`
  - `CalculadoraFrete`
- Usar composição quando melhorar clareza.
- Evitar classes anêmicas quando a regra pertencer naturalmente ao domínio.
- Evitar métodos gigantes.
- Evitar duplicação de regra.
- Evitar `if` espalhado; preferir enum com comportamento ou estratégia quando útil.

## Endpoints mínimos

### Produtos
- `GET /api/v1/produtos`
- `GET /api/v1/produtos/{id}`
- `POST /api/v1/produtos`
- `PUT /api/v1/produtos/{id}`
- `DELETE /api/v1/produtos/{id}`
- `GET /api/v1/produtos/linha-fria`

### Nomenclaturas
- `GET /api/v1/nomenclaturas`
- `POST /api/v1/nomenclaturas`
- `PUT /api/v1/nomenclaturas/{id}`

### Clientes
- `GET /api/v1/clientes`
- `POST /api/v1/clientes`
- `GET /api/v1/clientes/{id}`
- `PUT /api/v1/clientes/{id}`

### Endereços
- `GET /api/v1/clientes/{clienteId}/enderecos`
- `POST /api/v1/clientes/{clienteId}/enderecos`
- `PUT /api/v1/enderecos/{id}`

### Ordens de compra
- `GET /api/v1/ordens-compra`
- `GET /api/v1/ordens-compra/{id}`
- `POST /api/v1/ordens-compra`
- `PUT /api/v1/ordens-compra/{id}/status`

### Estimativas
- `POST /api/v1/estimativas/calcular`
- `POST /api/v1/estimativas`
- `GET /api/v1/estimativas`
- `GET /api/v1/estimativas/{id}`

### Parâmetros
- `GET /api/v1/parametros/fatores-ajuste`
- `PUT /api/v1/parametros/fatores-ajuste`
- `GET /api/v1/parametros/frete`
- `PUT /api/v1/parametros/frete`

## Regras de implementação

- Criar migrations Flyway desde o início.
- Criar `docker-compose` com PostgreSQL.
- Criar `application-dev.yml` e `application-prod.yml`.
- Criar documentação com Swagger/OpenAPI.
- Criar testes unitários para cálculos principais.
- Criar testes de integração para endpoints críticos.
- Validar entrada com Bean Validation.
- Padronizar respostas de erro.
- Preparar paginação e filtro em listagens.

## Pontos de atenção do negócio

- Existe dúvida no documento original sobre o fator de ajuste de `PORTA_PALLETS`. Se não houver definição externa, use `1.0` como padrão inicial parametrizável.
- O sistema deve suportar catálogo dinâmico de produtos.
- O sistema deve preservar alta precisão decimal.
- O sistema deve permitir evolução futura para autenticação, importação de PDF e exportações.

## Entregáveis esperados

Quero que a implementação entregue:

1. projeto Spring Boot funcional
2. modelagem relacional única e consolidada
3. migrations Flyway
4. entidades JPA
5. repositories
6. services com regras de negócio
7. controllers REST
8. DTOs e mappers
9. tratamento global de exceção
10. validações
11. testes principais
12. configuração para rodar local com PostgreSQL

## Saída esperada da geração

Ao gerar a aplicação:

- primeiro mostre a arquitetura proposta
- depois mostre a modelagem do banco único
- depois gere a estrutura do projeto
- depois gere as entidades, enums, DTOs, repositories, services e controllers
- depois gere as migrations
- depois gere os testes principais
- depois explique como subir o projeto localmente

## Resumo final do que NÃO pode acontecer

- não separar o sistema em dois bancos
- não criar modelagens duplicadas para volumetria e frete
- não colocar regra de negócio em controller
- não usar `double` para cálculos financeiros/logísticos
- não ignorar POO
- não criar código mágico sem enum, validação e camadas bem definidas
