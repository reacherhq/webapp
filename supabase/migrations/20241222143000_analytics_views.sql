-- View for unknown domains in the last 3 months
CREATE OR REPLACE VIEW analytics_unknown_domains_past_3mo
WITH (security_invoker = on) AS
SELECT 
    domain,
    COUNT(*) as occurrences
FROM calls
WHERE 
    is_reachable = 'unknown'
    AND created_at >= NOW() - INTERVAL '3 months'
    AND domain IS NOT NULL
GROUP BY domain
ORDER BY occurrences DESC;

-- View for monthly email verification results
CREATE OR REPLACE VIEW analytics_monthly_results
WITH (security_invoker = on) AS
SELECT 
    DATE_TRUNC('month', created_at) as month,
    SUM(CASE WHEN is_reachable = 'safe' THEN 1 ELSE 0 END) as safe_count,
    SUM(CASE WHEN is_reachable = 'risky' THEN 1 ELSE 0 END) as risky_count,
    SUM(CASE WHEN is_reachable = 'unknown' THEN 1 ELSE 0 END) as unknown_count,
    SUM(CASE WHEN is_reachable = 'invalid' THEN 1 ELSE 0 END) as invalid_count
FROM calls
GROUP BY month
ORDER BY month DESC;

-- View for monthly unique users using commercial license endpoint
CREATE OR REPLACE VIEW analytics_commercial_license_usage
WITH (security_invoker =  on) AS
SELECT 
    DATE_TRUNC('month', created_at) as month,
    COUNT(DISTINCT user_id) as trial_users
FROM calls
WHERE endpoint = '/v1/commercial_license_trial'
GROUP BY month
ORDER BY month DESC;

-- View for commercial license users in the past month
CREATE OR REPLACE VIEW analytics_commercial_license_users_past_month
WITH (security_invoker = on) AS
SELECT 
    u.id AS user_id,
    u.email,
    u.created_at AS registration_date,
    COUNT(c.id) AS call_count
FROM auth.users u
JOIN calls c ON u.id = c.user_id
WHERE c.endpoint = '/v1/commercial_license_trial'
    AND c.created_at >= NOW() - INTERVAL '1 month'
GROUP BY u.id, u.email, u.created_at
ORDER BY call_count DESC;

-- View for SaaS users with active subscriptions
CREATE VIEW analytics_saas_users
WITH (security_invoker = on) AS
SELECT 
    u.id AS user_id,
    u.email,
    u.created_at AS sign_up_date,
    s.id AS subscription_id,
    COUNT(c.id) AS email_count
FROM auth.users u
JOIN subscriptions s ON u.id = s.user_id
JOIN calls c ON u.id = c.user_id
WHERE s.status = 'active'
    AND c.created_at >= NOW() - INTERVAL '1 month'
GROUP BY u.id, u.email, u.created_at, s.id
ORDER BY email_count DESC;

-- View to analyze how users heard about the service in the last 3 months
CREATE OR REPLACE VIEW analytics_acquisition_channels_past_3mo
WITH (security_invoker = TRUE) AS
SELECT 
  raw_user_meta_data->>'heardFrom' as heard_from,
  COUNT(*) AS user_count
FROM auth.users
WHERE raw_user_meta_data->>'heardFrom' IS NOT NULL
AND created_at >= NOW() - INTERVAL '3 months'
GROUP BY heard_from
ORDER BY user_count DESC;