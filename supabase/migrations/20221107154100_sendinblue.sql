-- Add a sendinblue_contact_id for each user.
ALTER TABLE IF EXISTS public.users
ADD COLUMN sendinblue_contact_id text;
