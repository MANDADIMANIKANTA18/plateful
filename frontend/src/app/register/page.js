"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { register as apiRegister } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  Leaf,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  Store,
  ArrowRight,
  CheckCircle,
  Loader2,
} from "lucide-react";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "ROLE_CUSTOMER",
    restaurantName: "",
    address: "",
    latitude: "",
    longitude: "",
    vendorType: "RESTAURANT",
  });
  const [loading, setLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState("idle"); // idle | loading | success | error
  const { saveUser } = useAuth();
  const router = useRouter();

  const isVendor = form.role === "ROLE_VENDOR";

  function detectLocation() {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      setLocationStatus("error");
      return;
    }
    setLocationStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({
          ...f,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
        }));
        setLocationStatus("success");
        toast.success("Location detected successfully!");
      },
      (err) => {
        setLocationStatus("error");
        toast.error("Location access denied. Please enter coordinates manually.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const body = {
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        role: form.role,
        ...(isVendor && {
          restaurantName: form.restaurantName,
          address: form.address,
          latitude: parseFloat(form.latitude) || 0,
          longitude: parseFloat(form.longitude) || 0,
          vendorType: form.vendorType,
        }),
      };
      const data = await apiRegister(body);
      saveUser(data);
      toast.success("Account created!");
      if (data.role === "ROLE_VENDOR") router.push("/vendor/dashboard");
      else router.push("/foods");
    } catch (err) {
      toast.error(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[85vh] flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-800 via-brand-700 to-brand-900 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-10 text-7xl opacity-10 animate-float">
            🍛
          </div>
          <div className="absolute bottom-40 left-16 text-6xl opacity-10 animate-float-delayed">
            🥘
          </div>
          <div className="absolute top-1/3 right-1/3 text-5xl opacity-10 animate-float-slow">
            🌿
          </div>
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-brand-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-accent-500/10 rounded-full blur-3xl" />
        </div>
        <div className="relative text-center">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <Leaf className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">Join Plateful</h2>
          <p className="text-brand-200 text-lg max-w-sm mx-auto leading-relaxed">
            Start rescuing surplus food today. Whether you&apos;re a customer
            or a vendor, there&apos;s a place for you.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4 max-w-xs mx-auto">
            <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-white">50%</p>
              <p className="text-xs text-brand-300 mt-1">Avg. Savings</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-white">2.5kg</p>
              <p className="text-xs text-brand-300 mt-1">CO₂ per meal</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-surface-50">
        <div className="w-full max-w-lg">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-2xl">Plateful</span>
          </div>

          <div className="card p-8">
            <h1 className="text-2xl font-bold text-center mb-2">
              Create Account
            </h1>
            <p className="text-gray-500 text-center text-sm mb-8">
              Join the food rescue movement
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    required
                    className="input !pl-11"
                    placeholder="John Doe"
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    required
                    className="input !pl-11"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    className="input !pl-11"
                    placeholder="Min. 6 characters"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Phone
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    className="input !pl-11"
                    placeholder="+91 98765 43210"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Role selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  I am a
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setForm({ ...form, role: "ROLE_CUSTOMER" })
                    }
                    className={`p-3 rounded-xl border-2 text-center transition-all duration-200 ${
                      !isVendor
                        ? "border-brand-500 bg-brand-50 text-brand-700"
                        : "border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    <User className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-sm font-medium">Customer</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setForm({ ...form, role: "ROLE_VENDOR" })
                    }
                    className={`p-3 rounded-xl border-2 text-center transition-all duration-200 ${
                      isVendor
                        ? "border-brand-500 bg-brand-50 text-brand-700"
                        : "border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    <Store className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-sm font-medium">Vendor</span>
                  </button>
                </div>
              </div>

              {/* Vendor fields */}
              {isVendor && (
                <div className="space-y-4 border-t border-gray-100 pt-5 mt-2">
                  {/* Vendor type selector */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Type
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { key: "RESTAURANT", label: "Restaurant", emoji: "🍽️" },
                        { key: "SUPERMARKET", label: "Supermarket", emoji: "🏪" },
                        { key: "STORE", label: "Store", emoji: "🛒" },
                      ].map((vt) => (
                        <button
                          key={vt.key}
                          type="button"
                          onClick={() =>
                            setForm({ ...form, vendorType: vt.key })
                          }
                          className={`p-2.5 rounded-xl border-2 text-center transition-all duration-200 ${
                            form.vendorType === vt.key
                              ? "border-brand-500 bg-brand-50 text-brand-700"
                              : "border-gray-200 text-gray-500 hover:border-gray-300"
                          }`}
                        >
                          <span className="text-lg block mb-0.5">{vt.emoji}</span>
                          <span className="text-xs font-medium">{vt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-1">
                    <Store className="w-4 h-4 text-brand-600" />
                    <h3 className="font-semibold text-gray-800">
                      {form.vendorType === "SUPERMARKET"
                        ? "Supermarket Details"
                        : form.vendorType === "STORE"
                        ? "Store Details"
                        : "Restaurant Details"}
                    </h3>
                  </div>

                  {/* Restaurant/Store name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {form.vendorType === "SUPERMARKET"
                        ? "Supermarket Name"
                        : form.vendorType === "STORE"
                        ? "Store Name"
                        : "Restaurant Name"}
                    </label>
                    <input
                      required
                      className="input"
                      placeholder="Tasty Bites"
                      value={form.restaurantName}
                      onChange={(e) =>
                        setForm({ ...form, restaurantName: e.target.value })
                      }
                    />
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Address
                    </label>
                    <input
                      required
                      className="input"
                      placeholder="123 Main Street, City"
                      value={form.address}
                      onChange={(e) =>
                        setForm({ ...form, address: e.target.value })
                      }
                    />
                  </div>

                  {/* Location auto-detect */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Location
                    </label>
                    <button
                      type="button"
                      onClick={detectLocation}
                      disabled={locationStatus === "loading"}
                      className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-dashed transition-all duration-200 ${
                        locationStatus === "success"
                          ? "border-brand-500 bg-brand-50 text-brand-700"
                          : locationStatus === "error"
                          ? "border-red-300 bg-red-50 text-red-600"
                          : "border-gray-300 text-gray-600 hover:border-brand-400 hover:bg-brand-50"
                      }`}
                    >
                      {locationStatus === "loading" ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Detecting location…
                        </>
                      ) : locationStatus === "success" ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Location detected: {parseFloat(form.latitude).toFixed(4)}°N,{" "}
                          {parseFloat(form.longitude).toFixed(4)}°E
                        </>
                      ) : (
                        <>
                          <MapPin className="w-4 h-4" />
                          📍 Use My Location
                        </>
                      )}
                    </button>

                    {/* Fallback manual inputs */}
                    {locationStatus === "error" && (
                      <div className="grid grid-cols-2 gap-3 mt-3">
                        <div>
                          <input
                            type="number"
                            step="any"
                            required
                            className="input text-sm"
                            placeholder="Latitude"
                            value={form.latitude}
                            onChange={(e) =>
                              setForm({ ...form, latitude: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <input
                            type="number"
                            step="any"
                            required
                            className="input text-sm"
                            placeholder="Longitude"
                            value={form.longitude}
                            onChange={(e) =>
                              setForm({ ...form, longitude: e.target.value })
                            }
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 !mt-6 disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Create Account <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-brand-600 hover:text-brand-700 font-semibold transition"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
