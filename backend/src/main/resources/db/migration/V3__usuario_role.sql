-- V3__usuario_role.sql
-- Adiciona perfil de acesso e public_id ao usuario

ALTER TABLE public.usuario
    ADD COLUMN IF NOT EXISTS perfil     VARCHAR(50) NOT NULL DEFAULT 'USER',
    ADD COLUMN IF NOT EXISTS public_id  UUID        NOT NULL DEFAULT gen_random_uuid();

CREATE UNIQUE INDEX IF NOT EXISTS uq_usuario_public_id ON public.usuario (public_id);
