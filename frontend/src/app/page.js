"use client";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { getImpact } from "@/lib/api";
import { useEffect, useState } from "react";
import {
  Leaf,
  ShoppingBag,
  Zap,
  TrendingUp,
  ArrowRight,
  MapPin,
  Clock,
  Shield,
  Sparkles,
  ChevronRight,
  Heart,
  Utensils,
  Gift,
} from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  const [impact, setImpact] = useState(null);

  useEffect(() => {
    getImpact()
      .then(setImpact)
      .catch(() => {});
  }, []);

  return (
    <div className="overflow-hidden">
      {/* ──── HERO ──── */}
      <section className="relative min-h-[90vh] flex items-center bg-gradient-to-br from-brand-900 via-brand-800 to-brand-950 overflow-hidden">
        {/* Floating decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-[10%] text-6xl animate-float opacity-20">
            🥗
          </div>
          <div className="absolute top-40 right-[15%] text-5xl animate-float-delayed opacity-20">
            🍱
          </div>
          <div className="absolute bottom-32 left-[20%] text-4xl animate-float-slow opacity-15">
            🌱
          </div>
          <div className="absolute bottom-20 right-[25%] text-6xl animate-float opacity-15">
            🍕
          </div>
          <div className="absolute top-1/2 left-[5%] text-3xl animate-float-delayed opacity-10">
            🥡
          </div>

          {/* Gradient orbs */}
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 py-20 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4 text-accent-400" />
            <span className="text-sm font-medium text-brand-200">
              Join the food rescue movement
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-6 leading-[1.1] animate-fade-in-up">
            <span className="text-white">Save Food.</span>
            <br />
            <span className="gradient-text-hero">Save Money.</span>
            <br />
            <span className="text-white">Save the Planet.</span>
          </h1>

          <p className="text-lg sm:text-xl text-brand-200 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in-up stagger-2 opacity-0">
            Rescue surplus meals from local restaurants at up to{" "}
            <span className="text-accent-400 font-semibold">50% off</span>.
            Reduce waste, eat well, and make a real impact — one meal at a time.
          </p>

          <div className="flex gap-4 justify-center flex-wrap animate-fade-in-up stagger-3 opacity-0">
            <Link href="/foods" className="btn-primary !py-4 !px-8 !text-lg flex items-center gap-2">
              Browse Food <ArrowRight className="w-5 h-5" />
            </Link>
            {!user && (
              <Link
                href="/register"
                className="btn-secondary !border-white/30 !text-white hover:!bg-white/10 !py-4 !px-8 !text-lg"
              >
                Sign Up Free
              </Link>
            )}
          </div>

          {/* Hero stats */}
          {impact && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-16 animate-fade-in-up stagger-4 opacity-0">
              <HeroStat
                value={impact.mealsSaved || 0}
                label="Meals Saved"
                icon={<ShoppingBag className="w-5 h-5" />}
              />
              <HeroStat
                value={`${(impact.co2SavedKg || 0).toFixed(0)}kg`}
                label="CO₂ Prevented"
                icon={<Leaf className="w-5 h-5" />}
              />
              <HeroStat
                value={`₹${(impact.revenueRecovered || 0).toFixed(0)}`}
                label="Revenue Recovered"
                icon={<TrendingUp className="w-5 h-5" />}
              />
              <HeroStat
                value={impact.totalOrders || 0}
                label="Total Orders"
                icon={<Zap className="w-5 h-5" />}
              />
            </div>
          )}
        </div>
      </section>

      {/* ──── HOW IT WORKS ──── */}
      <section className="py-24 px-6 bg-white relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-200 to-transparent" />
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-brand-600 font-semibold text-sm uppercase tracking-wider">
              Simple & Quick
            </span>
            <h2 className="text-4xl font-bold mt-2 mb-4">How It Works</h2>
            <p className="text-gray-500 max-w-lg mx-auto">
              Three simple steps to save food, save money, and help the
              environment.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-brand-200 via-brand-400 to-brand-200" />
            <Step
              n="1"
              icon={<MapPin className="w-6 h-6" />}
              title="Discover"
              desc="Browse surplus food from restaurants, bakeries, and cafes near you."
            />
            <Step
              n="2"
              icon={<ShoppingBag className="w-6 h-6" />}
              title="Order & Pay"
              desc="Place your order instantly and pay securely through the platform."
            />
            <Step
              n="3"
              icon={<Utensils className="w-6 h-6" />}
              title="Pick Up & Enjoy"
              desc="Collect your food using your unique pickup code. Enjoy!"
            />
          </div>
        </div>
      </section>

      {/* ──── SURPRISE BOXES ──── */}
      <section className="py-24 px-6 bg-gradient-to-br from-purple-50 via-pink-50 to-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
                <Gift className="w-4 h-4" />
                New Feature
              </div>
              <h2 className="text-4xl font-bold mb-4 text-gray-900">
                Surprise Boxes
              </h2>
              <p className="text-gray-500 mb-6 leading-relaxed">
                Inspired by Too Good To Go — vendors pack a mystery box with
                surplus food worth <strong className="text-gray-700">2-3x</strong> the
                price you pay. You never know exactly what you&apos;ll get, but
                it&apos;s always a great deal!
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 text-sm font-bold">✓</div>
                  <span className="text-gray-700">Get ₹500 worth of food for just ₹199</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 text-sm font-bold">✓</div>
                  <span className="text-gray-700">Discover new dishes you&apos;ve never tried</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 text-sm font-bold">✓</div>
                  <span className="text-gray-700">Zero food waste — every item gets rescued</span>
                </div>
              </div>
              <Link
                href="/foods"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
              >
                <Gift className="w-4 h-4" /> Browse Surprise Boxes
              </Link>
            </div>
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-64 h-72 bg-gradient-to-br from-purple-400 to-pink-500 rounded-3xl shadow-2xl shadow-purple-500/30 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Gift className="w-16 h-16 mx-auto mb-4 animate-float" />
                    <p className="text-3xl font-extrabold">₹199</p>
                    <p className="text-purple-200 text-sm mt-1">Worth ₹500+</p>
                    <p className="text-xs text-purple-200 mt-3 px-4">What&apos;s inside? Order to find out! 🎉</p>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center text-3xl animate-float-delayed">🍛</div>
                <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center text-2xl animate-float-slow">🥐</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──── FOR SUPERMARKETS ──── */}
      <section className="py-24 px-6 bg-gradient-to-br from-amber-50 via-orange-50 to-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 flex justify-center">
              <div className="grid grid-cols-2 gap-4 max-w-xs">
                <div className="bg-white rounded-2xl shadow-lg p-5 text-center">
                  <span className="text-3xl">🏪</span>
                  <p className="text-sm font-semibold text-gray-800 mt-2">Supermarkets</p>
                  <p className="text-xs text-gray-400 mt-1">List near-expiry stock</p>
                </div>
                <div className="bg-white rounded-2xl shadow-lg p-5 text-center">
                  <span className="text-3xl">🛒</span>
                  <p className="text-sm font-semibold text-gray-800 mt-2">Retail Stores</p>
                  <p className="text-xs text-gray-400 mt-1">Sell before it expires</p>
                </div>
                <div className="bg-white rounded-2xl shadow-lg p-5 text-center col-span-2">
                  <span className="text-3xl">📉</span>
                  <p className="text-sm font-semibold text-gray-800 mt-2">Reduce Shrinkage</p>
                  <p className="text-xs text-gray-400 mt-1">Turn waste into revenue</p>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
                <Clock className="w-4 h-4" />
                For Businesses
              </div>
              <h2 className="text-4xl font-bold mb-4 text-gray-900">
                Supermarkets & Stores
              </h2>
              <p className="text-gray-500 mb-6 leading-relaxed">
                Got products approaching their expiry date? List them on
                Plateful at a discount instead of throwing them away. Customers
                get great deals, you recover revenue, and less food goes to
                landfill.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600 text-sm font-bold">✓</div>
                  <span className="text-gray-700">Expiry countdown for urgency</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600 text-sm font-bold">✓</div>
                  <span className="text-gray-700">Brand-level product information</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600 text-sm font-bold">✓</div>
                  <span className="text-gray-700">Turn shrinkage into sales</span>
                </div>
              </div>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-amber-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
              >
                Register Your Store
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ──── WHY PLATEFUL ──── */}
      <section className="py-24 px-6 bg-gradient-to-b from-surface-50 to-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-brand-600 font-semibold text-sm uppercase tracking-wider">
              Why Choose Us
            </span>
            <h2 className="text-4xl font-bold mt-2 mb-4">
              Good for You. Good for the Planet.
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<TrendingUp className="w-6 h-6" />}
              title="Save up to 50%"
              desc="Get quality meals from top restaurants at dramatically reduced prices."
              color="brand"
            />
            <FeatureCard
              icon={<Leaf className="w-6 h-6" />}
              title="Reduce Food Waste"
              desc="Each meal saved prevents 2.5 kg of CO₂ from entering the atmosphere."
              color="green"
            />
            <FeatureCard
              icon={<MapPin className="w-6 h-6" />}
              title="Local & Fresh"
              desc="Discover hidden gems and popular spots in your neighborhood."
              color="blue"
            />
            <FeatureCard
              icon={<Clock className="w-6 h-6" />}
              title="Quick Pickup"
              desc="Order and pick up in minutes. No waiting, no delivery fees."
              color="amber"
            />
            <FeatureCard
              icon={<Shield className="w-6 h-6" />}
              title="Safe & Secure"
              desc="All transactions are secure. Unique pickup codes for every order."
              color="purple"
            />
            <FeatureCard
              icon={<Heart className="w-6 h-6" />}
              title="Make an Impact"
              desc="Join a community of food rescuers making a tangible difference daily."
              color="red"
            />
          </div>
        </div>
      </section>

      {/* ──── CTA ──── */}
      <section className="py-20 px-6 bg-gradient-to-r from-brand-700 via-brand-600 to-brand-500 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.15),transparent_50%)]" />
        </div>
        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Save Your First Meal?
          </h2>
          <p className="text-brand-100 text-lg mb-8 max-w-xl mx-auto">
            Join thousands of food rescuers and start making a difference today.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/foods"
              className="bg-white text-brand-700 font-semibold px-8 py-4 rounded-xl hover:bg-brand-50 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2"
            >
              Start Browsing <ChevronRight className="w-5 h-5" />
            </Link>
            {!user && (
              <Link
                href="/register"
                className="border-2 border-white/40 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/10 transition-all duration-300"
              >
                Create Account
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function HeroStat({ value, label, icon }) {
  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-5 text-center">
      <div className="text-brand-300 flex justify-center mb-2">{icon}</div>
      <p className="text-2xl sm:text-3xl font-bold text-white">{value}</p>
      <p className="text-xs text-brand-300 mt-1">{label}</p>
    </div>
  );
}

function Step({ n, icon, title, desc }) {
  return (
    <div className="text-center relative">
      <div className="w-24 h-24 bg-gradient-to-br from-brand-500 to-brand-700 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-brand-500/20 relative z-10">
        <div className="text-white">{icon}</div>
        <span className="absolute -top-2 -right-2 w-7 h-7 bg-accent-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
          {n}
        </span>
      </div>
      <h3 className="font-bold text-xl mb-2 text-gray-900">{title}</h3>
      <p className="text-gray-500 leading-relaxed">{desc}</p>
    </div>
  );
}

const colorMap = {
  brand: "bg-brand-50 text-brand-600 border-brand-100",
  green: "bg-emerald-50 text-emerald-600 border-emerald-100",
  blue: "bg-blue-50 text-blue-600 border-blue-100",
  amber: "bg-amber-50 text-amber-600 border-amber-100",
  purple: "bg-purple-50 text-purple-600 border-purple-100",
  red: "bg-red-50 text-red-600 border-red-100",
};

function FeatureCard({ icon, title, desc, color }) {
  const c = colorMap[color] || colorMap.brand;
  return (
    <div className="card-hover p-6 group">
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 border ${c} transition-transform duration-300 group-hover:scale-110`}
      >
        {icon}
      </div>
      <h3 className="font-semibold text-lg mb-2 text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
    </div>
  );
}
