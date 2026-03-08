
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  
  -- Always assign reader role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'reader');
  
  -- If signed up as author, also assign author role
  IF NEW.raw_user_meta_data->>'signup_type' = 'author' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'author');
  END IF;
  
  RETURN NEW;
END;
$function$;
