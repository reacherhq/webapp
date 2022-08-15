-- Add a verification_id UUID column, which is unique per email verification.
ALTER TABLE IF EXISTS public.calls
ADD COLUMN verification_id uuid not null unique default uuid_generate_v1();

-- Store the email domain name for debugging and analytics purpose.
ALTER TABLE IF EXISTS public.calls
ADD COLUMN domain text;
