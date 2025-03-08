'use client'

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Check if form is valid
  const isFormValid = firstName && lastName && email && password;
  
  // Handle signup
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!isFormValid) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // 1. Sign up with Supabase Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName
          }
        }
      });
      
      if (signUpError) throw signUpError;
      
      // 2. Create a record in the users table
      if (authData.user) {
        const { error: insertError } = await supabase
          .from('users')
          .insert([
            { 
              id: authData.user.id,
              first_name: firstName,
              last_name: lastName,
              email: email,
              created_at: new Date().toISOString()
            }
          ]);
        
        if (insertError) {
          console.error("Error inserting user data:", insertError);
          // Continue anyway since the auth user was created
        }
      }
      
      // Redirect to dashboard or confirmation page
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign up');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 pt-8 pb-16 md:pt-12 md:pb-24 bg-[#f8f9fa]">
      {/* Logo or icon at the top */}
      <div className="mb-10 mt-2">
        <div className="w-14 h-14 bg-primary rounded-md flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="white"
            className="w-7 h-7"
          >
            <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32l8.4-8.4z" />
            <path d="M5.25 5.25a3 3 0 00-3 3v10.5a3 3 0 003 3h10.5a3 3 0 003-3V13.5a.75.75 0 00-1.5 0v5.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5V8.25a1.5 1.5 0 011.5-1.5h5.25a.75.75 0 000-1.5H5.25z" />
          </svg>
        </div>
      </div>

      <h1 className="text-2xl font-bold mb-8 text-gray-800">Sign up</h1>

      <div className="w-full max-w-md bg-white rounded-lg p-8 shadow-sm border border-gray-200">
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSignUp} className="space-y-6">
          <div className="space-y-2.5">
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
              First Name
            </label>
            <Input
              id="firstName"
              type="text"
              placeholder="Your first name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full outline-none focus:outline-none border-gray-300"
              style={{ boxShadow: 'none' }}
              required
            />
          </div>

          <div className="space-y-2.5">
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
              Last Name
            </label>
            <Input
              id="lastName"
              type="text"
              placeholder="Your last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full outline-none focus:outline-none border-gray-300"
              style={{ boxShadow: 'none' }}
              required
            />
          </div>

          <div className="space-y-2.5">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full outline-none focus:outline-none border-gray-300"
              style={{ boxShadow: 'none' }}
              required
            />
          </div>

          <div className="space-y-2.5">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full outline-none focus:outline-none border-gray-300"
              style={{ boxShadow: 'none' }}
              required
            />
          </div>

          <Button 
            type="submit"
            className="w-full bg-primary hover:bg-primary-light text-white font-medium py-2.5 mt-4"
            disabled={!isFormValid || loading}
          >
            {loading ? 'Signing up...' : 'Sign up'}
          </Button>
        </form>

        <div className="relative py-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-4 text-gray-500 font-medium">
              OR
            </span>
          </div>
        </div>

        <Button 
          variant="outline" 
          className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2.5 flex items-center justify-center"
          onClick={async () => {
            try {
              const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                  redirectTo: `${window.location.origin}/auth/callback`
                }
              });
              if (error) throw error;
            } catch (err) {
              console.error(err);
            }
          }}
        >
          <Image
            src="/google.svg"
            alt="Google"
            width={20}
            height={20}
            className="mr-3"
          />
          Continue with Google
        </Button>

        <div className="mt-8 text-center text-sm">
          <p className="text-gray-600">
            Already have an account?{" "}
            <Link href="/signin" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <div className="mt-12 mb-8 text-center text-xs text-gray-500 max-w-md px-4">
        <p>
          By creating an account, you agree to the{" "}
          <Link href="/terms" className="text-primary hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
} 