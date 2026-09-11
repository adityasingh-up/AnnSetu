import React, { useState, useEffect, useRef } from 'react';
import { StatCard } from '../components/StatCard';
import { donationService } from '../services/donationService';
import {
  Building2, Utensils, Users, ShieldCheck, PackageCheck,
  ClipboardList, CheckCircle2, AlertCircle, X, ChevronDown, ChevronUp,
  Calendar, Scale, Truck, RefreshCw
} from 'lucide-react';

// Status badge component
const StatusBadge = ({ status }) => {
  const cfg = {
    PENDING: { color: 'text-amber-500 bg-amber-500/10 border-amber-500/20', label: 'Pending' },
    ACCEPTED: { color: 'text-blue-500 bg-blue-500/10 border-blue-500/20', label: 'Accepted' },
    PICKED_UP: { color: 'text-purple-500 bg-purple-500/10 border-purple-500/20', label: 'In Transit' },
    DELIVERED: { color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', label: 'Distributed ✓' },
    EXPIRED: { color: 'text-rose-500 bg-rose-500/10 border-rose-500/20', label: 'Expired' },
    CANCELLED: { color: 'text-gray-500 bg-gray-500/10 border-gray-500/20', label: 'Cancelled' }
  };
  const s = cfg[status] || cfg.PENDING;
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${s.color}`}>
      {s.label}
    </span>
  );
};

// Distribution Modal
const DistributionModal = ({ donation, onClose, onSuccess }) => {
  const [beneficiaryCount, setBeneficiaryCount] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!beneficiaryCount || isNaN(beneficiaryCount) || Number(beneficiaryCount) < 1) {
      setError('Please enter a valid beneficiary count (minimum 1).');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await donationService.markAsDistributed(donation._id, Number(beneficiaryCount), notes);
      onSuccess();
    } catch (err) {
      setError(err.message || 'Distribution failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-[#131b2e] rounded-3xl p-6 shadow-2xl border border-gray-200 dark:border-gray-800 animate-fadeIn">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <PackageCheck className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Record Distribution</h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">Mark food as distributed to beneficiaries</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Donation Info */}
        <div className="mb-5 p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 space-y-2">
          <p className="text-sm font-bold text-gray-900 dark:text-white">{donation.title}</p>
          <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center space-x-1"><Scale className="w-3.5 h-3.5" /><span>{donation.quantityKg} Kg</span></span>
            <span className="flex items-center space-x-1"><Utensils className="w-3.5 h-3.5" /><span>{donation.servingsCount} servings</span></span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
              Number of Beneficiaries Fed *
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                min="1"
                required
                value={beneficiaryCount}
                onChange={(e) => setBeneficiaryCount(e.target.value)}
                placeholder="e.g. 250"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
              Distribution Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any notes about distribution (e.g., location, time, special groups served...)"
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none"
            />
          </div>

          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-semibold text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <PackageCheck className="w-4 h-4" />
                  <span>Confirm Distribution</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Inventory Item Card
const InventoryItemCard = ({ item, onDistribute }) => {
  const [expanded, setExpanded] = useState(false);
  const canDistribute = ['ACCEPTED', 'PICKED_UP'].includes(item.status);
  const isDistributed = item.status === 'DELIVERED';

  const expiryDate = new Date(item.expiryTime);
  const isExpiringSoon = expiryDate - Date.now() < 3 * 60 * 60 * 1000; // < 3 hrs

  return (
    <div className={`rounded-2xl border bg-white dark:bg-[#131b2e] shadow-sm overflow-hidden transition-all ${
      isExpiringSoon && !isDistributed ? 'border-amber-400/50' : 'border-gray-200 dark:border-gray-800'
    }`}>
      {isExpiringSoon && !isDistributed && (
        <div className="px-4 py-1.5 bg-amber-500/10 border-b border-amber-400/30 text-amber-500 text-[10px] font-bold flex items-center space-x-1">
          <AlertCircle className="w-3 h-3" />
          <span>⚡ Expiring Soon — Please distribute quickly!</span>
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">{item.title}</h4>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{item.pickupLocation?.address}</p>
          </div>
          <StatusBadge status={item.status} />
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400 mb-4">
          <span className="flex items-center space-x-1"><Scale className="w-3.5 h-3.5" /><span className="font-semibold">{item.quantityKg} Kg</span></span>
          <span className="flex items-center space-x-1"><Utensils className="w-3.5 h-3.5" /><span>{item.servingsCount} servings</span></span>
          <span className="flex items-center space-x-1"><Calendar className="w-3.5 h-3.5" /><span>Expires: {expiryDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></span>
        </div>

        <div className="flex items-center space-x-2">
          {canDistribute && (
            <button
              onClick={() => onDistribute(item)}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center space-x-2"
            >
              <PackageCheck className="w-4 h-4" />
              <span>Mark as Distributed</span>
            </button>
          )}
          {isDistributed && (
            <div className="flex-1 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-bold text-xs flex items-center justify-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Successfully Distributed</span>
            </div>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {expanded && (
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 space-y-1.5 text-xs text-gray-500 dark:text-gray-400">
            <p><span className="font-semibold text-gray-700 dark:text-gray-300">Food Category:</span> {item.foodCategory?.replace('_', ' ')}</p>
            <p><span className="font-semibold text-gray-700 dark:text-gray-300">Food Type:</span> {item.foodType}</p>
            <p><span className="font-semibold text-gray-700 dark:text-gray-300">Freshness Score:</span> {item.freshnessScore}%</p>
            {item.notes && <p><span className="font-semibold text-gray-700 dark:text-gray-300">Notes:</span> {item.notes}</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export const NGODashboard = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'active' | 'distributed'
  const [distributeTarget, setDistributeTarget] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const autoRefreshRef = useRef(null);

  const fetchNGOData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await donationService.getNGOInventory();
      setInventory(res.data?.donations || []);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error(err);
    } finally {
      if (!silent) setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNGOData();
  }, []);

  // Auto-refresh every 30 seconds to reflect volunteer status changes
  useEffect(() => {
    autoRefreshRef.current = setInterval(() => {
      fetchNGOData(true);
    }, 30000);
    return () => clearInterval(autoRefreshRef.current);
  }, []);

  const handleManualRefresh = () => {
    setRefreshing(true);
    fetchNGOData(true);
  };

  const handleDistributionSuccess = () => {
    setDistributeTarget(null);
    setSuccessMsg('✅ Distribution recorded successfully! Inventory updated.');
    fetchNGOData(true);
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  const totalKgReceived = inventory.reduce((acc, d) => acc + (d.quantityKg || 0), 0);
  const distributedItems = inventory.filter((d) => d.status === 'DELIVERED');
  const activeItems = inventory.filter((d) => ['PICKED_UP', 'ACCEPTED'].includes(d.status));
  const pendingItems = inventory.filter((d) => d.status === 'PENDING');

  const filteredInventory = (() => {
    if (activeTab === 'active') return [...activeItems, ...pendingItems];
    if (activeTab === 'distributed') return distributedItems;
    return inventory;
  })();

  return (
    <div className="space-y-8">

      {/* NGO Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xl">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold">NGO Distribution Portal</h1>
          <p className="text-purple-100 text-sm mt-1">Manage incoming food rescues, inventory storage, and beneficiary meal distribution records.</p>
        </div>
        <div className="px-4 py-2 rounded-2xl bg-white/20 backdrop-blur-md text-xs font-bold flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-300" />
          <span>Verified NGO Partner</span>
        </div>
      </div>

      {/* Success Toast */}
      {successMsg && (
        <div className="flex items-center space-x-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm font-semibold">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Food Received (Kg)" value={`${totalKgReceived.toFixed(1)} Kg`} icon={Utensils} color="purple" />
        <StatCard title="Items In Transit" value={`${activeItems.length}`} icon={Truck} color="blue" subtitle="Ready to distribute" />
        <StatCard title="Items Distributed" value={`${distributedItems.length}`} icon={PackageCheck} color="emerald" subtitle="Successfully served" />
        <StatCard title="Storage Capacity" value="500 Kg" icon={Building2} color="amber" subtitle="Refrigeration Available" />
      </div>

      {/* Inventory Section */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
            <ClipboardList className="w-5 h-5 text-purple-500" />
            <span>NGO Food Inventory</span>
          </h3>

          <div className="flex items-center space-x-2">
            <span className="text-[10px] text-gray-400 font-mono hidden md:block">
              Updated {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <button
              onClick={handleManualRefresh}
              disabled={refreshing}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-purple-500 hover:bg-purple-500/10 transition-all text-xs font-bold"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-purple-500' : ''}`} />
              <span className="hidden sm:inline">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
            {/* Tabs */}
            <div className="flex items-center p-1 rounded-xl bg-gray-100 dark:bg-gray-800 space-x-1">
            {[
              { key: 'all', label: `All (${inventory.length})` },
              { key: 'active', label: `Active (${activeItems.length + pendingItems.length})` },
              { key: 'distributed', label: `Distributed (${distributedItems.length})` }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === key
                    ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p>Loading inventory...</p>
          </div>
        ) : filteredInventory.length === 0 ? (
          <div className="p-10 rounded-3xl bg-white dark:bg-[#131b2e] border border-gray-200 dark:border-gray-800 text-center">
            <ClipboardList className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 text-sm font-medium">
              {activeTab === 'distributed' ? 'No distributions recorded yet.' : 'No food rescue items claimed yet.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredInventory.map((item) => (
              <InventoryItemCard
                key={item._id}
                item={item}
                onDistribute={setDistributeTarget}
              />
            ))}
          </div>
        )}
      </div>

      {/* Distribution Modal */}
      {distributeTarget && (
        <DistributionModal
          donation={distributeTarget}
          onClose={() => setDistributeTarget(null)}
          onSuccess={handleDistributionSuccess}
        />
      )}
    </div>
  );
};
