-- Talaan: Demo Seed Data (Aling Nena's Sari-Sari Store)
-- Note: When running locally, auth.users is populated via demo login endpoint or Supabase Auth.

-- Insert demo store for the active demo user (referenced dynamically in app via demo endpoint)
-- Below is a template SQL that can be run against a specific owner_id in SQL Editor:

/*
DO $$
DECLARE
  v_user_id uuid := '00000000-0000-0000-0000-000000000001';
  v_store_id uuid;
BEGIN
  -- Insert Demo Store
  INSERT INTO public.stores (owner_id, name)
  VALUES (v_user_id, 'Aling Nena''s Sari-Sari Store')
  RETURNING id INTO v_store_id;

  -- Insert Demo Customers
  INSERT INTO public.customers (store_id, name, normalized_name, phone_optional) VALUES
    (v_store_id, 'Mang Jose', 'mang jose', '09171234567'),
    (v_store_id, 'Kuya Jun', 'kuya jun', '09187654321'),
    (v_store_id, 'Nanay Cora', 'nanay cora', null),
    (v_store_id, 'Ate Baby', 'ate baby', '09223334444');
END $$;
*/
