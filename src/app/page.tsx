'use client';

import React, { useState } from 'react';
import { UploadCloud, Zap } from 'lucide-react';
import DataViewer from '@/components/DataViewer';

export default function Dashboard() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Pronto para extrair.');
  const [refreshKey, setRefreshKey] = useState(0);

  async function handleExtract(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!selectedFile) {
      setStatusMessage('Selecione um PDF antes de iniciar a extração.');
      return;
    }

    setIsProcessing(true);
    setStatusMessage('Enviando prova e iniciando extração...');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/extract', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Falha ao extrair prova');
      }

      const data = await response.json();
      const totalQuestoes = Array.isArray(data?.questoes)
        ? data.questoes.length
        : Array.isArray(data)
          ? data.length
          : 0;

      setStatusMessage(`Extração concluída: ${totalQuestoes} questões.`);
      setRefreshKey((current) => current + 1);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Erro inesperado durante a extração.');
    } finally {
      setIsProcessing(false);
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

        <div className="mt-6 w-full p-3 bg-primary/5 border border-primary/10 rounded-xl">
          <p className="text-[10px] font-bold text-primary uppercase mb-1">Arquivo selecionado</p>
          <p className="text-xs text-muted-foreground break-words">
            {selectedFile ? selectedFile.name : 'Nenhum arquivo selecionado.'}
          </p>
        </div>

        <div className="mt-auto px-1 w-full">
          <div className="p-3 bg-primary/5 border border-primary/10 rounded-xl">
            <p className="text-[10px] font-bold text-primary uppercase mb-1">Status</p>
            <p className="text-xs text-muted-foreground">{statusMessage}</p>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col">
        <header className="h-20 border-b flex items-center px-8 bg-background/50 backdrop-blur-sm sticky top-0 z-10">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Painel de Extração de Provas</h1>
            <p className="text-muted-foreground text-sm">Envie o PDF na lateral e acompanhe os dados abaixo.</p>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full">
          {isProcessing ? (
            <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-3xl bg-primary/5">
              <h2 className="text-xl font-bold mb-2">Extraindo prova...</h2>
              <p className="text-muted-foreground text-sm text-center max-w-md">
                O processamento pode levar alguns minutos para provas longas.
              </p>
            </div>
          ) : (
            <DataViewer refreshKey={refreshKey} />
          )}
        </div>
      </main>
    </div>
  );
}
