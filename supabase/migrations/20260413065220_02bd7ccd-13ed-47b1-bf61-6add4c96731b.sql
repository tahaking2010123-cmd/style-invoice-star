
-- Add type column to customers
ALTER TABLE public.customers ADD COLUMN type text NOT NULL DEFAULT 'buyer';

-- Add customer_id to invoices for proper linking
ALTER TABLE public.invoices ADD COLUMN customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL;
