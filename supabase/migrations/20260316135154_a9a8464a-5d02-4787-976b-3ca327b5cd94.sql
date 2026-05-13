-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

-- Allow anyone to view product images
CREATE POLICY "Anyone can view product images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');

-- Allow authenticated admins and resellers to upload product images
CREATE POLICY "Admins and resellers can upload product images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'product-images' AND (
    public.has_role(auth.uid(), 'admin'::public.app_role) OR 
    public.has_role(auth.uid(), 'reseller'::public.app_role)
  )
);

-- Allow admins and resellers to update their images
CREATE POLICY "Admins and resellers can update product images" ON storage.objects FOR UPDATE TO authenticated USING (
  bucket_id = 'product-images' AND (
    public.has_role(auth.uid(), 'admin'::public.app_role) OR 
    public.has_role(auth.uid(), 'reseller'::public.app_role)
  )
);

-- Allow admins and resellers to delete product images
CREATE POLICY "Admins and resellers can delete product images" ON storage.objects FOR DELETE TO authenticated USING (
  bucket_id = 'product-images' AND (
    public.has_role(auth.uid(), 'admin'::public.app_role) OR 
    public.has_role(auth.uid(), 'reseller'::public.app_role)
  )
);

-- Create function to reduce stock on order creation
CREATE OR REPLACE FUNCTION public.reduce_stock_on_order()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.products
  SET 
    stock_quantity = GREATEST(0, COALESCE(stock_quantity, 0) - NEW.quantity),
    in_stock = CASE WHEN GREATEST(0, COALESCE(stock_quantity, 0) - NEW.quantity) > 0 THEN true ELSE false END
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$;

-- Create trigger to auto-reduce stock when order items are inserted
CREATE TRIGGER on_order_item_created
  AFTER INSERT ON public.order_items
  FOR EACH ROW
  EXECUTE FUNCTION public.reduce_stock_on_order();