import Link from "next/link";
import MaxWidthWrapper from "../MaxWidthWrapper";
import { buttonVariants } from "../ui/button";
import { LoginLink, RegisterLink } from "@kinde-oss/kinde-auth-nextjs/server";
import { cn } from "@/lib/utils";

const Navbar = () => {
  return (
    <nav className="fixed h-14 inset-x-0 top-0 z-30 w-full bg-[#5D3FD3]/80 shadow-md backdrop-blur-lg transition-all">
      <MaxWidthWrapper>
        <div className="flex h-14 items-center justify-between">
          <Link href="/" className="flex z-40 font-semibold">
            <h3 className="text-white">
              <span className="text-white">Paper</span>mind AI
            </h3>
          </Link>

          {/* todo: add mobile navbar */}

          <div className="hidden items-center space-x-4 sm:flex">
            <>
              <Link
                href="/pricing"
                className={buttonVariants({
                  variant: "ghost",
                  size: "sm",
                  className: "text-white hover:text-white/80 hover:bg-white/10"
                })}
              >
                Pricing
              </Link>
              <LoginLink
                className={buttonVariants({
                  variant: "ghost",
                  size: "sm",
                  className: "text-white hover:text-white/80 hover:bg-white/10"
                })}
              >
                Sign In
              </LoginLink>
              <RegisterLink
                className={cn(
                  buttonVariants({
                    size: "sm",
                  }),
                  "bg-white !text-[#5D3FD3] hover:bg-white/90"
                )}
              >
                Get Started
              </RegisterLink>
            </>
          </div>
        </div>
      </MaxWidthWrapper>
    </nav>
  );
};

export default Navbar;
