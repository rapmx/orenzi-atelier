"""Valida se o grafo ainda responde as perguntas que justificam a existencia dele.

Nao mede tamanho — mede CAPACIDADE. Um grafo pode crescer e mesmo assim parar
de ligar o front ao banco (foi o que aconteceu na primeira tentativa de
15/08/2026: 56 nos, todas as cadeias quebradas).

Saida: PASS / FAIL. Nao chama LLM.
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
GRAPH = ROOT / "graphify-out" / "graph.json"

if not GRAPH.exists():
    print("FAIL: graphify-out/graph.json nao existe")
    sys.exit(1)

g = json.loads(GRAPH.read_text(encoding="utf-8"))
nodes = g["nodes"]
links = g.get("links", [])

by_label = {}
for n in nodes:
    lbl = (n.get("label") or "").strip()
    if lbl:
        by_label.setdefault(lbl, []).append(n["id"])

adj = {}
for e in links:
    s, t = e.get("source"), e.get("target")
    adj.setdefault(s, set()).add(t)
    adj.setdefault(t, set()).add(s)


def alcanca(origem_label, destino_label, max_hops=6):
    """Existe caminho (nao-dirigido) entre os dois rotulos?"""
    starts = by_label.get(origem_label, [])
    ends = set(by_label.get(destino_label, []))
    if not starts or not ends:
        return None                      # rotulo inexistente != caminho ausente
    vistos, fila = set(starts), [(s, 0) for s in starts]
    while fila:
        no, d = fila.pop(0)
        if no in ends:
            return d
        if d >= max_hops:
            continue
        for viz in adj.get(no, ()):
            if viz not in vistos:
                vistos.add(viz)
                fila.append((viz, d + 1))
    return False


# Cadeias que TEM que existir. A busca e nao-dirigida, entao ela prova
# conectividade — nao prova direcao. Para invariante de arquitetura ("o browser
# NAO chama X") a busca por alcance nao serve: num grafo conexo quase tudo
# alcanca quase tudo. Esse tipo de regra e checado em INVARIANTES, abaixo.
CASOS = [
    ("renderAgenda()",        "public.schedule_blocks",                        True),
    ("renderQuestionario()",  "public.client_questionnaires",                  True),
    ("commitReschedule()",    "public.reschedule_booking_by_token_orchestrated()", True),
    ("renderAgenda()",        "buildAgendaGrid()",                             True),
    ("public._create_booking_core()", "public.appointment_services",           True),
]

# nos que simplesmente TEM que existir
PRESENCA = [
    "renderAgenda()", "bindAgendaPager()", "layoutAppts()", "segmentsOf()",
    "public.get_busy_slots()", "public.staff_work_blocks()",
    "public.handle_stripe_event()", "public.deposit_for_services()",
    "booking-orchestrator/index.ts", "stripe-webhook/index.ts",
    "send-appointment-email/index.ts",
]

print(f"grafo: {len(nodes)} nos, {len(links)} arestas")
print()

falhas = []

print("presenca de nos-chave:")
for lbl in PRESENCA:
    ok = lbl in by_label
    print(f"  {'OK  ' if ok else 'FALTA'} {lbl}")
    if not ok:
        falhas.append(f"no ausente: {lbl}")

print()
print("cadeias:")
for origem, destino, esperado in CASOS:
    r = alcanca(origem, destino)
    if r is None:
        print(f"  FALTA rotulo  {origem} -> {destino}")
        falhas.append(f"rotulo inexistente em: {origem} -> {destino}")
        continue
    achou = r is not False
    ok = achou == esperado
    if esperado:
        desc = f"{r} hop(s)" if achou else "SEM CAMINHO"
    else:
        desc = "sem caminho (correto)" if not achou else f"CAMINHO INESPERADO ({r} hops)"
    print(f"  {'OK  ' if ok else 'FALHA'} {origem} -> {destino}: {desc}")
    if not ok:
        falhas.append(f"cadeia: {origem} -> {destino}")

# arestas-ponte JS->Supabase
pontes = [e for e in links if e.get("context") == "supabase-bridge"]
print()
print(f"arestas-ponte JS->Supabase: {len(pontes)}")
if len(pontes) < 50:
    falhas.append(f"poucas arestas-ponte ({len(pontes)}) — bridge_edges.py rodou?")

# ── Invariantes de arquitetura ────────────────────────────────────────────
# Aqui a checagem e sobre ARESTA DIRETA, nao sobre alcance. "O browser nao
# chama handle_stripe_event" nao da pra provar por conectividade: o grafo e
# conexo e quase tudo alcanca quase tudo por tabela compartilhada. O que da
# pra provar e que nenhum arquivo do browser tem uma aresta-ponte para ela.
id_para_arquivo = {n["id"]: str(n.get("source_file") or "") for n in nodes}
ARQUIVOS_BROWSER = ("derived/agendar.js", "derived/painel.js",
                    "derived/gerenciar.js", "derived/index.js")

INVARIANTES = [
    # (descricao, rotulo do alvo)
    ("nenhum arquivo do browser chama handle_stripe_event "
     "(a confirmacao e do webhook)", "public.handle_stripe_event()"),
]

print()
print("invariantes de arquitetura:")
for desc, alvo_label in INVARIANTES:
    alvos = set(by_label.get(alvo_label, []))
    if not alvos:
        print(f"  FALTA alvo inexistente: {alvo_label}")
        falhas.append(f"invariante sem alvo: {alvo_label}")
        continue
    violacoes = []
    for e in links:
        s, t = e.get("source"), e.get("target")
        for origem, destino in ((s, t), (t, s)):
            if destino in alvos:
                arq = id_para_arquivo.get(origem, "")
                if any(b in arq for b in ARQUIVOS_BROWSER):
                    violacoes.append(f"{origem} ({arq})")
    if violacoes:
        print(f"  FALHA {desc}")
        for v in sorted(set(violacoes)):
            print(f"        violacao: {v}")
        falhas.append(f"invariante quebrada: {desc}")
    else:
        print(f"  OK   {desc}")

print()
if falhas:
    print("RESULTADO: FAIL")
    for f in falhas:
        print("  -", f)
    sys.exit(1)
print("RESULTADO: PASS")
