"""Driver do graphify para o Orenzi — escopo enxuto.

Escopo decidido com o Raphael em 15/08/2026:
  INCLUI  app/*.html (menos painel_demo), app/ds, app/shared, os dois CLAUDE.md,
          supabase/migrations/*.sql, supabase/functions/**/*.ts
  EXCLUI  painel_demo.html (espelho — dobraria o grafo sem informacao nova),
          docs/*.md (design system, ja indexado por docs/README.md),
          preview/, archive/, media-raw/, design/, app/assets/, graphify-out/

Semantica roda no Gemini (GEMINI_API_KEY setada), nao em subagente.
"""
import json, os, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]   # raiz do repo
OUT = ROOT / "graphify-out"
OUT.mkdir(exist_ok=True)
os.chdir(ROOT)

from graphify.detect import detect

print("== detect ==", flush=True)
det = detect(ROOT)

EXCLUDE_DIRS = ("preview", "archive", "media-raw", "design", "graphify-out",
                "graphify-archive-20260802", "docs", ".git", ".claude", "tools", "vault")
EXCLUDE_FILES = ("painel_demo.html",)


def keep(p: str) -> bool:
    rel = Path(p).resolve().relative_to(ROOT.resolve())
    parts = rel.parts
    if parts and parts[0] in EXCLUDE_DIRS:
        return False
    if rel.name in EXCLUDE_FILES:
        return False
    # app/assets = midia, nao ajuda navegacao estrutural
    if len(parts) >= 2 and parts[0] == "app" and parts[1] == "assets":
        return False
    return True


files = det.get("files", {})
before = {k: len(v) for k, v in files.items()}
for k in list(files):
    files[k] = [f for f in files[k] if keep(f)]
after = {k: len(v) for k, v in files.items()}
print("antes :", before, flush=True)
print("depois:", after, flush=True)

# Sidecars derivados: o JS inline dos HTMLs, extraido para .js real.
# Sem isso o AST nao ve nenhuma das ~500 funcoes do app, porque o graphify
# trata .html como documento e nunca passa parser de codigo nele.
derived = sorted((OUT / "derived").glob("*.js"))
files.setdefault("code", []).extend(str(p) for p in derived)
print(f"+ {len(derived)} sidecar(s) derivado(s): {[p.name for p in derived]}", flush=True)

for k, v in files.items():
    for f in v:
        print(f"  [{k}] {Path(f).resolve().relative_to(ROOT.resolve())}", flush=True)

# recalcula total_words do corpus filtrado (o report le daqui)
words = 0
for v in files.values():
    for f in v:
        try:
            words += len(Path(f).read_text(encoding="utf-8", errors="ignore").split())
        except Exception:
            pass
det["total_words"] = words
det["total_files"] = sum(len(v) for v in files.values())
print(f"corpus filtrado: {det['total_files']} arquivos, ~{words} palavras", flush=True)

(OUT / ".graphify_detect.json").write_text(json.dumps(det, ensure_ascii=False), encoding="utf-8")

# ── Parte A — AST (deterministico, sem LLM) ───────────────────────────────
print("== AST ==", flush=True)
from graphify.extract import collect_files, extract

code_files = []
for f in files.get("code", []):
    p = Path(f)
    code_files.extend(collect_files(p) if p.is_dir() else [p])

if code_files:
    ast = extract(code_files, cache_root=ROOT)
else:
    ast = {"nodes": [], "edges": [], "input_tokens": 0, "output_tokens": 0}
(OUT / ".graphify_ast.json").write_text(json.dumps(ast, indent=2, ensure_ascii=False), encoding="utf-8")
print(f"AST: {len(ast['nodes'])} nos, {len(ast['edges'])} arestas", flush=True)

# ── Parte B — semantica via Gemini ────────────────────────────────────────
print("== semantica (gemini) ==", flush=True)
from graphify.llm import extract_corpus_parallel

sem_files = []
for t in ("document", "paper", "image"):
    sem_files.extend(Path(f) for f in files.get(t, []))

if sem_files:
    sem = extract_corpus_parallel(sem_files, backend="gemini")
else:
    sem = {"nodes": [], "edges": [], "hyperedges": [], "input_tokens": 0, "output_tokens": 0}
(OUT / ".graphify_semantic.json").write_text(json.dumps(sem, indent=2, ensure_ascii=False), encoding="utf-8")
print(f"semantica: {len(sem['nodes'])} nos, {len(sem['edges'])} arestas, "
      f"{sem.get('input_tokens', 0)} tokens in", flush=True)

# ── Parte C — merge ───────────────────────────────────────────────────────
seen = {n["id"] for n in ast["nodes"]}
merged_nodes = list(ast["nodes"])
for n in sem["nodes"]:
    if n["id"] not in seen:
        merged_nodes.append(n)
        seen.add(n["id"])
merged = {
    "nodes": merged_nodes,
    "edges": ast["edges"] + sem["edges"],
    "hyperedges": sem.get("hyperedges", []),
    "input_tokens": sem.get("input_tokens", 0),
    "output_tokens": sem.get("output_tokens", 0),
}
(OUT / ".graphify_extract.json").write_text(json.dumps(merged, indent=2, ensure_ascii=False), encoding="utf-8")
print(f"merge: {len(merged_nodes)} nos, {len(merged['edges'])} arestas", flush=True)

# ── Passo 4 — build + cluster + report ────────────────────────────────────
print("== build ==", flush=True)
from graphify.build import build_from_json
from graphify.cluster import cluster, score_all
from graphify.analyze import god_nodes, surprising_connections, suggest_questions
from graphify.report import generate
from graphify.export import to_json

G = build_from_json(merged, root=str(ROOT), directed=False)
if G.number_of_nodes() == 0:
    print("ERRO: grafo vazio", flush=True)
    sys.exit(1)

communities = cluster(G)
cohesion = score_all(G, communities)
tokens = {"input": merged["input_tokens"], "output": merged["output_tokens"]}
gods = god_nodes(G)
surprises = surprising_connections(G, communities)
labels = {cid: "Community " + str(cid) for cid in communities}
questions = suggest_questions(G, communities, labels)

# grafo novo e menor de proposito (painel_demo e docs sairam) -> shrink guard off
os.environ["GRAPHIFY_FORCE"] = "1"
gj = OUT / "graph.json"
if gj.exists():
    gj.unlink()
to_json(G, communities, str(gj))

report = generate(G, communities, cohesion, labels, gods, surprises, det, tokens,
                  str(ROOT), suggested_questions=questions)
(OUT / "GRAPH_REPORT.md").write_text(report, encoding="utf-8")
(OUT / ".graphify_analysis.json").write_text(json.dumps({
    "communities": {str(k): v for k, v in communities.items()},
    "cohesion": {str(k): v for k, v in cohesion.items()},
    "gods": gods, "surprises": surprises, "questions": questions,
}, indent=2, ensure_ascii=False), encoding="utf-8")

print(f"GRAFO: {G.number_of_nodes()} nos, {G.number_of_edges()} arestas, "
      f"{len(communities)} comunidades", flush=True)

# ── 4.5 — health check ────────────────────────────────────────────────────
from graphify.diagnostics import diagnose_extraction, format_diagnostic_report
summary = diagnose_extraction(merged, directed=False, root=str(ROOT))
print(format_diagnostic_report(summary), flush=True)

print("== FIM ==", flush=True)
