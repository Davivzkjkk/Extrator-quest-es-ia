'use client';

import { useState, useEffect } from 'react';
import ExamTabs from './ExamTabs';
import DashboardView from './DashboardView';

export default function DataViewer() {
  const [data, setData] = useState(null);
  const [viewMode, setViewMode] = useState('exam'); // 'exam' ou 'dashboard'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/questions', { cache: 'no-store' });
        const json = await res.json();
        setData(json);
        
        // Auto-detect view mode based on data structure
        if (json.exames && json.exames.length > 0) {
          setViewMode('exam');
        } else {
          setViewMode('dashboard');
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* View Mode Toggle */}
      {data?.exames && data.exames.length > 0 && (
        <div className="border-b bg-gray-50 p-2 flex gap-2">
          <button
            onClick={() => setViewMode('exam')}
            className={`px-4 py-2 rounded font-medium ${
              viewMode === 'exam'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border'
            }`}
          >
            📚 Visualização por Provas
          </button>
          <button
            onClick={() => setViewMode('dashboard')}
            className={`px-4 py-2 rounded font-medium ${
              viewMode === 'dashboard'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border'
            }`}
          >
            📊 Visualização Clássica
          </button>
        </div>
      )}

      {/* Render based on view mode */}
      {viewMode === 'exam' ? (
        <ExamTabs />
      ) : (
        <DashboardView data={data} />
      )}
    </div>
  );
}
