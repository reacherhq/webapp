-- Segment#0 defines all users that have made API calls, but did not subscribe
-- to any plan. Try to understand why.
CREATE OR REPLACE VIEW segment0 AS
    SELECT 
        u.email,
        COUNT(c.id) as number_of_calls,
        u.created_at,
        MAX(c.created_at) as last_api_call,
        u.id
    FROM calls c
    LEFT JOIN subscriptions s ON c.user_id = s.user_id
    JOIN auth.users u ON u.id = c.user_id
    WHERE s.id IS NULL
    AND u.created_at > NOW() - INTERVAL '3 day'
    GROUP BY (u.id, s.id);