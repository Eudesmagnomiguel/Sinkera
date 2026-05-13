CREATE TABLE public.short_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  original_price NUMERIC NULL,
  badge TEXT NULL,
  video_url TEXT NULL,
  thumbnail_url TEXT NOT NULL,
  product_link TEXT NULL,
  position INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.short_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active short_videos"
ON public.short_videos FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage short_videos"
ON public.short_videos FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_short_videos_updated_at
BEFORE UPDATE ON public.short_videos
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_short_videos_active_position ON public.short_videos(is_active, position);
