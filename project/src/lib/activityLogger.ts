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

/* ── Auto-detect device info from User-Agent ── */
function detectDevice() {
  const ua = navigator.userAgent;

  // Browser
  let browser = 'Unknown';
  if (/Edg\//.test(ua))         browser = 'Edge';
  else if (/OPR\//.test(ua))    browser = 'Opera';
  else if (/Chrome/.test(ua))   browser = 'Chrome';
  else if (/Firefox/.test(ua))  browser = 'Firefox';
  else if (/Safari/.test(ua))   browser = 'Safari';

  // OS
  let os = 'Unknown';
  if (/Windows NT 10/.test(ua)) os = 'Windows 10/11';
  else if (/Windows/.test(ua))  os = 'Windows';
  else if (/iPhone/.test(ua))   os = 'iOS';
  else if (/iPad/.test(ua))     os = 'iPadOS';
  else if (/Android/.test(ua))  os = 'Android';
  else if (/Mac OS X/.test(ua)) os = 'macOS';
  else if (/Linux/.test(ua))    os = 'Linux';

  // Device type
  const isMobile = /Mobile|Android|iPhone/.test(ua);
  const isTablet = /iPad|Tablet/.test(ua);
  const deviceType = isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop';

  // Device name (OS + Browser short form)
  const deviceName = `${os} · ${browser}`;

  return { browser, os, deviceType, deviceName };
}

/* ── Fetch public IP (fire-and-forget, cached for session) ── */
let _cachedIp: string | null = null;
async function getPublicIp(): Promise<string> {
  if (_cachedIp) return _cachedIp;
  try {
    const res = await fetch('https://api.ipify.org?format=json', { signal: AbortSignal.timeout(3000) });
    const json = await res.json();
    _cachedIp = json.ip ?? null;
    return _cachedIp ?? '0.0.0.0';
  } catch {
    return '0.0.0.0';
  }
}

class ActivityLogService {
  async logActivity(log: ActivityLogInput): Promise<boolean> {
    try {
      // Auto-fill device info if not provided
      const device = detectDevice();
      const ip = log.ipAddress ?? await getPublicIp();

      await logActivity({
        user_id:     log.userId ?? null,
        username:    log.username,
        email:       log.email,
        role:        log.role,
        action:      log.action,
        action_type: log.actionType,
        details:     log.details ?? null,
        ip_address:  ip,
        device_type: log.deviceType ?? device.deviceType,
        device_name: log.deviceName ?? device.deviceName,
        browser:     log.browser    ?? device.browser,
        os:          log.os         ?? device.os,
        country:     log.country    ?? null,
        city:        log.city       ?? null,
        amount:      log.amount     ?? null,
        risk_level:  log.riskLevel  ?? 'low',
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
    return getPublicIp();
  }

  async getStats() {
    return getLogStats();
  }
}

export const activityLogService = new ActivityLogService();
