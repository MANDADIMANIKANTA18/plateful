"use client";
import { useState } from "react";
import { ShoppingBag, Clock, MapPin, Sparkles, Gift, AlertTriangle, Store, Minus, Plus } from "lucide-react";

export default function FoodCard({ listing, onOrder }) {
  const [qty, setQty] = useState(1);
  const discount = listing.discountPercent || 0;
  const isSurpriseBox = listing.listingType === "SURPRISE_BOX";
  const isNearExpiry = listing.listingType === "NEAR_EXPIRY";
  const available = listing.quantityAvailable - (listing.quantitySold || 0);
  const maxQty = Math.max(available, 0);

  // Compute expiry countdown
  let expiryLabel = null;
  if (isNearExpiry && listing.expiryDate) {
    const diff = new Date(listing.expiryDate) - new Date();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    if (days > 0) expiryLabel = `${days}d ${hours}h left`;
    else if (hours > 0) expiryLabel = `${hours}h left`;
    else expiryLabel = "Expiring now!";
  }

  function increment() {
    setQty((prev) => Math.min(prev + 1, maxQty));
  }

  function decrement() {
    setQty((prev) => Math.max(prev - 1, 1));
  }

  return (
    <div className={`card-hover flex flex-col group ${
      isSurpriseBox ? "ring-2 ring-purple-200" : isNearExpiry ? "ring-2 ring-amber-200" : ""
    }`}>
      {/* Image */}
      <div className={`h-48 flex items-center justify-center overflow-hidden relative ${
        isSurpriseBox
          ? "bg-gradient-to-br from-purple-100 via-pink-50 to-purple-100"
          : isNearExpiry
          ? "bg-gradient-to-br from-amber-50 to-orange-100"
          : "bg-gradient-to-br from-brand-50 to-brand-100"
      }`}>
        {listing.imageUrl ? (
          <img
            src={listing.imageUrl}
            alt={listing.foodName}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : isSurpriseBox ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg animate-pulse-glow">
              <Gift className="w-8 h-8 text-white" />
            </div>
            <span className="text-xs font-medium text-purple-400">Mystery Box</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-brand-300">
            <ShoppingBag className="w-10 h-10" />
            <span className="text-xs font-medium">No image</span>
          </div>
        )}
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Type badge */}
        {isSurpriseBox ? (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-lg flex items-center gap-1">
            <Gift className="w-3 h-3" />
            Surprise Box
          </div>
        ) : isNearExpiry ? (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-lg flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Near Expiry
          </div>
        ) : discount > 0 ? (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-lg flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            {discount}% OFF
          </div>
        ) : null}

        {/* Category badge */}
        {listing.category && (
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-brand-700 text-xs font-medium px-2.5 py-1 rounded-lg">
            {listing.category}
          </div>
        )}

        {/* Vendor type badge */}
        {listing.vendorType && listing.vendorType !== "RESTAURANT" && (
          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-gray-600 text-xs font-medium px-2 py-0.5 rounded-md flex items-center gap-1">
            <Store className="w-3 h-3" />
            {listing.vendorType === "SUPERMARKET" ? "Supermarket" : "Store"}
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        {/* Title */}
        <h3 className="font-bold text-lg text-gray-900 group-hover:text-brand-700 transition-colors">
          {listing.foodName}
        </h3>

        {/* Vendor */}
        {listing.restaurantName && (
          <p className="text-sm text-gray-500 mt-0.5">{listing.restaurantName}</p>
        )}

        {/* Brand for near-expiry */}
        {isNearExpiry && listing.brand && (
          <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md w-fit mt-1">
            Brand: {listing.brand}
          </span>
        )}

        {/* Description */}
        {listing.description && (
          <p className="text-sm text-gray-500 mt-2 line-clamp-2 leading-relaxed">
            {listing.description}
          </p>
        )}

        {/* Price section */}
        <div className="mt-3">
          {isSurpriseBox ? (
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-purple-600">
                ₹{listing.sellingPrice}
              </span>
              {listing.boxValue && (
                <span className="text-sm text-gray-400 line-through">
                  Worth ₹{listing.boxValue}
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-brand-600">
                ₹{listing.sellingPrice}
              </span>
              {discount > 0 && (
                <span className="text-sm text-gray-400 line-through">
                  ₹{listing.originalPrice}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Surprise box value proposition */}
        {isSurpriseBox && listing.boxValue && (
          <div className="mt-2 bg-purple-50 border border-purple-100 rounded-lg p-2 text-center">
            <p className="text-xs text-purple-600 font-medium">
              🎉 Get ₹{listing.boxValue} worth of food for just ₹{listing.sellingPrice}!
            </p>
          </div>
        )}

        {/* Near-expiry countdown */}
        {isNearExpiry && expiryLabel && (
          <div className={`mt-2 rounded-lg p-2 text-center text-xs font-medium ${
            expiryLabel.includes("now") || expiryLabel.includes("0d")
              ? "bg-red-50 border border-red-100 text-red-600"
              : "bg-amber-50 border border-amber-100 text-amber-600"
          }`}>
            ⏰ {expiryLabel}
          </div>
        )}

        {/* Meta row */}
        <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
            <ShoppingBag className="w-3 h-3" /> {maxQty} left
          </span>
          {listing.pickupEndTime && (
            <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
              <Clock className="w-3 h-3" /> until{" "}
              {new Date(listing.pickupEndTime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
          {listing.distanceKm != null && (
            <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
              <MapPin className="w-3 h-3" /> {listing.distanceKm.toFixed(1)} km
            </span>
          )}
        </div>

        {/* Quantity selector + Order button */}
        <div className="mt-auto pt-5 space-y-3">
          {/* Quantity picker */}
          {maxQty > 0 && (
            <div className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-1.5">
              <span className="text-sm font-medium text-gray-600">Quantity</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={decrement}
                  disabled={qty <= 1}
                  className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:border-gray-300 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center font-bold text-gray-900 text-sm tabular-nums">
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={increment}
                  disabled={qty >= maxQty}
                  className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:border-gray-300 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Total price when qty > 1 */}
          {qty > 1 && maxQty > 0 && (
            <div className="flex items-center justify-between text-sm px-1">
              <span className="text-gray-500">Total</span>
              <span className={`font-bold ${isSurpriseBox ? "text-purple-600" : "text-brand-600"}`}>
                ₹{(listing.sellingPrice * qty).toFixed(2)}
              </span>
            </div>
          )}

          {/* Order button */}
          <button
            onClick={() => onOrder?.(listing, qty)}
            disabled={maxQty <= 0}
            className={`w-full font-semibold py-2.5 rounded-xl text-sm transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed ${
              isSurpriseBox
                ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-purple-500/25 hover:shadow-purple-500/30"
                : "btn-primary"
            }`}
          >
            {maxQty > 0
              ? isSurpriseBox
                ? `Grab Surprise Box${qty > 1 ? ` × ${qty}` : ""}`
                : `Order Now${qty > 1 ? ` × ${qty}` : ""}`
              : "Sold Out"}
          </button>
        </div>
      </div>
    </div>
  );
}
