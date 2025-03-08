import { buttonVariants } from "../ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface AuthButtonsProps {
  mobile?: boolean;
}

export function AuthButtons({ mobile = false }: AuthButtonsProps) {
  return (
    <>
      <Link
        href="/signin"
        className={buttonVariants({
          variant: "ghost",
          size: "sm",
          className: cn(
            "text-white hover:text-white/80 hover:bg-white/10",
            mobile && "w-full justify-center"
          ),
        })}
      >
        Sign In
      </Link>
      <button
        onClick={() => window.location.href = '/signin'}
        className={cn(
          buttonVariants({
            size: "sm",
          }),
          "bg-white !text-[#5D3FD3] hover:bg-white/90",
          mobile && "w-full justify-center"
        )}
      >
        Get Started
      </button>
    </>
  );
} 