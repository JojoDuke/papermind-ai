'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function createUserRecord() {
      try {
        // Check if we have a success parameter in the URL
        const urlParams = new URLSearchParams(window.location.search);
        const success = urlParams.get('success');
        
        if (success === 'true') {
          console.log('Success parameter detected, redirecting to dashboard');
          router.push('/dashboard?success=true');
          return;
        }
        
        // Get user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error('Error getting user:', userError);
          setError(userError.message);
          return;
        }
        
        if (!user) {
          console.log('No user found');
          setError('No authenticated user found');
          return;
        }

        console.log('User data:', user);
        
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
          // Add a delay to give the credits time to initialize
          await new Promise(resolve => setTimeout(resolve, 1500));
          // Existing user - redirect to dashboard
          router.push('/dashboard');
          return;
        }
        
        // Create user record if it doesn't exist
        try {
          console.log('Creating user record...');
          const { error: insertError } = await supabase
            .from('users')
            .insert([
              { 
                id: user.id,
                email: user.email,
                first_name: user.user_metadata?.name?.split(' ')[0] || '',
                last_name: user.user_metadata?.name?.split(' ').slice(1).join(' ') || '',
                created_at: new Date().toISOString(),
                credits_remaining: 10, // Start with 10 credits for new users
                is_premium: false
              }
            ]);
            
          if (insertError) {
            // Check if it's a duplicate key error (user was created between our check and insert)
            if (insertError.code === '23505') {
              console.log('User was created concurrently, redirecting to dashboard');
              // Add a delay to give the credits time to initialize
              await new Promise(resolve => setTimeout(resolve, 1500));
              router.push('/dashboard');
            } else {
              console.error('Error creating user:', insertError);
              setError(insertError.message);
            }
            return;
          }
          
          console.log('User record created successfully!');
          // Add a delay to give the credits time to initialize
          await new Promise(resolve => setTimeout(resolve, 1500));
          // Only redirect once the user is fully created
          router.push('/dashboard');
          
        } catch (insertErr: any) {
          // If user was already created (race condition), just redirect
          if (insertErr.code === '23505' || (insertErr.message && insertErr.message.includes('duplicate key'))) {
            console.log('User already exists (caught in catch), redirecting to dashboard');
            // Add a delay to give the credits time to initialize
            await new Promise(resolve => setTimeout(resolve, 1500));
            router.push('/dashboard');
          } else {
            console.error('Error in catch block:', insertErr);
            setError(insertErr.message);
          }
        }
        
      } catch (error: any) {
        console.error('Unexpected error:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    
    createUserRecord();
  }, [router]);

  // Show only loading animation or error
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md max-w-md">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      ) : (
        <div className="flex items-center justify-center">
          <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
} 