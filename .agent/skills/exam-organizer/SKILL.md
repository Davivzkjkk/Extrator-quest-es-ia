# Exam Organizer Skill

Organiza questões em provas (exams) com estrutura hierárquica e associa imagens automaticamente.

## Problem
- Questões desorganizadas sem agrupamento temático
- Imagens não associadas corretamente às questões
- Falta de interface com abas por prova

## Solution
1. **Detect Exams**: Identifica divisões de provas no PDF (por tema/seção)
2. **Smart Image Association**: IA identifica qual imagem é relevante para cada questão
3. **Image Cropping**: Recorta apenas a área relevante da imagem
4. **Hierarchical JSON**: Estrutura organizada por exams → questions → images

## JSON Schema

```json
{
  "exames": [
    {
      "id": "exam_1",
      "titulo": "Provas de Português e Geografia",
      "paginas": [1, 2, 3],
      "questoes": [
        {
          "id": "q1",
          "numero": 1,
          "texto": "...",
          "opcoes": [...],
          "imagens_associadas": [
            {
              "id": "img_1_ref",
              "descricao": "Mapa da Amazônia",
              "caminho": "/snippets/e1_q1_map.png",
              "coordenadas_origem": [100, 200, 400, 600]
            }
          ]
        }
      ]
    }
  ]
}
```

## Key Features
- Auto-detect exam sections
- Link images to questions via Gemini vision
- Crop images for relevance
- Organize by exam tabs

## Integration
Modify `pdf_vision_engine.py` to:
1. Extract page text to detect exam boundaries
2. Use Gemini to identify image-question associations
3. Crop and save associated images
4. Generate hierarchical JSON
