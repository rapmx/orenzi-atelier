"""Rebuild do grafo a partir do .graphify_extract.json ja enriquecido."""
import json, os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]   # raiz do repo
OUT = ROOT / "graphify-out"
os.chdir(ROOT)
os.environ["GRAPHIFY_FORCE"] = "1"

from graphify.build import build_from_json
from graphify.cluster import cluster, score_all
from graphify.analyze import god_nodes, surprising_connections, suggest_questions
from graphify.report import generate
from graphify.export import to_json
from graphify.diagnostics import diagnose_extraction, format_diagnostic_report

extraction = json.loads((OUT / ".graphify_extract.json").read_text(encoding="utf-8"))
detection = json.loads((OUT / ".graphify_detect.json").read_text(encoding="utf-8"))

G = build_from_json(extraction, root=str(ROOT), directed=False)

# ── Clusterizar so quando o conjunto de nos mudou ─────────────────────────
# `cluster()` nao e deterministico entre rodadas: reclusterizar um grafo
# identico produz particao diferente, os ids de comunidade mudam e os nomes
# (que custaram LLM) se perdem. Se nenhum no entrou nem saiu, a particao
# anterior continua valendo — reaproveita e nao ha churn nenhum.
_analysis_path = OUT / ".graphify_analysis.json"
_analysis_antiga = None
if _analysis_path.exists():
    try:
        _analysis_antiga = json.loads(_analysis_path.read_text(encoding="utf-8"))
    except Exception:
        _analysis_antiga = None

communities, CLUSTER_STATUS = None, ""
if _analysis_antiga:
    antigas_com = _analysis_antiga.get("communities", {})
    nos_antigos = {n for membros in antigas_com.values() for n in membros}
    if nos_antigos == set(G.nodes()):
        communities = {int(k): v for k, v in antigas_com.items()}
        CLUSTER_STATUS = "reaproveitado (conjunto de nos identico)"

if communities is None:
    communities = cluster(G)
    CLUSTER_STATUS = "recalculado (o conjunto de nos mudou)"

cohesion = score_all(G, communities)
tokens = {"input": extraction.get("input_tokens", 0),
          "output": extraction.get("output_tokens", 0)}
gods = god_nodes(G)
surprises = surprising_connections(G, communities)

# ── Nomes das comunidades: MIGRADOS por sobreposicao, nunca regerados ─────
# Nomear comunidade custa LLM, e este script e o caminho barato — ele nunca
# renomeia. O problema: casar por id nao funciona, porque o id da comunidade
# nao e estavel entre rodadas de clustering (medido: 39 comunidades pelo
# `graphify label`, 46 por `cluster()` aqui). Casar por id trocaria os nomes
# uns pelos outros, que e pior que placeholder.
#
# Entao a migracao e por CONTEUDO: cada comunidade nova herda o nome da
# comunidade antiga com que ela mais compartilha nos. Exige >= 50% de
# sobreposicao — abaixo disso o nome herdado seria chute.
placeholder = {cid: "Community " + str(cid) for cid in communities}


def _carregar_nomes_antigos():
    lp, ap = OUT / ".graphify_labels.json", OUT / ".graphify_analysis.json"
    if not (lp.exists() and ap.exists()):
        return None
    try:
        nomes = {str(k): v for k, v in json.loads(lp.read_text(encoding="utf-8")).items()}
        antigo = json.loads(ap.read_text(encoding="utf-8")).get("communities", {})
        return {cid: (nomes.get(str(cid), ""), set(membros))
                for cid, membros in antigo.items()
                if nomes.get(str(cid)) and not nomes[str(cid)].startswith("Community ")}
    except Exception:
        return None


antigas = _carregar_nomes_antigos()
labels, herdados = dict(placeholder), 0

if antigas:
    # comunidade nova -> conjunto de nos
    novas = {}
    for cid, membros in communities.items():
        novas[cid] = set(membros) if isinstance(membros, (list, set, tuple)) else {membros}

    usados = set()
    for cid, nos in novas.items():
        melhor, melhor_score = None, 0.0
        for acid, (nome, anos) in antigas.items():
            if nome in usados or not nos:
                continue
            score = len(nos & anos) / len(nos)
            if score > melhor_score:
                melhor, melhor_score = nome, score
        if melhor and melhor_score >= 0.5:
            labels[cid] = melhor
            usados.add(melhor)
            herdados += 1

if herdados:
    LABELS_STATUS = (f"{herdados}/{len(communities)} migrados por sobreposicao "
                     f"(0 token gasto)")
    if herdados < len(communities):
        LABELS_STATUS += (f"; {len(communities) - herdados} sem nome — rode "
                          f"`graphify label . --backend gemini` se quiser nomea-los")
else:
    LABELS_STATUS = ("PLACEHOLDER — sem nomes anteriores pra migrar; rode "
                     "`graphify label . --backend gemini` (custa LLM)")

questions = suggest_questions(G, communities, labels)

gj = OUT / "graph.json"
if gj.exists():
    gj.unlink()
to_json(G, communities, str(gj))

report = generate(G, communities, cohesion, labels, gods, surprises, detection,
                  tokens, str(ROOT), suggested_questions=questions)
(OUT / "GRAPH_REPORT.md").write_text(report, encoding="utf-8")
(OUT / ".graphify_analysis.json").write_text(json.dumps({
    "communities": {str(k): v for k, v in communities.items()},
    "cohesion": {str(k): v for k, v in cohesion.items()},
    "gods": gods, "surprises": surprises, "questions": questions,
}, indent=2, ensure_ascii=False), encoding="utf-8")

# Rechaveia os nomes para os ids NOVOS. Sem isso a proxima rodada leria um
# labels.json com ids da rodada passada contra o analysis desta, e a migracao
# por sobreposicao nao teria de onde partir.
(OUT / ".graphify_labels.json").write_text(
    json.dumps({str(k): v for k, v in labels.items()}, ensure_ascii=False),
    encoding="utf-8")

print(f"GRAFO: {G.number_of_nodes()} nos, {G.number_of_edges()} arestas, "
      f"{len(communities)} comunidades")
print(f"CLUSTER: {CLUSTER_STATUS}")
print(f"NOMES: {LABELS_STATUS}")
