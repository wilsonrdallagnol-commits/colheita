-- Migration 0014 DOWN — Remove orders tables
drop table if exists public.order_items;
drop table if exists public.orders;
