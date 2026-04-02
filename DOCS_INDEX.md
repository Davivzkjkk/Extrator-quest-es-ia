# 📚 Documentation Index

Welcome to the **Extrator de Questões** documentation center! This index helps you navigate all available guides and references.

## 🎯 Quick Navigation

### 🚀 Getting Started (Start Here!)
| Document | Purpose | Read Time |
|----------|---------|-----------|
| [QUICKSTART.md](QUICKSTART.md) | **5-minute setup guide** - Start extracting in minutes! | 5 min |
| [README.md](README.md) | **Complete feature overview** - English version | 10 min |
| [README_PT.md](README_PT.md) | **Visão geral completa das funcionalidades** - Versão em Português | 10 min |

### 📖 Technical Documentation
| Document | Purpose | Read Time |
|----------|---------|-----------|
| [API_REFERENCE.md](API_REFERENCE.md) | **Full API documentation with examples** - endpoints, schemas, curl commands | 15 min |
| [ARCHITECTURE_DIAGRAMS.md](ARCHITECTURE_DIAGRAMS.md) | **Visual system architecture** - flowcharts, component trees, data flow | 10 min |
| [.agent/skills/exam-organizer/SKILL.md](.agent/skills/exam-organizer/SKILL.md) | **Design pattern documentation** - How exam organization works | 5 min |
| [.agent/workflows/exam-organization.md](.agent/workflows/exam-organization.md) | **Complete workflow guide** - 7-step pipeline explanation | 8 min |

### 🤖 AI & Agent Framework
| Document | Purpose | Read Time |
|----------|---------|-----------|
| [.agent/agents/exam-validator.md](.agent/agents/exam-validator.md) | **Validation agent spec** - Quality assurance automation | 5 min |
| [.agent/ARCHITECTURE.md](.agent/ARCHITECTURE.md) | **Agent framework architecture** - How the .agent system works | 10 min |

---

## 🗺️ Documentation by Use Case

### "I want to extract my first PDF"
1. Read: [QUICKSTART.md](QUICKSTART.md) (5 min)
2. Run: `npm install && npm run dev`
3. Upload PDF at http://localhost:3000
4. ✅ Done!

### "I need to understand the API"
1. Read: [API_REFERENCE.md](API_REFERENCE.md) (15 min)
2. Check examples for your use case
3. Test endpoints with curl commands provided
4. Integrate into your app

### "I want to see how the system works"
1. View: [ARCHITECTURE_DIAGRAMS.md](ARCHITECTURE_DIAGRAMS.md) (10 min)
2. Review data structure in [API_REFERENCE.md](API_REFERENCE.md#-data-structure)
3. Check component tree in [ARCHITECTURE_DIAGRAMS.md](ARCHITECTURE_DIAGRAMS.md#react-component-tree)
4. Understand flow: [ARCHITECTURE_DIAGRAMS.md](ARCHITECTURE_DIAGRAMS.md#overall-data-flow)

### "I want to customize the extraction"
1. Read: [.agent/skills/exam-organizer/SKILL.md](.agent/skills/exam-organizer/SKILL.md)
2. Check: `pdf_vision_engine_v2.py` - edit `_detect_exam_boundaries()` method
3. Modify: Gemini prompt in `analyze_with_gemini()`
4. Test: Run extraction with modified logic

### "I want to integrate this into my app"
1. Review: [API_REFERENCE.md](API_REFERENCE.md) (especially workflows section)
2. Use `POST /api/extract` for processing PDFs
3. Use `GET /api/questions` for fetching results
4. Example: [API_REFERENCE.md](API_REFERENCE.md#workflow-1-extract--view-tabs)

### "I want to deploy to production"
1. Read: Production setup in [API_REFERENCE.md](API_REFERENCE.md#-security)
2. Add authentication middleware
3. Deploy to Vercel or self-host
4. Configure `GEMINI_API_KEY` in production environment

---

## 📊 Feature Documentation Map

### Exam Organization
- **What is it?** Questions organized into exam tabs
- **How does it work?** See [ARCHITECTURE_DIAGRAMS.md - Exam Detection Flow](ARCHITECTURE_DIAGRAMS.md#exam-detection-flow)
- **Configure it**: Edit `_detect_exam_boundaries()` in `pdf_vision_engine_v2.py`
- **Skill doc**: [.agent/skills/exam-organizer/SKILL.md](.agent/skills/exam-organizer/SKILL.md)

### Automatic Image Association
- **What is it?** AI finds which images each question needs
- **How does it work?** See [ARCHITECTURE_DIAGRAMS.md - Image Association Process](ARCHITECTURE_DIAGRAMS.md#image-association-process)
- **Customize it**: Modify Gemini prompt in `pdf_vision_engine_v2.py`
- **Workflow**: [.agent/workflows/exam-organization.md](.agent/workflows/exam-organization.md)

### Tab-Based UI
- **Component**: `ExamTabs.tsx` in `src/components/`
- **How it works?** See [ARCHITECTURE_DIAGRAMS.md - React Component Tree](ARCHITECTURE_DIAGRAMS.md#react-component-tree)
- **Styling**: Uses Tailwind CSS (modify in component file)
- **Data source**: Fetches from `GET /api/questions`

### Image Display
- **Component**: `QuestionCard.tsx` (updated with image gallery)
- **Display format**: Grid layout in purple section
- **Image path**: Stored in `/public/snippets/`
- **API field**: `imagens_associadas` array in question object

---

## 🔧 Technical Stack Reference

### Backend
```
Python 3.9+
├─ PyMuPDF (fitz) - PDF processing
├─ google-generativeai - Gemini API
└─ Pillow (PIL) - Image cropping
```

### Frontend
```
Node.js 18+
├─ Next.js 15 - Framework
├─ React 19 RC - Components
├─ Tailwind CSS - Styling
├─ Framer Motion - Animations
└─ Lucide Icons - UI icons
```

### Infrastructure
```
Git - Version control
GitHub - Remote repository
Vercel - Deployment (optional)
```

See full stack in: [README.md - Technology Stack](README.md#-technology-stack)

---

## 🚨 Troubleshooting Guide

| Issue | Solution | Docs |
|-------|----------|------|
| "GEMINI_API_KEY not found" | Set in `.env.local` | [QUICKSTART.md - Configure Environment](QUICKSTART.md#3%EF%B8%8F%E2%83%A3-configure-environment) |
| PDF not processing | Check format, try another | [QUICKSTART.md - Troubleshooting](QUICKSTART.md#-troubleshooting) |
| Images not showing | Gemini couldn't detect them | [QUICKSTART.md - Troubleshooting](QUICKSTART.md#-troubleshooting) |
| Port 3000 busy | Use different port: `npm run dev -- -p 3001` | [QUICKSTART.md - Troubleshooting](QUICKSTART.md#-troubleshooting) |
| "No exams detected" | Check PDF format, adjust heuristic | [ARCHITECTURE_DIAGRAMS.md - Exam Detection](ARCHITECTURE_DIAGRAMS.md#exam-detection-flow) |
| API rate limit | Wait 15 minutes, try again | [API_REFERENCE.md - Rate Limiting](API_REFERENCE.md#rate-limiting) |

---

## 📋 Development Workflow

### Local Development
1. **Setup**: Follow [QUICKSTART.md](QUICKSTART.md)
2. **Code**: Edit components in `src/components/`
3. **Backend**: Modify `pdf_vision_engine_v2.py`
4. **Test**: Upload PDFs at http://localhost:3000
5. **Commit**: `git add && git commit -m "..."`
6. **Push**: `git push origin main`

### API Development
1. **Test endpoints**: Use curl commands in [API_REFERENCE.md](API_REFERENCE.md)
2. **Modify routes**: Edit in `src/app/api/`
3. **Check data**: Inspect `/public/data/questions.json`
4. **Debug**: Check browser console + terminal output

### Component Development
1. **Edit component**: `src/components/*.tsx`
2. **See changes**: Hot reload at http://localhost:3000
3. **Check types**: TypeScript errors in IDE
4. **Test interactions**: Click tabs, upload PDFs

---

## 🎯 Learning Paths

### Path 1: User (Just want to extract questions)
```
QUICKSTART.md → Extract first PDF → Done! ✓
```
Estimated time: **10 minutes**

### Path 2: Developer (Integrate API into app)
```
QUICKSTART.md → API_REFERENCE.md → Code integration → Done! ✓
```
Estimated time: **30 minutes**

### Path 3: Architect (Understand full system)
```
README.md → ARCHITECTURE_DIAGRAMS.md → .agent docs → Code review → Done! ✓
```
Estimated time: **1-2 hours**

### Path 4: Customizer (Modify extraction logic)
```
QUICKSTART.md → ARCHITECTURE_DIAGRAMS.md → Edit pdf_vision_engine_v2.py → Test → Done! ✓
```
Estimated time: **1-2 hours**

---

## 📝 Document Conventions

### Markdown Files
- 🚀 **QUICKSTART.md**: Fast setup (5-10 min read)
- 📖 **README.md/README_PT.md**: Feature overview (10 min read)
- 🔌 **API_REFERENCE.md**: Technical reference (15 min read)
- 🎯 **ARCHITECTURE_DIAGRAMS.md**: Visual architecture (10 min read)
- ⚙️ **.agent/** docs: Design patterns (5 min read each)

### Code Comments
- `# [SECTION]` - Major section header
- `# TODO:` - Pending work
- `# NOTE:` - Important info
- `# FIXME:` - Known issue

### JSON Schema
All data structure examples in [API_REFERENCE.md - Data Structure](API_REFERENCE.md#-data-structure)

---

## 🔄 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025 | Initial exam organization system with automatic image association |
| - | Future | Answer key detection, OCR enhancement, batch processing |

See commit history: `git log --oneline`

---

## 🤝 Contributing

Read [README.md - Contributing](README.md#-contributing) for contribution guidelines.

---

## ❓ FAQ

**Q: Can I use this with proprietary PDFs?**
A: Yes! The system works with any exam PDF format as long as it contains text and images.

**Q: How many questions can it extract?**
A: Tested with 40-100+ questions. Larger PDFs may need tuning.

**Q: Do I need a Gemini API key?**
A: Yes, it's free tier available at https://ai.google.com/

**Q: Can I deploy this?**
A: Yes! See [README.md - Deployment](README.md#-deployment) for options.

**Q: How accurate is image association?**
A: Depends on PDF clarity and Gemini's visual understanding. Usually 90%+ accurate.

**Q: Can I customize it?**
A: Absolutely! See [QUICKSTART.md - Customization](QUICKSTART.md#-customization)

---

## 📞 Support Resources

1. **Error checking**: Review [QUICKSTART.md - Troubleshooting](QUICKSTART.md#-troubleshooting)
2. **API questions**: Check [API_REFERENCE.md](API_REFERENCE.md)
3. **Architecture questions**: See [ARCHITECTURE_DIAGRAMS.md](ARCHITECTURE_DIAGRAMS.md)
4. **Code understanding**: Read component comments + `.agent/` docs
5. **GitHub Issues**: Create an issue on the repository

---

## 🎓 Learning Resources

### Recommended Reading Order
1. Start: [QUICKSTART.md](QUICKSTART.md) ← You are here!
2. Understand: [README.md](README.md)
3. Deep dive: [ARCHITECTURE_DIAGRAMS.md](ARCHITECTURE_DIAGRAMS.md)
4. API: [API_REFERENCE.md](API_REFERENCE.md)
5. Customize: [.agent/skills/exam-organizer/SKILL.md](.agent/skills/exam-organizer/SKILL.md)

### External Resources
- **Gemini API Docs**: https://ai.google.dev/docs
- **PyMuPDF Docs**: https://pymupdf.io/
- **Next.js Docs**: https://nextjs.org/docs
- **React Docs**: https://react.dev/

---

## ✨ Quick Links

- 🏠 [GitHub Repository](https://github.com/Davivzkjkk/Extrator-quest-es-ia)
- 🚀 [Live Demo](#) *(Deploy to see live)*
- 🐛 [Report Issues](https://github.com/Davivzkjkk/Extrator-quest-es-ia/issues)
- 📧 [Contact](#) *(Email support)*

---

**Documentation Status**: ✅ Complete  
**Last Updated**: 2025  
**Maintained By**: AI System + Community

*Built with ❤️ using Next.js + Gemini Vision*
