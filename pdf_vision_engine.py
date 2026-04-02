import os
import json
import re
import sys
from PIL import Image

try:
    import fitz  # PyMuPDF tradicional
except ImportError:
    try:
        import pymupdf as fitz # Nova versão pro
    except ImportError:
        try:
            import fitz_old as fitz
        except ImportError:
            print("❌ ERRO: Biblioteca 'pymupdf' (fitz) não encontrada.")
            print(r"💡 No MSYS2, instale com: C:\msys64\usr\bin\pacman.exe -S mingw-w64-ucrt-x86_64-python-pymupdf")
            print(r"💡 Depois ative a venv com: .\.venv\Scripts\Activate.ps1")
            sys.exit(1)

try:
    import google.generativeai as genai
except ImportError:
    print("❌ ERRO: Biblioteca 'google-generativeai' não encontrada.")
    print(r"💡 Rode: .\.venv\Scripts\Activate.ps1 e então pip install google-generativeai")
    sys.exit(1)

class QuestionExtractor:
    def __init__(self, api_key):
        genai.configure(api_key=api_key)
        # Usando um modelo atual com suporte a visão.
        self.model = genai.GenerativeModel('gemini-2.5-flash')

    def process_pdf(self, pdf_path, output_json_path, snippets_dir):
        if not os.path.exists(snippets_dir):
            os.makedirs(snippets_dir)
        
        doc = fitz.open(pdf_path)
        all_questions = []
        shared_contexts_by_id = {}

        page_count = doc.page_count
        print(f"📄 Processando {page_count} páginas do PDF...")

        for page_num in range(page_count):
            print(f"🔍 Analisando Página {page_num + 1}...")
            try:
                page = doc.load_page(page_num)
            except Exception as e:
                print(f"⚠️ Falha ao carregar página {page_num + 1}: {e}")
                continue
            pix = page.get_pixmap(matrix=fitz.Matrix(2, 2)) # Alta resolução (2x)
            img_path = f"temp_page_{page_num}.png"
            pix.save(img_path)

            # Enviar para o Gemini
            try:
                raw_data = self.analyze_with_gemini(img_path)
                page_questions, page_contexts = self.parse_gemini_response(raw_data, img_path, snippets_dir, page_num)
                all_questions.extend(page_questions)
                for ctx in page_contexts:
                    ctx_id = str(ctx.get("id", "")).strip()
                    if not ctx_id:
                        continue
                    if ctx_id in shared_contexts_by_id:
                        merged_questions = set(shared_contexts_by_id[ctx_id].get("questoes", []))
                        merged_questions.update(ctx.get("questoes", []))
                        shared_contexts_by_id[ctx_id]["questoes"] = sorted(merged_questions)
                    else:
                        shared_contexts_by_id[ctx_id] = {
                            "id": ctx_id,
                            "texto": str(ctx.get("texto", "")).strip(),
                            "questoes": sorted(set(ctx.get("questoes", [])))
                        }
            except Exception as e:
                print(f"❌ Erro na página {page_num+1}: {e}")
            finally:
                if os.path.exists(img_path):
                    os.remove(img_path)

        all_questions.sort(key=lambda item: item.get("numero", 9999))
        output_payload = {
            "questoes": all_questions,
            "textos_compartilhados": list(shared_contexts_by_id.values())
        }

        # Salvar resultado final
        with open(output_json_path, 'w', encoding='utf-8') as f:
            json.dump(output_payload, f, indent=2, ensure_ascii=False)

        doc.close()
        
        print(f"✅ Extração concluída! {len(all_questions)} questões salvas em {output_json_path}")

    def analyze_with_gemini(self, image_path):
        prompt = """
                Você é um especialista em transcrição de provas militares.
                Analise esta imagem da prova EsPCEx e extraia SOMENTE questões objetivas reais.

                REGRAS OBRIGATÓRIAS:
                - Ignore capa, instruções gerais, orientações de cartão-resposta, avisos e qualquer texto administrativo.
                - Extraia apenas questões que tenham enunciado e alternativas.
                - Em "opcoes", NÃO inclua prefixos como "[A]", "A)", "A]". Retorne apenas o conteúdo textual da alternativa.
                - Se houver um texto-base comum para duas ou mais questões, registre esse texto em "textos_compartilhados"
                    com um ID único e relacione esse ID em cada questão no campo "contextos_ids".
                - Não duplique texto-base dentro de múltiplas questões quando ele for compartilhado.
        
        PARA CADA QUESTÃO:
        1. Identifique o número da questão.
        2. Extraia o enunciado completo. Converta fórmulas matemáticas complexas para LaTeX (ex: $x^2$).
        3. Liste as opções (A, B, C, D, E).
        4. Identifique as coordenadas [ymin, xmin, ymax, xmax] da questão na imagem (escala 0-1000).
        5. Se houver uma tabela, extraia-a como Markdown.

                Retorne APENAS um JSON puro no formato:
                {
                    "questoes": [
                        {
                            "numero": 1,
                            "texto": "...",
                            "opcoes": ["...", "...", "...", "...", "..."],
                            "coords": [ymin, xmin, ymax, xmax],
                            "tem_tabela": false,
                            "tabela_md": "",
                            "contextos_ids": []
                        }
                    ],
                    "textos_compartilhados": [
                        {
                            "id": "ctx_1",
                            "texto": "texto-base compartilhado",
                            "questoes": [45, 46, 47]
                        }
                    ]
                }
        """
        with Image.open(image_path) as img:
            response = self.model.generate_content([prompt, img.copy()])
        # Limpar markdown do JSON se o Gemini enviar
        content = response.text.replace('```json', '').replace('```', '').strip()
        return content

    def _load_gemini_json(self, raw_json):
        cleaned = raw_json.strip()
        if not cleaned:
            return {}

        obj_start = cleaned.find('{')
        obj_end = cleaned.rfind('}')
        arr_start = cleaned.find('[')
        arr_end = cleaned.rfind(']')

        if obj_start != -1 and obj_end != -1 and obj_end > obj_start:
            cleaned = cleaned[obj_start:obj_end + 1]
        elif arr_start != -1 and arr_end != -1 and arr_end > arr_start:
            cleaned = cleaned[arr_start:arr_end + 1]

        try:
            return json.loads(cleaned)
        except json.JSONDecodeError:
            normalized = cleaned.replace('\\', '\\\\')
            return json.loads(normalized)

    def _is_valid_question(self, item):
        if not isinstance(item, dict):
            return False

        opcoes = item.get("opcoes", [])
        texto = str(item.get("texto", "")).strip()

        if not isinstance(opcoes, list) or len(opcoes) < 2:
            return False

        lowered = texto.lower()
        blocked_starts = [
            "confira a prova",
            "condições de execução da prova",
            "cartão de respostas",
            "instruções para o preenchimento",
        ]
        if any(token in lowered for token in blocked_starts):
            return False

        try:
            numero = int(item.get("numero"))
        except (TypeError, ValueError):
            return False

        return numero > 0 and bool(texto)

    def _coerce_page_payload(self, payload):
        if isinstance(payload, list):
            return payload, []
        if isinstance(payload, dict):
            questions = payload.get("questoes", [])
            contexts = payload.get("textos_compartilhados", [])
            return questions if isinstance(questions, list) else [], contexts if isinstance(contexts, list) else []
        return [], []

    def _normalize_text(self, value):
        if not isinstance(value, str):
            return value
        text = value.replace('\\n', '\n').replace('\\r', '\r').strip()
        text = self._fix_common_latex_issues(text)
        return text

    def _strip_option_prefix(self, value):
        text = self._normalize_text(value)
        # Remove marcadores comuns no início da alternativa apenas quando o marcador é explícito.
        # Exemplos removidos: [A] texto, (B) texto, C) texto, D] texto, E. texto, A: texto, B- texto
        text = re.sub(
            r'^\s*(?:\[[A-Ea-e]\]|\([A-Ea-e]\)|[A-Ea-e][\)\].:\-])\s*',
            '',
            text,
        )
        return text.strip()

    def _fix_common_latex_issues(self, text):
        if not text:
            return text

        # OCR costuma duplicar barra em comandos LaTeX.
        text = re.sub(r'\\\\([A-Za-z])', r'\\\1', text)

        # Corrigir comandos left/right sem barra, ex: left( ... right)
        text = re.sub(r'(?<!\\)left\s*([\(\[\{\|])', r'\\left\1', text)
        text = re.sub(r'(?<!\\)right\s*([\)\]\}\|])', r'\\right\1', text)

        # Corrigir casos com barra faltando só no right após \left(...
        text = re.sub(r'\\left\s*([\(\[\{\|])([^$\n]*?)\sright\s*([\)\]\}\|])', r'\\left\1\2 \\right\3', text)

        # Comandos sem chaves: \overlineAB -> \overline{AB}
        text = re.sub(r'\\overline\s*([A-Za-z]{1,4})\b', r'\\overline{\1}', text)

        # Comandos sem chaves: \sqrt3 -> \sqrt{3}
        text = re.sub(r'\\sqrt\s*([0-9A-Za-z]+)\b', r'\\sqrt{\1}', text)

        # OCR comum em frações: \frac1365 -> \frac{136}{5}
        text = re.sub(r'\\frac\s*(\d{2,})(\d)\b', r'\\frac{\1}{\2}', text)

        # Pequena limpeza em separadores de unidade dentro de matemática.
        text = text.replace('\\ u.a.', '\\text{ u.a.}')

        return text

    def _normalize_question_item(self, item):
        normalized = dict(item)
        normalized['texto'] = self._normalize_text(normalized.get('texto', ''))
        normalized['opcoes'] = [self._strip_option_prefix(opt) for opt in normalized.get('opcoes', []) if isinstance(opt, str)]
        normalized['tabela_md'] = self._normalize_text(normalized.get('tabela_md', ''))
        normalized['contextos_ids'] = [str(ctx).strip() for ctx in normalized.get('contextos_ids', []) if str(ctx).strip()]
        return normalized

    def _normalize_context_item(self, item):
        normalized = dict(item)
        normalized['texto'] = self._normalize_text(normalized.get('texto', ''))
        normalized['questoes'] = [int(q) for q in normalized.get('questoes', []) if str(q).strip().isdigit()]
        return normalized

    def parse_gemini_response(self, raw_json, image_path, snippets_dir, page_num):
        payload = self._load_gemini_json(raw_json)
        data, page_contexts = self._coerce_page_payload(payload)

        filtered_questions = [self._normalize_question_item(q) for q in data if self._is_valid_question(q)]
        valid_question_numbers = {int(q.get("numero")) for q in filtered_questions}

        sanitized_contexts = []
        for idx, ctx in enumerate(page_contexts):
            if not isinstance(ctx, dict):
                continue
            base_ctx_id = str(ctx.get("id", f"ctx_{idx}")).strip() or f"ctx_{idx}"
            ctx_id = f"p{page_num}_{base_ctx_id}"
            texto = str(ctx.get("texto", "")).strip()
            questoes = []
            for q_num in ctx.get("questoes", []):
                try:
                    q_num_int = int(q_num)
                except (TypeError, ValueError):
                    continue
                if q_num_int in valid_question_numbers:
                    questoes.append(q_num_int)

            if texto and questoes:
                sanitized_contexts.append(self._normalize_context_item({
                    "id": ctx_id,
                    "texto": texto,
                    "questoes": sorted(set(questoes))
                }))

        context_by_question = {}
        for ctx in sanitized_contexts:
            for q_num in ctx["questoes"]:
                context_by_question.setdefault(q_num, []).append(ctx["id"])

        with Image.open(image_path) as img:
            w, h = img.size

            normalized_questions = []
            for idx, q in enumerate(filtered_questions):
                # Gerar snippet (recorte visual)
                ymin, xmin, ymax, xmax = q['coords']
                left = xmin * w / 1000
                top = ymin * h / 1000
                right = xmax * w / 1000
                bottom = ymax * h / 1000

                snippet_name = f"q_{page_num}_{idx}.png"
                crop = img.crop((left, top, right, bottom))
                crop.save(os.path.join(snippets_dir, snippet_name))
                q['originalImage'] = f"/snippets/{snippet_name}"
                q['id'] = f"p{page_num}q{idx}"
                q_num = int(q.get("numero"))

                explicit_contexts = q.get("contextos_ids", [])
                if not isinstance(explicit_contexts, list):
                    explicit_contexts = []
                normalized_explicit_contexts = []
                page_prefix = f"p{page_num}_"
                for ctx_id in explicit_contexts:
                    ctx_text = str(ctx_id).strip()
                    if not ctx_text:
                        continue
                    if not ctx_text.startswith(page_prefix):
                        ctx_text = page_prefix + ctx_text
                    normalized_explicit_contexts.append(ctx_text)
                merged_contexts = list(dict.fromkeys(normalized_explicit_contexts + context_by_question.get(q_num, [])))
                q["contextos_ids"] = merged_contexts

                normalized_questions.append(q)
        
            return normalized_questions, sanitized_contexts

if __name__ == "__main__":
    # Carregar chave do .env.local
    api_key = ""
    if os.path.exists(".env.local"):
        with open(".env.local", "r") as f:
            for line in f:
                if "NEXT_PUBLIC_GEMINI_API_KEY=" in line:
                    api_key = line.split("=")[1].strip()

    if not api_key or "SUA_CHAVE" in api_key:
        print("❌ Por favor, coloque sua chave do Gemini no arquivo .env.local")
        sys.exit(1)

    extractor = QuestionExtractor(api_key)
    extractor.process_pdf(
        "EsPCEx.pdf", 
        "public/data/questions.json", 
        "public/snippets"
    )
