import { createServerSupabaseClient } from './supabase-server';

export async function getToken() {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("Auth error:", error);
      return null;
    }
    
    if (!session?.user) {
      return null;
    }
    
    return {
      id: session.user.id,
      email: session.user.email
    };
  } catch (err) {
    console.error("Auth helper error:", err);
    return null;
  }
} 