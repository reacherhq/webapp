CREATE OR REPLACE FUNCTION get_bulk_results(id_param INT)
RETURNS TABLE(
    id integer,
    email text,
    is_reachable is_reachable_type,
    result json,
    verified_at timestamptz
) AS $$
    BEGIN
        RETURN QUERY 
        SELECT 
            c.bulk_email_id as id,
            b.email,
            c.is_reachable,
            c.result,
            c.created_at as verified_at
        FROM 
            calls c
        INNER JOIN 
            bulk_emails b ON c.bulk_email_id = b.id
        WHERE 
            b.bulk_job_id = id_param;
    END;
$$ LANGUAGE plpgsql;