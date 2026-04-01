/* 
   ================================================================
   01_AUTH_PROFILES.SQL
   Gestion des Utilisateurs & Profils (Page Inscription / Connexion)
   ================================================================
   Objectif : Créer une table de profil liée à l'authentification Supabase 
   pour stocker le prénom, le nom et les initiales de l'utilisateur.
*/

-- 1. Création de la table des profils
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  first_name text not null,
  last_name text not null,
  initials text,
  email text unique not null,
  plan text default 'free',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Activer la Sécurité au Niveau des Lignes (RLS)
alter table public.profiles enable row level security;

-- 3. Politiques de sécurité (RLS)
create policy "Les utilisateurs peuvent voir leur propre profil."
  on public.profiles for select
  using ( auth.uid() = id );

create policy "Les utilisateurs peuvent modifier leur propre profil."
  on public.profiles for update
  using ( auth.uid() = id );

-- 4. Automatisation : Création d'un profil à l'inscription
-- Cette fonction récupère le prénom et le nom depuis les meta-données envoyées lors de l'inscription (signup).
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, first_name, last_name, initials)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'first_name', 
    new.raw_user_meta_data->>'last_name',
    upper(substring(new.raw_user_meta_data->>'first_name' from 1 for 1) || substring(new.raw_user_meta_data->>'last_name' from 1 for 1))
  );
  return new;
end;
$$ language plpgsql security definer;

-- 5. Trigger : Se déclenche après chaque nouvel utilisateur créé dans auth.users
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
