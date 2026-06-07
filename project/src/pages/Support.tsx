import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Mail, MessageSquare, Phone, Check, Send } from 'lucide-react';
import { tr } from '../lib/tr';

const faqs = [
  { q: 'How do I earn points?', a: 'You can earn points by scanning QR codes at partner stores, playing mini games, completing daily missions, logging in daily, and earning achievements.' },
  { q: 'How long do points last?', a: 'Points are valid for 12 months from the date they are earned. Check your history to monitor expiration dates.' },
  { q: 'Can I transfer points to another account?', a: 'Points are non-transferable between accounts. Each account has its own points balance.' },
  { q: 'What happens if I lose my account access?', a: 'Use the "Forgot Password" feature on the login page to recover access to your account via your registered email.' },
  { q: 'How do I redeem rewards?', a: 'Go to the Rewards Shop or Redeem Points page, choose your reward, and confirm. Your voucher will appear in your Inventory.' },
  { q: 'Why was my QR scan not counted?', a: 'Ensure the QR code is clearly visible and not damaged. Each unique QR code can only be scanned once per day.' },
  { q: 'How do mini game points work?', a: 'Each mini game awards points based on your performance. Points are added instantly to your balance when you win.' },
];

const Support: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setSubmitted(true);
    setLoading(false);
  };

  return (
    <div className="p-4 lg:p-6 space-y-8 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Help & Support</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Find answers or contact us</p>
      </div>

      {/* Contact options */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: MessageSquare, label: 'Live Chat', sub: 'Avg 2 min', color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' },
          { icon: Mail, label: 'Email', sub: 'Within 24h', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
          { icon: Phone, label: 'Call Us', sub: 'Mon-Fri', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' },
        ].map(c => (
          <button key={c.label} className="card p-4 text-center hover:shadow-md transition-shadow hover:scale-[1.02] active:scale-[0.98]">
            <div className={`w-12 h-12 rounded-2xl ${c.color} flex items-center justify-center mx-auto mb-2`}>
              <c.icon size={20} />
            </div>
            <p className="font-bold text-sm text-gray-900 dark:text-white">{c.label}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{c.sub}</p>
          </button>
        ))}
      </div>

      {/* FAQ */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <HelpCircle size={20} className="text-[#7B6EF6] dark:text-[#4F8EF7]" />
          <h2 className="font-black text-xl text-gray-900 dark:text-white">Frequently Asked Questions</h2>
        </div>
        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <div key={i} className="card overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <span className="font-bold text-sm text-gray-900 dark:text-white pr-4">{faq.q}</span>
                {openFaq === i ? <ChevronUp size={16} className="text-gray-400 flex-shrink-0" /> : <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />}
              </button>
              {openFaq === i && (
                <div className="px-4 pb-4 border-t-2 border-black dark:border-gray-700 pt-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact form */}
      <div>
        <h2 className="font-black text-xl text-gray-900 dark:text-white mb-4">Send Us a Message</h2>
        {submitted ? (
          <div className="card p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500 border-2 border-black dark:border-gray-600 flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-white" />
            </div>
            <h3 className="font-black text-xl text-gray-900 dark:text-white">Message Sent!</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">We'll get back to you within 24 hours.</p>
            <button onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }); }} className="btn-secondary mt-4">
              Send Another
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-sm text-gray-900 dark:text-white mb-2">Name</label>
                <input type="text" placeholder="Your name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-field" required />
              </div>
              <div>
                <label className="block font-bold text-sm text-gray-900 dark:text-white mb-2">Email</label>
                <input type="email" placeholder="you@email.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="input-field" required />
              </div>
            </div>
            <div>
              <label className="block font-bold text-sm text-gray-900 dark:text-white mb-2">Subject</label>
              <select value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} className="input-field" required>
                <option value="">Select a topic...</option>
                <option>Points & Rewards</option>
                <option>Account Issues</option>
                <option>Technical Problem</option>
                <option>Feature Request</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-sm text-gray-900 dark:text-white mb-2">Message</label>
              <textarea
                placeholder="Describe your issue or question..."
                value={form.message}
                onChange={e => setForm({...form, message: e.target.value})}
                className="input-field resize-none"
                rows={4}
                required
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Send size={16} /> Send Message</>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Support;
