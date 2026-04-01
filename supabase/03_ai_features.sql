-- ==============================================================================
-- 03_AI_FEATURES.SQL
-- Implémentation des tables et fonctions IA pour Privo
-- ==============================================================================

-- 1. EXTENSION VECTOR
-- Essentielle pour la recherche intelligente et l'assistant RAG
create extension if not exists vector
with schema extensions;

-- ==============================================================================
-- 2. ANALYSE ET MÉTADONNÉES IA DES DOCUMENTS
-- Couvre : OCR, Classification, Résumé, Détection de Fraude
-- ==============================================================================
create table public.document_ai_analysis (
    id uuid default gen_random_uuid() primary key,
    document_id uuid references public.documents(id) on delete cascade not null,
    user_id uuid references public.profiles(id) on delete cascade not null,
    
    -- Classification et OCR
    detected_type text, -- "Identité", "Contrat", "Diplôme"...
    confidence_score float, -- Fiabilité de l'IA (0.0 à 1.0)
    extracted_text text, -- Le contenu global lu par l'IA
    extracted_data jsonb, -- Noms, dates, montants détectés (clé/valeur)
    
    -- Sécurité & Fraude B2B
    is_suspicious boolean default false,
    fraud_flags jsonb, -- ex: ["Date falsifiée", "Anomalie visuelle"]
    
    -- Productivité
    summary text, -- Résumé intelligent pour les longs documents
    key_points jsonb, -- Points essentiels et risques (contrats)
    translated_content text, -- Contenu traduit
    
    -- Statut du traitement asynchrone (Edge Functions)
    processing_status text default 'pending' check (processing_status in ('pending', 'processing', 'completed', 'failed')),
    processed_at timestamp with time zone,
    
    unique(document_id)
);

-- ==============================================================================
-- 3. EMBEDDINGS (RECHERCHE INTELLIGENTE SÉMANTIQUE)
-- Utilisé pour "Recherche Intelligente" et "Assistant Chat"
-- ==============================================================================
create table public.document_embeddings (
    id uuid default gen_random_uuid() primary key,
    document_id uuid references public.documents(id) on delete cascade not null,
    user_id uuid references public.profiles(id) on delete cascade not null,
    content_chunk text not null, -- Partie du texte du document
    embedding vector(1536), -- Le vecteur mathématique (ex: OpenAI ada-002)
    created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Index pour la performance de recherche ultra-rapide (HNSW)
create index on public.document_embeddings using hnsw (embedding vector_cosine_ops);

-- Fonction de matching IA (appelée lors de la recherche du client)
create or replace function match_document_embeddings (
    query_embedding vector(1536),
    match_threshold float,
    match_count int,
    p_user_id uuid
)
returns table (
    document_id uuid,
    content_chunk text,
    similarity float
)
language sql stable
as $$
    select
        document_embeddings.document_id,
        document_embeddings.content_chunk,
        1 - (document_embeddings.embedding <=> query_embedding) as similarity
    from document_embeddings
    where document_embeddings.user_id = p_user_id
        and 1 - (document_embeddings.embedding <=> query_embedding) > match_threshold
    order by document_embeddings.embedding <=> query_embedding
    limit match_count;
$$;

-- ==============================================================================
-- 4. ASSISTANT INTELLIGENT (CHAT)
-- ==============================================================================
create table public.ai_chat_sessions (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    title text default 'Nouvelle conversation',
    created_at timestamp with time zone default timezone('utc'::text, now())
);

create table public.ai_chat_messages (
    id uuid default gen_random_uuid() primary key,
    session_id uuid references public.ai_chat_sessions(id) on delete cascade not null,
    role text check (role in ('user', 'assistant', 'system')),
    content text not null,
    related_document_id uuid references public.documents(id) on delete set null,
    created_at timestamp with time zone default timezone('utc'::text, now())
);

-- ==============================================================================
-- 5. RLS (SÉCURITÉ ET CONFIDENTIALITÉ COMPATIBLE RGPD)
-- ==============================================================================
alter table public.document_ai_analysis enable row level security;
alter table public.document_embeddings enable row level security;
alter table public.ai_chat_sessions enable row level security;
alter table public.ai_chat_messages enable row level security;

-- Policies "AI Analysis"
create policy "User can view own AI analysis" on public.document_ai_analysis for select using (auth.uid() = user_id);
create policy "User can insert own AI analysis" on public.document_ai_analysis for insert with check (auth.uid() = user_id);
create policy "User can update own AI analysis" on public.document_ai_analysis for update using (auth.uid() = user_id);

-- Policies "Embeddings"
create policy "User can view own embeddings" on public.document_embeddings for select using (auth.uid() = user_id);
create policy "User can insert own embeddings" on public.document_embeddings for insert with check (auth.uid() = user_id);

-- Policies "Chat"
create policy "User can view own chat sessions" on public.ai_chat_sessions for select using (auth.uid() = user_id);
create policy "User can insert own chat sessions" on public.ai_chat_sessions for insert with check (auth.uid() = user_id);
create policy "User can view own chat messages" on public.ai_chat_messages for select using (
    session_id in (select id from public.ai_chat_sessions where user_id = auth.uid())
);
create policy "User can insert own chat messages" on public.ai_chat_messages for insert with check (
    session_id in (select id from public.ai_chat_sessions where user_id = auth.uid())
);
