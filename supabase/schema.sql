-- ================================================================
-- LUMIÊ STUDIO — Supabase Schema
-- ================================================================

-- Extensões
create extension if not exists "uuid-ossp";

-- ── SERVICES ────────────────────────────────────────────────────
create table if not exists services (
  id          text primary key,
  name        text not null,
  description text not null,
  duration    int  not null, -- minutos
  price       numeric(10,2) not null,
  icon        text not null,
  category    text not null,
  active      boolean default true,
  created_at  timestamptz default now()
);

-- ── PROFESSIONALS ────────────────────────────────────────────────
create table if not exists professionals (
  id             text primary key default uuid_generate_v4()::text,
  name           text not null,
  role           text not null,
  avatar         text not null,  -- iniciais (ex: SM)
  email          text unique,
  phone          text,
  bio            text,
  avatar_url     text,           -- foto de perfil (Supabase Storage)
  available_days int[] not null default '{1,2,3,4,5,6}',
  active         boolean default true,
  created_at     timestamptz default now()
);

-- Tabela de relacionamento profissional ↔ serviço
create table if not exists professional_services (
  professional_id text references professionals(id) on delete cascade,
  service_id      text references services(id) on delete cascade,
  primary key (professional_id, service_id)
);

-- ── BOOKINGS ─────────────────────────────────────────────────────
create type booking_status as enum ('pending', 'confirmed', 'cancelled', 'completed');

create table if not exists bookings (
  id                text primary key default uuid_generate_v4()::text,
  client_name       text not null,
  client_phone      text not null,
  client_email      text not null,
  service_id        text references services(id),
  professional_id   text references professionals(id),
  date              date not null,
  time              time not null,
  notes             text default '',
  status            booking_status default 'pending',
  payment_method    text,          -- 'pix' | 'credit_card' | 'debit_card'
  payment_id        text,          -- ID externo do Mercado Pago
  payment_amount    numeric(10,2),
  paid_at           timestamptz,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- ── CHAT MESSAGES ────────────────────────────────────────────────
create table if not exists chat_messages (
  id          uuid primary key default uuid_generate_v4(),
  booking_id  text references bookings(id) on delete cascade,
  sender      text not null,       -- 'client' | 'admin' | professional name
  sender_role text not null,       -- 'client' | 'admin'
  message     text not null,
  read        boolean default false,
  created_at  timestamptz default now()
);

-- ── NOTIFICATIONS ────────────────────────────────────────────────
create table if not exists notifications (
  id          uuid primary key default uuid_generate_v4(),
  type        text not null,  -- 'new_booking' | 'payment_confirmed' | 'cancellation' | 'message'
  title       text not null,
  body        text not null,
  booking_id  text references bookings(id) on delete set null,
  read        boolean default false,
  created_at  timestamptz default now()
);

-- ── UPDATED_AT TRIGGER ───────────────────────────────────────────
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger bookings_updated_at
  before update on bookings
  for each row execute function update_updated_at();

-- ── ROW LEVEL SECURITY ───────────────────────────────────────────
alter table services        enable row level security;
alter table professionals   enable row level security;
alter table professional_services enable row level security;
alter table bookings        enable row level security;
alter table chat_messages   enable row level security;
alter table notifications   enable row level security;

-- Serviços e profissionais: leitura pública (site público precisa)
create policy "services_public_read"      on services      for select using (true);
create policy "professionals_public_read" on professionals  for select using (true);
create policy "prof_services_public_read" on professional_services for select using (true);

-- Bookings: cliente pode inserir, admin lê/edita tudo
create policy "bookings_insert_public" on bookings for insert with check (true);
create policy "bookings_select_public" on bookings for select using (true);
create policy "bookings_update_auth"   on bookings for update using (auth.role() = 'authenticated');
create policy "bookings_delete_auth"   on bookings for delete using (auth.role() = 'authenticated');

-- Chat: inserção pública, leitura/gestão autenticada
create policy "chat_insert_public"  on chat_messages for insert with check (true);
create policy "chat_select_public"  on chat_messages for select using (true);
create policy "chat_update_auth"    on chat_messages for update using (auth.role() = 'authenticated');

-- Notificações: apenas autenticado
create policy "notif_all_auth" on notifications for all using (auth.role() = 'authenticated');

-- ── SEED DATA — Serviços ─────────────────────────────────────────
insert into services (id, name, description, duration, price, icon, category) values
  ('skincare',    'Skincare & Facial',        'Limpeza profunda, hidratação, peeling e tratamentos anti-aging com produtos de alta performance.', 60, 180.00, '✦', 'Rosto'),
  ('manicure',    'Manicure & Nail Art',      'Manicure, pedicure, esmaltação em gel e nail art exclusiva para quem busca requinte nos detalhes.', 75, 120.00, '💅', 'Unhas'),
  ('sobrancelhas','Design de Sobrancelhas',   'Henna, micropigmentação e brow lamination para o olhar perfeito que emoldura toda a sua beleza.', 45, 90.00, '🌸', 'Olhar'),
  ('spa',         'Spa & Relaxamento',        'Massagens faciais, rituais de aromaterapia e tratamentos express para renovar sua energia.', 90, 220.00, '🕯️', 'Corpo'),
  ('consultoria', 'Consultoria de Beleza',    'Análise de coloração pessoal, rotina de skincare e orientação de estilo para o seu biotipo.', 60, 150.00, '💛', 'Estilo')
on conflict (id) do nothing;

-- ── SEED DATA — Profissionais ────────────────────────────────────
insert into professionals (id, name, role, avatar, email, available_days) values
  ('prof-1', 'Simone Mariano',  'Skincare, Spa & Consultoria',  'SM', 'simone@lumiestudio.com.br',  '{1,2,3,4,5,6}'),
  ('prof-2', 'Rafaela Oliveira','Design de Sobrancelhas',       'RO', 'rafaela@lumiestudio.com.br', '{1,2,3,4,5,6}'),
  ('prof-3', 'Dani Martins',    'Manicure & Nail Art',          'DM', 'dani@lumiestudio.com.br',    '{1,2,3,4,5,6}')
on conflict (id) do nothing;

insert into professional_services (professional_id, service_id) values
  ('prof-1', 'skincare'),
  ('prof-1', 'spa'),
  ('prof-1', 'consultoria'),
  ('prof-2', 'sobrancelhas'),
  ('prof-3', 'manicure')
on conflict do nothing;

-- ── REALTIME ─────────────────────────────────────────────────────
-- Habilite nas tabelas abaixo via Dashboard > Database > Replication
-- ou rode:
alter publication supabase_realtime add table bookings;
alter publication supabase_realtime add table chat_messages;
alter publication supabase_realtime add table notifications;
