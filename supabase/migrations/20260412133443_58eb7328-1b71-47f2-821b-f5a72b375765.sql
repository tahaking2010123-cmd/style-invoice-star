
-- Create a sequence for barcode auto-increment
CREATE SEQUENCE IF NOT EXISTS public.barcode_seq START WITH 1 INCREMENT BY 1;

-- Set the sequence to start after any existing products
SELECT setval('public.barcode_seq', COALESCE((SELECT MAX(CASE WHEN barcode ~ '^\d+$' THEN barcode::bigint ELSE 0 END) FROM public.products), 0));

-- Set default value for barcode column
ALTER TABLE public.products ALTER COLUMN barcode SET DEFAULT nextval('public.barcode_seq')::text;
