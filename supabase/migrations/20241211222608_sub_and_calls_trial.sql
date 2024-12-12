DROP VIEW IF EXISTS sub_and_calls;
CREATE VIEW sub_and_calls
WITH (security_invoker = TRUE)
AS
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
    LEFT JOIN public.subscriptions s ON u.id = s.user_id AND s.status = 'active'::public.subscription_status
    LEFT JOIN public.prices pri ON pri.id = s.price_id
    LEFT JOIN public.products pro ON pro.id = pri.product_id
    LEFT JOIN public.calls c ON u.id = c.user_id AND (
        (
            s.current_period_start IS NOT NULL AND
            s.current_period_end IS NOT NULL AND
            c.created_at >= s.current_period_start AND
            c.created_at <= s.current_period_end
        ) OR (
            (s.current_period_start IS NULL OR s.current_period_end IS NULL) AND
            c.created_at >= (NOW() - INTERVAL '1 month')
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
