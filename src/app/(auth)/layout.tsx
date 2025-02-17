import { cn } from "@/lib/utils";
import Link from "next/link";
import { Toaster } from "@/components/ui/toaster";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      <Toaster />
      <Link href="/" className="absolute left-8 top-8 flex items-center">
        <h3 className="font-semibold text-xl">
          <span className="text-[#5D3FD3]">Paper</span>mind AI
        </h3>
      </Link>
      <main className="flex-1">{children}</main>
    </div>
  );
} 