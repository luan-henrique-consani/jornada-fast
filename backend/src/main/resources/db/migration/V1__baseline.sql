-- =============================================================================
-- V1__baseline.sql
-- Baseline estrutural do banco de dados - Sistema Jornada Fast
-- PostgreSQL + Flyway + Spring Boot 3 + Java 17
-- Domínio: Logística rodoviária, volumetria, linha seca e linha fria
-- =============================================================================

-- =============================================================================
-- 1. EXTENSÕES
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- =============================================================================
-- 2. SCHEMAS
-- =============================================================================

CREATE SCHEMA IF NOT EXISTS core;
CREATE SCHEMA IF NOT EXISTS documental;
CREATE SCHEMA IF NOT EXISTS catalogo;
CREATE SCHEMA IF NOT EXISTS logistica;
CREATE SCHEMA IF NOT EXISTS auditoria;

-- =============================================================================
-- 3. ROLES (criação condicional — requer SUPERUSER ou CREATEROLE)
--    Se o usuário de migration não tiver privilégio, as roles devem ser
--    criadas manualmente antes de rodar o Flyway (ex: via init-script Docker).
-- =============================================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_backend') THEN
        BEGIN
            CREATE ROLE app_backend LOGIN PASSWORD 'trocar_em_producao';
        EXCEPTION WHEN insufficient_privilege THEN
            RAISE WARNING 'Sem privilégio para criar role app_backend. Crie manualmente.';
        END;
    END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_leitura') THEN
        BEGIN
            CREATE ROLE app_leitura LOGIN PASSWORD 'trocar_em_producao';
        EXCEPTION WHEN insufficient_privilege THEN
            RAISE WARNING 'Sem privilégio para criar role app_leitura. Crie manualmente.';
        END;
    END IF;
END
$$;

-- =============================================================================
-- 4. REVOGAR PRIVILÉGIOS PADRÃO DO PUBLIC
-- =============================================================================

REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA core FROM PUBLIC;
REVOKE ALL ON SCHEMA documental FROM PUBLIC;
REVOKE ALL ON SCHEMA catalogo FROM PUBLIC;
REVOKE ALL ON SCHEMA logistica FROM PUBLIC;
REVOKE ALL ON SCHEMA auditoria FROM PUBLIC;

-- =============================================================================
-- 5. TIPOS ENUMERADOS
-- =============================================================================

-- Linha do produto
CREATE TYPE catalogo.tipo_linha AS ENUM (
    'SECA',
    'FRIA'
);

-- Método de volumetria por item
CREATE TYPE logistica.metodo_volumetria AS ENUM (
    'QTD_POR_M3',
    'DIMENSAO_FISICA'
);

-- Status de montagem dos montantes (linha seca)
CREATE TYPE logistica.status_montagem AS ENUM (
    'MONTADOS',
    'DESMONTADOS'
);

-- Tipo de veículo/carroceria
CREATE TYPE logistica.tipo_veiculo AS ENUM (
    'CAMINHAO_TRUQUE',
    'CARRETA_NORMAL',
    'CARRETA_EXTENDIDA'
);

-- Status de processamento documental
CREATE TYPE documental.status_processamento AS ENUM (
    'AGUARDANDO',
    'PROCESSANDO',
    'PROCESSADO',
    'ERRO',
    'IGNORADO'
);

-- Status do item importado
CREATE TYPE documental.status_item AS ENUM (
    'BRUTO',
    'NORMALIZADO',
    'VALIDADO',
    'REJEITADO'
);

-- Tipo de documento de origem
CREATE TYPE documental.tipo_documento AS ENUM (
    'EXCEL_LINHA_SECA',
    'EXCEL_LINHA_FRIA',
    'PDF',
    'MANUAL',
    'SISTEMA'
);

-- Motivo de descarte logístico
CREATE TYPE logistica.motivo_descarte AS ENUM (
    'DESTINO_NAO_ACEITA_CARRETA',
    'RESTRICAO_URBANA',
    'DOCA_INSUFICIENTE',
    'CAPACIDADE_VOLUMETRICA_INSUFICIENTE',
    'PESO_EXCEDIDO',
    'RESTRICAO_ALTURA',
    'MANOBRA_INSUFICIENTE',
    'TRANSPORTADORA_NAO_OPERA'
);

-- Status da proposta
CREATE TYPE logistica.status_proposta AS ENUM (
    'RASCUNHO',
    'AGUARDANDO_APROVACAO',
    'APROVADA',
    'RECUSADA',
    'CANCELADA'
);

-- =============================================================================
-- 6. SCHEMA CORE — clientes, endereços, transportadoras
-- =============================================================================

CREATE TABLE core.cliente (
    id              BIGSERIAL       PRIMARY KEY,
    public_id       UUID            NOT NULL DEFAULT gen_random_uuid(),
    nome            VARCHAR(255)    NOT NULL,
    documento       VARCHAR(20),
    email           VARCHAR(255),
    telefone        VARCHAR(30),
    ativo           BOOLEAN         NOT NULL DEFAULT TRUE,
    criado_em       TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    atualizado_em   TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    criado_por      VARCHAR(100),
    atualizado_por  VARCHAR(100),
    CONSTRAINT uq_cliente_public_id UNIQUE (public_id)
);

CREATE TABLE core.endereco_entrega (
    id                      BIGSERIAL       PRIMARY KEY,
    public_id               UUID            NOT NULL DEFAULT gen_random_uuid(),
    cliente_id              BIGINT          NOT NULL REFERENCES core.cliente (id) ON DELETE RESTRICT,
    logradouro              VARCHAR(255)    NOT NULL,
    numero                  VARCHAR(20),
    complemento             VARCHAR(100),
    bairro                  VARCHAR(100),
    cidade                  VARCHAR(100)    NOT NULL,
    uf                      CHAR(2)         NOT NULL,
    cep                     VARCHAR(10),
    latitude                NUMERIC(10, 7),
    longitude               NUMERIC(10, 7),
    -- Restrições operacionais do destino
    aceita_carreta          BOOLEAN         NOT NULL DEFAULT TRUE,
    tem_doca                BOOLEAN         NOT NULL DEFAULT FALSE,
    restricao_manobra       BOOLEAN         NOT NULL DEFAULT FALSE,
    restricao_altura_m      NUMERIC(6, 2),
    zona_urbana_restrita    BOOLEAN         NOT NULL DEFAULT FALSE,
    observacoes             TEXT,
    ativo                   BOOLEAN         NOT NULL DEFAULT TRUE,
    criado_em               TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    atualizado_em           TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    criado_por              VARCHAR(100),
    CONSTRAINT uq_endereco_public_id UNIQUE (public_id),
    CONSTRAINT chk_restricao_altura CHECK (restricao_altura_m IS NULL OR restricao_altura_m > 0)
);

CREATE TABLE core.transportadora (
    id              BIGSERIAL       PRIMARY KEY,
    public_id       UUID            NOT NULL DEFAULT gen_random_uuid(),
    razao_social    VARCHAR(255)    NOT NULL,
    cnpj            VARCHAR(20),
    email           VARCHAR(255),
    telefone        VARCHAR(30),
    ativo           BOOLEAN         NOT NULL DEFAULT TRUE,
    criado_em       TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    atualizado_em   TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    criado_por      VARCHAR(100),
    CONSTRAINT uq_transportadora_public_id UNIQUE (public_id)
);

CREATE TABLE core.transportadora_regiao (
    id                  BIGSERIAL   PRIMARY KEY,
    transportadora_id   BIGINT      NOT NULL REFERENCES core.transportadora (id) ON DELETE CASCADE,
    uf                  CHAR(2)     NOT NULL,
    cidade              VARCHAR(100),
    tipo_veiculo        logistica.tipo_veiculo NOT NULL,
    opera               BOOLEAN     NOT NULL DEFAULT TRUE,
    criado_em           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE core.ordem_compra (
    id              BIGSERIAL       PRIMARY KEY,
    public_id       UUID            NOT NULL DEFAULT gen_random_uuid(),
    cliente_id      BIGINT          NOT NULL REFERENCES core.cliente (id) ON DELETE RESTRICT,
    numero          VARCHAR(100)    NOT NULL,
    descricao       TEXT,
    data_emissao    DATE,
    ativo           BOOLEAN         NOT NULL DEFAULT TRUE,
    criado_em       TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    atualizado_em   TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    criado_por      VARCHAR(100),
    CONSTRAINT uq_ordem_compra_public_id UNIQUE (public_id),
    CONSTRAINT uq_ordem_compra_numero UNIQUE (numero)
);

CREATE TABLE core.item_ordem_compra (
    id              BIGSERIAL       PRIMARY KEY,
    ordem_compra_id BIGINT          NOT NULL REFERENCES core.ordem_compra (id) ON DELETE CASCADE,
    codigo_produto  VARCHAR(100),
    descricao       VARCHAR(500),
    quantidade      NUMERIC(14, 4)  NOT NULL,
    unidade         VARCHAR(20),
    criado_em       TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_item_oc_quantidade CHECK (quantidade > 0)
);

-- =============================================================================
-- 7. SCHEMA DOCUMENTAL — importação de arquivos
-- =============================================================================

CREATE TABLE documental.lote_importacao (
    id              BIGSERIAL                       PRIMARY KEY,
    public_id       UUID                            NOT NULL DEFAULT gen_random_uuid(),
    descricao       VARCHAR(255),
    status          documental.status_processamento NOT NULL DEFAULT 'AGUARDANDO',
    origem          documental.tipo_documento       NOT NULL,
    criado_em       TIMESTAMPTZ                     NOT NULL DEFAULT NOW(),
    atualizado_em   TIMESTAMPTZ                     NOT NULL DEFAULT NOW(),
    criado_por      VARCHAR(100)                    NOT NULL,
    CONSTRAINT uq_lote_public_id UNIQUE (public_id)
);

CREATE TABLE documental.documento_importado (
    id                  BIGSERIAL                       PRIMARY KEY,
    public_id           UUID                            NOT NULL DEFAULT gen_random_uuid(),
    lote_id             BIGINT                          REFERENCES documental.lote_importacao (id) ON DELETE SET NULL,
    nome_arquivo        VARCHAR(500)                    NOT NULL,
    tipo_documento      documental.tipo_documento       NOT NULL,
    mime_type           VARCHAR(100),
    extensao            VARCHAR(20),
    tamanho_bytes       BIGINT,
    hash_sha256         CHAR(64)                        NOT NULL,
    status              documental.status_processamento NOT NULL DEFAULT 'AGUARDANDO',
    mensagem_erro       TEXT,
    importado_em        TIMESTAMPTZ                     NOT NULL DEFAULT NOW(),
    importado_por       VARCHAR(100)                    NOT NULL,
    atualizado_em       TIMESTAMPTZ                     NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_documento_public_id UNIQUE (public_id),
    CONSTRAINT uq_documento_hash UNIQUE (hash_sha256)
);

CREATE TABLE documental.item_importado_bruto (
    id                  BIGSERIAL                   PRIMARY KEY,
    documento_id        BIGINT                      NOT NULL REFERENCES documental.documento_importado (id) ON DELETE CASCADE,
    numero_linha        INTEGER,
    aba_origem          VARCHAR(100),
    status              documental.status_item      NOT NULL DEFAULT 'BRUTO',
    -- Dados brutos extraídos do Excel/PDF em JSONB para rastreabilidade
    conteudo_bruto      JSONB,
    texto_bruto         TEXT,
    confianca_extracao  NUMERIC(5, 4),
    mensagem_erro       TEXT,
    -- Campos extraídos separados para facilitar normalização
    codigo_bruto        VARCHAR(200),
    descricao_bruta     VARCHAR(1000),
    quantidade_bruta    VARCHAR(50),
    -- Referência ao produto normalizado (preenchida após normalização)
    produto_id          BIGINT,
    criado_em           TIMESTAMPTZ                 NOT NULL DEFAULT NOW(),
    atualizado_em       TIMESTAMPTZ                 NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_confianca CHECK (confianca_extracao IS NULL OR (confianca_extracao >= 0 AND confianca_extracao <= 1))
);

-- =============================================================================
-- 8. SCHEMA CATÁLOGO — produtos, dimensões, pesos, nomenclaturas
-- =============================================================================

CREATE TABLE catalogo.produto_categoria (
    id          BIGSERIAL       PRIMARY KEY,
    nome        VARCHAR(100)    NOT NULL,
    codigo      VARCHAR(50)     NOT NULL,
    linha       catalogo.tipo_linha NOT NULL,
    ativo       BOOLEAN         NOT NULL DEFAULT TRUE,
    criado_em   TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_categoria_codigo UNIQUE (codigo)
);

CREATE TABLE catalogo.produto (
    id                  BIGSERIAL           PRIMARY KEY,
    public_id           UUID                NOT NULL DEFAULT gen_random_uuid(),
    categoria_id        BIGINT              NOT NULL REFERENCES catalogo.produto_categoria (id) ON DELETE RESTRICT,
    linha               catalogo.tipo_linha NOT NULL,
    codigo              VARCHAR(100)        NOT NULL,
    codigo_legado       VARCHAR(100),
    descricao           VARCHAR(1000)       NOT NULL,
    -- Linha seca: qtd_por_m3
    qtd_por_m3          NUMERIC(18, 10),
    qtd_por_m3_base     NUMERIC(18, 10),
    is_montante         BOOLEAN             NOT NULL DEFAULT FALSE,
    -- Método de volumetria aplicável a este produto
    metodo_volumetria   logistica.metodo_volumetria NOT NULL,
    -- Flags documentais
    tem_estrutura       BOOLEAN             NOT NULL DEFAULT FALSE,
    tem_configurador    BOOLEAN             NOT NULL DEFAULT FALSE,
    tem_render          BOOLEAN             NOT NULL DEFAULT FALSE,
    tem_corte           BOOLEAN             NOT NULL DEFAULT FALSE,
    observacoes         TEXT,
    ativo               BOOLEAN             NOT NULL DEFAULT TRUE,
    vigente_desde       DATE,
    vigente_ate         DATE,
    criado_em           TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    atualizado_em       TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    criado_por          VARCHAR(100),
    atualizado_por      VARCHAR(100),
    CONSTRAINT uq_produto_public_id UNIQUE (public_id),
    CONSTRAINT uq_produto_codigo UNIQUE (codigo),
    CONSTRAINT chk_qtd_por_m3 CHECK (qtd_por_m3 IS NULL OR qtd_por_m3 > 0),
    CONSTRAINT chk_qtd_por_m3_base CHECK (qtd_por_m3_base IS NULL OR qtd_por_m3_base > 0),
    CONSTRAINT chk_vigencia CHECK (vigente_ate IS NULL OR vigente_desde IS NULL OR vigente_ate >= vigente_desde),
    -- Montante obrigatoriamente precisa de qtd_por_m3_base
    CONSTRAINT chk_montante_qtd_base CHECK (
        is_montante = FALSE OR qtd_por_m3_base IS NOT NULL
    ),
    -- Linha seca deve usar QTD_POR_M3
    CONSTRAINT chk_linha_metodo CHECK (
        (linha = 'SECA' AND metodo_volumetria = 'QTD_POR_M3')
        OR (linha = 'FRIA' AND metodo_volumetria = 'DIMENSAO_FISICA')
        OR linha = 'FRIA'
    )
);

CREATE TABLE catalogo.produto_sinonimo (
    id          BIGSERIAL       PRIMARY KEY,
    produto_id  BIGINT          NOT NULL REFERENCES catalogo.produto (id) ON DELETE CASCADE,
    sinonimo    VARCHAR(500)    NOT NULL,
    fonte       VARCHAR(100),
    criado_em   TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_produto_sinonimo UNIQUE (produto_id, sinonimo)
);

-- Dimensões físicas (linha fria)
CREATE TABLE catalogo.produto_dimensao (
    id                  BIGSERIAL       PRIMARY KEY,
    produto_id          BIGINT          NOT NULL REFERENCES catalogo.produto (id) ON DELETE CASCADE,
    comprimento_m       NUMERIC(10, 4)  NOT NULL,
    largura_m           NUMERIC(10, 4)  NOT NULL,
    altura_m            NUMERIC(10, 4)  NOT NULL,
    volume_unitario_m3  NUMERIC(18, 8)  GENERATED ALWAYS AS (comprimento_m * largura_m * altura_m) STORED,
    vigente_desde       DATE,
    vigente_ate         DATE,
    criado_em           TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    criado_por          VARCHAR(100),
    CONSTRAINT chk_comprimento CHECK (comprimento_m > 0),
    CONSTRAINT chk_largura CHECK (largura_m > 0),
    CONSTRAINT chk_altura CHECK (altura_m > 0)
);

-- Pesos
CREATE TABLE catalogo.produto_peso (
    id              BIGSERIAL       PRIMARY KEY,
    produto_id      BIGINT          NOT NULL REFERENCES catalogo.produto (id) ON DELETE CASCADE,
    peso_bruto_kg   NUMERIC(12, 3)  NOT NULL,
    peso_liquido_kg NUMERIC(12, 3),
    vigente_desde   DATE,
    vigente_ate     DATE,
    criado_em       TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    criado_por      VARCHAR(100),
    CONSTRAINT chk_peso_bruto CHECK (peso_bruto_kg >= 0),
    CONSTRAINT chk_peso_liquido CHECK (peso_liquido_kg IS NULL OR peso_liquido_kg >= 0),
    CONSTRAINT chk_peso_liq_menor_bruto CHECK (
        peso_liquido_kg IS NULL OR peso_liquido_kg <= peso_bruto_kg
    )
);

-- Mapeamento de nomenclatura (linha fria: código antigo → código novo)
CREATE TABLE catalogo.versao_nomenclatura (
    id          BIGSERIAL       PRIMARY KEY,
    nome        VARCHAR(100)    NOT NULL,
    descricao   TEXT,
    ativa       BOOLEAN         NOT NULL DEFAULT FALSE,
    criado_em   TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    criado_por  VARCHAR(100)
);

CREATE TABLE catalogo.nomenclatura_mapping (
    id                  BIGSERIAL       PRIMARY KEY,
    versao_id           BIGINT          NOT NULL REFERENCES catalogo.versao_nomenclatura (id) ON DELETE RESTRICT,
    produto_origem_id   BIGINT          REFERENCES catalogo.produto (id) ON DELETE SET NULL,
    produto_destino_id  BIGINT          REFERENCES catalogo.produto (id) ON DELETE SET NULL,
    codigo_antigo       VARCHAR(200)    NOT NULL,
    descricao_antiga    VARCHAR(1000),
    codigo_novo         VARCHAR(200)    NOT NULL,
    descricao_nova      VARCHAR(1000),
    -- Flags da linha fria
    tem_estrutura       BOOLEAN         NOT NULL DEFAULT FALSE,
    tem_configurador    BOOLEAN         NOT NULL DEFAULT FALSE,
    tem_render          BOOLEAN         NOT NULL DEFAULT FALSE,
    tem_corte           BOOLEAN         NOT NULL DEFAULT FALSE,
    observacoes         TEXT,
    ativo               BOOLEAN         NOT NULL DEFAULT TRUE,
    criado_em           TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    criado_por          VARCHAR(100),
    CONSTRAINT uq_nomenclatura_versao_codigo_antigo UNIQUE (versao_id, codigo_antigo)
);

-- =============================================================================
-- 9. SCHEMA LOGÍSTICA — parâmetros, veículos, estimativas, frete, proposta
-- =============================================================================

-- Fator de ajuste por categoria (linha seca)
CREATE TABLE logistica.fator_ajuste (
    id              BIGSERIAL       PRIMARY KEY,
    categoria_id    BIGINT          NOT NULL REFERENCES catalogo.produto_categoria (id) ON DELETE RESTRICT,
    fator           NUMERIC(10, 6)  NOT NULL,
    vigente_desde   DATE            NOT NULL DEFAULT CURRENT_DATE,
    vigente_ate     DATE,
    ativo           BOOLEAN         NOT NULL DEFAULT TRUE,
    criado_em       TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    criado_por      VARCHAR(100)    NOT NULL,
    CONSTRAINT chk_fator_ajuste CHECK (fator > 0),
    CONSTRAINT chk_vigencia_fator CHECK (vigente_ate IS NULL OR vigente_ate >= vigente_desde)
);

-- Fator de montagem (linha seca — montantes)
CREATE TABLE logistica.fator_montagem (
    id              BIGSERIAL               PRIMARY KEY,
    status_montagem logistica.status_montagem NOT NULL,
    fator           NUMERIC(10, 6)          NOT NULL,
    vigente_desde   DATE                    NOT NULL DEFAULT CURRENT_DATE,
    vigente_ate     DATE,
    ativo           BOOLEAN                 NOT NULL DEFAULT TRUE,
    criado_em       TIMESTAMPTZ             NOT NULL DEFAULT NOW(),
    criado_por      VARCHAR(100)            NOT NULL,
    CONSTRAINT chk_fator_montagem CHECK (fator > 0),
    CONSTRAINT chk_vigencia_montagem CHECK (vigente_ate IS NULL OR vigente_ate >= vigente_desde),
    CONSTRAINT uq_fator_montagem_status_vigencia UNIQUE (status_montagem, vigente_desde)
);

-- Tipos de veículo com capacidades e dimensões internas
CREATE TABLE logistica.veiculo_tipo (
    id                          BIGSERIAL               PRIMARY KEY,
    nome                        VARCHAR(100)            NOT NULL,
    tipo                        logistica.tipo_veiculo  NOT NULL,
    -- Dimensões externas do baú/carroceria (m)
    comprimento_m               NUMERIC(8, 3),
    largura_m                   NUMERIC(8, 3),
    altura_m                    NUMERIC(8, 3),
    -- Dimensões internas operacionais (m)
    comprimento_interno_m       NUMERIC(8, 3)           NOT NULL,
    largura_interna_m           NUMERIC(8, 3)           NOT NULL,
    altura_interna_m            NUMERIC(8, 3)           NOT NULL,
    -- Capacidades
    capacidade_m3_nominal       NUMERIC(10, 4)          NOT NULL,
    capacidade_m3_operacional   NUMERIC(10, 4)          NOT NULL,
    peso_max_kg_nominal         NUMERIC(12, 3)          NOT NULL,
    peso_max_kg_operacional     NUMERIC(12, 3)          NOT NULL,
    quantidade_eixos            SMALLINT                NOT NULL,
    -- Custos
    custo_por_km                NUMERIC(12, 4),
    pedagio_por_eixo            NUMERIC(12, 4),
    -- Restrições operacionais
    permite_area_urbana         BOOLEAN                 NOT NULL DEFAULT FALSE,
    permite_carga_fracionada    BOOLEAN                 NOT NULL DEFAULT FALSE,
    exige_doca                  BOOLEAN                 NOT NULL DEFAULT FALSE,
    restricao_altura_max_m      NUMERIC(6, 2),
    ativo                       BOOLEAN                 NOT NULL DEFAULT TRUE,
    criado_em                   TIMESTAMPTZ             NOT NULL DEFAULT NOW(),
    atualizado_em               TIMESTAMPTZ             NOT NULL DEFAULT NOW(),
    criado_por                  VARCHAR(100),
    CONSTRAINT chk_capacidade_m3_nominal CHECK (capacidade_m3_nominal > 0),
    CONSTRAINT chk_capacidade_m3_operacional CHECK (capacidade_m3_operacional > 0),
    CONSTRAINT chk_capacidade_operacional_le_nominal CHECK (
        capacidade_m3_operacional <= capacidade_m3_nominal
    ),
    CONSTRAINT chk_peso_nominal CHECK (peso_max_kg_nominal > 0),
    CONSTRAINT chk_peso_operacional CHECK (peso_max_kg_operacional > 0),
    CONSTRAINT chk_peso_operacional_le_nominal CHECK (
        peso_max_kg_operacional <= peso_max_kg_nominal
    ),
    CONSTRAINT chk_eixos CHECK (quantidade_eixos > 0),
    CONSTRAINT chk_comprimento_interno CHECK (comprimento_interno_m > 0),
    CONSTRAINT chk_largura_interna CHECK (largura_interna_m > 0),
    CONSTRAINT chk_altura_interna CHECK (altura_interna_m > 0)
);

-- Regras operacionais adicionais por veículo (extensível)
CREATE TABLE logistica.veiculo_regra_operacional (
    id              BIGSERIAL       PRIMARY KEY,
    veiculo_id      BIGINT          NOT NULL REFERENCES logistica.veiculo_tipo (id) ON DELETE CASCADE,
    descricao       VARCHAR(500)    NOT NULL,
    ativo           BOOLEAN         NOT NULL DEFAULT TRUE,
    criado_em       TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- Restrições por região (UF/cidade)
CREATE TABLE logistica.restricao_regiao (
    id              BIGSERIAL               PRIMARY KEY,
    uf              CHAR(2)                 NOT NULL,
    cidade          VARCHAR(100),
    tipo_veiculo    logistica.tipo_veiculo  NOT NULL,
    bloqueado       BOOLEAN                 NOT NULL DEFAULT TRUE,
    motivo          TEXT,
    vigente_desde   DATE                    NOT NULL DEFAULT CURRENT_DATE,
    vigente_ate     DATE,
    criado_em       TIMESTAMPTZ             NOT NULL DEFAULT NOW(),
    criado_por      VARCHAR(100)
);

-- Restrições por destino específico
CREATE TABLE logistica.restricao_destino (
    id                  BIGSERIAL               PRIMARY KEY,
    endereco_id         BIGINT                  NOT NULL REFERENCES core.endereco_entrega (id) ON DELETE CASCADE,
    tipo_veiculo        logistica.tipo_veiculo  NOT NULL,
    bloqueado           BOOLEAN                 NOT NULL DEFAULT TRUE,
    motivo              TEXT,
    criado_em           TIMESTAMPTZ             NOT NULL DEFAULT NOW(),
    criado_por          VARCHAR(100),
    CONSTRAINT uq_restricao_destino UNIQUE (endereco_id, tipo_veiculo)
);

-- Parâmetro de frete (configuração base)
CREATE TABLE logistica.parametro_frete (
    id              BIGSERIAL               PRIMARY KEY,
    tipo_veiculo    logistica.tipo_veiculo  NOT NULL,
    descricao       VARCHAR(255),
    -- Fórmula de referência comercial: mts = volume * 12 / 60
    fator_metro_m3  NUMERIC(10, 6)          NOT NULL DEFAULT 0.2, -- 12/60
    margem_nvia     NUMERIC(8, 6)           NOT NULL DEFAULT 0.10,
    margem_venda    NUMERIC(8, 6)           NOT NULL DEFAULT 0.20,
    vigente_desde   DATE                    NOT NULL DEFAULT CURRENT_DATE,
    vigente_ate     DATE,
    ativo           BOOLEAN                 NOT NULL DEFAULT TRUE,
    criado_em       TIMESTAMPTZ             NOT NULL DEFAULT NOW(),
    criado_por      VARCHAR(100)            NOT NULL,
    CONSTRAINT chk_fator_metro_m3 CHECK (fator_metro_m3 > 0),
    CONSTRAINT chk_margem_nvia CHECK (margem_nvia >= 0),
    CONSTRAINT chk_margem_venda CHECK (margem_venda >= 0),
    CONSTRAINT chk_vigencia_frete CHECK (vigente_ate IS NULL OR vigente_ate >= vigente_desde)
);

-- Tabela de frete com faixas de valores
CREATE TABLE logistica.tabela_frete (
    id              BIGSERIAL               PRIMARY KEY,
    tipo_veiculo    logistica.tipo_veiculo  NOT NULL,
    transportadora_id BIGINT                REFERENCES core.transportadora (id) ON DELETE SET NULL,
    descricao       VARCHAR(255)            NOT NULL,
    uf_origem       CHAR(2),
    uf_destino      CHAR(2),
    vigente_desde   DATE                    NOT NULL DEFAULT CURRENT_DATE,
    vigente_ate     DATE,
    ativo           BOOLEAN                 NOT NULL DEFAULT TRUE,
    criado_em       TIMESTAMPTZ             NOT NULL DEFAULT NOW(),
    criado_por      VARCHAR(100)
);

-- Faixas de frete por tabela
CREATE TABLE logistica.faixa_frete (
    id                  BIGSERIAL       PRIMARY KEY,
    tabela_id           BIGINT          NOT NULL REFERENCES logistica.tabela_frete (id) ON DELETE CASCADE,
    metros_min          NUMERIC(10, 4)  NOT NULL,
    metros_max          NUMERIC(10, 4),
    custo_por_metro     NUMERIC(14, 4)  NOT NULL,
    custo_minimo        NUMERIC(14, 2),
    criado_em           TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_metros_min CHECK (metros_min >= 0),
    CONSTRAINT chk_metros_max CHECK (metros_max IS NULL OR metros_max > metros_min),
    CONSTRAINT chk_custo_metro CHECK (custo_por_metro >= 0)
);

-- Estimativas
CREATE TABLE logistica.estimativa (
    id                      BIGSERIAL               PRIMARY KEY,
    public_id               UUID                    NOT NULL DEFAULT gen_random_uuid(),
    cliente_id              BIGINT                  NOT NULL REFERENCES core.cliente (id) ON DELETE RESTRICT,
    ordem_compra_id         BIGINT                  REFERENCES core.ordem_compra (id) ON DELETE SET NULL,
    descricao               VARCHAR(500),
    -- Status de montagem dos montantes nesta estimativa
    status_montagem         logistica.status_montagem,
    -- Totais calculados
    volume_total_m3         NUMERIC(18, 8),
    peso_total_kg           NUMERIC(14, 3),
    mts_caminhao            NUMERIC(14, 6),
    mts_caminhao_nvia       NUMERIC(14, 6),
    mts_caminhao_venda      NUMERIC(14, 6),
    -- Snapshot dos parâmetros usados no cálculo (rastreabilidade)
    snapshot_calculo        JSONB,
    calculado_em            TIMESTAMPTZ,
    calculado_por           VARCHAR(100),
    ativo                   BOOLEAN                 NOT NULL DEFAULT TRUE,
    criado_em               TIMESTAMPTZ             NOT NULL DEFAULT NOW(),
    atualizado_em           TIMESTAMPTZ             NOT NULL DEFAULT NOW(),
    criado_por              VARCHAR(100),
    CONSTRAINT uq_estimativa_public_id UNIQUE (public_id),
    CONSTRAINT chk_volume_total CHECK (volume_total_m3 IS NULL OR volume_total_m3 >= 0),
    CONSTRAINT chk_peso_total CHECK (peso_total_kg IS NULL OR peso_total_kg >= 0)
);

-- Itens da estimativa
CREATE TABLE logistica.estimativa_item (
    id                          BIGSERIAL                   PRIMARY KEY,
    estimativa_id               BIGINT                      NOT NULL REFERENCES logistica.estimativa (id) ON DELETE CASCADE,
    produto_id                  BIGINT                      REFERENCES catalogo.produto (id) ON DELETE RESTRICT,
    item_importado_id           BIGINT                      REFERENCES documental.item_importado_bruto (id) ON DELETE SET NULL,
    descricao_item              VARCHAR(1000),
    quantidade                  NUMERIC(14, 4)              NOT NULL,
    metodo_volumetria           logistica.metodo_volumetria NOT NULL,
    -- Linha seca
    qtd_por_m3_usado            NUMERIC(18, 10),
    qtd_por_m3_override         BOOLEAN                     NOT NULL DEFAULT FALSE,
    fator_ajuste_usado          NUMERIC(10, 6),
    fator_montagem_usado        NUMERIC(10, 6),
    status_montagem_item        logistica.status_montagem,
    -- Linha fria
    comprimento_m_usado         NUMERIC(10, 4),
    largura_m_usado             NUMERIC(10, 4),
    altura_m_usado              NUMERIC(10, 4),
    -- Resultados calculados
    volume_unitario_m3          NUMERIC(18, 8),
    volume_bruto_m3             NUMERIC(18, 8),
    volume_ajustado_m3          NUMERIC(18, 8),
    peso_bruto_kg               NUMERIC(12, 3),
    -- Categoria para agrupamento
    categoria_nome              VARCHAR(100),
    criado_em                   TIMESTAMPTZ                 NOT NULL DEFAULT NOW(),
    atualizado_em               TIMESTAMPTZ                 NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_quantidade_item CHECK (quantidade > 0),
    CONSTRAINT chk_volume_item CHECK (volume_bruto_m3 IS NULL OR volume_bruto_m3 >= 0)
);

-- Simulação logística (por estimativa)
CREATE TABLE logistica.simulacao_logistica (
    id                      BIGSERIAL   PRIMARY KEY,
    public_id               UUID        NOT NULL DEFAULT gen_random_uuid(),
    estimativa_id           BIGINT      NOT NULL REFERENCES logistica.estimativa (id) ON DELETE CASCADE,
    transportadora_id       BIGINT      REFERENCES core.transportadora (id) ON DELETE SET NULL,
    endereco_id             BIGINT      REFERENCES core.endereco_entrega (id) ON DELETE SET NULL,
    veiculo_selecionado_id  BIGINT      REFERENCES logistica.veiculo_tipo (id) ON DELETE SET NULL,
    -- Snapshot dos parâmetros de frete usados
    snapshot_frete          JSONB,
    custo_frete_total       NUMERIC(14, 2),
    custo_pedagio_total     NUMERIC(14, 2),
    observacoes             TEXT,
    simulado_em             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    simulado_por            VARCHAR(100),
    CONSTRAINT uq_simulacao_public_id UNIQUE (public_id)
);

-- Avaliação por veículo dentro da simulação
CREATE TABLE logistica.simulacao_veiculo (
    id              BIGSERIAL               PRIMARY KEY,
    simulacao_id    BIGINT                  NOT NULL REFERENCES logistica.simulacao_logistica (id) ON DELETE CASCADE,
    veiculo_id      BIGINT                  NOT NULL REFERENCES logistica.veiculo_tipo (id) ON DELETE RESTRICT,
    elegivel        BOOLEAN                 NOT NULL,
    motivo_descarte logistica.motivo_descarte,
    metros_usados   NUMERIC(10, 4),
    custo_estimado  NUMERIC(14, 2),
    selecionado     BOOLEAN                 NOT NULL DEFAULT FALSE,
    criado_em       TIMESTAMPTZ             NOT NULL DEFAULT NOW()
);

-- Custo logístico consolidado
CREATE TABLE logistica.custo_logistico (
    id                  BIGSERIAL   PRIMARY KEY,
    simulacao_id        BIGINT      NOT NULL REFERENCES logistica.simulacao_logistica (id) ON DELETE CASCADE,
    descricao           VARCHAR(255) NOT NULL,
    valor               NUMERIC(14, 2) NOT NULL,
    tipo                VARCHAR(50),
    criado_em           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Proposta
CREATE TABLE logistica.proposta (
    id              BIGSERIAL               PRIMARY KEY,
    public_id       UUID                    NOT NULL DEFAULT gen_random_uuid(),
    cliente_id      BIGINT                  NOT NULL REFERENCES core.cliente (id) ON DELETE RESTRICT,
    estimativa_id   BIGINT                  REFERENCES logistica.estimativa (id) ON DELETE SET NULL,
    simulacao_id    BIGINT                  REFERENCES logistica.simulacao_logistica (id) ON DELETE SET NULL,
    status          logistica.status_proposta NOT NULL DEFAULT 'RASCUNHO',
    descricao       VARCHAR(500),
    valor_total     NUMERIC(16, 2),
    vigente_desde   DATE,
    vigente_ate     DATE,
    criado_em       TIMESTAMPTZ             NOT NULL DEFAULT NOW(),
    atualizado_em   TIMESTAMPTZ             NOT NULL DEFAULT NOW(),
    criado_por      VARCHAR(100),
    CONSTRAINT uq_proposta_public_id UNIQUE (public_id)
);

CREATE TABLE logistica.proposta_versao (
    id              BIGSERIAL               PRIMARY KEY,
    proposta_id     BIGINT                  NOT NULL REFERENCES logistica.proposta (id) ON DELETE CASCADE,
    numero_versao   SMALLINT                NOT NULL,
    status          logistica.status_proposta NOT NULL,
    snapshot_dados  JSONB                   NOT NULL,
    criado_em       TIMESTAMPTZ             NOT NULL DEFAULT NOW(),
    criado_por      VARCHAR(100),
    CONSTRAINT uq_proposta_versao UNIQUE (proposta_id, numero_versao)
);

CREATE TABLE logistica.proposta_item (
    id              BIGSERIAL       PRIMARY KEY,
    proposta_id     BIGINT          NOT NULL REFERENCES logistica.proposta (id) ON DELETE CASCADE,
    produto_id      BIGINT          REFERENCES catalogo.produto (id) ON DELETE SET NULL,
    descricao       VARCHAR(1000),
    quantidade      NUMERIC(14, 4)  NOT NULL,
    volume_m3       NUMERIC(18, 8),
    peso_kg         NUMERIC(12, 3),
    valor_unitario  NUMERIC(14, 4),
    valor_total     NUMERIC(16, 2),
    criado_em       TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_proposta_item_qtd CHECK (quantidade > 0)
);

-- =============================================================================
-- 10. SCHEMA AUDITORIA
-- =============================================================================

CREATE TABLE auditoria.evento_auditoria (
    id              BIGSERIAL       PRIMARY KEY,
    schema_nome     VARCHAR(100)    NOT NULL,
    tabela_nome     VARCHAR(100)    NOT NULL,
    registro_id     BIGINT,
    operacao        CHAR(1)         NOT NULL, -- I=INSERT, U=UPDATE, D=DELETE
    estado_anterior JSONB,
    estado_novo     JSONB,
    usuario         VARCHAR(100),
    origem_acao     TEXT,
    ocorrido_em     TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_operacao CHECK (operacao IN ('I', 'U', 'D'))
);

-- =============================================================================
-- 11. FUNÇÕES UTILITÁRIAS E TRIGGERS
-- =============================================================================

-- Função genérica para atualizar atualizado_em
CREATE OR REPLACE FUNCTION core.fn_set_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função genérica de auditoria
CREATE OR REPLACE FUNCTION auditoria.fn_auditoria_generica()
RETURNS TRIGGER AS $$
DECLARE
    v_id BIGINT;
BEGIN
    IF TG_OP = 'DELETE' THEN
        v_id := OLD.id;
        INSERT INTO auditoria.evento_auditoria (
            schema_nome, tabela_nome, registro_id, operacao,
            estado_anterior, estado_novo, usuario, origem_acao
        ) VALUES (
            TG_TABLE_SCHEMA, TG_TABLE_NAME, v_id, 'D',
            row_to_json(OLD)::JSONB, NULL,
            current_user, current_query()
        );
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        v_id := NEW.id;
        INSERT INTO auditoria.evento_auditoria (
            schema_nome, tabela_nome, registro_id, operacao,
            estado_anterior, estado_novo, usuario, origem_acao
        ) VALUES (
            TG_TABLE_SCHEMA, TG_TABLE_NAME, v_id, 'U',
            row_to_json(OLD)::JSONB, row_to_json(NEW)::JSONB,
            current_user, current_query()
        );
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        v_id := NEW.id;
        INSERT INTO auditoria.evento_auditoria (
            schema_nome, tabela_nome, registro_id, operacao,
            estado_anterior, estado_novo, usuario, origem_acao
        ) VALUES (
            TG_TABLE_SCHEMA, TG_TABLE_NAME, v_id, 'I',
            NULL, row_to_json(NEW)::JSONB,
            current_user, current_query()
        );
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: atualizado_em — core.cliente
CREATE TRIGGER trg_cliente_atualizado_em
    BEFORE UPDATE ON core.cliente
    FOR EACH ROW EXECUTE FUNCTION core.fn_set_atualizado_em();

-- Trigger: atualizado_em — core.endereco_entrega
CREATE TRIGGER trg_endereco_atualizado_em
    BEFORE UPDATE ON core.endereco_entrega
    FOR EACH ROW EXECUTE FUNCTION core.fn_set_atualizado_em();

-- Trigger: atualizado_em — core.transportadora
CREATE TRIGGER trg_transportadora_atualizado_em
    BEFORE UPDATE ON core.transportadora
    FOR EACH ROW EXECUTE FUNCTION core.fn_set_atualizado_em();

-- Trigger: atualizado_em — catalogo.produto
CREATE TRIGGER trg_produto_atualizado_em
    BEFORE UPDATE ON catalogo.produto
    FOR EACH ROW EXECUTE FUNCTION core.fn_set_atualizado_em();

-- Trigger: atualizado_em — logistica.estimativa
CREATE TRIGGER trg_estimativa_atualizado_em
    BEFORE UPDATE ON logistica.estimativa
    FOR EACH ROW EXECUTE FUNCTION core.fn_set_atualizado_em();

-- Trigger: atualizado_em — logistica.proposta
CREATE TRIGGER trg_proposta_atualizado_em
    BEFORE UPDATE ON logistica.proposta
    FOR EACH ROW EXECUTE FUNCTION core.fn_set_atualizado_em();

-- Trigger: atualizado_em — documental.documento_importado
CREATE TRIGGER trg_documento_atualizado_em
    BEFORE UPDATE ON documental.documento_importado
    FOR EACH ROW EXECUTE FUNCTION core.fn_set_atualizado_em();

-- Trigger: atualizado_em — documental.item_importado_bruto
CREATE TRIGGER trg_item_bruto_atualizado_em
    BEFORE UPDATE ON documental.item_importado_bruto
    FOR EACH ROW EXECUTE FUNCTION core.fn_set_atualizado_em();

-- Trigger: atualizado_em — logistica.veiculo_tipo
CREATE TRIGGER trg_veiculo_tipo_atualizado_em
    BEFORE UPDATE ON logistica.veiculo_tipo
    FOR EACH ROW EXECUTE FUNCTION core.fn_set_atualizado_em();

-- Trigger de auditoria — parâmetros críticos
CREATE TRIGGER trg_audit_fator_ajuste
    AFTER INSERT OR UPDATE OR DELETE ON logistica.fator_ajuste
    FOR EACH ROW EXECUTE FUNCTION auditoria.fn_auditoria_generica();

CREATE TRIGGER trg_audit_fator_montagem
    AFTER INSERT OR UPDATE OR DELETE ON logistica.fator_montagem
    FOR EACH ROW EXECUTE FUNCTION auditoria.fn_auditoria_generica();

CREATE TRIGGER trg_audit_parametro_frete
    AFTER INSERT OR UPDATE OR DELETE ON logistica.parametro_frete
    FOR EACH ROW EXECUTE FUNCTION auditoria.fn_auditoria_generica();

CREATE TRIGGER trg_audit_veiculo_tipo
    AFTER INSERT OR UPDATE OR DELETE ON logistica.veiculo_tipo
    FOR EACH ROW EXECUTE FUNCTION auditoria.fn_auditoria_generica();

CREATE TRIGGER trg_audit_proposta
    AFTER INSERT OR UPDATE OR DELETE ON logistica.proposta
    FOR EACH ROW EXECUTE FUNCTION auditoria.fn_auditoria_generica();

-- =============================================================================
-- 12. ÍNDICES
-- =============================================================================

-- core
CREATE INDEX idx_cliente_public_id ON core.cliente (public_id);
CREATE INDEX idx_endereco_cliente_id ON core.endereco_entrega (cliente_id);
CREATE INDEX idx_ordem_compra_cliente_id ON core.ordem_compra (cliente_id);
CREATE INDEX idx_transportadora_regiao_tf_uf ON core.transportadora_regiao (transportadora_id, uf);

-- documental
CREATE INDEX idx_doc_hash ON documental.documento_importado (hash_sha256);
CREATE INDEX idx_doc_status ON documental.documento_importado (status);
CREATE INDEX idx_doc_lote ON documental.documento_importado (lote_id);
CREATE INDEX idx_item_bruto_documento ON documental.item_importado_bruto (documento_id);
CREATE INDEX idx_item_bruto_status ON documental.item_importado_bruto (status);
CREATE INDEX idx_item_bruto_produto ON documental.item_importado_bruto (produto_id) WHERE produto_id IS NOT NULL;

-- catalogo
CREATE INDEX idx_produto_codigo ON catalogo.produto (codigo) WHERE ativo = TRUE;
CREATE INDEX idx_produto_codigo_legado ON catalogo.produto (codigo_legado) WHERE codigo_legado IS NOT NULL;
CREATE INDEX idx_produto_categoria ON catalogo.produto (categoria_id);
CREATE INDEX idx_produto_linha ON catalogo.produto (linha) WHERE ativo = TRUE;
CREATE INDEX idx_nomenclatura_codigo_antigo ON catalogo.nomenclatura_mapping (versao_id, codigo_antigo);
CREATE INDEX idx_nomenclatura_codigo_novo ON catalogo.nomenclatura_mapping (versao_id, codigo_novo);

-- logistica
CREATE INDEX idx_estimativa_public_id ON logistica.estimativa (public_id);
CREATE INDEX idx_estimativa_cliente ON logistica.estimativa (cliente_id);
CREATE INDEX idx_estimativa_ordem_compra ON logistica.estimativa (ordem_compra_id) WHERE ordem_compra_id IS NOT NULL;
CREATE INDEX idx_estimativa_item_estimativa ON logistica.estimativa_item (estimativa_id);
CREATE INDEX idx_estimativa_item_produto ON logistica.estimativa_item (produto_id) WHERE produto_id IS NOT NULL;
CREATE INDEX idx_simulacao_estimativa ON logistica.simulacao_logistica (estimativa_id);
CREATE INDEX idx_simulacao_veiculo_sim ON logistica.simulacao_veiculo (simulacao_id);
CREATE INDEX idx_proposta_public_id ON logistica.proposta (public_id);
CREATE INDEX idx_proposta_cliente ON logistica.proposta (cliente_id);
CREATE INDEX idx_proposta_status ON logistica.proposta (status);
CREATE INDEX idx_veiculo_tipo_tipo ON logistica.veiculo_tipo (tipo) WHERE ativo = TRUE;
CREATE INDEX idx_restricao_regiao_uf_tipo ON logistica.restricao_regiao (uf, tipo_veiculo);
CREATE INDEX idx_fator_ajuste_categoria ON logistica.fator_ajuste (categoria_id) WHERE ativo = TRUE;
CREATE INDEX idx_faixa_frete_tabela ON logistica.faixa_frete (tabela_id);

-- auditoria
CREATE INDEX idx_auditoria_tabela ON auditoria.evento_auditoria (schema_nome, tabela_nome);
CREATE INDEX idx_auditoria_registro ON auditoria.evento_auditoria (tabela_nome, registro_id);
CREATE INDEX idx_auditoria_ocorrido ON auditoria.evento_auditoria (ocorrido_em DESC);

-- =============================================================================
-- 13. VIEWS ÚTEIS
-- =============================================================================

-- Produtos da linha seca com dados de volumetria
CREATE VIEW catalogo.vw_produto_linha_seca AS
SELECT
    p.id,
    p.public_id,
    p.codigo,
    p.codigo_legado,
    p.descricao,
    pc.nome AS categoria,
    p.qtd_por_m3,
    p.qtd_por_m3_base,
    p.is_montante,
    p.ativo
FROM catalogo.produto p
JOIN catalogo.produto_categoria pc ON pc.id = p.categoria_id
WHERE p.linha = 'SECA';

-- Produtos da linha fria com dimensões e pesos
CREATE VIEW catalogo.vw_produto_linha_fria AS
SELECT
    p.id,
    p.public_id,
    p.codigo,
    p.codigo_legado,
    p.descricao,
    pc.nome AS categoria,
    pd.comprimento_m,
    pd.largura_m,
    pd.altura_m,
    pd.volume_unitario_m3,
    pp.peso_bruto_kg,
    pp.peso_liquido_kg,
    p.ativo
FROM catalogo.produto p
JOIN catalogo.produto_categoria pc ON pc.id = p.categoria_id
LEFT JOIN catalogo.produto_dimensao pd ON pd.produto_id = p.id
    AND (pd.vigente_ate IS NULL OR pd.vigente_ate >= CURRENT_DATE)
LEFT JOIN catalogo.produto_peso pp ON pp.produto_id = p.id
    AND (pp.vigente_ate IS NULL OR pp.vigente_ate >= CURRENT_DATE)
WHERE p.linha = 'FRIA';

-- Produtos linha seca sem qtd_por_m3 (alerta operacional)
CREATE VIEW catalogo.vw_produto_sem_qtd_m3 AS
SELECT
    p.id, p.codigo, p.descricao, pc.nome AS categoria
FROM catalogo.produto p
JOIN catalogo.produto_categoria pc ON pc.id = p.categoria_id
WHERE p.linha = 'SECA'
  AND p.qtd_por_m3 IS NULL
  AND p.ativo = TRUE;

-- Resumo da estimativa
CREATE VIEW logistica.vw_estimativa_resumo AS
SELECT
    e.id,
    e.public_id,
    c.nome AS cliente,
    oc.numero AS ordem_compra,
    e.status_montagem,
    e.volume_total_m3,
    e.peso_total_kg,
    e.mts_caminhao,
    e.mts_caminhao_nvia,
    e.mts_caminhao_venda,
    e.calculado_em,
    e.calculado_por,
    COUNT(ei.id) AS total_itens
FROM logistica.estimativa e
JOIN core.cliente c ON c.id = e.cliente_id
LEFT JOIN core.ordem_compra oc ON oc.id = e.ordem_compra_id
LEFT JOIN logistica.estimativa_item ei ON ei.estimativa_id = e.id
WHERE e.ativo = TRUE
GROUP BY e.id, e.public_id, c.nome, oc.numero;

-- Simulações com veículo descartado por restrição
CREATE VIEW logistica.vw_simulacao_descarte AS
SELECT
    sl.id AS simulacao_id,
    sl.public_id,
    vt.nome AS veiculo,
    vt.tipo,
    sv.motivo_descarte,
    sv.metros_usados,
    sl.simulado_em
FROM logistica.simulacao_logistica sl
JOIN logistica.simulacao_veiculo sv ON sv.simulacao_id = sl.id
JOIN logistica.veiculo_tipo vt ON vt.id = sv.veiculo_id
WHERE sv.elegivel = FALSE;

-- =============================================================================
-- 14. SEEDS INICIAIS
-- =============================================================================

-- Categorias de produto da linha seca
INSERT INTO catalogo.produto_categoria (nome, codigo, linha) VALUES
    ('Gôndolas / LSG',  'LSG',       'SECA'),
    ('Mobílias',        'MOBILIAS',  'SECA'),
    ('Rack Slim',       'RACK_SLIM', 'SECA'),
    ('Checkouts',       'CHECKOUTS', 'SECA'),
    ('Porta Pallets',   'PP',        'SECA'),
    ('Linha Fria',      'FRIA',      'FRIA')
ON CONFLICT (codigo) DO NOTHING;

-- Fatores de ajuste por categoria (linha seca — valores do Excel 08)
INSERT INTO logistica.fator_ajuste (categoria_id, fator, vigente_desde, criado_por)
SELECT pc.id, v.fator, CURRENT_DATE, 'SISTEMA_SEED'
FROM (VALUES
    ('LSG',       1.4),
    ('MOBILIAS',  1.2),
    ('RACK_SLIM', 1.2),
    ('CHECKOUTS', 1.0),
    ('PP',        1.0)
) AS v(codigo, fator)
JOIN catalogo.produto_categoria pc ON pc.codigo = v.codigo
ON CONFLICT DO NOTHING;

-- Fatores de montagem (linha seca — montantes porta pallets)
INSERT INTO logistica.fator_montagem (status_montagem, fator, vigente_desde, criado_por) VALUES
    ('MONTADOS',    1.0, CURRENT_DATE, 'SISTEMA_SEED'),
    ('DESMONTADOS', 4.0, CURRENT_DATE, 'SISTEMA_SEED')
ON CONFLICT (status_montagem, vigente_desde) DO NOTHING;

-- Versão de nomenclatura inicial (linha fria)
INSERT INTO catalogo.versao_nomenclatura (nome, descricao, ativa, criado_por) VALUES
    ('NOMENCLATURA_ATUAL', 'Versão base extraída do Excel 07 aba NOMENCLATURA ATUAL', TRUE, 'SISTEMA_SEED')
ON CONFLICT DO NOTHING;

-- Tipos de veículo / carroceria
INSERT INTO logistica.veiculo_tipo (
    nome, tipo,
    comprimento_interno_m, largura_interna_m, altura_interna_m,
    capacidade_m3_nominal, capacidade_m3_operacional,
    peso_max_kg_nominal, peso_max_kg_operacional,
    quantidade_eixos,
    permite_area_urbana, permite_carga_fracionada, exige_doca,
    criado_por
) VALUES
    (
        'Caminhão Truque', 'CAMINHAO_TRUQUE',
        7.0, 2.4, 2.4,
        40.0, 37.0,
        16000, 14000,
        2,
        TRUE, TRUE, FALSE,
        'SISTEMA_SEED'
    ),
    (
        'Carreta Normal', 'CARRETA_NORMAL',
        12.3, 2.4, 2.7,
        60.0, 57.0,
        27000, 25000,
        5,
        FALSE, FALSE, TRUE,
        'SISTEMA_SEED'
    ),
    (
        'Carreta Extendida', 'CARRETA_EXTENDIDA',
        14.0, 2.4, 2.7,
        70.0, 66.0,
        27000, 25000,
        6,
        FALSE, FALSE, TRUE,
        'SISTEMA_SEED'
    )
ON CONFLICT DO NOTHING;

-- Parâmetros de frete iniciais por tipo de veículo
INSERT INTO logistica.parametro_frete (tipo_veiculo, descricao, fator_metro_m3, margem_nvia, margem_venda, vigente_desde, criado_por)
VALUES
    ('CAMINHAO_TRUQUE',    'Parâmetro padrão truque',             0.2, 0.10, 0.20, CURRENT_DATE, 'SISTEMA_SEED'),
    ('CARRETA_NORMAL',     'Parâmetro padrão carreta normal',     0.2, 0.10, 0.20, CURRENT_DATE, 'SISTEMA_SEED'),
    ('CARRETA_EXTENDIDA',  'Parâmetro padrão carreta extendida',  0.2, 0.10, 0.20, CURRENT_DATE, 'SISTEMA_SEED')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- 15. GRANTS (condicionais — só executa se as roles existirem)
-- =============================================================================

DO $$
BEGIN
    -- -------------------------------------------------------------------------
    -- app_backend
    -- -------------------------------------------------------------------------
    IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_backend') THEN
        GRANT USAGE ON SCHEMA core        TO app_backend;
        GRANT USAGE ON SCHEMA documental  TO app_backend;
        GRANT USAGE ON SCHEMA catalogo    TO app_backend;
        GRANT USAGE ON SCHEMA logistica   TO app_backend;
        GRANT USAGE ON SCHEMA auditoria   TO app_backend;

        GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA core        TO app_backend;
        GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA documental  TO app_backend;
        GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA catalogo    TO app_backend;
        GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA logistica   TO app_backend;
        GRANT SELECT                 ON ALL TABLES IN SCHEMA auditoria   TO app_backend;

        GRANT USAGE ON ALL SEQUENCES IN SCHEMA core        TO app_backend;
        GRANT USAGE ON ALL SEQUENCES IN SCHEMA documental  TO app_backend;
        GRANT USAGE ON ALL SEQUENCES IN SCHEMA catalogo    TO app_backend;
        GRANT USAGE ON ALL SEQUENCES IN SCHEMA logistica   TO app_backend;
    ELSE
        RAISE WARNING 'Role app_backend não existe. Grants ignorados. Crie a role e execute os grants manualmente.';
    END IF;

    -- -------------------------------------------------------------------------
    -- app_leitura
    -- -------------------------------------------------------------------------
    IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_leitura') THEN
        GRANT USAGE ON SCHEMA core, documental, catalogo, logistica, auditoria TO app_leitura;
        GRANT SELECT ON ALL TABLES IN SCHEMA core        TO app_leitura;
        GRANT SELECT ON ALL TABLES IN SCHEMA documental  TO app_leitura;
        GRANT SELECT ON ALL TABLES IN SCHEMA catalogo    TO app_leitura;
        GRANT SELECT ON ALL TABLES IN SCHEMA logistica   TO app_leitura;
        GRANT SELECT ON ALL TABLES IN SCHEMA auditoria   TO app_leitura;
    ELSE
        RAISE WARNING 'Role app_leitura não existe. Grants ignorados.';
    END IF;
END
$$;
 