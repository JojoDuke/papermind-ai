import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative flex flex-col">
      <MaxWidthWrapper className="mb-12 mt-28 sm:mt-40 flex flex-col items-center justify-center text-center">
        <h1 className="max-w-4xl text-5xl font-bold md:text-6xl lg:text-7xl">
          Transform your{" "}
          <span className="inline-block bg-gradient-to-b from-[#7B61DB] to-[#4B32A8] bg-clip-text text-transparent">
            documents
          </span>{" "}
          <br/>into knowledge.
        </h1>
        <p className="mt-5 max-w-prose text-black/60 sm:text-xl">
          Papermind AI turns your PDFs, and other documents into interactive knowledge bases. Ask questions, get insights, and unlock the power of your documents.
        </p>

        <Link href="/signin" className="mt-5">
          <Button size="lg" className="bg-[#5D3FD3] hover:bg-[#4B32A8] text-white font-semibold">
            Get Started <ArrowUpRight className="ml-2 w-5 h-5" />
          </Button>
        </Link>
      </MaxWidthWrapper>

      <div>
        <div className="relative isolate">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          >
            <div
              style={{
                clipPath:
                  "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
              }}
              className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-purple-300 to-purple-600 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            />
          </div>

          <div>
            <div className="mx-auto max-w-6xl px-6 lg:px-8">
              <div className="mt-16 flow-root sm:mt-24">
                <div className="-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
                  <Image
                    className="rounded-md bg-white p-2 sm:p-8 md:p-20 shadow-2xl ring-1 ring-gray-900/10"
                    width={1364}
                    height={866}
                    src="/dashboard-preview.jpg"
                    alt="Papermind AI dashboard preview"
                    quality={100}
                  />
                </div>
              </div>
            </div>
          </div>

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          >
            <div
              style={{
                clipPath:
                  "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
              }}
              className="relative left-[calc(50%-13rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-purple-300 to-purple-600 opacity-30 sm:left-[calc(50%-36rem)] sm:w-[72.1875rem]"
            />
          </div>
        </div>
      </div>

      {/* Feature Section */}
      <div className="mx-auto mb-32 mt-32 max-w-5xl sm:mt-56">
        <div className="mb-12 px-6 lg:px-8">
          <div className="mx-auto max-w-2xl sm:text-center">
            <h2 className="mt-2 font-bold text-4xl text-black sm:text-5xl">
              Start exploring in minutes
            </h2>
            <p className="mt-4 text-lg text-black/60">
              Unlock the knowledge in your documents with Papermind AI&apos;s intelligent document assistant.
            </p>
          </div>
        </div>
        {/* Steps */}
        <ol className="my-8 space-y-4 pt-8 md:flex md:space-x-12 md:space-y-0">
          <li className="md:flex-1">
            <div className="flex flex-col space-y-2 border-l-4 border-zinc-300 py-2 pl-4 md:border-l-0 md:border-t-2 md:pb-0 md:pl-0 md:pt-4">
              <span className="text-sm font-medium text-purple-600">Step 1</span>
              <span className="text-xl font-semibold">
                Sign in to your account
              </span>
              <span className="mt-2 text-black/60">
                Either start out with a free plan or choose our{" "}
                <Link
                  href="/pricing"
                  className="text-purple-600 underline underline-offset-2"
                >
                  pro plan
                </Link>
                .
              </span>
            </div>
          </li>
          <li className="md:flex-1">
            <div className="flex flex-col space-y-2 border-l-4 border-zinc-300 py-2 pl-4 md:border-l-0 md:border-t-2 md:pb-0 md:pl-0 md:pt-4">
              <span className="text-sm font-medium text-purple-600">Step 2</span>
              <span className="text-xl font-semibold">
                Upload your PDF file
              </span>
              <span className="mt-2 text-black/60">
                We&apos;ll process your file and make it ready for you to chat
                with.
              </span>
            </div>
          </li>
          <li className="md:flex-1">
            <div className="flex flex-col space-y-2 border-l-4 border-zinc-300 py-2 pl-4 md:border-l-0 md:border-t-2 md:pb-0 md:pl-0 md:pt-4">
              <span className="text-sm font-medium text-purple-600">Step 3</span>
              <span className="text-xl font-semibold">
                Start asking questions
              </span>
              <span className="mt-2 text-black/60">
                It&apos;s that simple. Try out Papermind AI today - it really
                takes less than a minute
              </span>
            </div>
          </li>
        </ol>

        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="mt-16 flow-root sm:mt-24">
            <div className="-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
              <Image
                className="rounded-md bg-white p-2 sm:p-8 md:p-20 shadow-2xl ring-1 ring-gray-900/10"
                width={1419}
                height={732}
                src="/file-upload-preview.jpg"
                alt="Papermind AI file upload preview"
                quality={100}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div id="pricing" className="mx-auto mb-32 mt-32 max-w-5xl sm:mt-56">
        <div className="mb-12 px-6 lg:px-8">
          <div className="mx-auto max-w-2xl sm:text-center">
            <h2 className="mt-2 font-bold text-4xl text-black sm:text-5xl">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-lg text-black/60">
              Whether you're just starting or need advanced features, we have a plan that's right for you.
            </p>
          </div>
        </div>

        <div className="mx-auto grid max-w-md grid-cols-1 gap-8 lg:max-w-4xl lg:grid-cols-2 px-6">
          {/* Free Plan */}
          <div className="flex flex-col rounded-3xl bg-white shadow-xl ring-1 ring-gray-200 p-8">
            <h3 className="text-xl font-semibold text-gray-900">Free</h3>
            <p className="mt-4 text-gray-500">Get started with the basics</p>
            <p className="mt-6 flex items-baseline">
              <span className="text-4xl font-bold tracking-tight text-gray-900">$0</span>
              <span className="ml-1 text-sm font-semibold text-gray-500">/month</span>
            </p>
            <ul className="mt-8 space-y-3">
              <li className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="ml-3 text-sm text-gray-700">Limited document uploads (4MB)</p>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="ml-3 text-sm text-gray-700">Basic document chat</p>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="ml-3 text-sm text-gray-700">Limited credits per month</p>
              </li>
            </ul>
            <Link
              href="/signin"
              className="mt-8 block rounded-md bg-gray-100 px-3.5 py-2 text-center text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-200 focus-visible:outline-offset-2"
            >
              Get started
            </Link>
          </div>

          {/* Premium Plan */}
          <div className="relative flex flex-col rounded-3xl bg-[#5D3FD3] shadow-xl ring-1 ring-[#5D3FD3] p-8 text-white">
            <div className="absolute -top-4 right-8 rounded-full bg-[#4B32A8] px-4 py-1 text-xs font-semibold">
              RECOMMENDED
            </div>
            <h3 className="text-xl font-semibold">Premium</h3>
            <p className="mt-4 text-white/70">Unlock full capabilities</p>
            <p className="mt-6 flex items-baseline">
              <span className="text-4xl font-bold tracking-tight">$8.99</span>
              <span className="ml-1 text-sm font-semibold text-white/70">/month</span>
            </p>
            <ul className="mt-8 space-y-3">
              <li className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="ml-3 text-sm">Large document uploads (up to 50MB)</p>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="ml-3 text-sm">Advanced document analysis</p>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="ml-3 text-sm">Podcast creation from documents</p>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="ml-3 text-sm">Unlimited credits</p>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="ml-3 text-sm">Priority support</p>
              </li>
            </ul>
            <Link
              href="/signin"
              className="mt-8 block rounded-md bg-white px-3.5 py-2 text-center text-sm font-semibold text-[#5D3FD3] shadow-sm hover:bg-gray-100 focus-visible:outline-offset-2"
            >
              Get Started Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 