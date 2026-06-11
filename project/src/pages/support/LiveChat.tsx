import React, { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import AccountPageShell, { card } from '../../components/AccountPageShell';
import { useApp } from '../../context/AppContext';
import { playSound } from '../../lib/sounds';

type Message = { id: number; from: 'user' | 'agent'; text: string; time: string };

const quickReplies = [
  'Puanlarım nerede?',
  'Ödül kullanamıyorum',
  'Hesap sorunu',
];

const agentReplies: Record<string, string> = {
  default: 'Anlıyorum, hemen yardımcı olayım. Biraz daha detay verebilir misin?',
  puan: 'Puanların Profil ve Ana Sayfa\'da görünür. QR tarama, görevler ve oyunlarla kazanabilirsin.',
  ödül: 'Ödül kullanımı için Envanter\'den kuponunu seç veya mağazada QR kodunu göster.',
  hesap: 'Hesap sorunları için e-posta ile de destek alabilirsin: destek@nexreward.com',
};

const now = () => new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

const LiveChat: React.FC = () => {
  const { user } = useApp();
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, from: 'agent', text: `Merhaba ${user.username}! 👋 NexReward destek ekibine hoş geldin. Nasıl yardımcı olabilirim?`, time: now() },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const replyFor = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes('puan')) return agentReplies.puan;
    if (lower.includes('ödül') || lower.includes('kupon')) return agentReplies.ödül;
    if (lower.includes('hesap') || lower.includes('şifre')) return agentReplies.hesap;
    return agentReplies.default;
  };

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    playSound('click');
    const userMsg: Message = { id: Date.now(), from: 'user', text: trimmed, time: now() };
    setMessages(m => [...m, userMsg]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      setMessages(m => [...m, {
        id: Date.now() + 1,
        from: 'agent',
        text: replyFor(trimmed),
        time: now(),
      }]);
      setTyping(false);
      playSound('success');
    }, 1200);
  };

  return (
    <AccountPageShell
      watermark="SOHBET"
      emoji="💬"
      gradient="linear-gradient(180deg,#4ade80,#16a34a)"
      title="Canlı Sohbet"
      subtitle="Ortalama yanıt süresi: 2 dakika"
      backPath="/support"
      backLabel="Desteğe Dön"
      maxWidth="2xl"
    >
      <div style={{ ...card, display: 'flex', flexDirection: 'column', height: 'clamp(420px, 60vh, 560px)', overflow: 'hidden' }}>
        <div style={{
          padding: '14px 18px', borderBottom: '2px solid var(--dark-border)',
          display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(34,197,94,0.08)',
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%', background: '#22c55e',
            border: '2px solid var(--dark-border)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, position: 'relative',
          }}>
            🎧
            <span style={{
              position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, borderRadius: '50%',
              background: '#22c55e', border: '2px solid white',
            }} />
          </div>
          <div>
            <p style={{ fontWeight: 900, fontSize: 14, color: 'var(--text-dark)', margin: 0 }}>Ayşe — Destek Uzmanı</p>
            <p style={{ fontSize: 11, color: '#22c55e', fontWeight: 700, margin: 0 }}>● Çevrimiçi</p>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {messages.map(msg => (
            <div key={msg.id} style={{ display: 'flex', justifyContent: msg.from === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '80%', padding: '10px 14px', borderRadius: 16,
                background: msg.from === 'user'
                  ? 'linear-gradient(180deg,var(--gradient-start),var(--gradient-end))'
                  : 'var(--tab-bg)',
                color: msg.from === 'user' ? 'white' : 'var(--text-dark)',
                border: '2px solid var(--dark-border)',
                boxShadow: msg.from === 'user' ? '0 3px 0 var(--dark-border)' : '0 2px 0 var(--dark-border)',
                borderBottomRightRadius: msg.from === 'user' ? 4 : 16,
                borderBottomLeftRadius: msg.from === 'agent' ? 4 : 16,
              }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, lineHeight: 1.5 }}>{msg.text}</p>
                <p style={{ margin: '4px 0 0', fontSize: 9, opacity: 0.7, textAlign: 'right' }}>{msg.time}</p>
              </div>
            </div>
          ))}
          {typing && (
            <div style={{ display: 'flex', gap: 4, padding: '8px 14px', alignSelf: 'flex-start' }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 8, height: 8, borderRadius: '50%', background: 'var(--text-muted)',
                  animation: `bounce 1s ${i * 0.15}s infinite`,
                }} />
              ))}
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div style={{ padding: '10px 14px', borderTop: '2px solid var(--dark-border)', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {quickReplies.map(q => (
            <button
              key={q}
              onClick={() => sendMessage(q)}
              style={{
                padding: '6px 12px', borderRadius: 999, fontSize: 11, fontWeight: 900,
                background: 'var(--tab-bg)', border: '2px solid var(--dark-border)', cursor: 'pointer',
                color: 'var(--text-dark)',
              }}
            >
              {q}
            </button>
          ))}
        </div>

        <form
          onSubmit={e => { e.preventDefault(); sendMessage(input); }}
          style={{ padding: '12px 14px', borderTop: '2px solid var(--dark-border)', display: 'flex', gap: 8 }}
        >
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Mesajını yaz..."
            style={{
              flex: 1, padding: '12px 14px', borderRadius: 12, fontWeight: 700, fontSize: 13,
              background: 'var(--tab-bg)', color: 'var(--text-dark)',
              border: '2.5px solid var(--dark-border)', outline: 'none',
            }}
          />
          <button
            type="submit"
            style={{
              width: 44, height: 44, borderRadius: 12, flexShrink: 0,
              background: 'linear-gradient(180deg,#4ade80,#16a34a)',
              border: '2.5px solid var(--dark-border)', boxShadow: '0 3px 0 var(--dark-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}
          >
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
