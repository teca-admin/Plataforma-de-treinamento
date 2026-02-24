import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Layout,
  PlayCircle,
  CheckCircle2,
  Clock,
  User,
  Search,
  ChevronRight,
  MessageSquare,
  Sparkles,
  ArrowLeft,
  GraduationCap,
  TrendingUp,
  Award,
  X,
  CreditCard,
  AlertCircle,
  Plus,
  Trash2,
  CheckCircle,
  Circle,
  Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { Course, Lesson, UserProgress } from './types';
import { supabase } from './supabaseClient';

// --- Interfaces ---

export interface CurrentUser {
  id: string;
  nome_completo: string;
  cpf: string;
  funcao?: string;
}

// --- Components ---

const LoginForm = ({ isEmbedded = false, onLogin }: { isEmbedded?: boolean, onLogin?: (user: CurrentUser) => void }) => {
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [cpf, setCpf] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove tudo que não for dígito
    if (value.length > 11) {
      value = value.slice(0, 11);
    }
    // Aplica a máscara: 000.000.000-00
    let maskedValue = value;
    if (value.length > 9) {
      maskedValue = value.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
    } else if (value.length > 6) {
      maskedValue = value.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    } else if (value.length > 3) {
      maskedValue = value.replace(/(\d{3})(\d{1,3})/, '$1.$2');
    }
    setCpf(maskedValue);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeCompleto || !cpf) {
      setError('Preencha os dois campos.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Substituído single() por maybeSingle() para evitar erro 406 quando o usuário não é encontrado
      const { data, error: supaError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('nome_completo', nomeCompleto.trim().toUpperCase())
        .eq('cpf', cpf)
        .limit(1);

      if (supaError) {
        console.error("Erro do Supabase:", supaError);
        throw supaError;
      }

      if (!data || data.length === 0) {
        setError('Colaborador não encontrado ou dados incorretos.');
      } else {
        const user = data[0] as CurrentUser;
        if (onLogin) {
          onLogin(user);
        } else {
          alert(`Bem-vindo(a), ${user.nome_completo}!`);
        }
      }
    } catch (err) {
      console.error("Erro capturado no login:", err);
      setError('Erro ao conectar ou dados inválidos. Verifique as credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${isEmbedded ? 'w-full max-w-sm mx-auto h-full flex flex-col justify-center' : 'p-8'}`}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-900">Acesso Restrito</h2>
          <p className="text-slate-500 text-sm mt-1">Entre com seu Nome Completo e CPF</p>
        </div>
      </div>

      <form className="space-y-6" onSubmit={handleLogin}>
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 ml-1">Nome Completo</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              value={nomeCompleto}
              onChange={(e) => setNomeCompleto(e.target.value.toUpperCase())}
              placeholder="SEU NOME COMPLETO"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all uppercase"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 ml-1">CPF</label>
          <div className="relative">
            <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              value={cpf}
              onChange={handleCpfChange}
              placeholder="000.000.000-00"
              maxLength={14}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all"
            />
          </div>
        </div>

        <button
          disabled={loading}
          className="w-full bg-brand-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-200 disabled:opacity-70 flex justify-center items-center mt-2"
        >
          {loading ? 'Validando...' : 'Entrar'}
        </button>
      </form>

      <div className="mt-8 pt-8 border-t border-slate-100 text-center">
      </div>
    </div>
  );
};

const LoginModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <LoginForm />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const Navbar = ({ onHome, user, onLogout }: { onHome: () => void, user?: CurrentUser | null, onLogout?: () => void }) => (
  <nav className="sticky top-0 z-50 glass-panel border-b border-slate-200 px-6 py-3 flex items-center justify-between">
    <div className="flex items-center gap-2 cursor-pointer" onClick={onHome}>
      <img src="/src/assets/logo.png" alt="WFS Logo" className="w-8 h-8 object-contain" onError={(e) => {
        // Fallback para quando o logo ainda não foi salvo
        e.currentTarget.style.display = 'none';
        e.currentTarget.parentElement!.insertAdjacentHTML('afterbegin', '<div class="bg-brand-600 p-1.5 rounded-lg"><svg class="text-white w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2v-5"></path></svg></div>');
      }} />
      <span className="text-base font-display font-bold tracking-tight text-slate-900">Plataforma de Treinamentos</span>
    </div>
    <div className="flex items-center gap-6">
      {user && (
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-xs font-bold text-slate-900">{user.nome_completo}</span>
            <span className="text-[10px] uppercase font-semibold text-slate-500">{user.funcao || 'Colaborador'}</span>
          </div>
          <button
            onClick={onLogout}
            className="text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:border-red-100"
          >
            Sair
          </button>
        </div>
      )}
    </div>
  </nav>
);

const CourseCard = ({ course, onClick }: { course: Course, onClick: () => void }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -8 }}
    className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all cursor-pointer group"
    onClick={onClick}
  >
    <div className="relative aspect-video overflow-hidden">
      <img
        src={course.thumbnail}
        alt={course.title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        referrerPolicy="no-referrer"
      />
      <div className="absolute top-4 left-4">
        <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-brand-700 uppercase tracking-wider">
          {course.category}
        </span>
      </div>
    </div>
    <div className="p-6">
      <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-brand-600 transition-colors">{course.title}</h3>
      <p className="text-slate-500 text-sm line-clamp-2 mb-4">{course.description}</p>
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Clock className="w-4 h-4" />
          {course.duration}
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <User className="w-4 h-4" />
          {course.instructor}
        </div>
      </div>
    </div>
  </motion.div>
);

const CoursePlayer = ({ course, onBack }: { course: Course, onBack: () => void }) => {
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(course.lessons?.[0] || null);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 hover:text-brand-600 font-medium transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar para Cursos
        </button>
        <h2 className="text-lg font-bold text-slate-900 hidden md:block">{course.title}</h2>
        <div className="flex items-center gap-2">
          <div className="bg-brand-50 text-brand-700 px-3 py-1 rounded-full text-xs font-bold">
            60% Concluído
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="max-w-4xl mx-auto">
            <div className="aspect-video bg-slate-900 rounded-2xl mb-8 flex items-center justify-center overflow-hidden shadow-2xl relative group">
              <img
                src={course.thumbnail}
                className="w-full h-full object-cover opacity-40 blur-sm"
                referrerPolicy="no-referrer"
              />
              <PlayCircle className="w-20 h-20 text-white opacity-80 group-hover:scale-110 transition-transform cursor-pointer" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="h-1 w-full bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full w-1/3 bg-brand-500"></div>
                </div>
              </div>
            </div>

            <div className="mb-10">
              <h1 className="text-3xl font-bold text-slate-900 mb-4">{activeLesson?.title}</h1>
              <div className="prose prose-slate max-w-none">
                <div className="text-slate-600 leading-relaxed text-lg">
                  <Markdown>{activeLesson?.content}</Markdown>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Lessons List */}
        <div className="w-full lg:w-96 bg-white border-l border-slate-200 overflow-y-auto">
          <div className="p-6 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-brand-600" />
              Conteúdo do Curso
            </h3>
          </div>
          <div className="p-2">
            {course.lessons?.map((lesson, index) => (
              <div
                key={lesson.id}
                onClick={() => setActiveLesson(lesson)}
                className={`p-4 rounded-xl cursor-pointer transition-all flex items-start gap-4 group ${activeLesson?.id === lesson.id
                  ? 'bg-brand-50 border border-brand-100'
                  : 'hover:bg-slate-50'
                  }`}
              >
                <div className={`mt-1 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center border-2 ${activeLesson?.id === lesson.id
                  ? 'border-brand-500 bg-brand-500 text-white'
                  : 'border-slate-200 text-slate-400 group-hover:border-brand-300'
                  }`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h4 className={`text-sm font-bold mb-1 ${activeLesson?.id === lesson.id ? 'text-brand-900' : 'text-slate-700'
                    }`}>
                    {lesson.title}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <PlayCircle className="w-3 h-3" />
                    15:00
                  </div>
                </div>
                {index === 0 && <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Interfaces for Quiz ---

interface AlternativaInput {
  id: string;
  texto: string;
  is_correta: boolean;
}

interface QuestaoInput {
  id: string;
  pergunta: string;
  alternativas: AlternativaInput[];
}

// --- Component CreateQuiz ---
const CreateQuiz = ({ onCancel, onSuccess }: { onCancel: () => void, onSuccess: () => void }) => {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [questoes, setQuestoes] = useState<QuestaoInput[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const addQuestao = () => {
    setQuestoes([...questoes, {
      id: Math.random().toString(),
      pergunta: '',
      alternativas: [
        { id: Math.random().toString(), texto: '', is_correta: true },
        { id: Math.random().toString(), texto: '', is_correta: false }
      ]
    }]);
  };

  const updateQuestao = (qId: string, texto: string) => {
    setQuestoes(questoes.map(q => q.id === qId ? { ...q, pergunta: texto } : q));
  };

  const removeQuestao = (qId: string) => {
    setQuestoes(questoes.filter(q => q.id !== qId));
  };

  const addAlternativa = (qId: string) => {
    setQuestoes(questoes.map(q => {
      if (q.id === qId) {
        return { ...q, alternativas: [...q.alternativas, { id: Math.random().toString(), texto: '', is_correta: false }] };
      }
      return q;
    }));
  };

  const updateAlternativa = (qId: string, aId: string, texto: string) => {
    setQuestoes(questoes.map(q => {
      if (q.id === qId) {
        return { ...q, alternativas: q.alternativas.map(a => a.id === aId ? { ...a, texto } : a) };
      }
      return q;
    }));
  };

  const removeAlternativa = (qId: string, aId: string) => {
    setQuestoes(questoes.map(q => {
      if (q.id === qId) {
        return { ...q, alternativas: q.alternativas.filter(a => a.id !== aId) };
      }
      return q;
    }));
  };

  const setCorreta = (qId: string, aId: string) => {
    setQuestoes(questoes.map(q => {
      if (q.id === qId) {
        return { ...q, alternativas: q.alternativas.map(a => ({ ...a, is_correta: a.id === aId })) };
      }
      return q;
    }));
  };

  const handleSave = async () => {
    setError('');
    if (!titulo.trim()) return setError("O título da avaliação é obrigatório.");
    if (questoes.length === 0) return setError("Adicione ao menos uma questão.");

    for (const q of questoes) {
      if (!q.pergunta.trim()) return setError("Todas as questões precisam de um texto de pergunta.");
      if (q.alternativas.length < 2) return setError("Todas as questões precisam de ao menos 2 alternativas.");
      const hasCorreta = q.alternativas.some(a => a.is_correta);
      if (!hasCorreta) return setError("Todas as questões precisam ter exatamente UMA alternativa marcada como correta.");
      for (const a of q.alternativas) {
        if (!a.texto.trim()) return setError("Não deixe opções de alternativas em branco.");
      }
    }

    setSaving(true);

    try {
      // 1. Insert Avaliação
      const { data: avaliacao, error: errAvaliacao } = await supabase
        .from('avaliacoes')
        .insert({ titulo: titulo.trim(), descricao: descricao.trim() })
        .select()
        .single();

      if (errAvaliacao) throw errAvaliacao;

      // 2. Insert Questões and Alternativas
      for (const q of questoes) {
        const { data: questao, error: errQuestao } = await supabase
          .from('questoes')
          .insert({ avaliacao_id: avaliacao.id, pergunta: q.pergunta.trim() })
          .select()
          .single();

        if (errQuestao) throw errQuestao;

        const alternativasToInsert = q.alternativas.map(a => ({
          questao_id: questao.id,
          texto: a.texto.trim(),
          is_correta: a.is_correta
        }));

        const { error: errAlt } = await supabase
          .from('alternativas')
          .insert(alternativasToInsert);

        if (errAlt) throw errAlt;
      }

      alert("Avaliação criada com sucesso!");
      onSuccess();
    } catch (err: any) {
      console.error(err);
      setError("Erro ao salvar a avaliação no banco de dados. " + (err.message || ''));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-4xl mx-auto text-left">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Nova Avaliação</h2>
          <p className="text-slate-500 text-sm">Crie um quiz interativo para os colaboradores</p>
        </div>
        <button onClick={onCancel} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors font-bold text-slate-400 hover:text-slate-600">
          <X className="w-5 h-5" />
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2 mb-5 font-medium">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="space-y-5 mb-8">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5">Título da Avaliação</label>
          <input
            type="text"
            placeholder="Ex: Treinamento de Segurança no Trabalho"
            value={titulo}
            onChange={e => setTitulo(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all font-medium text-slate-900"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5">Descrição (Opcional)</label>
          <textarea
            placeholder="Instruções ou informações sobre esta avaliação"
            value={descricao}
            onChange={e => setDescricao(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all text-slate-700 resize-none h-20"
          />
        </div>
      </div>

      <div className="space-y-6">
        {questoes.map((q, qIndex) => (
          <div key={q.id} className="bg-slate-50 p-5 rounded-xl border border-slate-200 relative">
            <div className="absolute top-3 right-3 flex gap-2">
              <button onClick={() => removeQuestao(q.id)} className="text-red-400 hover:text-red-600 transition-colors p-1.5 hover:bg-white rounded-lg" title="Remover Questão">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <h3 className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
              <span className="bg-brand-100 text-brand-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">{qIndex + 1}</span>
              Pergunta
            </h3>

            <input
              type="text"
              placeholder="Digite a pergunta aqui..."
              value={q.pergunta}
              onChange={e => updateQuestao(q.id, e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all font-medium text-slate-900 mb-4"
            />

            <div className="space-y-2.5 pl-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Alternativas (Marque a correta)</label>
              {q.alternativas.map((alt) => (
                <div key={alt.id} className="flex items-center gap-3">
                  <button
                    onClick={() => setCorreta(q.id, alt.id)}
                    className={`flex-shrink-0 transition-colors ${alt.is_correta ? 'text-emerald-500' : 'text-slate-300 hover:text-slate-400'}`}
                  >
                    {alt.is_correta ? <CheckCircle className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                  </button>
                  <input
                    type="text"
                    placeholder="Opção de resposta..."
                    value={alt.texto}
                    onChange={e => updateAlternativa(q.id, alt.id, e.target.value)}
                    className={`flex-1 bg-white border rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none transition-all text-sm ${alt.is_correta ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200'}`}
                  />
                  <button onClick={() => removeAlternativa(q.id, alt.id)} className="text-slate-400 hover:text-red-500 transition-colors p-1.5">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => addAlternativa(q.id)}
                className="text-brand-600 hover:text-brand-700 text-xs font-bold flex items-center gap-1 mt-3 px-2 py-1 hover:bg-brand-50 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar Alternativa
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={addQuestao}
        className="w-full border-2 border-dashed border-slate-200 text-slate-500 hover:text-brand-600 hover:border-brand-200 hover:bg-brand-50 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 mt-5"
      >
        <Plus className="w-4 h-4" /> Nova Pergunta
      </button>

      <div className="mt-8 pt-5 border-t border-slate-100 flex justify-end gap-3">
        <button onClick={onCancel} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors">
          Cancelar
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-brand-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-200 disabled:opacity-70 flex items-center gap-2"
        >
          {saving ? 'Salvando...' : <><Save className="w-4 h-4" /> Salvar Avaliação</>}
        </button>
      </div>
    </div>
  );
};

// --- Component SolveQuizList & TakeQuiz ---

interface Avaliacao {
  id: string;
  titulo: string;
  descricao: string;
  created_at: string;
}

interface Questao {
  id: string;
  pergunta: string;
  alternativas: {
    id: string;
    texto: string;
    is_correta: boolean;
  }[];
}

const TakeQuiz = ({ avaliacao, onBack, user }: { avaliacao: Avaliacao, onBack: () => void, user: CurrentUser }) => {
  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [respostas, setRespostas] = useState<Record<string, string>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    fetchQuiz();
  }, [avaliacao.id]);

  const fetchQuiz = async () => {
    try {
      const { data: qData, error: qError } = await supabase
        .from('questoes')
        .select(`
          id,
          pergunta,
          alternativas (
            id,
            texto,
            is_correta
          )
        `)
        .eq('avaliacao_id', avaliacao.id);

      if (qError) throw qError;
      setQuestoes((qData as any) || []);
    } catch (err: any) {
      setError('Erro ao carregar o quiz. Verifique a conexão.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (questaoId: string, alternativaId: string) => {
    if (isFinished) return;
    setRespostas({ ...respostas, [questaoId]: alternativaId });
  };

  const calculateScore = async () => {
    let corretas = 0;
    for (const q of questoes) {
      const respId = respostas[q.id];
      const alt = q.alternativas.find(a => a.id === respId);
      if (alt && alt.is_correta) {
        corretas++;
      }
    }
    setScore(corretas);
    setIsFinished(true);

    // Salvar o resultado no Supabase
    try {
      await supabase.from('resultados').insert({
        avaliacao_id: avaliacao.id,
        usuario_id: user.id,
        score: corretas,
        total_questoes: questoes.length
      });
    } catch (err) {
      console.error('Erro ao salvar nota', err);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500 font-bold">Carregando questionário...</div>;
  if (error) return <div className="p-8 text-center text-red-500 font-bold">{error}</div>;

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm max-w-4xl mx-auto text-left relative overflow-hidden">
      {!isFinished && (
        <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100">
          <div
            className="h-full bg-brand-500 transition-all duration-300"
            style={{ width: `${(Object.keys(respostas).length / questoes.length) * 100}%` }}
          />
        </div>
      )}

      <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100 mt-2">
        <div>
          <h2 className="text-xl font-black text-slate-900">{avaliacao.titulo}</h2>
          <p className="text-slate-500 text-sm mt-1">{avaliacao.descricao}</p>
        </div>
        <button onClick={onBack} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors font-bold text-slate-400 hover:text-slate-600">
          <X className="w-5 h-5" />
        </button>
      </div>

      {!isFinished ? (
        <div className="space-y-8">
          {questoes.map((q, index) => (
            <div key={q.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative hover:border-brand-200 transition-colors">
              <h3 className="text-lg font-bold text-slate-900 mb-5 flex items-start gap-3">
                <span className="bg-brand-100 text-brand-700 w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0">{index + 1}</span>
                <span className="mt-0.5 leading-snug">{q.pergunta}</span>
              </h3>

              <div className="space-y-3 pl-0 md:pl-11">
                {q.alternativas.map((alt) => (
                  <div
                    key={alt.id}
                    onClick={() => handleSelect(q.id, alt.id)}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${respostas[q.id] === alt.id
                      ? 'border-brand-500 bg-brand-50 shadow-sm shadow-brand-100'
                      : 'border-slate-100 bg-slate-50 hover:border-brand-300 hover:bg-white'
                      }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${respostas[q.id] === alt.id ? 'border-brand-600 bg-brand-600' : 'border-slate-300 bg-white'
                      }`}>
                      {respostas[q.id] === alt.id && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    <span className={`font-medium text-sm ${respostas[q.id] === alt.id ? 'text-brand-900' : 'text-slate-700'}`}>
                      {alt.texto}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center">
            <span className="text-slate-500 font-medium text-sm">
              <strong className="text-brand-600 text-base">{Object.keys(respostas).length}</strong> de {questoes.length} respondidas
            </span>
            <button
              onClick={calculateScore}
              disabled={Object.keys(respostas).length < questoes.length}
              className="bg-brand-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-brand-700 transition-all shadow-md shadow-brand-200 disabled:opacity-50 disabled:shadow-none flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" /> Submeter Respostas
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-10">
          <div className="w-20 h-20 bg-brand-50 text-brand-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner shadow-brand-200">
            <Award className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-4">Avaliação Concluída!</h2>
          <div className="bg-slate-50 inline-block px-8 py-5 rounded-2xl border border-slate-100 mb-8">
            <p className="text-sm text-slate-600 mb-1">Seu resultado:</p>
            <p className="text-3xl">
              <span className="font-black text-brand-600">{score}</span>
              <span className="text-slate-400 font-bold mx-1.5">/</span>
              <span className="font-black text-slate-900">{questoes.length}</span>
            </p>
            <p className="text-[11px] font-bold text-emerald-500 mt-3 bg-emerald-50 inline-block px-3 py-1 rounded-full uppercase tracking-wider">
              {Math.round((score / questoes.length) * 100)}% de Aproveitamento
            </p>
          </div>
          <br />
          <button
            onClick={onBack}
            className="bg-slate-900 text-white px-8 py-3 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg hover:-translate-y-0.5"
          >
            Voltar para Avaliações
          </button>
        </div>
      )}
    </div >
  );
};

const SolveQuizList = ({ user }: { user: CurrentUser }) => {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeAvaliacao, setActiveAvaliacao] = useState<Avaliacao | null>(null);

  useEffect(() => {
    fetchAvaliacoes();
  }, []);

  const fetchAvaliacoes = async () => {
    try {
      const { data, error } = await supabase
        .from('avaliacoes')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setAvaliacoes(data);
      }
    } finally {
      setLoading(false);
    }
  };

  if (activeAvaliacao) {
    return <TakeQuiz avaliacao={activeAvaliacao} onBack={() => setActiveAvaliacao(null)} user={user} />;
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-5xl mx-auto text-left">
      <div className="mb-6 pb-4 border-b border-slate-100">
        <h2 className="text-lg font-black text-slate-900 mb-1.5 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-brand-600" />
          Avaliações Disponíveis
        </h2>
        <p className="text-slate-500 text-sm">Selecione um treinamento para iniciar o questionário interativo</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
        </div>
      ) : avaliacoes.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <CheckCircle className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Tudo em dia!</h3>
          <p className="text-slate-500 text-sm max-w-xs mx-auto">Não há nenhuma avaliação ou treinamento pendente para você no momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {avaliacoes.map((av) => (
            <div
              key={av.id}
              onClick={() => setActiveAvaliacao(av)}
              className="bg-white border-2 border-slate-100 p-5 rounded-2xl hover:border-brand-500 hover:shadow-xl hover:shadow-brand-100 hover:-translate-y-1 transition-all group flex flex-col items-start cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-brand-50 to-transparent rounded-bl-full opacity-50 group-hover:opacity-100 transition-opacity pointer-events-none" />

              <div className="w-10 h-10 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-brand-600 group-hover:text-white transition-colors relative z-10">
                <Layout className="w-5 h-5" />
              </div>

              <h3 className="text-base font-black text-slate-900 mb-2 group-hover:text-brand-700 transition-colors relative z-10 leading-tight">
                {av.titulo}
              </h3>

              <p className="text-slate-500 text-xs line-clamp-2 mb-4 flex-1 relative z-10">
                {av.descricao || 'Nenhuma descrição fornecida.'}
              </p>

              <button className="w-full bg-slate-50 text-slate-700 text-xs font-bold py-2.5 rounded-lg group-hover:bg-brand-50 group-hover:text-brand-700 transition-colors flex items-center justify-center gap-1.5 relative z-10">
                <PlayCircle className="w-4 h-4 text-brand-500" /> Iniciar Questionário
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- Quiz Dashboard ---

const Dashboard = ({ user }: { user: CurrentUser }) => {
  const [activeTab, setActiveTab] = useState<'create' | 'solve'>('solve');
  const [isCreating, setIsCreating] = useState(false);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-6 py-2.5 flex gap-6">
        <button
          onClick={() => { setActiveTab('solve'); setIsCreating(false); }}
          className={`text-sm font-bold transition-colors relative py-1.5 ${activeTab === 'solve' ? 'text-brand-600' : 'text-slate-500 hover:text-slate-800'}`}
        >
          Fazer Avaliação
          {activeTab === 'solve' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 rounded-t-full -mb-3" />
          )}
        </button>

        {/* Permissão provisória: Idealmente apenas admins/RH poderiam criar */}
        <button
          onClick={() => { setActiveTab('create'); setIsCreating(false); }}
          className={`text-sm font-bold transition-colors relative py-1.5 ${activeTab === 'create' ? 'text-brand-600' : 'text-slate-500 hover:text-slate-800'}`}
        >
          Cadastro de Avaliação
          {activeTab === 'create' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 rounded-t-full -mb-3" />
          )}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'solve' && (
            <SolveQuizList user={user} />
          )}

          {activeTab === 'create' && !isCreating && (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center">
              <Layout className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h2 className="text-lg font-bold text-slate-900 mb-1.5">Criar Nova Avaliação</h2>
              <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">Monte um quiz com perguntas e alternativas para testar os colaboradores.</p>
              <button
                onClick={() => setIsCreating(true)}
                className="bg-brand-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-brand-700 transition-all shadow-md shadow-brand-200 flex items-center justify-center gap-2 mx-auto"
              >
                <Plus className="w-4 h-4" /> Nova Avaliação
              </button>
            </div>
          )}

          {activeTab === 'create' && isCreating && (
            <CreateQuiz onCancel={() => setIsCreating(false)} onSuccess={() => setIsCreating(false)} />
          )}
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  useEffect(() => {
    document.title = "Plataforma de Treinamentos - WFS MAO";
    fetch('/api/courses')
      .then(res => res.json())
      .then(data => {
        setCourses(data);

        setLoading(false);
      });
  }, []);

  const handleCourseClick = (course: Course) => {
    setLoading(true);
    fetch(`/api/courses/${course.id}`)
      .then(res => res.json())
      .then(data => {
        setSelectedCourse(data);
        setLoading(false);
      });
  };

  const filteredCourses = courses.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (selectedCourse) {
    return <CoursePlayer course={selectedCourse} onBack={() => setSelectedCourse(null)} />;
  }

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      <Navbar onHome={() => setSelectedCourse(null)} user={user} onLogout={() => setUser(null)} />

      {!user ? (
        <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Left Side: Hero & Branding */}
          <section className="w-full lg:w-[45%] p-8 lg:p-10 flex flex-col justify-center bg-white border-r border-slate-200 relative overflow-hidden">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="relative z-10"
            >
              <div className="inline-flex items-center gap-1.5 bg-brand-100 text-brand-700 px-3 py-1.5 rounded-full text-[11px] font-bold mb-5 tracking-wide">
                <Layout className="w-3.5 h-3.5" />
                TREINAMENTO CORPORATIVO
              </div>
              <h1 className="text-3xl lg:text-4xl font-display font-black text-slate-900 leading-[1.1] mb-5 tracking-tight max-w-lg">
                Evolua suas <span className="text-brand-600">Habilidades</span> de forma Profissional.
              </h1>
              <p className="text-base text-slate-600 mb-8 leading-relaxed max-w-md">
                Acesse conteúdos exclusivos, capacitações e acelere seu crescimento na WFS MAO.
              </p>
            </motion.div>

            {/* Decorative background element */}
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-brand-50 rounded-full blur-3xl opacity-50"></div>
            <div className="absolute top-20 -right-20 w-40 h-40 bg-emerald-50 rounded-full blur-3xl opacity-50"></div>
          </section>

          {/* Right Side: Login Form */}
          <section id="login-section" className="flex-1 flex flex-col items-center justify-center p-6 lg:p-8 bg-slate-50 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-xl border border-slate-200 relative z-10"
            >
              <LoginForm isEmbedded={true} onLogin={setUser} />
            </motion.div>

            {/* Decorative Elements for the Right Side */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] pointer-events-none overflow-hidden opacity-10">
              <div className="absolute top-0 right-0 w-96 h-96 bg-brand-200 rounded-full blur-[100px]" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-200 rounded-full blur-[80px]" />
            </div>

            <div className="mt-8 text-xs text-slate-400 flex gap-6 relative z-10">
            </div>
          </section>
        </main>
      ) : (
        <Dashboard user={user} />
      )}

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );

}
