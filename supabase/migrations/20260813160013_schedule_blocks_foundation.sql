-- Bloqueio manual de agenda (Fase 1) — fundação.
-- Aditiva. NAO altera appointments, staff_work_blocks, get_busy_slots,
-- get_chair_load nem nenhuma funcao do Booking V2/V2.2 nesta migration —
-- essas entram na proxima (schedule_blocks_availability_integration).
--
-- Entidade propria, nao appointment fake: um schedule_block representa
-- indisponibilidade manual da profissional (dia inteiro ou intervalo),
-- motivo interno, nunca exposto ao Booking publico.

CREATE TABLE public.schedule_blocks (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id    uuid NOT NULL REFERENCES public.staff(id),
  starts_at   timestamptz NOT NULL,
  ends_at     timestamptz NOT NULL,
  all_day     boolean NOT NULL DEFAULT false,
  reason      text,
  created_by  uuid,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT schedule_blocks_range_check CHECK (ends_at > starts_at)
);

CREATE INDEX schedule_blocks_staff_range_idx
  ON public.schedule_blocks (staff_id, starts_at, ends_at);

ALTER TABLE public.schedule_blocks ENABLE ROW LEVEL SECURITY;

-- Superficie minima, seguindo a convencao documentada em app/CLAUDE.md
-- ("Seguranca de objetos novos no Supabase"): REVOKE explicito de PUBLIC
-- *e* de anon/authenticated, porque o Supabase concede privilegio default
-- a esses papeis que sobrevive a um REVOKE so de PUBLIC.
REVOKE ALL ON public.schedule_blocks FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.schedule_blocks TO authenticated;

-- Mesmo padrao de "authenticated read/insert/update appointments":
-- policy sem TO explicito, qual testa auth.role() = 'authenticated'.
-- anon nunca bate na qual (auth.role() = 'anon') e nao tem grant —
-- resultado e 401, nao 200 [].
CREATE POLICY "authenticated read schedule_blocks" ON public.schedule_blocks
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated insert schedule_blocks" ON public.schedule_blocks
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "authenticated update schedule_blocks" ON public.schedule_blocks
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated delete schedule_blocks" ON public.schedule_blocks
  FOR DELETE USING (auth.role() = 'authenticated');

CREATE OR REPLACE FUNCTION public.schedule_blocks_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$function$;

CREATE TRIGGER trg_schedule_blocks_set_updated_at
  BEFORE UPDATE ON public.schedule_blocks
  FOR EACH ROW EXECUTE FUNCTION public.schedule_blocks_set_updated_at();

-- Conflito BLOCK -> APPOINTMENT: criar/editar um bloqueio que intersecta o
-- bloco de TRABALHO (work_before/work_after) de um appointment existente da
-- mesma profissional e rejeitado. O GAP fica livre de proposito — e o mesmo
-- "buraco" que hoje permite encaixar outro atendimento, e um bloqueio pode
-- ocupar exatamente esse espaco sem conflitar com o atendimento em volta.
--
-- Mesma formula de advisory lock de appointments_guard_conflict()/
-- lock_staff_for_booking() (hashtextextended(staff_id::text, 0)) — serializa
-- contra criacao/reagendamento de appointment na mesma profissional.
CREATE OR REPLACE FUNCTION public.schedule_blocks_guard_conflict()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  v_conflito text;
begin
  if new.staff_id is null then
    return new;
  end if;

  if current_setting('transaction_isolation') <> 'read committed' then
    raise exception 'BOOKING_CONFLICT_GUARD_REQUIRES_READ_COMMITTED'
      using errcode = '25001',
            detail  = 'Nível de isolamento: ' || current_setting('transaction_isolation'),
            hint    = 'Crie/edite bloqueios em READ COMMITTED.';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(new.staff_id::text, 0));

  with ag as (
    select a.starts_at, a.ends_at,
      coalesce(a.work_before_minutes, s.work_before_minutes,
               (extract(epoch from (a.ends_at - a.starts_at)) / 60)::int) as wb,
      coalesce(a.work_after_minutes, s.work_after_minutes, 0) as wa
    from appointments a
    left join services s on s.id = a.service_id
    where a.staff_id = new.staff_id
      and a.status is distinct from 'cancelled'
      and a.starts_at < new.ends_at and a.ends_at > new.starts_at
  ),
  wblocks as (
    select starts_at, starts_at + make_interval(mins => wb) as busy_end from ag
    union all
    select ends_at - make_interval(mins => wa), ends_at from ag where wa > 0
  )
  select to_char(w.starts_at at time zone 'Europe/Dublin', 'DD/MM HH24:MI')
         || '-' || to_char(w.busy_end at time zone 'Europe/Dublin', 'HH24:MI')
    into v_conflito
  from wblocks w
  where tstzrange(w.starts_at, w.busy_end, '[)') && tstzrange(new.starts_at, new.ends_at, '[)')
  limit 1;

  if v_conflito is not null then
    raise exception 'BLOCK_CONFLICTS_WITH_APPOINTMENT'
      using errcode = '23P01',
            detail  = 'Já existe atendimento em ' || v_conflito || '.',
            hint    = 'Resolva o atendimento (remarque ou cancele) antes de bloquear este horário.';
  end if;

  return new;
end;
$function$;

REVOKE ALL ON FUNCTION public.schedule_blocks_guard_conflict() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.schedule_blocks_set_updated_at() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER trg_schedule_blocks_no_appointment_conflict
  BEFORE INSERT OR UPDATE OF starts_at, ends_at, staff_id
  ON public.schedule_blocks
  FOR EACH ROW EXECUTE FUNCTION public.schedule_blocks_guard_conflict();
