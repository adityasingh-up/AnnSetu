import React, { useState, useEffect } from 'react';
import { StatCard } from '../components/StatCard';
import { MapView } from '../components/MapView';
import { OTPModal } from '../components/OTPModal';
import { donationService } from '../services/donationService';
import { useGeoLocation } from '../hooks/useGeoLocation';
import {
  MapPin, Award, CheckCircle, Navigation, Truck, ClipboardList,
  AlertCircle, CheckCircle2, X, Camera, Package, Clock, Scale, Utensils
} from 'lucide-react';

// Status badge
const StatusBadge = ({ status }) => {
  const cfg = {
    ACCEPTED: { color: 'text-blue-500 bg-blue-500/10 border-blue-500/20', label: '🚀 Accepted' },
    PICKED_UP: { color: 'text-purple-500 bg-purple-500/10 border-purple-500/20', label: '📦 In Transit' },
    DELIVERED: { color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', label: '✅ Delivered' }
  };
  const s = cfg[status] || { color: 'text-gray-500 bg-gray-500/10 border-gray-500/20', label: status };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${s.color}`}>{s.label}</span>
  );
};

// Delivery Confirmation Modal
const DeliveryModal = ({ mission, onClose, onSuccess }) => {
  const [proofUrl, setProofUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await donationService.completeDelivery(mission._id, proofUrl || undefined);
      onSuccess();
    } catch (err) {
      setError(err.message || 'Delivery confirmation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-[#131b2e] rounded-3xl p-6 shadow-2xl border border-gray-200 dark:border-gray-800 animate-fadeIn">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Confirm Delivery</h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">Mark mission as completed</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mb-5 p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800">
          <p className="text-sm font-bold text-gray-900 dark:text-white">{mission.title}</p>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{mission.pickupLocation?.address}</p>
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
              Proof Photo URL (Optional)
            </label>
            <div className="relative">
              <Camera className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="url"
                value={proofUrl}
                onChange={(e) => setProofUrl(e.target.value)}
                placeholder="https://... (image URL of delivery proof)"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>
            <p className="text-[10px] text-gray-400 mt-1">Take a photo and paste the URL here as delivery proof.</p>
          </div>

          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold flex items-center space-x-2">
            <Award className="w-4 h-4 shrink-0" />
            <span>You will earn +50 Badge Points on delivery confirmation!</span>
          </div>

          <div className="flex space-x-3">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-semibold text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center space-x-2">
              {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Delivery</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Mission card for active missions
const MissionCard = ({ mission, onConfirmDelivery, onOpenOTP }) => {
  const canConfirm = mission.status === 'PICKED_UP';
  const needsOTP = mission.status === 'ACCEPTED';
  const isDelivered = mission.status === 'DELIVERED';

  return (
    <div className={`rounded-2xl border bg-white dark:bg-[#131b2e] shadow-sm overflow-hidden transition-all ${
      canConfirm ? 'border-purple-400/40' : 'border-gray-200 dark:border-gray-800'
    }`}>
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">{mission.title}</h4>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">{mission.pickupLocation?.address}</p>
          </div>
          <StatusBadge status={mission.status} />
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center space-x-1"><Scale className="w-3.5 h-3.5" /><span className="font-semibold">{mission.quantityKg} Kg</span></span>
          <span className="flex items-center space-x-1"><Utensils className="w-3.5 h-3.5" /><span>{mission.foodType}</span></span>
          <span className="flex items-center space-x-1 capitalize"><Package className="w-3.5 h-3.5" /><span>{mission.foodCategory?.replace('_', ' ')}</span></span>
        </div>

        {isDelivered ? (
          <div className="py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-bold text-xs flex items-center justify-center space-x-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Delivery Completed — +50 pts earned!</span>
          </div>
        ) : (
          <div className="flex space-x-2">
            {needsOTP && (
              <button
                onClick={() => onOpenOTP(mission._id)}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2"
              >
                <Truck className="w-4 h-4" />
                <span>Enter Pickup OTP</span>
              </button>
            )}
            {canConfirm && (
              <button
                onClick={() => onConfirmDelivery(mission)}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center space-x-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Delivery</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export const VolunteerDashboard = () => {
  const [nearbyDonations, setNearbyDonations] = useState([]);
  const [myMissions, setMyMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [missionsLoading, setMissionsLoading] = useState(true);
  const [selectedDonationId, setSelectedDonationId] = useState(null);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [deliveryTarget, setDeliveryTarget] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const location = useGeoLocation();

  const fetchNearby = async () => {
    try {
      const res = await donationService.getNearbyDonations({
        lat: location.lat,
        lng: location.lng,
        distance: 25
      });
      setNearbyDonations(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyMissions = async () => {
    try {
      const res = await donationService.getMyVolunteerMissions();
      setMyMissions(res.data?.missions || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setMissionsLoading(false);
    }
  };

  useEffect(() => {
    if (location.loaded) fetchNearby();
  }, [location.loaded]);

  useEffect(() => {
    fetchMyMissions();
  }, []);

  const handleAcceptMission = async (donationId) => {
    try {
      await donationService.acceptRescueMission(donationId);
      setSuccessMsg('🚀 Mission Accepted! Proceed to donor pickup location.');
      setSelectedDonationId(donationId);
      setIsOtpModalOpen(true);
      fetchNearby();
      fetchMyMissions();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      alert(err.message || 'Error accepting mission');
    }
  };

  const handleVerifyOTP = async (otp) => {
    try {
      await donationService.verifyPickupOTP(selectedDonationId, otp);
      setSuccessMsg('📦 OTP Verified! Food picked up successfully. Now proceed to NGO for delivery.');
      setIsOtpModalOpen(false);
      fetchMyMissions();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      alert(err.message || 'Verification failed');
    }
  };

  const handleDeliverySuccess = () => {
    setDeliveryTarget(null);
    setSuccessMsg('🏆 Delivery Confirmed! +50 Badge Points added to your profile!');
    fetchMyMissions();
    fetchNearby();
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  const markers = nearbyDonations.map((d) => ({
    position: [d.pickupLocation?.coordinates[1] || 28.6139, d.pickupLocation?.coordinates[0] || 77.2090],
    title: d.title,
    address: d.pickupLocation?.address,
    quantityKg: d.quantityKg
  }));

  const activeMissions = myMissions.filter((m) => ['ACCEPTED', 'PICKED_UP'].includes(m.status));
  const completedMissions = myMissions.filter((m) => m.status === 'DELIVERED');

  const totalPts = completedMissions.length * 50;
  const currentLevel = Math.floor(totalPts / 150) + 1;
  const ptsInCurrentLevel = totalPts % 150;
  const levelProgress = Math.min(100, Math.round((ptsInCurrentLevel / 150) * 100));

  return (
    <div className="space-y-8">

      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
          <Truck className="w-48 h-48 text-white" />
        </div>

        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[11px] font-bold uppercase tracking-wider mb-1">
            <Award className="w-3.5 h-3.5 text-amber-300" />
            <span>Volunteer Hero Radar</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">Geospatial Rescue Mission Control</h1>
          <p className="text-blue-100 text-xs sm:text-sm max-w-xl">
            Accept nearby surplus food rescue tasks, verify handover with OTP, and deliver meals to local shelters.
          </p>
        </div>

        {/* Gamified Hero Level Card */}
        <div className="p-4 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 min-w-[240px] space-y-2 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center font-black text-xs shadow-md">
                Lvl {currentLevel}
              </div>
              <div>
                <div className="text-xs font-bold text-white">Hero Rank: {currentLevel === 1 ? 'Bronze Scout' : currentLevel === 2 ? 'Silver Courier' : 'Gold Guardian'}</div>
                <div className="text-[10px] text-blue-200 font-mono">{totalPts} Total Badge Points</div>
              </div>
            </div>
          </div>
          <div className="w-full bg-black/30 rounded-full h-2 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-400 to-emerald-400 h-full rounded-full transition-all duration-500" style={{ width: `${levelProgress}%` }}></div>
          </div>
          <div className="flex justify-between text-[9px] text-blue-200 font-mono">
            <span>{ptsInCurrentLevel} / 150 pts</span>
            <span>Next Level</span>
          </div>
        </div>
      </div>

      {/* Success Toast */}
      {successMsg && (
        <div className="flex items-center space-x-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm font-semibold animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Nearby Active Tasks" value={`${nearbyDonations.length}`} icon={MapPin} color="blue" subtitle="Within 25 Km radius" />
        <StatCard title="Active Missions" value={`${activeMissions.length}`} icon={Truck} color="purple" subtitle="In progress delivery" />
        <StatCard title="Missions Completed" value={`${completedMissions.length}`} icon={CheckCircle} color="emerald" subtitle="Successfully delivered" />
        <StatCard title="Badge Points" value={`${totalPts} pts`} icon={Award} color="amber" subtitle="+50 pts per delivery" />
      </div>

      {/* Active Missions Section */}
      {!missionsLoading && activeMissions.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <Truck className="w-5 h-5 text-purple-500 animate-pulse" />
            <span>My Active Missions</span>
            <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-500 text-xs font-bold border border-purple-500/20">
              {activeMissions.length} ongoing
            </span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {activeMissions.map((mission) => (
              <MissionCard
                key={mission._id}
                mission={mission}
                onConfirmDelivery={setDeliveryTarget}
                onOpenOTP={(id) => { setSelectedDonationId(id); setIsOtpModalOpen(true); }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Radar Map */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
          <Navigation className="w-5 h-5 text-blue-500" />
          <span>Real-Time Geospatial Rescue Map</span>
        </h3>
        <MapView center={[location.lat, location.lng]} markers={markers} height="360px" />
      </div>

      {/* Nearby Unassigned Rescues */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
          <MapPin className="w-5 h-5 text-blue-500" />
          <span>Nearby Unassigned Rescues</span>
        </h3>
        {loading ? (
          <div className="text-center py-12 text-gray-400">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p>Scanning radar...</p>
          </div>
        ) : nearbyDonations.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white dark:bg-[#131b2e] border border-gray-200 dark:border-gray-800 text-center">
            <MapPin className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 text-sm font-medium">No unassigned food rescue requests near your location right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {nearbyDonations.map((item) => (
              <div key={item._id} className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#131b2e] p-4 shadow-sm space-y-3">
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">{item.title}</h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{item.pickupLocation?.address}</p>
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center space-x-1"><Scale className="w-3.5 h-3.5" /><span>{item.quantityKg} Kg</span></span>
                  <span className="flex items-center space-x-1"><Clock className="w-3.5 h-3.5" /><span>{new Date(item.expiryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></span>
                </div>
                <button
                  onClick={() => handleAcceptMission(item._id)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2"
                >
                  <Truck className="w-4 h-4" />
                  <span>Accept Rescue Mission</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed Missions */}
      {!missionsLoading && completedMissions.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <ClipboardList className="w-5 h-5 text-emerald-500" />
            <span>Completed Missions</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {completedMissions.map((mission) => (
              <MissionCard
                key={mission._id}
                mission={mission}
                onConfirmDelivery={setDeliveryTarget}
                onOpenOTP={(id) => { setSelectedDonationId(id); setIsOtpModalOpen(true); }}
              />
            ))}
          </div>
        </div>
      )}

      {/* OTP Handover Modal */}
      <OTPModal
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        onVerify={handleVerifyOTP}
        title="Donor Pickup Handover OTP"
      />

      {/* Delivery Confirmation Modal */}
      {deliveryTarget && (
        <DeliveryModal
          mission={deliveryTarget}
          onClose={() => setDeliveryTarget(null)}
          onSuccess={handleDeliverySuccess}
        />
      )}
    </div>
  );
};
