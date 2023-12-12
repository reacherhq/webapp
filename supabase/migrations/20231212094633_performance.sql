/*
    This SQL code creates a view called "subs_and_calls" that combines information from three tables: "auth.users", "subscriptions", and "calls".
    The view includes the following columns:
    - u.id: The user ID from the "auth.users" table.
    - u.email: The user's email address from the "auth.users" table.
    - s.id AS subscription_id: The subscription ID from the "subscriptions" table.
    - s.current_period_start: The start date of the current subscription period from the "subscriptions" table.
    - s.current_period_end: The end date of the current subscription period from the "subscriptions" table.
    - COUNT(c.id) AS number_of_calls: The number of calls made by the user, calculated by counting the records in the "calls" table.

    The view is created using LEFT JOINs to ensure that all users are included, even if they don't have an active subscription or any calls.
    The JOIN conditions filter the subscriptions based on their status being 'active' and the calls based on their creation date falling within the current subscription period or within the last month.

    The result is grouped by the user ID, subscription ID, and current subscription period end date.

    This view can be used to retrieve information about users, their subscriptions, and the number of calls they have made.
*/
CREATE VIEW sub_and_calls
AS
    SELECT
        u.id as user_id,
        s.id AS subscription_id,
        s.current_period_start,
        s.current_period_end,
        pro.id as product_id,
        COUNT(c.id) AS number_of_calls
    FROM
        users u
    LEFT JOIN
        subscriptions s ON u.id = s.user_id
        AND s.status = 'active'
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

-- Create in index on api_token to speed up the query.
CREATE INDEX api_token_index ON public.users (api_token);