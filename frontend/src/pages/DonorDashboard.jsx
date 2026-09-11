import React, { useState, useEffect, useRef } from 'react';
import { StatCard } from '../components/StatCard';
import { DonationCard } from '../components/DonationCard';
import { donationService } from '../services/donationService';
import { Utensils, Heart, Sparkles, Plus, CheckCircle, Clock, RefreshCw, Zap, Truck, PackageCheck } from 'lucide-react';

export const DonorDashboard = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const autoRefreshRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    foodCategory: 'cooked_meal',
    foodType: 'veg',
    quantityKg: 10,
    servingsCount: 40,
    address: 'Connaught Place, New Delhi',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600',
    notes: 'Freshly prepared meals packed in hygienic containers.'
  });
  const [submitting, setSubmitting] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState(null);

  const fetchMyDonations = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await donationService.getMyDonations();
      setDonations(res.data?.donations || []);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error(err);
    } finally {
      if (!silent) setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchMyDonations();
  }, []);

  // Auto-refresh every 30 seconds to show live status updates from volunteer/NGO
  useEffect(() => {
    autoRefreshRef.current = setInterval(() => {
      fetchMyDonations(true); // silent refresh
    }, 30000);
    return () => clearInterval(autoRefreshRef.current);
  }, []);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await fetchMyDonations(true);
  };

  const handleSubmitDonation = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        pickupLocation: {
          type: 'Point',
          coordinates: [77.2090, 28.6139],
          address: formData.address
        }
      };

      const res = await donationService.createDonation(payload);
      setAiAnalysisResult(res.data?.aiAnalysis);
      fetchMyDonations();
      setTimeout(() => {
        setIsModalOpen(false);
        setAiAnalysisResult(null);
      }, 3000);
    } catch (err) {
      alert(err.message || 'Error posting donation');
    } finally {
      setSubmitting(false);
    }
  };

  const totalKg = donations.reduce((acc, d) => acc + (d.quantityKg || 0), 0);
  const mealsServed = totalKg * 4;

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFormData((prev) => ({
            ...prev,
            address: `Lat: ${pos.coords.latitude.toFixed(4)}, Lng: ${pos.coords.longitude.toFixed(4)} (Current Location)`
          }));
        },
        () => {
          setFormData((prev) => ({
            ...prev,
            address: 'Connaught Place, New Delhi'
          }));
        }
      );
    }
  };

  const sampleFoodImages = [
    { label: 'Meals', url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600' },
    { label: 'Rice', url: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600' },
    { label: 'Bread/Bakery', url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600' },
    { label: 'Vegetables', url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600' }
  ];

  return (
    <div className="space-y-8">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-green-500 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
          <Utensils className="w-48 h-48 text-white" />
        </div>

        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[11px] font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Donor Impact Control Hub</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">Food Rescue Donor Portal</h1>
          <p className="text-emerald-100 text-xs sm:text-sm max-w-xl">
            Post excess food, trigger real-time AI freshness audits, and connect instantly with volunteer dispatchers.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3.5 rounded-2xl bg-white text-emerald-800 font-extrabold text-sm shadow-xl hover:bg-emerald-50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center space-x-2 w-max shrink-0"
        >
          <Plus className="w-5 h-5 text-emerald-600" />
          <span>Donate Surplus Food</span>
        </button>
      </div>

      {/* WhatsApp Live Alert Status Banner */}
      <div className="flex items-center justify-between p-3.5 px-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-900 dark:text-emerald-300 text-xs font-semibold">
        <div className="flex items-center space-x-2.5">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span>
            💬 <strong>WhatsApp Updates Enabled:</strong> You will automatically receive Flipkart-style WhatsApp alerts when food is posted, volunteer is assigned, and food is delivered!
          </span>
        </div>
        <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-emerald-500/20 text-[11px] font-bold">
          Instant Alerts
        </span>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard title="Total Food Rescued" value={`${totalKg.toFixed(1)} Kg`} icon={Utensils} color="emerald" trend="+24% This Month" />
        <StatCard title="Meals Served" value={`${mealsServed}`} icon={Heart} color="blue" subtitle="Fed to verified local shelters" />
        <StatCard title="CO₂ Emission Avoided" value={`${(totalKg * 2.5).toFixed(1)} Kg`} icon={Sparkles} color="amber" subtitle="Prevented landfill greenhouse gas" />
      </div>

      {/* Recent Donations Feed */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
            <Clock className="w-5 h-5 text-emerald-500" />
            <span>My Surplus Donation History</span>
          </h3>
          <div className="flex items-center space-x-3">
            {/* Live status legend */}
            <div className="hidden sm:flex items-center space-x-2 text-[10px] font-bold">
              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">⏳ Awaiting Volunteer</span>
              <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">🚴 Volunteer Assigned</span>
              <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-500 border border-purple-500/20">📦 Picked Up (In Transit)</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">✅ Delivered</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] text-gray-400 font-mono hidden md:block">
                Updated {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <button
                onClick={handleManualRefresh}
                disabled={refreshing}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-emerald-500 hover:bg-emerald-500/10 transition-all text-xs font-bold"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>
              <span className="text-xs text-gray-400 font-mono">Total: {donations.length} items</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs">Loading donations history...</p>
          </div>
        ) : donations.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white dark:bg-[#131b2e] border border-gray-200 dark:border-gray-800 text-center space-y-3">
            <Utensils className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto" />
            <p className="text-gray-500 text-sm font-medium">No donations posted yet.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md hover:bg-emerald-500 transition-all"
            >
              Post First Donation
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {donations.map((item) => (
              <DonationCard key={item._id} donation={item} role="donor" />
            ))}
          </div>
        )}
      </div>

      {/* Donate Food Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg bg-white dark:bg-[#131b2e] rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-200 dark:border-gray-800 my-8">
            
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Post Surplus Food</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">AI will evaluate freshness & estimate safe window</p>
              </div>
              <button
                type="button"
                onClick={() => { setIsModalOpen(false); setAiAnalysisResult(null); }}
                className="text-gray-400 hover:text-gray-200 text-xs font-bold"
              >
                ✕ Close
              </button>
            </div>

            {aiAnalysisResult ? (
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-4 animate-in fade-in duration-300">
                <CheckCircle className="w-14 h-14 text-emerald-500 mx-auto animate-bounce" />
                <h4 className="text-lg font-black text-emerald-500">AI Freshness Verified!</h4>
                <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto text-left">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <span className="text-[10px] text-gray-400 uppercase font-bold">Freshness Score</span>
                    <p className="text-xl font-black font-mono text-emerald-500">{aiAnalysisResult.freshness_score}%</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <span className="text-[10px] text-gray-400 uppercase font-bold">Safe Window</span>
                    <p className="text-xl font-black font-mono text-gray-900 dark:text-white">{aiAnalysisResult.shelf_life_hours}h</p>
                  </div>
                </div>
                <p className="text-xs text-emerald-400 italic font-medium">"{aiAnalysisResult.recommendation}"</p>
                <p className="text-[11px] text-gray-400">Notifying closest volunteer heroes via geospatial radar...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitDonation} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                    Donation Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. 50 Packets Vegetable Biryani & Raita"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                      Category
                    </label>
                    <select
                      value={formData.foodCategory}
                      onChange={(e) => setFormData({ ...formData, foodCategory: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs text-gray-900 dark:text-white outline-none"
                    >
                      <option value="cooked_meal">Cooked Meal</option>
                      <option value="raw_ingredients">Raw Ingredients</option>
                      <option value="packaged_food">Packaged Food</option>
                      <option value="bakery_fruits">Bakery & Fruits</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                      Dietary Type
                    </label>
                    <select
                      value={formData.foodType}
                      onChange={(e) => setFormData({ ...formData, foodType: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs text-gray-900 dark:text-white outline-none"
                    >
                      <option value="veg">Vegetarian (Pure Veg)</option>
                      <option value="non-veg">Non-Vegetarian</option>
                      <option value="vegan">Vegan</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                      Quantity (Kg) *
                    </label>
                    <input
                      type="number"
                      min="0.5"
                      step="0.5"
                      required
                      value={formData.quantityKg}
                      onChange={(e) => setFormData({ ...formData, quantityKg: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs text-gray-900 dark:text-white outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                      Servings Count *
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={formData.servingsCount}
                      onChange={(e) => setFormData({ ...formData, servingsCount: parseInt(e.target.value) || 0 })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs text-gray-900 dark:text-white outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Pickup Address *
                    </label>
                    <button
                      type="button"
                      onClick={handleUseCurrentLocation}
                      className="text-[11px] text-emerald-500 font-bold hover:underline"
                    >
                      📍 Use Current Location
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Full street address or landmark"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs text-gray-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                    Food Image Preset
                  </label>
                  <div className="flex gap-2 mb-2 overflow-x-auto pb-1">
                    {sampleFoodImages.map((img, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setFormData({ ...formData, imageUrl: img.url })}
                        className={`text-[10px] px-2.5 py-1 rounded-lg border font-semibold shrink-0 transition-all ${
                          formData.imageUrl === img.url
                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500'
                            : 'border-gray-200 dark:border-gray-700 text-gray-400'
                        }`}
                      >
                        {img.label}
                      </button>
                    ))}
                  </div>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://... (Image URL)"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-[11px] text-gray-900 dark:text-white outline-none"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-400 hover:bg-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-extrabold shadow-lg shadow-emerald-600/20 flex items-center space-x-2"
                  >
                    {submitting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Evaluating AI Freshness...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Post Food Donation</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
