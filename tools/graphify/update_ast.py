"""Atualizacao BARATA do grafo: re-extrai o AST e reaproveita a semantica ja
extraida em .graphify_semantic.json. Nenhuma chamada de LLM, custo zero.

Use depois de mudar codigo. Rode `derive_js.py` ANTES, senao o AST le o JS
velho dos sidecars.

Para uma rodada completa (com semantica nova, ~71k tokens de Gemini), use
`run_graphify.py` — mas so quando um HTML mudar de estrutura.
"""
import json, os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]   # raiz do repo
OUT = ROOT / "graphify-out"
os.chdir(ROOT)

from graphify.detect import detect

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
    if len(parts) >= 2 and parts[0] == "app" and parts[1] == "assets":
        return False
    return True


files = det.get("files", {})
for k in list(files):
    files[k] = [f for f in files[k] if keep(f)]

derived = sorted((OUT / "derived").glob("*.js"))
files.setdefault("code", []).extend(str(p) for p in derived)

words = 0
for v in files.values():
    for f in v:
        try:
            words += len(Path(f).read_text(encoding="utf-8", errors="ignore").split())
        except Exception:
            pass
det["total_words"] = words
det["total_files"] = sum(len(v) for v in files.values())
(OUT / ".graphify_detect.json").write_text(json.dumps(det, ensure_ascii=False), encoding="utf-8")
print(f"corpus: {det['total_files']} arquivos, ~{words} palavras", flush=True)

# ── AST (deterministico, sem LLM) ─────────────────────────────────────────
from graphify.extract import collect_files, extract

code_files = []
for f in files.get("code", []):
    p = Path(f)
    code_files.extend(collect_files(p) if p.is_dir() else [p])

ast = extract(code_files, cache_root=ROOT) if code_files else {
    "nodes": [], "edges": [], "input_tokens": 0, "output_tokens": 0}
(OUT / ".graphify_ast.json").write_text(json.dumps(ast, indent=2, ensure_ascii=False),
                                        encoding="utf-8")
print(f"AST: {len(ast['nodes'])} nos, {len(ast['edges'])} arestas", flush=True)

# ── semantica: REAPROVEITADA, nao re-extraida ─────────────────────────────
sem_path = OUT / ".graphify_semantic.json"
sem = json.loads(sem_path.read_text(encoding="utf-8")) if sem_path.exists() else {
    "nodes": [], "edges": [], "hyperedges": [], "input_tokens": 0, "output_tokens": 0}
print(f"semantica reaproveitada: {len(sem['nodes'])} nos (0 token gasto)", flush=True)

# ── merge ─────────────────────────────────────────────────────────────────
seen = {n["id"] for n in ast["nodes"]}
merged_nodes = list(ast["nodes"])
for n in sem["nodes"]:
    if n["id"] not in seen:
        merged_nodes.append(n)
        seen.add(n["id"])

(OUT / ".graphify_extract.json").write_text(json.dumps({
    "nodes": merged_nodes,
    "edges": ast["edges"] + sem["edges"],
    "hyperedges": sem.get("hyperedges", []),
    "input_tokens": sem.get("input_tokens", 0),
    "output_tokens": sem.get("output_tokens", 0),
}, indent=2, ensure_ascii=False), encoding="utf-8")

print(f"merge: {len(merged_nodes)} nos, {len(ast['edges']) + len(sem['edges'])} arestas")
print("\nAgora rode: bridge_edges.py e depois rebuild.py")
