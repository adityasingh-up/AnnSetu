import React, { useState, useEffect } from 'react';
import { StatCard } from '../components/StatCard';
import { adminService } from '../services/adminService';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line } from 'recharts';
import {
  Shield, Users, FileText, Download, UserCheck, UserX,
  Sparkles, Utensils, MessageSquareWarning, CheckCircle2, XCircle, Clock
} from 'lucide-react';

// Sample complaint data (local state — UI mockup matching block diagram)
const SAMPLE_COMPLAINTS = [
  { id: 'c001', from: 'Ramesh Kumar (donor)', against: 'Volunteer #V-042', type: 'Late Pickup', description: 'Volunteer arrived 3 hours late for pickup. Food quality may have degraded.', status: 'pending', createdAt: '2026-08-16T08:30:00Z' },
  { id: 'c002', from: 'Aryan NGO', against: 'Donor Priya Sharma', type: 'Quantity Mismatch', description: 'Donation listed 50 Kg but only 30 Kg was received at NGO.', status: 'pending', createdAt: '2026-08-15T14:20:00Z' },
  { id: 'c003', from: 'Sunita (volunteer)', against: 'NGO Aasha Foundation', type: 'Refused Delivery', description: 'NGO representative refused to accept the food delivery without explanation.', status: 'resolved', createdAt: '2026-08-14T11:00:00Z' },
  { id: 'c004', from: 'Mohan (donor)', against: 'Volunteer #V-019', type: 'No OTP Verification', description: 'Volunteer collected food without proper OTP handover verification.', status: 'dismissed', createdAt: '2026-08-13T09:45:00Z' },
  { id: 'c005', from: 'Hope NGO', against: 'Donor Cafe Royal', type: 'Food Quality Issue', description: 'Received food was past expiry and not safe to distribute to beneficiaries.', status: 'pending', createdAt: '2026-08-17T07:15:00Z' }
];

const ComplaintStatusBadge = ({ status }) => {
  const cfg = {
    pending: { color: 'text-amber-500 bg-amber-500/10 border-amber-500/20', label: '⏳ Pending' },
    resolved: { color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', label: '✅ Resolved' },
    dismissed: { color: 'text-gray-500 bg-gray-500/10 border-gray-500/20', label: '❌ Dismissed' }
  };
  const s = cfg[status] || cfg.pending;
  return <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${s.color}`}>{s.label}</span>;
};

export const AdminDashboard = () => {
  const [metrics, setMetrics] = useState({
    totalDonations: 142,
    deliveredCount: 128,
    totalKg: 3450,
    co2SavedKg: 8625
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [complaints, setComplaints] = useState(SAMPLE_COMPLAINTS);
  const [complaintFilter, setComplaintFilter] = useState('all');

  // Recharts Chart Data
  const chartData = [
    { day: 'Mon', kgRescued: 320, mealsServed: 1280 },
    { day: 'Tue', kgRescued: 410, mealsServed: 1640 },
    { day: 'Wed', kgRescued: 290, mealsServed: 1160 },
    { day: 'Thu', kgRescued: 480, mealsServed: 1920 },
    { day: 'Fri', kgRescued: 650, mealsServed: 2600 },
    { day: 'Sat', kgRescued: 820, mealsServed: 3280 },
    { day: 'Sun', kgRescued: 740, mealsServed: 2960 },
  ];

  const fetchAdminData = async () => {
    try {
      const [analyticsRes, usersRes] = await Promise.all([
        adminService.getAnalytics(),
        adminService.getUsers()
      ]);
      if (analyticsRes.data?.metrics) {
        setMetrics(analyticsRes.data.metrics);
      }
      if (usersRes.data?.users) {
        setUsers(usersRes.data.users);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleUser = async (userId) => {
    try {
      await adminService.toggleUserStatus(userId);
      fetchAdminData();
    } catch (err) {
      alert('Error updating user status');
    }
  };

  const handleComplaintAction = (id, newStatus) => {
    setComplaints((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    );
  };

  const filteredComplaints = complaintFilter === 'all'
    ? complaints
    : complaints.filter((c) => c.status === complaintFilter);

  const pendingCount = complaints.filter((c) => c.status === 'pending').length;

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-gray-900 via-slate-800 to-slate-900 text-white shadow-xl border border-gray-800">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold flex items-center space-x-3">
            <Shield className="w-8 h-8 text-emerald-400" />
            <span>Admin Master Control Center</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">Platform governance, user management, complaint handling, and report exports.</p>
        </div>

        {/* Report Export Buttons */}
        <div className="flex items-center space-x-3">
          <a
            href={adminService.getPDFReportUrl()}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export PDF</span>
          </a>
          <a
            href={adminService.getExcelReportUrl()}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export Excel</span>
          </a>
        </div>
      </div>

      {/* Analytics Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Food Rescued" value={`${metrics.totalKg || 3450} Kg`} icon={Utensils} color="emerald" />
        <StatCard title="Successful Rescues" value={`${metrics.deliveredCount || 128}`} icon={UserCheck} color="blue" />
        <StatCard title="CO2 Offset" value={`${metrics.co2SavedKg || 8625} Kg`} icon={Sparkles} color="amber" />
        <StatCard title="Registered Users" value={`${users.length || 24}`} icon={Users} color="purple" />
      </div>

      {/* Recharts Graphical Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Weekly Wastage Reduction Chart */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#131b2e] border border-gray-200 dark:border-gray-800 shadow-sm">
          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Weekly Rescued Food Volume (Kg)</h4>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                <XAxis dataKey="day" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '12px', color: '#fff' }} />
                <Bar dataKey="kgRescued" fill="#16a34a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Meals Served Trend Chart */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#131b2e] border border-gray-200 dark:border-gray-800 shadow-sm">
          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Meals Distributed Trend</h4>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                <XAxis dataKey="day" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '12px', color: '#fff' }} />
                <Line type="monotone" dataKey="mealsServed" stroke="#3b82f6" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* User Governance Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#131b2e] border border-gray-200 dark:border-gray-800 shadow-sm">
        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">User Management & Status Control</h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-100 dark:bg-gray-800/60 uppercase tracking-wider text-gray-500 dark:text-gray-400">
              <tr>
                <th className="p-3">User</th>
                <th className="p-3">Role</th>
                <th className="p-3">Email</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40">
                  <td className="p-3 font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                    <img src={u.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                    <span>{u.name}</span>
                  </td>
                  <td className="p-3 font-semibold uppercase text-emerald-500">{u.role}</td>
                  <td className="p-3 text-gray-400">{u.email}</td>
                  <td className="p-3 text-gray-400">{u.phone}</td>
                  <td className="p-3">
                    {u.isActive ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-bold">Active</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 font-bold">Blocked</span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleToggleUser(u._id)}
                      className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                        u.isActive
                          ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white'
                          : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white'
                      }`}
                    >
                      {u.isActive ? 'Block' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== COMPLAINT MANAGEMENT SECTION ===== */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#131b2e] border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
              <MessageSquareWarning className="w-5 h-5 text-rose-500" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                <span>Complaint Management</span>
                {pendingCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 text-xs font-bold border border-rose-500/20">
                    {pendingCount} pending
                  </span>
                )}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">Review, resolve or dismiss platform complaints</p>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center p-1 rounded-xl bg-gray-100 dark:bg-gray-800 space-x-1">
            {[
              { key: 'all', label: `All (${complaints.length})` },
              { key: 'pending', label: `Pending (${complaints.filter(c => c.status === 'pending').length})` },
              { key: 'resolved', label: 'Resolved' },
              { key: 'dismissed', label: 'Dismissed' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setComplaintFilter(key)}
                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                  complaintFilter === key
                    ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Complaints List */}
        <div className="space-y-3">
          {filteredComplaints.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              <MessageSquareWarning className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p>No complaints in this category.</p>
            </div>
          ) : (
            filteredComplaints.map((complaint) => (
              <div
                key={complaint.id}
                className={`p-4 rounded-2xl border transition-all ${
                  complaint.status === 'pending'
                    ? 'border-rose-400/30 bg-rose-500/5 dark:bg-rose-900/5'
                    : 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/30'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span className="px-2 py-0.5 rounded-lg bg-rose-500/10 text-rose-500 text-[10px] font-bold">
                        {complaint.type}
                      </span>
                      <ComplaintStatusBadge status={complaint.status} />
                    </div>
                    <p className="text-xs font-semibold text-gray-900 dark:text-white">
                      <span className="text-gray-500 dark:text-gray-400 font-normal">From: </span>{complaint.from}
                      <span className="text-gray-400 mx-1">vs</span>{complaint.against}
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">{complaint.description}</p>
                    <p className="text-[10px] text-gray-400">
                      Filed: {new Date(complaint.createdAt).toLocaleString()}
                    </p>
                  </div>

                  {complaint.status === 'pending' && (
                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => handleComplaintAction(complaint.id, 'resolved')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white text-xs font-bold transition-colors flex items-center space-x-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Resolve</span>
                      </button>
                      <button
                        onClick={() => handleComplaintAction(complaint.id, 'dismissed')}
                        className="px-3 py-1.5 rounded-lg bg-gray-500/10 text-gray-500 hover:bg-gray-500 hover:text-white text-xs font-bold transition-colors flex items-center space-x-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Dismiss</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};
