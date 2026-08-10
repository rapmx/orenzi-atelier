-- POLICY CONSENT FOUNDATION (Booking V2.2 - Fase 3)
--
-- Preflight: nao existia NENHUMA coluna de policy/consent/terms/accept no
-- schema. O aceite exigido pela Review ("Li e concordo com a politica de
-- cancelamento") existiria so no browser e sumiria no commit.
--
-- Precisamos provar duas coisas: QUANDO houve aceite e QUAL regra foi aceita.
-- Guardar so um booleano nao prova a segunda; guardar o texto solto em cada
-- agendamento duplica um documento inteiro por linha; e apontar para uma
-- configuracao viva perderia a prova quando o texto mudasse.
--
-- Menor estrutura coerente: uma tabela de politicas versionadas e IMUTAVEIS
-- (uma linha por versao publicada) + duas colunas no appointment apontando
-- para a versao aceita e o instante do aceite.

CREATE TABLE public.cancellation_policies (
  id            uuid primary key default gen_random_uuid(),
  version       text not null unique,
  summary       text not null,       -- resumo curto exibido na Review
  body          text not null,       -- texto completo da view full-screen
  content_hash  text not null,       -- sha256(summary||body): integridade do snapshot
  published_at  timestamptz not null default now(),
  is_current    boolean not null default false
);

CREATE UNIQUE INDEX cancellation_policies_one_current
  ON public.cancellation_policies (is_current) WHERE is_current;

ALTER TABLE public.cancellation_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read current policy" ON public.cancellation_policies
  FOR SELECT USING (is_current);

INSERT INTO public.cancellation_policies (version, summary, body, content_hash, is_current)
SELECT
  'v1',
  s.summary,
  s.body,
  encode(extensions.digest(s.summary || s.body, 'sha256'), 'hex'),
  true
FROM (SELECT
  'Cancelamento gratuito até 12h antes. Após esse período, pode ser cobrada uma taxa de €16. Em caso de não comparecimento, a mesma taxa pode ser aplicada.' AS summary,
  E'Cancelamentos feitos até 12 horas antes do horário marcado não geram cobrança nenhuma. Você pode cancelar diretamente pela página "Gerenciar agendamento", enviada por e-mail após a confirmação.\n\nCancelamentos com menos de 12 horas de antecedência podem ter uma taxa de €16, referente ao tempo reservado na agenda que não pôde ser preenchido por outra cliente.\n\nEm caso de não comparecimento sem aviso, a mesma taxa de €16 pode ser cobrada.\n\nQuando um sinal é pago no momento da reserva, ele é descontado de qualquer taxa de cancelamento eventualmente aplicável.\n\nReagendamentos feitos com mais de 12 horas de antecedência não têm custo e podem ser feitos quantas vezes forem necessárias, sujeitos à disponibilidade da agenda.\n\nEm caso de dúvida, entre em contato diretamente com a Orenzi Ateliê antes do seu horário.' AS body
) s;

ALTER TABLE public.appointments
  ADD COLUMN policy_id uuid REFERENCES public.cancellation_policies(id),
  ADD COLUMN policy_accepted_at timestamptz;
