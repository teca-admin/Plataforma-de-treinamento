-- Criar tabela de avaliações (Quizzes)
CREATE TABLE IF NOT EXISTS plataforma_de_treinamento.avaliacoes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    titulo TEXT NOT NULL,
    descricao TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Criar tabela de questões (Perguntas de uma avaliação)
CREATE TABLE IF NOT EXISTS plataforma_de_treinamento.questoes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    avaliacao_id UUID NOT NULL REFERENCES plataforma_de_treinamento.avaliacoes(id) ON DELETE CASCADE,
    pergunta TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Criar tabela de alternativas (Opções de resposta para uma questão)
CREATE TABLE IF NOT EXISTS plataforma_de_treinamento.alternativas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    questao_id UUID NOT NULL REFERENCES plataforma_de_treinamento.questoes(id) ON DELETE CASCADE,
    texto TEXT NOT NULL,
    is_correta BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Conceder permissões para o usuário anônimo (padrão de API do Supabase sem JWT)
GRANT SELECT, INSERT, UPDATE, DELETE ON plataforma_de_treinamento.avaliacoes TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON plataforma_de_treinamento.questoes TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON plataforma_de_treinamento.alternativas TO anon, authenticated;

-- Criar tabela de resultados (Pontuação dos usuários)
CREATE TABLE IF NOT EXISTS plataforma_de_treinamento.resultados (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    avaliacao_id UUID NOT NULL REFERENCES plataforma_de_treinamento.avaliacoes(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES plataforma_de_treinamento.usuarios(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    total_questoes INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

GRANT SELECT, INSERT, UPDATE, DELETE ON plataforma_de_treinamento.resultados TO anon, authenticated;
