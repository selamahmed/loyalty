import React from 'react';

import StickerAccent from './StickerAccent';

import { pageGroup, type PageStickerKey } from '../lib/pageStickers';



const cardShell = {

  border: '3px solid var(--dark-border)',

  boxShadow: '0px 6px 0px var(--dark-border)',

  borderRadius: 20,

};



type StickerHeroProps = {

  page: PageStickerKey;

  bg: string;

  badge: string;

  title: string;

  highlight?: string;

  height?: number;

  stickerSize?: number;

  stickerRotate?: number;

  accentSeed?: string;

};



/** Neo-brutal banner — large colorful sticker + small shape accent. */

const StickerHero: React.FC<StickerHeroProps> = ({

  page,

  bg,

  badge,

  title,

  highlight,

  height = 130,

  stickerSize,

  stickerRotate = 8,

  accentSeed,

}) => {

  const size = stickerSize ?? Math.round(height * 0.62);



  return (

    <div style={{ ...cardShell, overflow: 'hidden', position: 'relative', height, background: bg }}>

      <div style={{

        position: 'absolute', inset: 0, padding: '18px 20px',

        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', zIndex: 1, maxWidth: '58%',

      }}>

        <div style={{

          display: 'inline-flex', alignItems: 'center', gap: 5, marginBottom: 7, width: 'fit-content',

          background: '#000', color: '#FFE500', borderRadius: 999, padding: '3px 10px',

          fontSize: 9, fontWeight: 900, letterSpacing: '0.1em', border: '2px solid #000',

          boxShadow: '2px 2px 0 rgba(0,0,0,0.35)',

        }}>

          {badge}

        </div>

        <h2 style={{

          fontWeight: 900, fontSize: 'clamp(15px,3vw,20px)', margin: highlight ? '0 0 3px' : 0,

          color: 'white', letterSpacing: '-0.03em', lineHeight: 1.1,

        }}>

          {title}

        </h2>

        {highlight && (

          <h2 style={{

            fontWeight: 900, fontSize: 'clamp(15px,3vw,20px)', margin: 0,

            color: '#FFE500', letterSpacing: '-0.03em', lineHeight: 1.1,

          }}>

            {highlight}

          </h2>

        )}

      </div>

      <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', zIndex: 2 }}>

        <StickerAccent group={pageGroup(page)} variant="colorful" size={size} rotate={stickerRotate} />

      </div>

      {accentSeed && (

        <StickerAccent

          seed={accentSeed}

          variant="shape"

          size={Math.round(size * 0.38)}

          rotate={-12}

          style={{ position: 'absolute', right: size + 8, bottom: 10, zIndex: 2, opacity: 0.85 }}

        />

      )}

    </div>

  );

};



export default StickerHero;


