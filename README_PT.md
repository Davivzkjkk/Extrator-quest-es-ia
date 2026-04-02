# 📚 Extrator de Questões - Sistema de Organização por Provas

Sistema inteligente de extração e organização de questões de provas militares com associação automática de imagens.

## 🎯 Funcionalidades Principais

### ✨ Novo: Organização por Abas de Provas
- **Provas Organizadas**: Detecta automaticamente divisões de provas no PDF
- **Associação de Imagens**: Gemini identifica qual imagem cada questão precisa
- **Recorte Automático**: Extrai apenas as áreas relevantes das imagens
- **Visualização em Abas**: Interface limpa com abas por prova

### 📋 Extração de Questões
- Extrai 40+ questões por prova
- Remove instruções e cabeçalhos automaticamente
- Preserva tabelas, gráficos e imagens
- Suporta LaTeX/MathJax nativo

### 🔗 Contextos Compartilhados
- Detecta textos de apoio usados em múltiplas questões
- Vincula questões ao contexto automaticamente
- Evita duplicação de conteúdo

### 🖼️ Gestão de Imagens
- Detecção inteligente via Gemini Vision
- Cropping automático de áreas relevantes
- Armazenamento organizado por prova/questão

## 🏗️ Arquitetura

```
PDF Upload
   ↓
[pdf_vision_engine_v2.py]
   ├─ Detect Exam Boundaries
   ├─ Extract Questions (Gemini Vision)
   ├─ Find Relevant Images
   ├─ Crop Images
   └─ Generate Hierarchical JSON
   ↓
[JSON Structure]
{
  "exames": [...],        // Organized by exam
  "questoes": [...],      // All questions
  "textos_compartilhados": [...]  // Shared contexts
}
   ↓
Frontend (Next.js 15)
   ├─ ExamTabs Component (NOVO!)  - Tab-based view
   ├─ QuestionCard                - With images
   ├─ RichText Renderer           - LaTeX support
   └─ DataViewer                  - Auto-switches modes
```

## 📁 Estrutura JSON (Nova)

```json
{
  "exames": [
    {
      "id": "exam_1",
      "titulo": "Português & Geografia",
      "paginas": [1, 2, 3],
      "questoes": ["q1", "q2", "q3"],
      "total_questoes": 3
    }
  ],
  "questoes": [
    {
      "id": "e1_q1",
      "numero": 1,
      "texto": "Qual...",
      "opcoes": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "imagens_associadas": [
        {
          "id": "img_e1_q1_map",
          "tipo": "mapa",
          "descricao": "Mapa da Amazônia",
          "caminho": "/snippets/e1_q1_map.png"
        }
      ]
    }
  ]
}
```

## 🚀 Como Usar

### Modo 1: Com Abas por Provas (NOVO - Recomendado!)
```
1. Upload PDF → Sistema detecta provas automaticamente
2. Clique em abas para navegar entre provas
3. Questões já agrupadas por prova
4. Imagens aparecem inline (se detectadas)
```

### Modo 2: Visualização Clássica
```
1. Upload PDF → Extraction
2. Busque por número/texto
3. Todos os dados em cards 2D
4. Imagens em galeria separada
```

## 🤖 Uso do .agent Framework

O projeto usa o framework `.agent` com especialistas:

### Skills
- **exam-organizer**: Organiza provas e imagens hierarquicamente
- **backend-specialist**: API Routes + PDF processing  
- **frontend-specialist**: React components + UI

### Agents
- **exam-validator**: Valida qualidade de extração
- **orchestrator**: Coordena fluxo completo

### Workflows
- **exam-organization**: Pipeline completo
- Acionável via `/api/extract`

## 🔧 Instalação & Setup

```bash
# Clone repo
git clone https://github.com/Davivzkjkk/Extrator-quest-es-ia.git
cd "Extrator de Questões - Miliatres"

# Ambiente Python
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install google-generativeai pymupdf pillow

# Frontend
npm install
npm run dev
```

**Env Variables:**
```
GEMINI_API_KEY=your_api_key_here
```

## 📊 Stack Técnico

| Layer | Tech |
|-------|------|
| **Backend** | Python + PyMuPDF + Gemini 2.5 Flash |
| **API** | Next.js App Router |
| **Frontend** | React 19 + Tailwind + Framer Motion |
| **Rendering** | react-markdown + KaTeX |
| **Versioning** | Git + GitHub |

## 🎨 UI Components

- `<ExamTabs />` - Tabbed exam viewer (NOVO!)
- `<QuestionCard />` - Question display with images
- `<RichText />` - Markdown + LaTeX renderer
- `<DataViewer />` - Smart view mode selector

## 🔄 Fluxo de Dados

```
User Upload PDF
    ↓
Spawn pdf_vision_engine_v2.py
    ↓
Gemini Analyzes Page → Detects Questions + Exams + Images
    ↓
PIL Crops Images
    ↓
Generate JSON
    ↓
Save to public/data/questions.json
    ↓
Frontend Fetches + Renders
    ↓
ExamTabs Displays with Image Gallery
```

## ✅ Validação

Sistema valida:
- ✓ Questões têm 4 alternativas
- ✓ IDs únicos por questão
- ✓ Imagens referenciadas existem
- ✓ JSON schema válido
- ✓ Contextos linkados corretamente

## 🐛 Troubleshooting

**Imagens não aparecem?**
- Certifique-se `gemini-2.5-flash` identifica imagens na página
- Verifique `/public/snippets/` existe

**PDF não extrai?**
- Valide formato PDF
- Tente `pip install --upgrade pymupdf`
- Verifique GEMINI_API_KEY

**Provas não dividem?**
- Exam boundary detection é heurístico
- Para provas manuais, edite `exam_boundaries` em `pdf_vision_engine_v2.py`

## 📝 Próximas Melhorias

- [ ] Detecção automática de gabarito
- [ ] Suporte a questões discursivas
- [ ] Export para PDF/DOCX mantendo layout
- [ ] Caching para PDFs grandes
- [ ] UI para editar associações de imagens
- [ ] OCR melhorado com EasyOCR

## 📄 Licença

MIT License - Livre para usar e modificar

## 🤝 Contribuindo

Pull requests bem-vindo! Para mudanças maiores, abra uma issue primeiro.

---

**Built with ❤️ using Gemini Vision + Next.js**
