/*
   ================================================================
   07_PLAN_LIMITS.SQL — Plan Gratuit
   Restrictions backend enforced via RLS & Database Functions
   ================================================================
   EXÉCUTER dans l'éditeur SQL de Supabase.
   Ce script configure les limites du plan GRATUIT :
     - Max 5 documents
     - Max 3 partages par mois
     - Pas de quota IA (géré côté frontend)
   ================================================================
*/

-- ----------------------------------------------------------------
-- ÉTAPE 1 : S'assurer que la colonne 'plan' existe dans profiles
-- ----------------------------------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free' NOT NULL,
  ADD COLUMN IF NOT EXISTS storage_used_bytes BIGINT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS shares_this_month INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS shares_reset_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- ----------------------------------------------------------------
-- ÉTAPE 2 : Fonction qui vérifie la limite de documents
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.check_document_limit()
RETURNS TRIGGER AS $$
DECLARE
  user_plan TEXT;
  doc_count INT;
  max_docs INT;
BEGIN
  -- Récupérer le plan de l'utilisateur
  SELECT plan INTO user_plan
  FROM public.profiles
  WHERE id = NEW.user_id;

  -- Compter les documents existants
  SELECT COUNT(*) INTO doc_count
  FROM public.documents
  WHERE user_id = NEW.user_id;

  -- Définir le maximum selon le plan
  IF user_plan = 'free' THEN
    max_docs := 5;
  ELSIF user_plan = 'pro' THEN
    max_docs := 100;
  ELSE
    max_docs := 2147483647; -- Business = illimité
  END IF;

  -- Bloquer si dépassement
  IF doc_count >= max_docs THEN
    RAISE EXCEPTION 'PLAN_LIMIT_REACHED: Vous avez atteint la limite de % documents pour le plan %. Passez au plan supérieur pour continuer.', max_docs, user_plan;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------
-- ÉTAPE 3 : Trigger qui s'active avant chaque insertion de document
-- ----------------------------------------------------------------
DROP TRIGGER IF EXISTS enforce_document_limit ON public.documents;

CREATE TRIGGER enforce_document_limit
  BEFORE INSERT ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION public.check_document_limit();

-- ----------------------------------------------------------------
-- ÉTAPE 4 : Fonction qui vérifie la limite de partages mensuels
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.check_share_limit()
RETURNS TRIGGER AS $$
DECLARE
  user_plan TEXT;
  share_count INT;
  reset_at TIMESTAMP WITH TIME ZONE;
  max_shares INT;
BEGIN
  -- Récupérer le plan et les infos de partage
  SELECT plan, shares_this_month, shares_reset_at
  INTO user_plan, share_count, reset_at
  FROM public.profiles
  WHERE id = NEW.user_id;

  -- Réinitialiser si nouveau mois
  IF reset_at IS NULL OR reset_at < date_trunc('month', now()) THEN
    UPDATE public.profiles
    SET shares_this_month = 0, shares_reset_at = now()
    WHERE id = NEW.user_id;
    share_count := 0;
  END IF;

  -- Définir le maximum de partages selon le plan
  IF user_plan = 'free' THEN
    max_shares := 3;
  ELSE
    max_shares := 2147483647; -- Pro/Business = illimité
  END IF;

  -- Bloquer si dépassement
  IF share_count >= max_shares THEN
    RAISE EXCEPTION 'SHARE_LIMIT_REACHED: Vous avez atteint la limite de % partages ce mois-ci. Passez au plan Pro pour un partage illimité.', max_shares;
  END IF;

  -- Incrémenter le compteur
  UPDATE public.profiles
  SET shares_this_month = shares_this_month + 1
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------
-- ÉTAPE 5 : Trigger pour les partages
-- ----------------------------------------------------------------
DROP TRIGGER IF EXISTS enforce_share_limit ON public.document_shares;

CREATE TRIGGER enforce_share_limit
  BEFORE INSERT ON public.document_shares
  FOR EACH ROW
  EXECUTE FUNCTION public.check_share_limit();

-- ----------------------------------------------------------------
-- ÉTAPE 6 : Vue utilitaire pour voir les limites d'un utilisateur
-- ----------------------------------------------------------------
CREATE OR REPLACE VIEW public.user_plan_status AS
SELECT
  p.id AS user_id,
  p.plan,
  p.shares_this_month,
  p.shares_reset_at,
  (SELECT COUNT(*) FROM public.documents d WHERE d.user_id = p.id) AS doc_count,
  CASE
    WHEN p.plan = 'free' THEN 5
    WHEN p.plan = 'pro' THEN 100
    ELSE 2147483647
  END AS max_docs,
  CASE
    WHEN p.plan = 'free' THEN 3
    ELSE 2147483647
  END AS max_shares_per_month
FROM public.profiles p;

-- ----------------------------------------------------------------
-- NOTES D'EXÉCUTION
-- ----------------------------------------------------------------
-- Après exécution, vérifier avec :
-- SELECT * FROM public.user_plan_status WHERE user_id = auth.uid();
