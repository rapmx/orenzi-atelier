"""Injeta as arestas JS -> Supabase que o AST nao consegue ver.

Problema: `sb.rpc('get_busy_slots')` e uma STRING para o parser de JS. O AST
extrai a chamada `rpc()`, nunca o alvo. Resultado: o grafo ficava com duas
ilhas — todo o front de um lado, todas as RPCs/migrations do outro — e
perguntas como "quem chama create_public_booking_orchestrated" nao tinham
resposta, que e justamente o que se quer de um grafo aqui.

Estas arestas sao EXTRACTED, nao inferidas: o nome do alvo esta literalmente
no fonte. O que o script faz e so casar a string com o no que ja existe.

Roda sobre .graphify_extract.json, ANTES do build.
"""
import json, re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]   # raiz do repo
OUT = ROOT / "graphify-out"

SCAN = sorted((OUT / "derived").glob("*.js")) + [
    ROOT / "supabase/functions/booking-orchestrator/index.ts",
    ROOT / "supabase/functions/stripe-webhook/index.ts",
]

RPC_RE = re.compile(r"""\.rpc\(\s*['"]([a-zA-Z0-9_]+)['"]""")
INVOKE_RE = re.compile(r"""\.functions\.invoke\(\s*['"]([a-zA-Z0-9_-]+)['"]""")
FROM_RE = re.compile(r"""\.from\(\s*['"]([a-zA-Z0-9_]+)['"]""")
# declaracao de funcao: function foo(  |  const foo = (  |  async function foo(
DECL_RE = re.compile(
    r"^\s*(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(|"
    r"^\s*(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?\(",
    re.MULTILINE,
)

extract = json.loads((OUT / ".graphify_extract.json").read_text(encoding="utf-8"))
nodes = extract["nodes"]
# idempotente: tira as pontes da rodada anterior antes de injetar de novo
extract["edges"] = [e for e in extract["edges"]
                    if e.get("context") != "supabase-bridge"]

# label -> [ids].  Um mesmo public.foo() pode existir em varias migrations
# (criada e depois redefinida); ligar a todas e o comportamento honesto.
by_label = {}
for n in nodes:
    lbl = (n.get("label") or "").strip()
    if lbl:
        by_label.setdefault(lbl, []).append(n["id"])

# no de arquivo por caminho relativo
file_node = {}
for n in nodes:
    sf = str(n.get("source_file") or "")
    lbl = (n.get("label") or "")
    if sf and (lbl.endswith(".js") or lbl.endswith(".ts") or lbl.endswith(".sql")):
        file_node.setdefault(sf, n["id"])

EDGE_FN_FILE = {
    "booking-orchestrator": "supabase/functions/booking-orchestrator/index.ts",
    "stripe-webhook": "supabase/functions/stripe-webhook/index.ts",
    "send-appointment-email": None,   # ativa em producao, sem fonte no repo
}

new_edges, unresolved = [], []


def body_end(text, from_pos):
    """Offset do `}` que fecha o primeiro `{` a partir de from_pos."""
    i = text.find("{", from_pos)
    if i < 0:
        return None
    depth = 0
    while i < len(text):
        c = text[i]
        if c == "{":
            depth += 1
        elif c == "}":
            depth -= 1
            if depth == 0:
                return i
        i += 1
    return None


def decls(text):
    """[(ini, fim, nome)] por casamento de chaves.

    Nao basta pegar a declaracao anterior mais proxima: no stripe-webhook o
    `rpc('handle_stripe_event')` mora dentro do `Deno.serve(...)` e a decl
    anterior e `sendEmail()`, que ja fechou. Isso creditava a chamada a quem
    nao a faz — aresta errada, que e pior que aresta faltando.
    """
    out = []
    for m in DECL_RE.finditer(text):
        name = m.group(1) or m.group(2)
        end = body_end(text, m.end() - 1)
        if end:
            out.append((m.start(), end, name))
    return out


def caller_at(declarations, pos):
    """Funcao MAIS INTERNA que contem pos."""
    best, best_span = None, None
    for ini, fim, name in declarations:
        if ini <= pos <= fim:
            span = fim - ini
            if best_span is None or span < best_span:
                best, best_span = name, span
    return best


for path in SCAN:
    if not path.exists():
        continue
    rel = str(path.resolve().relative_to(ROOT.resolve())).replace("\\", "/")
    text = path.read_text(encoding="utf-8", errors="ignore")
    ds = decls(text)
    src_file_id = file_node.get(rel)

    def resolve_caller(pos):
        line = text[:pos].count("\n") + 1
        fname = caller_at(ds, pos)
        if fname:
            for cand in (f"{fname}()", fname):
                if cand in by_label:
                    for nid in by_label[cand]:
                        for n in nodes:
                            if n["id"] == nid and str(n.get("source_file") or "") == rel:
                                return nid, line
        return src_file_id, line

    for rx, kind in ((RPC_RE, "rpc"), (INVOKE_RE, "invoke"), (FROM_RE, "table")):
        for m in rx.finditer(text):
            name = m.group(1)
            caller, line = resolve_caller(m.start())
            if not caller:
                continue

            if kind == "rpc":
                targets = by_label.get(f"public.{name}()", [])
                rel_name = "calls_rpc"
            elif kind == "table":
                targets = by_label.get(f"public.{name}", [])
                rel_name = "queries_table"
            else:
                tf = EDGE_FN_FILE.get(name)
                targets = [file_node[tf]] if tf and tf in file_node else []
                rel_name = "invokes_edge_function"

            if not targets:
                unresolved.append((rel, line, kind, name))
                continue

            for t in targets:
                if t == caller:
                    continue
                new_edges.append({
                    "source": caller,
                    "target": t,
                    "relation": rel_name,
                    "context": "supabase-bridge",
                    "verification": "EXTRACTED",
                    "source_file": rel,
                    "source_location": f"L{line}",
                })

# dedup
seen, deduped = set(), []
for e in new_edges:
    k = (e["source"], e["target"], e["relation"])
    if k not in seen:
        seen.add(k)
        deduped.append(e)

extract["edges"] = extract["edges"] + deduped
(OUT / ".graphify_extract.json").write_text(
    json.dumps(extract, indent=2, ensure_ascii=False), encoding="utf-8")

print(f"arestas-ponte injetadas: {len(deduped)}")
kinds = {}
for e in deduped:
    kinds[e["relation"]] = kinds.get(e["relation"], 0) + 1
print("  por tipo:", kinds)
if unresolved:
    uniq = sorted({(k, n) for _, _, k, n in unresolved})
    print(f"  NAO resolvidas ({len(uniq)} alvos sem no correspondente):")
    for k, n in uniq:
        print(f"    [{k}] {n}")
