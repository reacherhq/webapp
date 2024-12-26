CREATE OR REPLACE VIEW analytics_commercial_license_users_past_month
WITH (security_invoker = on) AS
SELECT 
    u.id AS user_id,
    u.email,
    u.created_at AS registration_date,
    COUNT(c.id) AS call_count,
    SUM(CASE WHEN c.is_reachable = 'unknown' THEN 1 ELSE 0 END) AS unknown_email_count
FROM auth.users u
JOIN calls c ON u.id = c.user_id
WHERE c.endpoint = '/v1/commercial_license_trial'
    AND c.created_at >= NOW() - INTERVAL '1 month'
GROUP BY u.id, u.email, u.created_at
ORDER BY call_count DESC;