"use client";
import { useEffect, useState, useRef } from "react";
import { getImpact } from "@/lib/api";
import {
  Leaf,
  ShoppingBag,
  TrendingUp,
  Zap,
  TreePine,
  Car,
  Lightbulb,
  Users,
  ArrowRight,
  Sparkles,
  Utensils,
  Truck,
  Recycle,
  Heart,
} from "lucide-react";
import Link from "next/link";

function useCountUp(target, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    if (!target || started.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const num = typeof target === "string" ? parseFloat(target) : target;
          if (isNaN(num)) { setCount(target); return; }
          const start = Date.now();
          const step = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            setCount(Math.round(num * eased));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return { ref, count };
}

export default function ImpactPage() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getImpact()
      .then(setMetrics)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const meals = useCountUp(metrics?.mealsSaved || 0);
  const co2 = useCountUp(metrics?.co2SavedKg || 0);
  const revenue = useCountUp(metrics?.revenueRecovered || 0);
  const orders = useCountUp(metrics?.totalOrders || 0);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Loading impact data…</p>
      </div>
    );
  }

  // Environmental equivalencies
  const treesEquiv = ((metrics?.co2SavedKg || 0) / 22).toFixed(0); // ~22kg CO2 per tree per year
  const carKmEquiv = ((metrics?.co2SavedKg || 0) / 0.21).toFixed(0); // ~0.21kg CO2 per km
  const lightbulbHours = ((metrics?.co2SavedKg || 0) / 0.045).toFixed(0); // ~0.045kg CO2 per hour

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative py-24 px-6 bg-gradient-to-br from-brand-900 via-brand-800 to-brand-950 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-500/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
          <div className="absolute top-20 left-[10%] text-5xl opacity-10 animate-float">🌍</div>
          <div className="absolute bottom-20 right-[15%] text-5xl opacity-10 animate-float-delayed">🌱</div>
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
            <Sparkles className="w-4 h-4 text-accent-400" />
            <span className="text-sm font-medium text-brand-200">
              Making a real difference
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-4 leading-tight">
            Our <span className="gradient-text-hero">Impact</span>
          </h1>
          <p className="text-lg text-brand-200 max-w-2xl mx-auto leading-relaxed">
            Every order on Plateful helps reduce food waste, lower carbon
            emissions, and recover revenue for local vendors. Here&apos;s the
            difference we&apos;ve made together.
          </p>
        </div>
      </section>

      {/* Main stats */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div ref={meals.ref} className="card-hover p-8 text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform duration-300">
                <ShoppingBag className="w-7 h-7 text-white" />
              </div>
              <p className="text-4xl font-extrabold text-gray-900">
                {meals.count}
              </p>
              <p className="text-sm text-gray-500 mt-1 font-medium">
                Meals Saved
              </p>
            </div>

            <div ref={co2.ref} className="card-hover p-8 text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform duration-300">
                <Leaf className="w-7 h-7 text-white" />
              </div>
              <p className="text-4xl font-extrabold text-gray-900">
                {co2.count}
                <span className="text-lg ml-1">kg</span>
              </p>
              <p className="text-sm text-gray-500 mt-1 font-medium">
                CO₂ Prevented
              </p>
            </div>

            <div ref={revenue.ref} className="card-hover p-8 text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <p className="text-4xl font-extrabold text-gray-900">
                <span className="text-lg mr-0.5">₹</span>
                {revenue.count}
              </p>
              <p className="text-sm text-gray-500 mt-1 font-medium">
                Revenue Recovered
              </p>
            </div>

            <div ref={orders.ref} className="card-hover p-8 text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <p className="text-4xl font-extrabold text-gray-900">
                {orders.count}
              </p>
              <p className="text-sm text-gray-500 mt-1 font-medium">
                Total Orders
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Environmental Equivalencies */}
      <section className="py-20 px-6 bg-gradient-to-b from-surface-50 to-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-brand-600 font-semibold text-sm uppercase tracking-wider">
              What This Means
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-2 mb-4">
              Environmental Equivalencies
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto">
              Here&apos;s what our CO₂ savings translate to in everyday terms.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="card-hover p-8 text-center">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TreePine className="w-7 h-7 text-emerald-600" />
              </div>
              <p className="text-3xl font-extrabold text-gray-900">
                {treesEquiv}
              </p>
              <p className="text-sm text-gray-500 mt-1 font-medium">
                Trees planted for a year
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Each tree absorbs ~22 kg of CO₂ annually
              </p>
            </div>
            <div className="card-hover p-8 text-center">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Car className="w-7 h-7 text-blue-600" />
              </div>
              <p className="text-3xl font-extrabold text-gray-900">
                {carKmEquiv}
              </p>
              <p className="text-sm text-gray-500 mt-1 font-medium">
                Car kilometers avoided
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Average car emits ~0.21 kg CO₂ per km
              </p>
            </div>
            <div className="card-hover p-8 text-center">
              <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="w-7 h-7 text-amber-600" />
              </div>
              <p className="text-3xl font-extrabold text-gray-900">
                {lightbulbHours}
              </p>
              <p className="text-sm text-gray-500 mt-1 font-medium">
                Hours of lightbulbs powered
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Based on average electricity generation emissions
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Journey of a Saved Meal */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-brand-600 font-semibold text-sm uppercase tracking-wider">
              The Journey
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-2 mb-4">
              The Journey of a Saved Meal
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            <div className="hidden lg:block absolute top-10 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-brand-200 via-brand-400 to-brand-200" />

            <JourneyStep
              n="1"
              icon={<Utensils className="w-6 h-6" />}
              title="Surplus Created"
              desc="A restaurant has leftover food at the end of the day."
              color="from-orange-400 to-orange-600"
            />
            <JourneyStep
              n="2"
              icon={<Recycle className="w-6 h-6" />}
              title="Listed on Plateful"
              desc="Instead of throwing it away, the vendor lists it at a discount."
              color="from-brand-400 to-brand-600"
            />
            <JourneyStep
              n="3"
              icon={<ShoppingBag className="w-6 h-6" />}
              title="Customer Rescues"
              desc="A nearby customer orders and picks it up."
              color="from-blue-400 to-blue-600"
            />
            <JourneyStep
              n="4"
              icon={<Heart className="w-6 h-6" />}
              title="Impact Made"
              desc="Food waste prevented, CO₂ saved, vendor earns revenue."
              color="from-purple-400 to-purple-600"
            />
          </div>
        </div>
      </section>

      {/* How We Calculate */}
      <section className="py-20 px-6 bg-gradient-to-b from-surface-50 to-white">
        <div className="max-w-3xl mx-auto">
          <div className="card p-10 text-center">
            <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-7 h-7 text-brand-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              How We Calculate Impact
            </h2>
            <p className="text-gray-500 leading-relaxed max-w-xl mx-auto">
              Each meal saved prevents approximately{" "}
              <strong className="text-gray-700">2.5 kg of CO₂</strong> that
              would have been generated through food decomposition in landfills.
              Revenue recovered is the total amount vendors earn through surplus
              food sales instead of discarding it. Our calculations follow the{" "}
              <strong className="text-gray-700">WRAP methodology</strong> for
              food waste carbon accounting.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gradient-to-r from-brand-700 via-brand-600 to-brand-500 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.15),transparent_50%)]" />
        </div>
        <div className="relative max-w-3xl mx-auto text-center">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Join the Movement
          </h2>
          <p className="text-brand-100 text-lg mb-8 max-w-xl mx-auto">
            Every meal you rescue adds to our collective impact. Be part of the
            change.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/foods"
              className="bg-white text-brand-700 font-semibold px-8 py-4 rounded-xl hover:bg-brand-50 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2"
            >
              Start Rescuing <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/register"
              className="border-2 border-white/40 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/10 transition-all duration-300"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function JourneyStep({ n, icon, title, desc, color }) {
  return (
    <div className="text-center relative">
      <div
        className={`w-20 h-20 bg-gradient-to-br ${color} rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-lg relative z-10`}
      >
        <div className="text-white">{icon}</div>
        <span className="absolute -top-2 -right-2 w-7 h-7 bg-gray-900 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
          {n}
        </span>
      </div>
      <h3 className="font-bold text-lg mb-2 text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
    </div>
  );
}
