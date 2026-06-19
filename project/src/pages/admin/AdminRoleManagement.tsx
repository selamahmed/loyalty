import React, { useCallback, useEffect, useState } from 'react';
import { Check, KeyRound, Loader, RefreshCw, ShieldCheck, UserCog, Users, X } from 'lucide-react';
import AdminLayout from './AdminLayout';
import { supabase } from '../../lib/supabase';
import { setSuperAdminInnerPassword, updateUserRole } from '../../services/admin';
import { useAuth } from '../../context/AuthContext';
import { useRealtimeTable } from '../../hooks/useRealtime';

type ManagedRole = 'customer' | 'store_admin' | 'super_admin' | 'cashier';

type ManagedUser = {
  id: string;
  username: string | null;
  email: string | null;
  role: ManagedRole | string;
  status: string | null;
  created_at: string;
};

const ROLE_LABEL: Record<string, string> = {
  customer: 'User',
  user: 'User',
  store_admin: 'Admin',
  admin: 'Admin',
  cashier: 'Cashier',
  super_admin: 'Super Admin',
};

const ROLE_BADGE: Record<string, string> = {
  customer: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200',
  user: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200',
  store_admin: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  admin: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  cashier: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  super_admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
};

const roleLabel = (role: string | null | undefined) => ROLE_LABEL[role ?? ''] ?? role ?? 'Unknown';

const AdminRoleManagement: React.FC = () => {
  const { authUser } = useAuth();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [workingUserId, setWorkingUserId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const [innerPassword, setInnerPassword] = useState('');
  const [savingInnerPassword, setSavingInnerPassword] = useState(false);
  const [pendingRevoke, setPendingRevoke] = useState<ManagedUser | null>(null);
  const [revokePassword, setRevokePassword] = useState('');

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error: loadError } = await supabase
        .from('profiles')
        .select('id, username, email, role, status, created_at')
        .order('created_at', { ascending: false });

      if (loadError) throw loadError;
      setUsers((data ?? []) as ManagedUser[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load users.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  useRealtimeTable('profiles', () => {
    void loadUsers();
  });

  const toast = (message: string) => {
    setFeedback(message);
    window.setTimeout(() => setFeedback(''), 3000);
  };

  const saveInnerPassword = async () => {
    setSavingInnerPassword(true);
    setError('');
    try {
      await setSuperAdminInnerPassword(innerPassword);
      setInnerPassword('');
      toast('Inner password saved');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Inner password could not be saved.');
    } finally {
      setSavingInnerPassword(false);
    }
  };

  const changeRole = async (
    user: ManagedUser,
    role: 'customer' | 'store_admin' | 'super_admin',
    password?: string,
  ) => {
    setWorkingUserId(user.id);
    setError('');
    try {
      await updateUserRole(user.id, role, password);
      toast(`${user.email ?? user.username ?? user.id} -> ${roleLabel(role)}`);
      setPendingRevoke(null);
      setRevokePassword('');
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Role could not be changed.');
    } finally {
      setWorkingUserId(null);
    }
  };

  const stats = {
    total: users.length,
    admins: users.filter(u => ['admin', 'store_admin', 'super_admin'].includes(u.role)).length,
    superAdmins: users.filter(u => u.role === 'super_admin').length,
  };

  return (
    <AdminLayout>
      <div className="p-3 sm:p-4 lg:p-6 space-y-5 max-w-6xl mx-auto">
        {feedback && (
          <div className="fixed top-4 right-4 z-[9999] px-4 py-2 rounded-2xl font-bold text-sm shadow-xl bg-[#7B6EF6] text-white border-2 border-black flex items-center gap-2">
            <Check size={14} /> {feedback}
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">SECURITY</p>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2 mt-0.5">
              <ShieldCheck className="text-[#7B6EF6]" size={24} /> Super Admin Roles
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Roles are read from <code>public.profiles.role</code> and changed only through the secure RPC.
            </p>
          </div>
          <button
            onClick={() => void loadUsers()}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-black text-sm border-2 border-black bg-[#7B6EF6] text-white hover:shadow-lg transition-all"
          >
            <RefreshCw size={15} /> Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: 'Total Users', value: stats.total, icon: Users },
            { label: 'Admins', value: stats.admins, icon: UserCog },
            { label: 'Super Admins', value: stats.superAdmins, icon: ShieldCheck },
          ].map(item => (
            <div key={item.label} className="card p-4 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700">
              <item.icon size={20} className="text-[#7B6EF6] mb-2" />
              <p className="text-2xl font-black text-gray-900 dark:text-white">{item.value}</p>
              <p className="text-xs font-bold text-gray-500">{item.label}</p>
            </div>
          ))}
        </div>

        <div className="card p-4 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700">
          <div className="flex flex-col lg:flex-row lg:items-end gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <KeyRound size={18} className="text-[#7B6EF6]" />
                <p className="font-black text-gray-900 dark:text-white">Super Admin Inner Password</p>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Required only when revoking elevated access back to user.
              </p>
            </div>
            <input
              type="password"
              value={innerPassword}
              onChange={event => setInnerPassword(event.target.value)}
              placeholder="Set or update inner password"
              className="px-4 py-2.5 rounded-xl border-2 border-black dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm font-bold min-w-0 lg:min-w-[280px]"
              autoComplete="new-password"
            />
            <button
              onClick={() => void saveInnerPassword()}
              disabled={savingInnerPassword || innerPassword.length < 8}
              className="px-4 py-2.5 rounded-xl border-2 border-black bg-[#7B6EF6] text-white text-sm font-black disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {savingInnerPassword ? <Loader size={14} className="animate-spin" /> : 'Save password'}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border-2 border-red-400 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 px-4 py-3 text-sm font-bold">
            {error}
          </div>
        )}

        <div className="card bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="py-16 text-center">
              <Loader className="mx-auto mb-3 text-[#7B6EF6] animate-spin" size={28} />
              <p className="font-bold text-gray-500">Loading users...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px]">
                <thead>
                  <tr className="border-b-2 border-black dark:border-gray-700 bg-gray-50 dark:bg-gray-900/60">
                    {['User', 'Role', 'Status', 'Created', 'Actions'].map(label => (
                      <th key={label} className="py-3 px-4 text-left text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => {
                    const isSelf = user.id === authUser?.id;
                    const working = workingUserId === user.id;
                    return (
                      <tr key={user.id} className="border-b border-gray-100 dark:border-gray-700/60">
                        <td className="py-3 px-4">
                          <p className="font-black text-sm text-gray-900 dark:text-white">{user.username ?? 'No username'}</p>
                          <p className="text-xs text-gray-500">{user.email ?? user.id}</p>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-black ${ROLE_BADGE[user.role] ?? ROLE_BADGE.customer}`}>
                            {roleLabel(user.role)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-xs font-bold text-gray-500">{user.status ?? 'active'}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-xs text-gray-500">{new Date(user.created_at).toLocaleDateString('tr-TR')}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-2">
                            {[
                              { label: 'Promote to admin', role: 'store_admin' as const },
                              { label: 'Promote to super_admin', role: 'super_admin' as const },
                              { label: 'Revoke to user', role: 'customer' as const },
                            ].map(action => (
                              <button
                                key={action.role}
                                onClick={() => {
                                  if (action.role === 'customer') {
                                    setPendingRevoke(user);
                                    setRevokePassword('');
                                    setError('');
                                  } else {
                                    void changeRole(user, action.role);
                                  }
                                }}
                                disabled={working || isSelf || user.role === action.role}
                                className="px-3 py-1.5 rounded-xl border-2 border-black bg-white dark:bg-gray-900 text-xs font-black text-gray-800 dark:text-gray-100 disabled:opacity-45 disabled:cursor-not-allowed hover:bg-[#7B6EF6] hover:text-white transition-colors"
                              >
                                {working ? <Loader size={12} className="animate-spin" /> : action.label}
                              </button>
                            ))}
                            {isSelf && <span className="text-xs font-bold text-gray-400 self-center">Current account</span>}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {pendingRevoke && (
          <div className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-3xl border-2 border-black bg-white dark:bg-gray-800 shadow-2xl overflow-hidden">
              <div className="p-4 border-b-2 border-black dark:border-gray-700 flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black text-red-500 uppercase tracking-widest">Confirm revoke</p>
                  <h2 className="text-lg font-black text-gray-900 dark:text-white mt-1">Revoke admin access?</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {pendingRevoke.email ?? pendingRevoke.username ?? pendingRevoke.id} will become a normal user.
                  </p>
                </div>
                <button
                  onClick={() => { setPendingRevoke(null); setRevokePassword(''); }}
                  className="w-9 h-9 rounded-xl border-2 border-black bg-gray-100 dark:bg-gray-900 flex items-center justify-center"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <label className="block">
                  <span className="text-xs font-black text-gray-500 uppercase tracking-wide">Inner password</span>
                  <input
                    type="password"
                    value={revokePassword}
                    onChange={event => setRevokePassword(event.target.value)}
                    placeholder="Enter super admin inner password"
                    className="mt-2 w-full px-4 py-3 rounded-2xl border-2 border-black dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-bold"
                    autoComplete="current-password"
                    autoFocus
                  />
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setPendingRevoke(null); setRevokePassword(''); }}
                    className="flex-1 px-4 py-2.5 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-black"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => void changeRole(pendingRevoke, 'customer', revokePassword)}
                    disabled={workingUserId === pendingRevoke.id || revokePassword.length === 0}
                    className="flex-1 px-4 py-2.5 rounded-xl border-2 border-black bg-red-500 text-white font-black disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {workingUserId === pendingRevoke.id ? <Loader size={14} className="mx-auto animate-spin" /> : 'Revoke'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminRoleManagement;
