
-- Operator invite codes table
CREATE TABLE public.operator_invite_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  used boolean NOT NULL DEFAULT false,
  used_by_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.operator_invite_codes ENABLE ROW LEVEL SECURITY;

-- Anyone can read codes to validate them during signup
CREATE POLICY "Anyone can validate invite codes" ON public.operator_invite_codes
  FOR SELECT TO authenticated, anon USING (true);

-- Only the system can update codes (via security definer function)
-- We'll use a function to claim codes

-- Function to validate and claim an invite code
CREATE OR REPLACE FUNCTION public.claim_invite_code(_code text, _user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.operator_invite_codes
  SET used = true, used_by_user_id = _user_id
  WHERE code = _code AND used = false;
  
  RETURN FOUND;
END;
$$;

-- Insert sample invite codes
INSERT INTO public.operator_invite_codes (code) VALUES
  ('RESCUE-OPS-001'),
  ('RESCUE-OPS-002'),
  ('RESCUE-OPS-003'),
  ('RESCUE-OPS-004'),
  ('RESCUE-OPS-005');
