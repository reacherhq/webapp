CREATE VIEW bulk_jobs_info AS
    SELECT 
        bj.id AS bulk_job_id,
        bj.user_id,
        bj.created_at,
        COUNT(DISTINCT be.id) AS number_of_emails,
        COUNT(DISTINCT CASE WHEN c.id IS NOT NULL THEN be.id ELSE NULL END) AS verified,
        SUM(CASE WHEN c.is_reachable = 'risky' THEN 1 ELSE 0 END) as risky,
        SUM(CASE WHEN c.is_reachable = 'invalid' THEN 1 ELSE 0 END) as invalid,
        SUM(CASE WHEN c.is_reachable = 'unknown' THEN 1 ELSE 0 END) as unknown,
        SUM(CASE WHEN c.is_reachable = 'safe' THEN 1 ELSE 0 END) as safe,
        MAX(c.created_at) as last_call_time
    FROM 
        bulk_jobs bj
    LEFT JOIN 
        bulk_emails be ON bj.id = be.bulk_job_id
    LEFT JOIN 
        calls c ON be.id = c.bulk_email_id
    GROUP BY 
        bj.id
    ORDER BY 
        bj.created_at DESC;
