# Prompt enterprise para gerar backend logístico com Spring Boot

Quero que você atue como um **Arquiteto de Software Sênior + Analista de Negócios + Especialista em Logística, Cubagem e Frete**, com foco total em **backend Java Spring Boot enterprise**.

Seu objetivo é transformar o cenário abaixo em uma **especificação técnica extremamente detalhada** e pronta para implementação de um backend robusto, escalável, auditável e preparado para crescimento nacional.

## 1. Contexto real do negócio

Estou desenvolvendo um sistema para uma empresa que projeta e monta estruturas comerciais, como:

- mercados
- galpões
- gôndolas
- estruturas metálicas
- checkouts
- porta pallets
- equipamentos e peças correlatas

## 2. Fluxo operacional atual da empresa

O fluxo do negócio funciona assim:

1. O cliente entra em contato com o setor comercial informando que deseja montar uma estrutura comercial.
2. O cliente envia as dimensões do galpão, loja ou área física.
3. O comercial repassa essas informações para o arquiteto/projetista.
4. O arquiteto/projetista cria o layout e gera arquivos como PDF e/ou Excel contendo:
   - lista de peças
   - dimensões
   - peso
   - quantidades
   - valores
   - eventualmente cubagem
5. O comercial monta a proposta comercial.
6. O sistema que será desenvolvido ficará responsável pela parte logística e de frete.

## 3. Objetivo principal do sistema

O backend deve ser responsável por:

- receber PDFs e planilhas Excel enviados pelo comercial ou projetista
- ler e extrair os dados dos documentos
- estruturar os itens da proposta
- salvar os dados em banco
- calcular cubagem/volumetria
- calcular peso total
- recomendar automaticamente veículos ideais
- calcular ocupação da carga
- integrar com APIs externas de rotas, distância, mapas, pedágios e eventualmente frete
- calcular custo logístico final
- consolidar valor comercial + valor logístico
- retornar proposta final consolidada para o frontend

## 4. Funcionamento esperado

Fluxo principal:

`PDF/Excel do comercial -> extração dos itens -> saneamento/normalização -> cálculo volumétrico -> recomendação de veículos -> cálculo de frete -> proposta consolidada`

### Regra importante de operação

O sistema deve recomendar os veículos automaticamente, mas o operador poderá alterar manualmente no frontend.

Exemplo:

- sistema recomenda:
  - 6 carretas
- operador altera para:
  - 2 carretas
  - 3 caminhões

Após a alteração manual:

- o frontend envia atualização síncrona
- o backend deve recalcular automaticamente:
  - frete
  - ocupação
  - pedágios
  - custos por veículo
  - custo total
  - valor final da proposta

## 5. Escopo do frontend e backend

### Backend

Minha responsabilidade é:

- backend Java
- regras de negócio
- cálculos
- cubagem
- recomendação logística
- integração com APIs externas
- persistência no banco
- versionamento de propostas
- rastreabilidade
- auditoria

### Frontend

O frontend React será responsável por:

- exibir itens importados
- exibir veículos recomendados
- permitir edição manual da composição de veículos
- recalcular em tempo real via backend
- renderizar PDF da proposta
- gerar PDF final para download

## 6. Stack desejada

### Backend

- Java 17 ou superior
- Spring Boot 3.x
- PostgreSQL

### Frontend

- React

## 7. O que você deve produzir

Quero que você faça uma análise profunda e entregue uma **especificação enterprise** cobrindo:

1. análise completa do cenário de negócio
2. regras de negócio detalhadas
3. requisitos funcionais e não funcionais
4. arquitetura ideal
5. modelagem de banco
6. APIs externas reais recomendadas
7. bibliotecas Java recomendadas
8. decisão entre microsserviços e monolito modular
9. fluxo completo do sistema
10. diagramas textuais
11. padrões de projeto recomendados
12. estratégias de implementação dos cálculos
13. performance, escalabilidade, auditoria e rastreabilidade
14. estrutura limpa de pacotes, módulos e camadas
15. endpoints REST
16. DTOs
17. entidades JPA
18. uso de Flyway, Docker, mensageria, cache e filas
19. validações críticas
20. riscos de negócio e logística
21. estratégias inteligentes de frete
22. armazenamento de regras e fórmulas configuráveis
23. suporte futuro a múltiplas transportadoras
24. tabelas de frete por região
25. múltiplos centros de distribuição
26. arquitetura preparada para expansão nacional
27. arquitetura pronta para futura camada de IA

## 8. Regras obrigatórias de implementação e arquitetura

- Use **POO de verdade**, com alta coesão e baixo acoplamento.
- Use arquitetura limpa, explícita e preparada para manutenção.
- Não coloque regra de negócio em controller.
- Use `BigDecimal` para cálculos numéricos e monetários.
- Não use `double` para cubagem, peso, custo ou frete.
- Use `Bean Validation`.
- Use `DTOs` de request/response.
- Use `MapStruct`.
- Use `Flyway`.
- Use `Spring Data JPA`.
- Use tratamento global de exceção.
- Use versionamento de API em `/api/v1`.
- Prepare o sistema para auditoria e rastreabilidade.
- O sistema deve ser resiliente a documentos incompletos, divergentes ou sujos.
- O sistema deve permitir evolução futura sem refazer o domínio.

## 9. Análise de negócio que você deve considerar

Você deve analisar profundamente os seguintes riscos e casos:

- cubagem incorreta
- peso excedente
- combinação ruim de veículos
- rota com pedágio muito caro
- região com restrição para carreta
- limitação por eixo
- restrição urbana de circulação
- custo mínimo de frete
- carga fracionada
- aproveitamento ruim de espaço
- divergência entre PDF e Excel
- inconsistência de medidas
- itens sem peso
- itens sem dimensão
- itens com nomenclatura diferente para mesma peça
- duplicidade de item
- arredondamento incorreto
- erro de unidade de medida
- peça longa com baixo volume, mas inviável em veículo menor
- peça leve e volumosa
- peça pesada e compacta
- necessidade de combinar volume, peso, comprimento e restrição operacional

## 10. Regras de negócio detalhadas esperadas

### 10.1 Entrada documental

O sistema deve suportar ingestão de:

- PDF
- XLS
- XLSX
- CSV, se útil como formato auxiliar

Cada documento importado deve gerar:

- registro de origem
- hash do arquivo
- versão
- data de importação
- usuário que importou
- status de processamento
- erros de parsing
- confiança da extração por item/campo quando aplicável

### 10.2 Extração e normalização

O backend deve:

- extrair nome da peça
- largura
- altura
- profundidade
- comprimento
- peso unitário
- quantidade
- valor unitário
- valor total
- cubagem, se vier no documento
- unidade de medida

Depois deve:

- normalizar nomes
- converter unidades
- validar consistência entre quantidade x valor unitário x valor total
- validar consistência entre dimensões e cubagem
- identificar conflitos entre PDF e Excel
- permitir versionamento do resultado importado

### 10.3 Cálculo de cubagem

Quando cubagem não vier pronta:

`cubagem_unitaria_m3 = comprimento_m * largura_m * altura_m`

`cubagem_total_item = cubagem_unitaria_m3 * quantidade`

Se a empresa usar fator de empilhamento, quebra técnica, folga operacional ou fator logístico, o sistema deve suportar parâmetros configuráveis por:

- tipo de peça
- família de produto
- transportadora
- região
- operação

### 10.4 Cálculo de peso

`peso_total_item = peso_unitario_kg * quantidade`

`peso_total_carga = soma(peso_total_item)`

O sistema deve suportar:

- peso bruto
- peso líquido
- peso faturado
- peso cubado, se a transportadora usar regra própria

### 10.5 Recomendação automática de veículos

O sistema deve recomendar automaticamente composição de frota considerando ao mesmo tempo:

- volume total
- peso total
- comprimento máximo por peça
- altura máxima por peça
- restrições de empilhamento
- restrição por eixo
- restrição da malha viária
- restrição urbana
- custo por km
- pedágios
- mínimo de frete
- disponibilidade regional
- custo operacional por veículo
- taxa de ocupação mínima aceitável

Veículos suportados inicialmente:

- utilitário
- caminhão 3/4
- toco
- truck
- carreta
- bitrem
- rodotrem
- outros parametrizáveis

### 10.6 Alteração manual da composição

O operador poderá substituir a recomendação.

O backend deve receber a composição manual e recalcular:

- ocupação por veículo
- peso por veículo
- volume por veículo
- custo de cada veículo
- custo total de frete
- pedágio
- distância
- valor final consolidado

### 10.7 Proposta consolidada

A proposta consolidada deve conter:

- dados do cliente
- origem
- destino
- lista de itens
- valor comercial dos itens
- composição logística recomendada
- composição logística final escolhida
- custos logísticos detalhados
- frete total
- valor total da proposta
- versão da proposta
- histórico de alterações

## 11. Requisitos funcionais

Defina requisitos funcionais completos para, no mínimo:

- importar documentos
- processar documentos
- normalizar itens
- catalogar peças
- calcular cubagem
- calcular peso
- recomendar veículos
- recalcular composição manual
- consultar rotas
- calcular pedágio
- calcular custo logístico
- consolidar proposta
- versionar proposta
- auditar alterações
- consultar histórico
- cadastrar veículos
- cadastrar capacidades dos veículos
- cadastrar tabelas de frete
- cadastrar restrições por região
- cadastrar múltiplas transportadoras
- cadastrar múltiplos CDs/origens

## 12. Requisitos não funcionais

Defina requisitos não funcionais de:

- performance
- escalabilidade
- tolerância a falhas
- idempotência
- consistência transacional
- observabilidade
- auditoria
- segurança
- LGPD
- rastreabilidade
- versionamento
- maintainability
- operabilidade

## 13. Decisão arquitetural

Quero que você escolha entre:

- monolito modular
- microsserviços

E justifique profundamente.

Minha expectativa é que você avalie:

- estágio do produto
- complexidade do domínio
- necessidade de entrega rápida
- custo operacional
- necessidade de rastreabilidade
- volume de integrações
- probabilidade de crescimento nacional

Se optar por monolito modular, detalhe os módulos.
Se optar por microsserviços, detalhe bounded contexts, contratos, mensageria e consistência.

## 14. Arquitetura técnica esperada

Sugira arquitetura preparada para produção com:

- Spring Boot
- PostgreSQL
- Flyway
- Docker
- OpenAPI
- logs estruturados
- tracing
- metrics
- filas para processamento pesado
- cache para tabelas e consultas externas
- retry/circuit breaker para integrações

## 15. Estrutura de módulos e pacotes

Sugira algo como:

```text
com.empresa.logistica
├── shared
├── customer
├── catalog
├── document
├── proposal
├── freight
├── routing
├── vehicle
├── carrier
├── pricing
├── audit
└── integration
```

Explique responsabilidades, fronteiras e dependências.

## 16. Modelagem de banco de dados

Quero **um único banco PostgreSQL**, relacional, consolidado.

Não criar dois bancos separados para documentos e logística.
Não criar modelagens duplicadas.
Não separar a lógica em bancos concorrentes.

Sugira tabelas para, no mínimo:

- cliente
- endereco
- centro_distribuicao
- documento_importado
- documento_importado_arquivo
- lote_importacao
- item_importado_bruto
- item_normalizado
- catalogo_produto
- sinonimo_produto
- proposta
- proposta_versao
- proposta_item
- simulacao_logistica
- simulacao_veiculo
- veiculo_tipo
- veiculo_capacidade
- transportadora
- transportadora_regiao
- tabela_frete
- faixa_frete
- parametro_pedagio
- restricao_regiao
- rota_consulta
- custo_logistico
- auditoria_evento

Também quero:

- exemplos de colunas
- PKs
- FKs
- índices
- constraints
- campos de auditoria
- estratégia de versionamento

## 17. Entidades JPA

Sugira entidades JPA com foco em domínio e não apenas em CRUD.

Inclua exemplos para:

- `DocumentoImportado`
- `ItemImportadoBruto`
- `ItemNormalizado`
- `Proposta`
- `PropostaVersao`
- `PropostaItem`
- `SimulacaoLogistica`
- `SimulacaoVeiculo`
- `VeiculoTipo`
- `TabelaFrete`
- `Transportadora`
- `RestricaoRegiao`

## 18. DTOs

Sugira DTOs de request/response para:

- upload de documento
- reprocessamento
- confirmação de normalização
- cálculo logístico
- override manual de veículos
- retorno da proposta consolidada
- consulta de histórico
- consulta de simulação

## 19. Endpoints REST

Sugira endpoints REST versionados para:

- importação de documentos
- processamento
- catálogo
- propostas
- simulações logísticas
- veículos
- transportadoras
- tabelas de frete
- restrições
- auditoria

Inclua verbos, payloads, filtros, paginação e endpoints de recálculo.

## 20. Bibliotecas Java recomendadas

Quero recomendações reais e justificadas para:

- leitura de PDF
- leitura de Excel
- OCR, se necessário
- parser tabular
- geração de PDF
- integração HTTP
- retry/circuit breaker
- cache
- mensageria
- testes

Exemplos esperados:

- Apache PDFBox
- Tabula
- Apache POI
- OpenPDF ou iText
- Spring Retry
- Resilience4j
- OpenFeign ou WebClient

Mas quero análise crítica, não só lista.

## 21. APIs externas reais sugeridas

Sugira APIs reais, com prós e contras, para:

- rotas
- mapas
- distância
- geocoding
- pedágios
- custo logístico ou frete

Pode incluir exemplos como:

- Google Maps Platform
- Mapbox
- HERE
- OpenRouteService
- TollGuru
- Freight APIs específicas

Quero que você avalie:

- custo
- cobertura Brasil
- precisão
- facilidade de integração Java
- limites
- risco de lock-in

## 22. Estratégias matemáticas e algoritmos

Quero exemplos de:

- fórmulas
- cálculos
- pseudoalgoritmos
- heurísticas

Detalhe como implementar:

### 22.1 Cubagem
- cálculo por item
- cálculo total
- fator de ocupação

### 22.2 Ocupação por veículo
- percentual de volume ocupado
- percentual de peso ocupado
- restrição por dimensão crítica

### 22.3 Recomendação de veículos

Explique estratégias como:

- first fit decreasing
- best fit decreasing
- heurística por custo mínimo
- heurística por ocupação ótima
- combinação híbrida peso x volume x comprimento
- regras de penalização por subutilização
- regras de penalização por excesso de fracionamento

### 22.4 Recálculo síncrono

Quando o operador mudar os veículos, explique como recalcular sem perder consistência.

## 23. Regras configuráveis e fórmulas futuras

Sugira como armazenar regras e fórmulas para customização futura, por exemplo:

- tabelas parametrizáveis
- engine simples orientada a regras
- versionamento de parâmetros
- efetividade por data
- regra por região
- regra por transportadora
- regra por tipo de carga

Não quero solução overengineered.
Quero algo que comece simples, mas evolua bem.

## 24. Múltiplas transportadoras e múltiplos CDs

Explique como modelar:

- múltiplas transportadoras
- múltiplos centros de distribuição
- política de seleção de origem
- política de seleção de transportadora
- tabela de frete por região
- frete mínimo
- lead time
- SLA
- restrições por praça/região

## 25. Performance e escalabilidade

Sugira estratégias para:

- processamento assíncrono de documentos pesados
- cache de tabelas de frete
- cache de rota/pedágio por janela de tempo
- evitar recalcular proposta inteira desnecessariamente
- snapshot dos dados usados no cálculo
- indexação adequada
- particionamento futuro
- read models, se fizer sentido

## 26. Auditoria, versionamento e rastreabilidade

Quero estratégia para:

- saber qual arquivo originou cada item
- saber qual usuário alterou veículos
- saber qual versão da proposta foi enviada ao cliente
- saber quais parâmetros estavam vigentes no momento do cálculo
- reproduzir cálculo antigo
- trilha de auditoria completa

## 27. Segurança e robustez

Sugira validações e proteções para:

- upload inválido
- arquivo corrompido
- extensão falsa
- payload grande
- repetição de processamento
- concorrência
- idempotência
- inconsistência transacional
- falha em API externa
- timeout
- retry indevido
- dados incompletos

## 28. Preparação para IA futura

Desenhe a arquitetura para no futuro suportar:

- recomendação logística baseada em histórico
- otimização de carga
- previsão de custo
- sugestão automática de composição de veículos
- classificação inteligente de itens importados

Sem acoplar IA no core transacional agora.

## 29. Formato de saída obrigatório

Sua resposta deve ser organizada exatamente nesta ordem:

1. Visão executiva do negócio
2. Diagnóstico arquitetural
3. Regras de negócio detalhadas
4. Requisitos funcionais
5. Requisitos não funcionais
6. Arquitetura recomendada
7. Monolito modular vs microsserviços
8. Fluxo ponta a ponta
9. Diagramas textuais
10. Modelagem de banco de dados
11. Entidades JPA sugeridas
12. DTOs sugeridos
13. Endpoints REST
14. Estratégia de cálculo volumétrico
15. Estratégia de recomendação de veículos
16. Estratégia de recálculo síncrono
17. Integrações externas recomendadas
18. Bibliotecas Java recomendadas
19. Padrões de projeto recomendados
20. Estratégia de auditoria e versionamento
21. Estratégia de performance e escalabilidade
22. Estratégia para múltiplas transportadoras e regiões
23. Estratégia para múltiplos CDs
24. Estratégia de regras configuráveis
25. Preparação para IA futura
26. Riscos críticos do domínio
27. Roadmap de implementação por fases

## 30. Nível de profundidade esperado

- Não quero resposta genérica.
- Quero decisões justificadas.
- Quero exemplos reais.
- Quero exemplos de entidades.
- Quero exemplos de tabelas.
- Quero exemplos de payloads.
- Quero exemplos de algoritmos.
- Quero foco em backend enterprise.
- Quero foco em Java + Spring Boot + PostgreSQL.
- Quero visão de software nacional escalável.
- Quero visão de produto que pode crescer para operação multi-filial e multi-transportadora.

## 31. Restrições finais

- Não trate isso como CRUD simples.
- Não simplifique demais a logística.
- Não ignore divergência entre PDF e Excel.
- Não ignore volume, peso e dimensão crítica.
- Não ignore regra operacional regional.
- Não ignore auditoria.
- Não ignore versionamento.
- Não ignore rastreabilidade.
- Não proponha arquitetura fantasiosa sem justificar custo.
- Priorize solução enterprise, pragmática e implementável.
