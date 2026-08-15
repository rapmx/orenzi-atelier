"""Checagens de consistencia que dao pra fazer OFFLINE, sem LLM e sem rede.

Cada uma nasceu de um problema real deste repo. Nada aqui inventa regra:
sao invariantes que ja foram quebradas pelo menos uma vez.

Saida: AVISO (nao falha o refresh) — sao coisas pra decidir, nao pra travar.
"""
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
avisos, oks = [], []


def git(*args):
    r = subprocess.run(["git", "-C", str(ROOT), *args],
                       capture_output=True, text=True, encoding="utf-8",
                       errors="replace")
    return r.stdout.strip()


# ── 1. O grafo corresponde ao codigo de agora? ────────────────────────────
head = git("rev-parse", "HEAD")
gj = ROOT / "graphify-out" / "graph.json"
if gj.exists():
    commit_grafo = json.loads(gj.read_text(encoding="utf-8")).get("built_at_commit") or ""
    if commit_grafo and head.startswith(commit_grafo[:8]):
        oks.append(f"grafo construido sobre o HEAD atual ({commit_grafo[:8]})")
    elif commit_grafo:
        avisos.append(f"grafo foi construido em {commit_grafo[:8]}, HEAD e {head[:8]} "
                      f"— rode o refresh de novo se houve mudanca de codigo")
    sujo = git("status", "--porcelain", "app", "supabase")
    if sujo:
        n = len(sujo.splitlines())
        avisos.append(f"{n} arquivo(s) de codigo modificado(s) desde o build do grafo "
                      f"(app/ ou supabase/) — o grafo pode estar defasado")

# ── 2. painel e demo sao espelhos ─────────────────────────────────────────
# Ja aconteceu de uma tela entrar so num dos dois. Compara o conjunto de
# nomes de funcao declarados em cada um.
painel = ROOT / "app" / "painel.html"
demo = ROOT / "app" / "painel_demo.html"
if painel.exists() and demo.exists():
    rx = re.compile(r"\bfunction\s+([A-Za-z_$][\w$]*)\s*\(")
    fp = set(rx.findall(painel.read_text(encoding="utf-8", errors="ignore")))
    fd = set(rx.findall(demo.read_text(encoding="utf-8", errors="ignore")))
    so_painel = sorted(fp - fd)
    so_demo = sorted(fd - fp)
    # demoSalao/mockData sao do stub, existem so no demo de proposito
    so_demo = [f for f in so_demo if f not in {"demoSalao", "mockData"}]
    if so_painel:
        avisos.append(f"{len(so_painel)} funcao(oes) so no painel.html, ausentes no demo: "
                      f"{', '.join(so_painel[:6])}{'…' if len(so_painel) > 6 else ''}")
    if so_demo:
        avisos.append(f"{len(so_demo)} funcao(oes) so no painel_demo.html: "
                      f"{', '.join(so_demo[:6])}{'…' if len(so_demo) > 6 else ''}")
    if not so_painel and not so_demo:
        oks.append(f"painel e demo espelhados ({len(fp)} funcoes em cada)")

# ── 3. Expediente triplicado (JS x SQL) ───────────────────────────────────
# ADR 0007: mudar num lado e nao no outro faz a UI oferecer horario que a RLS
# recusa — falha silenciosa do ponto de vista da cliente.
salon = ROOT / "app" / "shared" / "salon.js"
if salon.exists():
    t = salon.read_text(encoding="utf-8", errors="ignore")
    m_open = re.search(r"OPEN_HOUR\s*:\s*(\d+)", t) or re.search(r"OPEN_HOUR\s*=\s*(\d+)", t)
    m_close = re.search(r"CLOSE_HOUR\s*:\s*(\d+)", t) or re.search(r"CLOSE_HOUR\s*=\s*(\d+)", t)
    if m_open and m_close:
        js = (m_open.group(1), m_close.group(1))
        sql_hits = []
        for f in (ROOT / "supabase" / "migrations").glob("*.sql"):
            s = f.read_text(encoding="utf-8", errors="ignore")
            if "is_public_booking_window" in s:
                sql_hits.append(f.name)
        oks.append(f"expediente no JS: {js[0]}h-{js[1]}h (app/shared/salon.js)")
        if sql_hits:
            avisos.append(f"expediente TAMBEM esta hardcoded no SQL "
                          f"({', '.join(sql_hits)}) — ADR 0007. Se mudou num, confira o outro")
        else:
            avisos.append("is_public_booking_window() nao esta em nenhuma migration local "
                          "— ela vive so no banco. Confirme no Supabase antes de mudar horario")

# ── 4. Edge Functions com fonte no repo ───────────────────────────────────
fdir = ROOT / "supabase" / "functions"
locais = sorted(p.name for p in fdir.iterdir() if p.is_dir()) if fdir.exists() else []
ESPERADAS = ["booking-orchestrator", "send-appointment-email", "stripe-webhook"]
faltando = [f for f in ESPERADAS if f not in locais]
if faltando:
    avisos.append(f"Edge Function ativa sem fonte no repo: {', '.join(faltando)}")
else:
    oks.append(f"3 Edge Functions com fonte no repo: {', '.join(locais)}")

# ── 5. Migrations locais x aplicadas ──────────────────────────────────────
migs = sorted((ROOT / "supabase" / "migrations").glob("*.sql"))
avisos.append(f"supabase/migrations/ tem {len(migs)} arquivo(s); o banco registra 38 "
              f"migrations aplicadas — espelho PARCIAL, por desenho. Nao achar um "
              f"objeto no repo nao significa que ele nao exista")

# ── 6. Changelog do DS x ultima entrega ───────────────────────────────────
ch = ROOT / "docs" / "10_GOVERNANCE_AND_CHANGELOG.md"
if ch.exists():
    versoes = re.findall(r"^## \[(\d+\.\d+\.\d+)\] — (\d{4}-\d{2}-\d{2})",
                         ch.read_text(encoding="utf-8"), re.M)
    if versoes:
        v, d = versoes[0]
        ultimo_commit = git("log", "-1", "--format=%ad", "--date=short")
        oks.append(f"changelog do DS: ultima versao {v} ({d}); ultimo commit {ultimo_commit}")
        if d < ultimo_commit:
            avisos.append(f"changelog para em {d}, ultimo commit e {ultimo_commit} "
                          f"— confira se a entrega mexeu em token/componente")

# ── saida ─────────────────────────────────────────────────────────────────
for o in oks:
    print(f"  ok    {o}")
print()
if avisos:
    print(f"  {len(avisos)} ponto(s) de atencao:")
    for a in avisos:
        print(f"  AVISO {a}")
else:
    print("  nenhuma inconsistencia conhecida")
