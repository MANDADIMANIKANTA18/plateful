"use client";
import { useEffect, useState } from "react";
import { getProfile, updateProfile } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import ProtectedRoute from "@/components/ProtectedRoute";
import toast from "react-hot-toast";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Navigation,
  Save,
  Shield,
  Calendar,
  Radius,
} from "lucide-react";

export default function ProfilePage() {
  const { user, saveUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Editable fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [nearMeRadiusKm, setNearMeRadiusKm] = useState(5);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    setLoading(true);
    try {
      const data = await getProfile();
      setProfile(data);
      setName(data.name || "");
      setPhone(data.phone || "");
      setNearMeRadiusKm(data.nearMeRadiusKm || 5);
    } catch {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateProfile({ name, phone, nearMeRadiusKm });
      setProfile(updated);

      // Update the auth context so Navbar etc. reflect the new name
      if (user) {
        const updatedUser = { ...user, name: updated.name };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        saveUser({ ...updatedUser, token: user.token });
      }

      toast.success("Profile updated!");
    } catch (err) {
      toast.error(err.message || "Update failed");
    } finally {
      setSaving(false);
    }
  }

  const radiusOptions = [1, 2, 3, 5, 10, 15, 20, 25, 50];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <ProtectedRoute roles={["ROLE_CUSTOMER", "ROLE_VENDOR", "ROLE_ADMIN"]}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Profile card */}
        <div className="card p-0 overflow-hidden">
          {/* Banner */}
          <div className="h-32 bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 relative">
            <div className="absolute -bottom-10 left-6">
              <div className="w-20 h-20 rounded-2xl bg-white shadow-xl flex items-center justify-center ring-4 ring-white">
                <span className="text-3xl font-bold text-brand-600">
                  {profile?.name?.charAt(0)?.toUpperCase() || "?"}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-14 pb-2 px-6">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-xl font-bold text-gray-900">
                {profile?.name}
              </h2>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-brand-50 text-brand-600 border border-brand-100">
                {profile?.role?.replace("ROLE_", "")}
              </span>
            </div>
            <p className="text-sm text-gray-500 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" /> {profile?.email}
            </p>
            {profile?.createdAt && (
              <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-1">
                <Calendar className="w-3 h-3" /> Member since{" "}
                {new Date(profile.createdAt).toLocaleDateString("en-IN", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            )}
          </div>

          {/* Edit form */}
          <form onSubmit={handleSave} className="p-6 pt-4 space-y-5">
            <div className="border-t border-gray-100 pt-5">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-4">
                <Shield className="w-4 h-4 text-brand-500" /> Personal
                Information
              </h3>

              <div className="grid sm:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      className="input !pl-10 !rounded-xl"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      minLength={1}
                      maxLength={120}
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Phone
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      className="input !pl-10 !rounded-xl"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="xxxxxxxx"
                      maxLength={20}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Distance preference */}
            <div className="border-t border-gray-100 pt-5">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                <Navigation className="w-4 h-4 text-brand-500" /> Nearby Food
                Distance
              </h3>
              <p className="text-xs text-gray-400 mb-4">
                Set the maximum radius for "Near Me" food search results.
              </p>

              <div className="flex flex-wrap gap-2">
                {radiusOptions.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setNearMeRadiusKm(r)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      nearMeRadiusKm === r
                        ? "bg-brand-600 text-white shadow-lg shadow-brand-500/25"
                        : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"
                    }`}
                  >
                    {r} km
                  </button>
                ))}
              </div>

              <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 bg-brand-50 border border-brand-100 rounded-xl px-3 py-2">
                <MapPin className="w-3.5 h-3.5 text-brand-500 flex-shrink-0" />
                Currently set to{" "}
                <span className="font-bold text-brand-600">
                  {nearMeRadiusKm} km
                </span>{" "}
                radius
              </div>
            </div>

            {/* Save button */}
            <div className="border-t border-gray-100 pt-5">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary flex items-center gap-2 !py-2.5 w-full sm:w-auto justify-center"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </form>
        </div>

        {/* Read-only info cards */}
        {(profile?.latitude || profile?.email) && (
          <div className="grid sm:grid-cols-2 gap-4 mt-6">
            <div className="card p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Mail className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Email</p>
                  <p className="text-sm font-medium text-gray-800 truncate max-w-[180px]">
                    {profile?.email}
                  </p>
                </div>
              </div>
            </div>
            {profile?.latitude && profile?.longitude && (
              <div className="card p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Location</p>
                    <p className="text-sm font-medium text-gray-800">
                      {profile.latitude.toFixed(4)}°,{" "}
                      {profile.longitude.toFixed(4)}°
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
