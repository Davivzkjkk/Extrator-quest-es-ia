'use client';

import { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { QuestionCard } from './QuestionCard';
import { RichText } from './RichText';
import { FileText } from 'lucide-react';

interface SharedContext {
  id: string;
  texto: string;
  questoes: number[];
}

interface ExtractedQuestion {
  id: string;
  numero: number;
  texto: string;
  opcoes: string[];
  coords?: number[];
  tem_tabela?: boolean;
  tabela_md?: string;
  originalImage?: string;
  contextos_ids?: string[];
  imagens_associadas?: Array<{
    id: string;
    tipo: string;
    descricao: string;
    caminho: string;
  }>;
}

interface DashboardViewProps {
  data: {
    questoes?: ExtractedQuestion[];
    textos_compartilhados?: SharedContext[];
  };
}

export default function DashboardView({ data }: DashboardViewProps) {
  const [activeTab, setActiveTab] = useState<'questoes' | 'textos'>('questoes');
  const [search, setSearch] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);

  const questoes = data.questoes || [];
  const textos = data.textos_compartilhados || [];

  const contextById = useMemo(() => {
    const map = new Map<string, SharedContext>();
    for (const ctx of textos) {
      map.set(ctx.id, ctx);
    }
    return map;
  }, [textos]);

  const filteredQuestions = useMemo(() => {
    if (!search.trim()) return questoes;
    const term = search.toLowerCase();
    return questoes.filter((q) => {
      if (q.texto?.toLowerCase().includes(term)) return true;
      if ((q.opcoes || []).some((opt) => String(opt).toLowerCase().includes(term))) return true;
      return String(q.numero).includes(term);
    });
  }, [questoes, search]);

  return (
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
          <span>{questoes.length} questões estruturadas</span>
        </div>
      </header>

      <div className="p-8 max-w-7xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-1">Painel de Questões</h1>
          <p className="text-muted-foreground text-sm">
            Visualização clássica de todas as questões extraídas.
          </p>
        </div>

        <div className="mb-6 flex gap-2 border-b">
          <button
            onClick={() => setActiveTab('questoes')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'questoes'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Questões ({questoes.length})
          </button>
          <button
            onClick={() => setActiveTab('textos')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'textos'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Textos de apoio ({textos.length})
          </button>
        </div>

        {activeTab === 'questoes' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-12">
            <AnimatePresence mode="popLayout">
              {filteredQuestions.length === 0 ? (
                <motion.div className="col-span-full py-12 text-center">
                  <p className="text-muted-foreground">Nenhuma questão encontrada.</p>
                </motion.div>
              ) : (
                filteredQuestions.map((q) => (
                  <motion.div
                    key={q.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <QuestionCard
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
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        )}

        {activeTab === 'textos' && (
          <div className="space-y-4 pb-12">
            {textos.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center">Nenhum texto de apoio disponível.</p>
            ) : (
              textos.map((ctx) => (
                <div key={ctx.id} className="border rounded-xl p-4 bg-card">
                  <p className="text-xs font-bold text-primary mb-2">{ctx.id}</p>
                  <RichText content={ctx.texto} className="prose prose-sm max-w-none text-sm text-foreground/90" />
                  <p className="text-xs text-muted-foreground mt-3">
                    Vinculado às questões: {ctx.questoes.join(', ')}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </main>
  );
}
