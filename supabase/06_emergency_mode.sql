/* 
   ================================================================
   06_EMERGENCY_MODE.SQL
   Gestion du Mode Urgence
   ================================================================
*/

-- 1. Ajouter la colonne is_emergency à la table documents
alter table public.documents 
add column is_emergency boolean default false;

-- 2. Index pour filtrer rapidement les documents d'urgence
create index idx_documents_is_emergency on public.documents(user_id, is_emergency) where is_emergency = true;
