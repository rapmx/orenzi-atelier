-- Bloqueio manual de agenda (Fase 2) — integracao com a engine de
-- disponibilidade existente. Aditiva: mantem a assinatura das tres funcoes
-- (mesmos parametros, mesmo retorno), so soma mais um UNION ALL.
--
-- staff_work_blocks e a fonte usada por TODO ponto de escrita de appointment
-- (appointments_guard_conflict, _create_booking_core, create_public_booking,
-- reschedule_booking_by_token e as variantes _orchestrated) — nenhuma dessas
-- funcoes precisa ser tocada, todas herdam a regra por chamar esta.
-- get_busy_slots/get_chair_load sao as copias publicas que o Booking e o
-- reagendamento leem (staff_work_blocks nunca teve grant pra anon/authenticated).
--
-- Gap de appointment continua livre: a unica coisa nova e um terceiro
-- intervalo opaco por schedule_block, ao lado dos dois que ja existiam
-- (work_before, work_after). Nao muda nada da logica de segmentos.

CREATE OR REPLACE FUNCTION public.staff_work_blocks(p_staff_id uuid, p_from timestamp with time zone, p_to timestamp with time zone, p_exclude_id uuid DEFAULT NULL::uuid)
 RETURNS TABLE(busy_start timestamp with time zone, busy_end timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
  with ag as (
    select a.starts_at, a.ends_at,
      coalesce(a.work_before_minutes, s.work_before_minutes,
               (extract(epoch from (a.ends_at - a.starts_at)) / 60)::int) as wb,
      coalesce(a.gap_minutes,        s.gap_minutes,        0) as gp,
      coalesce(a.work_after_minutes, s.work_after_minutes,  0) as wa
    from appointments a
    left join services s on s.id = a.service_id
    where a.staff_id = p_staff_id
      and a.status is distinct from 'cancelled'
      and a.starts_at < p_to and a.ends_at > p_from
      and (p_exclude_id is null or a.id <> p_exclude_id)
  )
  select starts_at, starts_at + make_interval(mins => wb) from ag
  union all
  select ends_at - make_interval(mins => wa), ends_at from ag where wa > 0
  union all
  select b.starts_at, b.ends_at
  from schedule_blocks b
  where b.staff_id = p_staff_id
    and b.starts_at < p_to and b.ends_at > p_from
$function$;

CREATE OR REPLACE FUNCTION public.get_busy_slots(p_staff_id uuid, p_from timestamp with time zone, p_to timestamp with time zone)
 RETURNS TABLE(busy_start timestamp with time zone, busy_end timestamp with time zone)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
  with ag as (
    select a.starts_at, a.ends_at,
      coalesce(a.work_before_minutes, s.work_before_minutes,
               (extract(epoch from (a.ends_at - a.starts_at)) / 60)::int) as wb,
      coalesce(a.gap_minutes,        s.gap_minutes,        0) as gp,
      coalesce(a.work_after_minutes, s.work_after_minutes,  0) as wa
    from appointments a
    left join services s on s.id = a.service_id
    where a.staff_id = p_staff_id
      and a.status is distinct from 'cancelled'
      and a.starts_at < p_to and a.ends_at > p_from
  )
  select starts_at, starts_at + make_interval(mins => wb) from ag
  union all
  select ends_at - make_interval(mins => wa), ends_at from ag where wa > 0
  union all
  select b.starts_at, b.ends_at
  from schedule_blocks b
  where b.staff_id = p_staff_id
    and b.starts_at < p_to and b.ends_at > p_from
$function$;

CREATE OR REPLACE FUNCTION public.get_chair_load(p_from timestamp with time zone, p_to timestamp with time zone)
 RETURNS TABLE(occupied_start timestamp with time zone, occupied_end timestamp with time zone)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
  with ag as (
    select a.starts_at, a.ends_at,
      coalesce(a.work_before_minutes, s.work_before_minutes,
               (extract(epoch from (a.ends_at - a.starts_at)) / 60)::int) as wb,
      coalesce(a.gap_minutes,        s.gap_minutes,        0) as gp,
      coalesce(a.work_after_minutes, s.work_after_minutes,  0) as wa
    from appointments a
    left join services s on s.id = a.service_id
    where a.status is distinct from 'cancelled'
      and a.starts_at < p_to and a.ends_at > p_from
  )
  select starts_at, starts_at + make_interval(mins => wb) from ag
  union all
  select ends_at - make_interval(mins => wa), ends_at from ag where wa > 0
  union all
  select b.starts_at, b.ends_at
  from schedule_blocks b
  where b.starts_at < p_to and b.ends_at > p_from
$function$;
