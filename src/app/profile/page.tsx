'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userCreated, setUserCreated] = useState(false);
  const [userExists, setUserExists] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function getUserAndCreateRecord() {
      try {
        // Get user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error('Error getting user:', userError);
          setError(userError.message);
          return;
        }
        
        if (!user) {
          console.log('No user found');
          return;
        }

        console.log('User data:', user);
        setUser(user);
        
        // Check if user exists in database
        const { data: existingUser, error: queryError } = await supabase
          .from('users')
          .select('id')
          .eq('id', user.id)
          .maybeSingle();
          
        if (queryError) {
          console.error('Error checking user:', queryError);
          setError(queryError.message);
          return;
        }
        
        if (existingUser) {
          console.log('User already exists in database');
          setUserExists(true);
          return;
        }
        
        // Create user record if it doesn't exist
        console.log('Creating user record...');
        const { error: insertError } = await supabase
          .from('users')
          .insert([
            { 
              id: user.id,
              email: user.email,
              first_name: user.user_metadata?.name?.split(' ')[0] || '',
              last_name: user.user_metadata?.name?.split(' ').slice(1).join(' ') || '',
              created_at: new Date().toISOString()
            }
          ]);
          
        if (insertError) {
          console.error('Error creating user:', insertError);
          setError(insertError.message);
          return;
        }
        
        console.log('User record created successfully!');
        setUserCreated(true);
        
      } catch (error: any) {
        console.error('Unexpected error:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    
    getUserAndCreateRecord();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">Your Profile</h1>
        
        {loading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2">Loading your profile...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        ) : user ? (
          <div className="space-y-4">
            {userCreated && (
              <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-md mb-4">
                <p className="font-bold">Success!</p>
                <p>Your user account has been created successfully.</p>
              </div>
            )}
            
            {userExists && (
              <div className="bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-md mb-4">
                <p className="font-bold">Welcome Back!</p>
                <p>You already have an account in our system.</p>
              </div>
            )}
            
            <div className="bg-blue-50 p-6 rounded-lg">
              <h2 className="font-medium text-lg mb-2">Account Information</h2>
              <div className="space-y-2">
                <p><span className="font-medium">Email:</span> {user.email}</p>
                <p><span className="font-medium">Name:</span> {user.user_metadata?.name || 'Not provided'}</p>
                <p><span className="font-medium">User ID:</span> {user.id}</p>
                <p><span className="font-medium">Last Sign In:</span> {new Date(user.last_sign_in_at).toLocaleString()}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium">Raw User Data (for debugging):</h3>
              <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-60">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
            
            <div className="flex space-x-2 mt-6">
              <Link href="/dashboard" className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 flex-1 text-center">
                Go to Dashboard
              </Link>
              <button 
                onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.href = '/signin';
                }}
                className="bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300 flex-1"
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p className="mb-4">You're not signed in.</p>
            <Link href="/signin" className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 inline-block">
              Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 