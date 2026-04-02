"use client";

import React from 'react';
import { CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { RichText } from '@/components/RichText';

interface QuestionCardProps {
  id: string
  numero: number
  originalImage?: string
  texto: string
  opcoes: string[]
  tem_tabela?: boolean
  tabela_md?: string
  contextos?: Array<{ id: string; texto: string }>
  onClick?: () => void
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  numero,
  originalImage,
  texto,
  opcoes,
  tem_tabela,
  tabela_md,
  contextos = [],
  onClick
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group relative bg-card border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="flex items-center justify-between p-4 border-b bg-muted/30">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
            {numero}
          </span>
          <h3 className="font-semibold text-sm tracking-tight text-foreground/80">Questão EsPCEx</h3>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <CheckCircle size={14} className="text-emerald-500" />
          <span>Dados estruturados</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x border-b">
        <div className="relative bg-muted/50 p-6">
          <div className="absolute top-2 left-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-background/80 px-2 py-1 rounded">
            Snippet Original
          </div>
          <div className="w-full min-h-[260px] border border-border rounded-lg bg-background/40 overflow-hidden">
            {originalImage ? (
              <img
                src={originalImage}
                className="w-full h-full object-contain"
                alt={`Snippet da questão ${numero}`}
              />
            ) : (
              <div className="w-full h-[260px] flex items-center justify-center text-xs text-muted-foreground">
                Sem recorte disponível
              </div>
            )}
          </div>
        </div>

        <div className="p-6 overflow-y-auto bg-background">
          <div className="absolute top-2 right-2 text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-2 py-1 rounded">
            Dados Extraídos
          </div>

          <div className="space-y-5">
            {contextos.length > 0 && (
              <section className="p-3 border rounded-lg bg-amber-50/50 border-amber-200">
                <p className="text-[10px] font-bold text-amber-700 uppercase mb-2">Texto de apoio vinculado</p>
                <div className="space-y-2">
                  {contextos.map((ctx) => (
                    <div key={ctx.id} className="text-xs text-foreground/80">
                      <p className="font-semibold text-amber-700 mb-1">ID: {ctx.id}</p>
                      <RichText content={ctx.texto} className="prose prose-sm max-w-none text-xs text-foreground/80" />
                    </div>
                  ))}
                </div>
              </section>
            )}

            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Enunciado</p>
              <RichText content={texto || 'Sem enunciado'} className="prose prose-sm max-w-none text-sm text-foreground/90 leading-relaxed font-medium" />
            </div>

            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Alternativas</p>
              <div className="space-y-2">
                {opcoes.map((opt, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 hover:bg-muted/50 rounded transition-colors">
                    <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center border rounded text-[10px] font-bold uppercase text-muted-foreground">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <RichText content={opt} className="prose prose-sm max-w-none text-xs text-foreground/80" />
                  </div>
                ))}
              </div>
            </div>

            {tem_tabela && tabela_md && (
              <section className="p-3 border rounded-lg bg-blue-50/60 border-blue-200">
                <p className="text-[10px] font-bold text-blue-700 uppercase mb-2">Tabela detectada</p>
                <RichText content={tabela_md} className="prose prose-sm max-w-none text-[11px] text-foreground/80" />
              </section>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
