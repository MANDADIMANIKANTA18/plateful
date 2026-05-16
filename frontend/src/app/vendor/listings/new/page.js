"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createListing } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import toast from "react-hot-toast";
import {
  ArrowRight,
  Utensils,
  DollarSign,
  Clock,
  Image,
  Sparkles,
  Gift,
  AlertTriangle,
  Package,
  Calendar,
  Tag,
} from "lucide-react";

const listingTypes = [
  {
    key: "REGULAR",
    label: "Regular Listing",
    desc: "A specific food item at a discount",
    icon: <Utensils className="w-6 h-6" />,
    color: "brand",
    border: "border-brand-500",
    bg: "bg-brand-50",
    text: "text-brand-700",
  },
  {
    key: "SURPRISE_BOX",
    label: "Surprise Box",
    desc: "Mystery box filled with assorted items",
    icon: <Gift className="w-6 h-6" />,
    color: "purple",
    border: "border-purple-500",
    bg: "bg-purple-50",
    text: "text-purple-700",
  },
  {
    key: "NEAR_EXPIRY",
    label: "Near-Expiry Item",
    desc: "Products approaching their expiry date",
    icon: <AlertTriangle className="w-6 h-6" />,
    color: "amber",
    border: "border-amber-500",
    bg: "bg-amber-50",
    text: "text-amber-700",
  },
];

export default function NewListingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    foodName: "",
    description: "",
    imageUrl: "",
    originalPrice: "",
    discountPercent: "",
    quantityAvailable: "",
    category: "",
    pickupStartTime: "",
    pickupEndTime: "",
    listingType: "REGULAR",
    boxValue: "",
    expiryDate: "",
    brand: "",
  });

  const isSurprise = form.listingType === "SURPRISE_BOX";
  const isNearExpiry = form.listingType === "NEAR_EXPIRY";

  const sellingPrice =
    form.originalPrice && form.discountPercent
      ? (
          parseFloat(form.originalPrice) *
          (1 - parseFloat(form.discountPercent) / 100)
        ).toFixed(2)
      : "";

  function timeToInstant(timeStr) {
    if (!timeStr) return null;
    const today = new Date();
    const [hours, minutes] = timeStr.split(":");
    today.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    return today.toISOString();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await createListing({
        foodName: isSurprise ? "Surprise Box" : form.foodName,
        description: form.description,
        imageUrl: form.imageUrl || null,
        originalPrice: parseFloat(form.originalPrice),
        discountPercent: parseFloat(form.discountPercent),
        quantityAvailable: parseInt(form.quantityAvailable),
        category: form.category,
        pickupStartTime: timeToInstant(form.pickupStartTime),
        pickupEndTime: timeToInstant(form.pickupEndTime),
        listingType: form.listingType,
        boxValue: isSurprise && form.boxValue ? parseFloat(form.boxValue) : null,
        expiryDate: isNearExpiry && form.expiryDate
          ? new Date(form.expiryDate).toISOString()
          : null,
        brand: isNearExpiry ? form.brand : null,
      });
      toast.success("Listing created!");
      router.push("/vendor/dashboard");
    } catch (err) {
      toast.error(err.message || "Failed to create listing");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ProtectedRoute roles={["ROLE_VENDOR"]}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-brand-600 text-sm font-semibold mb-1">
            <Sparkles className="w-4 h-4" />
            Add to the rescue
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Create New Listing
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            List your surplus food and help reduce waste
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-3 card p-6 sm:p-8 space-y-5"
          >
            {/* Listing type selector */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2 text-sm uppercase tracking-wider">
                <Package className="w-4 h-4 text-brand-500" /> Listing Type
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {listingTypes.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() =>
                      setForm({ ...form, listingType: t.key })
                    }
                    className={`p-3 rounded-xl border-2 text-center transition-all duration-200 ${
                      form.listingType === t.key
                        ? `${t.border} ${t.bg} ${t.text}`
                        : "border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex justify-center mb-1.5">{t.icon}</div>
                    <span className="text-xs font-medium block">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Food details section */}
            <div className="border-t border-gray-100 pt-5 space-y-4">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2 text-sm uppercase tracking-wider">
                <Utensils className="w-4 h-4 text-brand-500" />{" "}
                {isSurprise ? "Box Details" : isNearExpiry ? "Product Details" : "Food Details"}
              </h3>

              {!isSurprise && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {isNearExpiry ? "Product Name *" : "Food Name *"}
                  </label>
                  <input
                    required
                    className="input"
                    placeholder={isNearExpiry ? "e.g. Organic Milk 1L" : "e.g. Paneer Butter Masala"}
                    value={form.foodName}
                    onChange={(e) =>
                      setForm({ ...form, foodName: e.target.value })
                    }
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {isSurprise ? "Hint for customers (what might be inside)" : "Description"}
                </label>
                <textarea
                  rows={3}
                  className="input resize-none"
                  placeholder={
                    isSurprise
                      ? "e.g. May contain: curries, rice, naan, desserts"
                      : "Describe your food item..."
                  }
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Image URL
                </label>
                <div className="relative">
                  <Image className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    className="input !pl-11"
                    placeholder="https://..."
                    value={form.imageUrl}
                    onChange={(e) =>
                      setForm({ ...form, imageUrl: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Near-Expiry specific fields */}
              {isNearExpiry && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Brand Name
                    </label>
                    <div className="relative">
                      <Tag className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        className="input !pl-11"
                        placeholder="e.g. Amul, Britannia"
                        value={form.brand}
                        onChange={(e) =>
                          setForm({ ...form, brand: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Expiry Date *
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="date"
                        required
                        className="input !pl-11"
                        value={form.expiryDate}
                        onChange={(e) =>
                          setForm({ ...form, expiryDate: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {isSurprise ? "Boxes Available *" : "Quantity *"}
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    className="input"
                    placeholder="10"
                    value={form.quantityAvailable}
                    onChange={(e) =>
                      setForm({ ...form, quantityAvailable: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Category
                  </label>
                  <select
                    className="input"
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                  >
                    <option value="">Select…</option>
                    <option value="Indian">Indian</option>
                    <option value="Chinese">Chinese</option>
                    <option value="Italian">Italian</option>
                    <option value="Bakery">Bakery</option>
                    <option value="South Indian">South Indian</option>
                    <option value="Street Food">Street Food</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Desserts">Desserts</option>
                    {isNearExpiry && (
                      <>
                        <option value="Dairy">Dairy</option>
                        <option value="Snacks">Snacks</option>
                        <option value="Groceries">Groceries</option>
                        <option value="Frozen">Frozen</option>
                      </>
                    )}
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Pricing section */}
            <div className="border-t border-gray-100 pt-5 space-y-4">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2 text-sm uppercase tracking-wider">
                <DollarSign className="w-4 h-4 text-brand-500" /> Pricing
              </h3>

              {isSurprise && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Box Value (What&apos;s inside is worth ₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="input"
                    placeholder="e.g. 500"
                    value={form.boxValue}
                    onChange={(e) =>
                      setForm({ ...form, boxValue: e.target.value })
                    }
                  />
                </div>
              )}

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {isSurprise ? "Box Price (₹) *" : "Original (₹) *"}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="input"
                    placeholder={isSurprise ? "199" : "200"}
                    value={form.originalPrice}
                    onChange={(e) =>
                      setForm({ ...form, originalPrice: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Discount % *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    className="input"
                    placeholder="30"
                    value={form.discountPercent}
                    onChange={(e) =>
                      setForm({ ...form, discountPercent: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Selling Price
                  </label>
                  <div className="input !bg-brand-50 !border-brand-200 flex items-center font-bold text-brand-700">
                    {sellingPrice ? `₹${sellingPrice}` : "—"}
                  </div>
                </div>
              </div>
            </div>

            {/* Pickup section */}
            <div className="border-t border-gray-100 pt-5 space-y-4">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2 text-sm uppercase tracking-wider">
                <Clock className="w-4 h-4 text-brand-500" /> Pickup Window
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Start Time
                  </label>
                  <input
                    type="time"
                    className="input"
                    value={form.pickupStartTime}
                    onChange={(e) =>
                      setForm({ ...form, pickupStartTime: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    End Time
                  </label>
                  <input
                    type="time"
                    className="input"
                    value={form.pickupEndTime}
                    onChange={(e) =>
                      setForm({ ...form, pickupEndTime: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 !mt-6 font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 ${
                isSurprise
                  ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-purple-500/25"
                  : "btn-primary"
              }`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {isSurprise ? "Create Surprise Box" : isNearExpiry ? "List Near-Expiry Item" : "Create Listing"}{" "}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Live Preview */}
          <div className="lg:col-span-2">
            <div className="sticky top-24">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Preview
              </h3>
              <div className={`card overflow-hidden ${
                isSurprise ? "ring-2 ring-purple-200" : isNearExpiry ? "ring-2 ring-amber-200" : ""
              }`}>
                <div className={`h-36 flex items-center justify-center relative ${
                  isSurprise
                    ? "bg-gradient-to-br from-purple-100 via-pink-50 to-purple-100"
                    : isNearExpiry
                    ? "bg-gradient-to-br from-amber-50 to-orange-100"
                    : "bg-gradient-to-br from-brand-50 to-brand-100"
                }`}>
                  {form.imageUrl ? (
                    <img
                      src={form.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => (e.target.style.display = "none")}
                    />
                  ) : isSurprise ? (
                    <Gift className="w-8 h-8 text-purple-300" />
                  ) : (
                    <Utensils className="w-8 h-8 text-brand-300" />
                  )}
                  {isSurprise && (
                    <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Gift className="w-3 h-3" /> Surprise Box
                    </div>
                  )}
                  {isNearExpiry && (
                    <div className="absolute top-2 right-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-md">
                      Near Expiry
                    </div>
                  )}
                  {!isSurprise && !isNearExpiry && form.discountPercent && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-md">
                      {form.discountPercent}% OFF
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-gray-900">
                    {isSurprise ? "Surprise Box" : form.foodName || "Food Name"}
                  </h4>
                  {isNearExpiry && form.brand && (
                    <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md mt-1 inline-block">
                      {form.brand}
                    </span>
                  )}
                  {form.category && (
                    <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md mt-1 inline-block ml-1">
                      {form.category}
                    </span>
                  )}
                  {form.description && (
                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                      {form.description}
                    </p>
                  )}
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className={`text-lg font-bold ${isSurprise ? "text-purple-600" : "text-brand-600"}`}>
                      {sellingPrice ? `₹${sellingPrice}` : "—"}
                    </span>
                    {isSurprise && form.boxValue && (
                      <span className="text-xs text-gray-400 line-through">
                        Worth ₹{form.boxValue}
                      </span>
                    )}
                    {!isSurprise && form.originalPrice && (
                      <span className="text-xs text-gray-400 line-through">
                        ₹{form.originalPrice}
                      </span>
                    )}
                  </div>
                  {isSurprise && form.boxValue && sellingPrice && (
                    <div className="mt-2 bg-purple-50 border border-purple-100 rounded-lg p-2 text-center">
                      <p className="text-xs text-purple-600 font-medium">
                        🎉 Get ₹{form.boxValue} worth for just ₹{sellingPrice}!
                      </p>
                    </div>
                  )}
                  {form.quantityAvailable && (
                    <p className="text-xs text-gray-400 mt-2">
                      {form.quantityAvailable} available
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
