import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';    // ← replaces supabase
import { Search, Filter, MoreVertical, Calendar, AlertCircle } from 'lucide-react';

export default function Requests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { fetchRequests(); }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getRequests();
      setRequests(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching requests:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.updateRequestStatus(id, newStatus);
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
      );
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':  return 'bg-green-100 text-green-700 border-green-200';
      case 'pending':    return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'cancelled':  return 'bg-red-100 text-red-700 border-red-200';
      case 'matched':    return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'in_progress':return 'bg-purple-100 text-purple-700 border-purple-200';
      default:           return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const filteredRequests = requests.filter((req) =>
    req.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.service_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Service Requests</h1>
          <p className="text-gray-500 text-sm">Manage and monitor ongoing service bookings</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search requests..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-skill-primary outline-none transition-all w-64 dark:bg-dark-card dark:text-white dark:border-white/10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={fetchRequests}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-dark-card border border-gray-200 dark:border-white/10 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium dark:text-white"
          >
            <Filter size={18} /> Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm flex items-center gap-2">
          <AlertCircle size={16} /> {error} — Make sure the local server is running.
        </div>
      )}

      <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
        {loading ? (
          <div className="p-20 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-skill-primary"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-dark-bg border-b border-gray-100 dark:border-white/5">
                <tr>
                  {['Customer','Service','Date','Status','Worker','Action'].map((h) => (
                    <th key={h} className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50/50 dark:hover:bg-dark-bg/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-800 dark:text-white">{req.customer_name}</p>
                      <p className="text-xs text-gray-400">ID: #{req.id}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300 font-medium">{req.service_type}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar size={14} className="text-gray-400" />
                        {new Date(req.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={req.status}
                        onChange={(e) => handleStatusChange(req.id, e.target.value)}
                        className={`px-3 py-1 rounded-full text-xs font-bold border cursor-pointer ${getStatusStyle(req.status)}`}
                      >
                        {['pending','matched','in_progress','completed','cancelled'].map((s) => (
                          <option key={s} value={s}>{s.toUpperCase()}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400 text-sm italic">
                      {req.assigned_worker || 'Unassigned'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-gray-400 hover:text-gray-600 transition-colors">
                        <MoreVertical size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredRequests.length === 0 && !loading && (
              <div className="p-12 text-center text-gray-500">
                {error ? 'Could not load requests.' : 'No service requests found.'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}