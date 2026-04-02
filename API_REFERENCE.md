# 🔌 API Reference

## Base URL
```
http://localhost:3000/api
```

---

## 📤 POST `/extract`

Upload PDF and trigger extraction.

### Request
```bash
curl -X POST \
  -F "file=@exam.pdf" \
  http://localhost:3000/api/extract
```

### Response
```json
{
  "success": true,
  "message": "PDF processed successfully",
  "data": {
    "exames": [
      {
        "id": "exam_1",
        "titulo": "Português",
        "paginas": [1, 2, 3],
        "questoes": ["e1_q1", "e1_q2", "e1_q3"],
        "total_questoes": 3
      }
    ],
    "questoes": [
      {
        "id": "e1_q1",
        "numero": 1,
        "texto": "Qual é a capital do Brasil?",
        "opcoes": [
          "A) São Paulo",
          "B) Rio de Janeiro",
          "C) Brasília",
          "D) Salvador"
        ],
        "imagens_associadas": [
          {
            "id": "img_e1_q1_mapa",
            "tipo": "mapa",
            "descricao": "Mapa do Brasil",
            "caminho": "/snippets/e1_q1_mapa.png"
          }
        ]
      }
    ],
    "textos_compartilhados": []
  },
  "extraction_time": 3.45
}
```

### Status Codes
- **200** - Success
- **400** - Bad request (no file)
- **500** - Server error (Gemini API issue)

### Limits
- Max file size: 50MB
- Supported formats: PDF only
- Processing time: ~2-5s per page

---

## 📥 GET `/questions`

Fetch already extracted questions.

### Request
```bash
curl http://localhost:3000/api/questions
```

### Response
```json
{
  "success": true,
  "count": 42,
  "exames": [...],
  "questoes": [...],
  "textos_compartilhados": [...]
}
```

### Query Parameters
| Param | Type | Effect |
|-------|------|--------|
| `exam` | string | Filter by exam ID: `/api/questions?exam=exam_1` |
| `number` | number | Filter by question number: `/api/questions?number=5` |

### Examples

**Get all questions:**
```bash
curl http://localhost:3000/api/questions
```

**Get specific exam:**
```bash
curl http://localhost:3000/api/questions?exam=exam_1
```

**Get question by number:**
```bash
curl http://localhost:3000/api/questions?number=10
```

---

## 📊 Data Structure

### Exam Object
```json
{
  "id": "exam_1",                    // Unique identifier
  "titulo": "Português",             // Exam title
  "paginas": [1, 2, 3, 4],          // Page numbers
  "questoes": ["e1_q1", "e1_q2"],   // Question IDs in this exam
  "total_questoes": 2                // Count
}
```

### Question Object
```json
{
  "id": "e1_q1",                     // exam_id + question_id
  "numero": 1,                       // Sequential number
  "texto": "Question text...",       // Full question
  "opcoes": [
    "A) Option A",
    "B) Option B",
    "C) Option C",
    "D) Option D"
  ],
  "imagens_associadas": [
    {
      "id": "img_e1_q1_diagram",
      "tipo": "diagrama",
      "descricao": "Circuit diagram",
      "caminho": "/snippets/e1_q1_diagram.png"
    }
  ]
}
```

### Image Association Object
```json
{
  "id": "img_e1_q1_map",            // image_id
  "tipo": "mapa",                    // Type: mapa, diagrama, grafico, tabela, foto
  "descricao": "Mapa da Amazônia",   // Description
  "caminho": "/snippets/e1_q1_map.png"  // Stored at public/snippets/
}
```

### Shared Context Object
```json
{
  "id": "ctx_1",
  "titulo": "Texto 1",
  "conteudo": "Long shared text...",
  "questoes_relacionadas": ["e1_q1", "e1_q2"]
}
```

---

## 🎯 Workflows

### Workflow 1: Extract → View Tabs
```javascript
// 1. Upload and extract
const form = new FormData();
form.append('file', pdfFile);
const result = await fetch('/api/extract', {
  method: 'POST',
  body: form
});

// 2. Get extracted data
const data = await result.json();
console.log(data.data.exames);  // Array of exams

// 3. Frontend renders ExamTabs
// ExamTabs auto-fetches from /api/questions
```

### Workflow 2: Get Exam Questions
```javascript
// Filter questions by exam
const response = await fetch('/api/questions?exam=exam_1');
const data = await response.json();

// Get all questions in that exam
const questions = data.questoes.filter(q => 
  data.exames.find(e => e.id === 'exam_1').questoes.includes(q.id)
);

console.log(questions);
```

### Workflow 3: Get Image for Question
```javascript
// 1. Get question
const question = data.questoes.find(q => q.id === 'e1_q1');

// 2. Access images
questions.imagens_associadas.forEach(img => {
  console.log(img.descricao);      // "Mapa do Brasil"
  console.log(img.caminho);        // "/snippets/e1_q1_mapa.png"
  // Use img.caminho in <img src={img.caminho} />
});
```

---

## 🚨 Error Handling

### Error Response
```json
{
  "success": false,
  "error": "GEMINI_API_KEY not set",
  "details": "Set GEMINI_API_KEY in .env.local"
}
```

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `GEMINI_API_KEY not set` | Environment variable missing | Set in `.env.local` |
| `Invalid PDF` | Corrupted or incompatible format | Try another PDF |
| `Rate limit exceeded` | Gemini API quota reached | Wait and retry |
| `No content detected` | PDF is scanned image | Use OCR-capable PDF |
| `Timeout` | PDF too large | Split into smaller files |

---

## 📈 Performance

### Benchmarks (on Gemini 2.5 Flash)
| Operation | Time | Notes |
|-----------|------|-------|
| Extract 5-page exam | ~10s | Parallel image processing |
| Detect exam boundary | ~1s | Heuristic-based |
| Find images per question | ~2s | Gemini Vision analysis |
| Save JSON | <1s | Incremental |
| Frontend render | ~500ms | React optimization |

### Optimization Tips
```javascript
// 1. Cache results
localStorage.setItem('questions', JSON.stringify(data));

// 2. Lazy load images
<img loading="lazy" src={url} />

// 3. Batch requests
Promise.all([
  fetch('/api/questions?exam=1'),
  fetch('/api/questions?exam=2')
])

// 4. Paginate large datasets
const page1 = data.questoes.slice(0, 10);
const page2 = data.questoes.slice(10, 20);
```

---

## 🔐 Security

### Best Practices
- ✓ Validate file uploads on backend
- ✓ Scan PDFs for malicious content
- ✓ Sanitize Gemini responses
- ✓ Rate limit `/extract` endpoint
- ✓ Authenticate API in production

### Production Setup
```javascript
// Add authentication middleware
app.use('/api/extract', authMiddleware);
app.use('/api/questions', authMiddleware);

// Add rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 5  // 5 requests per window
});

app.post('/api/extract', limiter, extractController);
```

---

## 🔄 Pagination Example

For large PDF with 100+ questions:

```javascript
// Get paginated data
async function getQuestions(page = 1, perPage = 20) {
  const response = await fetch('/api/questions');
  const data = await response.json();
  
  const start = (page - 1) * perPage;
  const end = start + perPage;
  
  return {
    questoes: data.questoes.slice(start, end),
    total: data.questoes.length,
    pages: Math.ceil(data.questoes.length / perPage)
  };
}

// Usage
const page1 = await getQuestions(1, 20);
const page2 = await getQuestions(2, 20);
```

---

## 🧪 Testing

### Test Extract Endpoint
```bash
# Test with curl
curl -X POST \
  -F "file=@tests/sample.pdf" \
  http://localhost:3000/api/extract \
  | jq '.data.exames[0]'

# Expected output:
{
  "id": "exam_1",
  "titulo": "Sample Exam",
  "total_questoes": 42
}
```

### Test Questions Endpoint
```bash
# Get all questions
curl http://localhost:3000/api/questions | jq '.count'

# Filter by exam
curl http://localhost:3000/api/questions?exam=exam_1 | jq '.questoes | length'

# Expected: non-zero count
```

---

## 📝 Request/Response Examples

### Example 1: Extract Portuguese Exam
```bash
POST /api/extract
Content-Type: multipart/form-data

[Binary PDF Data]

---

200 OK
{
  "success": true,
  "data": {
    "exames": [
      {
        "id": "exam_1",
        "titulo": "Português - ESA 2023"
      }
    ],
    "questoes": [
      {
        "id": "e1_q1",
        "numero": 1,
        "texto": "Leia o poema...",
        "opcoes": ["A) ...", "B) ..."]
      }
    ]
  }
}
```

### Example 2: Get Exam Questions with Images
```bash
GET /api/questions?exam=exam_1

---

200 OK
{
  "questoes": [
    {
      "id": "e1_q1",
      "numero": 1,
      "imagens_associadas": [
        {
          "tipo": "mapa",
          "descricao": "Mapa político do Brasil",
          "caminho": "/snippets/e1_q1_mapa.png"
        }
      ]
    }
  ]
}
```

---

## 📚 Related Documentation

- [README.md](README.md) - Architecture & features
- [README_PT.md](README_PT.md) - Portuguese documentation
- [QUICKSTART.md](QUICKSTART.md) - 5-minute setup
- `.agent/skills/exam-organizer/SKILL.md` - Design patterns
- `.agent/workflows/exam-organization.md` - Complete workflow

---

**API Version:** 1.0  
**Last Updated:** 2025  
**Base Model:** Gemini 2.5 Flash  
