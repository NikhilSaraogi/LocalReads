-- 1. Create Books Table
create table public.books (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  author text not null,
  image_url text not null,
  owner_id uuid references auth.users not null,
  status text check (status in ('available', 'borrowed')) default 'available',
  max_borrow_duration integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on RLS for books
alter table public.books enable row level security;

-- Books Policies
create policy "Books are viewable by everyone" 
  on books for select using (true);

create policy "Users can insert their own books" 
  on books for insert with check (auth.uid() = owner_id);

create policy "Users can update their own books" 
  on books for update using (auth.uid() = owner_id);

-- 2. Create Borrow Requests Table
create table public.borrow_requests (
  id uuid default gen_random_uuid() primary key,
  book_id uuid references public.books not null,
  requester_id uuid references auth.users not null,
  status text check (status in ('pending', 'approved', 'rejected', 'returned')) default 'pending',
  duration integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on RLS for requests
alter table public.borrow_requests enable row level security;

-- Requests Policies
create policy "Users can see their own requests or requests for their books" 
  on borrow_requests for select 
  using (
    auth.uid() = requester_id OR 
    auth.uid() = (select owner_id from books where id = borrow_requests.book_id)
  );

create policy "Users can create requests" 
  on borrow_requests for insert 
  with check (auth.uid() = requester_id);

create policy "Book owners can update requests" 
  on borrow_requests for update 
  using (
    auth.uid() = (select owner_id from books where id = borrow_requests.book_id)
  );

-- 3. Trigger to Update Book Status on Request Approval
create or replace function update_book_status()
returns trigger as $$
begin
  if new.status = 'approved' then
    update public.books set status = 'borrowed' where id = new.book_id;
  elsif new.status = 'returned' then
    update public.books set status = 'available' where id = new.book_id;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger tr_borrow_request_status_change
after update of status on public.borrow_requests
for each row
when (old.status is distinct from new.status)
execute function update_book_status();
