DROP VIEW sub_and_calls;
CREATE VIEW sub_and_calls
WITH
    ( security_invoker = TRUE )
AS
    SELECT
        u.id as user_id,
        s.id AS subscription_id,
        s.status,
        s.current_period_start,
        s.current_period_end,
        s.cancel_at,
        COUNT(c.id) AS number_of_calls,
        pro.id as product_id
    FROM
        users u
    LEFT JOIN
        subscriptions s ON u.id = s.user_id AND s.status = 'active'
    LEFT JOIN
        prices pri ON pri.id = s.price_id
    LEFT JOIN
        products pro on pro.id = pri.product_id
    LEFT JOIN
        calls c ON u.id = c.user_id
        AND (
            (s.current_period_start IS NOT NULL AND s.current_period_end IS NOT NULL AND c.created_at BETWEEN s.current_period_start AND s.current_period_end)
            OR
            (c.created_at >= NOW() - INTERVAL '1 MONTH')
        )
    GROUP BY
        u.id, s.id, s.current_period_end, pro.id;