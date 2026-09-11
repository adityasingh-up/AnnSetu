import React from 'react';
import { Clock, MapPin, Sparkles, Utensils, CheckCircle, ShieldAlert, ArrowRight } from 'lucide-react';

export const DonationCard = ({ donation, onAction, actionText = 'Accept Mission', role = 'volunteer' }) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">⏳ Awaiting Volunteer</span>;
      case 'ACCEPTED':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">🚴 Volunteer Assigned</span>;
      case 'PICKED_UP':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-purple-500/10 text-purple-500 border border-purple-500/20">📦 In Transit to NGO</span>;
      case 'DELIVERED':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">✅ Delivered to NGO</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-gray-500/10 text-gray-400">{status}</span>;
    }
  };

  return (
    <div className="bg-white dark:bg-[#131b2e] border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden hover:border-emerald-500/40 transition-all flex flex-col justify-between group">
      
      <div>
        {/* Image & Freshness Overlay */}
        <div className="relative h-48 w-full overflow-hidden">
          <img
            src={donation.imageUrl}
            alt={donation.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 left-3">
            {getStatusBadge(donation.status)}
          </div>
          
          {/* AI Freshness Badge */}
          <div className="absolute top-3 right-3 bg-gray-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-emerald-500/30 flex items-center space-x-1.5">
            <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-emerald-400">{donation.freshnessScore}% Fresh</span>
          </div>
        </div>

        {/* Details */}
        <div className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              {donation.foodCategory?.replace('_', ' ')}
            </span>
            <span className="text-xs text-gray-500 font-medium">
              ~{donation.servingsCount} Meals
            </span>
          </div>

          <h4 className="text-lg font-bold text-gray-900 dark:text-white mt-1 group-hover:text-emerald-500 transition-colors">
            {donation.title}
          </h4>

          <div className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex items-center space-x-2">
              <Utensils className="w-4 h-4 text-gray-400" />
              <span><strong>{donation.quantityKg} Kg</strong> ({donation.foodType})</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-rose-500" />
              <span className="truncate">{donation.pickupLocation?.address}</span>
            </div>

            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>Expires in ~{donation.predictedShelfLifeHours || 6} hours</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-4 bg-gray-50 dark:bg-gray-900/40 border-t border-gray-100 dark:border-gray-800 space-y-2">
        {onAction && donation.status === 'PENDING' && (
          <button
            onClick={() => onAction(donation._id)}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-semibold text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center space-x-2"
          >
            <span>{actionText}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}

        {/* WhatsApp Share & Contact Actions */}
        <div className="flex items-center space-x-2 pt-1">
          {/* Share on WhatsApp */}
          <a
            href={`https://wa.me/?text=${encodeURIComponent(
              `🍱 *AnnSetu Food Rescue Update*\n\n` +
              `• *Item:* ${donation.title}\n` +
              `• *Quantity:* ${donation.quantityKg} Kg (~${donation.servingsCount || Math.round(donation.quantityKg * 4)} meals)\n` +
              `• *Status:* ${donation.status}\n` +
              `• *AI Freshness:* ${donation.freshnessScore}%\n` +
              `• *Location:* ${donation.pickupLocation?.address || 'Connaught Place, New Delhi'}\n\n` +
              `Join us in rescuing food and eradicating hunger! 🌿\n${window.location.origin}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/40 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold transition-all flex items-center justify-center space-x-1.5"
            title="Share this food rescue mission on WhatsApp"
          >
            <span className="text-sm">💬</span>
            <span>Share on WhatsApp</span>
          </a>

          {/* Quick WhatsApp Contact for Volunteer <-> Donor */}
          {role === 'volunteer' && donation.donorId?.phone && (
            <a
              href={`https://wa.me/${String(donation.donorId.phone).replace(/[\s\-\+\(\)]/g, '')}?text=${encodeURIComponent(`Hello ${donation.donorId.name}, I am the AnnSetu volunteer for your donation "${donation.title}". I am on my way for pickup.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-1.5 px-3 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-bold transition-all flex items-center space-x-1"
              title="Chat with Donor on WhatsApp"
            >
              <span>📞 Chat Donor</span>
            </a>
          )}
        </div>
      </div>

    </div>
  );
};
