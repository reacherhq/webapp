CREATE OR REPLACE VIEW sub_and_calls
WITH (security_invoker = TRUE)
AS
WITH filtered_calls AS (
    SELECT 
        user_id,
        id,
        created_at,
        endpoint
    FROM public.calls
    WHERE created_at >= (NOW() - INTERVAL '1 month')
)
SELECT
    u.id AS user_id,
    s.id AS subscription_id,
    s.status,
    s.current_period_start,
    s.current_period_end,
    s.cancel_at,
    COUNT(CASE WHEN c.endpoint != '/v1/commercial_license_trial' THEN c.id END) AS number_of_calls,
    pro.id AS product_id
FROM
    public.users u
    LEFT JOIN public.subscriptions s ON u.id = s.user_id AND s.status = 'active'
    LEFT JOIN public.prices pri ON pri.id = s.price_id
    LEFT JOIN public.products pro ON pro.id = pri.product_id
    LEFT JOIN filtered_calls c ON u.id = c.user_id AND (
        (
            s.current_period_start IS NOT NULL AND
            s.current_period_end IS NOT NULL AND
            c.created_at BETWEEN s.current_period_start AND s.current_period_end
        ) OR (
            s.current_period_start IS NULL
        )
    )
GROUP BY
    u.id,
    s.id,
    s.status,
    s.current_period_start,
    s.current_period_end,
    s.cancel_at,
    pro.id;

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