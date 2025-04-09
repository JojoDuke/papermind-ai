import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Check } from "lucide-react";
import Link from "next/link";

export default function PricingPage() {
  return (
    <div className="relative flex flex-col">
      <MaxWidthWrapper className="mb-12 mt-28 sm:mt-40 flex flex-col items-center justify-center text-center">
        <h1 className="max-w-4xl text-5xl font-bold md:text-6xl lg:text-7xl">
          Pricing for{" "}
          <span className="inline-block bg-gradient-to-b from-[#7B61DB] to-[#4B32A8] bg-clip-text text-transparent">
            every need
          </span>
        </h1>
        <p className="mt-5 max-w-prose text-black/60 sm:text-xl">
          Choose the right plan for you, whether you're just getting started or looking for more advanced features.
        </p>
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
        </div>
      </div>

      {/* Pricing Section */}
      <div className="mx-auto mb-32 mt-20 max-w-6xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-md grid-cols-1 gap-10 lg:max-w-5xl lg:grid-cols-2">
          {/* Free Plan */}
          <div className="flex flex-col rounded-3xl bg-white shadow-xl ring-1 ring-gray-200 p-8">
            <h3 className="text-2xl font-semibold text-gray-900">Free</h3>
            <p className="mt-4 text-gray-500">Get started with basic document analysis</p>
            <p className="mt-6 flex items-baseline">
              <span className="text-5xl font-bold tracking-tight text-gray-900">$0</span>
              <span className="ml-1 text-sm font-semibold text-gray-500">/month</span>
            </p>
            <ul className="mt-8 space-y-4">
              <li className="flex items-start">
                <div className="flex-shrink-0">
                  <Check className="h-5 w-5 text-green-500" />
                </div>
                <p className="ml-3 text-base text-gray-700">Document uploads up to 4MB</p>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0">
                  <Check className="h-5 w-5 text-green-500" />
                </div>
                <p className="ml-3 text-base text-gray-700">Basic document chat</p>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0">
                  <Check className="h-5 w-5 text-green-500" />
                </div>
                <p className="ml-3 text-base text-gray-700">Limited credits per month</p>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0">
                  <Check className="h-5 w-5 text-green-500" />
                </div>
                <p className="ml-3 text-base text-gray-700">Accessible on all devices</p>
              </li>
            </ul>
            <div className="mt-10">
              <Link href="/signin">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full border-gray-300 hover:bg-gray-100"
                >
                  Get started for free
                </Button>
              </Link>
            </div>
          </div>

          {/* Premium Plan */}
          <div className="relative flex flex-col rounded-3xl bg-[#5D3FD3] shadow-xl ring-1 ring-[#5D3FD3] p-8 text-white">
            <div className="absolute -top-5 left-0 right-0 mx-auto w-32 rounded-full bg-[#4B32A8] px-3 py-2 text-sm font-semibold text-center">
              RECOMMENDED
            </div>
            <h3 className="text-2xl font-semibold">Premium</h3>
            <p className="mt-4 text-white/70">Unlock full capabilities and advanced features</p>
            <p className="mt-6 flex items-baseline">
              <span className="text-5xl font-bold tracking-tight">$8.99</span>
              <span className="ml-1 text-sm font-semibold text-white/70">/month</span>
            </p>
            <ul className="mt-8 space-y-4">
              <li className="flex items-start">
                <div className="flex-shrink-0">
                  <Check className="h-5 w-5 text-white" />
                </div>
                <p className="ml-3 text-base">Large document uploads (up to 50MB)</p>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0">
                  <Check className="h-5 w-5 text-white" />
                </div>
                <p className="ml-3 text-base">Advanced document analysis</p>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0">
                  <Check className="h-5 w-5 text-white" />
                </div>
                <p className="ml-3 text-base">Podcast creation from documents</p>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0">
                  <Check className="h-5 w-5 text-white" />
                </div>
                <p className="ml-3 text-base">Unlimited credits</p>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0">
                  <Check className="h-5 w-5 text-white" />
                </div>
                <p className="ml-3 text-base">Priority support</p>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0">
                  <Check className="h-5 w-5 text-white" />
                </div>
                <p className="ml-3 text-base">Advanced AI capabilities</p>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0">
                  <Check className="h-5 w-5 text-white" />
                </div>
                <p className="ml-3 text-base">Enhanced document organization</p>
              </li>
            </ul>
            <div className="mt-10">
              <Link href="/signin">
                <Button
                  size="lg"
                  className="w-full bg-white text-[#5D3FD3] hover:bg-gray-100"
                >
                  Get Started Now <ArrowUpRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mx-auto mt-24 max-w-3xl">
          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
            Frequently asked questions
          </h2>
          <dl className="mt-10 space-y-6 divide-y divide-gray-900/10">
            <div className="pt-6">
              <dt className="text-lg font-semibold leading-7 text-gray-900">
                What's included in the free plan?
              </dt>
              <dd className="mt-2 text-base leading-7 text-gray-600">
                The free plan includes basic document analysis with limited credits per month. You can upload documents up to 4MB and use the basic chat features to interact with your documents.
              </dd>
            </div>
            <div className="pt-6">
              <dt className="text-lg font-semibold leading-7 text-gray-900">
                How does the premium plan compare to the free plan?
              </dt>
              <dd className="mt-2 text-base leading-7 text-gray-600">
                The premium plan offers significantly more capabilities, including larger document uploads (up to 50MB), unlimited credits, advanced document analysis, priority support, and enhanced AI capabilities.
              </dd>
            </div>
            <div className="pt-6">
              <dt className="text-lg font-semibold leading-7 text-gray-900">
                Can I cancel my subscription anytime?
              </dt>
              <dd className="mt-2 text-base leading-7 text-gray-600">
                Yes, you can cancel your premium subscription at any time. You'll continue to have access to premium features until the end of your billing period.
              </dd>
            </div>
            <div className="pt-6">
              <dt className="text-lg font-semibold leading-7 text-gray-900">
                What types of documents can I upload?
              </dt>
              <dd className="mt-2 text-base leading-7 text-gray-600">
                Currently, we support PDF documents. We're working on adding support for more document types in the future.
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
} 