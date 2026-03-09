
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Use ON CONFLICT to avoid duplicate errors
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email))
  ON CONFLICT (id) DO NOTHING;
  
  -- Always assign reader role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'reader')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- If signed up as author, also assign author role
  IF NEW.raw_user_meta_data->>'signup_type' = 'author' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'author')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$function$;
