-- Real values from Reacher's Stripe testing environment.
insert into products (id,active,name)
values 
  ('prod_HvO8qL4nV1sjfJ', true, 'Commercial License Plan'),
  ('prod_JwU31ryqYd7r8Y', true, 'SaaS 10k Emails Plan');

insert into prices (id,product_id,active,description,unit_amount,currency,type,interval,interval_count,trial_period_days)
values 
  ('price_1JIb32A852XqldwXHpy0KJGS', 'prod_HvO8qL4nV1sjfJ', true, 'TEST description 1',39900,'eur','recurring','month',1,null),
  ('price_1JIb50A852XqldwXA2gxScSJ', 'prod_JwU31ryqYd7r8Y', true, 'TEST description 2',6900,'eur','recurring','month',1,null),
  ('price_1JIb50A852XqldwXvtpXCf2u', 'prod_JwU31ryqYd7r8Y', true, 'TEST description 3',6900,'usd','recurring','month',1,null),
  ('price_1JIb3EA852XqldwXi2KWgScu', 'prod_HvO8qL4nV1sjfJ', true, 'TEST description 4',39900,'usd','recurring','month',1,null);