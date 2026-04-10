/* 
   ================================================================
   05_SHARES.SQL
   Gestion des Partages Sécurisés
   ================================================================
*/

-- 1. Création de la table des partages
create table public.document_shares (
  id uuid default gen_random_uuid() primary key,
  document_id uuid references public.documents(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  password text, -- Pour un MVP, on stocke en clair ou hash simple si pas de crypto complexe côté client
  expires_at timestamp with time zone not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Activer RLS
alter table public.document_shares enable row level security;

-- 3. Politiques
-- Tout le monde peut lire un partage (nécessaire pour la vérification)
create policy "Lecture publique des partages via ID"
  on public.document_shares for select
  using ( true );

-- Seul le propriétaire peut créer des partages
create policy "Création de partage par le proprio"
  on public.document_shares for insert
  with check ( auth.uid() = user_id );

-- Seul le propriétaire peut supprimer ses partages
create policy "Suppression de partage par le proprio"
  on public.document_shares for delete
  using ( auth.uid() = user_id );

-- 4. Index
create index idx_shares_document_id on public.document_shares(document_id);
