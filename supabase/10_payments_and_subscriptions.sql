-- 1. Extension de la table profiles pour gérer la durée de l'abonnement
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS plan_start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS plan_expiry_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_payment_id TEXT;

-- 2. Création de la table des paiements pour l'historique et la vérification
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    transaction_id TEXT UNIQUE, -- ID fourni par Flutterwave
    tx_ref TEXT UNIQUE, -- Notre référence interne
    amount DECIMAL NOT NULL,
    currency TEXT DEFAULT 'XOF',
    plan_id TEXT NOT NULL,
    billing_cycle TEXT, -- 'monthly' or 'yearly'
    status TEXT DEFAULT 'pending', -- 'pending', 'successful', 'failed'
    payment_type TEXT, -- 'card', 'mobile_money', etc.
    customer_email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security)
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Les utilisateurs peuvent voir leurs propres paiements" 
ON payments FOR SELECT 
USING (auth.uid() = user_id);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_payments_updated_at
BEFORE UPDATE ON payments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
