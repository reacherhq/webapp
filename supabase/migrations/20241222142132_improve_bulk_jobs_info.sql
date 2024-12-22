CREATE OR REPLACE VIEW bulk_jobs_info
WITH (security_invoker = TRUE)
AS
WITH call_stats AS (
    SELECT 
        be.bulk_job_id,
        COUNT(DISTINCT be.id) AS verified,
        SUM(CASE WHEN c.is_reachable = 'risky' THEN 1 ELSE 0 END) as risky,
        SUM(CASE WHEN c.is_reachable = 'invalid' THEN 1 ELSE 0 END) as invalid,
        SUM(CASE WHEN c.is_reachable = 'unknown' THEN 1 ELSE 0 END) as unknown,
        SUM(CASE WHEN c.is_reachable = 'safe' THEN 1 ELSE 0 END) as safe,
        MAX(c.created_at) as last_call_time
    FROM bulk_emails be
    LEFT JOIN calls c ON be.id = c.bulk_email_id
    GROUP BY be.bulk_job_id
)
SELECT 
    bj.id AS bulk_job_id,
    bj.user_id,
    bj.created_at,
    COUNT(DISTINCT be.id) AS number_of_emails,
    COALESCE(cs.verified, 0) AS verified,
    COALESCE(cs.risky, 0) AS risky,
    COALESCE(cs.invalid, 0) AS invalid,
    COALESCE(cs.unknown, 0) AS unknown,
    COALESCE(cs.safe, 0) AS safe,
    cs.last_call_time
FROM 
    bulk_jobs bj
    LEFT JOIN bulk_emails be ON bj.id = be.bulk_job_id
    LEFT JOIN call_stats cs ON cs.bulk_job_id = bj.id
GROUP BY 
    bj.id,
    cs.verified,
    cs.risky,
    cs.invalid,
    cs.unknown,
    cs.safe,
    cs.last_call_time
ORDER BY 
    bj.created_at DESC; 