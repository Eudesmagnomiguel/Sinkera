CREATE TABLE public.tech_support_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  device_type TEXT NOT NULL,
  brand_model TEXT NULL,
  problem_description TEXT NOT NULL,
  urgency TEXT NOT NULL DEFAULT 'normal' CHECK (urgency IN ('normal', 'urgente', 'critico')),
  province TEXT NULL,
  address TEXT NULL,
  preferred_date DATE NULL,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_analise', 'agendado', 'em_progresso', 'resolvido', 'cancelado')),
  technician_notes TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.tech_support_requests ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a request
CREATE POLICY "Anyone can create support requests"
ON public.tech_support_requests FOR INSERT
WITH CHECK (true);

-- Users can view their own requests
CREATE POLICY "Users can view own requests"
ON public.tech_support_requests FOR SELECT
USING (user_id = auth.uid() OR user_id IS NULL);

-- Admins can manage all requests
CREATE POLICY "Admins can manage support requests"
ON public.tech_support_requests FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_tech_support_updated_at
BEFORE UPDATE ON public.tech_support_requests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_tech_support_status ON public.tech_support_requests(status);
CREATE INDEX idx_tech_support_user ON public.tech_support_requests(user_id);
