import React, { useState } from 'react';
import { Phone, Clock, Check, Copy } from 'lucide-react';
import AccountPageShell, { Section, SaveButton, inputStyle } from '../../components/AccountPageShell';
import { useApp } from '../../context/AppContext';
import { playSound } from '../../lib/sounds';

const PHONE = '+90 850 123 45 67';
const HOURS = [
  { day: 'Pazartesi – Cuma', time: '09:00 – 18:00' },
  { day: 'Cumartesi', time: '10:00 – 14:00' },
  { day: 'Pazar', time: 'Kapalı' },
];

const SupportCall: React.FC = () => {
  const { user } = useApp();
  const [copied, setCopied] = useState(false);
  const [callback, setCallback] = useState({ phone: '', time: 'Sabah (09-12)', note: '' });
  const [loading, setLoading] = useState(false);
  const [requested, setRequested] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(PHONE).catch(() => {});
    playSound('success');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCallback = async () => {
    if (!callback.phone.trim()) return;
    setLoading(true);
    playSound('click');
    await new Promise(r => setTimeout(r, 900));
    setRequested(true);
    setLoading(false);
    playSound('success');
  };

  const isOpen = () => {
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();
    if (day === 0) return false;
    if (day === 6) return hour >= 10 && hour < 14;
    return hour >= 9 && hour < 18;
  };

  const open = isOpen();

  return (
    <AccountPageShell
      watermark="ARAMA"
      emoji="📞"
      gradient="linear-gradient(180deg,#fbbf24,#f59e0b)"
      title="Bizi Ara"
      subtitle="Pazartesi – Cuma, 09:00 – 18:00"
      backPath="/support"
      backLabel="Desteğe Dön"
      maxWidth="2xl"
    >
      <div style={{
        background: 'var(--card-bg)', border: '3px solid var(--dark-border)', boxShadow: '0 6px 0 var(--dark-border)',
        borderRadius: 20, padding: '24px 20px', textAlign: 'center',
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%', margin: '0 auto 14px',
          background: open ? 'rgba(34,197,94,0.15)' : 'rgba(107,114,128,0.12)',
          border: `3px solid ${open ? '#22c55e' : 'var(--dark-border)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Phone size={32} color={open ? '#22c55e' : 'var(--text-muted)'} />
        </div>
        <p style={{ fontWeight: 900, fontSize: 22, color: 'var(--text-dark)', margin: '0 0 4px', letterSpacing: '0.02em' }}>{PHONE}</p>
        <p style={{
          fontSize: 12, fontWeight: 900, margin: '0 0 16px',
          color: open ? '#22c55e' : '#ef4444',
        }}>
          {open ? '● Şu an açığız' : '● Şu an kapalıyız'}
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a
            href={`tel:${PHONE.replace(/\s/g, '')}`}
            onClick={() => playSound('click')}
            style={{
              padding: '12px 20px', borderRadius: 14, fontWeight: 900, fontSize: 14,
              background: 'linear-gradient(180deg,#fbbf24,#f59e0b)', color: 'white',
              border: '3px solid var(--dark-border)', boxShadow: '0 4px 0 var(--dark-border)',
              textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            <Phone size={16} /> Hemen Ara
          </a>
          <button
            onClick={handleCopy}
            style={{
              padding: '12px 20px', borderRadius: 14, fontWeight: 900, fontSize: 14,
              background: 'var(--tab-bg)', color: 'var(--text-dark)',
              border: '3px solid var(--dark-border)', boxShadow: '0 4px 0 var(--dark-border)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            {copied ? <><Check size={16} color="#22c55e" /> Kopyalandı</> : <><Copy size={16} /> Numarayı Kopyala</>}
          </button>
        </div>
      </div>

      <Section title="Çalışma Saatleri" emoji="🕐">
        {HOURS.map((h, i) => (
          <div key={h.day} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 18px',
            borderBottom: i < HOURS.length - 1 ? '2px solid var(--dark-border)' : 'none',
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 13, color: 'var(--text-dark)' }}>
              <Clock size={15} color="var(--text-muted)" /> {h.day}
            </span>
            <span style={{ fontWeight: 900, fontSize: 13, color: h.time === 'Kapalı' ? '#ef4444' : 'var(--text-muted)' }}>{h.time}</span>
          </div>
        ))}
      </Section>

      <Section title="Geri Arama Talebi" emoji="📲">
        {requested ? (
          <div style={{ padding: '24px 18px', textAlign: 'center' }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%', background: '#22c55e',
              border: '3px solid var(--dark-border)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 12px',
            }}>
              <Check size={24} color="white" />
            </div>
            <p style={{ fontWeight: 900, fontSize: 15, color: 'var(--text-dark)', margin: '0 0 4px' }}>Talebin alındı!</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
              {user.username}, {callback.time} arasında seni arayacağız.
            </p>
          </div>
        ) : (
          <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                Telefon Numarası
              </label>
              <input
                type="tel"
                placeholder="+90 5XX XXX XX XX"
                value={callback.phone}
                onChange={e => setCallback(c => ({ ...c, phone: e.target.value }))}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                Tercih Edilen Saat
              </label>
              <select
                value={callback.time}
                onChange={e => setCallback(c => ({ ...c, time: e.target.value }))}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                {['Sabah (09-12)', 'Öğleden Sonra (12-15)', 'Akşam (15-18)'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                Not (isteğe bağlı)
              </label>
              <input
                type="text"
                placeholder="Kısa not ekle..."
                value={callback.note}
                onChange={e => setCallback(c => ({ ...c, note: e.target.value }))}
                style={inputStyle}
              />
            </div>
          </div>
        )}
      </Section>

      {!requested && (
        <SaveButton label="Geri Arama İste" loading={loading} onClick={handleCallback} color="#f59e0b" />
      )}
    </AccountPageShell>
  );
};

export default SupportCall;
