import React, { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import { createInventoryQRPayload } from '../lib/qrUtils';

interface InventoryQRItem {
  id: string;
  code: string;
  title: string;
  type: string;
  expires: string;
}

interface Props {
  item: InventoryQRItem;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Client-side QR renderer with a stable payload per item session.
 * Prevents regeneration on every parent re-render (e.g. countdown ticks).
 */
export const InventoryQRCode: React.FC<Props> = ({ item, size = 160, style }) => {
  const qrData = useMemo(
    () => JSON.stringify(createInventoryQRPayload(item)),
    [item.id, item.code, item.title, item.type, item.expires],
  );

  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setDataUrl(null);
    setFailed(false);

    QRCode.toDataURL(qrData, {
      width: size,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: { dark: '#000000', light: '#ffffff' },
    })
      .then(url => { if (!cancelled) setDataUrl(url); })
      .catch(() => { if (!cancelled) setFailed(true); });

    return () => { cancelled = true; };
  }, [qrData, size]);

  if (dataUrl) {
    return (
      <img
        src={dataUrl}
        alt={`QR: ${item.code}`}
        width={size}
        height={size}
        style={{ display: 'block', borderRadius: 8, ...style }}
      />
    );
  }

  if (failed) {
    return (
      <img
        src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrData)}&size=${size}x${size}&margin=4`}
        alt={`QR: ${item.code}`}
        width={size}
        height={size}
        style={{ display: 'block', borderRadius: 8, ...style }}
      />
    );
  }

  return (
    <div
      style={{
        width: size, height: size, borderRadius: 8,
        background: 'var(--tab-bg)',
        border: '2px dashed var(--dark-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        ...style,
      }}
    >
      <div style={{
        width: size * 0.35, height: size * 0.35, borderRadius: 6,
        border: '2px solid var(--dark-border)', opacity: 0.25,
        animation: 'qrPulse 1.2s ease-in-out infinite',
      }} />
      <style>{`@keyframes qrPulse { 0%,100%{opacity:.2} 50%{opacity:.5} }`}</style>
    </div>
  );
};

export default InventoryQRCode;
