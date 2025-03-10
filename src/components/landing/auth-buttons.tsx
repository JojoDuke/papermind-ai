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
          variant: "default", 
          size: "sm",
          className: cn(
            "bg-white text-purple-600 hover:bg-white hover:text-purple-700 hover:shadow-md transition-all duration-200",
            mobile && "w-full justify-center"
          ),
        })}
      >
        Get Started
      </Link>
    </>
  );
}