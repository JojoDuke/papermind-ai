import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoginLink } from "@kinde-oss/kinde-auth-nextjs/server";
import Image from "next/image";
import Link from "next/link";

export default function SignInPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-[#f8f9fa]">
      {/* Logo or icon at the top */}
      <div className="mb-8">
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

      <h1 className="text-2xl font-bold mb-8 text-gray-800">Sign in</h1>

      <div className="w-full max-w-md bg-white rounded-lg p-8 shadow-sm border border-gray-200">
        <div className="space-y-7">
          <div className="space-y-2.5 mb-6">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="Your email address"
              className="w-full border-gray-300 focus:border-primary focus:ring-primary"
            />
          </div>

          <LoginLink>
            <Button className="w-full bg-primary hover:bg-primary-light text-white font-medium py-2.5">
              Continue
            </Button>
          </LoginLink>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-4 text-gray-500 font-medium">
                OR
              </span>
            </div>
          </div>

          <LoginLink authUrlParams={{ provider: "google" }}>
            <Button 
              variant="outline" 
              className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2.5 flex items-center justify-center"
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
          </LoginLink>
        </div>

        <div className="mt-8 text-center text-sm">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <Link href="/signup" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 