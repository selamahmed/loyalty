import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ComposedChart,
} from 'recharts';
import {
  TrendingUp, Users, Star, Activity, Zap, Globe,
  Smartphone, Monitor, Tablet, Clock, ShoppingBag, Award,
  Shield, Heart, Target, BarChart3, RefreshCw, Loader,
} from 'lucide-react';
import AdminLayout from './AdminLayout';
import { getAdvancedAnalytics } from '../../services/admin';
import { useRealtimeTables } from '../../hooks/useRealtime';

const COLORS = ['#7B6EF6', '#4F8EF7', '#22c55e', '#f59e0b', '#ef4444'];

function fmtNum(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'K';
  return n.toLocaleString();
}

type AnalyticsData = Awaited<ReturnType<typeof getAdvancedAnalytics>>;

const AdminAnalytics: React.FC = () => {
  const [data, setData]       = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');
  const hasDataRef = useRef(false);

  const load = useCallback(async () => {
    try {
      if (hasDataRef.current) setRefreshing(true);
      else setLoading(true);
      setErrorMsg('');
      const d = await getAdvancedAnalytics();
      setData(d);
      hasDataRef.current = true;
      setLastUpdated(new Date().toLocaleString('tr-TR'));
    } catch (err) {
      console.error('[AdminAnalytics] Failed to load analytics:', err);
      setErrorMsg('Analitik verileri yüklenemedi. Lütfen bağlantı veya RLS ayarlarını kontrol et.');
    }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  useRealtimeTables(['profiles','points_transactions','activity_logs','redemptions','qr_scans'], load, true, { debounceMs: 3000 });

  if (loading || !data) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader className="mx-auto mb-4 text-[#7B6EF6] animate-spin" size={36} />
            <p className="font-bold text-gray-500 dark:text-gray-400">Analitik yükleniyor...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const { kpis, monthlyActive, weekEngagement, hourlyActivity, peakHour, lowHour,
          retentionData, d90Rate, deviceDistribution, geoData, funnelData, rewardPopularity } = data;

  const kpiCards = [
    { label: 'Bugün Aktif',      value: fmtNum(kpis.activeUsers),         change: `+${fmtNum(kpis.qrToday)} QR`,   icon: Users,    color: 'text-blue-500',    trend: 'up' },
    { label: 'Puan/Gün',         value: fmtNum(kpis.pointsPerDay),        change: 'bugün kazanılan',                icon: Star,     color: 'text-amber-500',   trend: 'up' },
    { label: 'Aylık Ödül',       value: fmtNum(kpis.redemptionsMonth),    change: 'bu ay kullanıldı',               icon: ShoppingBag, color: 'text-emerald-500', trend: 'up' },
    { label: 'Başarı (Ay)',      value: fmtNum(kpis.achievementsMonth),   change: 'bu ay kazanıldı',                icon: Award,    color: 'text-purple-500',  trend: 'up' },
    { label: 'Aylık Puan',       value: fmtNum(kpis.pointsMonth),         change: `${fmtNum(kpis.pointsSpentMonth)} harcandı`, icon: Zap, color: 'text-[#7B6EF6]', trend: 'up' },
    { label: 'Güvenlik Skoru',   value: `${kpis.securityScore}`,          change: kpis.securityScore >= 95 ? 'Çok İyi' : 'Orta', icon: Shield, color: 'text-cyan-500', trend: kpis.securityScore >= 90 ? 'up' : 'down' },
  ];

  return (
    <AdminLayout>
    <div className="p-4 lg:p-6 space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="text-[#7B6EF6]" size={28} />
            Gelişmiş Analitik
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Kapsamlı platform içgörüleri ve kullanıcı davranış analizi</p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && <span className="text-xs text-gray-400">Son güncelleme: {lastUpdated}</span>}
          {refreshing && <span className="text-xs font-bold text-[#7B6EF6]">Arka planda yenileniyor...</span>}
          <button onClick={load} className="p-2 rounded-xl border-2 border-black dark:border-gray-600 bg-white dark:bg-gray-800 hover:shadow-md transition-all">
            <RefreshCw size={16} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      {errorMsg && (
        <div className="rounded-xl border-2 border-red-400 bg-red-50 dark:bg-red-950/30 p-3 text-sm font-bold text-red-700 dark:text-red-300">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpiCards.map(kpi => (
          <div key={kpi.label} className="card p-4 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700">
            <kpi.icon size={18} className={`${kpi.color} mb-2`} />
            <p className="font-black text-xl text-gray-900 dark:text-white">{kpi.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{kpi.label}</p>
            <p className={`text-xs font-bold mt-1 ${kpi.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
              {kpi.trend === 'up' ? '↑' : '↓'} {kpi.change}
            </p>
          </div>
        ))}
      </div>

      {/* ── Main Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Monthly Growth */}
        <div className="card p-5 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700">
          <h2 className="font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Users size={20} className="text-[#7B6EF6]" />
            Aylık Kullanıcı Büyümesi
          </h2>
          {monthlyActive.some(m => m.new > 0 || m.active > 0) ? (
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={monthlyActive}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ border: '2px solid #000', borderRadius: '12px', fontSize: '12px' }} />
                <Legend />
                <Area yAxisId="left" type="monotone" dataKey="active" fill="#7B6EF6" fillOpacity={0.2} stroke="#7B6EF6" name="Aktivite" />
                <Bar yAxisId="left" dataKey="new" fill="#22c55e" name="Yeni Kayıt" radius={[4,4,0,0]} />
                <Line yAxisId="right" type="monotone" dataKey="pointsEarned" stroke="#f59e0b" strokeWidth={2} name="Puan Kazanıldı" dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400 text-sm font-bold">Veri yok</div>
          )}
        </div>

        {/* Weekly Engagement */}
        <div className="card p-5 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700">
          <h2 className="font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Activity size={20} className="text-green-500" />
            Haftalık Etkileşim Türüne Göre
          </h2>
          {weekEngagement.some(d => d.sessions > 0) ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={weekEngagement}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ border: '2px solid #000', borderRadius: '12px', fontSize: '12px' }} />
                <Legend />
                <Bar dataKey="qr"       name="QR Tarama"   fill="#4F8EF7" radius={[2,2,0,0]} />
                <Bar dataKey="missions" name="Görevler"     fill="#22c55e" radius={[2,2,0,0]} />
                <Bar dataKey="sessions" name="Oturumlar"    fill="#7B6EF6" radius={[2,2,0,0]} />
                <Bar dataKey="points"   name="Puan"         fill="#f59e0b" radius={[2,2,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400 text-sm font-bold">Bu hafta veri yok</div>
          )}
        </div>
      </div>

      {/* ── Hourly + Retention ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-5 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 lg:col-span-2">
          <h2 className="font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Clock size={20} className="text-amber-500" /> Saatlik Aktivite Dağılımı (30g Ort.)
          </h2>
          {hourlyActivity.some(h => h.users > 0) ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={hourlyActivity}>
                  <defs>
                    <linearGradient id="hourGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="hour" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={h => `${h}:00`} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '2px solid #000' }} labelFormatter={h => `${h}:00`} />
                  <Area type="monotone" dataKey="users" stroke="#f59e0b" fill="url(#hourGradient)" name="Aktif Kullanıcı" />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex justify-between mt-4 text-xs">
                <div className="text-center">
                  <p className="font-bold text-gray-700 dark:text-gray-300">Zirve Saat</p>
                  <p className="text-[#7B6EF6] font-black">{peakHour?.hour}:00</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-gray-700 dark:text-gray-300">Düşük Saat</p>
                  <p className="text-gray-400 font-black">{lowHour?.hour}:00</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-gray-700 dark:text-gray-300">Bugün QR</p>
                  <p className="text-green-600 font-black">{fmtNum(kpis.qrToday)}</p>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-52 text-gray-400 text-sm font-bold">Veri yok</div>
          )}
        </div>

        <div className="card p-5 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700">
          <h2 className="font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Target size={20} className="text-purple-500" /> Kullanıcı Elde Tutma
          </h2>
          {retentionData.some(r => r.rate > 0) ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={retentionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '2px solid #000' }} formatter={(v) => [`${v}%`, 'Elde Tutma']} />
                  <Line type="monotone" dataKey="rate" stroke="#8b5cf6" strokeWidth={3} dot={{ fill:'#8b5cf6', r:4 }} />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                <p className="text-xs text-gray-600 dark:text-gray-400">90 günlük elde tutma</p>
                <p className="text-lg font-black text-purple-600">{d90Rate}%</p>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-52 text-gray-400 text-sm font-bold">Veri yok</div>
          )}
        </div>
      </div>

      {/* ── Device, Geo, Funnel ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Device Distribution */}
        <div className="card p-5 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700">
          <h2 className="font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Smartphone size={20} className="text-blue-500" /> Cihaz Dağılımı
          </h2>
          {deviceDistribution.some(d => d.value > 0) ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={deviceDistribution} innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {deviceDistribution.map((e, i) => <Cell key={i} fill={e.color ?? COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '2px solid #000' }} formatter={(v) => [`${v}%`, 'Oran']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-4">
                {deviceDistribution.map(item => (
                  <div key={item.name} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ background: item.color ?? '#7B6EF6' }} />
                      <span className="text-sm text-gray-900 dark:text-white">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-gray-900 dark:text-white">{item.value}%</span>
                      <span className="text-xs text-gray-400 ml-1">({fmtNum(item.devices)})</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-52 text-gray-400 text-sm font-bold">Veri yok</div>
          )}
        </div>

        {/* Geo Distribution */}
        <div className="card p-5 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700">
          <h2 className="font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Globe size={20} className="text-green-500" /> Ülkeye Göre Dağılım
          </h2>
          {geoData.length === 0 ? (
            <div className="flex items-center justify-center h-52 text-gray-400 text-sm font-bold">Konum verisi yok henüz</div>
          ) : (
            <div className="space-y-3">
              {geoData.map(item => (
                <div key={item.country} className="flex items-center gap-3">
                  <span className="text-lg">🌍</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-900 dark:text-white truncate">{item.country}</span>
                      <span className="font-bold text-gray-900 dark:text-white ml-2 flex-shrink-0">{fmtNum(item.users)}</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#7B6EF6] to-[#4F8EF7] rounded-full" style={{ width: `${Math.round(item.users / Math.max(geoData[0].users, 1) * 100)}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Conversion Funnel */}
        <div className="card p-5 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700">
          <h2 className="font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Target size={20} className="text-red-500" /> Dönüşüm Hunisi
          </h2>
          {funnelData[0].count === 0 ? (
            <div className="flex items-center justify-center h-52 text-gray-400 text-sm font-bold">Veri yok</div>
          ) : (
            <div className="space-y-3">
              {funnelData.map((stage, i) => {
                const pct = Math.round(stage.count / Math.max(funnelData[0].count, 1) * 100);
                return (
                  <div key={stage.stage}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-gray-600 dark:text-gray-400">{stage.stage}</span>
                      <span className="text-xs font-bold text-gray-900 dark:text-white">{fmtNum(stage.count)} ({pct}%)</span>
                    </div>
                    <div className="w-full h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: stage.fill }} />
                    </div>
                    {i < funnelData.length - 1 && stage.count > 0 && (
                      <p className="text-xs text-gray-400 text-right mt-0.5">
                        → {Math.round(funnelData[i + 1].count / Math.max(stage.count, 1) * 100)}%
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Reward Performance ── */}
      <div className="card p-5 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700">
        <h2 className="font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <ShoppingBag size={20} className="text-amber-500" /> En Çok Kullanılan Ödüller (Bu Ay)
        </h2>
        {rewardPopularity.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-gray-400 text-sm font-bold">Bu ay ödül kullanımı yok</div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={rewardPopularity} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={110} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '2px solid #000' }} formatter={(v, n) => [n === 'value' ? `${v}%` : v, n === 'value' ? 'Oran' : 'Kullanım']} />
                <Bar dataKey="value" name="value" fill="#7B6EF6" radius={[0, 4, 4, 0]}>
                  {rewardPopularity.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4">
              {rewardPopularity.map((item, i) => (
                <div key={item.name} className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <p className="text-lg font-black text-gray-900 dark:text-white">{item.value}%</p>
                  <p className="text-xs text-gray-500 truncate">{item.name}</p>
                  <p className="text-xs font-bold text-[#7B6EF6]">{fmtNum(item.count)} kez</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Bottom Engagement Tiles ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4 bg-gradient-to-br from-[#7B6EF6]/10 to-[#4F8EF7]/10 border-2 border-[#7B6EF6]/30">
          <Zap size={24} className="text-[#7B6EF6] mb-2" />
          <p className="text-2xl font-black text-gray-900 dark:text-white">{fmtNum(kpis.pointsMonth)}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Puan Kazanıldı (Ay)</p>
        </div>
        <div className="card p-4 bg-gradient-to-br from-red-500/10 to-orange-500/10 border-2 border-red-500/30">
          <ShoppingBag size={24} className="text-red-500 mb-2" />
          <p className="text-2xl font-black text-gray-900 dark:text-white">{fmtNum(kpis.redemptionsMonth)}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Kullanılan Ödül (Ay)</p>
        </div>
        <div className="card p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-2 border-green-500/30">
          <Award size={24} className="text-green-500 mb-2" />
          <p className="text-2xl font-black text-gray-900 dark:text-white">{fmtNum(kpis.achievementsMonth)}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Başarı Kazanıldı (Ay)</p>
        </div>
        <div className="card p-4 bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border-2 border-amber-500/30">
          <Target size={24} className="text-amber-500 mb-2" />
          <p className="text-2xl font-black text-gray-900 dark:text-white">{kpis.securityScore}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Güvenlik Skoru</p>
        </div>
      </div>

    </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
