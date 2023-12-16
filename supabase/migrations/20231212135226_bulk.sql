CREATE TABLE bulk_jobs (
    id SERIAL NOT NULL PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users (id),
    payload jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);
ALTER TABLE bulk_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Can only view own bulk jobs."
    ON bulk_jobs
    FOR SELECT
    TO authenticated
    USING ((auth.uid() = user_id));

CREATE TABLE bulk_emails (
    id SERIAL NOT NULL PRIMARY KEY,
    bulk_job_id INTEGER NOT NULL REFERENCES bulk_jobs (id),
    call_id INTEGER REFERENCES calls (id),
    email TEXT NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);
ALTER TABLE bulk_emails ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Can only view own bulk emails."
    ON bulk_emails
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM bulk_jobs
            WHERE
                bulk_jobs.id = bulk_emails.bulk_job_id
                AND auth.uid() = bulk_jobs.user_id
        )
    );
