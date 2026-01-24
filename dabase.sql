-- 1. Se hai già la tabella profiles, esegui SOLO questo comando:
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_run_state jsonb default null;

-- 2. Se NON hai ancora la tabella profiles (nuovo database), esegui tutto questo blocco:
create table if not exists profiles (
  id uuid references auth.users on delete cascade not null primary key,
  username text unique,
  total_score bigint default 0,
  max_level int default 1,
  estimated_iq int default 100,
  wallet_balance decimal(10, 2) default 0.00,
  premium_currency int default 0,
  wins int default 0,
  losses int default 0,
  draws int default 0,
  elo_rating int default 1200,
  current_run_state jsonb default null, -- Questa è la nuova colonna per i salvataggi
  badges jsonb default '[]',
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Abilita la sicurezza (Row Level Security)
alter table profiles enable row level security;
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile." on profiles for insert with check (auth.uid() = id);

-- Trigger creazione utente automatico
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (new.id, new.raw_user_meta_data->>'username');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Tabella Leaderboard
create table if not exists leaderboard (
  id uuid default uuid_generate_v4() primary key,
  player_id uuid references profiles(id),
  player_name text, 
  score bigint not null,
  level int not null,
  iq int,
  country text default 'IT',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table leaderboard enable row level security;
create policy "Leaderboard viewable by everyone" on leaderboard for select using (true);
create policy "Users can insert own score" on leaderboard for insert with check (auth.uid() = player_id);
