# Prompt para refinar backend Spring Boot existente

Atue como **Principal Software Engineer + Arquiteto de Software + Especialista em Spring Boot + Especialista em Segurança de APIs**.

Sua missão é analisar o projeto atual e gerar uma **especificação completa da camada de aplicação backend** com foco em:

- Controllers
- Services
- DTOs
- autenticação
- autorização
- JWT
- Spring Security
- fluxos REST
- validações
- regras de negócio
- tratamento de erros

Importante: **não quero frontend**.  
Importante: **não quero recriação do domínio**.  
Importante: **não quero invenção de tabelas ou entidades novas se elas já existirem no projeto**.

---

## 1. Contexto obrigatório que você deve usar

Antes de responder, você deve obrigatoriamente ler e considerar:

- `examples/analise.md`
- todos os diagramas X6 disponíveis no projeto
- o PDF oficial fornecido pela empresa
- a estrutura atual do projeto Spring Boot
- todas as entidades já existentes em `backend/src/main/java/com/fastgondulas/backend/domain`
- todos os repositories já existentes
- o controller existente `AutenticacaoUsuarioController`
- o service existente `UsuarioService`
- os DTOs existentes `CadastroRequest` e `LoginRequest`

Você deve assumir que o repositório atual já contém o modelo de domínio principal e que ele representa a base oficial do sistema.

---

## 2. Restrições obrigatórias

### Não fazer

- não recriar entidades
- não recriar tabelas
- não recriar repositories
- não modificar o modelo de domínio
- não propor usar entidades diretamente em controllers
- não ignorar classes já existentes
- não responder como se estivesse começando um projeto do zero

### Fazer

- mapear a camada de aplicação sobre o domínio existente
- consumir as entidades existentes
- consumir os repositories existentes
- aproveitar os serviços e controllers já criados como ponto de partida
- identificar lacunas reais da camada de aplicação
- propor contratos REST consistentes com o domínio atual
- propor segurança profissional e stateless

---

## 3. Objetivo principal

Quero que você gere uma especificação técnica extremamente detalhada para implementar o backend usando **o projeto atual como fonte da verdade**.

O resultado deve cobrir:

- todos os controllers que devem existir
- todas as rotas REST
- todos os services necessários
- todos os DTOs de request/response
- toda a estratégia de autenticação
- toda a estratégia de autorização
- toda a configuração JWT
- toda a configuração Spring Security
- toda a política de permissões por perfil
- todas as regras de negócio relevantes por módulo
- todas as integrações de frete/rota/geolocalização

A especificação deve ser suficiente para implementar a camada de aplicação sem precisar tomar decisões importantes depois.

---

## 4. Escopo da análise

Analise o projeto atual e estruture a camada de aplicação a partir dos módulos/domínios já existentes, especialmente os grupos abaixo:

- autenticação e usuários
- clientes
- endereços de entrega
- ordens de compra
- itens de ordem de compra
- catálogo de produtos
- dimensões e pesos
- sinônimos e nomenclaturas
- documentos importados
- lotes de importação
- itens importados brutos
- estimativas
- itens de estimativa
- proposta
- proposta versão
- proposta item
- simulação logística
- simulação de veículo
- veículo tipo
- regras operacionais de veículo
- restrições por região
- restrições de destino
- fator de ajuste
- fator de montagem
- frete
- faixa de frete
- custo logístico
- auditoria
- transportadoras

Se algum desses domínios já estiver materializado em classes no projeto, você deve partir dele.

---

## 5. Controllers

Mapeie todos os controllers que devem existir com base nas entidades e casos de uso reais do projeto.

Para cada controller, informe:

### Nome do controller

Exemplos esperados:

- `AutenticacaoController`
- `UsuarioController`
- `ClienteController`
- `OrdemCompraController`
- `CatalogoProdutoController`
- `DocumentoImportadoController`
- `EstimativaController`
- `PropostaController`
- `SimulacaoLogisticaController`
- `VeiculoController`
- `TransportadoraController`
- `ParametroFreteController`
- `AuditoriaController`

### Para cada rota, informe obrigatoriamente

- endpoint completo
- verbo HTTP
- objetivo da rota
- request DTO
- response DTO
- query params e paginação quando aplicável
- regras de validação
- regras de negócio
- perfis autorizados
- service utilizado
- possíveis respostas de erro

### Erros que devem ser mapeados por rota

- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`
- `409 Conflict`
- `422 Unprocessable Entity`
- `500 Internal Server Error`

---

## 6. Services

Para cada agregado ou módulo do domínio existente, defina o respectivo service da camada de aplicação.

Para cada service, descreva:

- responsabilidade
- casos de uso atendidos
- métodos públicos
- validações
- regras de negócio
- dependências
- repositories utilizados
- outros services utilizados
- integrações externas utilizadas
- eventos/auditoria gerados

### Exemplos de métodos esperados

- `criar()`
- `atualizar()`
- `buscarPorId()`
- `buscarPorUuid()`
- `listar()`
- `listarPaginado()`
- `processarDocumento()`
- `normalizarItens()`
- `calcularEstimativa()`
- `simularFrete()`
- `recalcularComposicaoVeiculos()`
- `aprovarProposta()`
- `alterarStatus()`
- `buscarHistorico()`
- `registrarEventoAuditoria()`
- `login()`
- `refreshToken()`
- `logout()`

---

## 7. DTOs

Defina todos os DTOs necessários.

Regra obrigatória:

- controllers nunca devem expor entidades JPA diretamente
- requests e responses devem ser separados
- DTOs devem refletir os fluxos reais do sistema
- DTOs existentes (`CadastroRequest`, `LoginRequest`) devem ser considerados e refinados se necessário

### Organize os DTOs por categoria

#### Auth

- `LoginRequest`
- `CadastroRequest`
- `TokenResponse`
- `RefreshTokenRequest`
- `UsuarioAutenticadoResponse`

#### Usuário e acesso

- `UsuarioResponse`
- `AtualizarUsuarioRequest`
- `AlterarSenhaRequest`
- `PerfilResponse`

#### Cliente

- `CreateClienteRequest`
- `UpdateClienteRequest`
- `ClienteResponse`
- `ClienteResumoResponse`

#### Endereço

- `CreateEnderecoEntregaRequest`
- `UpdateEnderecoEntregaRequest`
- `EnderecoEntregaResponse`

#### Ordem de compra

- `CreateOrdemCompraRequest`
- `UpdateOrdemCompraRequest`
- `OrdemCompraResponse`
- `ItemOrdemCompraRequest`
- `ItemOrdemCompraResponse`

#### Catálogo

- `ProdutoResponse`
- `ProdutoResumoResponse`
- `ProdutoDimensaoResponse`
- `ProdutoPesoResponse`
- `NomenclaturaMappingResponse`
- `ProdutoSinonimoResponse`

#### Documento e importação

- `UploadDocumentoRequest`
- `DocumentoImportadoResponse`
- `ProcessarDocumentoRequest`
- `ItemImportadoBrutoResponse`
- `LoteImportacaoResponse`

#### Estimativa e frete

- `CalcularEstimativaRequest`
- `EstimativaResponse`
- `EstimativaItemResponse`
- `CalcularFreteRequest`
- `FreteSimuladoResponse`
- `HistoricoFreteResponse`

#### Proposta e simulação logística

- `CreatePropostaRequest`
- `PropostaResponse`
- `PropostaVersaoResponse`
- `SimulacaoLogisticaRequest`
- `SimulacaoLogisticaResponse`
- `SimulacaoVeiculoResponse`
- `OverrideComposicaoVeiculosRequest`

#### Veículos e regras operacionais

- `VeiculoTipoResponse`
- `VeiculoRegraOperacionalResponse`
- `RestricaoDestinoResponse`
- `RestricaoRegiaoResponse`
- `TabelaFreteResponse`
- `FaixaFreteResponse`

#### Auditoria e erro

- `EventoAuditoriaResponse`
- `ErroResponse`
- `ValidacaoErroResponse`

### Para cada DTO, informe

- finalidade
- campos
- tipo de cada campo
- obrigatoriedade
- validações Bean Validation
- exemplo JSON
- em quais rotas usar

### Bean Validation esperada

Use e detalhe quando aplicar:

- `@NotNull`
- `@NotBlank`
- `@Size`
- `@Email`
- `@Pattern`
- `@Positive`
- `@PositiveOrZero`
- `@PastOrPresent`
- `@FutureOrPresent`
- `@Valid`

---

## 8. Segurança - prioridade máxima

Projete a camada de segurança inteira com Spring Security profissional.

### Regras obrigatórias

- sistema stateless
- não usar sessão HTTP
- autenticação via JWT
- refresh token
- logout seguro
- revogação de token
- expiração configurável
- claims customizadas
- password hashing com BCrypt
- filtros de autenticação
- tratamento centralizado de erro de segurança

### JWT

Defina:

- access token
- refresh token
- duração de cada token
- estratégia de renovação
- rotação de refresh token
- blacklist ou estratégia de revogação
- onde persistir refresh token se necessário
- claims obrigatórias

### Claims mínimas

- `userId`
- `email`
- `role`
- `permissions`
- `issuedAt`
- `expiration`

### Roles obrigatórias

- `ROLE_ADMIN`
- `ROLE_OPERADOR`
- `ROLE_CLIENTE`
- `ROLE_MOTORISTA`

### Você deve mapear

- quais endpoints cada role pode acessar
- quais endpoints exigem autenticação
- quais endpoints são públicos
- quais endpoints exigem permissão fina
- quais operações exigem `ADMIN`

Crie uma tabela completa de autorização por endpoint.

---

## 9. SecurityConfig

Defina como deve ficar a configuração com Spring Security.

Explique detalhadamente:

- `SecurityFilterChain`
- `AuthenticationManager`
- `PasswordEncoder` com BCrypt
- filtro JWT
- provider de autenticação
- `UserDetailsService` ou adaptação equivalente
- `CorsConfiguration`
- `AuthenticationEntryPoint`
- `AccessDeniedHandler`
- política stateless
- rotas públicas
- rotas protegidas
- política de autorização por role/permissão

---

## 10. Migração da autenticação atual

Hoje o projeto possui autenticação simples baseada no `AutenticacaoUsuarioController` e no `UsuarioService`.

Você deve:

- analisar o modelo atual
- apontar limitações técnicas
- propor migração segura para JWT
- preservar compatibilidade evolutiva
- definir etapas de migração

### Compare obrigatoriamente duas opções

#### Opção 1

Spring Security + JWT próprio

#### Opção 2

Firebase Authentication + Firebase Admin SDK

Para cada opção, explique:

- vantagens
- desvantagens
- impacto na arquitetura
- impacto em custo
- impacto em complexidade
- impacto na operação
- aderência ao projeto atual

No final, escolha a melhor opção para este projeto e justifique tecnicamente.

---

## 11. Frete e integrações externas

Defina controllers, services e DTOs para cálculo e simulação de frete.

### Rotas mínimas esperadas

- `POST /api/v1/fretes/calcular`
- `POST /api/v1/fretes/simular`
- `GET /api/v1/fretes/historico`
- `GET /api/v1/fretes/{id}`

### Integrar preferencialmente com soluções gratuitas ou de baixo custo

- OpenRouteService
- OSRM
- Nominatim
- ViaCEP

### Para cada integração, informe

- service responsável
- interface/porta de integração
- método principal
- DTOs de integração
- timeout
- retry
- circuit breaker
- cache
- fallback
- tratamento de erro
- estratégia de observabilidade

### Cobrir pelo menos

- cálculo de distância
- geocoding
- busca de CEP
- cálculo de rota
- fallback entre provedores

---

## 12. Regras de qualidade arquitetural

A resposta deve seguir estas diretrizes:

- usar arquitetura limpa e pragmática
- controller fino
- service com regra de negócio
- repository só para persistência
- DTO para boundary
- mapper dedicado
- tratamento global de exceções
- padronização de resposta de erro
- logs auditáveis
- validação forte
- nomenclatura consistente
- separação por módulo
- foco em manutenibilidade

Evite:

- controller com regra de negócio
- DTO genérico demais
- service monolítico
- autorização espalhada de forma inconsistente
- dependência direta de provider externo no domínio

---

## 13. Formato obrigatório da resposta

A resposta final deve ser estruturada exatamente assim:

# 1. Visão Geral da Camada de Aplicação

- leitura do projeto atual
- estado atual da camada de aplicação
- lacunas encontradas
- direção arquitetural recomendada

# 2. Controllers

## Lista de Controllers

## Rotas por Controller

## Regras de Autorização por Endpoint

# 3. Services

## Lista de Services

## Responsabilidades

## Métodos

## Dependências

# 4. DTOs

## Requests

## Responses

## Regras de Validação

# 5. Segurança

## Diagnóstico da autenticação atual

## Estratégia JWT

## Roles e Permissões

## SecurityConfig

## Fluxo de Login

## Fluxo de Refresh Token

## Fluxo de Logout

# 6. Frete e Integrações

## Endpoints

## Services

## Providers

## Cache, Retry e Fallback

# 7. Regras de Negócio por Módulo

# 8. Tratamento de Erros

# 9. Roadmap de Implementação

Divida o roadmap em:

- imediato
- curto prazo
- médio prazo

Cada item deve conter:

- prioridade
- impacto
- complexidade

---

## 14. Nível de exigência

- não quero resposta genérica
- não quero resposta rasa
- não quero backend inventado fora do projeto
- quero aderência total ao código atual
- quero precisão técnica
- quero foco real em Spring Boot
- quero foco real em segurança
- quero foco real em camada de aplicação
- quero que a especificação seja implementável

---

## 15. Instrução final

Analise o projeto real e produza uma especificação completa da camada de aplicação backend, usando como base o domínio já existente e o material fornecido.

Se houver inconsistências entre documentos e código, você deve apontar explicitamente.

Se houver lacunas no projeto atual, você deve preencher apenas a camada de aplicação, sem recriar o domínio.
