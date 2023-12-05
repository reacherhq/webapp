-- Verif method is the email verification method, it can be either:
-- 'Smtp', 'Headless', 'Api', 'Skipped'
ALTER TABLE calls ADD COLUMN verif_method VARCHAR(20);