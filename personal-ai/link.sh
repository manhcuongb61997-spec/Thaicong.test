#!/bin/sh
set -eu
ROOT=$(CDPATH= cd -- "$(dirname "$0")" && pwd)
mkdir -p "$HOME/.gemini/config"
ln -sfn "$ROOT/GEMINI.md" "$HOME/.gemini/GEMINI.md"
ln -sfn "$ROOT/.agents/skills" "$HOME/.gemini/config/skills"
ln -sfn "$ROOT/.agents/agents" "$HOME/.gemini/config/agents"
ln -sfn "$ROOT/.agents/rules" "$HOME/.gemini/config/rules"
ln -sfn "$ROOT/.agents/mcp_config.json" "$HOME/.gemini/config/mcp_config.json"
printf 'Đã nối %s vào ~/.gemini\n' "$ROOT"
