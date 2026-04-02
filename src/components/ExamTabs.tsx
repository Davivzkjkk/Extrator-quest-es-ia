'use client';

import { useState, useEffect } from 'react';
import { ChevronRight, Download } from 'lucide-react';
import QuestionCard from './QuestionCard';

export default function ExamTabs() {
  const [data, setData] = useState(null);
  const [activeExam, setActiveExam] = useState('exam_1');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/questions', { cache: 'no-store' });
        const json = await res.json();
        setData(json);
        if (json.exames?.length > 0) {
          setActiveExam(json.exames[0].id);
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

  if (!data?.exames || data.exames.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        <p>Nenhuma prova disponível. Realize uma extração primeiro.</p>
      </div>
    );
  }

  const currentExam = data.exames.find((e) => e.id === activeExam);
  const examQuestions = data.questoes?.filter((q) =>
    currentExam?.questoes?.includes(q.id)
  ) || [];

  const filteredQuestions = examQuestions.filter(
    (q) =>
      q.texto.toLowerCase().includes(search.toLowerCase()) ||
      q.numero.toString().includes(search)
  );

  return (
    <div className="w-full">
      {/* Exam Tabs */}
      <div className="border-b border-gray-200 bg-gray-50 overflow-x-auto">
        <div className="flex gap-2 p-4 min-w-min">
          {data.exames.map((exam) => (
            <button
              key={exam.id}
              onClick={() => setActiveExam(exam.id)}
              className={`px-6 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeExam === exam.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
              }`}
            >
              {exam.titulo}
              <span className="ml-2 text-sm opacity-75">({exam.total_questoes})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Current Exam Info */}
      {currentExam && (
        <div className="bg-blue-50 border-b border-blue-200 p-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-blue-900">{currentExam.titulo}</h2>
              <p className="text-sm text-blue-700">
                Páginas: {currentExam.paginas.join(', ')} • {currentExam.total_questoes} questões
              </p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Download size={18} /> Exportar
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="p-4 border-b border-gray-200">
        <input
          type="text"
          placeholder="Buscar por número ou texto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Questions Grid */}
      <div className="p-6">
        {filteredQuestions.length > 0 ? (
          <div className="grid gap-6">
            {filteredQuestions.map((question) => (
              <QuestionCard key={question.id} question={question} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p>Nenhuma questão encontrada</p>
          </div>
        )}
      </div>

      {/* Result Counter */}
      <div className="p-4 border-t border-gray-200 bg-gray-50 text-center text-sm text-gray-600">
        Exibindo {filteredQuestions.length} de {examQuestions.length} questões
      </div>
    </div>
  );
}
