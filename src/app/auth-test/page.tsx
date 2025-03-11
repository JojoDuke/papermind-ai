'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function AuthTestPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('Auth Test: Checking session...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }
        
        console.log('Auth Test: Session result:', session ? 'Session exists' : 'No session');
        
        if (session) {
          console.log('Auth Test: User ID:', session.user.id);
          setUser(session.user);
        }
      } catch (err: any) {
        console.error('Auth Test: Error checking session:', err);
        setError(err.message || 'An error occurred while checking authentication');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      window.location.href = '/signin';
    } catch (err: any) {
      console.error('Error signing out:', err);
      setError(err.message || 'An error occurred while signing out');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-6">Authentication Test Page</h1>
      
      {loading ? (
        <p>Loading authentication state...</p>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      ) : user ? (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Authenticated!</p>
          <p>User ID: {user.id}</p>
          <p>Email: {user.email}</p>
        </div>
      ) : (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          <p>Not authenticated</p>
        </div>
      )}

      <div className="flex gap-4 mt-6">
        {user ? (
          <button
            onClick={handleSignOut}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
          >
            Sign Out
          </button>
        ) : (
          <Link
            href="/signin"
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            Sign In
          </Link>
        )}
        
        <Link
          href="/dashboard"
          className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
} 