$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Gemini = Join-Path $env:USERPROFILE ".gemini"
$Config = Join-Path $Gemini "config"
New-Item -ItemType Directory -Force -Path $Config | Out-Null
New-Item -ItemType SymbolicLink -Force -Path (Join-Path $Gemini "GEMINI.md") -Target (Join-Path $Root "GEMINI.md") | Out-Null
New-Item -ItemType SymbolicLink -Force -Path (Join-Path $Config "skills") -Target (Join-Path $Root ".agents/skills") | Out-Null
New-Item -ItemType SymbolicLink -Force -Path (Join-Path $Config "agents") -Target (Join-Path $Root ".agents/agents") | Out-Null
New-Item -ItemType SymbolicLink -Force -Path (Join-Path $Config "rules") -Target (Join-Path $Root ".agents/rules") | Out-Null
New-Item -ItemType SymbolicLink -Force -Path (Join-Path $Config "mcp_config.json") -Target (Join-Path $Root ".agents/mcp_config.json") | Out-Null
Write-Output "Đã nối $Root vào $Gemini"
