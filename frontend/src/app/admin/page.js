"use client";
import { useEffect, useState } from "react";
import { getAllVendors, verifyVendor, getAllOrders } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import toast from "react-hot-toast";
import {
  ShieldCheck,
  Store,
  Package,
  Users,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

export default function AdminPage() {
  const [tab, setTab] = useState("vendors");
  const [vendors, setVendors] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, [tab]);

  async function load() {
    setLoading(true);
    try {
      if (tab === "vendors") setVendors(await getAllVendors());
      else setOrders(await getAllOrders());
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(id) {
    try {
      await verifyVendor(id);
      toast.success("Vendor verified!");
      load();
    } catch (err) {
      toast.error(err.message || "Verification failed");
    }
  }

  const tabs = [
    { key: "vendors", label: "Vendors", icon: <Store className="w-4 h-4" /> },
    { key: "orders", label: "All Orders", icon: <Package className="w-4 h-4" /> },
  ];

  const unverified = vendors.filter((v) => !v.verified).length;

  return (
    <ProtectedRoute roles={["ROLE_ADMIN"]}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage vendors, orders, and platform operations
          </p>
        </div>

        {/* Quick stats */}
        {!loading && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="card p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Store className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {vendors.length}
                  </p>
                  <p className="text-xs text-gray-500">Total Vendors</p>
                </div>
              </div>
            </div>
            <div className="card p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {vendors.filter((v) => v.verified).length}
                  </p>
                  <p className="text-xs text-gray-500">Verified</p>
                </div>
              </div>
            </div>
            <div className="card p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {unverified}
                  </p>
                  <p className="text-xs text-gray-500">Pending</p>
                </div>
              </div>
            </div>
            <div className="card p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                  <Package className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {orders.length}
                  </p>
                  <p className="text-xs text-gray-500">Total Orders</p>
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
              {t.key === "vendors" && unverified > 0 && (
                <span className="bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {unverified}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
          </div>
        ) : tab === "vendors" ? (
          <div className="space-y-3">
            {vendors.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center">
                  <Store className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-gray-500 font-medium">
                  No vendors registered yet
                </p>
              </div>
            ) : (
              vendors.map((v, i) => (
                <div
                  key={v.id}
                  className="card p-5 flex items-center justify-between animate-fade-in-up opacity-0"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-brand-400 to-brand-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                      {v.restaurantName?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">
                        {v.restaurantName}
                      </h3>
                      <p className="text-sm text-gray-500">{v.address}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                        <span>
                          Rating: {v.rating?.toFixed(1) || "N/A"}
                        </span>
                        <span>Reviews: {v.totalRatings || 0}</span>
                      </div>
                    </div>
                  </div>
                  {v.verified ? (
                    <span className="flex items-center gap-1.5 text-emerald-600 text-sm font-medium bg-emerald-50 px-3 py-1.5 rounded-lg">
                      <ShieldCheck className="w-4 h-4" /> Verified
                    </span>
                  ) : (
                    <button
                      onClick={() => handleVerify(v.id)}
                      className="btn-primary !py-2 !px-4 !text-sm flex items-center gap-1.5 !from-blue-600 !to-blue-500 !shadow-blue-500/25"
                    >
                      <ShieldCheck className="w-4 h-4" /> Verify
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center">
                  <Package className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-gray-500 font-medium">No orders yet</p>
              </div>
            ) : (
              orders.map((o, i) => (
                <div
                  key={o.id}
                  className="card p-5 animate-fade-in-up opacity-0"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-gray-900">{o.foodName}</h3>
                      <p className="text-sm text-gray-500">{o.vendorName}</p>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                        o.orderStatus === "COMPLETED"
                          ? "bg-emerald-50 text-emerald-700"
                          : o.orderStatus === "CANCELLED"
                          ? "bg-red-50 text-red-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {o.orderStatus}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span>Qty: {o.quantity}</span>
                    <span>₹{o.totalAmount}</span>
                    <span>Payment: {o.paymentStatus}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
