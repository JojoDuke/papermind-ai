"use client";

import Link from "next/link";
import MaxWidthWrapper from "../MaxWidthWrapper";
import { buttonVariants } from "../ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { AuthButtons } from "./auth-buttons";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed h-14 inset-x-0 top-0 z-30 w-full bg-[#5D3FD3]/80 shadow-md backdrop-blur-lg transition-all">
      <MaxWidthWrapper>
        <div className="flex h-14 items-center justify-between">
          <Link href="/" className="flex z-40 font-semibold">
            <h3 className="text-white">
              <span className="text-white">Paper</span>mind AI
            </h3>
          </Link>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="sm:hidden text-white hover:text-white/80"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>

          {/* Mobile menu */}
          {isMobileMenuOpen && (
            <div className="sm:hidden absolute top-14 left-0 right-0 bg-[#5D3FD3] p-4 flex flex-col space-y-4">
              <Link
                href="/pricing"
                className={buttonVariants({
                  variant: "ghost",
                  size: "sm",
                  className: "text-white hover:text-white/80 hover:bg-white/10 w-full justify-center"
                })}
              >
                Pricing
              </Link>
              <AuthButtons mobile />
            </div>
          )}

          {/* Desktop menu */}
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
              <AuthButtons />
            </>
          </div>
        </div>
      </MaxWidthWrapper>
    </nav>
  );
};

export default Navbar;
