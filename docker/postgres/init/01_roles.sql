-- =============================================================================
-- 01_roles.sql
-- Executado pelo Postgres como superuser ANTES do Flyway rodar.
-- Cria as roles necessárias para a aplicação.
-- As senhas devem ser sobrescritas em produção via variáveis de ambiente.
-- =============================================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_backend') THEN
        CREATE ROLE app_backend LOGIN PASSWORD 'trocar_em_producao';
    END IF;

    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_leitura') THEN
        CREATE ROLE app_leitura LOGIN PASSWORD 'trocar_em_producao';
    END IF;
END
$$;
