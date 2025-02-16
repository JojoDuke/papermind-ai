import Link from "next/link";
import MaxWidthWrapper from "../MaxWidthWrapper";

const Footer = () => {
  return (
    <footer className="bg-white py-8 border-t">
      <MaxWidthWrapper>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-3">
            <h4 className="font-semibold text-[#5D3FD3]">Papermind AI</h4>
            <p className="text-sm text-gray-500">
              Transform your documents into interactive knowledge bases with the power of AI.
            </p>
          </div>

          {/* Product Links */}
          <div className="space-y-3">
            <h4 className="font-semibold">Product</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <Link href="/pricing" className="hover:text-[#5D3FD3]">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/features" className="hover:text-[#5D3FD3]">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-[#5D3FD3]">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Links */}
          <div className="space-y-3">
            <h4 className="font-semibold">Resources</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <Link href="/docs" className="hover:text-[#5D3FD3]">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/api" className="hover:text-[#5D3FD3]">
                  API
                </Link>
              </li>
              <li>
                <Link href="/guides" className="hover:text-[#5D3FD3]">
                  Guides
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div className="space-y-3">
            <h4 className="font-semibold">Company</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <Link href="/about" className="hover:text-[#5D3FD3]">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-[#5D3FD3]">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-[#5D3FD3]">
                  Careers
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} Papermind AI. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link href="/privacy" className="text-sm text-gray-500 hover:text-[#5D3FD3]">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-gray-500 hover:text-[#5D3FD3]">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </MaxWidthWrapper>
    </footer>
  );
};

export default Footer; 