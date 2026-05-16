"use client";
import { useEffect, useState } from "react";
import {
  getMyListings,
  getVendorOrders,
  deleteListing,
  completeOrder,
  verifyPickup,
  getVendorAnalytics,
} from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  Plus,
  Trash2,
  CheckCircle,
  Package,
  TrendingUp,
  ShoppingBag,
  DollarSign,
  BarChart3,
  Clock,
  KeyRound,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/auth";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

export default function VendorDashboard() {
  const [tab, setTab] = useState("listings");
  const [listings, setListings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pickupInputs, setPickupInputs] = useState({});
  const [verifyingOrder, setVerifyingOrder] = useState(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    load();

    // Subscribe to realtime updates for orders
    if (tab === "orders" && user) {
      const channel = supabase
        .channel("schema-orders-changes")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "orders" },
          (payload) => {
            if (payload.eventType === "INSERT") {
              setOrders((prev) => [payload.new, ...prev]);
              toast("New order received!", { icon: "🔔" });
            } else if (payload.eventType === "UPDATE") {
              setOrders((prev) =>
                prev.map((o) =>
                  o.id === payload.new.id ? { ...o, ...payload.new } : o
                )
              );
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [tab, user]);

  async function load() {
    setLoading(true);
    try {
      if (tab === "listings") setListings(await getMyListings());
      else if (tab === "orders") setOrders(await getVendorOrders());
      else if (tab === "analytics") {
        const data = await getVendorAnalytics();
        const formatted = (data || [])
          .map((d) => ({
            ...d,
            dateString: new Date(d.orderDate).toLocaleDateString(),
          }))
          .reverse();
        setAnalytics(formatted);
      }
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this listing?")) return;
    try {
      await deleteListing(id);
      toast.success("Listing deleted");
      load();
    } catch (err) {
      toast.error(err.message || "Delete failed");
    }
  }

  async function handleVerifyPickup(orderId) {
    const code = pickupInputs[orderId];
    if (!code || code.length !== 6) {
      toast.error("Please enter the 6-digit pickup code");
      return;
    }
    setVerifyingOrder(orderId);
    try {
      await verifyPickup(orderId, code);
      toast.success("Pickup verified & order completed!");
      setPickupInputs((prev) => ({ ...prev, [orderId]: "" }));
      load();
    } catch (err) {
      toast.error(err.message || "Invalid pickup code");
    } finally {
      setVerifyingOrder(null);
    }
  }

  const tabs = [
    { key: "listings", label: "My Listings", icon: <ShoppingBag className="w-4 h-4" /> },
    { key: "orders", label: "Orders", icon: <Package className="w-4 h-4" /> },
    { key: "analytics", label: "Analytics", icon: <BarChart3 className="w-4 h-4" /> },
  ];

  // Quick stats
  const totalActive = listings.filter((l) => l.quantityAvailable > 0).length;
  const pendingOrders = orders.filter((o) => o.orderStatus === "CONFIRMED").length;

  return (
    <ProtectedRoute roles={["ROLE_VENDOR"]}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">
              Manage your listings, orders, and analytics
            </p>
          </div>
          <Link
            href="/vendor/listings/new"
            className="btn-primary flex items-center gap-2 !py-2.5"
          >
            <Plus className="w-4 h-4" /> New Listing
          </Link>
        </div>

        {/* Quick stat cards */}
        {tab === "listings" && !loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
            <div className="card p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-brand-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {listings.length}
                  </p>
                  <p className="text-xs text-gray-500">Total Listings</p>
                </div>
              </div>
            </div>
            <div className="card p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalActive}
                  </p>
                  <p className="text-xs text-gray-500">Active</p>
                </div>
              </div>
            </div>
            <div className="card p-5 hidden sm:block">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {listings.reduce((sum, l) => sum + (l.quantitySold || 0), 0)}
                  </p>
                  <p className="text-xs text-gray-500">Items Sold</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-8 w-fit">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                tab === t.key
                  ? "bg-white text-brand-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
          </div>
        ) : tab === "listings" ? (
          listings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-20 h-20 bg-brand-50 rounded-3xl flex items-center justify-center">
                <ShoppingBag className="w-8 h-8 text-brand-300" />
              </div>
              <p className="text-gray-500 font-medium">No listings yet</p>
              <Link
                href="/vendor/listings/new"
                className="btn-primary !py-2.5 !px-5 !text-sm flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Create Your First
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {listings.map((l, i) => (
                <div
                  key={l.id}
                  className="card p-5 animate-fade-in-up opacity-0 group"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{l.foodName}</h3>
                      <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md inline-block mt-1">
                        {l.category}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDelete(l.id)}
                      className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-xl font-bold text-brand-600">
                      ₹{l.sellingPrice}
                    </span>
                    <span className="text-sm text-gray-400 line-through">
                      ₹{l.originalPrice}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
                    <span className="bg-brand-50 text-brand-600 px-2 py-1 rounded-md font-medium">
                      {l.quantityAvailable} available
                    </span>
                    <span className="bg-gray-50 px-2 py-1 rounded-md">
                      {l.quantitySold || 0} sold
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : tab === "orders" ? (
          orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center">
                <Package className="w-8 h-8 text-blue-300" />
              </div>
              <p className="text-gray-500 font-medium">No orders yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((o, i) => (
                <div
                  key={o.id}
                  className="card p-5 animate-fade-in-up opacity-0"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{o.foodName}</h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                        <span>Qty: {o.quantity}</span>
                        <span>₹{o.totalAmount}</span>
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-md ${
                            o.orderStatus === "COMPLETED"
                              ? "bg-emerald-50 text-emerald-600"
                              : o.orderStatus === "CANCELLED"
                              ? "bg-red-50 text-red-600"
                              : "bg-amber-50 text-amber-600"
                          }`}
                        >
                          {o.orderStatus}
                        </span>
                      </div>
                      {o.createdAt && (
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(o.createdAt).toLocaleString()}
                        </p>
                      )}
                    </div>

                    {/* Pickup code verification for CONFIRMED orders */}
                    {o.orderStatus === "CONFIRMED" && (
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <KeyRound className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                              type="text"
                              inputMode="numeric"
                              maxLength={6}
                              placeholder="6-digit code"
                              value={pickupInputs[o.id] || ""}
                              onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                                setPickupInputs((prev) => ({ ...prev, [o.id]: val }));
                              }}
                              className="w-36 pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all font-mono tracking-widest text-center"
                            />
                          </div>
                          <button
                            onClick={() => handleVerifyPickup(o.id)}
                            disabled={verifyingOrder === o.id || (pickupInputs[o.id] || "").length !== 6}
                            className="btn-primary !py-2 !px-4 !text-sm flex items-center gap-1.5 !from-emerald-600 !to-emerald-500 !shadow-emerald-500/25 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            {verifyingOrder === o.id ? (
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                            Verify
                          </button>
                        </div>
                        <p className="text-xs text-gray-400">
                          Enter customer's pickup code to complete
                        </p>
                      </div>
                    )}

                    {/* Completed badge */}
                    {o.orderStatus === "COMPLETED" && (
                      <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-xs font-semibold">Delivered</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="space-y-6">
            {analytics.length === 0 ? (
              <div className="card p-8">
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                  <div className="w-20 h-20 bg-brand-50 rounded-3xl flex items-center justify-center">
                    <BarChart3 className="w-8 h-8 text-brand-300" />
                  </div>
                  <p className="text-gray-500 font-medium">
                    No analytics data available yet
                  </p>
                  <p className="text-gray-400 text-sm">
                    Complete some orders to see your revenue analytics here.
                  </p>
                </div>
              </div>
            ) : (() => {
              // Filter analytics by date range
              const filteredAnalytics = analytics.filter((d) => {
                const date = new Date(d.orderDate);
                if (dateFrom && date < new Date(dateFrom)) return false;
                if (dateTo) {
                  const to = new Date(dateTo);
                  to.setHours(23, 59, 59, 999);
                  if (date > to) return false;
                }
                return true;
              });

              const totalRevenue = filteredAnalytics.reduce((sum, d) => sum + Number(d.totalRevenue || 0), 0);
              const totalOrders = filteredAnalytics.reduce((sum, d) => sum + Number(d.totalOrders || 0), 0);

              return (
                <>
                  {/* Summary cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="card p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                          <DollarSign className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-gray-900">
                            ₹{totalRevenue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                          </p>
                          <p className="text-xs text-gray-500">
                            {dateFrom || dateTo ? "Filtered Revenue" : "Total Revenue (All Time)"}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="card p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                          <Package className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-gray-900">
                            {totalOrders}
                          </p>
                          <p className="text-xs text-gray-500">
                            {dateFrom || dateTo ? "Filtered Orders" : "Total Orders (All Time)"}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="card p-5 hidden sm:block">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                          <BarChart3 className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-gray-900">
                            {filteredAnalytics.length}
                          </p>
                          <p className="text-xs text-gray-500">Active Days</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Date filters */}
                  <div className="card p-5">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2 whitespace-nowrap">
                        <Clock className="w-4 h-4 text-brand-500" /> Filter by Date
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 flex-1">
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-gray-500">From</label>
                          <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-gray-500">To</label>
                          <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
                          />
                        </div>
                        {(dateFrom || dateTo) && (
                          <button
                            onClick={() => { setDateFrom(""); setDateTo(""); }}
                            className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg font-medium transition-all"
                          >
                            Clear Filters
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Revenue chart */}
                  <div className="card p-8">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-900">
                      <TrendingUp className="w-5 h-5 text-brand-600" /> Revenue Trend
                    </h2>
                    {filteredAnalytics.length === 0 ? (
                      <p className="text-gray-400 text-sm text-center py-12">No data for the selected date range.</p>
                    ) : (
                      <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart
                            data={filteredAnalytics}
                            margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                          >
                            <defs>
                              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <Area type="monotone" dataKey="totalRevenue" stroke="#22c55e" strokeWidth={3} fill="url(#colorRevenue)" name="Revenue (₹)" />
                            <CartesianGrid stroke="#f3f4f6" strokeDasharray="5 5" vertical={false} />
                            <XAxis dataKey="dateString" tick={{ fill: "#9ca3af", fontSize: 12 }} tickLine={false} axisLine={false} />
                            <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
                            <Tooltip cursor={{ stroke: "#e5e7eb", strokeWidth: 1 }} contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 8px 32px rgba(0,0,0,0.08)", padding: "12px 16px" }} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>

                  {/* Revenue table */}
                  {filteredAnalytics.length > 0 && (
                    <div className="card p-6">
                      <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900">
                        <BarChart3 className="w-4 h-4 text-brand-600" /> Daily Breakdown
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-100">
                              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                              <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Orders</th>
                              <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Revenue</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredAnalytics.map((d, i) => (
                              <tr
                                key={i}
                                className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                              >
                                <td className="py-3 px-4 font-medium text-gray-800">
                                  {d.dateString}
                                </td>
                                <td className="py-3 px-4 text-right text-gray-600">
                                  {d.totalOrders}
                                </td>
                                <td className="py-3 px-4 text-right font-semibold text-emerald-600">
                                  ₹{Number(d.totalRevenue).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className="bg-gray-50">
                              <td className="py-3 px-4 font-bold text-gray-900">Total</td>
                              <td className="py-3 px-4 text-right font-bold text-gray-900">{totalOrders}</td>
                              <td className="py-3 px-4 text-right font-bold text-emerald-700">
                                ₹{totalRevenue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
