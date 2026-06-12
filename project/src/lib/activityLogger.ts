import { logActivity, getActivityLogs, getLogStats } from '../services/activityLogs';

export type { ActivityLog } from '../services/activityLogs';

export interface ActivityLogInput {
  userId?: string;
  username: string;
  email: string;
  role: string;
  action: string;
  actionType: 'login' | 'logout' | 'points_earned' | 'points_spent' | 'purchase' | 'achievement' | 'mission' | 'qr_scan' | 'profile_update' | 'settings_change' | 'admin_action' | 'security_alert' | 'password_change' | 'account_suspended' | 'account_deleted';
  details?: Record<string, unknown>;
  ipAddress?: string;
  deviceType?: string;
  deviceName?: string;
  browser?: string;
  os?: string;
  country?: string;
  city?: string;
  amount?: number;
  riskLevel?: 'low' | 'medium' | 'high';
}

class ActivityLogService {
  async logActivity(log: ActivityLogInput): Promise<boolean> {
    try {
      await logActivity({
        user_id: log.userId ?? null,
        username: log.username,
        email: log.email,
        role: log.role,
        action: log.action,
        action_type: log.actionType,
        details: log.details ?? null,
        ip_address: log.ipAddress ?? null,
        device_type: log.deviceType ?? null,
        device_name: log.deviceName ?? null,
        browser: log.browser ?? null,
        os: log.os ?? null,
        country: log.country ?? null,
        city: log.city ?? null,
        amount: log.amount ?? null,
        risk_level: log.riskLevel ?? 'low',
      });
      return true;
    } catch (err) {
      console.error('Activity log failed:', err);
      return false;
    }
  }

  async getActivityLogs(userId?: string, actionType?: string, limit = 100, offset = 0) {
    return getActivityLogs({ userId, actionType, page: Math.floor(offset / limit), pageSize: limit });
  }

  async getAdminLogs(limit = 100, offset = 0) {
    return getActivityLogs({ actionType: 'admin_action', page: Math.floor(offset / limit), pageSize: limit });
  }

  async searchLogs(query: string, limit = 50) {
    return getActivityLogs({ search: query, pageSize: limit });
  }

  async getIpAddress(): Promise<string> {
    try {
      const res = await fetch('https://api.ipify.org?format=json');
      const json = await res.json();
      return json.ip ?? '0.0.0.0';
    } catch {
      return '0.0.0.0';
    }
  }

  async getStats() {
    return getLogStats();
  }
}

export const activityLogService = new ActivityLogService();
