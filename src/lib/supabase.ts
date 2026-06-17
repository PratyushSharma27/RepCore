import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://fqceilcppsxhdreodspk.supabase.co";
const supabaseAnonKey = "sb_publishable_xKUgH4613AnfsC5NxpVKTA_AAnUCAm7";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
