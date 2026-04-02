# 🚀 Quick Start Guide

## ⚡ 5 Minutos para Começar

### 1️⃣ Pré-requisitos
```bash
✓ Python 3.9+
✓ Node.js 18+
✓ Gemini API Key (get free at ai.google.com)
```

### 2️⃣ Clone & Setup
```bash
# Clone
git clone https://github.com/Davivzkjkk/Extrator-quest-es-ia.git
cd "Extrator de Questões - Miliatres"

# Python environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1  # Windows
source .venv/bin/activate     # Linux/Mac

# Install dependencies
pip install google-generativeai pymupdf pillow

# Frontend
npm install
```

### 3️⃣ Configure Environment
Create `.env.local`:
```env
GEMINI_API_KEY=your_api_key_here
```

### 4️⃣ Start Dev Server
```bash
npm run dev
# Opens http://localhost:3000
```

### 5️⃣ Upload & Extract!
```
1. Go to http://localhost:3000
2. Click "Upload PDF"
3. Select your exam PDF
4. Wait 30-60s for extraction
5. See questions organized by exam tabs! ✨
```

---

## 📖 What Happens Next?

### System Flow
```
Upload PDF
    ↓ (pdf_vision_engine_v2.py)
Detects exams, extracts questions, finds images
    ↓
Saves to public/data/questions.json
    ↓
Frontend loads ExamTabs component
    ↓
You see organized questions with images! 🎉
```

### View Modes
- **Exam Tabs** (NEW) - Questions organized by exam
- **Dashboard** - Classic flat list view
- **Toggle** - Switch between modes anytime

---

## 🎯 First Test

**Test with sample PDF:**
```bash
# Option 1: Use public samples
# Add any exam PDF to: d:\Extrator de Questões - Miliatres\public\samples\

# Option 2: Quick validation
python pdf_vision_engine_v2.py path/to/your/exam.pdf
```

**Expected output:**
```json
{
  "exames": [
    {
      "id": "exam_1",
      "titulo": "Português",
      "total_questoes": 10,
      "questoes": ["e1_q1", "e1_q2", ...]
    }
  ],
  "questoes": [
    {
      "id": "e1_q1",
      "numero": 1,
      "texto": "Question text...",
      "imagens_associadas": [...]
    }
  ]
}
```

---

## 💡 Common Tasks

### Upload a PDF
```bash
# Frontend: Click upload button (http://localhost:3000)
# Or via API:
curl -X POST -F "file=@exam.pdf" http://localhost:3000/api/extract
```

### View Extracted Data
```bash
# Browser: http://localhost:3000
# Or JSON directly: open public/data/questions.json
```

### See Image Associations
```bash
# Frontend: Click any exam tab
# Images appear in "Imagens Associadas" section
# Check: public/snippets/ for image files
```

### Test Extraction Offline
```bash
python pdf_vision_engine_v2.py path/to/exam.pdf
```

---

## 🔧 Troubleshooting

| Problem | Solution |
|---------|----------|
| "GEMINI_API_KEY not found" | Set `.env.local` file with key |
| PDF not processing | Check PDF format, try another PDF |
| No images detected | Exam may not have images, or Gemini couldn't find them |
| Port 3000 busy | Change port: `npm run dev -- -p 3001` |
| Python errors | Update deps: `pip install --upgrade google-generativeai pymupdf` |

---

## 📚 Exam PDF Tips

**Best PDFs for extraction:**
- ✓ Clear text (not scanned images)
- ✓ 40-50 questions
- ✓ Multiple exams separated by titles
- ✓ Includes diagrams/charts

**Will work but slower:**
- Scanned PDFs (text recognition needed)
- Very large PDFs (100+ pages)
- Low quality images

---

## 🎨 Customization

### Change exam detection logic
Edit in `pdf_vision_engine_v2.py`:
```python
def _detect_exam_boundaries(self, doc):
    # Add custom logic here
    # Currently: heuristic-based
    # You can add: text analysis, page breaks, etc.
```

### Customize question extraction
```python
def analyze_with_gemini(self, base64_image, instruction=""):
    # Modify prompt here
    # Change detected fields
    # Adjust extraction rules
```

### Style components
Edit in `src/components/ExamTabs.tsx`:
```tsx
// Change colors, layout, fonts
// Reuse TailwindCSS classes
```

---

## 📊 Architecture Overview

```
┌─ Frontend Layer ─────────────────┐
│  Next.js 15 + React 19           │
│  ├─ ExamTabs.tsx (NEW!)   ← Tabs │
│  ├─ QuestionCard.tsx      ← Q+A  │
│  ├─ RichText.tsx          ← Math │
│  └─ DataViewer.tsx        ← Mode │
└──────────────────────────────────┘
           ↕ API
┌─ API Layer ──────────────────────┐
│  Next.js Route: /api/extract     │
│  ├─ Spawn pdf_vision_engine_v2   │
│  ├─ Return JSON with exams       │
│  └─ Save to questions.json       │
└──────────────────────────────────┘
           ↕ PyMuPDF
┌─ Backend Layer ──────────────────┐
│  pdf_vision_engine_v2.py         │
│  ├─ Detect exams         ← NEW!  │
│  ├─ Extract questions    ← Gemini│
│  ├─ Find images          ← Gemini│
│  └─ Crop images          ← PIL   │
└──────────────────────────────────┘
```

---

## 🚀 Next Steps

1. **Extract first PDF**
   - Upload sample exam
   - Check if exam tabs appear
   - Validate image associations

2. **Customize detection** (optional)
   - Edit `_detect_exam_boundaries()` if needed
   - Test with your specific PDFs

3. **Deploy** (when ready)
   - Push to Vercel: `vercel deploy`
   - Or self-host: `npm run build && npm start`

4. **Scale up**
   - Batch process multiple PDFs
   - Add database caching
   - Build API integrations

---

## 🆘 Get Help

1. **Check logs**
   ```bash
   # Terminal shows extraction progress
   # Check browser console for frontend errors
   ```

2. **Read full docs**
   - See `README.md` for detailed architecture
   - Check `.agent/` folder for design decisions

3. **Debug extraction**
   ```bash
   # Run Python script directly
   python pdf_vision_engine_v2.py your_file.pdf
   # See what Gemini is extracting
   ```

---

## ✨ That's It!

You now have a fully functional exam question extractor with:
- ✅ Automatic exam detection
- ✅ Smart image association
- ✅ Tab-based organization
- ✅ Full question details

**Happy extracting! 🎓**

---

*For detailed configuration, see [README.md](README.md) and [README_PT.md](README_PT.md)*
