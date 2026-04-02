import os
import json
import re
import sys
from PIL import Image

try:
    import fitz
except ImportError:
    try:
        import pymupdf as fitz
    except ImportError:
        try:
            import fitz_old as fitz
        except ImportError:
            print("❌ ERRO: Biblioteca 'pymupdf' (fitz) não encontrada.")
            sys.exit(1)

try:
    import google.generativeai as genai
except ImportError:
    print("❌ ERRO: Biblioteca 'google-generativeai' não encontrada.")
    sys.exit(1)

class ExamOrganizerExtractor:
    def __init__(self, api_key):
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-2.5-flash')

    def process_pdf(self, pdf_path, output_json_path, snippets_dir):
        if not os.path.exists(snippets_dir):
            os.makedirs(snippets_dir)
        
        doc = fitz.open(pdf_path)
        all_questions = []
        shared_contexts = {}
        exams = []
        current_exam = None
        
        page_count = doc.page_count
        print(f"📄 Processando {page_count} páginas do PDF...")

        # First pass: detect exam boundaries
        exam_boundaries = self._detect_exam_boundaries(doc)
        print(f"📚 Detectadas {len(exam_boundaries)} provas")

        # Process each page
        for page_num in range(page_count):
            print(f"🔍 Página {page_num + 1}/{page_count}...")
            
            # Determinar qual prova esta página pertence
            exam_idx = next((i for i, (start, end) in enumerate(exam_boundaries) if start <= page_num <= end), 0)
            
            try:
                page = doc.load_page(page_num)
            except Exception as e:
                print(f"⚠️ Erro ao carregar página {page_num + 1}: {e}")
                continue
            
            # Render page
            pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
            img_path = f"temp_page_{page_num}.png"
            pix.save(img_path)

            try:
                # Extract data from this page
                raw_data = self.analyze_with_gemini(img_path)
                page_questions, page_contexts = self.parse_gemini_response(raw_data, img_path, snippets_dir, page_num)
                
                # Associate images with questions
                for q in page_questions:
                    associated_images = self._find_relevant_images(q, page, page_num, snippets_dir)
                    q["imagens_associadas"] = associated_images
                
                all_questions.extend(page_questions)
                
                # Merge contexts
                for ctx in page_contexts:
                    ctx_id = str(ctx.get("id", "")).strip()
                    if ctx_id:
                        if ctx_id in shared_contexts:
                            merged_q = set(shared_contexts[ctx_id].get("questoes", []))
                            merged_q.update(ctx.get("questoes", []))
                            shared_contexts[ctx_id]["questoes"] = sorted(merged_q)
                        else:
                            shared_contexts[ctx_id] = ctx
                            
            except Exception as e:
                print(f"❌ Erro na página {page_num + 1}: {e}")
            finally:
                if os.path.exists(img_path):
                    os.remove(img_path)

        doc.close()
        
        # Build hierarchical exam structure
        exams = self._organize_by_exams(all_questions, exam_boundaries)
        
        # Output
        output_payload = {
            "exames": exams,
            "questoes": all_questions,
            "textos_compartilhados": list(shared_contexts.values())
        }

        with open(output_json_path, 'w', encoding='utf-8') as f:
            json.dump(output_payload, f, indent=2, ensure_ascii=False)

        print(f"✅ Extração concluída! {len(all_questions)} questões em {len(exams)} provas")

    def _detect_exam_boundaries(self, doc):
        """Detecta limites de provas no PDF"""
        boundaries = []
        current_start = 0
        
        # Simple heuristic: assume exams change every N pages or by content analysis
        # For now, assume single exam or use page count
        boundaries.append((0, doc.page_count - 1))
        return boundaries

    def _find_relevant_images(self, question, page, page_num, snippets_dir):
        """Usa IA para encontrar imagens relevantes para a questão"""
        associated = []
        
        # Render full page to analyze
        pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
        page_img_path = f"temp_page_for_crop_{page_num}.png"
        pix.save(page_img_path)
        
        try:
            # Use Gemini to identify relevant image regions
            prompt = f"""
            Analisando a prova, a seguinte questão precisa de qual imagem/figura?
            
            Questão #{question.get('numero', '?')}: {question.get('texto', '')[:200]}...
            
            Se há uma imagem/figura/tabela/mapa/gráfico relevante para esta questão, descreva:
            1. Tipo de imagem (mapa, gráfico, tabela, figura, etc)
            2. Descrição breve
            3. Aproximadamente onde está (topo, meio, rodapé)
            
            Responda em JSON:
            {{"tem_imagem": true/false, "tipo": "...", "descricao": "...", "localizacao": "..."}}
            """
            
            img_content = genai.upload_file(page_img_path)
            response = self.model.generate_content([prompt, img_content])
            
            try:
                result = json.loads(self._extract_json(response.text))
                if result.get("tem_imagem"):
                    # Crop relevant area (simplified)
                    crop_path = f"{snippets_dir}/e_q{question['id']}_img.png"
                    # In production: use OCR coordinates to crop precisely
                    Image.open(page_img_path).save(crop_path)
                    
                    associated.append({
                        "id": f"img_{question['id']}",
                        "tipo": result.get("tipo"),
                        "descricao": result.get("descricao"),
                        "caminho": crop_path.replace("\\", "/"),
                        "pagina": page_num + 1
                    })
            except:
                pass
                
        finally:
            if os.path.exists(page_img_path):
                os.remove(page_img_path)
        
        return associated

    def _organize_by_exams(self, questions, boundaries):
        """Organiza questões em estrutura hierárquica por prova"""
        exams = []
        
        for idx, (start, end) in enumerate(boundaries):
            exam_questions = [q for q in questions if start <= q.get("page_num", 0) <= end]
            
            if exam_questions:
                exams.append({
                    "id": f"exam_{idx + 1}",
                    "titulo": f"Prova {idx + 1}",
                    "paginas": list(range(start + 1, end + 2)),
                    "questoes": [q["id"] for q in exam_questions],
                    "total_questoes": len(exam_questions)
                })
        
        return exams

    def analyze_with_gemini(self, image_path):
        prompt = """
        Você é um especialista em transcrição de provas militares.
        Analise esta imagem da prova EsPCEx e extraia SOMENTE questões objetivas reais.

        REGRAS OBRIGATÓRIAS:
        - Ignore títulos, instruções, cabeçalhos
        - Extraia APENAS questões com alternativas [A], [B], [C], [D]
        - Se a questão não tiver 4 alternativas, ignore
        - Para questões com múltiplas linhas, junte todo o texto
        - Preserve símbolos especiais ($, °, √, frações em TeX)
        - Para imagens de números, transcreva como texto
        - Se há conteúdo compartilhado (textos base, tabelas), marque com ID único

        Responda em JSON estruturado:
        {
            "questoes": [
                {
                    "numero": 1,
                    "texto": "...",
                    "opcoes": ["opção A", "opção B", "opção C", "opção D"],
                    "tem_tabela": false,
                    "tabela_md": "",
                    "contextos_ids": ["id_do_contexto_se_houver"]
                }
            ],
            "textos_compartilhados": [
                {
                    "id": "ctx_unique_id",
                    "texto": "...",
                    "questoes": [1, 2, 3]
                }
            ]
        }
        """

        try:
            with Image.open(image_path) as img:
                response = self.model.generate_content([prompt, img])
                return response.text
        except Exception as e:
            print(f"Erro ao chamar Gemini: {e}")
            return "{}"

    def parse_gemini_response(self, response_text, img_path, snippets_dir, page_num):
        questions = []
        contexts = []

        def _load_json_safe(text):
            text = text.strip()
            if text.startswith("```"):
                text = re.sub(r"^```.*?\n", "", text)
                text = re.sub(r"\n```$", "", text)
            try:
                return json.loads(text)
            except json.JSONDecodeError:
                return {}

        data = _load_json_safe(response_text)
        q_list = data.get("questoes", [])
        ctx_list = data.get("textos_compartilhados", [])

        for i, q in enumerate(q_list):
            q_id = f"p{page_num + 1}q{i}"
            q["id"] = q_id
            q["page_num"] = page_num
            q["coords"] = [0, 0, 100, 100]
            q["imagens_associadas"] = []

            # Save snippet
            try:
                with Image.open(img_path) as img:
                    snippet_path = os.path.join(snippets_dir, f"{q_id}.png")
                    img.save(snippet_path)
                    q["originalImage"] = f"/snippets/{q_id}.png"
            except:
                q["originalImage"] = ""

            questions.append(q)

        for ctx in ctx_list:
            contexts.append(ctx)

        return questions, contexts

    def _extract_json(self, text):
        try:
            start = text.find('{')
            end = text.rfind('}') + 1
            return text[start:end] if start != -1 and end != 0 else text
        except:
            return text


if __name__ == "__main__":
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("❌ GEMINI_API_KEY não configurada")
        sys.exit(1)

    extractor = ExamOrganizerExtractor(api_key)
    extractor.process_pdf(
        "EsPCEx.pdf",
        "public/data/questions.json",
        "public/snippets"
    )
