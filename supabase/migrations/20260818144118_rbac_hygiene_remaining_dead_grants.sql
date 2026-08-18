-- Sobras da higiene, todas privilegio morto: nenhuma policy as sustentava e
-- nenhum caminho do app as usa. Zero mudanca de comportamento.

-- salon_settings: 1 linha (chairs). A unica policy e 'public read' (true) e
-- nenhuma pagina faz .from('salon_settings') — quem le e get_chair_load
-- (SECURITY DEFINER). Escrita nunca teve policy; o grant era inerte.
revoke all on public.salon_settings from anon, authenticated;
grant select on public.salon_settings to anon, authenticated;

-- client_photos: o painel faz select/insert/delete. Nao existe policy de
-- UPDATE desde sempre; o grant era inerte.
revoke update on public.client_photos from authenticated;

-- clients: TRUNCATE nao e filtrado por RLS e nao existe no PostgREST.
-- (As policies de clients ficam intactas — sao trabalho da proxima rodada.)
revoke truncate, references, trigger on public.clients from authenticated;
