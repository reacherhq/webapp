CREATE OR REPLACE FUNCTION get_user_calls_count(created_at_param timestamptz)
RETURNS INTEGER AS $$
DECLARE
    calls_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO calls_count
    FROM calls
    WHERE created_at >= created_at_param;
    
    RETURN calls_count;
END;
$$ LANGUAGE plpgsql;
