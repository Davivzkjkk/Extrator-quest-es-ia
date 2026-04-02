# 🎯 System Architecture Diagram

## Overall Data Flow

```mermaid
graph TD
    A[User Uploads PDF] --> B["pdf_vision_engine_v2.py"]
    B --> C["Detect Exam Boundaries"]
    C --> D["Extract Questions<br/>with Gemini 2.5 Flash"]
    D --> E["Analyze Images<br/>Find Associations"]
    E --> F["Crop Image Regions<br/>with PIL"]
    F --> G["Generate JSON<br/>with Hierarchy"]
    G --> H["Save to<br/>public/data/questions.json"]
    H --> I["Frontend Fetches"]
    I --> J["DataViewer Component<br/>Auto-detects Exam Mode"]
    J --> K["ExamTabs Component<br/>Shows Tabbed Interface"]
    K --> L["QuestionCard Component<br/>Displays Images"]
    L --> M[User Sees Organized<br/>Questions with Images ✨]
    
    style A fill:#4CAF50,stroke:#2E7D32,color:#fff
    style B fill:#2196F3,stroke:#1565C0,color:#fff
    style M fill:#FF9800,stroke:#E65100,color:#fff
```

## Component Interaction

```mermaid
graph LR
    subgraph Frontend["Frontend (React 19)"]
        A["page.tsx"]
        B["DataViewer.tsx"]
        C["ExamTabs.tsx"]
        D["QuestionCard.tsx"]
        E["RichText.tsx"]
    end
    
    subgraph Backend["Backend (Python + Node.js)"]
        F["/api/extract"]
        G["/api/questions"]
        H["pdf_vision_engine_v2.py"]
    end
    
    subgraph Storage["Storage"]
        I["questions.json"]
        J["snippets/"]
    end
    
    A -->|fetches| G
    B -->|fetches| G
    G -->|reads| I
    F -->|spawns| H
    H -->|saves| I
    H -->|stores| J
    C -->|receives| G
    D -->|displays| E
    D -->|loads| J
    
    style Frontend fill:#e3f2fd,stroke:#1976d2
    style Backend fill:#f3e5f5,stroke:#7b1fa2
    style Storage fill:#e8f5e9,stroke:#388e3c
```

## Data Structure Hierarchy

```mermaid
graph TD
    A["questions.json"] --> B["exames[]"]
    A --> C["questoes[]"]
    A --> D["textos_compartilhados[]"]
    
    B --> B1["exam_1<br/>titulo: 'Português'<br/>paginas: [1,2,3]<br/>questoes: ['e1_q1', 'e1_q2']"]
    B --> B2["exam_2<br/>titulo: 'Geografia'<br/>paginas: [4,5,6]<br/>questoes: ['e2_q1', 'e2_q2']"]
    
    C --> C1["e1_q1<br/>numero: 1<br/>texto: 'Question...'<br/>opcoes: [A,B,C,D]<br/>imagens_associadas: []"]
    C --> C2["e1_q2<br/>numero: 2<br/>imagens_associadas:<br/>- tipo: 'mapa'<br/>- caminho: '/snippets/...'"]
    
    D --> D1["ctx_1<br/>titulo: 'Texto 1'<br/>questoes_relacionadas<br/>['e1_q1', 'e2_q2']"]
    
    style A fill:#FFF9C4,stroke:#F9A825
    style B fill:#C8E6C9,stroke:#388E3C
    style C fill:#BBDEFB,stroke:#1976D2
    style D fill:#F8BBD0,stroke:#C2185B
```

## Exam Detection Flow

```mermaid
graph TD
    A["PDF Loaded<br/>Page Count: N"] --> B{"Detect Exam<br/>Boundaries"}
    B -->|Heuristic Method| C["Analyze Page 1"]
    C --> D{"Title Found?<br/>e.g., 'Português'"}
    D -->|Yes| E["Mark Page Range<br/>Start = 1"]
    D -->|No| F["Continue Analyzing"]
    E --> G{"Page Has<br/>40+ Questions?"}
    G -->|Yes| H["Exam Boundary<br/>Found!"]
    G -->|No| I["Adjust Range"]
    F --> J["Use Default<br/>Heuristic:<br/>Page 1 → End"]
    H --> K["Return Exam<br/>with Pages &<br/>Question IDs"]
    J --> K
    
    style A fill:#E3F2FD,stroke:#1976D2
    style K fill:#C8E6C9,stroke:#388E3C
```

## Image Association Process

```mermaid
graph TD
    A["Question: 'Q1: What is...?'"] --> B["Page Content<br/>Rendered to Image"]
    B --> C["Send to Gemini Vision:<br/>'Does this question<br/>need an image?'"]
    C --> D{"Gemini<br/>Response"}
    D -->|'No images needed'| E["Empty<br/>imagens_associadas: \\[\\]"]
    D -->|'Yes, has mapa'| F["Gemini returns<br/>{ tipo, descricao<br/>localizacao }"]
    F --> G["PIL crops region<br/>based on localizacao"]
    G --> H["Save to<br/>/snippets/e_q1_mapa.png"]
    H --> I["Add to<br/>imagens_associadas[]"]
    I --> J["Question JSON<br/>updated with<br/>image reference"]
    
    E --> J
    
    style A fill:#BBDEFB,stroke:#1976D2
    style J fill:#C8E6C9,stroke:#388E3C
```

## File Organization

```mermaid
graph TD
    A["d:\\Extrator de Questões - Miliatres"]
    
    A --> B["src/"]
    A --> C["public/"]
    A --> D["pdf_vision_engine_v2.py"]
    
    B --> B1["app/"]
    B --> B2["components/"]
    B1 --> B1A["page.tsx"]
    B1 --> B1B["layout.tsx"]
    B1 --> B1C["api/extract/route.ts"]
    B1 --> B1D["api/questions/route.ts"]
    
    B2 --> B2A["ExamTabs.tsx (NEW!)"]
    B2 --> B2B["QuestionCard.tsx (UPDATED)"]
    B2 --> B2C["RichText.tsx"]
    B2 --> B2D["DataViewer.tsx (NEW!)"]
    
    C --> C1["data/"]
    C --> C2["snippets/"]
    C1 --> C1A["questions.json"]
    C2 --> C2A["e1_q1_mapa.png"]
    C2 --> C2B["e1_q2_diagrama.png"]
    
    style D fill:#FF7043,stroke:#D84315
    style B1C fill:#64B5F6,stroke:#1976D2
    style B1D fill:#64B5F6,stroke:#1976D2
    style B2A fill:#81C784,stroke:#388E3C
    style C1A fill:#FFB74D,stroke:#F57C00
```

## React Component Tree

```mermaid
graph TD
    A["App<br/>page.tsx"] --> B["DataViewer.tsx"]
    
    B -->|Detects Exams| C["ExamTabs.tsx"]
    B -->|Fallback| D["DashboardView"]
    
    C --> E["Exam Tabs<br/>Button Group"]
    E --> F["Tab 1: Português"]
    E --> G["Tab 2: Geografia"]
    
    F --> H["Search Bar"]
    H --> I["Question List<br/>Filtered by Exam"]
    
    I --> J["QuestionCard.tsx<br/>e1_q1"]
    I --> K["QuestionCard.tsx<br/>e1_q2"]
    
    J --> L["Question Text<br/>RichText.tsx"]
    J --> M["Options<br/>A) B) C) D)"]
    J --> N["Images Section (NEW!)"]
    
    N --> O["Image 1: Mapa"]
    N --> P["Image 2: Gráfico"]
    
    style A fill:#FFF9C4,stroke:#F9A825
    style B fill:#BBDEFB,stroke:#1976D2
    style C fill:#C8E6C9,stroke:#388E3C
    style N fill:#F8BBD0,stroke:#C2185B
```

## API Endpoints

```mermaid
graph LR
    A["POST /api/extract"] -->|"Upload PDF"| B["Python Extractor"]
    B -->|"Returns JSON"| C["Response:<br/>exames[], questoes[]"]
    C -->|"Saves"| D["public/data/questions.json"]
    
    E["GET /api/questions"] -->|"Fetch Data"| F["Express Route"]
    F -->|"Reads"| D
    F -->|"Returns"| G["Full JSON<br/>or filtered<br/>by exam/number"]
    
    H["Frontend<br/>DataViewer"] -->|"fetch('/api/questions')"| G
    
    style A fill:#4CAF50,stroke:#2E7D32,color:#fff
    style B fill:#2196F3,stroke:#1565C0,color:#fff
    style D fill:#FF9800,stroke:#E65100,color:#fff
```

## Deployment Architecture

```mermaid
graph TB
    A["GitHub Repository<br/>main branch"]
    A -->|git push| B["GitHub Remote"]
    
    B -->|git pull| C["Vercel<br/>Deployment"]
    
    C --> D["Next.js 15<br/>Running"]
    C --> E["Python Runtime<br/>for pdf_vision_engine_v2.py"]
    
    D -->|serves static| F["UI on Port 3000"]
    D -->|route /api/extract| E
    E -->|stores| G["Files in<br/>/public/snippets/"]
    
    F --> H["User Browser<br/>sees Exam Tabs"]
    
    style A fill:#333,stroke:#000,color:#fff
    style B fill:#333,stroke:#000,color:#fff
    style C fill:#4CAF50,stroke:#2E7D32,color:#fff
    style H fill:#FF9800,stroke:#E65100,color:#fff
```

## Error Handling Flow

```mermaid
graph TD
    A["Extract Request"] --> B{Check File}
    B -->|No File| C["Return 400<br/>Missing file"]
    B -->|File OK| D{Load PDF}
    D -->|Corrupt| E["Return 400<br/>Invalid PDF"]
    D -->|OK| F{Call Gemini}
    F -->|API Error| G["Return 500<br/>Gemini failed"]
    F -->|Rate Limited| H["Return 429<br/>Too Many Requests"]
    F -->|Success| I["Process Results"]
    I --> J{Save JSON}
    J -->|Fail| K["Return 500<br/>Save error"]
    J -->|Success| L["Return 200<br/>Data saved"]
    
    C --> M["Frontend shows Error<br/>Retry Upload"]
    E --> M
    G --> M
    H --> M
    K --> M
    L --> N["Frontend shows<br/>Exam Tabs ✓"]
    
    style N fill:#C8E6C9,stroke:#388E3C
    style M fill:#FFCCCC,stroke:#D84315
```

## Search & Filter Logic

```mermaid
graph TD
    A["User Types 'Mapa'<br/>in Search Box"] --> B["ExamTabs State<br/>search = 'Mapa'"]
    
    B --> C["Filter Logic"]
    
    C --> D["activeExam<br/>= 'exam_1'"]
    C --> E["questoes filtered by:<br/>1. exam match<br/>2. search match"]
    
    D --> F["Get exam_1<br/>questoes array"]
    E --> G["Text includes 'Mapa'?<br/>or Number = parse('Mapa')"]
    
    F --> H{"Results<br/>Found?"}
    G --> H
    
    H -->|Yes| I["Render Questions<br/>Matching Search"]
    H -->|No| J["Show 'No results'"]
    
    I --> K["Display Count:<br/>2 resultados"]
    
    style A fill:#FFEB3B,stroke:#F57F17
    style I fill:#C8E6C9,stroke:#388E3C
    style J fill:#FFCCCC,stroke:#D84315
```

---

## Key Technologies in Diagram

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **pdf_vision_engine_v2.py** | PyMuPDF + Gemini 2.5 Flash + PIL | Extraction & image processing |
| **ExamTabs.tsx** | React 19 + Tailwind | Tab interface for exams |
| **QuestionCard.tsx** | React + Markdown renderer | Display questions + images |
| **DataViewer.tsx** | React hooks | Smart view detection |
| **API Routes** | Next.js App Router | FastAPI-like endpoints |
| **Storage** | `/public/data/` + `/public/snippets/` | JSON + images |
| **Deployment** | Vercel + GitHub | CI/CD pipeline |

---

These diagrams show:
- ✅ Complete data flow from PDF to UI
- ✅ Component hierarchy and interactions
- ✅ JSON data structure
- ✅ Image association process
- ✅ API architecture
- ✅ Error handling
- ✅ Deployment pipeline

For visual rendering, paste any mermaid diagram into:
- **GitHub**: Directly in README (auto-renders)
- **Mermaid Live**: https://mermaid.live
- **Local**: Use Mermaid CLI
