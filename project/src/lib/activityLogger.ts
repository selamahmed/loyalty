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
  region?: string;
  isp?: string;
  timezone?: string;
  amount?: number;
  riskLevel?: 'low' | 'medium' | 'high';
}

/* ── Geolocation result ── */
interface GeoInfo {
  ip: string;
  country: string;
  city: string;
  region: string;
  isp: string;
  timezone: string;
}

/* ── Session cache — one lookup per page session ── */
let _geoCache: GeoInfo | null = null;
let _geoFetching: Promise<GeoInfo> | null = null;

async function fetchGeoInfo(): Promise<GeoInfo> {
  if (_geoCache) return _geoCache;
  if (_geoFetching) return _geoFetching;

  _geoFetching = (async (): Promise<GeoInfo> => {
    try {
      /* ipapi.co — free, HTTPS, no key required; returns full geo + ISP + timezone */
      const res = await fetch('https://ipapi.co/json/', {
        signal: AbortSignal.timeout(5000),
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error(`ipapi status ${res.status}`);
      const d = await res.json();
      _geoCache = {
        ip:       d.ip        ?? '0.0.0.0',
        country:  d.country_name ?? d.country ?? 'Unknown',
        city:     d.city      ?? 'Unknown',
        region:   d.region    ?? 'Unknown',
        isp:      d.org       ?? 'Unknown',       // e.g. "AS47788 Superonline"
        timezone: d.timezone  ?? 'Unknown',
      };
      return _geoCache;
    } catch {
      /* fallback: IP-only via ipify */
      try {
        const r2 = await fetch('https://api.ipify.org?format=json', { signal: AbortSignal.timeout(3000) });
        const j2 = await r2.json();
        _geoCache = { ip: j2.ip ?? '0.0.0.0', country: 'Unknown', city: 'Unknown', region: 'Unknown', isp: 'Unknown', timezone: 'Unknown' };
      } catch {
        _geoCache = { ip: '0.0.0.0', country: 'Unknown', city: 'Unknown', region: 'Unknown', isp: 'Unknown', timezone: 'Unknown' };
      }
      return _geoCache!;
    }
  })();

  return _geoFetching;
}

/* ── Browser device detection ── */
function detectDevice() {
  const ua = navigator.userAgent;

  let browser = 'Unknown';
  if (/Edg\//.test(ua))       browser = 'Edge';
  else if (/OPR\//.test(ua))  browser = 'Opera';
  else if (/Chrome/.test(ua)) browser = 'Chrome';
  else if (/Firefox/.test(ua))browser = 'Firefox';
  else if (/Safari/.test(ua)) browser = 'Safari';

  let os = 'Unknown';
  if (/Windows NT 10/.test(ua))   os = 'Windows 10/11';
  else if (/Windows/.test(ua))    os = 'Windows';
  else if (/iPhone/.test(ua))     os = 'iOS';
  else if (/iPad/.test(ua))       os = 'iPadOS';
  else if (/Android/.test(ua))    os = 'Android';
  else if (/Mac OS X/.test(ua))   os = 'macOS';
  else if (/Linux/.test(ua))      os = 'Linux';

  const isMobile = /Mobile|Android|iPhone/.test(ua);
  const isTablet = /iPad|Tablet/.test(ua);
  const deviceType = isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop';
  const deviceName = `${os} · ${browser}`;

  return { browser, os, deviceType, deviceName };
}

/* ─────────────────────────────────── */
class ActivityLogService {

  async logActivity(log: ActivityLogInput): Promise<boolean> {
    try {
      const device = detectDevice();
      const geo    = await fetchGeoInfo();

      await logActivity({
        user_id:     log.userId     ?? null,
        username:    log.username,
        email:       log.email,
        role:        log.role,
        action:      log.action,
        action_type: log.actionType,
        details:     log.details    ?? null,
        ip_address:  log.ipAddress  ?? geo.ip,
        device_type: log.deviceType ?? device.deviceType,
        device_name: log.deviceName ?? device.deviceName,
        browser:     log.browser    ?? device.browser,
        os:          log.os         ?? device.os,
        country:     log.country    ?? geo.country,
        city:        log.city       ?? geo.city,
        region:      log.region     ?? geo.region,
        isp:         log.isp        ?? geo.isp,
        timezone:    log.timezone   ?? geo.timezone,
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
    return (await fetchGeoInfo()).ip;
  }

  async getGeoInfo(): Promise<GeoInfo> {
    return fetchGeoInfo();
  }

  async getStats() {
    return getLogStats();
  }
}

export const activityLogService = new ActivityLogService();
