Write-Host "--- MILI-EXTRA PREMIUM SETUP ---" -ForegroundColor Cyan
Write-Host "1. Instalando Dependências do Next.js (npm)..."
npm install --legacy-peer-deps

Write-Host "2. Verificando Ambiente Python e criando Venv (Herdando pacotes)..."
python -m venv --system-site-packages .venv

# Detectar se o venv usa bin (MSYS2/Linux) ou Scripts (Windows Native)
$activatePath = ".\.venv\Scripts\Activate.ps1"
if (!(Test-Path $activatePath)) { $activatePath = ".\.venv\bin\Activate.ps1" }

Write-Host "Ativando ambiente: $activatePath"
. $activatePath

Write-Host "3. Instalando dependências no Ambiente Virtual..."
python -m pip install --upgrade pip
python -m pip install google-generativeai

Write-Host "4. Criando Pastas de Armazenamento..."
if (!(Test-Path "public/data")) { New-Item -ItemType Directory -Path "public/data" }
if (!(Test-Path "public/snippets")) { New-Item -ItemType Directory -Path "public/snippets" }

Write-Host "Tudo pronto! Para Rodar a Extração:" -ForegroundColor Green
Write-Host "1. .\.venv\Scripts\Activate.ps1"
Write-Host "2. python pdf_vision_engine.py"
