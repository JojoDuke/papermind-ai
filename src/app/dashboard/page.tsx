import { redirect } from 'next/navigation';
import Dashboard from "@/components/dashboard/dashboard";
import { createServerSupabaseClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const supabase = createServerSupabaseClient();
  
  // Check if user is authenticated
  const { data: { session } } = await supabase.auth.getSession();
  
  // If not authenticated, redirect to signin
  if (!session) {
    redirect('/signin');
  }
  
  return <Dashboard />;
}
