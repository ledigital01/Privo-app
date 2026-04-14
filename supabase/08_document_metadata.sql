/* 
   ================================================================
   08_DOCUMENT_METADATA.SQL
   Extension des métadonnées des documents
   ================================================================
   Objectif : Ajouter les champs issuer, description et tags 
   à la table documents pour supporter la saisie manuelle complète.
*/

-- 1. Ajout des colonnes à la table documents
ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS issuer text,
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

-- 2. Index pour la recherche par tags
CREATE INDEX IF NOT EXISTS idx_documents_tags ON public.documents USING gin(tags);

-- 3. Mise à jour des index de recherche (si existants)
-- Si vous utilisez une recherche plein texte, vous pourriez vouloir inclure 
-- l'émetteur et la description.

COMMENT ON COLUMN public.documents.issuer IS 'L''entité ayant émis le document (ex: État Civil, Banque, etc.)';
COMMENT ON COLUMN public.documents.tags IS 'Liste de mots-clés personnalisés par l''utilisateur';
