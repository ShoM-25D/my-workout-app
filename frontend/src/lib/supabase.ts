import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// これを呼び出すだけで、どこからでもDBを操作できるようになります
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
