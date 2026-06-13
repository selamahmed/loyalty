import React, { useEffect, useRef, useState } from 'react';
import { Send, ChevronDown } from 'lucide-react';
import AccountPageShell, { card } from '../../components/AccountPageShell';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { playSound } from '../../lib/sounds';

type Message = { id: number; from: 'user' | 'agent'; text: string; time: string };
type Category = { id: string; label: string; emoji: string; questions: { q: string; a: string }[] };

const CATEGORIES: Category[] = [
  {
    id: 'points', label: 'Puan İşlemleri', emoji: '⭐',
    questions: [
      { q: 'Puanlarım ne zaman gelecek?',    a: 'QR tarama ve görev puanları anlık eklenir. Mağaza puanları 24 saat içinde hesaba geçer. Hâlâ gelmediyse işlem ID\'nizi paylaşın.' },
      { q: 'Puan bakiyem yanlış görünüyor',  a: 'Sayfayı yenileyip tekrar kontrol et. Farklı oturum açık olabilir. Sorun devam ederse destek@nexreward.com adresine yaz.' },
      { q: 'Puanlarımı nasıl kullanırım?',   a: 'Ödül Mağazası sayfasına git → ödülü seç → "Satın Al" butonuna bas. Puan anında düşer, kupon Envanterinde görünür.' },
    ],
  },
  {
    id: 'qr', label: 'QR Kod', emoji: '📷',
    questions: [
      { q: 'QR kod okutulmuyor',              a: 'Kameranın net görmesi gerekiyor. QR kod ekranda veya kağıtta net görünmeli. Yeterli ışık sağla. Hâlâ çalışmıyorsa kodu manuel giriş bölümüne yaz.' },
      { q: 'QR kodu zaten tarandı hatası',    a: 'Her QR kod tek kez kullanılabilir. Yeni bir alışveriş için kasiyerden yeni QR iste.' },
      { q: 'Kamera açılmıyor',                a: 'Tarayıcıda kamera iznini kontrol et. Ayarlar → Site Ayarları → Kamera → İzin Ver. Sonra sayfayı yenile.' },
    ],
  },
  {
    id: 'account', label: 'Hesap', emoji: '👤',
    questions: [
      { q: 'Şifremi unuttum',                 a: 'Giriş sayfasında "Şifremi Unuttum" bağlantısına tıkla. E-posta adresine sıfırlama linki gönderilecek.' },
      { q: 'E-posta adresimi değiştirmek istiyorum', a: 'Şu an için e-posta değişikliği destek üzerinden yapılıyor. Lütfen mevcut ve yeni e-posta adresini bize bildirin.' },
      { q: 'Hesabım askıya alındı',           a: 'Hesabınızın askıya alınma sebebini öğrenmek için destek ekibimizle iletişime geçin. Kural ihlali tespit edilmişse bilgilendirileceksiniz.' },
    ],
  },
  {
    id: 'rewards', label: 'Ödüller', emoji: '🎁',
    questions: [
      { q: 'Ödülüm envanterime gelmedi',      a: 'Satın alma onaylandıktan sonra Envanter sayfasını kontrol et. Sayfa yeniledikten sonra görünmüyorsa destek aç.' },
      { q: 'Ödül süresi doldu mu?',           a: 'Ödüllerin son kullanma tarihi Envanter sayfasında görünür. Süresi geçmiş ödüller kullanılamaz ama puan iadesi için başvurabilirsiniz.' },
      { q: 'Ödül kullanırken hata alıyorum',  a: 'Ödülün geçerlilik tarihini ve kullanım koşullarını kontrol et. Sorun devam ederse ödül ID\'ni paylaş, inceleyelim.' },
    ],
  },
  {
    id: 'technical', label: 'Teknik Sorun', emoji: '⚙️',
    questions: [
      { q: 'Sayfa açılmıyor / yüklenmiyor',   a: 'Tarayıcı önbelleğini temizle (Ctrl+Shift+R). Farklı bir tarayıcı dene. Sorun devam ederse sistem durumu sayfamızı kontrol et.' },
      { q: 'Bildirimler gelmiyor',             a: 'Tarayıcı bildirim izinleri açık olmalı. Ayarlar → Site Ayarları → Bildirimler → İzin Ver. Ardından sayfayı yenile.' },
      { q: 'Google ile giriş çalışmıyor',      a: 'Google hesabınızın sistemde kayıtlı olduğundan emin olun. Tarayıcı çerezlerini temizleyip tekrar deneyin. Sorun devam ederse şifre ile giriş yapmayı deneyin.' },
    ],
  },
];

const GREETING = (name: string) =>
  `Merhaba ${name}! 👋 NexReward destek ekibine hoş geldin. Sana nasıl yardımcı olabilirim? Aşağıdaki kategorilerden birini seçebilir veya doğrudan yazabilirsin.`;

const FALLBACK = 'Konuyu not aldım, uzman ekibimize iletiyorum. Genellikle 2-4 saat içinde e-posta ile dönüş yapıyoruz. Başka bir sorun var mı?';

const now = () => new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

function autoReply(text: string): string {
  const t = text.toLowerCase();
  if (t.includes('puan') || t.includes('bakiye'))          return CATEGORIES[0].questions[0].a;
  if (t.includes('yanlış') || t.includes('gelmed'))        return CATEGORIES[0].questions[1].a;
  if (t.includes('kullan') && t.includes('puan'))          return CATEGORIES[0].questions[2].a;
  if (t.includes('qr') || t.includes('kamera'))            return CATEGORIES[1].questions[0].a;
  if (t.includes('tarandı') || t.includes('zaten'))        return CATEGORIES[1].questions[1].a;
  if (t.includes('şifre') || t.includes('unuttum'))        return CATEGORIES[2].questions[0].a;
  if (t.includes('askı') || t.includes('ban'))             return CATEGORIES[2].questions[2].a;
  if (t.includes('envanter') || t.includes('gelmed'))      return CATEGORIES[3].questions[0].a;
  if (t.includes('süre') || t.includes('doldu'))           return CATEGORIES[3].questions[1].a;
  if (t.includes('yüklen') || t.includes('açılm'))         return CATEGORIES[4].questions[0].a;
  if (t.includes('bildirim'))                              return CATEGORIES[4].questions[1].a;
  if (t.includes('google'))                                return CATEGORIES[4].questions[2].a;
  if (t.includes('teşekkür') || t.includes('tamam'))       return 'Rica ederim! 😊 Başka bir sorun olursa buradayım.';
  if (t.includes('merhaba') || t.includes('selam'))        return 'Merhaba! 👋 Sana nasıl yardımcı olabilirim?';
  return FALLBACK;
}

const LiveChat: React.FC = () => {
  const { authUser, profile } = useAuth();
  const username = profile?.username ?? authUser?.email?.split('@')[0] ?? 'Kullanıcı';

  const [messages, setMessages] = useState<Message[]>([
    { id: 1, from: 'agent', text: GREETING(username), time: now() },
  ]);
  const [input, setInput]           = useState('');
  const [typing, setTyping]         = useState(false);
  const [activeCategory, setActive] = useState<Category | null>(null);
  const [ticketSent, setTicketSent] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, typing]);

  const addAgent = (text: string) => {
    setMessages(m => [...m, { id: Date.now() + 1, from: 'agent', text, time: now() }]);
    playSound('success');
  };

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    playSound('click');
    setMessages(m => [...m, { id: Date.now(), from: 'user', text: trimmed, time: now() }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      addAgent(autoReply(trimmed));
    }, 900 + Math.random() * 600);
  };

  const pickQuestion = (q: { q: string; a: string }) => {
    playSound('click');
    setMessages(m => [...m, { id: Date.now(), from: 'user', text: q.q, time: now() }]);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      addAgent(q.a);
      setActive(null);
    }, 700);
  };

  // Save entire chat as ticket when user closes or explicitly requests
  const saveTicket = async () => {
    if (ticketSent || messages.length < 3) return;
    const transcript = messages.map(m => `[${m.from === 'user' ? 'Kullanıcı' : 'Destek'}] ${m.text}`).join('\n');
    try {
      await supabase.from('support_tickets').insert({
        user_id: authUser?.id ?? null,
        type:    'chat',
        status:  'resolved',
        priority: 'low',
        name:    username,
        email:   authUser?.email ?? '',
        subject: 'Canlı Sohbet Kaydı',
        message: transcript,
      });
      setTicketSent(true);
    } catch { /* ignore */ }
  };

  return (
    <AccountPageShell
      watermark="SOHBET"
      emoji="💬"
      gradient="linear-gradient(180deg,#4ade80,#16a34a)"
      title="Canlı Destek"
      subtitle="Ortalama yanıt: 2 dakika"
      backPath="/support"
      backLabel="Desteğe Dön"
      maxWidth="2xl"
    >
      {/* Chat window */}
      <div style={{ ...card, display: 'flex', flexDirection: 'column', height: 'clamp(460px,65vh,600px)', overflow: 'hidden' }}>

        {/* Agent header */}
        <div style={{ padding: '12px 18px', borderBottom: '2px solid var(--dark-border)', display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(34,197,94,0.08)' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#22c55e', border: '2px solid var(--dark-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🎧</div>
            <span style={{ position: 'absolute', bottom: 0, right: 0, width: 11, height: 11, borderRadius: '50%', background: '#22c55e', border: '2px solid var(--card-bg)' }} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 900, fontSize: 14, color: 'var(--text-dark)', margin: 0 }}>Nexchat — AI Destek</p>
            <p style={{ fontSize: 11, color: '#22c55e', fontWeight: 700, margin: 0 }}>● Çevrimiçi · 7/24</p>
          </div>
          <button onClick={saveTicket} disabled={ticketSent || messages.length < 3} style={{ padding: '6px 12px', borderRadius: 10, fontSize: 10, fontWeight: 900, cursor: 'pointer', background: ticketSent ? 'rgba(34,197,94,0.1)' : 'var(--tab-bg)', color: ticketSent ? '#22c55e' : 'var(--text-muted)', border: '2px solid var(--dark-border)' }}>
            {ticketSent ? '✓ Kaydedildi' : '💾 Kaydet'}
          </button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {messages.map(msg => (
            <div key={msg.id} style={{ display: 'flex', justifyContent: msg.from === 'user' ? 'flex-end' : 'flex-start' }}>
              {msg.from === 'agent' && (
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0, marginRight: 8, alignSelf: 'flex-end' }}>🎧</div>
              )}
              <div style={{
                maxWidth: '78%', padding: '10px 14px', borderRadius: 16,
                background: msg.from === 'user' ? 'linear-gradient(180deg,var(--gradient-start),var(--gradient-end))' : 'var(--tab-bg)',
                color: msg.from === 'user' ? 'white' : 'var(--text-dark)',
                border: '2px solid var(--dark-border)',
                boxShadow: msg.from === 'user' ? '0 3px 0 var(--dark-border)' : '0 2px 0 var(--dark-border)',
                borderBottomRightRadius: msg.from === 'user' ? 4 : 16,
                borderBottomLeftRadius: msg.from === 'agent' ? 4 : 16,
              }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, lineHeight: 1.5 }}>{msg.text}</p>
                <p style={{ margin: '4px 0 0', fontSize: 9, opacity: 0.6, textAlign: 'right' }}>{msg.time}</p>
              </div>
            </div>
          ))}
          {typing && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>🎧</div>
              <div style={{ display: 'flex', gap: 4, padding: '10px 14px', background: 'var(--tab-bg)', border: '2px solid var(--dark-border)', borderRadius: 16, borderBottomLeftRadius: 4 }}>
                {[0, 1, 2].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--text-muted)', animation: `bounce 1s ${i * 0.15}s infinite` }} />)}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Category selector */}
        {activeCategory ? (
          <div style={{ padding: '10px 14px', borderTop: '2px solid var(--dark-border)', background: 'var(--tab-bg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontWeight: 900, fontSize: 12, color: 'var(--text-dark)' }}>{activeCategory.emoji} {activeCategory.label}</span>
              <button onClick={() => setActive(null)} style={{ fontSize: 12, fontWeight: 900, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>✕ Kapat</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {activeCategory.questions.map((q, i) => (
                <button key={i} onClick={() => pickQuestion(q)} style={{ textAlign: 'left', padding: '8px 12px', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer', background: 'var(--card-bg)', color: 'var(--text-dark)', border: '2px solid var(--dark-border)' }}>
                  {q.q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ padding: '8px 14px', borderTop: '2px solid var(--dark-border)', overflowX: 'auto' }}>
            <p style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 6px' }}>Kategori seç:</p>
            <div style={{ display: 'flex', gap: 6 }}>
              {CATEGORIES.map(cat => (
                <button key={cat.id} onClick={() => setActive(cat)} style={{ flexShrink: 0, padding: '6px 12px', borderRadius: 999, fontSize: 11, fontWeight: 900, cursor: 'pointer', background: 'var(--tab-bg)', border: '2px solid var(--dark-border)', color: 'var(--text-dark)', whiteSpace: 'nowrap' }}>
                  {cat.emoji} {cat.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <form onSubmit={e => { e.preventDefault(); sendMessage(input); }} style={{ padding: '12px 14px', borderTop: '2px solid var(--dark-border)', display: 'flex', gap: 8 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Sorunuzu yazın..."
            style={{ flex: 1, padding: '12px 14px', borderRadius: 12, fontWeight: 700, fontSize: 13, background: 'var(--tab-bg)', color: 'var(--text-dark)', border: '2.5px solid var(--dark-border)', outline: 'none' }}
          />
          <button type="submit" style={{ width: 46, height: 46, borderRadius: 12, flexShrink: 0, background: 'linear-gradient(180deg,#4ade80,#16a34a)', border: '2.5px solid var(--dark-border)', boxShadow: '0 3px 0 var(--dark-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Send size={18} color="white" />
          </button>
        </form>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>
    </AccountPageShell>
  );
};

export default LiveChat;
