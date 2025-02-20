import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { RegisterLink } from "@kinde-oss/kinde-auth-nextjs/server";
import Image from "next/image";

export default function SignUpPage() {
  return (
    <MaxWidthWrapper className="max-w-5xl mb-12 mt-28">
      <div className="flex flex-col items-center justify-center text-center">
        <h1 className="text-6xl font-bold tracking-tight text-gray-900 sm:text-7xl">
          Create your account
        </h1>
        <p className="mt-6 text-lg max-w-prose text-muted-foreground">
          Welcome! Get started with your free account today.
        </p>

        <div className="flex flex-col w-full max-w-sm gap-4 mt-6">
          <RegisterLink>
            <Button size="lg" className="w-full">
              Get started <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </RegisterLink>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                or continue with
              </span>
            </div>
          </div>

          <RegisterLink authUrlParams={{ provider: "google" }}>
            <Button variant="outline" size="lg" className="w-full">
              <Image
                src="/google.svg"
                alt="Google"
                width={20}
                height={20}
                className="mr-2"
              />
              Google
            </Button>
          </RegisterLink>

          <Link href="/pricing" className="mt-2">
            <Button variant="outline" size="lg" className="w-full">
              View pricing
            </Button>
          </Link>
        </div>
      </div>
    </MaxWidthWrapper>
  );
} 