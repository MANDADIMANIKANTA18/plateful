"use client";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useRouter, usePathname } from "next/navigation";
import { Menu, X, Leaf, User, LogOut, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function handleLogout() {
    logout();
    router.push("/");
  }

  const isActive = (href) => pathname === href;

  const linkClass = (href) =>
    `relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive(href)
        ? "text-brand-600 bg-brand-50"
        : "text-gray-600 hover:text-brand-600 hover:bg-gray-50"
    }`;

  const isVendor = user?.role === "ROLE_VENDOR";

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-100/50"
          : "bg-white border-b border-gray-100"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:shadow-brand-500/40 transition-all duration-300">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900 tracking-tight">
              Plateful
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {/* Browse Food — hide for vendors */}
            {!isVendor && (
              <Link href="/foods" className={linkClass("/foods")}>
                Browse Food
              </Link>
            )}
            <Link href="/impact" className={linkClass("/impact")}>
              Impact
            </Link>

            {user?.role === "ROLE_CUSTOMER" && (
              <Link href="/orders" className={linkClass("/orders")}>
                My Orders
              </Link>
            )}
            {isVendor && (
              <>
                <Link
                  href="/vendor/dashboard"
                  className={linkClass("/vendor/dashboard")}
                >
                  Dashboard
                </Link>
                <Link
                  href="/vendor/listings/new"
                  className={linkClass("/vendor/listings/new")}
                >
                  New Listing
                </Link>
              </>
            )}
            {user?.role === "ROLE_ADMIN" && (
              <Link href="/admin" className={linkClass("/admin")}>
                Admin
              </Link>
            )}

            <div className="w-px h-6 bg-gray-200 mx-2" />

            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all duration-200 group"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">
                      {user.name?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-700 max-w-[120px] truncate group-hover:text-brand-600 transition-colors">
                    {user.name}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="btn-primary !py-2 !px-5 !text-sm !rounded-lg"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden animate-slide-down border-t border-gray-100 bg-white/95 backdrop-blur-xl px-4 pb-4 pt-2 space-y-1">
          {/* Browse Food — hide for vendors */}
          {!isVendor && (
            <Link
              href="/foods"
              className={linkClass("/foods")}
              onClick={() => setOpen(false)}
            >
              Browse Food
            </Link>
          )}
          <Link
            href="/impact"
            className={linkClass("/impact")}
            onClick={() => setOpen(false)}
          >
            Impact
          </Link>
          {user?.role === "ROLE_CUSTOMER" && (
            <Link
              href="/orders"
              className={linkClass("/orders")}
              onClick={() => setOpen(false)}
            >
              My Orders
            </Link>
          )}
          {isVendor && (
            <>
              <Link
                href="/vendor/dashboard"
                className={linkClass("/vendor/dashboard")}
                onClick={() => setOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                href="/vendor/listings/new"
                className={linkClass("/vendor/listings/new")}
                onClick={() => setOpen(false)}
              >
                New Listing
              </Link>
            </>
          )}
          {user?.role === "ROLE_ADMIN" && (
            <Link
              href="/admin"
              className={linkClass("/admin")}
              onClick={() => setOpen(false)}
            >
              Admin
            </Link>
          )}

          <div className="border-t border-gray-100 pt-3 mt-2">
            {user ? (
              <>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 w-full text-left text-brand-600 hover:bg-brand-50 px-3 py-2 rounded-lg text-sm font-medium"
                  onClick={() => setOpen(false)}
                >
                  <User className="w-4 h-4" /> My Profile
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setOpen(false);
                  }}
                  className="flex items-center gap-2 w-full text-left text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg text-sm font-medium"
                >
                  <LogOut className="w-4 h-4" /> Logout ({user.name})
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="block text-center btn-primary !py-2 !text-sm"
                onClick={() => setOpen(false)}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
