import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import type { LegalSection } from '../lib/legalContent';
import { LEGAL_META } from '../lib/legalContent';

type LegalDocumentPageProps = {
  title: string;
  subtitle: string;
  sections: LegalSection[];
  backTo?: string;
};

const LegalDocumentPage: React.FC<LegalDocumentPageProps> = ({
  title,
  subtitle,
  sections,
  backTo = '/register',
}) => {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen"
      style={{ background: 'var(--bg-color, #FFF8F0)', color: 'var(--text-dark, #111)' }}
    >
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          background: 'var(--card-bg, #fff)',
          borderBottom: '2.5px solid var(--dark-border, #000)',
          padding: '14px 20px',
        }}
      >
        <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            type="button"
            onClick={() => navigate(backTo)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 12px',
              borderRadius: 12,
              border: '2px solid var(--dark-border, #000)',
              background: 'var(--tab-bg, #f5f5f5)',
              fontWeight: 800,
              fontSize: 12,
              cursor: 'pointer',
              boxShadow: '0 2px 0 var(--dark-border, #000)',
            }}
          >
            <ArrowLeft size={14} />
            Geri
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            <FileText size={18} color="#9122FF" />
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, fontWeight: 900, fontSize: 14, lineHeight: 1.2 }}>{title}</p>
              <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted, #666)' }}>{LEGAL_META.appName}</p>
            </div>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 760, margin: '0 auto', padding: '28px 20px 56px' }}>
        <div
          className="card"
          style={{
            padding: '24px 22px',
            marginBottom: 20,
            border: '3px solid var(--dark-border, #000)',
            boxShadow: '0 6px 0 var(--dark-border, #000)',
            borderRadius: 20,
            background: 'var(--card-bg, #fff)',
          }}
        >
          <h1 style={{ margin: '0 0 8px', fontWeight: 900, fontSize: 'clamp(22px, 4vw, 30px)', lineHeight: 1.15 }}>
            {title}
          </h1>
          <p style={{ margin: 0, color: 'var(--text-muted, #666)', fontSize: 14, lineHeight: 1.6 }}>{subtitle}</p>
          <p style={{ margin: '12px 0 0', fontSize: 12, fontWeight: 700, color: '#9122FF' }}>
            Son güncelleme: {LEGAL_META.lastUpdated}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {sections.map(section => (
            <section
              key={section.id}
              id={section.id}
              className="card"
              style={{
                padding: '20px 18px',
                border: '2.5px solid var(--dark-border, #000)',
                boxShadow: '0 4px 0 var(--dark-border, #000)',
                borderRadius: 18,
                background: 'var(--card-bg, #fff)',
              }}
            >
              <h2 style={{ margin: '0 0 12px', fontWeight: 900, fontSize: 16 }}>{section.title}</h2>
              {section.paragraphs.map((p, i) => (
                <p key={i} style={{ margin: '0 0 10px', fontSize: 14, lineHeight: 1.7, color: 'var(--text-dark, #222)' }}>
                  {p}
                </p>
              ))}
              {section.bullets && (
                <ul style={{ margin: '4px 0 0', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {section.bullets.map((b, i) => (
                    <li key={i} style={{ fontSize: 14, lineHeight: 1.65, color: 'var(--text-dark, #222)' }}>{b}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        <p style={{ marginTop: 24, textAlign: 'center', fontSize: 12, color: 'var(--text-muted, #666)' }}>
          Sorularınız için{' '}
          <a href={`mailto:${LEGAL_META.contactEmail}`} style={{ color: '#9122FF', fontWeight: 800 }}>
            {LEGAL_META.contactEmail}
          </a>
        </p>
      </main>
    </div>
  );
};

export default LegalDocumentPage;
