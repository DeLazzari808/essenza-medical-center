-- Essenza Medical Center Database Schema
-- Execute este arquivo no SQL Editor do Supabase

-- Criar ENUM para tipos de período
DO $$ BEGIN
    CREATE TYPE period_type AS ENUM ('morning', 'afternoon');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Criar ENUM para tipos de sala
DO $$ BEGIN
    CREATE TYPE room_type AS ENUM ('medical', 'podcast', 'theater', 'hub');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Tabela de perfis de usuário
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'tenant')),
  phone TEXT,
  bio TEXT,
  specialty TEXT, -- Especialidade médica (para profissionais de saúde)
  crm TEXT, -- Registro profissional
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Tabela de salas (inventário fixo gerenciado pelo admin)
CREATE TABLE IF NOT EXISTS rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  room_type room_type DEFAULT 'medical',
  address TEXT NOT NULL DEFAULT 'Essenza Medical Center',
  city TEXT DEFAULT 'São Paulo',
  state TEXT DEFAULT 'SP',
  zip_code TEXT,
  price_per_period DECIMAL(10, 2) NOT NULL, -- Preço por período (manhã ou tarde)
  capacity INTEGER,
  amenities JSONB DEFAULT '[]'::jsonb,
  images JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Tabela de reservas (por período: manhã ou tarde)
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL, -- Data da reserva
  period period_type NOT NULL, -- 'morning' (08h-13h) ou 'afternoon' (14h-19h)
  total_price DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,

  -- Constraint de unicidade: uma sala só pode ter uma reserva confirmada por data/período
  CONSTRAINT unique_room_date_period UNIQUE (room_id, date, period)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Policies para profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policies para rooms (todos podem ver, apenas admin pode modificar)
DROP POLICY IF EXISTS "Anyone can view active rooms" ON rooms;
CREATE POLICY "Anyone can view active rooms"
  ON rooms FOR SELECT
  USING (is_active = true);

-- Apenas o owner (admin) pode criar/modificar salas
DROP POLICY IF EXISTS "Admin can create rooms" ON rooms;
CREATE POLICY "Admin can create rooms"
  ON rooms FOR INSERT
  WITH CHECK (
    auth.uid() = owner_id
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner')
  );

DROP POLICY IF EXISTS "Admin can update rooms" ON rooms;
CREATE POLICY "Admin can update rooms"
  ON rooms FOR UPDATE
  USING (
    auth.uid() = owner_id
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner')
  );

DROP POLICY IF EXISTS "Admin can delete rooms" ON rooms;
CREATE POLICY "Admin can delete rooms"
  ON rooms FOR DELETE
  USING (
    auth.uid() = owner_id
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner')
  );

-- Policies para bookings
DROP POLICY IF EXISTS "Users can view own bookings" ON bookings;
CREATE POLICY "Users can view own bookings"
  ON bookings FOR SELECT
  USING (auth.uid() = user_id);

-- Admin pode ver todas as reservas das suas salas
DROP POLICY IF EXISTS "Admin can view all bookings" ON bookings;
CREATE POLICY "Admin can view all bookings"
  ON bookings FOR SELECT
  USING (
    auth.uid() IN (SELECT owner_id FROM rooms WHERE id = bookings.room_id)
  );

-- Qualquer usuário autenticado pode ver disponibilidade (reservas confirmadas)
DROP POLICY IF EXISTS "Anyone can view confirmed bookings for availability" ON bookings;
CREATE POLICY "Anyone can view confirmed bookings for availability"
  ON bookings FOR SELECT
  USING (status = 'confirmed');

DROP POLICY IF EXISTS "Users can create own bookings" ON bookings;
CREATE POLICY "Users can create own bookings"
  ON bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own bookings" ON bookings;
CREATE POLICY "Users can update own bookings"
  ON bookings FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own bookings" ON bookings;
CREATE POLICY "Users can delete own bookings"
  ON bookings FOR DELETE
  USING (auth.uid() = user_id);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_rooms_updated_at ON rooms;
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes para performance
CREATE INDEX IF NOT EXISTS idx_rooms_owner_id ON rooms(owner_id);
CREATE INDEX IF NOT EXISTS idx_rooms_room_type ON rooms(room_type);
CREATE INDEX IF NOT EXISTS idx_rooms_is_active ON rooms(is_active);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_room_id ON bookings(room_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);
CREATE INDEX IF NOT EXISTS idx_bookings_date_period ON bookings(date, period);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- =====================================================
-- SEEDS: Salas fixas do Essenza Medical Center
-- NOTA: Substitua 'ADMIN_USER_UUID' pelo UUID do admin
-- =====================================================

-- Para inserir os seeds, primeiro crie o usuário admin e use seu UUID
-- Exemplo (substitua pelo UUID real):
--
-- INSERT INTO rooms (owner_id, title, description, room_type, price_per_period, capacity, amenities) VALUES
-- ('ADMIN_USER_UUID', 'Sala Médica 01', 'Consultório médico totalmente equipado com mobiliário ergonômico, climatização individual e ponto de rede dedicado.', 'medical', 500.00, 4, '["Climatização", "Wi-Fi", "Mobiliário ergonômico", "Pia com água quente"]'),
-- ('ADMIN_USER_UUID', 'Sala Médica 02', 'Consultório médico totalmente equipado com mobiliário ergonômico, climatização individual e ponto de rede dedicado.', 'medical', 500.00, 4, '["Climatização", "Wi-Fi", "Mobiliário ergonômico", "Pia com água quente"]'),
-- ('ADMIN_USER_UUID', 'Sala Médica 03', 'Consultório médico totalmente equipado com mobiliário ergonômico, climatização individual e ponto de rede dedicado.', 'medical', 500.00, 4, '["Climatização", "Wi-Fi", "Mobiliário ergonômico", "Pia com água quente"]'),
-- ('ADMIN_USER_UUID', 'Sala Médica 04', 'Consultório médico totalmente equipado com mobiliário ergonômico, climatização individual e ponto de rede dedicado.', 'medical', 500.00, 4, '["Climatização", "Wi-Fi", "Mobiliário ergonômico", "Pia com água quente"]'),
-- ('ADMIN_USER_UUID', 'Sala Médica 05', 'Consultório médico totalmente equipado com mobiliário ergonômico, climatização individual e ponto de rede dedicado.', 'medical', 500.00, 4, '["Climatização", "Wi-Fi", "Mobiliário ergonômico", "Pia com água quente"]'),
-- ('ADMIN_USER_UUID', 'Sala Médica 06', 'Consultório médico totalmente equipado com mobiliário ergonômico, climatização individual e ponto de rede dedicado.', 'medical', 500.00, 4, '["Climatização", "Wi-Fi", "Mobiliário ergonômico", "Pia com água quente"]'),
-- ('ADMIN_USER_UUID', 'Sala Médica 07', 'Consultório médico totalmente equipado com mobiliário ergonômico, climatização individual e ponto de rede dedicado.', 'medical', 500.00, 4, '["Climatização", "Wi-Fi", "Mobiliário ergonômico", "Pia com água quente"]'),
-- ('ADMIN_USER_UUID', 'Sala Médica 08', 'Consultório médico totalmente equipado com mobiliário ergonômico, climatização individual e ponto de rede dedicado.', 'medical', 500.00, 4, '["Climatização", "Wi-Fi", "Mobiliário ergonômico", "Pia com água quente"]'),
-- ('ADMIN_USER_UUID', 'Sala Médica 09', 'Consultório médico totalmente equipado com mobiliário ergonômico, climatização individual e ponto de rede dedicado.', 'medical', 500.00, 4, '["Climatização", "Wi-Fi", "Mobiliário ergonômico", "Pia com água quente"]'),
-- ('ADMIN_USER_UUID', 'Sala Médica 10', 'Consultório médico totalmente equipado com mobiliário ergonômico, climatização individual e ponto de rede dedicado.', 'medical', 500.00, 4, '["Climatização", "Wi-Fi", "Mobiliário ergonômico", "Pia com água quente"]'),
-- ('ADMIN_USER_UUID', 'Sala Médica 11', 'Consultório médico totalmente equipado com mobiliário ergonômico, climatização individual e ponto de rede dedicado.', 'medical', 500.00, 4, '["Climatização", "Wi-Fi", "Mobiliário ergonômico", "Pia com água quente"]'),
-- ('ADMIN_USER_UUID', 'Sala Médica 12', 'Consultório médico totalmente equipado com mobiliário ergonômico, climatização individual e ponto de rede dedicado.', 'medical', 500.00, 4, '["Climatização", "Wi-Fi", "Mobiliário ergonômico", "Pia com água quente"]'),
-- ('ADMIN_USER_UUID', 'Sala Médica 13', 'Consultório médico totalmente equipado com mobiliário ergonômico, climatização individual e ponto de rede dedicado.', 'medical', 500.00, 4, '["Climatização", "Wi-Fi", "Mobiliário ergonômico", "Pia com água quente"]'),
-- ('ADMIN_USER_UUID', 'Sala Médica 14', 'Consultório médico totalmente equipado com mobiliário ergonômico, climatização individual e ponto de rede dedicado.', 'medical', 500.00, 4, '["Climatização", "Wi-Fi", "Mobiliário ergonômico", "Pia com água quente"]'),
-- ('ADMIN_USER_UUID', 'Estúdio de Podcast', 'Estúdio profissional com isolamento acústico, equipamento de gravação de alta qualidade e iluminação adequada para produções audiovisuais.', 'podcast', 800.00, 6, '["Isolamento acústico", "Microfones profissionais", "Câmeras", "Iluminação LED", "Mesa de som"]'),
-- ('ADMIN_USER_UUID', 'Teatro', 'Espaço para até 100 pessoas com sistema de som profissional, projeção em alta definição e palco para apresentações e eventos.', 'theater', 2000.00, 100, '["100 lugares", "Sistema de som", "Projeção 4K", "Palco", "Climatização", "Backstage"]'),
-- ('ADMIN_USER_UUID', 'Hub Digital', 'Espaço de coworking para networking e trabalho colaborativo entre profissionais de saúde, com internet de alta velocidade e área de café.', 'hub', 300.00, 20, '["Wi-Fi de alta velocidade", "Estações de trabalho", "Área de café", "Salas de reunião", "Impressora"]');
