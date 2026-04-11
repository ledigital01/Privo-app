-- 07_plan_limits.sql
-- Fonction pour vérifier les limites de documents selon le plan de l'utilisateur

CREATE OR REPLACE FUNCTION check_document_limits()
RETURNS TRIGGER AS $$
DECLARE
    user_plan TEXT;
    doc_count INTEGER;
BEGIN
    -- 1. Récupérer le plan de l'utilisateur dans la table profiles
    SELECT plan INTO user_plan FROM profiles WHERE id = NEW.user_id;
    
    -- 2. Compter le nombre actuel de documents de l'utilisateur
    SELECT COUNT(*) INTO doc_count FROM documents WHERE user_id = NEW.user_id;

    -- 3. Appliquer la restriction pour le plan gratuit (Free)
    IF user_plan = 'free' AND doc_count >= 5 THEN
        RAISE EXCEPTION 'Limite de documents atteinte pour le plan gratuit (5 documents maximum).';
    END IF;

    -- Note: On pourra ajouter les limites Pro (100) ici plus tard
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour déclencher la vérification avant chaque insertion
DROP TRIGGER IF EXISTS tr_check_document_limits ON documents;
CREATE TRIGGER tr_check_document_limits
BEFORE INSERT ON documents
FOR EACH ROW
EXECUTE FUNCTION check_document_limits();
