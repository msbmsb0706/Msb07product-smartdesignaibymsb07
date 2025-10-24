-- Create designs table for storing user design projects
create table if not exists public.designs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  original_image_url text,
  processed_image_url text,
  ai_prompt text,
  status text default 'processing' check (status in ('processing', 'completed', 'failed')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.designs enable row level security;

-- RLS policies for designs
create policy "designs_select_own"
  on public.designs for select
  using (auth.uid() = user_id);

create policy "designs_insert_own"
  on public.designs for insert
  with check (auth.uid() = user_id);

create policy "designs_update_own"
  on public.designs for update
  using (auth.uid() = user_id);

create policy "designs_delete_own"
  on public.designs for delete
  using (auth.uid() = user_id);
