/*
   ================================================================
   09_WALLET_BALANCE.SQL
   Gestion du solde DigiWallet pour les paiements in-app
   ================================================================
*/

-- 1. Ajouter la colonne wallet_balance à la table profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS wallet_balance NUMERIC DEFAULT 12500;

-- 2. RLS est déjà activé sur profiles, normalement l'utilisateur peut lire son propre profil.
-- S'assurer que l'utilisateur peut voir son solde.
-- (La politique existante "Public profiles are viewable by everyone" ou "Users can see their own profile" devrait suffire)
