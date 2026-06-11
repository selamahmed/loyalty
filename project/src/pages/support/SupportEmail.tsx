import React, { useState } from 'react';
import { Check, Send } from 'lucide-react';
import AccountPageShell, { Section, inputStyle } from '../../components/AccountPageShell';
import { useApp } from '../../context/AppContext';
import { playSound } from '../../lib/sounds';

const subjects = [
  'Puan & Ödül Sorunu',
  'Hesap & Giriş',
  'Teknik Destek',
  'Öneri & Geri Bildirim',
  'Diğer',
];

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 900, color: 'var(--text-muted)',
  textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6,
};

const SupportEmail: React.FC = () => {
  const { user } = useApp();
  const [form, setForm] = useState({
    name: user.username,
    email: user.email,
    subject: subjects[0],
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.message.trim()) return;
    setLoading(true);
    playSound('click');
    await new Promise(r => setTimeout(r, 1200));
    setSubmitted(true);
    setLoading(false);
    playSound('success');
  };

  return (
    <AccountPageShell
      watermark="E-POSTA"
      emoji="📧"
      gradient="linear-gradient(180deg,#60a5fa,#2563eb)"
      title="E-posta Desteği"
      subtitle="24 saat içinde yanıt alırsın"
      backPath="/support"
      backLabel="Desteğe Dön"
      maxWidth="2xl"
    >
      {submitted ? (
        <div style={{
          background: 'rgba(34,197,94,0.06)', border: '3px solid #22c55e', boxShadow: '0 6px 0 #16a34a',
          borderRadius: 20, padding: 32, textAlign: 'center',
        }}>
          <div style={{
            width: 60, height: 60, borderRadius: '50%', background: '#22c55e',
            border: '3px solid var(--dark-border)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px',
          }}>
            <Check size={28} color="white" />
          </div>
          <p style={{ fontWeight: 900, fontSize: 18, color: 'var(--text-dark)', margin: '0 0 6px' }}>E-posta Gönderildi!</p>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: 0 }}>
            <strong>{form.email}</strong> adresine 24 saat içinde dönüş yapacağız.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <Section title="İletişim Bilgileri" emoji="📋">
            <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Ad Soyad</label>
                  <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>E-posta</label>
                  <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Konu</label>
                <select
                  value={form.subject}
                  onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                >
                  {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Mesaj</label>
                <textarea
                  required
                  rows={5}
                  placeholder="Sorununu veya talebini detaylı anlat..."
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  style={{ ...inputStyle, resize: 'vertical', minHeight: 120 }}
                />
              </div>
            </div>
          </Section>

          <div style={{
            marginTop: 16, padding: '14px 16px', borderRadius: 14,
            background: 'rgba(59,130,246,0.08)', border: '2px solid rgba(59,130,246,0.3)',
          }}>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0, lineHeight: 1.6, fontWeight: 600 }}>
              Doğrudan yazmak istersen: <strong style={{ color: '#3b82f6' }}>destek@nexreward.com</strong>
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', marginTop: 16, padding: '14px', borderRadius: 14, fontWeight: 900, fontSize: 15,
              background: loading ? '#94a3b8' : 'linear-gradient(180deg,#60a5fa,#2563eb)', color: 'white',
              border: '3px solid var(--dark-border)', boxShadow: loading ? 'none' : '0 5px 0 var(--dark-border)',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            {loading ? '⏳ Gönderiliyor...' : <><Send size={16} /> E-posta Gönder</>}
          </button>
        </form>
      )}
    </AccountPageShell>
  );
};

export default SupportEmail;
