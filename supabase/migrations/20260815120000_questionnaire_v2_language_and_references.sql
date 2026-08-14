-- Questionario V2 — idioma, referencias visuais e hardening da tabela.
-- Aditiva. NAO remove coluna, NAO altera linha existente, NAO muda o
-- comportamento append-only (continua um INSERT por resposta; nada de
-- UPDATE/upsert nesta rodada — decisao do Raphael em 15/08/2026).
--
-- ETAPA B do trabalho de 15/08/2026. A etapa A (interface) ja esta em
-- app/painel.html e app/painel_demo.html e funciona SEM esta migration:
-- quizSave() tenta gravar com language/reference_images, e se o Postgres
-- disser que a coluna nao existe, regrava so as seis respostas antigas
-- (quizMissingColumn()). Depois desta migration o primeiro INSERT passa e
-- aquele caminho de compatibilidade deixa de ser usado.

-- ── Idioma em que a cliente respondeu ────────────────────────────────
-- So apresentacao: as RESPOSTAS sao gravadas sempre no valor canonico em
-- portugues ('Sim', 'Nenhum desses', ...), em qualquer idioma. Sem isso o
-- relatorio da Juliane chegaria em espanhol e qualquer leitura futura
-- (contagem, filtro) teria que conhecer os tres idiomas.
-- Linhas antigas ficam NULL de proposito — nao foram respondidas num
-- seletor de idioma, e preencher com 'pt-BR' seria inventar o passado. A
-- tela ja mostra pt-BR quando o campo e nulo.
ALTER TABLE public.client_questionnaires
  ADD COLUMN IF NOT EXISTS language text;

ALTER TABLE public.client_questionnaires
  DROP CONSTRAINT IF EXISTS client_questionnaires_language_check;
ALTER TABLE public.client_questionnaires
  ADD CONSTRAINT client_questionnaires_language_check
  CHECK (language IS NULL OR language IN ('pt-BR', 'en', 'es'));

-- ── Referencias visuais escolhidas ───────────────────────────────────
-- text[] com os IDs estaveis do catalogo (ref_01…), nunca URL: a foto
-- ainda vai ser fornecida pela Juliane e vai mudar de lugar; o id nao.
-- O catalogo que mapeia id → imagem vive na UI (QUIZ_REFERENCES).
-- Ate 3 por resposta, o mesmo limite que a tela aplica — a checagem
-- existe aqui porque limite de UI nao e limite de dado.
ALTER TABLE public.client_questionnaires
  ADD COLUMN IF NOT EXISTS reference_images text[] NOT NULL DEFAULT '{}';

ALTER TABLE public.client_questionnaires
  DROP CONSTRAINT IF EXISTS client_questionnaires_reference_images_check;
ALTER TABLE public.client_questionnaires
  ADD CONSTRAINT client_questionnaires_reference_images_check
  CHECK (cardinality(reference_images) <= 3);

-- ── Indice ───────────────────────────────────────────────────────────
-- client_id e a coluna do unico filtro que o app faz, e ate hoje a tabela
-- so tinha a PK em id. Irrelevante com 2 linhas; deixa de ser quando cada
-- cliente que passa pelo salao gera uma.
CREATE INDEX IF NOT EXISTS client_questionnaires_client_created_idx
  ON public.client_questionnaires (client_id, created_at DESC);

-- ── Hardening ────────────────────────────────────────────────────────
-- A tabela e anterior a convencao "Seguranca de objetos novos" e ficou com
-- os grants default do template: anon tinha SELECT/INSERT/UPDATE/DELETE/
-- TRUNCATE na tabela, e so a RLS segurava. Nao havia furo (as duas policies
-- exigem auth.role() = 'authenticated', entao anon leva 401), mas a
-- protecao dependia de uma unica camada. REVOKE explicito de PUBLIC *e* de
-- anon — o privilegio default do Supabase para esses papeis sobrevive a um
-- REVOKE so de PUBLIC.
--
-- authenticated mantem exatamente o que o painel usa hoje: SELECT e INSERT.
-- UPDATE e DELETE continuam de fora, sem policy e sem grant — editar ou
-- apagar resposta nao esta no escopo desta rodada (§18) e conceder o
-- privilegio "por via das duvidas" abriria caminho que nenhuma tela pede.
-- REVOKE tambem de authenticated antes do GRANT: o template do Supabase deu
-- a esse papel UPDATE/DELETE/TRUNCATE que um REVOKE so de PUBLIC/anon nao
-- tira, e o comentario acima ficaria falso (o privilegio seguiria existindo,
-- barrado apenas pela ausencia de policy). Mesma sequencia de
-- schedule_blocks_foundation.sql. Nenhuma tela grava UPDATE ou DELETE nesta
-- tabela — o app so faz SELECT e INSERT.
REVOKE ALL ON public.client_questionnaires FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT ON public.client_questionnaires TO authenticated;
