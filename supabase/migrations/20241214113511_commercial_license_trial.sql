CREATE VIEW commercial_license_trial AS
SELECT 
    user_id,
    COUNT(*) AS calls_last_day,
    COUNT(CASE WHEN created_at >= NOW() - INTERVAL '1 minute' THEN 1 END) AS calls_last_minute,
    MIN(created_at) AS first_call_in_past_24h
FROM 
    public.calls
WHERE
    endpoint = '/v1/commercial_license_trial' 
    AND created_at >= NOW() - INTERVAL '24 hours'
GROUP BY 
    user_id;