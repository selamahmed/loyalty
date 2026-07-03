import React, { useState, useEffect, useCallback } from 'react';
import { activityLogService, ActivityLog } from '../../lib/activityLogger';
import { Search, Download, Filter, Eye, MapPin, Smartphone, Monitor, Globe, Shield, AlertTriangle, Clock, User, Wifi, Trash2, Ban, Unlock, Mail, Send } from 'lucide-react';
import AdminLayout from './AdminLayout';
import { useRealtimeTable } from '../../hooks/useRealtime';
import { suspendUser, broadcastNotification } from '../../services/admin';
import { useAuth } from '../../context/AuthContext';

const AdminAuditLogs: React.FC = () => {
  const { authUser } = useAuth();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<ActivityLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [filterRisk, setFilterRisk] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);
  const [feedback, setFeedback] = useState('');

  const actionTypes = [
    'login', 'logout', 'points_earned', 'points_spent', 'purchase',
    'achievement', 'mission', 'qr_scan', 'profile_update', 'settings_change',
    'admin_action', 'security_alert', 'password_change', 'account_suspended', 'account_deleted'
  ];

  const loadLogs = useCallback(async () => {
    try {
      setLoading(true);
      let data: ActivityLog[];

      if (filterAction === 'admin_action') {
        data = await activityLogService.getAdminLogs(500);
      } else {
        data = await activityLogService.getActivityLogs(undefined, undefined, 500);
      }

      setLogs(data);
    } catch (error) {
      console.error('Failed to load logs:', error);
    } finally {
      setLoading(false);
    }
  }, [filterAction]);

  useEffect(() => { loadLogs(); }, [loadLogs]);

  useEffect(() => { filterLogs(); }, [logs, searchQuery, filterAction, filterRisk]); // eslint-disable-line react-hooks/exhaustive-deps

  /* realtime: auto-refresh when new activity_logs arrive */
  useRealtimeTable('activity_logs', loadLogs);

  const filterLogs = () => {
    let filtered = logs;

    if (searchQuery) {
      filtered = filtered.filter(log =>
        log.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.ip_address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.device_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.country?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterAction !== 'all') {
      filtered = filtered.filter(log => log.action_type === filterAction);
    }

    if (filterRisk !== 'all') {
      filtered = filtered.filter(log => log.risk_level === filterRisk);
    }

    setFilteredLogs(filtered);
  };

  const getActionColor = (actionType: string) => {
    const colors: Record<string, string> = {
      login: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
      logout: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
      points_earned: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
      points_spent: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
      purchase: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
      achievement: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
      mission: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400',
      qr_scan: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400',
      admin_action: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400',
      security_alert: 'bg-red-200 dark:bg-red-900/50 text-red-800 dark:text-red-300',
      password_change: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
      account_suspended: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
      account_deleted: 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300',
    };
    return colors[actionType] || 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400';
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      super_admin: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-700',
      admin: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-700',
      moderator: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border border-yellow-300 dark:border-yellow-700',
      user: 'bg-gray-50 dark:bg-gray-900/20 text-gray-700 dark:text-gray-400',
    };
    return colors[role] || 'bg-gray-50 dark:bg-gray-900/20 text-gray-700 dark:text-gray-400';
  };

  const getRiskBadge = (risk?: string) => {
    if (!risk) return null;
    const colors: Record<string, string> = {
      low: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
      medium: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
      high: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    };
    return colors[risk] || '';
  };

  const exportLogs = () => {
    const csv = [
      ['Date', 'Username', 'Email', 'Role', 'Action', 'Action Type', 'IP Address', 'Device Name', 'Device Type', 'Browser', 'OS', 'Country', 'City', 'Region', 'ISP', 'Timezone', 'Amount', 'Risk Level', 'Session ID', 'User Agent'],
      ...filteredLogs.map(log => [
        log.created_at,
        log.username,
        log.email,
        log.role,
        log.action,
        log.action_type,
        log.ip_address || 'N/A',
        log.device_name || 'N/A',
        log.device_type || 'N/A',
        log.browser || 'N/A',
        log.os || 'N/A',
        log.country  || 'N/A',
        log.city     || 'N/A',
        log.region   || 'N/A',
        log.isp      || 'N/A',
        log.timezone || 'N/A',
        log.amount   || '',
        log.risk_level || 'N/A',
        log.device_name || 'N/A',
        `${log.browser || ''} / ${log.os || ''}`,
      ]),
    ]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const toast = (message: string) => {
    setFeedback(message);
    window.setTimeout(() => setFeedback(''), 3500);
  };

  const closeDetail = () => {
    setShowDetail(false);
    setSelectedLog(null);
  };

  const contactSelectedUser = () => {
    if (!selectedLog?.email) {
      toast('No email is available for this log.');
      return;
    }

    const subject = encodeURIComponent('NesveNext account security');
    const body = encodeURIComponent(
      `Hello ${selectedLog.username || 'there'},\n\nWe are contacting you about recent account activity on NesveNext.\n\nActivity: ${selectedLog.action}\nTime: ${new Date(selectedLog.created_at).toLocaleString()}\n\nThank you,\nNesveNext Team`,
    );
    window.location.href = `mailto:${selectedLog.email}?subject=${subject}&body=${body}`;
  };

  const suspendSelectedUser = async () => {
    if (!selectedLog?.user_id) {
      toast('No user is linked to this activity log.');
      return;
    }
    if (authUser?.id === selectedLog.user_id) {
      toast('You cannot suspend your own account from audit logs.');
      return;
    }
    const confirmed = window.confirm(`Suspend ${selectedLog.username || selectedLog.email || 'this user'}?`);
    if (!confirmed) return;

    setActionBusy(true);
    try {
      await suspendUser(selectedLog.user_id);
      await broadcastNotification({
        type: 'system',
        title: 'Hesap Askıya Alındı',
        message: 'Hesabınız güvenlik incelemesi nedeniyle geçici olarak askıya alındı. Destek ekibiyle iletişime geçebilirsiniz.',
        icon: '⏸️',
        userIds: [selectedLog.user_id],
      }).catch(() => {});

      if (authUser) {
        void activityLogService.logActivity({
          userId: authUser.id,
          username: authUser.username ?? authUser.name ?? authUser.email,
          email: authUser.email,
          role: authUser.role,
          action: `Audit log üzerinden kullanıcı askıya alındı: ${selectedLog.username || selectedLog.email}`,
          actionType: 'account_suspended',
          riskLevel: 'high',
          details: {
            targetUserId: selectedLog.user_id,
            targetEmail: selectedLog.email,
            sourceLogId: selectedLog.id,
            sourceAction: selectedLog.action,
          },
        });
      }

      setLogs(prev => prev.map(log => (
        log.user_id === selectedLog.user_id
          ? { ...log, details: { ...(log.details ?? {}), accountStatusAction: 'suspended' } }
          : log
      )));
      toast('User suspended successfully.');
      closeDetail();
    } catch (error) {
      toast(error instanceof Error ? error.message : 'User could not be suspended.');
    } finally {
      setActionBusy(false);
    }
  };

  const stats = {
    total: logs.length,
    today: logs.filter(l => new Date(l.created_at) > new Date(Date.now() - 86400000)).length,
    highRisk: logs.filter(l => l.risk_level === 'high').length,
    uniqueUsers: new Set(logs.map(l => l.user_id)).size,
  };

  if (loading) {
    return (
      <div className="p-3 sm:p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#7B6EF6] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="font-bold text-gray-600 dark:text-gray-400">Loading logs...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      {feedback && (
        <div className="fixed top-4 right-4 z-[9999] max-w-sm rounded-2xl border-2 border-black bg-[#7B6EF6] px-4 py-3 text-sm font-black text-white shadow-xl">
          {feedback}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 dark:text-white flex items-center gap-2 sm:gap-3">
            <Shield className="text-[#7B6EF6] flex-shrink-0" size={24} />
            Security & Activity Logs
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Complete user activity monitoring and security audit trail</p>
        </div>
        <div className="flex gap-3 flex-shrink-0">
          <button
            onClick={exportLogs}
            className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-[#7B6EF6] dark:bg-[#4F8EF7] text-white font-bold rounded-2xl border-2 border-black hover:shadow-lg transition-all text-sm sm:text-base"
          >
            <Download size={18} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30">
              <Clock size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.total}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Total Events</p>
            </div>
          </div>
        </div>
        <div className="card p-4 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-green-100 dark:bg-green-900/30">
              <User size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.uniqueUsers}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Unique Users</p>
            </div>
          </div>
        </div>
        <div className="card p-4 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/30">
              <Globe size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.today}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Last 24 Hours</p>
            </div>
          </div>
        </div>
        <div className="card p-4 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-100 dark:bg-red-900/30">
              <AlertTriangle size={20} className="text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-black text-red-600 dark:text-red-400">{stats.highRisk}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">High Risk Events</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by username, email, IP, device, city, country..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl border-2 border-black dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500"
          />
        </div>

        {/* Action Filter */}
        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="px-4 py-3 rounded-2xl border-2 border-black dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold"
        >
          <option value="all">All Actions</option>
          {actionTypes.map(type => (
            <option key={type} value={type}>{type.replace('_', ' ').toUpperCase()}</option>
          ))}
        </select>

        {/* Risk Filter */}
        <select
          value={filterRisk}
          onChange={(e) => setFilterRisk(e.target.value)}
          className="px-4 py-3 rounded-2xl border-2 border-black dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold"
        >
          <option value="all">All Risk Levels</option>
          <option value="low">Low Risk</option>
          <option value="medium">Medium Risk</option>
          <option value="high">High Risk</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="card bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b-2 border-black dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <th className="text-left py-2 px-2 font-black text-gray-900 dark:text-white text-xs">Date & Time</th>
                <th className="text-left py-2 px-2 font-black text-gray-900 dark:text-white text-xs">User</th>
                <th className="text-left py-2 px-2 font-black text-gray-900 dark:text-white text-xs">Action</th>
                <th className="text-left py-2 px-2 font-black text-gray-900 dark:text-white text-xs hidden lg:table-cell">Device</th>
                <th className="text-left py-2 px-2 font-black text-gray-900 dark:text-white text-xs hidden md:table-cell">Location</th>
                <th className="text-left py-2 px-2 font-black text-gray-900 dark:text-white text-xs">IP</th>
                <th className="text-left py-2 px-2 font-black text-gray-900 dark:text-white text-xs">Risk</th>
                <th className="text-left py-2 px-2 font-black text-gray-900 dark:text-white text-xs"></th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log, idx) => (
                <tr key={log.id || idx} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="py-2 px-2">
                    <div className="flex flex-col">
                      <span className="text-xs font-mono text-gray-900 dark:text-white whitespace-nowrap">
                        {new Date(log.created_at).toLocaleDateString()}
                      </span>
                      <span className="text-xs font-mono text-gray-400">
                        {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </td>
                  <td className="py-2 px-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#7B6EF6] to-[#4F8EF7] flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                        {log.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 dark:text-white text-xs truncate max-w-[90px]">{log.username}</p>
                        <p className="text-xs text-gray-400 truncate max-w-[90px] hidden sm:block">{log.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-2 px-2">
                    <div className="flex flex-col gap-0.5">
                      <span className={`px-1.5 py-0.5 rounded text-xs font-bold w-fit whitespace-nowrap ${getActionColor(log.action_type)}`}>
                        {log.action_type.replace(/_/g, ' ').toUpperCase()}
                      </span>
                      {log.amount && (
                        <span className="text-xs font-bold text-amber-600 dark:text-amber-400">+{log.amount} pts</span>
                      )}
                    </div>
                  </td>
                  <td className="py-2 px-2 hidden lg:table-cell">
                    <div className="flex items-center gap-1">
                      {log.device_type === 'mobile' ? <Smartphone size={12} className="text-gray-400 flex-shrink-0" /> : <Monitor size={12} className="text-gray-400 flex-shrink-0" />}
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-900 dark:text-white truncate max-w-[100px]">{log.device_name || 'Unknown'}</p>
                        <p className="text-xs text-gray-400 truncate max-w-[100px]">{log.browser}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-2 px-2 hidden md:table-cell">
                    <div className="min-w-0">
                      <p className="text-xs text-gray-900 dark:text-white truncate max-w-[110px]">{log.city || '?'}, {log.country || '?'}</p>
                      <p className="text-xs text-gray-400 truncate max-w-[110px]">{log.timezone || log.region || '—'}</p>
                    </div>
                  </td>
                  <td className="py-2 px-2">
                    <code className="text-xs bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded font-mono whitespace-nowrap">
                      {log.ip_address || 'N/A'}
                    </code>
                  </td>
                  <td className="py-2 px-2">
                    {log.risk_level && (
                      <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-0.5 w-fit ${getRiskBadge(log.risk_level)}`}>
                        {log.risk_level === 'high' && <AlertTriangle size={10} />}
                        {log.risk_level.toUpperCase()}
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-2">
                    <button
                      onClick={() => {
                        setSelectedLog(log);
                        setShowDetail(true);
                      }}
                      className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition-colors"
                    >
                      <Eye size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="text-center py-12">
            <Search size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-600 dark:text-gray-400 font-bold">No logs found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetail && selectedLog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-3xl border-2 border-black dark:border-gray-700 p-4 sm:p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg sm:text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2 sm:gap-3">
                {selectedLog.risk_level === 'high' ? (
                  <AlertTriangle className="text-red-500 flex-shrink-0" size={22} />
                ) : (
                  <Shield className="text-[#7B6EF6] flex-shrink-0" size={22} />
                )}
                Activity Details
              </h2>
              <button onClick={closeDetail} className="text-2xl text-gray-400 hover:text-gray-600 flex-shrink-0">&times;</button>
            </div>

            {/* Risk Alert */}
            {selectedLog.risk_level === 'high' && (
              <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                  <AlertTriangle size={20} />
                  <span className="font-bold">High Risk Activity Detected</span>
                </div>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">This activity was flagged as suspicious. Review the details below.</p>
              </div>
            )}

            {/* User Info Section */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-4 space-y-4">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <User size={18} />
                User Information
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Username</p>
                  <p className="font-bold text-gray-900 dark:text-white">{selectedLog.username}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="font-bold text-gray-900 dark:text-white text-sm">{selectedLog.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Role</p>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${getRoleColor(selectedLog.role)}`}>
                    {selectedLog.role.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500">User ID</p>
                  <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{selectedLog.user_id}</code>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Log ID</p>
                  <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{selectedLog.id.slice(0, 8)}…</code>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Date & Time</p>
                  <p className="font-bold text-gray-900 dark:text-white text-sm">
                    {new Date(selectedLog.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Device Info Section */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-4 space-y-4">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                {selectedLog.device_type === 'mobile' ? <Smartphone size={18} /> : <Monitor size={18} />}
                Device Information
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Device Name</p>
                  <p className="font-bold text-gray-900 dark:text-white">{selectedLog.device_name || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Device Type</p>
                  <p className="font-bold text-gray-900 dark:text-white capitalize">{selectedLog.device_type || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Browser</p>
                  <p className="font-bold text-gray-900 dark:text-white">{selectedLog.browser || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Operating System</p>
                  <p className="font-bold text-gray-900 dark:text-white">{selectedLog.os || 'Unknown'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500">ISP / Network</p>
                  <p className="font-mono text-xs text-gray-600 dark:text-gray-400 break-all">
                    {selectedLog.isp || 'Unknown'}
                  </p>
                </div>
              </div>
            </div>

            {/* Location Info Section */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-4 space-y-4">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Globe size={18} />
                Location & Network
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Country</p>
                  <p className="font-bold text-gray-900 dark:text-white">{selectedLog.country || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">City</p>
                  <p className="font-bold text-gray-900 dark:text-white">{selectedLog.city || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Region</p>
                  <p className="font-bold text-gray-900 dark:text-white">{selectedLog.region || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">IP Address</p>
                  <code className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-mono">{selectedLog.ip_address || 'N/A'}</code>
                </div>
                <div>
                  <p className="text-xs text-gray-500">ISP</p>
                  <p className="font-bold text-gray-900 dark:text-white">{selectedLog.isp || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Timezone</p>
                  <p className="font-bold text-gray-900 dark:text-white">{selectedLog.timezone || 'Unknown'}</p>
                </div>
              </div>
            </div>

            {/* Action Details */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-4 space-y-4">
              <h3 className="font-bold text-gray-900 dark:text-white">Action Details</h3>
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${getActionColor(selectedLog.action_type)}`}>
                  {selectedLog.action_type.replace('_', ' ').toUpperCase()}
                </span>
                {selectedLog.risk_level && (
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${getRiskBadge(selectedLog.risk_level)}`}>
                    Risk: {selectedLog.risk_level.toUpperCase()}
                  </span>
                )}
              </div>
              <p className="text-gray-900 dark:text-white">{selectedLog.action}</p>
              {selectedLog.amount && (
                <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
                  Amount: +{selectedLog.amount} points
                </p>
              )}

              {selectedLog.details && Object.keys(selectedLog.details).length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-bold">Additional Data</p>
                  <pre className="bg-gray-900 dark:bg-gray-950 text-green-400 p-4 rounded-xl text-xs overflow-auto max-h-40">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Admin Actions */}
            <div className="flex gap-3">
              <button
                onClick={closeDetail}
                className="flex-1 py-3 rounded-2xl border-2 border-black dark:border-gray-600 font-bold text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
              <button
                onClick={contactSelectedUser}
                disabled={actionBusy || !selectedLog.email}
                className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Mail size={18} />
                Contact User
              </button>
              {selectedLog.user_id && (
                <button
                  onClick={suspendSelectedUser}
                  disabled={actionBusy || authUser?.id === selectedLog.user_id}
                  className="flex items-center gap-2 px-4 py-3 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Ban size={18} />
                  {actionBusy ? 'Suspending...' : 'Suspend'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
    </AdminLayout>
  );
};

export default AdminAuditLogs;





