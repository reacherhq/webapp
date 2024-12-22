-- Add indexes for commonly joined/filtered columns
CREATE INDEX IF NOT EXISTS idx_calls_created_at ON calls(created_at);
CREATE INDEX IF NOT EXISTS idx_calls_user_id_created_at ON calls(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_calls_endpoint ON calls(endpoint);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id_status ON subscriptions(user_id, status); 
