-- Add a verification_id UUID column, which is unique per email verification.
ALTER TABLE IF EXISTS public.calls
ADD COLUMN verification_id uuid not null default uuid_generate_v4();

-- Store the email domain name for debugging and analytics purpose.
ALTER TABLE IF EXISTS public.calls
ADD COLUMN domain text;
