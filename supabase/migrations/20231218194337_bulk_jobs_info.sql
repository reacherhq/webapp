CREATE VIEW bulk_jobs_info AS
    SELECT 
        bj.id AS job_id,
        bj.user_id,
        bj.created_at,
        COUNT(DISTINCT be.id) AS number_of_emails,
        COUNT(DISTINCT CASE WHEN c.id IS NOT NULL THEN be.id ELSE NULL END) AS verified
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

