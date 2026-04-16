/*
   ================================================================
   08_TEAM_INVITATIONS.SQL
   Gestion des invitations d'équipe (Plan Business)
   ================================================================
   EXÉCUTER dans l'éditeur SQL de Supabase.
*/

-- 1. Table des invitations
CREATE TABLE IF NOT EXISTS public.team_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  invitee_email TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending' | 'accepted' | 'rejected'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. RLS
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;

-- Le propriétaire peut voir toutes ses invitations
CREATE POLICY "owner_see_invitations"
  ON public.team_invitations FOR SELECT
  USING (auth.uid() = owner_id);

-- Le propriétaire peut créer des invitations
CREATE POLICY "owner_insert_invitations"
  ON public.team_invitations FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Le propriétaire peut supprimer ses invitations
CREATE POLICY "owner_delete_invitations"
  ON public.team_invitations FOR DELETE
  USING (auth.uid() = owner_id);
