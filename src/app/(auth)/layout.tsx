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
      <main className="flex-1">{children}</main>
    </div>
  );
} 