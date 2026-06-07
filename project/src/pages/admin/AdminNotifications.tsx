import React, { useState, useEffect } from 'react';
import { pushNotificationService } from '../../lib/pushNotifications';
import { Bell, Send, Clock, CheckCircle, AlertCircle, Plus, Users, Target } from 'lucide-react';
import AdminLayout from './AdminLayout';

interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  deliveryStatus: 'pending' | 'sent' | 'failed' | 'read';
  sentAt: string;
  readAt?: string;
}

const mockNotifications: Notification[] = [
  { id: '1', userId: 'all', title: 'Welcome Bonus!', message: 'Earn double points this weekend on all purchases!', type: 'promotion', isRead: false, deliveryStatus: 'sent', sentAt: new Date().toLocaleString() },
  { id: '2', userId: 'all', title: 'New Reward Available', message: 'Check out our new seasonal menu items!', type: 'reward', isRead: true, deliveryStatus: 'read', sentAt: new Date(Date.now() - 86400000).toLocaleString(), readAt: new Date().toLocaleString() },
  { id: '3', userId: 'user-1', title: 'Level Up!', message: 'Congratulations! You reached Level 15!', type: 'event', isRead: true, deliveryStatus: 'read', sentAt: new Date(Date.now() - 172800000).toLocaleString(), readAt: new Date(Date.now() - 86400000).toLocaleString() },
  { id: '4', userId: 'all', title: 'System Maintenance', message: 'The app will be down for maintenance on Sunday 2-4 AM', type: 'general', isRead: false, deliveryStatus: 'pending', sentAt: new Date().toLocaleString() },
  { id: '5', userId: 'user-2', title: 'Points Expiring Soon', message: '500 points will expire in 7 days. Use them now!', type: 'reward', isRead: false, deliveryStatus: 'sent', sentAt: new Date(Date.now() - 43200000).toLocaleString() },
];

const AdminNotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSendForm, setShowSendForm] = useState(false);
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifType, setNotifType] = useState('general');
  const [targetUsers, setTargetUsers] = useState('all');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    setNotifications(mockNotifications);
    setLoading(false);
  };

  const sendNotification = async () => {
    if (!notifTitle || !notifMessage) {
      alert('Please fill in title and message');
      return;
    }

    setSending(true);
    try {
      if (targetUsers === 'all') {
        await pushNotificationService.sendBroadcast(notifTitle, notifMessage);
      } else {
        await pushNotificationService.sendNotification(targetUsers, {
          title: notifTitle,
          message: notifMessage,
          tag: notifType,
        });
      }

      alert('Notification sent successfully!');
      setNotifTitle('');
      setNotifMessage('');
      setShowSendForm(false);
      loadNotifications();
    } catch (error) {
      console.error('Failed to send notification:', error);
      alert('Failed to send notification');
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
    sent: notifications.filter(n => n.deliveryStatus === 'sent').length,
    read: notifications.filter(n => n.isRead).length,
    failed: notifications.filter(n => n.deliveryStatus === 'failed').length,
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
              Push Notifications
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Send and manage system-wide push notifications</p>
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <div className="card p-4 lg:p-6 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 lg:p-3 rounded-2xl bg-blue-100 dark:bg-blue-900/30">
                <Bell size={20} className="text-blue-600 lg:w-6 lg:h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Total Sent</p>
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
                <p className="text-xs text-gray-600 dark:text-gray-400">Read</p>
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
                <p className="text-xs text-gray-600 dark:text-gray-400">Pending</p>
                <p className="text-xl lg:text-2xl font-black text-gray-900 dark:text-white">{notifications.filter(n => n.deliveryStatus === 'pending').length}</p>
              </div>
            </div>
          </div>

          <div className="card p-4 lg:p-6 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 lg:p-3 rounded-2xl bg-red-100 dark:bg-red-900/30">
                <AlertCircle size={20} className="text-red-600 lg:w-6 lg:h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Failed</p>
                <p className="text-xl lg:text-2xl font-black text-gray-900 dark:text-white">{stats.failed}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Send Form */}
        {showSendForm && (
          <div className="card p-4 lg:p-6 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 space-y-4">
            <div className="flex items-center gap-2">
              <Send className="text-[#7B6EF6]" size={20} />
              <h3 className="text-lg lg:text-xl font-black text-gray-900 dark:text-white">Compose Notification</h3>
            </div>

            <input
              type="text"
              placeholder="Notification Title"
              value={notifTitle}
              onChange={(e) => setNotifTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border-2 border-black dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500"
            />

            <textarea
              placeholder="Notification Message"
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
                  <option value="all">All Users</option>
                  <option value="premium">Premium Users</option>
                  <option value="inactive">Inactive Users</option>
                  <option value="specific">Specific User</option>
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
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    <span>Send Notification</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setShowSendForm(false)}
                className="flex-1 py-3 rounded-2xl border-2 border-black dark:border-gray-600 font-bold text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Notifications List */}
        <div className="card bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 overflow-hidden">
          <div className="p-4 lg:p-6 border-b-2 border-black dark:border-gray-700">
            <h3 className="font-black text-gray-900 dark:text-white flex items-center gap-2">
              <Bell size={20} className="text-gray-400" />
              Recent Notifications ({notifications.length})
            </h3>
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
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(notif.deliveryStatus)}`}>
                        {notif.deliveryStatus.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-gray-900 dark:text-white text-sm">{notif.title}</p>
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
                      <span className="text-xs text-gray-500">{notif.sentAt}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {notifications.length === 0 && (
            <div className="text-center py-12">
              <Bell size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No notifications sent yet</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminNotificationsPage;
