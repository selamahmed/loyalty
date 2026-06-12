import React, { useState, useEffect, useCallback } from 'react';
import { Bell, Send, Clock, CheckCircle, AlertCircle, Plus, RefreshCw } from 'lucide-react';
import AdminLayout from './AdminLayout';
import { getAllNotifications, broadcastNotification } from '../../services/admin';
import { useRealtimeTable } from '../../hooks/useRealtime';

type DBNotification = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
  profiles?: { username?: string; email?: string } | null;
};

const AdminNotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<DBNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSendForm, setShowSendForm] = useState(false);
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifType, setNotifType] = useState('general');
  const [targetUsers, setTargetUsers] = useState('all');
  const [sending, setSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const loadNotifications = useCallback(async () => {
    try {
      const data = await getAllNotifications(0, 100);
      setNotifications(data as DBNotification[]);
    } catch { setNotifications([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadNotifications(); }, [loadNotifications]);

  /* realtime: refresh whenever a notification is created/updated */
  useRealtimeTable('notifications', loadNotifications);

  const sendNotification = async () => {
    if (!notifTitle || !notifMessage) {
      alert('Başlık ve mesaj zorunludur');
      return;
    }

    setSending(true);
    try {
      await broadcastNotification({
        type: notifType,
        title: notifTitle,
        message: notifMessage,
        icon: notifType === 'promotion' ? '🎁' : notifType === 'reward' ? '⭐' : notifType === 'event' ? '🎉' : '🔔',
        userIds: targetUsers === 'all' ? [] : undefined,
      });

      setSuccessMsg('Bildirim başarıyla gönderildi!');
      setTimeout(() => setSuccessMsg(''), 4000);
      setNotifTitle('');
      setNotifMessage('');
      setShowSendForm(false);
      await loadNotifications();
    } catch (error) {
      console.error('Failed to send notification:', error);
      alert('Bildirim gönderilemedi');
    } finally {
      setSending(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
      sent: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
      read: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
      failed: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    };
    return colors[status] || 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400';
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      promotion: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
      reward: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
      event: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
      general: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
    };
    return colors[type] || 'bg-gray-100 dark:bg-gray-700 text-gray-600';
  };

  const stats = {
    total: notifications.length,
    read: notifications.filter(n => n.read).length,
    unread: notifications.filter(n => !n.read).length,
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6 flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#7B6EF6] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="font-bold">Loading...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-4 lg:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white flex items-center gap-2">
              <Bell className="text-[#7B6EF6]" size={28} />
              Bildirimler
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Tüm kullanıcılara bildirim gönder ve geçmişi izle</p>
          </div>
          <button
            onClick={() => setShowSendForm(!showSendForm)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-[#7B6EF6] dark:bg-[#4F8EF7] text-white font-bold rounded-2xl border-2 border-black hover:shadow-lg transition-all"
          >
            <Plus size={20} />
            <span>New Notification</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
          <div className="card p-4 lg:p-6 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 lg:p-3 rounded-2xl bg-blue-100 dark:bg-blue-900/30">
                <Bell size={20} className="text-blue-600 lg:w-6 lg:h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Toplam</p>
                <p className="text-xl lg:text-2xl font-black text-gray-900 dark:text-white">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="card p-4 lg:p-6 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 lg:p-3 rounded-2xl bg-green-100 dark:bg-green-900/30">
                <CheckCircle size={20} className="text-green-600 lg:w-6 lg:h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Okundu</p>
                <p className="text-xl lg:text-2xl font-black text-gray-900 dark:text-white">{stats.read}</p>
              </div>
            </div>
          </div>

          <div className="card p-4 lg:p-6 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 lg:p-3 rounded-2xl bg-yellow-100 dark:bg-yellow-900/30">
                <Clock size={20} className="text-yellow-600 lg:w-6 lg:h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Okunmadı</p>
                <p className="text-xl lg:text-2xl font-black text-gray-900 dark:text-white">{stats.unread}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Send Form */}
        {showSendForm && (
          <div className="card p-4 lg:p-6 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 space-y-4">
            <div className="flex items-center gap-2">
              <Send className="text-[#7B6EF6]" size={20} />
              <h3 className="text-lg lg:text-xl font-black text-gray-900 dark:text-white">Bildirim Oluştur</h3>
            </div>

            <input
              type="text"
              placeholder="Bildirim Başlığı"
              value={notifTitle}
              onChange={(e) => setNotifTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border-2 border-black dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500"
            />

            <textarea
              placeholder="Bildirim Mesajı"
              value={notifMessage}
              onChange={(e) => setNotifMessage(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border-2 border-black dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 resize-none h-24"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 font-bold mb-1 block">Type</label>
                <select
                  value={notifType}
                  onChange={(e) => setNotifType(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-black dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-bold"
                >
                  <option value="general">General</option>
                  <option value="promotion">Promotion</option>
                  <option value="reward">Reward</option>
                  <option value="event">Event</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-500 font-bold mb-1 block">Target</label>
                <select
                  value={targetUsers}
                  onChange={(e) => setTargetUsers(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-black dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-bold"
                >
                  <option value="all">Tüm Kullanıcılar</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={sendNotification}
                disabled={sending || !notifTitle}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#7B6EF6] dark:bg-[#4F8EF7] text-white font-bold rounded-2xl border-2 border-black hover:shadow-lg transition-all disabled:opacity-50"
              >
                {sending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Gönderiliyor...</span>
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    <span>Gönder</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setShowSendForm(false)}
                className="flex-1 py-3 rounded-2xl border-2 border-black dark:border-gray-600 font-bold text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                İptal
              </button>
            </div>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-2xl bg-green-100 dark:bg-green-900/30 border-2 border-green-500 text-green-700 dark:text-green-300 font-bold text-sm flex items-center gap-2">
            <CheckCircle size={16} /> {successMsg}
          </div>
        )}

        {/* Notifications List */}
        <div className="card bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 overflow-hidden">
          <div className="p-4 lg:p-6 border-b-2 border-black dark:border-gray-700 flex items-center justify-between">
            <h3 className="font-black text-gray-900 dark:text-white flex items-center gap-2">
              <Bell size={20} className="text-gray-400" />
              Son Bildirimler ({notifications.length})
            </h3>
            <button onClick={loadNotifications} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 transition-colors">
              <RefreshCw size={15} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr className="border-b-2 border-black dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-black text-gray-900 dark:text-white text-sm">Status</th>
                  <th className="text-left py-3 px-4 font-black text-gray-900 dark:text-white text-sm">Title</th>
                  <th className="text-left py-3 px-4 font-black text-gray-900 dark:text-white text-sm hidden md:table-cell">Message</th>
                  <th className="text-left py-3 px-4 font-black text-gray-900 dark:text-white text-sm">Type</th>
                  <th className="text-left py-3 px-4 font-black text-gray-900 dark:text-white text-sm hidden sm:table-cell">Sent</th>
                </tr>
              </thead>
              <tbody>
                {notifications.map(notif => (
                  <tr key={notif.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${notif.read ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'}`}>
                        {notif.read ? 'OKUNDU' : 'OKUNMADI'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-gray-900 dark:text-white text-sm">{notif.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{(notif.profiles as Record<string,string>)?.username ?? (notif.profiles as Record<string,string>)?.email ?? notif.user_id.slice(0, 8)}</p>
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell">
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-xs">{notif.message}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${getTypeColor(notif.type)}`}>
                        {notif.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 hidden sm:table-cell">
                      <span className="text-xs text-gray-500">{new Date(notif.created_at).toLocaleString('tr-TR')}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {notifications.length === 0 && !loading && (
            <div className="text-center py-12">
              <Bell size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Henüz bildirim yok</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminNotificationsPage;
