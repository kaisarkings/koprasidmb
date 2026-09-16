-- =========================================================
-- KOPERASI SANTRI - DATABASE POSTGRESQL SCHEMA FOR SUPABASE
-- Pondok Pesantren Koperasi & Tabungan Santri System
-- =========================================================

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ADMINS / PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('admin', 'orang_tua', 'pengurus', 'bendahara', 'kepala_pondok')),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. STUDENTS TABLE (SANTRI)
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nis VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    class_name VARCHAR(100) NOT NULL,
    dormitory VARCHAR(100) NOT NULL,
    parent_name VARCHAR(255) NOT NULL,
    parent_phone VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'aktif' CHECK (status IN ('aktif', 'nonaktif')),
    joined_date DATE DEFAULT CURRENT_DATE,
    avatar_url TEXT,
    balance NUMERIC(15, 2) DEFAULT 0.00 NOT NULL CHECK (balance >= 0),
    qr_code_data VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexes for Fast Search
CREATE INDEX IF NOT EXISTS idx_students_nis ON public.students(nis);
CREATE INDEX IF NOT EXISTS idx_students_name ON public.students(name);
CREATE INDEX IF NOT EXISTS idx_students_class ON public.students(class_name);
CREATE INDEX IF NOT EXISTS idx_students_dormitory ON public.students(dormitory);
CREATE INDEX IF NOT EXISTS idx_students_status ON public.students(status);

-- 3. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(50) NOT NULL UNIQUE,
    icon_name VARCHAR(50) DEFAULT 'ShoppingBag',
    color VARCHAR(50) DEFAULT 'bg-emerald-500',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Seed Categories
INSERT INTO public.categories (name, code, icon_name, color) VALUES
('Makanan', 'FOOD', 'Utensils', 'bg-emerald-500'),
('Minuman', 'DRINK', 'Coffee', 'bg-blue-500'),
('Snack', 'SNACK', 'Cookie', 'bg-amber-500'),
('ATK', 'ATK', 'BookOpen', 'bg-purple-500'),
('Lainnya', 'MISC', 'ShoppingBag', 'bg-gray-500')
ON CONFLICT (code) DO NOTHING;

-- 4. TRANSACTIONS TABLE (TRANSAKSI JAJAN)
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_code VARCHAR(100) UNIQUE NOT NULL,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    student_name VARCHAR(255),
    student_nis VARCHAR(50),
    student_class VARCHAR(100),
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    category VARCHAR(100) NOT NULL,
    notes TEXT,
    time_period VARCHAR(20) DEFAULT 'pagi' CHECK (time_period IN ('pagi', 'siang', 'sore', 'malam')),
    created_by VARCHAR(255) DEFAULT 'Admin Koperasi',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexes for Fast History & Analytics
CREATE INDEX IF NOT EXISTS idx_transactions_student_id ON public.transactions(student_id);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON public.transactions(category);
CREATE INDEX IF NOT EXISTS idx_transactions_time_period ON public.transactions(time_period);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);

-- 5. TOPUPS TABLE (ISI SALDO)
CREATE TABLE IF NOT EXISTS public.topups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    topup_code VARCHAR(100) UNIQUE NOT NULL,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    student_name VARCHAR(255),
    student_nis VARCHAR(50),
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    notes TEXT,
    payment_method VARCHAR(50) DEFAULT 'Tunai' CHECK (payment_method IN ('Tunai', 'Transfer', 'Potongan Gaji', 'Lainnya')),
    created_by VARCHAR(255) DEFAULT 'Admin Koperasi',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_topups_student_id ON public.topups(student_id);
CREATE INDEX IF NOT EXISTS idx_topups_created_at ON public.topups(created_at DESC);

-- 6. SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 7. ACTIVITY LOGS TABLE
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(100),
    user_name VARCHAR(255),
    action VARCHAR(255) NOT NULL,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =========================================================
-- AUTOMATIC BALANCE UPDATES VIA DATABASE TRIGGERS
-- =========================================================

-- Trigger function for TopUp -> Increase Student Balance
CREATE OR REPLACE FUNCTION public.process_student_topup()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.students
    SET balance = balance + NEW.amount,
        updated_at = NOW()
    WHERE id = NEW.student_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trigger_process_topup
AFTER INSERT ON public.topups
FOR EACH ROW EXECUTE FUNCTION public.process_student_topup();

-- Trigger function for Transaction -> Deduct Student Balance
CREATE OR REPLACE FUNCTION public.process_student_transaction()
RETURNS TRIGGER AS $$
DECLARE
    current_bal NUMERIC(15,2);
BEGIN
    SELECT balance INTO current_bal FROM public.students WHERE id = NEW.student_id;
    
    IF current_bal < NEW.amount THEN
        RAISE EXCEPTION 'Saldo santri tidak mencukupi untuk transaksi ini! Saldo saat ini: %', current_bal;
    END IF;

    UPDATE public.students
    SET balance = balance - NEW.amount,
        updated_at = NOW()
    WHERE id = NEW.student_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trigger_process_transaction
AFTER INSERT ON public.transactions
FOR EACH ROW EXECUTE FUNCTION public.process_student_transaction();

-- =========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Default Permissive RLS for Admin Role & Public Read for App Access
CREATE POLICY "Allow public read access to categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Allow authenticated full access to students" ON public.students FOR ALL USING (true);
CREATE POLICY "Allow authenticated full access to transactions" ON public.transactions FOR ALL USING (true);
CREATE POLICY "Allow authenticated full access to topups" ON public.topups FOR ALL USING (true);
CREATE POLICY "Allow authenticated full access to settings" ON public.settings FOR ALL USING (true);
CREATE POLICY "Allow authenticated full access to activity_logs" ON public.activity_logs FOR ALL USING (true);
