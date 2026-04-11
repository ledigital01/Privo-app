/* 
   ================================================================
   08_FIX_DOCUMENTS_SCHEMA.SQL
   Mise à jour de la table documents pour supporter l'IA et l'urgence
   ================================================================
*/

DO $$ 
BEGIN 
    -- 1. Ajouter description (Note/Résumé)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='documents' AND column_name='description') THEN
        ALTER TABLE public.documents ADD COLUMN description TEXT;
    END IF;

    -- 2. Ajouter issuer (Émetteur)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='documents' AND column_name='issuer') THEN
        ALTER TABLE public.documents ADD COLUMN issuer TEXT;
    END IF;

    -- 3. Ajouter tags (Mots-clés)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='documents' AND column_name='tags') THEN
        ALTER TABLE public.documents ADD COLUMN tags TEXT[] DEFAULT '{}';
    END IF;

    -- 4. Ajouter is_emergency (Urgence)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='documents' AND column_name='is_emergency') THEN
        ALTER TABLE public.documents ADD COLUMN is_emergency BOOLEAN DEFAULT FALSE;
    END IF;

    -- 5. Ajouter file_path (le chemin du fichier dans le Storage)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='documents' AND column_name='file_path') THEN
        ALTER TABLE public.documents ADD COLUMN file_path TEXT;
    END IF;

    -- Copier les anciennes URLs vers file_path si nécessaire
    UPDATE public.documents SET file_path = file_url WHERE file_path IS NULL AND file_url IS NOT NULL;

END $$;
