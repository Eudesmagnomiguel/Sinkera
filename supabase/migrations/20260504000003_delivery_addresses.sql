CREATE TABLE public.delivery_addresses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label TEXT NOT NULL DEFAULT 'Casa',
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  province TEXT NOT NULL,
  notes TEXT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.delivery_addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own addresses"
ON public.delivery_addresses FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE TRIGGER update_delivery_addresses_updated_at
BEFORE UPDATE ON public.delivery_addresses
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_delivery_addresses_user ON public.delivery_addresses(user_id);
