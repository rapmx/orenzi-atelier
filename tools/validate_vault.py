"""Valida o vault: wikilinks quebrados e notas orfas.

Link quebrado e erro. Nota orfa e aviso — uma nota que ninguem referencia nao
esta errada, mas nao vai ser encontrada, que da no mesmo.

Saida: PASS / FAIL. Nao chama LLM.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VAULT = ROOT / "vault"

if not VAULT.exists():
    print("FAIL: vault/ nao existe")
    sys.exit(1)

WIKILINK = re.compile(r"\[\[([^\]\|]+?)(?:\|[^\]]+)?\]\]")
# README e ponto de entrada; ninguem precisa apontar pra ele
ISENTAS_DE_ORFA = {"README"}

notas = {p.stem: p for p in VAULT.rglob("*.md")}
quebrados, apontadas, total = {}, set(), 0

for stem, p in notas.items():
    texto = p.read_text(encoding="utf-8")
    for m in WIKILINK.finditer(texto):
        alvo = m.group(1).strip().rstrip("\\")
        total += 1
        apontadas.add(alvo)
        if alvo not in notas:
            quebrados.setdefault(alvo, []).append(p.name)

orfas = sorted(s for s in notas if s not in apontadas and s not in ISENTAS_DE_ORFA)

print(f"vault: {len(notas)} notas, {total} wikilinks")
print()

if quebrados:
    print(f"links quebrados: {len(quebrados)}")
    for alvo, origens in sorted(quebrados.items()):
        print(f"  [[{alvo}]]  <- {sorted(set(origens))}")
else:
    print("links quebrados: nenhum")

print()
if orfas:
    print(f"notas orfas (ninguem aponta): {len(orfas)}")
    for o in orfas:
        print("  -", o)
else:
    print("notas orfas: nenhuma")

print()
if quebrados or orfas:
    print("RESULTADO: FAIL")
    sys.exit(1)
print("RESULTADO: PASS")
