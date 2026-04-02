"use client";

import React, { useMemo, useState } from 'react'
import { FileText, UploadCloud, Zap, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { QuestionCard } from '@/components/QuestionCard'
import { RichText } from '@/components/RichText'
import ExamTabs from '@/components/ExamTabs'

type SharedContext = {
  id: string
  texto: string
  questoes: number[]
}

type ExtractedQuestion = {
  id: string
  numero: number
  texto: string
  opcoes: string[]
  coords?: number[]
  tem_tabela?: boolean
  tabela_md?: string
  originalImage?: string
  contextos_ids?: string[]
}

type ExtractPayload = {
  questoes: ExtractedQuestion[]
  textos_compartilhados: SharedContext[]
}

type QuestionModalData = ExtractedQuestion & {
  contextos: Array<{ id: string; texto: string }>
}

export default function Dashboard() {
  const [payload, setPayload] = React.useState<ExtractPayload>({
    questoes: [],
    textos_compartilhados: []
  })
  const [activeTab, setActiveTab] = useState<'questoes' | 'textos'>('questoes')
  const [isProcessing, setIsProcessing] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [search, setSearch] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionModalData | null>(null)

  const loadCurrentData = React.useCallback(async () => {
    const response = await fetch('/api/questions', { cache: 'no-store' })
    if (!response.ok) {
      throw new Error('Falha ao carregar questions.json')
    }
    const data = await response.json()
    if (Array.isArray(data)) {
      setPayload({ questoes: data, textos_compartilhados: [] })
      return
    }
    setPayload({
      questoes: Array.isArray(data.questoes) ? data.questoes : [],
      textos_compartilhados: Array.isArray(data.textos_compartilhados) ? data.textos_compartilhados : []
    })
  }, [])

  React.useEffect(() => {
    loadCurrentData().catch(() => {
      setStatusMessage('Nenhum resultado disponível ainda. Faça upload de uma prova para extrair.')
    })
  }, [loadCurrentData])

  const contextById = useMemo(() => {
    const map = new Map<string, SharedContext>()
    for (const ctx of payload.textos_compartilhados) {
      map.set(ctx.id, ctx)
    }
    return map
  }, [payload.textos_compartilhados])

  const filteredQuestions = useMemo(() => {
    if (!search.trim()) {
      return payload.questoes
    }
    const term = search.toLowerCase()
    return payload.questoes.filter((q) => {
      if (q.texto?.toLowerCase().includes(term)) {
        return true
      }
      if ((q.opcoes || []).some((opt) => String(opt).toLowerCase().includes(term))) {
        return true
      }
      return String(q.numero).includes(term)
    })
  }, [payload.questoes, search])

  const modalQuestion = selectedQuestion

  async function handleExtract(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!selectedFile) {
      setStatusMessage('Selecione um PDF antes de iniciar a extração.')
      return
    }

    setIsProcessing(true)
    setStatusMessage('Enviando prova e iniciando extração...')

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      const response = await fetch('/api/extract', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.error || 'Falha ao extrair prova')
      }

      const data = await response.json()
      setPayload(data)
      setStatusMessage(`Extração concluída: ${data.questoes?.length || 0} questões.`)
      setActiveTab('questoes')
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Erro inesperado durante a extração.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="flex bg-background min-h-screen text-foreground select-none">
      <aside className="w-72 border-r bg-muted/20 backdrop-blur-xl flex flex-col items-center py-8 px-4">
        <div className="flex items-center gap-2 mb-8 group cursor-pointer">
          <div className="p-2 bg-primary rounded-lg shadow-lg">
            <Zap size={20} className="text-white fill-white" />
          </div>
          <span className="font-bold text-xl tracking-tighter gradient-text">MILI-EXTRA</span>
        </div>

        <form className="w-full space-y-3" onSubmit={handleExtract}>
          <label className="text-xs font-bold uppercase text-primary">Enviar Prova (PDF)</label>
          <label className="w-full border-2 border-dashed border-primary/30 rounded-2xl p-4 bg-primary/5 block cursor-pointer hover:bg-primary/10 transition-colors">
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            />
            <div className="flex flex-col gap-2 items-start">
              <UploadCloud size={18} className="text-primary" />
              <p className="text-sm font-medium">{selectedFile ? selectedFile.name : 'Clique para escolher o PDF'}</p>
              <p className="text-xs text-muted-foreground">Suporta qualquer prova objetiva em formato PDF.</p>
            </div>
          </label>
          <button
            type="submit"
            disabled={isProcessing}
            className="w-full py-2.5 rounded-xl font-bold text-sm bg-primary text-primary-foreground disabled:opacity-60"
          >
            {isProcessing ? 'Extraindo...' : 'Iniciar extração'}
          </button>
        </form>

        <div className="mt-6 w-full space-y-2">
          <button
            onClick={() => setActiveTab('questoes')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm ${activeTab === 'questoes' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
          >
            Questões ({payload.questoes.length})
          </button>
          <button
            onClick={() => setActiveTab('textos')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm ${activeTab === 'textos' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
          >
            Textos de apoio ({payload.textos_compartilhados.length})
          </button>
        </div>

        <div className="mt-auto px-1 w-full">
          <div className="p-3 bg-primary/5 border border-primary/10 rounded-xl">
            <p className="text-[10px] font-bold text-primary uppercase mb-1">Status</p>
            <p className="text-xs text-muted-foreground">{statusMessage || 'Pronto para extrair.'}</p>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col">
        <header className="h-20 border-b flex items-center justify-between px-8 bg-background/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <input
              placeholder="Buscar por número, enunciado ou alternativa..."
              className="w-full px-4 py-2 bg-muted/40 border border-transparent rounded-xl text-sm focus:bg-background focus:border-primary/50 outline-none transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <FileText size={14} />
            <span>{payload.questoes.length} questões estruturadas</span>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-1">Painel de Extração de Provas</h1>
            <p className="text-muted-foreground text-sm">
              Fluxo sugerido: enviar PDF, extrair e revisar questões com os textos de apoio compartilhados.
            </p>
          </div>

          {activeTab === 'questoes' && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-12">
              <AnimatePresence mode="popLayout">
                {filteredQuestions.map((q) => (
                  <QuestionCard
                    key={q.id}
                    {...q}
                    contextos={(q.contextos_ids || [])
                      .map((id) => contextById.get(id))
                      .filter((ctx): ctx is SharedContext => Boolean(ctx))
                      .map((ctx) => ({ id: ctx.id, texto: ctx.texto }))}
                    onClick={() =>
                      setSelectedQuestion({
                        ...q,
                        contextos: (q.contextos_ids || [])
                          .map((id) => contextById.get(id))
                          .filter((ctx): ctx is SharedContext => Boolean(ctx))
                          .map((ctx) => ({ id: ctx.id, texto: ctx.texto }))
                      })
                    }
                  />
                ))}
              </AnimatePresence>
            </div>
          )}

          {activeTab === 'textos' && (
            <div className="space-y-4 pb-12">
              {payload.textos_compartilhados.map((ctx) => (
                <div key={ctx.id} className="border rounded-xl p-4 bg-card">
                  <p className="text-xs font-bold text-primary mb-2">{ctx.id}</p>
                  <RichText content={ctx.texto} className="prose prose-sm max-w-none text-sm text-foreground/90" />
                  <p className="text-xs text-muted-foreground mt-3">
                    Vinculado às questões: {ctx.questoes.join(', ')}
                  </p>
                </div>
              ))}
            </div>
          )}

          {isProcessing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-3xl bg-primary/5"
            >
              <h2 className="text-xl font-bold mb-2">Extraindo prova...</h2>
              <p className="text-muted-foreground text-sm text-center max-w-md mb-6">
                O processamento pode levar alguns minutos para provas longas.
              </p>
              <div className="w-64 h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />
              </div>
            </motion.div>
          )}
        </div>

        <AnimatePresence>
          {modalQuestion && (
            <motion.div
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedQuestion(null)}
            >
              <motion.div
                className="w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-2xl bg-background border shadow-2xl"
                initial={{ scale: 0.96, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.96, y: 20 }}
                onClick={(event) => event.stopPropagation()}
              >
                <div className="flex items-center justify-between px-5 py-4 border-b bg-muted/20">
                  <div>
                    <p className="text-xs font-bold uppercase text-primary">Comparação visual</p>
                    <h2 className="text-lg font-semibold">Questão {modalQuestion.numero}</h2>
                  </div>
                  <button
                    className="p-2 rounded-lg hover:bg-muted"
                    onClick={() => setSelectedQuestion(null)}
                    aria-label="Fechar visualização"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 max-h-[calc(90vh-72px)] overflow-y-auto">
                  <div className="border-r bg-muted/30 p-4">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Imagem ampliada</p>
                    <div className="w-full min-h-[65vh] rounded-xl border bg-background overflow-hidden flex items-center justify-center">
                      {modalQuestion.originalImage ? (
                        <img
                          src={modalQuestion.originalImage}
                          alt={`Imagem ampliada da questão ${modalQuestion.numero}`}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground p-8">Sem imagem disponível para esta questão.</p>
                      )}
                    </div>
                  </div>

                  <div className="p-5 space-y-5 overflow-y-auto">
                    {modalQuestion.contextos.length > 0 && (
                      <section className="p-4 border rounded-xl bg-amber-50/50 border-amber-200">
                        <p className="text-[10px] font-bold uppercase text-amber-700 mb-3">Texto de apoio vinculado</p>
                        <div className="space-y-3">
                          {modalQuestion.contextos.map((ctx) => (
                            <div key={ctx.id}>
                              <p className="text-xs font-bold text-amber-700 mb-1">{ctx.id}</p>
                              <RichText content={ctx.texto} className="prose prose-sm max-w-none text-sm text-foreground/90" />
                            </div>
                          ))}
                        </div>
                      </section>
                    )}

                    <section>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Enunciado extraído</p>
                      <RichText content={modalQuestion.texto} className="prose prose-sm max-w-none text-sm text-foreground/90" />
                    </section>

                    <section>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Alternativas</p>
                      <div className="space-y-2">
                        {modalQuestion.opcoes.map((opt, index) => (
                          <div key={index} className="flex items-start gap-2 p-2 rounded-lg border bg-muted/20">
                            <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded border text-[10px] font-bold">
                              {String.fromCharCode(65 + index)}
                            </span>
                            <RichText content={opt} className="prose prose-sm max-w-none text-xs text-foreground/80" />
                          </div>
                        ))}
                      </div>
                    </section>

                    {modalQuestion.tem_tabela && modalQuestion.tabela_md && (
                      <section className="p-4 border rounded-xl bg-blue-50/60 border-blue-200">
                        <p className="text-[10px] font-bold text-blue-700 uppercase mb-2">Tabela detectada</p>
                        <RichText content={modalQuestion.tabela_md} className="prose prose-sm max-w-none text-sm text-foreground/90" />
                      </section>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
