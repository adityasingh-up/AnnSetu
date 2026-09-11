import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Camera, Upload, Check, User, Phone, Sparkles } from 'lucide-react';

const PRESET_AVATARS = [
  { id: 1, label: 'Hero 1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200' },
  { id: 2, label: 'Hero 2', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200' },
  { id: 3, label: 'Hero 3', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200' },
  { id: 4, label: 'Hero 4', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200' },
  { id: 5, label: 'Hero 5', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200' },
  { id: 6, label: 'Hero 6', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200' },
  { id: 7, label: 'Hero 7', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200' },
  { id: 8, label: 'Hero 8', url: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=200' },
];

export const ProfileModal = ({ isOpen, onClose }) => {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(user?.avatar || PRESET_AVATARS[0].url);
  const [customUrl, setCustomUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen || !user) return null;

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit. Please select a smaller photo.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyCustomUrl = () => {
    if (customUrl.trim()) {
      setAvatar(customUrl.trim());
      setCustomUrl('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');

    try {
      await updateProfile({
        name,
        phone,
        avatar
      });
      setSuccessMsg('Profile picture updated successfully!');
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 1500);
    } catch (err) {
      alert(err.message || 'Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-white dark:bg-[#131b2e] rounded-3xl p-6 shadow-2xl border border-gray-200 dark:border-gray-800 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="relative inline-block mb-3">
            <img
              src={avatar}
              alt="User Avatar"
              className="w-24 h-24 rounded-full object-cover ring-4 ring-emerald-500/50 shadow-xl mx-auto"
            />
            <label
              htmlFor="avatar-file"
              className="absolute bottom-0 right-0 p-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg cursor-pointer transition-transform hover:scale-110"
              title="Upload Custom Photo"
            >
              <Camera className="w-4 h-4" />
            </label>
            <input
              id="avatar-file"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center justify-center space-x-2">
            <span>Edit Profile & Avatar</span>
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 capitalize">
            Role: <span className="font-bold text-emerald-500">{user.role}</span>
          </p>
        </div>

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold text-center flex items-center justify-center space-x-2">
            <Check className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Preset Avatar Selection */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
              Choose Preset Profile Avatar:
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {PRESET_AVATARS.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setAvatar(item.url)}
                  className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all ${
                    avatar === item.url
                      ? 'border-emerald-500 ring-2 ring-emerald-500/50 scale-105'
                      : 'border-transparent opacity-70 hover:opacity-100 hover:scale-95'
                  }`}
                >
                  <img src={item.url} alt={item.label} className="w-full h-full object-cover" />
                  {avatar === item.url && (
                    <div className="absolute inset-0 bg-emerald-600/40 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Upload or Custom URL options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label htmlFor="modal-file-btn" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                Upload from Computer:
              </label>
              <label
                htmlFor="modal-file-btn"
                className="w-full py-2.5 px-3 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs font-semibold text-gray-600 dark:text-gray-300 flex items-center justify-center space-x-2 cursor-pointer hover:border-emerald-500 hover:text-emerald-500 transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>Select Image File</span>
              </label>
              <input
                id="modal-file-btn"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                Or Paste Image Web URL:
              </label>
              <div className="flex space-x-1">
                <input
                  type="url"
                  placeholder="https://..."
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs text-gray-900 dark:text-white outline-none"
                />
                <button
                  type="button"
                  onClick={handleApplyCustomUrl}
                  className="px-3 py-2 bg-gray-200 dark:bg-gray-800 hover:bg-emerald-600 hover:text-white text-xs font-bold rounded-xl transition-colors shrink-0"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>

          {/* Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 flex items-center space-x-1">
                <User className="w-3.5 h-3.5" />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs text-gray-900 dark:text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 flex items-center space-x-1">
                <Phone className="w-3.5 h-3.5" />
                <span>Phone Number</span>
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs text-gray-900 dark:text-white outline-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all flex items-center space-x-2"
            >
              {saving ? (
                <span>Saving Profile...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Save Avatar & Details</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
