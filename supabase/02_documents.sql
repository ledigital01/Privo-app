/* 
   ================================================================
   02_DOCUMENTS.SQL
   Gestion des Documents (Page Accueil / Bibliothèque / Détails)
   ================================================================
   Objectif : Créer la table qui stockera tous les documents 
   numérisés par les utilisateurs.
*/

-- 1. Création de la table des documents
create table public.documents (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  type text not null, -- ex: Identité, Santé, Facture, etc.
  expires_at date,
  icon_name text default 'file',
  file_url text, -- Lien vers le fichier réel dans le Storage
  status text default 'active', -- active, archived, deleted
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Activer la Sécurité au Niveau des Lignes (RLS)
alter table public.documents enable row level security;

-- 3. Politiques de sécurité (RLS)
-- Seul le propriétaire peut voir ses documents
create policy "Les utilisateurs peuvent voir leurs propres documents."
  on public.documents for select
  using ( auth.uid() = user_id );

-- Seul le propriétaire peut ajouter des documents
create policy "Les utilisateurs peuvent ajouter leurs propres documents."
  on public.documents for insert
  with check ( auth.uid() = user_id );

-- Seul le propriétaire peut modifier ses documents
create policy "Les utilisateurs peuvent modifier leurs propres documents."
  on public.documents for update
  using ( auth.uid() = user_id );

-- Seul le propriétaire peut supprimer ses documents
create policy "Les utilisateurs peuvent supprimer leurs propres documents."
  on public.documents for delete
  using ( auth.uid() = user_id );

-- 4. Index pour accélérer la recherche par utilisateur
create index idx_documents_user_id on public.documents(user_id);
