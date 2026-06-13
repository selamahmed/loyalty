import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, ChevronDown, ChevronUp, Mail, MessageSquare, Phone, Check, Send } from 'lucide-react';
import { tr } from '../lib/tr';
import { playSound } from '../lib/sounds';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import StickerAccent from '../components/StickerAccent';
import StickerHero from '../components/StickerHero';

const card = {
  background: 'var(--card-bg)',
  border: '3px solid var(--dark-border)',
  boxShadow: '0px 6px 0px var(--dark-border)',
  borderRadius: 20,
};

const faqs = [
  { q: 'Nasıl puan kazanırım?', a: 'Partner mağazalarda QR kod tarayarak, mini oyunlar oynayarak, günlük görevleri tamamlayarak, her gün giriş yaparak ve başarılar kazanarak puan kazanabilirsin.' },
  { q: 'Puanlar ne kadar süre geçerli?', a: 'Puanlar kazanıldıktan itibaren 12 ay geçerlidir. Son kullanma tarihlerini takip etmek için geçmişine bakabilirsin.' },
  { q: 'Puanlarımı başka bir hesaba aktarabilir miyim?', a: 'Puanlar hesaplar arasında devredilemez. Her hesabın kendi puan bakiyesi vardır.' },
  { q: 'Hesabıma erişimimi kaybedersem ne yapmalıyım?', a: 'Kayıtlı e-posta adresin aracılığıyla hesabına erişimi geri kazanmak için giriş sayfasındaki "Şifremi Unuttum" özelliğini kullan.' },
  { q: 'Ödüllerimi nasıl kullanırım?', a: 'Ödül Mağazasına veya Puan Kullan sayfasına git, ödülünü seç ve onayla. Kuponun Envanterinde görünecektir.' },
  { q: 'QR kod taramam neden sayılmadı?', a: 'QR kodun açıkça görünür ve hasarsız olduğundan emin ol. Her benzersiz QR kod günde yalnızca bir kez taranabilir.' },
  { q: 'Mini oyun puanları nasıl çalışır?', a: 'Her mini oyun performansına göre puan verir. Puanlar kazandığında anında bakiyene eklenir.' },
  { q: 'Seviye nasıl atlarım?', a: 'Puan kazandıkça XP biriktirirsin. Her seviyenin bir XP eşiği vardır. İlerleme Yolu sayfasından mevcut seviyeni ve bir sonraki seviye için ne kadar XP gerektiğini görebilirsin.' },
  { q: 'Ödül alırken puan yetersiz hatası alıyorum.', a: 'Yeterli puanın olduğunu kontrol et. Sayfa yenilenmiş olabilir, Profil sayfandan bakiyeni doğrula. Sorun devam ederse destek ile iletişime geç.' },
  { q: 'Google ile giriş yapamıyorum.', a: 'Google hesabının platformda kayıtlı olduğundan emin ol. Tarayıcı önbelleğini temizleyip tekrar dene. Sorun devam ederse e-posta ile giriş yapmayı dene.' },
  { q: 'Günlük görevleri nasıl tamamlarım?', a: 'Görevler sayfasına git. Her görevin yanında ne yapman gerektiği yazar (QR tara, alışveriş yap, vb.). Görevi tamamlayınca puan otomatik eklenir.' },
  { q: 'Liderlik tablosunda görünmüyorum.', a: 'Liderlik tablosu en fazla 50 kullanıcıyı gösterir. Seçili periyottaki (Haftalık/Aylık) puanın yeterliyse listede görünürsün. En Alta kaydır, "Senin Sıralaman" bölümünde kendi sıranı görebilirsin.' },
  { q: 'Bildirimler gelmiyor.', a: 'Bildirimler sayfasında bildirimlerin etkin olduğunu kontrol et. Tarayıcı bildirim izinlerini de kontrol et. Sorun yaşıyorsan bildirimleri kapatıp tekrar aç.' },
];

const contactOptions = [
  { icon: MessageSquare, label: 'Canlı Sohbet', sub: 'Ort. 2 dk', color: '#22c55e', bg: 'rgba(34,197,94,0.12)', emoji: '💬', path: '/support/live-chat' },
  { icon: Mail, label: 'E-posta', sub: '24 saat içinde', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', emoji: '📧', path: '/support/email' },
  { icon: Phone, label: 'Bizi Ara', sub: 'Pzt-Cum', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', emoji: '📞', path: '/support/call' },
];

const Support: React.FC = () => {
  const navigate = useNavigate();
  const { authUser } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', email: authUser?.email ?? '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSubmitError('');
    try {
      const { error } = await supabase.from('support_tickets').insert({
        user_id: authUser?.id ?? null,
        type:    'contact',
        status:  'open',
        priority: 'normal',
        name:    form.name,
        email:   form.email,
        subject: form.subject,
        message: form.message,
      });
      if (error) throw error;
      setSubmitted(true);
      playSound('success');
    } catch {
      setSubmitError('Mesaj gönderilemedi. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 14px', borderRadius: 12, fontWeight: 700, fontSize: 13,
    background: 'var(--tab-bg)', color: 'var(--text-dark)',
    border: '2.5px solid var(--dark-border)', boxShadow: '0 3px 0 var(--dark-border)', outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {/* Ghost watermark */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0, userSelect: 'none' }}>
        <div style={{
          position: 'absolute', top: '6%', left: '50%', transform: 'translateX(-50%) rotate(-4deg)',
          fontSize: 'clamp(50px,14vw,180px)', fontWeight: 900, color: 'var(--dark-border)',
          opacity: 0.04, whiteSpace: 'nowrap', lineHeight: 1, letterSpacing: '-0.04em',
        }}>DESTEK</div>
      </div>

      <div className="p-3 sm:p-4 lg:p-6 space-y-5 max-w-2xl mx-auto overflow-x-hidden" style={{ position: 'relative', zIndex: 1 }}>

        {/* ── Page header ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16, flexShrink: 0,
            background: 'linear-gradient(180deg,#4ade80,#16a34a)',
            border: '3px solid var(--dark-border)', boxShadow: '0 4px 0 var(--dark-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
          }}>💬</div>
          <div>
            <h1 style={{ color: 'var(--text-dark)', fontWeight: 900, fontSize: 'clamp(22px,5vw,30px)', margin: 0, lineHeight: 1 }}>Yardım & Destek</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 600, margin: '3px 0 0' }}>Yanıt bul veya bizimle iletişime geç</p>
          </div>
        </div>

        <StickerHero
          page="support"
          bg="linear-gradient(135deg,#22c55e 0%,#16a34a 100%)"
          badge="💬 DESTEK"
          title="Yardım al,"
          highlight="hemen yanıt!"
          accentSeed="support-hero-accent"
        />

        {/* ── Contact options ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
          {contactOptions.map((c, i) => (
            <button
              key={c.label}
              onClick={() => { playSound('click'); navigate(c.path); }}
              style={{
              ...card, padding: '16px 10px', textAlign: 'center', cursor: 'pointer',
              transition: 'transform 0.1s, box-shadow 0.1s', position: 'relative', overflow: 'visible',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; }}
            >
              <StickerAccent seed={`support-contact-${i}`} size={20} rotate={-6 + i * 8} style={{ position: 'absolute', top: -6, right: 4 }} />
              <div style={{
                width: 48, height: 48, borderRadius: 14, background: c.bg,
                border: `2.5px solid ${c.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 10px', fontSize: 22, boxShadow: `0 3px 0 ${c.color}44`,
              }}>{c.emoji}</div>
              <p style={{ fontWeight: 900, fontSize: 13, color: 'var(--text-dark)', margin: '0 0 2px' }}>{c.label}</p>
              <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: 0, fontWeight: 600 }}>{c.sub}</p>
            </button>
          ))}
        </div>

        {/* ── FAQ ── */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <HelpCircle size={20} color="var(--primary-blue)" />
            <h2 style={{ fontWeight: 900, fontSize: 17, color: 'var(--text-dark)', margin: 0 }}>Sık Sorulan Sorular</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {faqs.map((faq, i) => (
              <div key={i} style={{ ...card, overflow: 'hidden' }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 18px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', gap: 12,
                  }}
                >
                  <span style={{ fontWeight: 900, fontSize: 13, color: 'var(--text-dark)', flex: 1 }}>{faq.q}</span>
                  <div style={{
                    width: 28, height: 28, borderRadius: 8, background: openFaq === i ? 'linear-gradient(180deg,var(--gradient-start),var(--gradient-end))' : 'var(--tab-bg)',
                    border: '2px solid var(--dark-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s',
                  }}>
                    {openFaq === i ? <ChevronUp size={14} color="white" /> : <ChevronDown size={14} color="var(--text-muted)" />}
                  </div>
                </button>
                {openFaq === i && (
                  <div style={{ padding: '0 18px 16px', borderTop: '2px solid var(--dark-border)', paddingTop: 14, animation: 'faqOpen 0.2s ease-out' }}>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Contact form ── */}
        <div>
          <h2 style={{ fontWeight: 900, fontSize: 17, color: 'var(--text-dark)', margin: '0 0 12px' }}>Bize Ulaş</h2>
          {submitted ? (
            <div style={{ ...card, border: '3px solid #22c55e', boxShadow: '0 6px 0 #16a34a', padding: 32, textAlign: 'center', background: 'rgba(34,197,94,0.06)' }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#22c55e', border: '3px solid var(--dark-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <Check size={28} color="white" />
              </div>
              <p style={{ fontWeight: 900, fontSize: 18, color: 'var(--text-dark)', margin: '0 0 6px' }}>Mesaj Gönderildi!</p>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: 0 }}>En kısa sürede sana geri döneceğiz.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ ...card, padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 6 }}>Ad Soyad</label>
                  <input type="text" required placeholder="Ad Soyad" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 6 }}>E-posta</label>
                  <input type="email" required placeholder="E-posta" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 6 }}>Konu</label>
                <input type="text" required placeholder="Konu" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 6 }}>Mesaj</label>
                <textarea required placeholder="Mesajınız..." rows={4} value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} style={{ ...inputStyle, resize: 'vertical', minHeight: 100 }} />
              </div>
              <button type="submit" disabled={loading} style={{
                padding: '14px', borderRadius: 14, fontWeight: 900, fontSize: 15,
                background: loading ? '#94a3b8' : 'linear-gradient(180deg,var(--gradient-start),var(--gradient-end))', color: 'white',
                border: '3px solid var(--dark-border)', boxShadow: loading ? 'none' : '0 5px 0 var(--dark-border)',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.1s',
              }}>
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>⏳ Gönderiliyor...</span>
                ) : (
                  <><Send size={16} /> Gönder</>
                )}
              </button>
              {submitError && (
                <p style={{ fontSize: 12, color: '#ef4444', fontWeight: 700, margin: '4px 0 0', textAlign: 'center' }}>{submitError}</p>
              )}
            </form>
          )}
        </div>

      </div>

      <style>{`
        @keyframes faqOpen {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Support;
