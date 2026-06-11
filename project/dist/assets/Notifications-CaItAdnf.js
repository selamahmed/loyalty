import{r as c,j as e}from"./vendor-react-CS1vDJqi.js";import{n as k,p as s}from"./index-CDnoVnp1.js";import{t as x}from"./tr-BKHdpGmM.js";import{l as w,O as y,V as j}from"./vendor-icons-vlfuWXpF.js";const f={reward:{gradient:"linear-gradient(135deg,#22c55e,#16a34a)",icon:"🎁",border:"#22c55e",accent:"rgba(34,197,94,0.1)"},achievement:{gradient:"linear-gradient(135deg,#f59e0b,#d97706)",icon:"🏆",border:"#f59e0b",accent:"rgba(245,158,11,0.1)"},points:{gradient:"linear-gradient(135deg,#7B6EF6,#4F8EF7)",icon:"⭐",border:"#7B6EF6",accent:"rgba(123,110,246,0.1)"},event:{gradient:"linear-gradient(135deg,#3b82f6,#1d4ed8)",icon:"🎉",border:"#3b82f6",accent:"rgba(59,130,246,0.1)"},system:{gradient:"linear-gradient(135deg,#9ca3af,#6b7280)",icon:"⚙️",border:"#6b7280",accent:"rgba(107,114,128,0.08)"}},m={all:"Tümü",unread:"Okunmamış",reward:"Ödüller",achievement:"Başarılar",points:"Puanlar",event:"Etkinlikler",system:"Sistem"},C=()=>{const[a,l]=c.useState(k),[o,g]=c.useState("all"),d=o==="all"?a:o==="unread"?a.filter(t=>!t.read):a.filter(t=>t.type===o),n=a.filter(t=>!t.read).length,b=t=>{s("click"),l(r=>r.map(i=>i.id===t?{...i,read:!0}:i))},h=()=>{s("success"),l(t=>t.map(r=>({...r,read:!0})))},v=t=>{s("click"),l(r=>r.filter(i=>i.id!==t))};return e.jsxs("div",{className:"notif-page",children:[e.jsx("div",{className:"notif-watermark",children:"BİLDİRİMLER"}),e.jsxs("div",{className:"notif-container",children:[e.jsxs("div",{className:"notif-header",children:[e.jsxs("div",{className:"notif-header-left",children:[e.jsxs("div",{className:"notif-bell-wrap",children:[e.jsx("div",{className:`notif-bell-icon ${n>0?"notif-bell-ring":""}`,children:"🔔"}),n>0&&e.jsx("div",{className:"notif-badge",children:n})]}),e.jsxs("div",{children:[e.jsx("h1",{className:"notif-title",children:x.notifications.title}),e.jsxs("p",{className:"notif-subtitle",children:[n," okunmamış bildirim"]})]})]}),n>0&&e.jsxs("button",{onClick:h,className:"notif-mark-all-btn",children:[e.jsx(w,{size:14}),e.jsx("span",{className:"notif-mark-all-text",children:"Tümünü Okundu İşaretle"})]})]}),e.jsx("div",{className:"notif-filters",children:Object.keys(m).map(t=>e.jsx("button",{onClick:()=>{s("click"),g(t)},className:`notif-filter-pill ${o===t?"notif-filter-active":""}`,children:m[t]},t))}),d.length===0?e.jsxs("div",{className:"notif-empty",children:[e.jsx("p",{style:{fontSize:44,margin:"0 0 12px"},children:"🔔"}),e.jsx("p",{className:"notif-empty-title",children:x.notifications.empty}),e.jsx("p",{className:"notif-empty-sub",children:"Şimdilik hepsi bu kadar!"})]}):e.jsx("div",{className:"notif-list text-left justify-start items-center flex-col",children:d.map((t,r)=>{const i=f[t.type]||f.system,p=t.type==="achievement"||t.type==="reward";return e.jsxs("div",{className:"notif-card",onClick:()=>b(t.id),style:{border:t.read?"3px solid var(--dark-border)":`3px solid ${i.border}`,boxShadow:t.read?"0 6px 0 var(--dark-border)":`0 6px 0 ${i.border}88`,background:t.read?"var(--card-bg)":i.accent,animationDelay:`${r*.05}s`},children:[e.jsxs("div",{className:"notif-icon",style:{background:i.gradient},children:[i.icon,p&&e.jsx(y,{size:11,color:"#fbbf24",style:{position:"absolute",top:-4,right:-4}})]}),e.jsxs("div",{className:"notif-content",children:[e.jsxs("div",{className:"notif-content-top",children:[e.jsxs("div",{className:"notif-title-row",children:[e.jsx("span",{className:"notif-item-title",style:{color:t.read?"var(--text-muted)":"var(--text-dark)"},children:t.title}),p&&e.jsx("span",{className:"notif-priority-badge",children:"ÖNEMLİ"})]}),e.jsx("p",{className:"notif-message",children:t.message}),e.jsx("span",{className:"notif-time",children:t.time})]}),e.jsxs("div",{className:"notif-actions",children:[!t.read&&e.jsx("div",{className:"notif-unread-dot",style:{background:i.border}}),e.jsx("button",{className:"notif-delete-btn",onClick:u=>{u.stopPropagation(),v(t.id)},children:e.jsx(j,{size:13,color:"var(--text-muted)"})})]})]})]},t.id)})}),a.length>0&&e.jsx("div",{className:"notif-stats",children:[{val:a.length,label:"Toplam",color:"var(--text-dark)"},{val:n,label:"Okunmamış",color:"var(--primary-blue)"},{val:a.filter(t=>t.read).length,label:"Okunmuş",color:"#22c55e"}].map((t,r)=>e.jsxs("div",{className:"notif-stat-item",style:{borderRight:r<2?"1.5px dashed var(--dark-border)":"none"},children:[e.jsx("p",{className:"notif-stat-val",style:{color:t.color},children:t.val}),e.jsx("p",{className:"notif-stat-label",children:t.label})]},t.label))}),e.jsx("div",{style:{height:24}})]}),e.jsx("style",{children:`
        /* ── Page shell ── */
        .notif-page {
          position: relative;
          min-height: 100vh;
        }
        .notif-watermark {
          position: fixed;
          top: 6%;
          left: 50%;
          transform: translateX(-50%) rotate(-4deg);
          font-size: clamp(36px, 12vw, 180px);
          font-weight: 900;
          color: var(--dark-border);
          opacity: 0.04;
          white-space: nowrap;
          line-height: 1;
          letter-spacing: -0.04em;
          pointer-events: none;
          user-select: none;
          z-index: 0;
        }

        /* ── Container ── */
        .notif-container {
          position: relative;
          z-index: 1;
          max-width: 680px;
          margin: 0 auto;
          padding: 16px 16px 0;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        /* ── Header ── */
        .notif-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          flex-wrap: wrap;
        }
        .notif-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }
        .notif-bell-wrap {
          position: relative;
          flex-shrink: 0;
        }
        .notif-bell-icon {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: linear-gradient(180deg, #a78bfa, #6d28d9);
          border: 3px solid var(--dark-border);
          box-shadow: 0 4px 0 var(--dark-border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
        }
        .notif-bell-ring {
          animation: bellRing 2s ease-in-out infinite;
        }
        .notif-badge {
          position: absolute;
          top: -6px;
          right: -6px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #ef4444;
          border: 2px solid var(--card-bg);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 900;
          color: white;
        }
        .notif-title {
          color: var(--text-dark);
          font-weight: 900;
          font-size: clamp(20px, 5vw, 28px);
          margin: 0;
          line-height: 1;
        }
        .notif-subtitle {
          color: var(--text-muted);
          font-size: 12px;
          font-weight: 600;
          margin: 3px 0 0;
        }

        /* Mark all read button */
        .notif-mark-all-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 9px 14px;
          border-radius: 12px;
          font-weight: 900;
          font-size: 12px;
          background: linear-gradient(180deg, var(--gradient-start), var(--gradient-end));
          color: white;
          border: 2.5px solid var(--dark-border);
          box-shadow: 0 4px 0 var(--dark-border);
          cursor: pointer;
          flex-shrink: 0;
          white-space: nowrap;
        }
        .notif-mark-all-text {
          display: inline;
        }

        /* ── Filter pills ── */
        .notif-filters {
          display: flex;
          gap: 7px;
          overflow-x: auto;
          padding-bottom: 4px;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .notif-filters::-webkit-scrollbar { display: none; }
        .notif-filter-pill {
          padding: 8px 14px;
          border-radius: 999px;
          font-weight: 900;
          font-size: 12px;
          cursor: pointer;
          flex-shrink: 0;
          white-space: nowrap;
          background: var(--card-bg);
          color: var(--text-dark);
          border: 2.5px solid var(--dark-border);
          box-shadow: 0 3px 0 var(--dark-border);
          transition: all 0.1s;
        }
        .notif-filter-active {
          background: linear-gradient(180deg, var(--gradient-start), var(--gradient-end)) !important;
          color: white !important;
          box-shadow: 0 4px 0 var(--dark-border) !important;
        }

        /* ── Notification cards ── */
        .notif-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .notif-card {
          border-radius: 18px;
          padding: 14px;
          cursor: pointer;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          overflow: hidden;
          transition: transform 0.1s;
          animation: notifSlideIn 0.3s ease-out both;
        }
        .notif-card:hover {
          transform: translateY(-2px);
        }
        .notif-icon {
          width: 46px;
          height: 46px;
          border-radius: 13px;
          flex-shrink: 0;
          border: 2.5px solid var(--dark-border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          box-shadow: 0 3px 0 var(--dark-border);
          position: relative;
        }
        .notif-content {
          flex: 1;
          min-width: 0;
          display: flex;
          align-items: flex-start;
          gap: 8px;
        }
        .notif-content-top {
          flex: 1;
          min-width: 0;
        }
        .notif-title-row {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
          margin-bottom: 4px;
        }
        .notif-item-title {
          font-weight: 900;
          font-size: 13px;
          line-height: 1.2;
          word-break: break-word;
        }
        .notif-priority-badge {
          padding: 1px 6px;
          border-radius: 999px;
          font-size: 8px;
          font-weight: 900;
          background: rgba(245,158,11,0.15);
          color: #f59e0b;
          border: 1px solid #f59e0b;
          text-transform: uppercase;
          flex-shrink: 0;
        }
        .notif-message {
          color: var(--text-muted);
          font-size: 12px;
          margin: 0 0 5px;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          word-break: break-word;
        }
        .notif-time {
          font-size: 10px;
          color: var(--text-muted);
          font-weight: 600;
        }
        .notif-actions {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
          padding-top: 2px;
        }
        .notif-unread-dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .notif-delete-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: var(--tab-bg);
          border: 1.5px solid var(--dark-border);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
        }

        /* ── Empty state ── */
        .notif-empty {
          background: var(--card-bg);
          border: 3px dashed var(--dark-border);
          border-radius: 20px;
          padding: 40px 24px;
          text-align: center;
        }
        .notif-empty-title {
          font-weight: 900;
          font-size: 17px;
          color: var(--text-dark);
          margin: 0 0 6px;
        }
        .notif-empty-sub {
          color: var(--text-muted);
          font-size: 13px;
          margin: 0;
        }

        /* ── Stats ── */
        .notif-stats {
          background: var(--card-bg);
          border: 3px solid var(--dark-border);
          box-shadow: 0 6px 0 var(--dark-border);
          border-radius: 20px;
          padding: 14px 10px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 4px;
          text-align: center;
        }
        .notif-stat-item {
          padding: 4px 4px;
        }
        .notif-stat-val {
          font-weight: 900;
          font-size: clamp(18px, 5vw, 24px);
          margin: 0 0 3px;
          line-height: 1;
        }
        .notif-stat-label {
          font-size: clamp(9px, 2.5vw, 11px);
          color: var(--text-muted);
          font-weight: 700;
          margin: 0;
        }

        /* ── Animations ── */
        @keyframes notifSlideIn {
          from { opacity: 0; transform: translateX(-12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes bellRing {
          0%,100% { transform: rotate(0); }
          10%,30% { transform: rotate(-15deg); }
          20%,40% { transform: rotate(15deg); }
          50% { transform: rotate(0); }
        }

        /* ── Mobile overrides (≤ 480px) ── */
        @media (max-width: 480px) {
          .notif-container {
            padding: 12px 12px 0;
            gap: 12px;
          }
          .notif-header {
            flex-direction: column;
            align-items: stretch;
          }
          .notif-header-left {
            gap: 10px;
          }
          .notif-bell-icon {
            width: 42px;
            height: 42px;
            font-size: 20px;
          }
          .notif-mark-all-btn {
            width: 100%;
            justify-content: center;
            padding: 11px 14px;
            font-size: 13px;
          }
          .notif-mark-all-text {
            display: inline;
          }
          .notif-card {
            padding: 11px 11px;
            gap: 10px;
            border-radius: 16px;
          }
          .notif-icon {
            width: 38px;
            height: 38px;
            font-size: 17px;
            border-radius: 11px;
          }
          .notif-item-title {
            font-size: 12px;
          }
          .notif-message {
            font-size: 11px;
          }
          .notif-filter-pill {
            font-size: 11px;
            padding: 7px 12px;
          }
          .notif-stats {
            padding: 12px 8px;
          }
        }
      `})]})};export{C as default};
