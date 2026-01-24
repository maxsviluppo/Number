
-- ESEGUI QUESTO CODICE NELL'EDITOR SQL DI SUPABASE PER CREARE LE TABELLE NECESSARIE E "FUTURE-PROOF"

-- 1. Tabella PROFILES (Estesa per Economia e Statistiche PvP)
create table if not exists profiles (
  id uuid references auth.users on delete cascade not null primary key,
  username text unique,
  total_score bigint default 0,
  max_level int default 1,
  estimated_iq int default 100,
  
  -- Economia e Premi
  wallet_balance decimal(10, 2) default 0.00, -- Crediti per iscrizione tornei/premi
  premium_currency int default 0, -- "Gemme" o valuta secondaria
  
  -- Statistiche PvP
  wins int default 0,
  losses int default 0,
  draws int default 0,
  elo_rating int default 1200, -- Per matchmaking equilibrato
  
  badges jsonb default '[]',
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- RLS Profiles
alter table profiles enable row level security;
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

-- Trigger creazione profilo
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, username, total_score, max_level, estimated_iq, wallet_balance)
  values (new.id, new.raw_user_meta_data->>'username', 0, 1, 100, 0);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 2. Tabella LEADERBOARD (Log delle partite singole)
create table if not exists leaderboard (
  id uuid default uuid_generate_v4() primary key,
  player_id uuid references profiles(id),
  player_name text, -- Denormalizzato per letture veloci, o join su profiles
  score bigint not null,
  level int not null,
  iq int,
  country text default 'IT',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table leaderboard enable row level security;
create policy "Leaderboard viewable by everyone" on leaderboard for select using (true);
create policy "Users can insert own score" on leaderboard for insert with check (auth.uid() = player_id);


-- ==========================================
-- ARCHITETTURA PER 1v1 E TORNEI (FUTURE PROOF)
-- ==========================================

-- 3. MATCHES (Per sfide 1v1)
create type match_status as enum ('pending', 'active', 'finished', 'cancelled');

create table if not exists matches (
  id uuid default uuid_generate_v4() primary key,
  player1_id uuid references profiles(id) not null,
  player2_id uuid references profiles(id), -- Null se in attesa di avversario
  
  status match_status default 'pending',
  
  player1_score bigint default 0,
  player2_score bigint default 0,
  winner_id uuid references profiles(id),
  
  bet_amount decimal(10, 2) default 0, -- Posta in gioco (se presente)
  
  created_at timestamp with time zone default timezone('utc'::text, now()),
  finished_at timestamp with time zone
);

alter table matches enable row level security;
create policy "Matches viewable by everyone" on matches for select using (true);
create policy "Players can update their match state" on matches for update using (auth.uid() in (player1_id, player2_id));


-- 4. TOURNAMENTS (Gestione Tornei)
create type tournament_status as enum ('registering', 'active', 'finished');

create table if not exists tournaments (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  
  start_time timestamp with time zone,
  end_time timestamp with time zone,
  
  entry_fee decimal(10, 2) default 0,
  prize_pool decimal(10, 2) default 0,
  
  status tournament_status default 'registering',
  
  rules jsonb default '{}', -- Configurazione flessibile (es. durata round, tipo griglia)
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table tournaments enable row level security;
create policy "Tournaments viewable by everyone" on tournaments for select using (true);


-- 5. TOURNAMENT_PARTICIPANTS (Iscrizioni)
create table if not exists tournament_participants (
  tournament_id uuid references tournaments(id),
  player_id uuid references profiles(id),
  current_score bigint default 0,
  rank int,
  
  joined_at timestamp with time zone default now(),
  primary key (tournament_id, player_id)
);

alter table tournament_participants enable row level security;
create policy "Public view" on tournament_participants for select using (true);
create policy "User can join" on tournament_participants for insert with check (auth.uid() = player_id);
