-- Down migration 0013 — reverter Safra product stock

drop table if exists public.product_stock;

alter table public.products
  drop column if exists safra_codigo;
