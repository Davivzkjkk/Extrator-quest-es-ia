# Exam Organization Workflow

Coordena a extração, organização e visualização de provas com imagens associadas automaticamente.

## Workflow Steps

### 1. **PDF Upload & Detection** 
- User uploads PDF via UI
- `/api/extract` receives file
- Backend spawns `pdf_vision_engine_v2.py`

### 2. **Exam Boundary Detection**
- Analyzer scans PDF for exam divisions (natural breaks in content)
- Identifies which pages belong to which exam
- Stores page ranges in exam metadata

### 3. **Question Extraction (Gemini Vision)**
- Per-page OCR via Gemini 2.5 Flash
- Extracts: question text, options, question type
- Assigns ID: `exam_{X}_q_{N}` 
- Filters non-questions (instructions, headers)

### 4. **Smart Image Association**
- For each question, Gemini analyzes page layout
- Identifies if relevant images/diagrams/tables exist
- Describes image type + relevance
- Stores reference + crop coordinates

###  5. **Image Cropping & Storage**
- Extracts relevant image regions using PIL
- Saves as `/snippets/e_{exam_id}_q_{q_id}_{type}.png`
- Stores in JSON: `imagens_associadas[]`

### 6. **JSON Structure Creation**
```json
{
  "exames": [
    {
      "id": "exam_1",
      "titulo": "Português & Geografia", 
      "paginas": [1,2,3],
      "questoes": ["q1", "q2", ...],
      "total_questoes": 15
    }
  ],
  "questoes": [
    {
      "id": "e1_q1",
      "numero": 1,
      "texto": "...",
      "opcoes": [...],
      "imagens_associadas": [
        {
          "id": "img_e1_q1_mapa",
          "tipo": "mapa",
          "descricao": "Mapa da Amazônia",
          "caminho": "/snippets/e1_q1_map.png"
        }
      ]
    }
  ]
}
```

### 7. **Frontend Rendering**
- `<ExamTabs />` component displays exam tabs
- Auto-switches between exam/dashboard views
- Shows images inline with questions
- Click-to-expand image gallery

## Key Technologies

| Component | Tech |
|-----------|------|
| PDF Processing | PyMuPDF (fitz) |
| Vision/OCR | Gemini 2.5 Flash |
| Image Processing | PIL/Pillow |
| Exam Boundary Detection | Text analysis + heuristics |
| Frontend | Next.js 15 + React 19 |
| Images | NextImage + lazy loading |

## Files Modified/Created

- `pdf_vision_engine_v2.py` - Enhanced extractor with exam + image support
- `src/components/ExamTabs.tsx` - Tab-based exam viewer
- `src/components/QuestionCard.tsx` - Updated with image display
- `src/components/DataViewer.tsx` - Smart view mode selector
- `.agent/skills/exam-organizer/SKILL.md` - This workflow doc

## Next Steps

1. Test with sample exam PDFs
2. Refine exam boundary detection (might need manual config)
3. Improve image association accuracy
4. Add export to PDF/DOCX with organized layout
5. Implement caching for large PDFs
