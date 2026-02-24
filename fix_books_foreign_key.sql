-- Drop the old foreign key that linked to auth.users
ALTER TABLE public.books
DROP CONSTRAINT IF EXISTS books_owner_id_fkey;

-- Add a new foreign key linking books directly to the public profiles table
ALTER TABLE public.books
ADD CONSTRAINT books_owner_id_fkey
FOREIGN KEY (owner_id) REFERENCES public.profiles(id)
ON DELETE CASCADE;

-- Also update the borrow requests table so we can fetch requester details if we need to
ALTER TABLE public.borrow_requests
DROP CONSTRAINT IF EXISTS borrow_requests_requester_id_fkey;

ALTER TABLE public.borrow_requests
ADD CONSTRAINT borrow_requests_requester_id_fkey
FOREIGN KEY (requester_id) REFERENCES public.profiles(id)
ON DELETE CASCADE;

-- Tell PostgREST to refresh its schema cache immediately
NOTIFY pgrst, 'reload schema';
