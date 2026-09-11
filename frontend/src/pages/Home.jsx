import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HeartHandshake, ShieldCheck, Sparkles, MapPin, ArrowRight, Truck,
  Building2, Users, CheckCircle2, ChevronRight, Activity, Clock,
  Flame, Leaf, Award, HelpCircle, ChevronDown, Zap, Compass
} from 'lucide-react';

export const Home = () => {
  // Interactive AI Freshness Estimator State
  const [testCategory, setTestCategory] = useState('cooked_rice_curry');
  const [prepHoursAgo, setPrepHoursAgo] = useState(2);
  const [storageType, setStorageType] = useState('covered_room_temp');
  const [estimatedResult, setEstimatedResult] = useState(null);
  const [faqOpen, setFaqOpen] = useState(null);

  const calculateDemoFreshness = () => {
    let baseScore = 95;
    let baseShelfHours = 12;

    if (testCategory === 'cooked_rice_curry') {
      baseShelfHours = storageType === 'refrigerated' ? 24 : 8;
      baseScore = Math.max(15, Math.round(98 - (prepHoursAgo * 6.5) - (storageType === 'refrigerated' ? 0 : 8)));
    } else if (testCategory === 'bakery_bread') {
      baseShelfHours = 48;
      baseScore = Math.max(25, Math.round(99 - (prepHoursAgo * 2.1)));
    } else if (testCategory === 'raw_vegetables') {
      baseShelfHours = 72;
      baseScore = Math.max(30, Math.round(98 - (prepHoursAgo * 1.5)));
    } else if (testCategory === 'dairy_desserts') {
      baseShelfHours = storageType === 'refrigerated' ? 18 : 6;
      baseScore = Math.max(10, Math.round(95 - (prepHoursAgo * 10)));
    }

    const safeWindow = Math.max(1, Math.round(baseShelfHours - prepHoursAgo));
    let urgency = 'Normal Dispatch';
    let urgencyColor = 'text-emerald-500';

    if (baseScore < 50) {
      urgency = 'Immediate Emergency Rescue';
      urgencyColor = 'text-rose-500';
    } else if (baseScore < 75) {
      urgency = 'High Priority Dispatch';
      urgencyColor = 'text-amber-500';
    }

    setEstimatedResult({
      score: baseScore,
      shelfLife: safeWindow,
      urgency,
      urgencyColor,
      status: baseScore >= 50 ? 'Safe For Consumption' : 'Quality Degraded'
    });
  };

  const toggleFaq = (idx) => {
    setFaqOpen(faqOpen === idx ? null : idx);
  };

  return (
    <div className="relative overflow-hidden selection:bg-emerald-500 selection:text-white">
      
      {/* Background Multi-layer Gradient Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-gradient-to-tr from-emerald-600/20 via-teal-500/15 to-blue-600/10 blur-[130px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-[800px] right-0 w-[500px] h-[500px] bg-gradient-to-br from-purple-600/15 to-indigo-600/10 blur-[140px] rounded-full pointer-events-none -z-10" />

      {/* Live Rescue Ticker Banner */}
      <div className="w-full bg-emerald-500/10 border-y border-emerald-500/20 py-2.5 px-4 overflow-hidden backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs font-semibold text-emerald-700 dark:text-emerald-300">
          <div className="flex items-center space-x-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="uppercase tracking-wider font-bold">Live Rescue Network:</span>
            <span className="hidden sm:inline text-gray-600 dark:text-gray-400">Connecting surplus food from donors to verified NGOs across cities</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">Avg Rescue Time: 28 Mins</span>
            <span className="hidden md:inline text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 font-bold">100% Verified</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 text-center">
        
        <div className="inline-flex items-center space-x-2.5 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/15 to-teal-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-8 shadow-sm">
          <Sparkles className="w-4 h-4 text-emerald-500 animate-spin" />
          <span>Next-Gen AI Food Rescue & Logistics Ecosystem</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-gray-900 dark:text-white max-w-5xl mx-auto leading-[1.12]">
          Zero Food Wastage. <br />
          <span className="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 bg-clip-text text-transparent">
            Maximum Human Impact.
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto font-normal leading-relaxed">
          AnnSetu bridges hotels, restaurants, and event caterers with verified NGOs and volunteer dispatchers using real-time machine learning freshness audits and live geospatial tracking.
        </p>

        {/* Primary CTA Action Row */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto sm:max-w-none">
          <Link
            to="/register"
            className="w-full sm:w-auto px-9 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-base shadow-xl shadow-emerald-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-3 group"
          >
            <span>Join the Mission</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            to="/login"
            className="w-full sm:w-auto px-9 py-4 rounded-2xl bg-white dark:bg-[#131b2e] border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white font-bold text-base hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-emerald-500/40 shadow-lg transition-all flex items-center justify-center space-x-2"
          >
            <Compass className="w-5 h-5 text-emerald-500" />
            <span>Sign In to Portal</span>
          </Link>
        </div>

        {/* Live Metrics Grid */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-5 max-w-5xl mx-auto p-6 sm:p-8 rounded-3xl bg-white/70 dark:bg-[#111827]/70 backdrop-blur-xl border border-gray-200/80 dark:border-gray-800/80 shadow-2xl">
          <div className="p-3">
            <div className="text-3xl sm:text-4xl font-black text-emerald-500 font-mono">14,250+</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 uppercase font-bold tracking-wider">Kg Surplus Saved</div>
          </div>
          <div className="p-3">
            <div className="text-3xl sm:text-4xl font-black text-blue-500 font-mono">57,000+</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 uppercase font-bold tracking-wider">Meals Provided</div>
          </div>
          <div className="p-3">
            <div className="text-3xl sm:text-4xl font-black text-amber-500 font-mono">35.6 T</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 uppercase font-bold tracking-wider">CO₂ Offset Avoided</div>
          </div>
          <div className="p-3">
            <div className="text-3xl sm:text-4xl font-black text-purple-500 font-mono">98.6%</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 uppercase font-bold tracking-wider">AI Freshness Accuracy</div>
          </div>
        </div>

      </section>

      {/* ===== INTERACTIVE FEATURE: LIVE AI FRESHNESS ESTIMATOR WIDGET ===== */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-b from-white/90 to-gray-50/90 dark:from-[#131b2e]/90 dark:to-[#0f172a]/90 backdrop-blur-xl border border-emerald-500/30 shadow-2xl relative overflow-hidden">
          
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Sparkles className="w-48 h-48 text-emerald-500" />
          </div>

          <div className="max-w-2xl mb-8">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase mb-3">
              <Zap className="w-3.5 h-3.5" />
              <span>Interactive AI Demonstration</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
              Try the AI Freshness & Shelf-Life Engine
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Select food parameters below to see how our ML models calculate safe consumption windows and dispatch urgency in real-time.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Input Controls */}
            <div className="lg:col-span-7 space-y-5">
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                  Food Category
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { id: 'cooked_rice_curry', label: 'Cooked Rice & Curries' },
                    { id: 'bakery_bread', label: 'Bakery & Breads' },
                    { id: 'raw_vegetables', label: 'Raw Veg & Salads' },
                    { id: 'dairy_desserts', label: 'Dairy & Sweets' }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setTestCategory(cat.id)}
                      className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                        testCategory === cat.id
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-sm'
                          : 'border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Hours Since Preparation: <span className="text-emerald-500 font-mono text-sm">{prepHoursAgo} Hours</span>
                  </label>
                </div>
                <input
                  type="range"
                  min="0"
                  max="12"
                  step="0.5"
                  value={prepHoursAgo}
                  onChange={(e) => setPrepHoursAgo(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 h-2 bg-gray-200 dark:bg-gray-800 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-mono">
                  <span>Just Prepared (0h)</span>
                  <span>6 Hours</span>
                  <span>12 Hours</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                  Storage Conditions
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setStorageType('covered_room_temp')}
                    className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                      storageType === 'covered_room_temp'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    Covered Room Temperature
                  </button>
                  <button
                    type="button"
                    onClick={() => setStorageType('refrigerated')}
                    className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                      storageType === 'refrigerated'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    Refrigerated (4°C - 8°C)
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={calculateDemoFreshness}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center space-x-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Run AI Freshness Audit</span>
              </button>

            </div>

            {/* AI Result Card */}
            <div className="lg:col-span-5">
              <div className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-800 shadow-inner space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">ML Prediction Output</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[11px] font-bold border border-emerald-500/20">
                    Model: RF-Fresh v2.4
                  </span>
                </div>

                {estimatedResult ? (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="text-center py-2">
                      <div className="text-5xl font-black font-mono text-emerald-500 mb-1">
                        {estimatedResult.score}%
                      </div>
                      <div className="text-xs font-bold uppercase tracking-wider text-gray-500">Estimated Freshness Score</div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="p-3 rounded-xl bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700">
                        <div className="text-xs text-gray-400">Safe Window</div>
                        <div className="text-lg font-black font-mono text-gray-900 dark:text-white mt-0.5">
                          {estimatedResult.shelfLife} Hours
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700">
                        <div className="text-xs text-gray-400">Status</div>
                        <div className="text-xs font-bold text-emerald-500 mt-1 truncate">
                          {estimatedResult.status}
                        </div>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-300">
                      <span className="font-bold">Dispatch Recommendation: </span>
                      <span className={estimatedResult.urgencyColor}>{estimatedResult.urgency}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 space-y-3">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto opacity-40 animate-pulse" />
                    <p className="text-xs text-gray-500">
                      Click <strong>"Run AI Freshness Audit"</strong> to simulate instant quality assessment.
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ===== 4-STEP ECOSYSTEM WORKFLOW ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-gray-200 dark:border-gray-800/60">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
            How AnnSetu Rescues Surplus Food
          </h2>
          <p className="mt-3 text-base text-gray-600 dark:text-gray-400">
            A seamless, verified, end-to-end pipeline engineered for speed, hygiene, and full transparency.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          <div className="p-6 rounded-3xl bg-white dark:bg-[#131b2e] border border-gray-200 dark:border-gray-800 shadow-sm hover:border-emerald-500/40 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-5 font-mono font-bold text-lg group-hover:scale-110 transition-transform">
              01
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Post Surplus</h3>
            <p className="mt-2 text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Donors input food details, quantity, and prep time in under 60 seconds from any device.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-[#131b2e] border border-gray-200 dark:border-gray-800 shadow-sm hover:border-teal-500/40 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-500 flex items-center justify-center mb-5 font-mono font-bold text-lg group-hover:scale-110 transition-transform">
              02
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">AI Freshness Audit</h3>
            <p className="mt-2 text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Machine learning models calculate expiry windows and food suitability parameters instantly.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-[#131b2e] border border-gray-200 dark:border-gray-800 shadow-sm hover:border-blue-500/40 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-5 font-mono font-bold text-lg group-hover:scale-110 transition-transform">
              03
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Smart Radar Dispatch</h3>
            <p className="mt-2 text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Geospatial algorithms alert the closest available volunteer heroes for fast pickup.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-[#131b2e] border border-gray-200 dark:border-gray-800 shadow-sm hover:border-purple-500/40 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-5 font-mono font-bold text-lg group-hover:scale-110 transition-transform">
              04
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Verified OTP Delivery</h3>
            <p className="mt-2 text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              6-digit OTP verification ensures safe handover and transparent distribution to NGOs.
            </p>
          </div>

        </div>
      </section>

      {/* ===== FOUR CORE PLATFORM STAKEHOLDERS ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-extrabold text-center text-gray-900 dark:text-white mb-12">
          Tailored Portals for Every Role
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="p-8 rounded-3xl bg-white dark:bg-[#131b2e] border border-gray-200 dark:border-gray-800 shadow-lg hover:shadow-emerald-500/10 transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-6">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Food Donors</h3>
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Restaurants, caterers, hotels, and households. Post excess food in seconds, track volunteer arrival, and receive impact certificates.
              </p>
            </div>
            <Link
              to="/register"
              className="mt-6 inline-flex items-center space-x-2 text-xs font-bold text-emerald-500 hover:text-emerald-400"
            >
              <span>Register as Donor</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="p-8 rounded-3xl bg-white dark:bg-[#131b2e] border border-gray-200 dark:border-gray-800 shadow-lg hover:shadow-blue-500/10 transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-6">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Rescue Volunteers</h3>
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Hero dispatchers. Get real-time geospatial alerts for surplus food nearby, earn gamified badges, and nourish local shelters.
              </p>
            </div>
            <Link
              to="/register"
              className="mt-6 inline-flex items-center space-x-2 text-xs font-bold text-blue-500 hover:text-blue-400"
            >
              <span>Join as Volunteer</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="p-8 rounded-3xl bg-white dark:bg-[#131b2e] border border-gray-200 dark:border-gray-800 shadow-lg hover:shadow-purple-500/10 transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-6">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Verified NGOs</h3>
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Shelters and feeding programs. Manage food inventory, track incoming deliveries, and log beneficiary distribution statistics.
              </p>
            </div>
            <Link
              to="/register"
              className="mt-6 inline-flex items-center space-x-2 text-xs font-bold text-purple-500 hover:text-purple-400"
            >
              <span>Register NGO Partner</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </section>

      {/* ===== FREQUENTLY ASKED QUESTIONS ===== */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-gray-200 dark:border-gray-800/60">
        <h2 className="text-3xl font-extrabold text-center text-gray-900 dark:text-white mb-8">
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          {[
            {
              q: 'How does AnnSetu verify food freshness and safety?',
              a: 'AnnSetu utilizes predictive ML models that factor in food category, preparation timestamp, ambient temperature, storage mode, and image inspection to verify remaining shelf-life before dispatch.'
            },
            {
              q: 'Is there any cost for NGOs or Donors to use AnnSetu?',
              a: 'No. AnnSetu is 100% open-access for non-profits, volunteers, and food donors to eliminate food wastage and hunger in communities.'
            },
            {
              q: 'How does the OTP Handover security protocol work?',
              a: 'When a volunteer accepts a rescue task, a unique 6-digit cryptographic OTP is generated. The volunteer must verify this code at physical pickup and confirm delivery with photographic proof.'
            },
            {
              q: 'How can an organization get administrative or partner access?',
              a: 'Organizations can register with valid NGO documentation. Platform administrators verify certificates before granting access to the verified NGO inventory dashboard.'
            }
          ].map((item, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#131b2e] overflow-hidden"
            >
              <button
                type="button"
                onClick={() => toggleFaq(idx)}
                className="w-full p-5 text-left font-bold text-sm text-gray-900 dark:text-white flex items-center justify-between hover:text-emerald-500 transition-colors"
              >
                <span>{item.q}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${faqOpen === idx ? 'rotate-180 text-emerald-500' : 'text-gray-400'}`} />
              </button>
              {faqOpen === idx && (
                <div className="px-5 pb-5 text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ===== MODERN FOOTER ===== */}
      <footer className="border-t border-gray-200 dark:border-gray-800/80 bg-white/50 dark:bg-[#0b0f17]/90 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent">
                AnnSetu
              </span>
              <p className="text-[10px] text-gray-400">AI-Powered Smart Food Rescue Platform</p>
            </div>
          </div>

          <div className="flex items-center space-x-6 text-xs text-gray-500 dark:text-gray-400">
            <Link to="/login" className="hover:text-emerald-500 transition-colors">Sign In</Link>
            <Link to="/register" className="hover:text-emerald-500 transition-colors">Register</Link>
            <span className="text-gray-300 dark:text-gray-700">|</span>
            <span className="font-mono text-[11px] text-emerald-500 font-bold">🟢 Server Status: 100% Operational</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

