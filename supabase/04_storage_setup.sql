-- ==============================================================================
-- 04_STORAGE_SETUP.SQL
-- Implémentation du coffre-fort de fichiers physiques de Privo
-- ==============================================================================

-- 1. CRÉATION DU BUCKET ("documents")
-- Ce bucket stockera tous les PDF, PNJ, JPEG et autres fichiers.
-- Ne PAS rendre le bucket "public". Les fichiers doivent rester chiffrés et inaccessibles par URL directe.
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

-- ==============================================================================
-- 2. RLS POLICIES POUR LE BUCKET DE STOCKAGE
-- La sécurité est TRÈS stricte ici. Personne ne doit pouvoir lire le passeport 
-- ou le contrat d'un autre utilisateur.
-- ==============================================================================

-- a. LECTURE : L'utilisateur peut lire uniquement SES propres fichiers
-- Le dossier dans le bucket doit idéalement être nommé avec l'ID de l'utilisateur. 
-- e.g. /documents/{user_id}/mon_nom_fichier.pdf
create policy "Les utilisateurs peuvent lire leurs propres fichiers"
on storage.objects for select
to authenticated
using (
  bucket_id = 'documents' and 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- b. AJOUT : L'utilisateur peut insérer des fichiers uniquement dans SON dossier
create policy "Les utilisateurs peuvent importer (uploader) dans leur dossier"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'documents' and 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- c. MODIFICATION : L'utilisateur peut modifier (écraser) uniquement SES fichiers
create policy "Les utilisateurs peuvent modifier leurs fichiers"
on storage.objects for update
to authenticated
using (
  bucket_id = 'documents' and 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- d. SUPPRESSION : L'utilisateur peut supprimer uniquement SES fichiers
create policy "Les utilisateurs peuvent supprimer leurs fichiers"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'documents' and 
  (storage.foldername(name))[1] = auth.uid()::text
);
