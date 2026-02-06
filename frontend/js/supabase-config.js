/**
 * Sabroson Supabase Configuration
 * Dedicated connection for database and auth services.
 */

const SUPABASE_URL = 'https://yurtxsshkcnlzjaxmsmb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_oXtv9S07XnZMY_NzkcCLyQ_MPNSYomb';

// Initialize the Supabase client
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Make it globally accessible
window.supabase = supabase;
