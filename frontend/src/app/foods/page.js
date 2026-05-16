"use client";
import { useEffect, useState } from "react";
import { getNearbyFoods, getFoods, getFoodsByType, createOrder } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import FoodCard from "@/components/FoodCard";
import toast from "react-hot-toast";
import { Search, MapPin, Utensils, Sparkles, Gift, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const categories = [
  "All",
  "Indian",
  "Chinese",
  "Italian",
  "Bakery",
  "South Indian",
  "Street Food",
  "Beverages",
  "Desserts",
];

const listingTabs = [
  { key: "ALL", label: "All Food", icon: <Utensils className="w-4 h-4" /> },
  { key: "SURPRISE_BOX", label: "Surprise Boxes", icon: <Gift className="w-4 h-4" /> },
  { key: "NEAR_EXPIRY", label: "Near Expiry", icon: <AlertTriangle className="w-4 h-4" /> },
];

export default function FoodsPage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeTab, setActiveTab] = useState("ALL");
  const [usingLocation, setUsingLocation] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    loadFoods();

    const channel = supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "food_listings" },
        () => loadFoods()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    loadFoods();
  }, [activeTab]);

  async function loadFoods() {
    setLoading(true);
    try {
      let data;
      if (activeTab === "ALL") {
        data = await getFoods();
      } else {
        data = await getFoodsByType(activeTab);
      }
      setListings(data);
    } catch {
      toast.error("Failed to load listings");
    } finally {
      setLoading(false);
    }
  }

  async function loadNearby() {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }
    setUsingLocation(true);
    setLoading(true);

    // Get the user's preferred radius from localStorage profile or default to 5km
    let radiusKm = 5;
    try {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      if (storedUser.nearMeRadiusKm) radiusKm = storedUser.nearMeRadiusKm;
    } catch { /* use default */ }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const data = await getNearbyFoods(
            pos.coords.latitude,
            pos.coords.longitude,
            radiusKm
          );
          setListings(data);
        } catch {
          toast.error("Failed to load nearby food");
        } finally {
          setLoading(false);
        }
      },
      () => {
        toast.error("Location access denied");
        setLoading(false);
        setUsingLocation(false);
      }
    );
  }

  async function handleOrder(listing, qty = 1) {
    if (!user) {
      toast.error("Please login to order");
      router.push("/login");
      return;
    }
    if (user.role !== "ROLE_CUSTOMER") {
      toast.error("Only customers can place orders");
      return;
    }
    try {
      const order = await createOrder({ listingId: listing.id, quantity: qty });
      toast.success(`Order placed! Pickup code: ${order.pickupCode}`);
      router.push("/orders");
    } catch (err) {
      toast.error(err.message || "Order failed");
    }
  }

  const filtered = listings.filter((l) => {
    const matchSearch =
      l.foodName?.toLowerCase().includes(search.toLowerCase()) ||
      (l.category || "").toLowerCase().includes(search.toLowerCase()) ||
      (l.restaurantName || "").toLowerCase().includes(search.toLowerCase()) ||
      (l.brand || "").toLowerCase().includes(search.toLowerCase());
    const matchCategory =
      activeCategory === "All" ||
      (l.category || "").toLowerCase() === activeCategory.toLowerCase();
    return matchSearch && matchCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-brand-600 text-sm font-semibold mb-1">
          <Sparkles className="w-4 h-4" />
          Fresh picks, big savings
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
          Available Food
        </h1>
      </div>

      {/* Listing type tabs */}
      <div className="flex gap-2 mb-6">
        {listingTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setActiveCategory("All"); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeTab === tab.key
                ? tab.key === "SURPRISE_BOX"
                  ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg shadow-purple-500/25"
                  : tab.key === "NEAR_EXPIRY"
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25"
                  : "bg-brand-600 text-white shadow-lg shadow-brand-500/25"
                : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Search + Location bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            placeholder="Search food, category, vendor, brand…"
            className="input !pl-11 !rounded-xl"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          onClick={usingLocation ? () => { setUsingLocation(false); loadFoods(); } : loadNearby}
          className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-medium transition-all duration-200 whitespace-nowrap ${
            usingLocation
              ? "bg-brand-600 text-white shadow-lg shadow-brand-500/25"
              : "border-2 border-gray-200 text-gray-600 hover:border-brand-500 hover:text-brand-600 hover:bg-brand-50"
          }`}
        >
          <MapPin className="w-4 h-4" />
          {usingLocation ? "Show All" : "Near Me"}
        </button>
      </div>

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
              activeCategory === cat
                ? "bg-brand-600 text-white shadow-md shadow-brand-500/25"
                : "bg-white border border-gray-200 text-gray-600 hover:border-brand-300 hover:text-brand-600"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Surprise Box promo banner */}
      {activeTab === "SURPRISE_BOX" && (
        <div className="mb-8 bg-gradient-to-r from-purple-600 to-pink-500 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Surprise Boxes</h3>
              <p className="text-purple-100 text-sm">
                Grab a mystery box packed with food worth much more than you pay!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Near Expiry promo banner */}
      {activeTab === "NEAR_EXPIRY" && (
        <div className="mb-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Near-Expiry Deals</h3>
              <p className="text-amber-100 text-sm">
                Quality products from supermarkets and stores at deep discounts before their expiry date.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading fresh deals…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-20 h-20 bg-brand-50 rounded-3xl flex items-center justify-center">
            {activeTab === "SURPRISE_BOX" ? (
              <Gift className="w-8 h-8 text-purple-300" />
            ) : activeTab === "NEAR_EXPIRY" ? (
              <AlertTriangle className="w-8 h-8 text-amber-300" />
            ) : (
              <Utensils className="w-8 h-8 text-brand-300" />
            )}
          </div>
          <p className="text-gray-500 font-medium">
            {activeTab === "SURPRISE_BOX"
              ? "No surprise boxes available right now"
              : activeTab === "NEAR_EXPIRY"
              ? "No near-expiry items available right now"
              : "No food listings found"}
          </p>
          <p className="text-gray-400 text-sm">
            Check back soon — new deals drop daily!
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((l, i) => (
            <div
              key={l.id}
              className="animate-fade-in-up opacity-0"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <FoodCard listing={l} onOrder={handleOrder} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
