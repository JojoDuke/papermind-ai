import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <MaxWidthWrapper className="mb-12 mt-28 sm:mt-40 flex flex-col items-center justify-center text-center">
      <div className="mx-auto mb-4 flex max-w-fit items-center justify-center space-x-2 overflow-hidden rounded-full border border-gray-200 bg-white px-7 py-2 shadow-md backdrop-blur transition-all hover:border-gray-300 hover:bg-white/50">
        <p className="text-sm font-semibold text-gray-700">
          Papermind AI is now in beta!
        </p>
      </div>
      <h1 className="max-w-4xl text-5xl font-bold md:text-6xl lg:text-7xl">
        Create your account
      </h1>
      <p className="mt-5 max-w-prose text-zinc-700 sm:text-lg">
        Get started with Papermind AI for free. No credit card required.
      </p>

      <div className="mt-8 flex flex-col sm:flex-row gap-4">
        <Button size="lg" className="bg-[#5D3FD3] hover:bg-[#4B32A8] text-white">
          Sign up with Google <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
        <Button size="lg" variant="outline">
          Sign up with Email <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>

      <p className="mt-5 text-zinc-700 text-sm">
        Already have an account?{" "}
        <Link 
          href="/signin" 
          className="font-semibold text-[#5D3FD3] hover:text-[#4B32A8]"
        >
          Sign in
        </Link>
      </p>

      <div className="mt-12 text-center">
        <h2 className="text-3xl font-bold mb-4">Why choose Papermind AI?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-8">
          <div className="flex flex-col items-center">
            <div className="rounded-full bg-[#5D3FD3]/10 p-4 mb-4">
              <svg className="w-6 h-6 text-[#5D3FD3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">Lightning Fast</h3>
            <p className="text-zinc-700 text-sm">Get instant insights from your documents</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="rounded-full bg-[#5D3FD3]/10 p-4 mb-4">
              <svg className="w-6 h-6 text-[#5D3FD3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">Secure</h3>
            <p className="text-zinc-700 text-sm">Your documents are safe with us</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="rounded-full bg-[#5D3FD3]/10 p-4 mb-4">
              <svg className="w-6 h-6 text-[#5D3FD3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">AI-Powered</h3>
            <p className="text-zinc-700 text-sm">Advanced AI to understand your content</p>
          </div>
        </div>
      </div>
    </MaxWidthWrapper>
  );
} 