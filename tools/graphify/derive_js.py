"""Extrai o <script> inline de cada HTML do Orenzi para um .js derivado.

Motivo: o graphify classifica .html como DOCUMENTO (extracao semantica por LLM)
e nunca passa AST nele. Como todo o JS do Orenzi vive inline dentro do HTML, o
grafo ficava sem nenhuma das ~500 funcoes do painel. O sidecar derivado da ao
AST uma superficie de codigo real para parsear.

Os arquivos derivados sao ARTEFATO, nunca fonte: vivem em graphify-out/derived/
(ja ignorado pelo git) e sao regerados a cada rodada. Editar o HTML, nunca eles.
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]   # raiz do repo
DERIVED = ROOT / "graphify-out" / "derived"
DERIVED.mkdir(parents=True, exist_ok=True)

SOURCES = [
    "app/painel.html",
    "app/agendar.html",
    "app/gerenciar.html",
    "app/index.html",
]

SCRIPT_RE = re.compile(
    r"<script\b(?P<attrs>[^>]*)>(?P<body>.*?)</script>", re.DOTALL | re.IGNORECASE
)

for rel in SOURCES:
    src = ROOT / rel
    html = src.read_text(encoding="utf-8", errors="ignore")
    chunks = []
    for m in SCRIPT_RE.finditer(html):
        attrs = m.group("attrs") or ""
        # <script src="..."> nao tem corpo util; type="application/json" nao e codigo
        if "src=" in attrs.lower():
            continue
        if "json" in attrs.lower():
            continue
        body = m.group("body")
        if body.strip():
            line = html[: m.start()].count("\n") + 1
            chunks.append(f"// ── {rel} · <script> na linha {line} ──\n{body}")

    if not chunks:
        print(f"{rel}: nenhum script inline")
        continue

    out = DERIVED / (Path(rel).stem + ".js")
    header = (
        f"// DERIVADO DE {rel} — NAO EDITAR.\n"
        f"// Gerado para dar ao AST do graphify uma superficie de codigo real.\n"
        f"// A fonte de verdade e {rel}.\n\n"
    )
    out.write_text(header + "\n\n".join(chunks), encoding="utf-8")
    n_funcs = len(re.findall(r"\bfunction\s+[A-Za-z_$]", out.read_text(encoding="utf-8")))
    print(f"{rel} -> {out.name}: {len(chunks)} bloco(s), "
          f"{out.stat().st_size // 1024} KB, ~{n_funcs} funcoes")
