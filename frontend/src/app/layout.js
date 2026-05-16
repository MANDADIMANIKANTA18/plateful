import "./globals.css";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import { Leaf, Heart, Github } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Plateful – Save Food, Save Money, Save the Planet",
  description:
    "Rescue surplus meals from local restaurants and vendors at up to 50% off. Reduce waste, eat well, and make a real impact on the environment.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>

          {/* Premium Footer */}
          <footer className="bg-gradient-to-br from-brand-900 via-brand-800 to-brand-950 text-white">
            <div className="max-w-7xl mx-auto px-6 py-16">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                {/* Brand */}
                <div className="md:col-span-2">
                  <div className="flex items-center gap-2 text-xl font-bold mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-brand-400 to-brand-600 rounded-lg flex items-center justify-center">
                      <Leaf className="w-5 h-5 text-white" />
                    </div>
                    Plateful
                  </div>
                  <p className="text-brand-300 max-w-sm leading-relaxed">
                    Connecting surplus food with hungry people. Every meal saved
                    is a step towards a more sustainable future.
                  </p>
                </div>

                {/* Quick Links */}
                <div>
                  <h4 className="font-semibold text-brand-200 uppercase text-xs tracking-wider mb-4">
                    Platform
                  </h4>
                  <ul className="space-y-2.5 text-sm">
                    <li>
                      <Link
                        href="/foods"
                        className="text-brand-300 hover:text-white transition"
                      >
                        Browse Food
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/impact"
                        className="text-brand-300 hover:text-white transition"
                      >
                        Our Impact
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/register"
                        className="text-brand-300 hover:text-white transition"
                      >
                        Become a Vendor
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Support */}
                <div>
                  <h4 className="font-semibold text-brand-200 uppercase text-xs tracking-wider mb-4">
                    Support
                  </h4>
                  <ul className="space-y-2.5 text-sm">
                    <li>
                      <span className="text-brand-300">
                        help@plateful.in
                      </span>
                    </li>
                    <li>
                      <span className="text-brand-300">
                        Terms & Conditions
                      </span>
                    </li>
                    <li>
                      <span className="text-brand-300">Privacy Policy</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Bottom bar */}
              <div className="mt-12 pt-8 border-t border-brand-700/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-brand-400">
                  © {new Date().getFullYear()} Plateful. Reducing food waste,
                  one meal at a time.
                </p>
                <p className="text-sm text-brand-400 flex items-center gap-1">
                  Made with <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400" /> for the planet
                </p>
              </div>
            </div>
          </footer>

          <Toaster
            position="top-right"
            toastOptions={{
              className: "!bg-white !shadow-glass-lg !rounded-xl !text-gray-800 !font-medium",
              duration: 3000,
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
