CREATE TABLE public.partner_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('revendedor', 'parceiro', 'prestador')),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  company TEXT NULL,
  province TEXT NULL,
  message TEXT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.partner_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit applications"
ON public.partner_applications FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can manage applications"
ON public.partner_applications FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_partner_applications_updated_at
BEFORE UPDATE ON public.partner_applications
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
