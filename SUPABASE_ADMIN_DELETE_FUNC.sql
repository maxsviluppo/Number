-- FUNCTION: admin_delete_user
-- DESCRIPTION: COMPLETELY removes a user from both profiles AND auth.users
-- This bypasses Row Level Security (RLS) policies by using 'security definer'.

create or replace function admin_delete_user(target_user_id uuid, admin_secret text)
returns void
language plpgsql
security definer -- EXECUTE AS OWNER (Bypasses RLS)
as $$
begin
  -- Validate the secret
  if admin_secret = 'accessometti' then
    
    -- 1. Delete from public profiles
    delete from public.profiles where id = target_user_id;

    -- 2. Delete from auth users (Gives full account deletion)
    delete from auth.users where id = target_user_id;
    
  else
    raise exception 'Unauthorized: Invalid Admin Secret';
  end if;
end;
$$;
