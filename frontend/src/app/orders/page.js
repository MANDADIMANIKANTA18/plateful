"use client";
import { useEffect, useState } from "react";
import { getMyOrders, cancelOrder } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import toast from "react-hot-toast";
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

const statusConfig = {
  PENDING: {
    color: "bg-amber-50 text-amber-700 border-amber-200",
    icon: <Clock className="w-3.5 h-3.5" />,
    dot: "bg-amber-500",
  },
  CONFIRMED: {
    color: "bg-blue-50 text-blue-700 border-blue-200",
    icon: <Package className="w-3.5 h-3.5" />,
    dot: "bg-blue-500",
  },
  COMPLETED: {
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: <CheckCircle className="w-3.5 h-3.5" />,
    dot: "bg-emerald-500",
  },
  CANCELLED: {
    color: "bg-red-50 text-red-700 border-red-200",
    icon: <XCircle className="w-3.5 h-3.5" />,
    dot: "bg-red-500",
  },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    setLoading(true);
    try {
      setOrders(await getMyOrders());
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel(id) {
    if (!confirm("Cancel this order?")) return;
    try {
      await cancelOrder(id);
      toast.success("Order cancelled");
      loadOrders();
    } catch (err) {
      toast.error(err.message || "Cancel failed");
    }
  }

  return (
    <ProtectedRoute roles={["ROLE_CUSTOMER"]}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-20 h-20 bg-brand-50 rounded-3xl flex items-center justify-center">
              <ShoppingBag className="w-8 h-8 text-brand-300" />
            </div>
            <p className="text-gray-500 font-medium">No orders yet</p>
            <Link
              href="/foods"
              className="btn-primary !py-2.5 !px-5 !text-sm flex items-center gap-2"
            >
              Browse Food <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((o, i) => {
              const status = statusConfig[o.orderStatus] || statusConfig.PENDING;
              return (
                <div
                  key={o.id}
                  className="card p-6 animate-fade-in-up opacity-0"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-lg text-gray-900">
                          {o.foodName}
                        </h3>
                        <span
                          className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg border ${status.color}`}
                        >
                          {status.icon} {o.orderStatus}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{o.vendorName}</p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-surface-50 rounded-xl p-3">
                      <span className="text-xs text-gray-400 block mb-0.5">
                        Quantity
                      </span>
                      <span className="font-semibold text-gray-800">
                        {o.quantity}
                      </span>
                    </div>
                    <div className="bg-surface-50 rounded-xl p-3">
                      <span className="text-xs text-gray-400 block mb-0.5">
                        Total
                      </span>
                      <span className="font-semibold text-gray-800">
                        ₹{o.totalAmount}
                      </span>
                    </div>
                    <div className="bg-surface-50 rounded-xl p-3">
                      <span className="text-xs text-gray-400 block mb-0.5">
                        Payment
                      </span>
                      <span className="font-semibold text-gray-800">
                        {o.paymentStatus}
                      </span>
                    </div>
                    {o.pickupCode && (
                      <div className="bg-brand-50 rounded-xl p-3 border border-brand-100">
                        <span className="text-xs text-brand-500 block mb-0.5">
                          Pickup Code
                        </span>
                        <span className="font-mono font-bold text-brand-700 text-lg">
                          {o.pickupCode}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      {new Date(o.createdAt).toLocaleString()}
                    </span>
                    {o.orderStatus === "PENDING" && (
                      <button
                        onClick={() => handleCancel(o.id)}
                        className="text-sm text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg font-medium transition-all duration-200"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
