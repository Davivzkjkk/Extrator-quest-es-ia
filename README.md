# 📚 Exam Question Extractor - Intelligent Organization System

A smart system for extracting and organizing military exam questions with automatic image association powered by Gemini Vision.

## 🎯 Key Features

### ✨ New: Exam Tab Organization
- **Automatic Exam Detection**: Intelligently divides PDFs into separate exams
- **Smart Image Association**: Gemini identifies which images each question needs
- **Auto-Cropping**: Extracts only relevant image regions
- **Tab-Based UI**: Clean interface with exam tabs

### 📋 Question Extraction
- Extracts 40+ questions per exam
- Auto-removes headers and instructions
- Preserves tables, charts, and diagrams
- Native LaTeX/MathJax support

### 🔗 Shared Contexts
- Detects support text used across multiple questions
- Automatically links questions to contexts
- Eliminates content duplication

### 🖼️ Image Management
- Intelligent detection via Gemini Vision
- Automatic cropping of relevant areas
- Organized storage by exam/question

## 🏗️ Architecture

```
PDF Upload
   ↓
[pdf_vision_engine_v2.py]
   ├─ Detect Exam Boundaries
   ├─ Extract Questions (Gemini Vision)
   ├─ Find Relevant Images
   ├─ Crop Images (PIL)
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
   ├─ ExamTabs Component (NEW!)    - Tab-based view
   ├─ QuestionCard                 - With images
   ├─ RichText Renderer            - LaTeX support
   └─ DataViewer                   - Auto-switches modes
```

## 📁 JSON Structure (Hierarchical)

```json
{
  "exames": [
    {
      "id": "exam_1",
      "titulo": "Portuguese & Geography",
      "paginas": [1, 2, 3],
      "questoes": ["q1", "q2", "q3"],
      "total_questoes": 3
    }
  ],
  "questoes": [
    {
      "id": "e1_q1",
      "numero": 1,
      "texto": "What is...",
      "opcoes": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "imagens_associadas": [
        {
          "id": "img_e1_q1_map",
          "tipo": "map",
          "descricao": "Amazon Region Map",
          "caminho": "/snippets/e1_q1_map.png"
        }
      ]
    }
  ]
}
```

## 🚀 How to Use

### Mode 1: Exam Tabs (NEW - Recommended!)
```
1. Upload PDF → System auto-detects exams
2. Click tabs to navigate between exams
3. Questions already grouped by exam
4. Images appear inline (if detected)
```

### Mode 2: Classic Dashboard View
```
1. Upload PDF → Extraction
2. Search by number/text
3. All data in 2D cards
4. Images in separate gallery
```

## 🤖 .agent Framework Integration

Project uses `.agent` framework with specialists:

### Skills
- **exam-organizer**: Hierarchical organization of exams and images
- **backend-specialist**: API Routes + PDF processing
- **frontend-specialist**: React components + UI polish

### Agents
- **exam-validator**: Validates extraction quality
- **orchestrator**: Coordinates full pipeline

### Workflows
- **exam-organization**: Complete extraction → rendering pipeline

## 🔧 Installation & Setup

```bash
# Clone repo
git clone https://github.com/Davivzkjkk/Extrator-quest-es-ia.git
cd "Extrator de Questões - Miliatres"

# Python Environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install google-generativeai pymupdf pillow

# Frontend
npm install
npm run dev
```

**Environment Variables:**
```env
GEMINI_API_KEY=your_api_key_here
```

## 📊 Technology Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Python + PyMuPDF + Gemini 2.5 Flash |
| **API** | Next.js App Router |
| **Frontend** | React 19 + Tailwind CSS + Framer Motion |
| **Rendering** | react-markdown + KaTeX |
| **Version Control** | Git + GitHub |

## 🎨 UI Components

- `<ExamTabs />` - Tabbed exam viewer (NEW!)
- `<QuestionCard />` - Question display with images
- `<RichText />` - Markdown + LaTeX renderer
- `<DataViewer />` - Smart view mode selector

## 🔄 Data Flow

```
User Uploads PDF
    ↓
Spawn pdf_vision_engine_v2.py
    ↓
Gemini Analyzes Pages → Detects Questions + Exams + Images
    ↓
PIL Crops Images to Regions
    ↓
Generate Hierarchical JSON
    ↓
Save to public/data/questions.json
    ↓
Frontend Fetches + Renders
    ↓
ExamTabs Displays with Image Gallery
```

## ✅ Quality Validation

System validates:
- ✓ Questions have 4 options
- ✓ Unique IDs per question
- ✓ Referenced images exist
- ✓ Valid JSON schema
- ✓ Contexts linked correctly
- ✓ Image paths resolve

## 🐛 Troubleshooting

**Images not appearing?**
- Ensure `gemini-2.5-flash` detects images on page
- Check `/public/snippets/` directory exists
- Verify image file permissions

**PDF extraction fails?**
- Validate PDF format and integrity
- Try: `pip install --upgrade pymupdf`
- Verify GEMINI_API_KEY is set correctly

**Exams not dividing properly?**
- Exam boundary detection is heuristic-based
- For custom divisions, edit `_detect_exam_boundaries()` in `pdf_vision_engine_v2.py`
- Consider using ML-based page break detection

## 📈 Performance

- **Extraction Time**: ~2-5s per page (depends on image count)
- **Image Processing**: Parallel crop + store operations
- **JSON Generation**: < 100ms
- **Frontend Rendering**: < 500ms (50+ questions)

## 📝 Future Enhancements

- [ ] Automatic answer key detection
- [ ] Discursive question support
- [ ] Export to PDF/DOCX with layout
- [ ] Large PDF caching
- [ ] Manual image association UI
- [ ] Enhanced OCR with EasyOCR
- [ ] Batch PDF processing
- [ ] Question bank analytics

## 📄 License

MIT License - Free to use and modify

## 🤝 Contributing

Pull requests welcome! For major changes, please open an issue first.

## 📞 Support

For issues or questions:
1. Check the [GitHub Issues](https://github.com/Davivzkjkk/Extrator-quest-es-ia/issues)
2. Review documentation in `.agent/` folder
3. Check `pdf_vision_engine_v2.py` comments

---

**Built with ❤️ using Gemini Vision AI + Next.js 15**

*Last Updated: 2025*
