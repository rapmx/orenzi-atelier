<#
.SYNOPSIS
  Atualiza a camada de inteligencia do Orenzi: grafo + validacoes.

.DESCRIPTION
  Um comando so, reproduzivel, para rodar DEPOIS de mudanca estrutural.

  O que ele faz:
    1. regera os sidecars do JS inline (derive_js)
    2. reextrai o AST e reaproveita a semantica ja extraida (update_ast)
    3. injeta as arestas-ponte JS -> Supabase (bridge_edges)
    4. reconstroi graph.json + GRAPH_REPORT.md (rebuild)
    5. valida as cadeias criticas do grafo
    6. valida os wikilinks do vault
    7. procura notas orfas
    8. roda o secret scan sobre o que iria num commit
    9. reporta inconsistencias conhecidas
   10. imprime o resumo e o estado do git

  O que ele NAO faz, de proposito:
    - commit, push, deploy
    - chamar LLM (nomear comunidade custa LLM; os nomes sao REAPROVEITADOS)
    - instalar git hook nem rodar em todo commit

  Se o numero de comunidades mudar, os nomes viram "Community N" e o resumo
  avisa: renomear e um passo MANUAL, porque custa dinheiro.

.PARAMETER SkipGraph
  So valida (vault, secret scan, consistencia). Nao mexe no grafo.

.EXAMPLE
  pwsh -File tools/intel-refresh.ps1
  pwsh -File tools/intel-refresh.ps1 -SkipGraph
#>
[CmdletBinding()]
param(
    [switch]$SkipGraph
)

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $RepoRoot
$env:PYTHONIOENCODING = "utf-8"

$script:Falhas = @()
$script:Passos = @()

function Write-Secao($titulo) {
    Write-Host ""
    Write-Host ("=" * 68) -ForegroundColor DarkGray
    Write-Host "  $titulo" -ForegroundColor Cyan
    Write-Host ("=" * 68) -ForegroundColor DarkGray
}

function Resolve-GraphifyPython {
    # O graphify vive num venv proprio (uv tool). O python do PATH nao tem.
    $marcador = Join-Path $RepoRoot "graphify-out\.graphify_python"
    if (Test-Path $marcador) {
        $p = (Get-Content $marcador -Raw).Trim([char]0xFEFF, ' ', "`r", "`n")
        if (Test-Path $p) { return $p }
    }
    $uv = Get-Command uv -ErrorAction SilentlyContinue
    if ($uv) {
        $dir = (& $uv.Source tool dir 2>$null)
        if ($dir) {
            $p = Join-Path $dir.Trim() "graphifyy\Scripts\python.exe"
            if (Test-Path $p) { return $p }
        }
    }
    $py = Get-Command python -ErrorAction SilentlyContinue
    if ($py) { return $py.Source }
    return $null
}

function Invoke-Passo {
    param([string]$Nome, [string]$Script, [switch]$Critico)
    Write-Host ""
    Write-Host "-- $Nome" -ForegroundColor Yellow
    & $Python $Script
    $code = $LASTEXITCODE
    if ($code -ne 0) {
        $script:Passos += [pscustomobject]@{ Nome = $Nome; Status = "FAIL" }
        if ($Critico) { $script:Falhas += $Nome }
    } else {
        $script:Passos += [pscustomobject]@{ Nome = $Nome; Status = "PASS" }
    }
}

$Python = Resolve-GraphifyPython
if (-not $Python) {
    Write-Host "ERRO: nao achei um Python com o graphify instalado." -ForegroundColor Red
    Write-Host 'Instale com: uv tool install --upgrade "graphifyy[sql,gemini]"'
    exit 1
}

Write-Host ""
Write-Host "ORENZI - INTELLIGENCE REFRESH" -ForegroundColor Green
Write-Host "repo   : $RepoRoot"
Write-Host "python : $Python"
Write-Host "HEAD   : $(git rev-parse --short HEAD) $(git log -1 --format=%s)"
if ($SkipGraph) { Write-Host "modo   : -SkipGraph (so validacoes)" -ForegroundColor DarkYellow }

# ── 1-4. Grafo (caminho barato, sem LLM) ─────────────────────────────────
if (-not $SkipGraph) {
    Write-Secao "GRAFO - atualizacao barata (sem LLM)"
    $g = Join-Path $PSScriptRoot "graphify"
    Invoke-Passo "sidecars do JS inline"        (Join-Path $g "derive_js.py")    -Critico
    Invoke-Passo "AST + semantica reaproveitada" (Join-Path $g "update_ast.py")  -Critico
    Invoke-Passo "arestas-ponte JS -> Supabase"  (Join-Path $g "bridge_edges.py") -Critico
    Invoke-Passo "rebuild do graph.json"         (Join-Path $g "rebuild.py")      -Critico

    # graph.html e derivado do graph.json e o export NAO chama LLM. Sem isto a
    # visualizacao ficaria descrevendo um grafo que nao existe mais.
    Write-Host ""
    Write-Host "-- visualizacao (graph.html)" -ForegroundColor Yellow
    $graphify = Get-Command graphify -ErrorAction SilentlyContinue
    if ($graphify) {
        # SEM `2>&1`: no PowerShell 5.1 redirecionar stderr de exe nativo
        # embrulha cada linha num ErrorRecord e zera o $?, mesmo com exit 0.
        # O graphify escreve um aviso de versao da skill no stderr sempre.
        & $graphify.Source export html
        $st = if ($LASTEXITCODE -eq 0) { "PASS" } else { "FAIL" }
        if ($st -eq "FAIL") { $script:Falhas += "export do graph.html" }
        $script:Passos += [pscustomobject]@{ Nome = "export do graph.html"; Status = $st }
    } else {
        Write-Host "  graphify nao esta no PATH - graph.html nao foi atualizado" -ForegroundColor DarkYellow
        $script:Passos += [pscustomobject]@{ Nome = "export do graph.html"; Status = "SKIP" }
    }
}

# ── 5. Validacao do grafo ────────────────────────────────────────────────
Write-Secao "VALIDACAO - grafo"
Invoke-Passo "cadeias criticas" (Join-Path $PSScriptRoot "validate_graph.py") -Critico

# ── 6-7. Vault ───────────────────────────────────────────────────────────
Write-Secao "VALIDACAO - vault (links e orfas)"
Invoke-Passo "wikilinks e notas orfas" (Join-Path $PSScriptRoot "validate_vault.py") -Critico

# ── 8. Secret scan ───────────────────────────────────────────────────────
Write-Secao "SEGURANCA - secret scan"
Invoke-Passo "segredos no que iria num commit" (Join-Path $PSScriptRoot "secret_scan.py") -Critico

# ── 9. Inconsistencias conhecidas ────────────────────────────────────────
Write-Secao "CONSISTENCIA - checagens offline"
& $Python (Join-Path $PSScriptRoot "check_consistency.py")

# ── 10. Resumo ───────────────────────────────────────────────────────────
Write-Secao "RESUMO"
foreach ($p in $script:Passos) {
    $cor = if ($p.Status -eq "PASS") { "Green" } else { "Red" }
    Write-Host ("  {0,-6} {1}" -f $p.Status, $p.Nome) -ForegroundColor $cor
}

Write-Host ""
Write-Host "git status:" -ForegroundColor Cyan
git status --short
Write-Host ""
Write-Host "git diff --stat:" -ForegroundColor Cyan
git -c core.safecrlf=false diff --stat 2>$null | Select-Object -Last 6

Write-Host ""
if ($script:Falhas.Count -gt 0) {
    Write-Host "REFRESH: FAIL" -ForegroundColor Red
    foreach ($f in $script:Falhas) { Write-Host "  - $f" -ForegroundColor Red }
    exit 1
}

Write-Host "REFRESH: PASS" -ForegroundColor Green
Write-Host ""
Write-Host "Nada foi commitado, empurrado nem deployado - de proposito." -ForegroundColor DarkGray
Write-Host "Se os nomes das comunidades virarem 'Community N', renomeie a mao"
Write-Host "(custa LLM):  graphify label . --backend gemini"
exit 0
