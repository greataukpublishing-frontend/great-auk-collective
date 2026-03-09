
-- Fix: grant author role to ALL users who signed up as author but are missing it
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'author'::app_role
FROM auth.users u
WHERE u.raw_user_meta_data->>'signup_type' = 'author'
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur WHERE ur.user_id = u.id AND ur.role = 'author'
  );

-- Also grant author role to the admin user so they can access author dashboard too
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'author'::app_role
FROM auth.users u
JOIN public.user_roles ur ON ur.user_id = u.id AND ur.role = 'admin'
WHERE NOT EXISTS (
    SELECT 1 FROM public.user_roles ur2 WHERE ur2.user_id = u.id AND ur2.role = 'author'
);
