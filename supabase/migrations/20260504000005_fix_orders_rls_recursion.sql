-- Fix infinite recursion in orders/order_items RLS policies.
--
-- Root cause: order_items SELECT policy queries orders, which triggers the
-- "Resellers can view orders with their products" policy on orders, which
-- queries order_items, which triggers the order_items SELECT policy → loop.
--
-- Fix: replace the order_items policies with a SECURITY DEFINER helper that
-- checks order ownership without going through RLS on orders.

CREATE OR REPLACE FUNCTION public.order_belongs_to_user(p_order_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.orders
    WHERE id = p_order_id AND user_id = p_user_id
  );
$$;

DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can create order items for own orders" ON public.order_items;

CREATE POLICY "Users can view own order items" ON public.order_items
  FOR SELECT USING (public.order_belongs_to_user(order_id, auth.uid()));

CREATE POLICY "Users can create order items for own orders" ON public.order_items
  FOR INSERT WITH CHECK (public.order_belongs_to_user(order_id, auth.uid()));
