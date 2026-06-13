import { useState, useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore, collection, addDoc, updateDoc, deleteDoc,
  doc, onSnapshot, serverTimestamp, query, orderBy
} from "firebase/firestore";
import {
  getAuth, onAuthStateChanged, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, signOut, GoogleAuthProvider,
  signInWithPopup, updateProfile, sendPasswordResetEmail
} from "firebase/auth";

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};
const fbApp = initializeApp(firebaseConfig);
const db    = getFirestore(fbApp);
const auth  = getAuth(fbApp);
const gProv = new GoogleAuthProvider();

/* ─── STYLES ──────────────────────────────────────────────────────────── */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

:root{
  --bg:#0D0D12;
  --s1:#13131A;
  --s2:#1A1A24;
  --s3:#22222F;
  --s4:#2C2C3E;
  --border:rgba(255,255,255,0.07);
  --border2:rgba(255,255,255,0.13);
  --text:#EEEEF8;
  --t2:#9898B8;
  --t3:#55556A;
  --blue:#6366F1;
  --blue2:#A5B4FC;
  --blue-bg:rgba(99,102,241,0.12);
  --green:#10B981;
  --green2:#34D399;
  --green-bg:rgba(16,185,129,0.12);
  --red:#F43F5E;
  --red2:#FB7185;
  --red-bg:rgba(244,63,94,0.12);
  --amber:#F59E0B;
  --amber2:#FCD34D;
  --amber-bg:rgba(245,158,11,0.12);
  --purple:#8B5CF6;
  --purple2:#C4B5FD;
  --purple-bg:rgba(139,92,246,0.12);
  --sans:'Inter',system-ui,sans-serif;
  --mono:'JetBrains Mono',monospace;
  --r:10px;
  --r2:16px;
  --shadow:0 4px 24px rgba(0,0,0,0.5);
  --shadow2:0 8px 48px rgba(0,0,0,0.7);
}

html,body,#root{height:100%;background:var(--bg);color:var(--text);font-family:var(--sans);font-size:14px;-webkit-font-smoothing:antialiased}

/* layout */
.shell{display:flex;height:100vh;overflow:hidden}
.sidebar{width:216px;min-width:216px;background:var(--s1);border-right:1px solid var(--border);display:flex;flex-direction:column;padding:16px 10px 14px;gap:2px}
.main{flex:1;overflow:hidden;display:flex;flex-direction:column}

/* sidebar */
.logo{display:flex;align-items:center;gap:9px;padding:4px 10px 20px;user-select:none}
.logo-mark{width:28px;height:28px;background:var(--blue);border-radius:7px;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;color:#fff;flex-shrink:0;font-family:var(--mono)}
.logo-text{font-weight:800;font-size:14px;letter-spacing:-.2px}
.nav-sec{font-size:10px;font-weight:700;color:var(--t3);letter-spacing:1.2px;text-transform:uppercase;padding:10px 10px 4px}
.nav-btn{display:flex;align-items:center;gap:10px;padding:9px 11px;border-radius:var(--r);background:none;border:none;color:var(--t2);font-size:13px;font-family:var(--sans);font-weight:500;cursor:pointer;transition:background .15s,color .15s;width:100%;text-align:left}
.nav-btn:hover{background:var(--s2);color:var(--text)}
.nav-btn.on{background:var(--blue-bg);color:var(--blue2)}
.nav-ico{font-size:15px;width:18px;text-align:center;opacity:.9}
.nav-badge{margin-left:auto;background:var(--red);color:#fff;font-size:10px;font-weight:700;border-radius:20px;padding:1px 6px;line-height:1.4}
.sep{height:1px;background:var(--border);margin:8px 4px}
.user-row{margin-top:auto;padding:12px 8px 0;border-top:1px solid var(--border);display:flex;align-items:center;gap:8px}
.ava{width:28px;height:28px;border-radius:50%;background:var(--blue-bg);border:1px solid var(--blue);color:var(--blue2);font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.user-name{font-size:12px;font-weight:600;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.signout{background:none;border:none;color:var(--t3);cursor:pointer;font-size:14px;padding:4px;border-radius:6px;transition:color .15s}
.signout:hover{color:var(--red)}

/* page */
.page-scroll{flex:1;overflow-y:auto}
.page-scroll::-webkit-scrollbar{width:4px}
.page-scroll::-webkit-scrollbar-thumb{background:var(--s3);border-radius:4px}
.ph{padding:28px 32px 0;text-align:center;margin-bottom:24px}
.ph-title{font-size:22px;font-weight:800;letter-spacing:-.4px}
.ph-sub{font-size:13px;color:var(--t2);margin-top:4px}
.ph-left{text-align:left;display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:12px}
.page-body{padding:0 32px 32px}

/* stat cards */
.stats-row{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:24px}
.scard{background:var(--s2);border:1px solid var(--border);border-radius:var(--r2);padding:20px 18px;transition:border-color .2s}
.scard:hover{border-color:var(--border2)}
.scard-label{font-size:10px;font-weight:700;color:var(--t3);letter-spacing:1px;text-transform:uppercase;margin-bottom:10px}
.scard-num{font-family:var(--mono);font-size:36px;font-weight:600;line-height:1;margin-bottom:6px}
.scard-sub{font-size:11px;color:var(--t3)}

/* dashboard two-col */
.dash-cols{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px}
.dash-card{background:var(--s2);border:1px solid var(--border);border-radius:var(--r2);padding:20px}
.dash-card-title{font-size:15px;font-weight:700;margin-bottom:16px}

/* recent app list */
.app-row{display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border)}
.app-row:last-child{border-bottom:none}
.app-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
.app-title{font-size:13px;font-weight:600;flex:1}
.app-co{font-size:11px;color:var(--t2)}

/* pipeline breakdown bars */
.pipe-row{margin-bottom:14px}
.pipe-meta{display:flex;justify-content:space-between;align-items:center;margin-bottom:5px}
.pipe-label{font-size:12px;color:var(--t2)}
.pipe-val{font-family:var(--mono);font-size:12px;color:var(--text)}
.pipe-track{height:5px;background:var(--s3);border-radius:4px;overflow:hidden}
.pipe-fill{height:100%;border-radius:4px;transition:width .6s ease}

/* kanban */
.board-wrap{overflow-x:auto;padding-bottom:12px}
.board-wrap::-webkit-scrollbar{height:4px}
.board-wrap::-webkit-scrollbar-thumb{background:var(--s3);border-radius:4px}
.board{display:flex;gap:14px;min-width:max-content;align-items:flex-start}
.col{width:260px;background:var(--s2);border:1px solid var(--border);border-radius:var(--r2);display:flex;flex-direction:column;max-height:calc(100vh - 200px);transition:border-color .2s,box-shadow .2s}
.col.over{border-color:var(--blue);box-shadow:0 0 0 1px var(--blue),inset 0 0 30px rgba(99,102,241,.05)}
.col-hd{padding:14px 14px 12px;display:flex;align-items:center;gap:8px;flex-shrink:0}
.col-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
.col-name{font-size:13px;font-weight:700;flex:1}
.col-ct{font-size:11px;color:var(--t3);background:var(--s3);border-radius:20px;padding:2px 8px;font-family:var(--mono)}
.col-body{padding:8px;overflow-y:auto;flex:1}
.col-body::-webkit-scrollbar{width:3px}
.col-body::-webkit-scrollbar-thumb{background:var(--s3);border-radius:3px}
.col-empty{font-size:12px;color:var(--t3);text-align:center;padding:24px 10px;border:1.5px dashed var(--border2);border-radius:var(--r);letter-spacing:.2px}
.col.over .col-empty{border-color:var(--blue);color:var(--blue2);background:rgba(99,102,241,.04)}

/* job cards */
.jcard{background:var(--s1);border:1px solid var(--border);border-radius:var(--r);padding:12px 13px;margin-bottom:8px;cursor:grab;transition:all .18s;position:relative}
.jcard:hover{border-color:var(--border2);transform:translateY(-1px);box-shadow:0 4px 16px rgba(0,0,0,.4)}
.jcard.drag{opacity:.3;cursor:grabbing;transform:scale(.96) rotate(1.5deg)}
.jcard-top{display:flex;align-items:flex-start;gap:6px;margin-bottom:4px}
.jcard-title{font-size:13px;font-weight:700;flex:1;line-height:1.3}
.jcard-co{font-size:11.5px;color:var(--t2);margin-bottom:8px}
.jcard-foot{display:flex;align-items:center;gap:5px;flex-wrap:wrap}
.open-btn{background:none;border:none;color:var(--t3);font-size:13px;cursor:pointer;padding:2px;border-radius:5px;transition:color .15s;flex-shrink:0;line-height:1}
.open-btn:hover{color:var(--blue2)}
.remind-dot{position:absolute;top:-3px;right:-3px;width:9px;height:9px;background:var(--red);border-radius:50%;border:2px solid var(--s1)}

/* pills */
.pill{display:inline-flex;align-items:center;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:700;letter-spacing:.3px}
.p-blue{background:var(--blue-bg);color:var(--blue2)}
.p-green{background:var(--green-bg);color:var(--green2)}
.p-red{background:var(--red-bg);color:var(--red2)}
.p-amber{background:var(--amber-bg);color:var(--amber2)}
.p-purple{background:var(--purple-bg);color:var(--purple2)}
.p-ghost{background:var(--s3);color:var(--t2);border:1px solid var(--border)}

/* buttons */
.btn{display:inline-flex;align-items:center;gap:6px;padding:9px 18px;border-radius:var(--r);border:1px solid var(--border2);background:var(--s3);color:var(--text);font-size:13px;font-family:var(--sans);font-weight:600;cursor:pointer;transition:all .15s;white-space:nowrap}
.btn:hover{background:var(--s4);border-color:rgba(255,255,255,.18)}
.btn:disabled{opacity:.4;cursor:not-allowed}
.btn-primary{background:var(--blue);border-color:var(--blue);color:#fff}
.btn-primary:hover{background:#7578F3;border-color:#7578F3}
.btn-sm{padding:6px 12px;font-size:12px}
.btn-xs{padding:3px 9px;font-size:11px}
.btn-ghost{background:transparent;border-color:transparent;color:var(--t2);padding:6px 10px}
.btn-ghost:hover{background:var(--s2);color:var(--text);border-color:transparent}
.btn-icon{width:30px;height:30px;padding:0;border-radius:var(--r);border:1px solid transparent;background:transparent;color:var(--t2);cursor:pointer;transition:all .15s;font-size:14px;display:inline-flex;align-items:center;justify-content:center}
.btn-icon:hover{background:var(--s2);color:var(--text);border-color:var(--border)}
.btn-icon.ok{color:var(--green)}
.btn-google{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;padding:11px;border-radius:var(--r);border:1px solid var(--border2);background:var(--s2);color:var(--text);font-size:14px;font-family:var(--sans);font-weight:600;cursor:pointer;transition:all .18s}
.btn-google:hover{background:var(--s3)}

/* forms */
.fg{display:flex;flex-direction:column;gap:6px;margin-bottom:14px}
.fl{font-size:11px;font-weight:700;color:var(--t3);letter-spacing:.6px;text-transform:uppercase;text-align:center}
.fi{background:var(--s2);border:1px solid var(--border2);border-radius:var(--r);color:var(--text);font-size:13.5px;font-family:var(--sans);padding:10px 14px;width:100%;outline:none;transition:border-color .15s,box-shadow .15s}
.fi:focus{border-color:var(--blue);box-shadow:0 0 0 3px var(--blue-bg)}
.fi::placeholder{color:var(--t3)}
textarea.fi{resize:vertical;min-height:80px;line-height:1.6}
select.fi{cursor:pointer}
.ferr{font-size:12px;color:var(--red)}
.fl-left{text-align:left}

/* modal */
.overlay{position:fixed;inset:0;background:rgba(0,0,0,.8);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:300;padding:20px;animation:fIn .15s ease}
.modal{background:var(--s1);border:1px solid var(--border2);border-radius:var(--r2);width:100%;max-width:560px;max-height:90vh;overflow-y:auto;box-shadow:var(--shadow2);animation:sUp .18s ease}
.modal.wide{max-width:680px}
.modal-hd{display:flex;align-items:center;justify-content:space-between;padding:22px 24px 0;margin-bottom:18px}
.modal-title{font-size:17px;font-weight:800}
.modal-body{padding:0 24px}
.modal-ft{padding:16px 24px 22px;display:flex;justify-content:flex-end;gap:8px;border-top:1px solid var(--border);margin-top:18px}
.modal::-webkit-scrollbar{width:4px}
.modal::-webkit-scrollbar-thumb{background:var(--s3);border-radius:4px}

/* detail panel */
.panel-bg{position:fixed;inset:0;background:rgba(0,0,0,.6);backdrop-filter:blur(2px);z-index:200;animation:fIn .18s ease}
.panel{position:fixed;top:0;right:0;bottom:0;width:min(700px,88vw);background:var(--s1);border-left:1px solid var(--border2);z-index:201;display:flex;flex-direction:column;overflow:hidden;animation:sRight .22s ease;box-shadow:-12px 0 60px rgba(0,0,0,.6)}
.panel-hd{padding:22px 24px 18px;border-bottom:1px solid var(--border);flex-shrink:0}
.panel-tabs{display:flex;padding:0 24px;border-bottom:1px solid var(--border);flex-shrink:0;overflow-x:auto}
.panel-tabs::-webkit-scrollbar{display:none}
.ptab{padding:11px 14px;font-size:13px;font-weight:600;color:var(--t2);cursor:pointer;border:none;border-bottom:2px solid transparent;background:none;font-family:var(--sans);transition:color .15s;white-space:nowrap;flex-shrink:0}
.ptab:hover{color:var(--text)}
.ptab.on{color:var(--blue2);border-bottom-color:var(--blue)}
.panel-body{flex:1;overflow-y:auto;padding:22px 24px}
.panel-body::-webkit-scrollbar{width:4px}
.panel-body::-webkit-scrollbar-thumb{background:var(--s3);border-radius:4px}

/* section labels */
.sec-title{font-size:11px;font-weight:700;color:var(--t3);letter-spacing:.7px;text-transform:uppercase;margin-bottom:12px;display:flex;align-items:center;gap:8px}
.sec-title::after{content:'';flex:1;height:1px;background:var(--border)}
.detail-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:18px}
.dfield{background:var(--s2);border:1px solid var(--border);border-radius:var(--r);padding:11px 13px}
.dflabel{font-size:10px;font-weight:700;color:var(--t3);letter-spacing:.8px;text-transform:uppercase;margin-bottom:4px}
.dfval{font-size:14px;font-weight:600}

/* milestones */
.ms-row{display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border)}
.ms-row:last-child{border-bottom:none}
.ms-chk{width:20px;height:20px;border-radius:6px;border:1.5px solid var(--border2);background:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .15s;font-size:11px;color:var(--green)}
.ms-chk.done{background:var(--green-bg);border-color:var(--green)}
.ms-lbl{flex:1;font-size:13.5px}
.ms-lbl.done{color:var(--t3);text-decoration:line-through}

/* timeline */
.tl{display:flex;gap:14px}
.tl-spine{display:flex;flex-direction:column;align-items:center;flex-shrink:0}
.tl-dot{width:10px;height:10px;border-radius:50%;background:var(--blue);border:2px solid var(--s1);flex-shrink:0;margin-top:3px}
.tl-line{width:2px;flex:1;background:var(--border);min-height:14px}
.tl-body{padding-bottom:16px;flex:1}
.tl-meta{font-size:11px;color:var(--t3);font-family:var(--mono);margin-bottom:3px}
.tl-text{font-size:13.5px;line-height:1.55}

/* contact card */
.ccard{background:var(--s2);border:1px solid var(--border);border-radius:var(--r);padding:13px 14px;margin-bottom:8px;display:flex;align-items:center;gap:12px;transition:border-color .15s}
.ccard:hover{border-color:var(--border2)}
.cava{width:36px;height:36px;border-radius:50%;background:var(--blue-bg);color:var(--blue2);font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.cinfo{flex:1;min-width:0}
.cname{font-size:13px;font-weight:700}
.crole{font-size:11.5px;color:var(--t2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.remind-chip{display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:20px;font-size:11px;font-weight:600;cursor:pointer;transition:all .15s;border:1px solid;margin-top:5px}
.rc-due{background:var(--red-bg);color:var(--red2);border-color:rgba(244,63,94,.3)}
.rc-soon{background:var(--amber-bg);color:var(--amber2);border-color:rgba(245,158,11,.3)}
.rc-ok{background:var(--green-bg);color:var(--green2);border-color:rgba(16,185,129,.3)}
.rc-none{background:var(--s3);color:var(--t2);border-color:var(--border)}

/* experience */
.ecard{background:var(--s2);border:1px solid var(--border);border-radius:var(--r2);padding:18px 20px;margin-bottom:12px;transition:border-color .15s}
.ecard:hover{border-color:var(--border2)}
.ecard-hd{display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:10px}
.ecard-title{font-size:15px;font-weight:700}
.ecard-meta{font-size:12px;color:var(--t2);margin-top:2px}
.bullet{display:flex;align-items:flex-start;gap:9px;padding:6px 8px;border-radius:var(--r);transition:background .12s}
.bullet:hover{background:var(--s3)}
.bdot{width:5px;height:5px;border-radius:50%;background:var(--blue);margin-top:8px;flex-shrink:0}
.btext{font-size:13px;flex:1;line-height:1.6;color:var(--t2)}

/* analytics */
.analytics-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:24px}
.ascard{background:var(--s2);border:1px solid var(--border);border-radius:var(--r2);padding:20px 18px;transition:border-color .2s}
.ascard:hover{border-color:var(--border2)}
.ascard-label{font-size:10px;font-weight:700;color:var(--t3);letter-spacing:1px;text-transform:uppercase;margin-bottom:10px}
.ascard-num{font-family:var(--mono);font-size:34px;font-weight:600;line-height:1;margin-bottom:4px}
.ascard-sub{font-size:11px;color:var(--t3)}
.analytics-cols{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.acol-card{background:var(--s2);border:1px solid var(--border);border-radius:var(--r2);padding:22px}
.acol-title{font-size:15px;font-weight:700;margin-bottom:18px}
.ghost-eq{font-family:var(--mono);font-size:12px;color:var(--t3);margin-top:14px;padding-top:14px;border-top:1px solid var(--border)}
.ghost-eq span{color:var(--green2)}

/* resume prep */
.rtip{background:var(--blue-bg);border-left:3px solid var(--blue);border-radius:var(--r);padding:14px 16px;font-size:13px;color:var(--t2);line-height:1.65;margin-bottom:18px}
.rtip strong{color:var(--blue2)}
.rsec{background:var(--s2);border:1px solid var(--border);border-radius:var(--r2);padding:20px;margin-bottom:14px}
.rsec h3{font-size:14px;font-weight:700;margin-bottom:4px}
.rsec p{font-size:12.5px;color:var(--t2);margin-bottom:12px;line-height:1.6}
.kw-wrap{display:flex;flex-wrap:wrap;gap:6px}
.kw{padding:4px 11px;border-radius:20px;font-size:12px;font-weight:600;background:var(--s3);color:var(--t2);border:1px solid var(--border);cursor:pointer;transition:all .15s}
.kw:hover{border-color:var(--border2);color:var(--text)}
.kw.on{background:var(--blue-bg);color:var(--blue2);border-color:rgba(99,102,241,.4)}
.kw.on::before{content:'✓  '}
.copy-box{background:var(--bg);border:1px solid var(--border);border-radius:var(--r);padding:14px;font-size:12.5px;line-height:1.75;color:var(--t2);white-space:pre-wrap;word-break:break-word;font-family:var(--mono)}

/* profile page */
.profile-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.pcard{background:var(--s2);border:1px solid var(--border);border-radius:var(--r2);padding:24px}
.pcard-title{font-size:15px;font-weight:700;margin-bottom:4px;text-align:center}
.pcard-sub{font-size:12px;color:var(--t2);text-align:center;margin-bottom:18px}

/* auth */
.auth-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--bg);padding:24px;background-image:radial-gradient(ellipse at 25% 50%,rgba(99,102,241,.08) 0%,transparent 60%),radial-gradient(ellipse at 75% 20%,rgba(16,185,129,.06) 0%,transparent 50%)}
.auth-box{width:100%;max-width:400px;background:var(--s1);border:1px solid var(--border2);border-radius:var(--r2);padding:36px 32px;box-shadow:var(--shadow2)}
.auth-logo{display:flex;align-items:center;gap:10px;margin-bottom:28px}
.auth-hd{font-size:21px;font-weight:800;margin-bottom:6px}
.auth-sub{font-size:13px;color:var(--t2);margin-bottom:24px;line-height:1.5}
.auth-div{display:flex;align-items:center;gap:12px;margin:18px 0}
.auth-div::before,.auth-div::after{content:'';flex:1;height:1px;background:var(--border)}
.auth-div span{font-size:11px;color:var(--t3)}
.auth-sw{text-align:center;margin-top:18px;font-size:13px;color:var(--t2)}
.auth-sw button{background:none;border:none;color:var(--blue2);cursor:pointer;font-size:13px;font-family:var(--sans);font-weight:600;text-decoration:underline}
.auth-link{background:none;border:none;color:var(--t3);cursor:pointer;font-size:12px;font-family:var(--sans);transition:color .15s}
.auth-link:hover{color:var(--blue2)}

/* toast */
.toast{position:fixed;bottom:22px;right:22px;padding:11px 16px;border-radius:var(--r);font-size:13px;font-weight:600;z-index:9999;display:flex;align-items:center;gap:9px;box-shadow:var(--shadow2);animation:sUp .2s ease;border:1px solid}
.toast.ok{background:var(--s2);border-color:var(--green);color:var(--green2)}
.toast.err{background:var(--s2);border-color:var(--red);color:var(--red2)}

/* loading */
.loading{min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--bg);flex-direction:column;gap:14px}
.spinner{width:28px;height:28px;border:2px solid var(--s3);border-top-color:var(--blue);border-radius:50%;animation:spin .7s linear infinite}

/* helpers */
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px}
.row{display:flex;align-items:center;gap:8px}
.row.wrap{flex-wrap:wrap}
.col-gap{display:flex;flex-direction:column;gap:8px}
.empty{text-align:center;padding:40px 20px;color:var(--t3)}
.empty-ico{font-size:36px;margin-bottom:10px;opacity:.3}
.empty p{font-size:13px}
.divider{height:1px;background:var(--border);margin:16px 0}
.mt4{margin-top:4px}.mt8{margin-top:8px}.mt12{margin-top:12px}
.mt16{margin-top:16px}.mt20{margin-top:20px}.mt24{margin-top:24px}
.mb4{margin-bottom:4px}.mb8{margin-bottom:8px}.mb12{margin-bottom:12px}
.mb16{margin-bottom:16px}.mb20{margin-bottom:20px}

@keyframes fIn{from{opacity:0}to{opacity:1}}
@keyframes sUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes sRight{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:translateX(0)}}
@keyframes spin{to{transform:rotate(360deg)}}
/* ── Job Onboarding Wizard ── */
.ob-wrap{max-width:700px;margin:0 auto;padding:0 0 48px}
.ob-progress{display:flex;align-items:center;gap:0;margin-bottom:36px;padding:0 4px}
.ob-step-dot{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;border:2px solid;transition:all .3s;list-style:none;text-decoration:none}
.ob-step-dot.done{background:var(--green);border-color:var(--green);color:#fff}
.ob-step-dot.active{background:var(--blue);border-color:var(--blue);color:#fff;box-shadow:0 0 0 4px var(--blue-bg)}
.ob-step-dot.pending{background:var(--s3);border-color:var(--border2);color:var(--t3)}
.ob-step-line{flex:1;height:2px;background:var(--border);transition:background .3s;min-width:8px}
.ob-step-line.done{background:var(--green)}
.ob-card{background:var(--s2);border:1px solid var(--border2);border-radius:var(--r2);padding:28px 32px;margin-bottom:16px;animation:sUp .2s ease}
.ob-card-title{font-size:19px;font-weight:800;letter-spacing:-.3px;margin-bottom:6px}
.ob-card-sub{font-size:13px;color:var(--t2);margin-bottom:22px;line-height:1.6}
.ob-step-label{font-size:11px;font-weight:700;color:var(--blue2);letter-spacing:.8px;text-transform:uppercase;margin-bottom:12px}
.ob-yn-row{display:flex;gap:10px;margin-bottom:18px}
.ob-yn-btn{flex:1;padding:14px 10px;border-radius:var(--r);border:1.5px solid var(--border2);background:var(--s3);color:var(--t2);font-size:13px;font-weight:600;font-family:var(--sans);cursor:pointer;transition:all .18s;text-align:center;line-height:1.4}
.ob-yn-btn:hover{border-color:var(--border2);background:var(--s4);color:var(--text)}
.ob-yn-btn.yes.sel{background:var(--green-bg);border-color:var(--green);color:var(--green2)}
.ob-yn-btn.no.sel{background:var(--red-bg);border-color:var(--red);color:var(--red2)}
.ob-yn-btn.skip.sel{background:var(--blue-bg);border-color:var(--blue);color:var(--blue2)}
.ob-summary{background:var(--s3);border:1px solid var(--border);border-radius:var(--r);padding:16px;margin-bottom:16px}
.ob-summary-row{display:flex;align-items:center;gap:10px;padding:6px 0;font-size:13px}
.ob-summary-ico{font-size:15px;width:22px;text-align:center;flex-shrink:0}
.ob-score{display:inline-flex;align-items:center;justify-content:center;width:76px;height:76px;border-radius:50%;font-family:var(--mono);font-size:20px;font-weight:700;border:3px solid;flex-shrink:0}
.ob-score.high{background:var(--green-bg);border-color:var(--green);color:var(--green2)}
.ob-score.mid{background:var(--amber-bg);border-color:var(--amber);color:var(--amber2)}
.ob-score.low{background:var(--red-bg);border-color:var(--red);color:var(--red2)}
.ob-ai-prompt{background:var(--bg);border:1px solid var(--border);border-radius:var(--r);padding:14px;font-size:12px;font-family:var(--mono);line-height:1.7;color:var(--t2);white-space:pre-wrap;word-break:break-word}
.ob-inline-note{background:var(--blue-bg);border-left:3px solid var(--blue);border-radius:0 var(--r) var(--r) 0;padding:12px 14px;font-size:12.5px;color:var(--t2);line-height:1.6;margin:12px 0}
.ob-inline-note strong{color:var(--blue2)}
.ob-checklist{display:flex;flex-direction:column;gap:8px;margin-bottom:16px}
.ob-check-item{display:flex;align-items:flex-start;gap:10px;padding:12px 14px;background:var(--s3);border-radius:var(--r);border:1.5px solid var(--border);cursor:pointer;transition:all .15s}
.ob-check-item.checked{background:var(--green-bg);border-color:rgba(16,185,129,.4)}
.ob-check-item:hover:not(.checked){border-color:var(--border2);background:var(--s4)}
.ob-check-box{width:20px;height:20px;border-radius:6px;border:1.5px solid var(--border2);background:none;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:11px;transition:all .15s;margin-top:1px}
.ob-check-item.checked .ob-check-box{background:var(--green);border-color:var(--green);color:#fff}
.ob-check-text{flex:1}
.ob-check-title{font-size:13px;font-weight:600}
.ob-check-desc{font-size:11.5px;color:var(--t2);margin-top:2px;line-height:1.5}
.ob-nav{display:flex;align-items:center;justify-content:space-between;margin-top:8px;padding:16px 0 0}

`;

/* ─── CONSTANTS ──────────────────────────────────────────────────────── */
const STAGES = [
  { key:"applied",    label:"Applied",      color:"var(--blue2)",   dot:"var(--blue)",   pill:"p-blue"   },
  { key:"interview",  label:"Interviewing",  color:"var(--amber2)",  dot:"var(--amber)",  pill:"p-amber"  },
  { key:"offer",      label:"Offered",       color:"var(--green2)",  dot:"var(--green)",  pill:"p-green"  },
  { key:"declined",   label:"Declined",      color:"var(--red2)",    dot:"var(--red)",    pill:"p-red"    },
];
const ALL_STAGES = [
  { key:"bookmarked", label:"Saved",         color:"var(--t2)",     dot:"var(--t3)",     pill:"p-ghost"  },
  ...STAGES,
];
const JOB_TYPES   = ["Remote","Hybrid","On-site"];
const PLATFORMS   = ["LinkedIn","Email","In-Person","Twitter/X","Mutual Connection","Other"];
const REMIND_DAYS = { "3 days":3,"5 days":5,"1 week":7,"2 weeks":14,"Never":9999 };
const EXP_TYPES   = ["Work Experience","Internship","Project","Volunteering","Research","Achievement","Leadership","Other"];
const MILESTONES  = [
  { key:"applied",    label:"Applied" },
  { key:"screen",     label:"Phone Screen" },
  { key:"oa",         label:"Online Assessment" },
  { key:"round1",     label:"Interview Round 1" },
  { key:"round2",     label:"Interview Round 2" },
  { key:"final",      label:"Final Round" },
  { key:"offer",      label:"Offer Received" },
];

/* ─── HELPERS ────────────────────────────────────────────────────────── */
const uid8    = () => Math.random().toString(36).slice(2,10);
const today   = () => new Date().toISOString().split("T")[0];
const initials = n => n ? n.split(" ").filter(Boolean).slice(0,2).map(w=>w[0]).join("").toUpperCase() : "?";
const daysBetween = ds => ds ? Math.floor((Date.now() - new Date(ds).getTime()) / 86400000) : null;
const remindDays  = s => REMIND_DAYS[s] ?? 7;

function remindStatus(contact) {
  const days = remindDays(contact.remindAfter || "1 week");
  const last = contact.lastContacted;
  if (!last) return "none";
  const elapsed = daysBetween(last);
  if (elapsed >= days)     return "due";
  if (elapsed >= days - 2) return "soon";
  return "ok";
}
function remindLabel(contact) {
  const s = remindStatus(contact);
  const d = daysBetween(contact.lastContacted);
  if (s === "none") return "No contact yet";
  if (s === "due")  return `Follow up now (${d}d ago)`;
  if (s === "soon") return "Follow up soon";
  return `Contacted ${d}d ago`;
}

/* ─── FIRESTORE ──────────────────────────────────────────────────────── */
const ucol = (uid, c) => collection(db, "users", uid, c);
function useCol(uid, name) {
  const [docs, set] = useState([]);
  useEffect(() => {
    if (!uid) { set([]); return; }
    const q = query(ucol(uid, name), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, snap => set(snap.docs.map(d => ({ id: d.id, ...d.data() }))), () => {});
    return unsub;
  }, [uid, name]);
  return docs;
}
const fsAdd = (uid, col, data)     => addDoc(ucol(uid, col), { ...data, createdAt: serverTimestamp() });
const fsUpd = (uid, col, id, data) => updateDoc(doc(db, "users", uid, col, id), data);
const fsDel = (uid, col, id)       => deleteDoc(doc(db, "users", uid, col, id));

/* ─── SMALL COMPONENTS ───────────────────────────────────────────────── */
function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 2600); return () => clearTimeout(t); });
  return <div className={`toast ${type === "err" ? "err" : "ok"}`}>{type === "err" ? "✕" : "✓"} {msg}</div>;
}

function CopyBtn({ text, showToast }) {
  const [ok, set] = useState(false);
  return (
    <button className={`btn-icon ${ok ? "ok" : ""}`} title="Copy" onClick={() => {
      navigator.clipboard.writeText(text).then(() => {
        set(true); showToast("Copied!");
        setTimeout(() => set(false), 1500);
      });
    }}>
      <span style={{ fontFamily:"var(--mono)", fontSize:12 }}>{ok ? "✓" : "⎘"}</span>
    </button>
  );
}

function Modal({ title, onClose, children, footer, wide }) {
  useEffect(() => {
    const h = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  return (
    <div className="overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`modal${wide ? " wide" : ""}`}>
        <div className="modal-hd">
          <span className="modal-title">{title}</span>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-ft">{footer}</div>}
      </div>
    </div>
  );
}

/* ─── AUTH PAGE ──────────────────────────────────────────────────────── */
function AuthPage({ showToast }) {
  const [mode, setMode]     = useState("login");
  const [email, setEmail]   = useState("");
  const [pass, setPass]     = useState("");
  const [name, setName]     = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr]       = useState("");

  async function submit(e) {
    e.preventDefault(); setErr(""); setLoading(true);
    try {
      if (mode === "login") {
        await signInWithEmailAndPassword(auth, email, pass);
      } else if (mode === "signup") {
        const cred = await createUserWithEmailAndPassword(auth, email, pass);
        if (name) await updateProfile(cred.user, { displayName: name });
      } else {
        await sendPasswordResetEmail(auth, email);
        showToast("Reset email sent"); setMode("login");
      }
    } catch (ex) {
      const MAP = {
        "auth/user-not-found":      "No account with this email.",
        "auth/wrong-password":      "Incorrect password.",
        "auth/invalid-credential":  "Incorrect email or password.",
        "auth/email-already-in-use":"Email already in use.",
        "auth/weak-password":       "Password needs 6+ characters.",
        "auth/invalid-email":       "Invalid email address.",
      };
      setErr(MAP[ex.code] || ex.message);
    } finally { setLoading(false); }
  }

  async function handleGoogle() {
    setErr(""); setLoading(true);
    try { await signInWithPopup(auth, gProv); }
    catch (ex) { if (ex.code !== "auth/popup-closed-by-user") setErr(ex.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-box">
        <div className="auth-logo">
          <div className="logo-mark">C</div>
          <span style={{ fontWeight:800, fontSize:16 }}>CareerOS</span>
        </div>
        <div className="auth-hd">
          {mode === "login" ? "Welcome back" : mode === "signup" ? "Create account" : "Reset password"}
        </div>
        <div className="auth-sub">
          {mode === "login"  ? "Sign in to your career workspace." :
           mode === "signup" ? "Start tracking your job search." :
                               "Enter your email for a reset link."}
        </div>

        {mode !== "reset" && (
          <>
            <button className="btn-google" onClick={handleGoogle} disabled={loading}>
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"/>
                <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/>
              </svg>
              Continue with Google
            </button>
            <div className="auth-div"><span>or</span></div>
          </>
        )}

        <form onSubmit={submit}>
          {mode === "signup" && (
            <div className="fg">
              <label className="fl fl-left">Full Name</label>
              <input className="fi" placeholder="Alex Johnson" value={name} onChange={e => setName(e.target.value)} />
            </div>
          )}
          <div className="fg">
            <label className="fl fl-left">Email</label>
            <input className="fi" type="email" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          {mode !== "reset" && (
            <div className="fg">
              <label className="fl fl-left">Password</label>
              <input className="fi" type="password" placeholder="••••••••" value={pass} onChange={e => setPass(e.target.value)} required minLength={6} />
            </div>
          )}
          {mode === "login" && (
            <div style={{ textAlign:"right", marginTop:-6, marginBottom:14 }}>
              <button type="button" className="auth-link" onClick={() => { setMode("reset"); setErr(""); }}>Forgot password?</button>
            </div>
          )}
          {err && <div className="ferr mb8">{err}</div>}
          <button className="btn btn-primary" style={{ width:"100%", justifyContent:"center", padding:"11px" }} type="submit" disabled={loading}>
            {loading ? "Please wait…" : mode === "login" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset link"}
          </button>
        </form>

        <div className="auth-sw">
          {mode === "login"  ? <>No account? <button onClick={() => { setMode("signup"); setErr(""); }}>Sign up</button></> :
           mode === "signup" ? <>Have an account? <button onClick={() => { setMode("login"); setErr(""); }}>Sign in</button></> :
           <button onClick={() => { setMode("login"); setErr(""); }}>← Back to sign in</button>}
        </div>
      </div>
    </div>
  );
}

/* ─── JOB DETAIL PANEL ───────────────────────────────────────────────── */
function JobPanel({ uid, job, onClose, experiences, showToast }) {
  const [tab, setTab] = useState("overview");
  const [editing, setEditing] = useState(false);
  const [ef, setEf] = useState({
    title: job.title, company: job.company,
    salary: job.salary || "", jobType: job.jobType || "Remote",
    url: job.url || "", jd: job.jd || "", status: job.status || "applied"
  });
  const setE = (k, v) => setEf(p => ({ ...p, [k]: v }));

  const [showAddC, setShowAddC] = useState(false);
  const [showAddI, setShowAddI] = useState(false);
  const [nc, setNc] = useState({ name:"", title:"", platform:"LinkedIn", remindAfter:"1 week" });
  const [ni, setNi] = useState({ contactIdx:0, date:today(), note:"", platform:"LinkedIn" });
  const [pickedKw, setPickedKw] = useState([]);

  const contacts     = job.contacts     || [];
  const interactions = job.interactions || [];
  const milestones   = job.milestones   || {};

  const patch = data => fsUpd(uid, "jobs", job.id, data);

  async function saveEdit() {
    await patch(ef); setEditing(false); showToast("Job updated");
    Object.assign(job, ef);
  }
  async function toggleMs(key) {
    await patch({ milestones: { ...milestones, [key]: milestones[key] ? null : today() } });
  }
  async function setMsDate(key, val) {
    await patch({ milestones: { ...milestones, [key]: val } });
  }
  async function addContact() {
    if (!nc.name.trim()) return;
    await patch({ contacts: [...contacts, { ...nc, id: uid8(), lastContacted: null }] });
    setShowAddC(false); setNc({ name:"", title:"", platform:"LinkedIn", remindAfter:"1 week" }); showToast("Contact added");
  }
  async function removeContact(cid) {
    await patch({ contacts: contacts.filter(c => c.id !== cid), interactions: interactions.filter(i => i.contactId !== cid) });
  }
  async function markContacted(cid) {
    await patch({ contacts: contacts.map(c => c.id === cid ? { ...c, lastContacted: today() } : c) });
    showToast("Marked contacted");
  }
  async function addInteraction() {
    if (!ni.note.trim()) return;
    const c = contacts[ni.contactIdx] || {};
    const entry = { ...ni, contactName: c.name || "Unknown", contactId: c.id || "", id: uid8() };
    const sorted = [...interactions, entry].sort((a, b) => a.date < b.date ? 1 : -1);
    const updC = contacts.map(ct => ct.id === c.id ? { ...ct, lastContacted: ni.date } : ct);
    await patch({ interactions: sorted, contacts: updC });
    setShowAddI(false); setNi({ contactIdx:0, date:today(), note:"", platform:"LinkedIn" }); showToast("Logged");
  }

  // keyword extraction
  const jdKw = (() => {
    if (!job.jd) return [];
    const stop = new Set(["the","and","for","with","our","that","have","this","are","you","from","will","they","been","all","not","but","can","more","about","we","an","in","to","of","a","is","it","be","as","at","or","do","by","on","its","their","also","which","who","what","when","how","use","using","used","help","support","provide","manage","build","develop","create","must","should","would","could","across","within","both","these","those","some","than","through","each","well","new","key","day","time","per","make","take","such","other","strong","good","great","work","team","role","job","experience","skills","ability","years","position","include","ensure","responsible"]);
    const words = job.jd.toLowerCase().match(new RegExp('[a-z][a-z+#.]{2,}', 'g')) || [];
    const freq = {};
    words.forEach(w => { if (!stop.has(w)) freq[w] = (freq[w] || 0) + 1; });
    return Object.entries(freq).filter(([,v]) => v >= 2).sort((a,b) => b[1]-a[1]).slice(0,35).map(([k]) => k);
  })();

  const dueCt = contacts.filter(c => remindStatus(c) === "due").length;
  const stageInfo = ALL_STAGES.find(s => s.key === job.status) || ALL_STAGES[0];

  const typeColor = { Remote:"p-green", Hybrid:"p-amber", "On-site":"p-blue" };

  return (
    <>
      <div className="panel-bg" onClick={onClose} />
      <div className="panel">
        <div className="panel-hd">
          {editing ? (
            <div>
              <div className="grid2 mb12">
                <div className="fg" style={{marginBottom:0}}>
                  <label className="fl fl-left">Title</label>
                  <input className="fi" value={ef.title} onChange={e => setE("title", e.target.value)} />
                </div>
                <div className="fg" style={{marginBottom:0}}>
                  <label className="fl fl-left">Company</label>
                  <input className="fi" value={ef.company} onChange={e => setE("company", e.target.value)} />
                </div>
              </div>
              <div className="grid3">
                <div className="fg" style={{marginBottom:0}}>
                  <label className="fl fl-left">Salary</label>
                  <input className="fi" value={ef.salary} onChange={e => setE("salary", e.target.value)} />
                </div>
                <div className="fg" style={{marginBottom:0}}>
                  <label className="fl fl-left">Type</label>
                  <select className="fi" value={ef.jobType} onChange={e => setE("jobType", e.target.value)}>
                    {JOB_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="fg" style={{marginBottom:0}}>
                  <label className="fl fl-left">Status</label>
                  <select className="fi" value={ef.status} onChange={e => setE("status", e.target.value)}>
                    {ALL_STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="row mt12" style={{justifyContent:"flex-end",gap:8}}>
                <button className="btn btn-sm" onClick={() => setEditing(false)}>Cancel</button>
                <button className="btn btn-primary btn-sm" onClick={saveEdit}>Save</button>
              </div>
            </div>
          ) : (
            <div className="row" style={{alignItems:"flex-start",justifyContent:"space-between",gap:12}}>
              <div style={{flex:1}}>
                <div style={{fontSize:19,fontWeight:800,letterSpacing:"-.3px",lineHeight:1.2}}>{job.title}</div>
                <div style={{fontSize:14,color:"var(--t2)",marginTop:4}}>{job.company}</div>
                <div className="row mt8 wrap">
                  <span className={`pill ${stageInfo.pill}`} style={{color:stageInfo.color}}>{stageInfo.label}</span>
                  {job.jobType && <span className={`pill ${typeColor[job.jobType]||"p-ghost"}`}>{job.jobType}</span>}
                  {job.salary  && <span className="pill p-ghost" style={{fontFamily:"var(--mono)"}}>{job.salary}</span>}
                  {job.url     && <a href={job.url} target="_blank" rel="noreferrer" className="btn btn-xs" style={{textDecoration:"none"}}>↗ Apply</a>}
                  {dueCt > 0   && <span className="pill p-red">🔔 {dueCt} follow-up{dueCt>1?"s":""} due</span>}
                </div>
              </div>
              <div className="row" style={{gap:4,flexShrink:0}}>
                <button className="btn-icon" title="Edit" onClick={() => setEditing(true)}>✎</button>
                <button className="btn-icon" title="Close" onClick={onClose}>✕</button>
              </div>
            </div>
          )}
        </div>

        <div className="panel-tabs">
          {[["overview","Overview"],["networking","Networking"],["milestones","Milestones"],["resume","Resume Prep"],["onboarding","Onboarding Log"]].map(([k,l]) => (
            <button key={k} className={`ptab${tab===k?" on":""}`} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>

        <div className="panel-body">

          {/* OVERVIEW */}
          {tab === "overview" && (
            <div>
              <div className="detail-grid">
                <div className="dfield">
                  <div className="dflabel">Status</div>
                  <select style={{background:"transparent",border:"none",color:stageInfo.color,fontFamily:"var(--sans)",fontSize:14,fontWeight:700,cursor:"pointer",width:"100%",outline:"none"}}
                    value={job.status} onChange={e => patch({ status: e.target.value })}>
                    {ALL_STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                  </select>
                </div>
                <div className="dfield">
                  <div className="dflabel">Added</div>
                  <div className="dfval" style={{fontSize:13,color:"var(--t2)"}}>
                    {job.createdAt?.toDate ? job.createdAt.toDate().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}) : "—"}
                  </div>
                </div>
              </div>
              <div className="sec-title mt16">Job Description</div>
              {job.jd ? (
                <pre style={{fontFamily:"var(--sans)",fontSize:13,lineHeight:1.75,color:"var(--t2)",whiteSpace:"pre-wrap",background:"var(--s2)",border:"1px solid var(--border)",borderRadius:"var(--r)",padding:16}}>{job.jd}</pre>
              ) : (
                <div style={{fontSize:13,color:"var(--t3)",background:"var(--s2)",border:"1px solid var(--border)",borderRadius:"var(--r)",padding:16,fontStyle:"italic"}}>
                  No job description saved. Edit the job to paste one — it unlocks keyword extraction and resume prep.
                </div>
              )}
            </div>
          )}

          {/* NETWORKING */}
          {tab === "networking" && (
            <div>
              <div className="row mb12" style={{justifyContent:"space-between"}}>
                <span className="sec-title" style={{margin:0,flex:"none"}}>Contacts</span>
                <button className="btn btn-sm" onClick={() => setShowAddC(true)}>+ Add contact</button>
              </div>

              {contacts.length === 0 && (
                <div className="empty" style={{padding:"20px 0"}}>
                  <div className="empty-ico">👤</div>
                  <p>No contacts yet. Add a recruiter or hiring manager.</p>
                </div>
              )}

              {contacts.map(c => {
                const rs = remindStatus(c);
                const rcClass = rs==="due"?"rc-due":rs==="soon"?"rc-soon":rs==="ok"?"rc-ok":"rc-none";
                return (
                  <div key={c.id} className="ccard">
                    <div className="cava">{initials(c.name)}</div>
                    <div className="cinfo">
                      <div className="cname">{c.name}</div>
                      <div className="crole">{[c.title,c.platform].filter(Boolean).join(" · ")}</div>
                      <div className={`remind-chip ${rcClass}`} onClick={() => markContacted(c.id)} title="Click to mark contacted today">
                        {rs==="due"?"🔔":rs==="soon"?"⏳":rs==="ok"?"✓":"○"} {remindLabel(c)}
                      </div>
                    </div>
                    <div className="row" style={{gap:4}}>
                      <button className="btn btn-xs" onClick={() => {
                        setNi(p => ({...p, contactIdx: contacts.findIndex(x=>x.id===c.id)||0}));
                        setShowAddI(true);
                      }}>Log</button>
                      <button className="btn-icon" style={{width:26,height:26,fontSize:13}} onClick={() => removeContact(c.id)}>×</button>
                    </div>
                  </div>
                );
              })}

              {contacts.length > 0 && (
                <div className="mt16">
                  <div className="row mb12" style={{justifyContent:"space-between"}}>
                    <span className="sec-title" style={{margin:0,flex:"none"}}>Interaction History</span>
                    <button className="btn btn-sm" onClick={() => setShowAddI(true)}>+ Log</button>
                  </div>
                  {interactions.length === 0 && <p style={{fontSize:13,color:"var(--t3)"}}>No interactions logged yet.</p>}
                  {interactions.map((int, i) => (
                    <div key={int.id} className="tl">
                      <div className="tl-spine">
                        <div className="tl-dot" />
                        {i < interactions.length - 1 && <div className="tl-line" />}
                      </div>
                      <div className="tl-body">
                        <div className="tl-meta">{int.date} · {int.contactName} · {int.platform}</div>
                        <div className="tl-text">{int.note}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {showAddC && (
                <Modal title="Add Contact" onClose={() => setShowAddC(false)}
                  footer={<><button className="btn" onClick={() => setShowAddC(false)}>Cancel</button><button className="btn btn-primary" onClick={addContact}>Add</button></>}>
                  <div className="grid2">
                    <div className="fg"><label className="fl fl-left">Name *</label><input className="fi" placeholder="Jane Doe" value={nc.name} onChange={e => setNc(p=>({...p,name:e.target.value}))} /></div>
                    <div className="fg"><label className="fl fl-left">Title</label><input className="fi" placeholder="Technical Recruiter" value={nc.title} onChange={e => setNc(p=>({...p,title:e.target.value}))} /></div>
                  </div>
                  <div className="grid2">
                    <div className="fg"><label className="fl fl-left">Platform</label>
                      <select className="fi" value={nc.platform} onChange={e => setNc(p=>({...p,platform:e.target.value}))}>
                        {PLATFORMS.map(p => <option key={p}>{p}</option>)}
                      </select>
                    </div>
                    <div className="fg"><label className="fl fl-left">Remind me after</label>
                      <select className="fi" value={nc.remindAfter} onChange={e => setNc(p=>({...p,remindAfter:e.target.value}))}>
                        {Object.keys(REMIND_DAYS).map(r => <option key={r}>{r}</option>)}
                      </select>
                    </div>
                  </div>
                </Modal>
              )}

              {showAddI && (
                <Modal title="Log Interaction" onClose={() => setShowAddI(false)}
                  footer={<><button className="btn" onClick={() => setShowAddI(false)}>Cancel</button><button className="btn btn-primary" onClick={addInteraction}>Log</button></>}>
                  <div className="grid2">
                    <div className="fg"><label className="fl fl-left">Contact</label>
                      <select className="fi" value={ni.contactIdx} onChange={e => setNi(p=>({...p,contactIdx:+e.target.value}))}>
                        {contacts.map((c,i) => <option key={c.id} value={i}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="fg"><label className="fl fl-left">Platform</label>
                      <select className="fi" value={ni.platform} onChange={e => setNi(p=>({...p,platform:e.target.value}))}>
                        {PLATFORMS.map(p => <option key={p}>{p}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="fg"><label className="fl fl-left">Date</label><input type="date" className="fi" value={ni.date} onChange={e => setNi(p=>({...p,date:e.target.value}))} /></div>
                  <div className="fg"><label className="fl fl-left">Note *</label>
                    <textarea className="fi" rows={3} placeholder="What happened? What's next?" value={ni.note} onChange={e => setNi(p=>({...p,note:e.target.value}))} />
                  </div>
                </Modal>
              )}
            </div>
          )}

          {/* MILESTONES */}
          {tab === "milestones" && (
            <div>
              {MILESTONES.map(m => {
                const done = !!milestones[m.key];
                return (
                  <div key={m.key} className="ms-row">
                    <button className={`ms-chk${done?" done":""}`} onClick={() => toggleMs(m.key)}>{done && "✓"}</button>
                    <span className={`ms-lbl${done?" done":""}`}>{m.label}</span>
                    {done ? (
                      <input type="date" className="fi" style={{width:150,padding:"4px 10px",fontSize:12}}
                        value={milestones[m.key]||""} onChange={e => setMsDate(m.key, e.target.value)} />
                    ) : <span style={{fontSize:12,color:"var(--t3)"}}>—</span>}
                  </div>
                );
              })}
              <div className="divider" />
              <button className="btn btn-sm" style={{color:"var(--red2)"}} onClick={async () => {
                await patch({ status: "declined", archived: true }); onClose(); showToast("Job archived");
              }}>Archive this job</button>
            </div>
          )}

          {/* RESUME PREP */}
          {tab === "resume" && (
            <div>
              <div className="rtip">
                <strong>How to use this:</strong> Pick keywords from the JD that match your experience, copy a bullet from your bank, then paste everything into ChatGPT or Claude with the prompt below. No AI here — just clean prep work.
              </div>

              <div className="rsec">
                <h3>Keywords from Job Description</h3>
                <p>Appear 2+ times in the JD. Click ones you can speak to confidently.</p>
                {jdKw.length === 0 ? (
                  <p style={{color:"var(--t3)",fontStyle:"italic"}}>Paste a job description in the Overview tab first.</p>
                ) : (
                  <>
                    <div className="kw-wrap mb12">
                      {jdKw.map(kw => (
                        <span key={kw} className={`kw${pickedKw.includes(kw)?" on":""}`}
                          onClick={() => setPickedKw(p => p.includes(kw) ? p.filter(k=>k!==kw) : [...p,kw])}>
                          {kw}
                        </span>
                      ))}
                    </div>
                    {pickedKw.length > 0 && (
                      <div className="row" style={{alignItems:"flex-start",gap:10}}>
                        <div className="copy-box" style={{flex:1,fontFamily:"var(--sans)",fontSize:13}}>
                          My relevant keywords: {pickedKw.join(", ")}
                        </div>
                        <CopyBtn text={`My relevant keywords: ${pickedKw.join(", ")}`} showToast={showToast} />
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="rsec">
                <h3>Experience Bullets to Copy</h3>
                <p>Grab any bullet and paste it into your AI prompt alongside the JD.</p>
                {experiences.length === 0 ? (
                  <p style={{color:"var(--t3)",fontStyle:"italic"}}>Add experiences in the Experience Bank first.</p>
                ) : experiences.map(exp => (
                  <div key={exp.id} style={{marginBottom:14}}>
                    <div style={{fontSize:12,fontWeight:700,color:"var(--t2)",marginBottom:5}}>
                      {exp.title}{exp.org ? ` · ${exp.org}` : ""}
                    </div>
                    {(exp.bullets||[]).map((b, i) => (
                      <div key={i} className="bullet">
                        <div className="bdot" /><div className="btext">{b}</div>
                        <CopyBtn text={b} showToast={showToast} />
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <div className="rsec">
                <h3>Ready-to-Paste AI Prompt</h3>
                <p>Copy this entire block into ChatGPT or Claude.</p>
                {job.jd ? (
                  <div className="row" style={{alignItems:"flex-start",gap:10}}>
                    <div className="copy-box" style={{flex:1}}>
{`I'm applying for "${job.title}" at ${job.company}.

JOB DESCRIPTION:
${job.jd.slice(0,1000)}${job.jd.length>1000?"...":""}
${pickedKw.length>0?`\nKEYWORDS I CAN SPEAK TO:\n${pickedKw.join(", ")}\n`:""}`+
`PLEASE HELP ME:
1. Rewrite my resume summary for this specific role (2-3 sentences)
2. Identify which of my experience bullets to highlight or rewrite
3. Flag any skills gaps I should address in my cover letter`}
                    </div>
                    <CopyBtn text={
`I'm applying for "${job.title}" at ${job.company}.\n\nJOB DESCRIPTION:\n${job.jd.slice(0,1000)}${job.jd.length>1000?"...":""}\n${pickedKw.length>0?`\nKEYWORDS I CAN SPEAK TO:\n${pickedKw.join(", ")}\n`:""}\nPLEASE HELP ME:\n1. Rewrite my resume summary for this specific role (2-3 sentences)\n2. Identify which of my experience bullets to highlight or rewrite\n3. Flag any skills gaps I should address in my cover letter`
                    } showToast={showToast} />
                  </div>
                ) : <p style={{color:"var(--t3)",fontStyle:"italic"}}>Paste a JD in the Overview tab to generate this.</p>}
              </div>
            </div>
          )}

          {/* ONBOARDING LOG */}
          {tab === "onboarding" && (() => {
            const ob = job.onboarding;
            if (!ob) return (
              <div className="empty">
                <div className="empty-ico">🚀</div>
                <p>No onboarding data. This job was added without the wizard.<br/>Use "New Application Wizard" next time for full prep tracking.</p>
              </div>
            );
            const CHECKLIST_LABELS = {tailored:"Tailored resume",numbers:"Added metrics",keywords:"Keywords included",cover:"Cover letter written",linkedin:"LinkedIn updated",portfolio:"Portfolio checked",proofread:"Proofread"};
            return (
              <div>
                <div className="sec-title">Preparation Summary</div>
                <div style={{background:"var(--s2)",border:"1px solid var(--border)",borderRadius:"var(--r)",padding:16,marginBottom:16}}>
                  {[
                    {ico:ob.recruiterContacted==="yes"?"✅":"⬜",label:"Contacted recruiter",val:ob.recruiterContacted==="yes"?"Yes":ob.recruiterContacted==="no"?"Not yet":"Skipped"},
                    {ico:ob.jdRead==="yes"?"✅":"⬜",label:"Read full JD",val:ob.jdRead==="yes"?"Yes":"No"},
                    {ico:ob.jdSimplified==="yes"?"✅":"⬜",label:"Simplified JD with AI",val:ob.jdSimplified==="yes"?"Yes":"No"},
                    {ico:"📊",label:"Skill match score",val:`${ob.matchScore||0}% (${(ob.matchedKeywords||[]).length} keywords matched)`},
                    {ico:ob.resumeRephrased==="yes"?"✅":"⬜",label:"Resume tailored",val:ob.resumeRephrased==="yes"?"Yes":"No"},
                    {ico:ob.cvRephrased==="yes"?"✅":"⬜",label:"Cover letter written",val:ob.cvRephrased==="yes"?"Yes":"No"},
                    {ico:"📅",label:"Completed",val:ob.completedAt||"—"},
                  ].map((r,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 0",borderBottom:"1px solid var(--border)"}}>
                      <span style={{fontSize:15,width:22,textAlign:"center"}}>{r.ico}</span>
                      <span style={{fontSize:13,color:"var(--t2)",flex:1}}>{r.label}</span>
                      <span style={{fontSize:13,fontWeight:600}}>{r.val}</span>
                    </div>
                  ))}
                </div>

                {(ob.matchedKeywords||[]).length > 0 && (
                  <div style={{marginBottom:16}}>
                    <div className="sec-title">Matched Keywords</div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                      {ob.matchedKeywords.map(kw=><span key={kw} style={{padding:"3px 9px",borderRadius:20,fontSize:11,fontWeight:600,background:"var(--green-bg)",color:"var(--green2)"}}>✓ {kw}</span>)}
                    </div>
                  </div>
                )}

                {(ob.missingKeywords||[]).length > 0 && (
                  <div style={{marginBottom:16}}>
                    <div className="sec-title">Gaps to Address</div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                      {ob.missingKeywords.slice(0,20).map(kw=><span key={kw} style={{padding:"3px 9px",borderRadius:20,fontSize:11,fontWeight:600,background:"var(--s3)",color:"var(--t2)",border:"1px solid var(--border)"}}>○ {kw}</span>)}
                    </div>
                  </div>
                )}

                {ob.simplifiedText && (
                  <div style={{marginBottom:16}}>
                    <div className="sec-title">AI-Simplified JD Notes</div>
                    <pre style={{fontFamily:"var(--sans)",fontSize:13,lineHeight:1.7,color:"var(--t2)",whiteSpace:"pre-wrap",background:"var(--s2)",border:"1px solid var(--border)",borderRadius:"var(--r)",padding:14}}>{ob.simplifiedText}</pre>
                  </div>
                )}

                {ob.checklist && Object.keys(ob.checklist).length > 0 && (
                  <div>
                    <div className="sec-title">Final Checklist</div>
                    {Object.entries(CHECKLIST_LABELS).map(([k,l])=>(
                      <div key={k} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 0",borderBottom:"1px solid var(--border)"}}>
                        <span style={{fontSize:14}}>{ob.checklist[k]?"✅":"⬜"}</span>
                        <span style={{fontSize:13,color:ob.checklist[k]?"var(--text)":"var(--t3)"}}>{l}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

        </div>
      </div>
    </>
  );
}

/* ─── DASHBOARD PAGE ─────────────────────────────────────────────────── */
function Dashboard({ uid, jobs, experiences, showToast }) {
  const [selJob, setSelJob]   = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [dragId, setDragId]   = useState(null);
  const [overCol, setOverCol] = useState(null);
  const [form, setForm]       = useState({ title:"",company:"",salary:"",jobType:"Remote",url:"",jd:"",status:"applied" });
  const setF = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const activeJobs = jobs.filter(j => !j.archived);
  const recentJobs = [...activeJobs].sort((a,b) => {
    const ta = a.createdAt?.toDate?.() || new Date(0);
    const tb = b.createdAt?.toDate?.() || new Date(0);
    return tb - ta;
  }).slice(0, 5);

  const total        = activeJobs.length;
  const interviewing = activeJobs.filter(j => j.status === "interview").length;
  const offered      = activeJobs.filter(j => j.status === "offer").length;
  const applied      = activeJobs.filter(j => j.status !== "bookmarked").length;
  const responded    = activeJobs.filter(j => ["interview","offer"].includes(j.status)).length;
  const ghostedCt    = activeJobs.filter(j => j.status === "declined" || j.status === "applied").length;
  const ghostPct     = applied > 0 ? Math.round((ghostedCt / applied) * 100) : 0;

  // pipeline counts
  const stageCount = key => activeJobs.filter(j => j.status === key).length;

  async function addJob() {
    if (!form.title.trim() || !form.company.trim()) return;
    await fsAdd(uid, "jobs", { ...form, archived:false, milestones:{}, contacts:[], interactions:[] });
    setShowAdd(false); setForm({ title:"",company:"",salary:"",jobType:"Remote",url:"",jd:"",status:"applied" });
    showToast("Job added");
  }

  function onDragStart(e, id) { setDragId(id); e.dataTransfer.effectAllowed = "move"; }
  function onDragEnd()        { setDragId(null); setOverCol(null); }
  function onDragOverCol(e, key) { e.preventDefault(); setOverCol(key); }
  async function onDrop(e, key) {
    e.preventDefault();
    if (dragId) { await fsUpd(uid, "jobs", dragId, { status: key }); showToast("Status updated"); }
    setDragId(null); setOverCol(null);
  }

  const liveJob = selJob ? jobs.find(j => j.id === selJob.id) || selJob : null;
  const stageInfo = s => STAGES.find(x=>x.key===s) || STAGES[0];
  const typeColor = { Remote:"p-green", Hybrid:"p-amber", "On-site":"p-blue" };

  const statCards = [
    { label:"TOTAL APPS",     val:total,        color:"var(--blue2)",  sub:"all time" },
    { label:"INTERVIEWING",   val:interviewing,  color:"var(--amber2)", sub:`${applied>0?Math.round((interviewing/applied)*100):0}% of apps` },
    { label:"OFFERS",         val:offered,       color:"var(--green2)", sub:"keep pushing" },
    { label:"GHOSTED %",      val:`${ghostPct}%`,color:"var(--t2)",     sub:`${ghostedCt} of ${applied} apps` },
  ];

  return (
    <div className="page-scroll">
      <div className="ph">
        <div className="ph-title">Dashboard</div>
        <div className="ph-sub">Your job search at a glance</div>
      </div>
      <div className="page-body">

        {/* Stat cards */}
        <div className="stats-row">
          {statCards.map(s => (
            <div key={s.label} className="scard">
              <div className="scard-label">{s.label}</div>
              <div className="scard-num" style={{color:s.color}}>{s.val}</div>
              <div className="scard-sub">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Two column: recent + pipeline */}
        <div className="dash-cols">
          <div className="dash-card">
            <div className="dash-card-title">Recent Applications</div>
            {recentJobs.length === 0 ? (
              <div className="empty" style={{padding:"20px 0"}}><div className="empty-ico">📋</div><p>No applications yet</p></div>
            ) : recentJobs.map(j => {
              const si = stageInfo(j.status);
              return (
                <div key={j.id} className="app-row" style={{cursor:"pointer"}} onClick={() => setSelJob(j)}>
                  <div className="app-dot" style={{background:si.dot}} />
                  <div style={{flex:1}}>
                    <div className="app-title">{j.title}</div>
                    <div className="app-co">{j.company}</div>
                  </div>
                  <span className={`pill ${si.pill}`} style={{color:si.color,marginRight:4}}>{si.label}</span>
                  <button className="btn-icon" style={{width:24,height:24,fontSize:12,flexShrink:0}} title="Delete" onClick={async e=>{e.stopPropagation();if(window.confirm(`Delete "${j.title}"?`)){await fsDel(uid,"jobs",j.id);showToast("Deleted");}}}> 🗑</button>
                </div>
              );
            })}
          </div>

          <div className="dash-card">
            <div className="dash-card-title">Pipeline Breakdown</div>
            {[
              { label:"Applied",      val: stageCount("applied"),   color:"var(--blue)" },
              { label:"Interviewing", val: stageCount("interview"), color:"var(--amber)" },
              { label:"Offered",      val: stageCount("offer"),     color:"var(--green)" },
              { label:"Declined",     val: stageCount("declined"),  color:"var(--red)" },
            ].map(row => {
              const pct = total > 0 ? Math.round((row.val / total) * 100) : 0;
              return (
                <div key={row.label} className="pipe-row">
                  <div className="pipe-meta">
                    <span className="pipe-label">{row.label}</span>
                    <span className="pipe-val">{row.val}</span>
                  </div>
                  <div className="pipe-track">
                    <div className="pipe-fill" style={{width:`${pct}%`, background:row.color}} />
                  </div>
                </div>
              );
            })}

            <div className="divider" />
            <div className="row" style={{justifyContent:"space-between"}}>
              <span style={{fontSize:13,color:"var(--t2)"}}>Response rate</span>
              <span style={{fontFamily:"var(--mono)",fontSize:13,fontWeight:600,color:"var(--amber2)"}}>
                {applied > 0 ? Math.round((responded/applied)*100) : 0}%
              </span>
            </div>
            <div className="row mt12" style={{justifyContent:"space-between"}}>
              <span style={{fontSize:13,color:"var(--t2)"}}>Experience bank</span>
              <span style={{fontFamily:"var(--mono)",fontSize:13,fontWeight:600,color:"var(--blue2)"}}>
                <strong>{experiences.length}</strong> entries
              </span>
            </div>
          </div>
        </div>
      </div>

      {liveJob && <JobPanel uid={uid} job={liveJob} onClose={() => setSelJob(null)} experiences={experiences} showToast={showToast} />}
      {showAdd && (
        <Modal title="Add Application" onClose={() => setShowAdd(false)} wide
          footer={<><button className="btn" onClick={() => setShowAdd(false)}>Cancel</button><button className="btn btn-primary" onClick={addJob}>Add job</button></>}>
          <div className="grid2">
            <div className="fg"><label className="fl fl-left">Job Title *</label><input className="fi" placeholder="Software Engineer" value={form.title} onChange={e=>setF("title",e.target.value)} /></div>
            <div className="fg"><label className="fl fl-left">Company *</label><input className="fi" placeholder="Acme Corp" value={form.company} onChange={e=>setF("company",e.target.value)} /></div>
          </div>
          <div className="grid3">
            <div className="fg"><label className="fl fl-left">Salary</label><input className="fi" placeholder="$120k" value={form.salary} onChange={e=>setF("salary",e.target.value)} /></div>
            <div className="fg"><label className="fl fl-left">Type</label>
              <select className="fi" value={form.jobType} onChange={e=>setF("jobType",e.target.value)}>
                {JOB_TYPES.map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="fg"><label className="fl fl-left">Stage</label>
              <select className="fi" value={form.status} onChange={e=>setF("status",e.target.value)}>
                {ALL_STAGES.map(s=><option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
            </div>
          </div>
          <div className="fg"><label className="fl fl-left">Application URL</label><input className="fi" placeholder="https://…" value={form.url} onChange={e=>setF("url",e.target.value)} /></div>
          <div className="fg"><label className="fl fl-left">Job Description</label>
            <textarea className="fi" rows={6} placeholder="Paste the full JD here — enables keyword extraction and resume prep…" value={form.jd} onChange={e=>setF("jd",e.target.value)} />
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ─── APPLICATION TRACKER (KANBAN) ──────────────────────────────────── */
function AppTracker({ uid, jobs, experiences, showToast }) {
  const [selJob, setSelJob]   = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [dragId, setDragId]   = useState(null);
  const [overCol, setOverCol] = useState(null);
  const [form, setForm]       = useState({ title:"",company:"",salary:"",jobType:"Remote",url:"",jd:"",status:"applied" });
  const setF = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const activeJobs = jobs.filter(j => !j.archived);

  async function addJob() {
    if (!form.title.trim() || !form.company.trim()) return;
    await fsAdd(uid, "jobs", { ...form, archived:false, milestones:{}, contacts:[], interactions:[] });
    setShowAdd(false); setForm({ title:"",company:"",salary:"",jobType:"Remote",url:"",jd:"",status:"applied" });
    showToast("Application added");
  }

  function onDragStart(e, id) { setDragId(id); e.dataTransfer.effectAllowed = "move"; }
  function onDragEnd()        { setDragId(null); setOverCol(null); }
  async function onDrop(e, key) {
    e.preventDefault();
    if (dragId) { await fsUpd(uid, "jobs", dragId, { status: key }); showToast("Status updated"); }
    setDragId(null); setOverCol(null);
  }

  const liveJob = selJob ? jobs.find(j => j.id === selJob.id) || selJob : null;
  const typeColor = { Remote:"p-green", Hybrid:"p-amber", "On-site":"p-blue" };

  const [showOnboard, setShowOnboard] = useState(false);

  if (showOnboard) {
    return <JobOnboarding uid={uid} experiences={experiences} showToast={showToast}
      onComplete={() => setShowOnboard(false)}
      onCancel={() => setShowOnboard(false)} />;
  }

  return (
    <div className="page-scroll">
      <div style={{padding:"28px 32px 20px",display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:12,flexShrink:0}}>
        <div>
          <div style={{fontSize:22,fontWeight:800,letterSpacing:"-.4px"}}>Application Tracker</div>
          <div style={{fontSize:13,color:"var(--t2)",marginTop:4}}>Drag cards between columns to update status</div>
        </div>
        <div className="row" style={{gap:8}}>
          <button className="btn" onClick={() => setShowAdd(true)}>+ Quick add</button>
          <button className="btn btn-primary" onClick={() => setShowOnboard(true)}>🚀 New Application Wizard</button>
        </div>
      </div>

      <div style={{padding:"0 32px 32px"}}>
        <div className="board-wrap">
          <div className="board">
            {STAGES.map(stage => {
              const cards = activeJobs.filter(j => j.status === stage.key);
              const isDragOver = overCol === stage.key;
              return (
                <div key={stage.key} className={`col${isDragOver?" over":""}`}
                  onDragOver={e => { e.preventDefault(); setOverCol(stage.key); }}
                  onDrop={e => onDrop(e, stage.key)}
                  onDragLeave={() => setOverCol(null)}>
                  <div className="col-hd">
                    <div className="col-dot" style={{background:stage.dot}} />
                    <span className="col-name" style={{color:stage.color}}>{stage.label}</span>
                    <span className="col-ct">{cards.length}</span>
                  </div>
                  <div className="col-body">
                    {cards.length === 0 && <div className="col-empty">Drop here</div>}
                    {cards.map(job => {
                      const remDue = (job.contacts||[]).filter(c => remindStatus(c)==="due").length;
                      return (
                        <div key={job.id} className={`jcard${dragId===job.id?" drag":""}`}
                          draggable onDragStart={e => onDragStart(e, job.id)} onDragEnd={onDragEnd}>
                          {remDue > 0 && <div className="remind-dot" title={`${remDue} follow-up due`} />}
                          <div className="jcard-top">
                            <div className="jcard-title">{job.title}</div>
                            <div className="row" style={{gap:2,flexShrink:0}}>
                              <button className="open-btn" title="Open details" onClick={e=>{e.stopPropagation();setSelJob(job);}}>⤢</button>
                              <button className="open-btn" title="Delete job" style={{color:"var(--t3)"}} onClick={async e=>{e.stopPropagation();if(window.confirm(`Delete "${job.title}" at ${job.company}? This cannot be undone.`)){await fsDel(uid,"jobs",job.id);showToast("Job deleted");}}}>🗑</button>
                            </div>
                          </div>
                          <div className="jcard-co">{job.company}</div>
                          <div className="jcard-foot">
                            {job.jobType && <span className={`pill ${typeColor[job.jobType]||"p-ghost"}`}>{job.jobType}</span>}
                            {job.salary  && <span style={{fontSize:11,color:"var(--t3)",fontFamily:"var(--mono)"}}>{job.salary}</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {liveJob && <JobPanel uid={uid} job={liveJob} onClose={() => setSelJob(null)} experiences={experiences} showToast={showToast} />}
      {showAdd && (
        <Modal title="Add Application" onClose={() => setShowAdd(false)} wide
          footer={<><button className="btn" onClick={() => setShowAdd(false)}>Cancel</button><button className="btn btn-primary" onClick={addJob}>Add</button></>}>
          <div className="grid2">
            <div className="fg"><label className="fl fl-left">Job Title *</label><input className="fi" placeholder="Software Engineer" value={form.title} onChange={e=>setF("title",e.target.value)} /></div>
            <div className="fg"><label className="fl fl-left">Company *</label><input className="fi" placeholder="Acme Corp" value={form.company} onChange={e=>setF("company",e.target.value)} /></div>
          </div>
          <div className="grid3">
            <div className="fg"><label className="fl fl-left">Salary</label><input className="fi" placeholder="$120k" value={form.salary} onChange={e=>setF("salary",e.target.value)} /></div>
            <div className="fg"><label className="fl fl-left">Type</label>
              <select className="fi" value={form.jobType} onChange={e=>setF("jobType",e.target.value)}>
                {JOB_TYPES.map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="fg"><label className="fl fl-left">Stage</label>
              <select className="fi" value={form.status} onChange={e=>setF("status",e.target.value)}>
                {STAGES.map(s=><option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
            </div>
          </div>
          <div className="fg"><label className="fl fl-left">Application URL</label><input className="fi" placeholder="https://…" value={form.url} onChange={e=>setF("url",e.target.value)} /></div>
          <div className="fg"><label className="fl fl-left">Job Description</label>
            <textarea className="fi" rows={5} placeholder="Paste the full JD here…" value={form.jd} onChange={e=>setF("jd",e.target.value)} />
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ─── EXPERIENCE BANK ────────────────────────────────────────────────── */
function ExpBank({ uid, experiences, showToast }) {
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem]   = useState(null);
  const [filterType, setFilterType] = useState("All");
  const [form, setForm] = useState({ title:"", org:"", type:"Work Experience", date:"", description:"", bullets:[""], tags:"" });
  const setF = (k, v) => setForm(p => ({ ...p, [k]: v }));

  function openAdd() {
    setForm({ title:"", org:"", type:"Work Experience", date:"", description:"", bullets:[""], tags:"" });
    setEditItem(null); setShowModal(true);
  }
  function openEdit(e) {
    setForm({ title:e.title, org:e.org||"", type:e.type||"Work Experience", date:e.date||"", description:e.description||"", bullets:e.bullets||[""], tags:(e.tags||[]).join(", ") });
    setEditItem(e); setShowModal(true);
  }
  async function save() {
    const data = { ...form, bullets: form.bullets.filter(b => b.trim()), tags: form.tags.split(",").map(t=>t.trim()).filter(Boolean) };
    if (!data.title.trim()) return;
    if (editItem) { await fsUpd(uid, "experiences", editItem.id, data); showToast("Updated"); }
    else          { await fsAdd(uid, "experiences", data);               showToast("Entry added"); }
    setShowModal(false);
  }
  async function remove(id) { await fsDel(uid, "experiences", id); showToast("Deleted"); }

  function setBullet(i, val) { const a=[...form.bullets]; a[i]=val; setF("bullets",a); }
  function removeBullet(i)   { setF("bullets", form.bullets.filter((_,j)=>j!==i)); }
  function addBullet()       { setF("bullets", [...form.bullets,""]); }

  const typeColors = { "Work Experience":"p-blue","Internship":"p-purple","Project":"p-green","Volunteering":"p-amber","Research":"p-purple","Achievement":"p-amber","Leadership":"p-blue","Other":"p-ghost" };
  const types = ["All", ...EXP_TYPES];
  const filtered = filterType === "All" ? experiences : experiences.filter(e => (e.type||"Work Experience") === filterType);

  return (
    <div className="page-scroll">
      <div style={{padding:"28px 32px 20px",display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:12,flexShrink:0}}>
        <div>
          <div style={{fontSize:22,fontWeight:800,letterSpacing:"-.4px"}}>Experience Bank</div>
          <div style={{fontSize:13,color:"var(--t2)",marginTop:4}}>Jobs, projects, volunteering, achievements — everything that makes you you</div>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add experience</button>
      </div>
      <div style={{padding:"0 32px 32px"}}>
        {/* Type filter tabs */}
        <div className="row wrap mb16" style={{gap:6}}>
          {types.map(t => (
            <button key={t} className={`btn btn-sm${filterType===t?" btn-primary":""}`} onClick={() => setFilterType(t)}>{t}</button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="empty"><div className="empty-ico">📂</div>
            <p>{filterType==="All" ? "No entries yet. Add your first experience." : `No ${filterType} entries yet.`}</p>
          </div>
        )}

        {filtered.map(exp => (
          <div key={exp.id} className="ecard">
            <div className="ecard-hd">
              <div style={{flex:1}}>
                <div className="ecard-title">{exp.title}</div>
                <div className="ecard-meta">
                  {exp.org && <span>{exp.org}</span>}
                  {exp.org && exp.date && <span> · </span>}
                  {exp.date && <span style={{fontFamily:"var(--mono)",fontSize:11}}>{exp.date}</span>}
                </div>
                <div className="row wrap mt8">
                  <span className={`pill ${typeColors[exp.type||"Work Experience"]||"p-ghost"}`}>{exp.type||"Work Experience"}</span>
                  {(exp.tags||[]).map(t => <span key={t} className="pill p-ghost">{t}</span>)}
                </div>
              </div>
              <div className="row" style={{gap:4}}>
                <button className="btn-icon" title="Edit" onClick={() => openEdit(exp)}>✎</button>
                <button className="btn-icon" title="Delete" style={{color:"var(--t3)"}} onClick={() => remove(exp.id)}>🗑</button>
              </div>
            </div>
            {exp.description && <p style={{fontSize:13,color:"var(--t2)",marginBottom:10,lineHeight:1.6}}>{exp.description}</p>}
            {(exp.bullets||[]).map((b, i) => (
              <div key={i} className="bullet">
                <div className="bdot" /><div className="btext">{b}</div>
                <CopyBtn text={b} showToast={showToast} />
              </div>
            ))}
          </div>
        ))}
      </div>

      {showModal && (
        <Modal title={editItem ? "Edit Entry" : "Add Experience"} onClose={() => setShowModal(false)} wide
          footer={<><button className="btn" onClick={() => setShowModal(false)}>Cancel</button><button className="btn btn-primary" onClick={save}>Save</button></>}>
          <div className="grid2">
            <div className="fg"><label className="fl fl-left">Title *</label><input className="fi" placeholder="Software Engineer Intern" value={form.title} onChange={e=>setF("title",e.target.value)} /></div>
            <div className="fg"><label className="fl fl-left">Organization / Context</label><input className="fi" placeholder="Acme Corp / Personal" value={form.org} onChange={e=>setF("org",e.target.value)} /></div>
          </div>
          <div className="grid2">
            <div className="fg"><label className="fl fl-left">Type</label>
              <select className="fi" value={form.type} onChange={e=>setF("type",e.target.value)}>
                {EXP_TYPES.map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="fg"><label className="fl fl-left">Date / Period</label><input className="fi" placeholder="Jun 2024 – Aug 2024" value={form.date} onChange={e=>setF("date",e.target.value)} /></div>
          </div>
          <div className="fg"><label className="fl fl-left">Description</label>
            <textarea className="fi" rows={2} placeholder="Brief context about this experience…" value={form.description} onChange={e=>setF("description",e.target.value)} />
          </div>
          <div className="fg"><label className="fl fl-left">Tags (comma separated)</label>
            <input className="fi" placeholder="React, Python, Team Lead, Data Analysis…" value={form.tags} onChange={e=>setF("tags",e.target.value)} />
          </div>
          <div className="fg">
            <label className="fl fl-left">Bullet Points / Accomplishments</label>
            {form.bullets.map((b, i) => (
              <div key={i} className="row" style={{marginBottom:6,alignItems:"center"}}>
                <input className="fi" style={{flex:1}} placeholder={`Accomplishment ${i+1}…`} value={b} onChange={e=>setBullet(i,e.target.value)} />
                {form.bullets.length > 1 && <button className="btn-icon" onClick={() => removeBullet(i)} style={{flexShrink:0}}>×</button>}
              </div>
            ))}
            <button className="btn btn-sm" style={{marginTop:4,alignSelf:"flex-start"}} onClick={addBullet}>+ Add bullet</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ─── ANALYTICS PAGE ─────────────────────────────────────────────────── */
function Analytics({ jobs }) {
  const all     = jobs.filter(j => !j.archived);
  const applied = all.filter(j => j.status !== "bookmarked").length;
  const interviewing = all.filter(j => j.status === "interview").length;
  const offered = all.filter(j => j.status === "offer").length;
  const declined = all.filter(j => j.status === "declined").length;
  const ghosted = all.filter(j => {
    if (j.status !== "applied") return false;
    const d = j.createdAt?.toDate?.();
    if (!d) return false;
    return (Date.now() - d.getTime()) > 21 * 86400000;
  }).length;

  const ghostPct  = applied > 0 ? Math.round((ghosted / applied) * 100) : 0;
  const declinePct = applied > 0 ? Math.round((declined / applied) * 100) : 0;
  const offerPct  = applied > 0 ? Math.round((offered / applied) * 100) : 0;

  // avg days from apply to first update (status changed from applied)
  const responseTimes = all
    .filter(j => j.status !== "applied" && j.status !== "bookmarked" && j.createdAt?.toDate)
    .map(j => daysBetween(j.createdAt.toDate().toISOString().split("T")[0]))
    .filter(d => d !== null && d >= 0);
  const avgDays = responseTimes.length > 0 ? Math.round(responseTimes.reduce((a,b)=>a+b,0)/responseTimes.length) : 0;

  // apps per week
  const byWeek = {};
  all.forEach(j => {
    const d = j.createdAt?.toDate?.();
    if (!d) return;
    const wk = Math.floor((Date.now() - d.getTime()) / (7*86400000));
    const lbl = wk === 0 ? "This week" : wk === 1 ? "Last week" : `${wk}w ago`;
    byWeek[lbl] = (byWeek[lbl]||0) + 1;
  });
  const weekEntries = Object.entries(byWeek).slice(0,6);

  const maxWeek = Math.max(1, ...weekEntries.map(([,v])=>v));

  const funnelRows = [
    { label:"Applied",      val:applied,     color:"var(--blue)" },
    { label:"Interviewing", val:interviewing, color:"var(--amber)" },
    { label:"Offered",      val:offered,     color:"var(--green)" },
    { label:"Declined",     val:declined,    color:"var(--red)" },
  ];

  const statCards = [
    { label:"GHOSTED %",      val:`${ghostPct}%`,   color:"var(--t2)",     sub:`${ghosted} no response after 21d` },
    { label:"DECLINE RATE",   val:`${declinePct}%`, color:"var(--t2)",     sub:`${declined} rejections` },
    { label:"OFFER RATE",     val:`${offerPct}%`,   color:"var(--green2)", sub:`${offered} offers` },
    { label:"AVG RESPONSE",   val:`${avgDays}d`,    color:"var(--amber2)", sub:"from apply to update" },
  ];

  return (
    <div className="page-scroll">
      <div className="ph">
        <div className="ph-title">Analytics</div>
        <div className="ph-sub">Funnel metrics and ghosting analysis</div>
      </div>
      <div className="page-body">
        <div className="analytics-stats">
          {statCards.map(s => (
            <div key={s.label} className="ascard">
              <div className="ascard-label">{s.label}</div>
              <div className="ascard-num" style={{color:s.color}}>{s.val}</div>
              <div className="ascard-sub">{s.sub}</div>
            </div>
          ))}
        </div>

        <div className="analytics-cols">
          <div className="acol-card">
            <div className="acol-title">Conversion funnel</div>
            {funnelRows.map(row => {
              const pct = applied > 0 ? Math.round((row.val/applied)*100) : 0;
              return (
                <div key={row.label} className="pipe-row">
                  <div className="pipe-meta">
                    <span className="pipe-label">{row.label}</span>
                    <span className="pipe-val" style={{color:row.color}}>{row.val}</span>
                  </div>
                  <div className="pipe-track">
                    <div className="pipe-fill" style={{width:`${pct}%`,background:row.color}} />
                  </div>
                </div>
              );
            })}
            <div className="ghost-eq">
              Ghosting: ({ghosted} / {applied}) × 100 = <span>{ghostPct}%</span>
            </div>
          </div>

          <div className="acol-card">
            <div className="acol-title">Applications per week</div>
            {weekEntries.length === 0 ? (
              <div className="empty" style={{padding:"20px 0"}}><p>No data yet</p></div>
            ) : weekEntries.map(([wk, ct]) => (
              <div key={wk} className="pipe-row">
                <div className="pipe-meta">
                  <span className="pipe-label">{wk}</span>
                  <span className="pipe-val">{ct}</span>
                </div>
                <div className="pipe-track">
                  <div className="pipe-fill" style={{width:`${Math.round((ct/maxWeek)*100)}%`,background:"var(--blue)"}} />
                </div>
              </div>
            ))}
            <div style={{marginTop:16,paddingTop:14,borderTop:"1px solid var(--border)",fontSize:12,color:"var(--t3)"}}>
              Score distribution across {all.length} tracked application{all.length!==1?"s":""}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── MASTER PROFILE ─────────────────────────────────────────────────── */
function MasterProfile({ uid, showToast }) {
  const PROFILE_KEY = "profile";
  const [profile, setProfile] = useState({
    fullName:"", email:"", phone:"", location:"", github:"", linkedin:"", website:"",
    university:"", degree:"", gpa:"", gradYear:"", summary:""
  });
  const [saving, setSaving]   = useState(false);
  const [loaded, setLoaded]   = useState(false);

  useEffect(() => {
    if (!uid) return;
    const q = query(collection(db, "users", uid, "profile"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, snap => {
      if (!snap.empty) {
        const data = snap.docs[0].data();
        setProfile(p => ({ ...p, ...data }));
      }
      setLoaded(true);
    }, () => setLoaded(true));
    return unsub;
  }, [uid]);

  const setP = (k, v) => setProfile(p => ({ ...p, [k]: v }));

  async function save() {
    setSaving(true);
    try {
      const ref = doc(db, "users", uid, "profile", "main");
      // Try update first, if doc doesn't exist use set via addDoc workaround
      try {
        await updateDoc(ref, profile);
      } catch {
        // Document may not exist yet - create it
        await addDoc(collection(db, "users", uid, "profile"), { ...profile, _id: "main" });
      }
      showToast("Profile saved");
    } catch (ex) { showToast("Error saving: " + ex.message, "err"); } finally { setSaving(false); }
  }

  const field = (label, key, placeholder, type="text") => (
    <div className="fg">
      <label className="fl fl-left">{label}</label>
      <input className="fi" type={type} placeholder={placeholder} value={profile[key]||""} onChange={e => setP(key, e.target.value)} />
    </div>
  );

  return (
    <div className="page-scroll">
      <div style={{padding:"28px 32px 20px",display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:12,flexShrink:0}}>
        <div>
          <div style={{fontSize:22,fontWeight:800,letterSpacing:"-.4px"}}>Master Profile</div>
          <div style={{fontSize:13,color:"var(--t2)",marginTop:4}}>Your base information used for all AI resume & CV generation</div>
        </div>
        <button className="btn btn-primary" onClick={save} disabled={saving}>{saving?"Saving…":"Save changes"}</button>
      </div>
      <div style={{padding:"0 32px 32px"}}>
        <div className="profile-grid">
          <div className="pcard">
            <div className="pcard-title">Personal Info</div>
            {field("Full name","fullName","Gourav Sharma")}
            {field("Email","email","you@email.com","email")}
            {field("Phone","phone","+1 (650) 555-0142","tel")}
            {field("Location","location","San Francisco, CA")}
            {field("GitHub","github","github.com/username")}
            {field("LinkedIn","linkedin","linkedin.com/in/username")}
            {field("Website / Portfolio","website","yoursite.com")}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <div className="pcard">
              <div className="pcard-title">Education</div>
              {field("University","university","Stanford University")}
              {field("Degree","degree","B.S. Computer Science")}
              {field("GPA","gpa","3.8")}
              {field("Graduation year","gradYear","2024")}
            </div>
            <div className="pcard">
              <div className="pcard-title">Professional Summary</div>
              <div className="pcard-sub">Used as context for all AI generation</div>
              <div className="fg" style={{marginBottom:0}}>
                <textarea className="fi" rows={5} placeholder="CS graduate with 2 years of experience…" value={profile.summary||""} onChange={e => setP("summary",e.target.value)} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


/* ─── JOB ONBOARDING WIZARD ─────────────────────────────────────────── */
function JobOnboarding({ uid, experiences, showToast, onComplete, onCancel }) {
  const STEPS = ["job-info","recruiter","jd-read","jd-simplify","skill-match","resume","cv","checklist","summary"];
  const STEP_LABELS = ["Job Info","Recruiter","Read JD","Simplify JD","Skill Match","Resume","Cover Letter","Final Checks","Complete"];

  const [step, setStep]       = useState(0);
  const [saving, setSaving]   = useState(false);
  const [pickedKw, setPickedKw] = useState([]);

  // Job info
  const [jForm, setJForm] = useState({ title:"", company:"", salary:"", jobType:"Remote", url:"", jd:"" });
  const setJ = (k,v) => setJForm(p=>({...p,[k]:v}));

  // Per-step answers
  const [ans, setAns] = useState({
    recruiterContacted: null,   // yes/no/skip
    recruiterName: "",
    recruiterPlatform: "LinkedIn",
    recruiterNote: "",
    jdRead: null,
    jdSimplified: null,
    simplifiedText: "",
    resumeRephrased: null,
    cvRephrased: null,
    checklist: {},
  });
  const setA = (k,v) => setAns(p=>({...p,[k]:v}));
  const toggleCheck = k => setAns(p=>({...p, checklist:{...p.checklist,[k]:!p.checklist[k]}}));

  // Skill matching
  const jdKw = (() => {
    if (!jForm.jd) return [];
    const stop = new Set(["the","and","for","with","our","that","have","this","are","you","from","will","they","been","all","not","but","can","more","about","we","an","in","to","of","a","is","it","be","as","at","or","do","by","on","its","their","also","which","who","what","when","how","use","using","used","help","support","provide","manage","build","develop","create","must","should","would","could","across","within","both","these","those","some","than","through","each","well","new","key","day","time","per","make","take","such","other","strong","good","great","work","team","role","job","experience","skills","ability","years","position","include","ensure","responsible","following","looking","work","ability"]);
    const words = jForm.jd.toLowerCase().match(new RegExp('[a-z][a-z+#.]{1,}', 'g')) || [];
    const freq = {};
    words.forEach(w => { if(!stop.has(w)) freq[w]=(freq[w]||0)+1; });
    return Object.entries(freq).filter(([,v])=>v>=2).sort((a,b)=>b[1]-a[1]).slice(0,40).map(([k])=>k);
  })();

  // Match JD keywords against experience bullets/tags/descriptions
  const expText = experiences.flatMap(e => [
    e.title||"", e.org||"", e.description||"",
    ...(e.bullets||[]), ...(e.tags||[])
  ]).join(" ").toLowerCase();

  const matchedKw  = jdKw.filter(kw => expText.includes(kw));
  const missingKw  = jdKw.filter(kw => !expText.includes(kw));
  const matchScore = jdKw.length > 0 ? Math.round((matchedKw.length / jdKw.length) * 100) : 0;

  const scoreClass = matchScore >= 70 ? "high" : matchScore >= 40 ? "mid" : "low";

  // Onboarding checklist items
  const CHECKLIST = [
    { key:"tailored",    title:"Tailored resume to this JD",     desc:"Adjusted bullets, summary, and skills section for this specific role" },
    { key:"numbers",     title:"Added metrics / numbers",         desc:"Quantified at least 2-3 achievements (e.g. improved speed by 40%)" },
    { key:"keywords",    title:"Included matching keywords",       desc:"Natural placement of keywords from the JD throughout resume" },
    { key:"cover",       title:"Wrote a targeted cover letter",   desc:"Mentioned the company by name and referenced a specific role detail" },
    { key:"linkedin",    title:"Updated LinkedIn headline",        desc:"Matches the job title or seniority level you're applying for" },
    { key:"portfolio",   title:"Checked portfolio / GitHub",      desc:"Relevant projects are visible, pinned, and have clean READMEs" },
    { key:"proofread",   title:"Proofread everything",            desc:"No typos, consistent formatting, correct dates" },
  ];

  // Progress
  const pct = Math.round((step / (STEPS.length - 1)) * 100);
  const doneSteps = STEPS.slice(0, step);

  // AI simplify prompt
  const simplifyPrompt = jForm.jd
    ? `Please simplify this job description for me. Extract:\n1. The 5 most important hard skills required\n2. The 3 most important soft skills\n3. The core responsibilities in plain English (bullet points)\n4. Any red flags or unusually high requirements\n5. A 1-sentence "Is this role for me?" verdict if I have ${experiences.length} experience entries\n\nJOB DESCRIPTION:\n${jForm.jd.slice(0,2000)}`
    : "";

  // Resume rephrase prompt
  const resumePrompt = jForm.jd
    ? `I'm applying for "${jForm.title}" at ${jForm.company}.${pickedKw.length>0?`\n\nKey JD keywords I want to highlight: ${pickedKw.join(", ")}`:""}`+
      `\n\nPlease rewrite my resume summary and top 3 bullet points to match this JD. Make it ATS-friendly and specific.\n\nJOB DESCRIPTION:\n${jForm.jd.slice(0,1200)}`
    : "";

  // CV prompt
  const cvPrompt = jForm.jd
    ? `Write a targeted cover letter for "${jForm.title}" at ${jForm.company}.\n\nTone: Professional but genuine, not generic.\nLength: 3 short paragraphs.\nMust include: Why this specific company, one concrete achievement from my background, and a clear ask.\n\nJOB DESCRIPTION:\n${jForm.jd.slice(0,800)}`
    : "";

  async function finishOnboarding() {
    if (!jForm.title.trim() || !jForm.company.trim()) { showToast("Job title and company are required", "err"); return; }
    setSaving(true);
    try {
      const contacts = [];
      if (ans.recruiterContacted === "yes" && ans.recruiterName.trim()) {
        contacts.push({ id: uid8(), name: ans.recruiterName.trim(), title:"Recruiter", platform: ans.recruiterPlatform, remindAfter:"1 week", lastContacted: today() });
      }
      const interactions = [];
      if (ans.recruiterNote.trim() && contacts.length > 0) {
        interactions.push({ id: uid8(), contactId: contacts[0].id, contactName: contacts[0].name, date: today(), platform: ans.recruiterPlatform, note: ans.recruiterNote.trim() });
      }
      const onboardingData = {
        recruiterContacted:  ans.recruiterContacted,
        jdRead:              ans.jdRead,
        jdSimplified:        ans.jdSimplified,
        simplifiedText:      ans.simplifiedText,
        resumeRephrased:     ans.resumeRephrased,
        cvRephrased:         ans.cvRephrased,
        checklist:           ans.checklist,
        matchScore,
        matchedKeywords:     matchedKw,
        missingKeywords:     missingKw,
        pickedKeywords:      pickedKw,
        completedAt:         today(),
      };
      await fsAdd(uid, "jobs", {
        ...jForm,
        status: "applied",
        archived: false,
        milestones: { applied: today() },
        contacts,
        interactions,
        onboarding: onboardingData,
      });
      showToast("Application added to Applied ✓");
      onComplete();
    } catch(ex) { showToast("Error: " + ex.message, "err"); }
    finally { setSaving(false); }
  }

  const next = () => setStep(s => Math.min(s+1, STEPS.length-1));
  const back = () => setStep(s => Math.max(s-1, 0));
  const canNext = () => {
    if (step === 0) return jForm.title.trim() && jForm.company.trim();
    return true;
  };

  const currentStep = STEPS[step];

  return (
    <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column"}}>
      <div style={{padding:"26px 32px 20px",display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:12,flexShrink:0,borderBottom:"1px solid var(--border)"}}>
        <div>
          <div style={{fontSize:22,fontWeight:800,letterSpacing:"-.4px"}}>New Application</div>
          <div style={{fontSize:13,color:"var(--t2)",marginTop:4}}>Complete each step to apply with your best foot forward</div>
        </div>
        <button className="btn btn-ghost" onClick={onCancel}>✕ Cancel</button>
      </div>

      <div style={{padding:"28px 32px 40px",maxWidth:760,margin:"0 auto",width:"100%"}}>
        <div>

          {/* Progress bar */}
          <div style={{display:"flex",alignItems:"center",gap:0,marginBottom:36,padding:"0 4px"}}>
            {STEPS.map((s, i) => {
              const isDone   = i < step;
              const isActive = i === step;
              const dotBg    = isDone ? "var(--green)" : isActive ? "var(--blue)" : "var(--s3)";
              const dotBorder= isDone ? "var(--green)" : isActive ? "var(--blue)" : "var(--border2)";
              const dotColor = isDone || isActive ? "#fff" : "var(--t3)";
              const dotShadow= isActive ? "0 0 0 4px var(--blue-bg)" : "none";
              return (
                <div key={s} style={{display:"flex",alignItems:"center",flex: i < STEPS.length-1 ? 1 : "none",minWidth:0}}>
                  <div
                    onClick={() => { if(isDone) setStep(i); }}
                    title={STEP_LABELS[i]}
                    style={{
                      width:32, height:32, borderRadius:"50%",
                      background:dotBg, border:`2px solid ${dotBorder}`,
                      color:dotColor, boxShadow:dotShadow,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:12, fontWeight:700, flexShrink:0,
                      cursor: isDone ? "pointer" : "default",
                      transition:"all .3s", userSelect:"none",
                      listStyle:"none", fontFamily:"var(--sans)",
                    }}>
                    {isDone ? "✓" : i+1}
                  </div>
                  {i < STEPS.length-1 && (
                    <div style={{
                      flex:1, height:2, minWidth:8,
                      background: isDone ? "var(--green)" : "var(--border)",
                      transition:"background .3s",
                    }}/>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── STEP 0: Job Info ── */}
          {currentStep === "job-info" && (
            <div className="ob-card">
              <div className="ob-step-label">Step 1 of {STEPS.length} — Job Details</div>
              <div className="ob-card-title">What are you applying for?</div>
              <div className="ob-card-sub">Fill in the basics. The job description is the most important field — it powers the skill matching and resume prep later.</div>
              <div className="grid2">
                <div className="fg"><label className="fl fl-left">Job Title *</label><input className="fi" placeholder="Software Engineer" value={jForm.title} onChange={e=>setJ("title",e.target.value)} autoFocus /></div>
                <div className="fg"><label className="fl fl-left">Company *</label><input className="fi" placeholder="Acme Corp" value={jForm.company} onChange={e=>setJ("company",e.target.value)} /></div>
              </div>
              <div className="grid3">
                <div className="fg"><label className="fl fl-left">Salary / Pay</label><input className="fi" placeholder="$120k" value={jForm.salary} onChange={e=>setJ("salary",e.target.value)} /></div>
                <div className="fg"><label className="fl fl-left">Work Type</label>
                  <select className="fi" value={jForm.jobType} onChange={e=>setJ("jobType",e.target.value)}>
                    {["Remote","Hybrid","On-site"].map(t=><option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="fg"><label className="fl fl-left">Application URL</label><input className="fi" placeholder="https://…" value={jForm.url} onChange={e=>setJ("url",e.target.value)} /></div>
              </div>
              <div className="fg">
                <label className="fl fl-left">Job Description *</label>
                <textarea className="fi" rows={8} placeholder="Paste the full job description here. This powers skill matching, keyword extraction, and AI prompt generation…" value={jForm.jd} onChange={e=>setJ("jd",e.target.value)} />
              </div>
              {!jForm.jd.trim() && <div style={{fontSize:12,color:"var(--amber2)",marginTop:-8,marginBottom:8}}>⚠ A job description unlocks the best features — try to paste it in.</div>}
            </div>
          )}

          {/* ── STEP 1: Recruiter ── */}
          {currentStep === "recruiter" && (
            <div className="ob-card">
              <div className="ob-step-label">Step 2 of {STEPS.length} — Networking</div>
              <div className="ob-card-title">Did you contact a recruiter or hiring manager?</div>
              <div className="ob-card-sub">Reaching out before applying increases your chances significantly. If you haven't yet, no worries — you can still do it after applying.</div>
              <div className="ob-yn-row">
                {[["yes","✓  Yes, I did","yes"],["no","✗  Not yet","no"],["skip","→  Skip","skip"]].map(([val,lbl,cls])=>(
                  <button key={val} className={`ob-yn-btn ${cls} ${ans.recruiterContacted===val?"sel":""}`} onClick={()=>setA("recruiterContacted",val)}>{lbl}</button>
                ))}
              </div>
              {ans.recruiterContacted === "yes" && (
                <div style={{animation:"sUp .2s ease"}}>
                  <div className="ob-inline-note"><strong>Nice!</strong> Log their details so CareerOS can remind you to follow up at the right time.</div>
                  <div className="grid2">
                    <div className="fg"><label className="fl fl-left">Recruiter Name</label><input className="fi" placeholder="Jane Doe" value={ans.recruiterName} onChange={e=>setA("recruiterName",e.target.value)} /></div>
                    <div className="fg"><label className="fl fl-left">Platform used</label>
                      <select className="fi" value={ans.recruiterPlatform} onChange={e=>setA("recruiterPlatform",e.target.value)}>
                        {["LinkedIn","Email","In-Person","Twitter/X","Mutual Connection","Other"].map(p=><option key={p}>{p}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="fg"><label className="fl fl-left">What did you say / what happened?</label>
                    <textarea className="fi" rows={3} placeholder="e.g. Sent a cold LinkedIn message introducing myself and mentioning the role…" value={ans.recruiterNote} onChange={e=>setA("recruiterNote",e.target.value)} />
                  </div>
                </div>
              )}
              {ans.recruiterContacted === "no" && (
                <div className="ob-inline-note">
                  <strong>Tip:</strong> Find the recruiter or hiring manager on LinkedIn before you submit. A short message like <em>"I just applied for [role] and wanted to introduce myself"</em> can make a real difference.
                </div>
              )}
            </div>
          )}

          {/* ── STEP 2: Read JD ── */}
          {currentStep === "jd-read" && (
            <div className="ob-card">
              <div className="ob-step-label">Step 3 of {STEPS.length} — Job Description</div>
              <div className="ob-card-title">Did you read the full job description carefully?</div>
              <div className="ob-card-sub">Not skimmed — actually read it. Most people miss key requirements buried in the middle or bottom of JDs.</div>
              <div className="ob-yn-row">
                {[["yes","✓  Yes, read it fully","yes"],["no","✗  Only skimmed it","no"]].map(([val,lbl,cls])=>(
                  <button key={val} className={`ob-yn-btn ${cls} ${ans.jdRead===val?"sel":""}`} onClick={()=>setA("jdRead",val)}>{lbl}</button>
                ))}
              </div>
              {jForm.jd ? (
                <div>
                  <div style={{fontSize:12,fontWeight:700,color:"var(--t3)",letterSpacing:".6px",textTransform:"uppercase",marginBottom:8}}>The JD you pasted</div>
                  <pre style={{fontFamily:"var(--sans)",fontSize:12.5,lineHeight:1.7,color:"var(--t2)",whiteSpace:"pre-wrap",background:"var(--s3)",border:"1px solid var(--border)",borderRadius:"var(--r)",padding:14,maxHeight:220,overflow:"auto"}}>{jForm.jd}</pre>
                </div>
              ) : (
                <div className="ob-inline-note">No JD pasted — go back to Step 1 and add it to unlock the best features.</div>
              )}
              {ans.jdRead === "no" && <div className="ob-inline-note" style={{marginTop:12}}><strong>Take 5 minutes now.</strong> Read through the JD above before moving on — it directly affects your resume and skill matching.</div>}
            </div>
          )}

          {/* ── STEP 3: Simplify JD ── */}
          {currentStep === "jd-simplify" && (
            <div className="ob-card">
              <div className="ob-step-label">Step 4 of {STEPS.length} — AI Simplify</div>
              <div className="ob-card-title">Did you use an AI to simplify the JD?</div>
              <div className="ob-card-sub">Pasting a JD into an AI and asking it to extract the core skills and requirements is one of the fastest ways to understand what they actually want.</div>

              {jForm.jd && (
                <div style={{marginBottom:20}}>
                  <div style={{fontSize:12,fontWeight:700,color:"var(--t3)",letterSpacing:".6px",textTransform:"uppercase",marginBottom:8}}>Ready-to-paste AI prompt</div>
                  <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
                    <div className="ob-ai-prompt" style={{flex:1}}>{simplifyPrompt}</div>
                    <CopyBtn text={simplifyPrompt} showToast={showToast} />
                  </div>
                  <div style={{fontSize:12,color:"var(--t3)",marginTop:8}}>Copy ↑ and paste into ChatGPT, Claude, or Gemini</div>
                </div>
              )}

              <div className="ob-yn-row">
                {[["yes","✓  Yes, done","yes"],["no","✗  Not yet","no"]].map(([val,lbl,cls])=>(
                  <button key={val} className={`ob-yn-btn ${cls} ${ans.jdSimplified===val?"sel":""}`} onClick={()=>setA("jdSimplified",val)}>{lbl}</button>
                ))}
              </div>

              {ans.jdSimplified === "yes" && (
                <div style={{animation:"sUp .2s ease"}}>
                  <div className="fg" style={{marginTop:8}}>
                    <label className="fl fl-left">Paste the AI's simplified summary here (optional)</label>
                    <textarea className="fi" rows={5} placeholder="e.g. Core skills: React, Node.js, AWS. Core responsibilities: Build scalable APIs, mentor 2 juniors…" value={ans.simplifiedText} onChange={e=>setA("simplifiedText",e.target.value)} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── STEP 4: Skill Match ── */}
          {currentStep === "skill-match" && (
            <div className="ob-card">
              <div className="ob-step-label">Step 5 of {STEPS.length} — Skill Match</div>
              <div className="ob-card-title">How well do you match this role?</div>
              <div className="ob-card-sub">CareerOS compared keywords in the JD against your Experience Bank entries. This is a rough word-match — use it as a starting point, not a verdict.</div>

              {jdKw.length === 0 ? (
                <div className="ob-inline-note">No JD pasted — go back to Step 1 to unlock skill matching.</div>
              ) : (
                <>
                  <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:24}}>
                    <div className={`ob-score ${scoreClass}`}>{matchScore}%</div>
                    <div>
                      <div style={{fontSize:15,fontWeight:700}}>{matchScore >= 70 ? "Strong match" : matchScore >= 40 ? "Partial match" : "Low match"}</div>
                      <div style={{fontSize:13,color:"var(--t2)",marginTop:3}}>{matchedKw.length} of {jdKw.length} JD keywords found in your Experience Bank</div>
                      {experiences.length === 0 && <div style={{fontSize:12,color:"var(--amber2)",marginTop:4}}>⚠ Add entries to your Experience Bank for a real match score</div>}
                    </div>
                  </div>

                  <div style={{marginBottom:16}}>
                    <div className="sec-title">Matched keywords</div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                      {matchedKw.length === 0 ? <span style={{fontSize:13,color:"var(--t3)"}}>None found — add more to your Experience Bank</span>
                        : matchedKw.map(kw=>(
                          <span key={kw} style={{padding:"3px 9px",borderRadius:20,fontSize:12,fontWeight:600,background:"var(--green-bg)",color:"var(--green2)",border:"1px solid rgba(16,185,129,.3)"}}>✓ {kw}</span>
                        ))
                      }
                    </div>
                  </div>

                  <div style={{marginBottom:16}}>
                    <div className="sec-title">Keywords not in your bank</div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                      {missingKw.length === 0 ? <span style={{fontSize:13,color:"var(--green2)"}}>All keywords covered!</span>
                        : missingKw.slice(0,20).map(kw=>(
                          <span key={kw} style={{padding:"3px 9px",borderRadius:20,fontSize:12,fontWeight:600,background:"var(--s3)",color:"var(--t2)",border:"1px solid var(--border)"}}>○ {kw}</span>
                        ))
                      }
                    </div>
                  </div>

                  <div style={{marginBottom:16}}>
                    <div className="sec-title">Pick keywords to highlight in your resume</div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                      {jdKw.map(kw=>(
                        <span key={kw} className={`kw${pickedKw.includes(kw)?" on":""}`}
                          onClick={()=>setPickedKw(p=>p.includes(kw)?p.filter(k=>k!==kw):[...p,kw])}>
                          {kw}
                        </span>
                      ))}
                    </div>
                    {pickedKw.length > 0 && <div style={{fontSize:12,color:"var(--t2)",marginTop:8}}>{pickedKw.length} selected: {pickedKw.join(", ")}</div>}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── STEP 5: Resume ── */}
          {currentStep === "resume" && (
            <div className="ob-card">
              <div className="ob-step-label">Step 6 of {STEPS.length} — Resume</div>
              <div className="ob-card-title">Did you tailor your resume for this specific role?</div>
              <div className="ob-card-sub">A generic resume rarely wins. Even 10 minutes of tailoring — adjusting your summary and swapping 2-3 bullets — makes a real difference.</div>

              {jForm.jd && (
                <div style={{marginBottom:20}}>
                  <div style={{fontSize:12,fontWeight:700,color:"var(--t3)",letterSpacing:".6px",textTransform:"uppercase",marginBottom:8}}>Resume tailoring AI prompt</div>
                  <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
                    <div className="ob-ai-prompt" style={{flex:1}}>{resumePrompt}</div>
                    <CopyBtn text={resumePrompt} showToast={showToast} />
                  </div>
                  <div style={{fontSize:12,color:"var(--t3)",marginTop:8}}>Copy ↑ → paste into AI → add your current resume bullets → ask it to rewrite</div>
                </div>
              )}

              {experiences.length > 0 && (
                <div style={{marginBottom:20}}>
                  <div style={{fontSize:12,fontWeight:700,color:"var(--t3)",letterSpacing:".6px",textTransform:"uppercase",marginBottom:8}}>Your experience bullets — click to copy</div>
                  {experiences.slice(0,3).map(exp=>(
                    <div key={exp.id} style={{marginBottom:10}}>
                      <div style={{fontSize:12,fontWeight:700,color:"var(--t2)",marginBottom:4}}>{exp.title}{exp.org?` · ${exp.org}`:""}</div>
                      {(exp.bullets||[]).slice(0,3).map((b,i)=>(
                        <div key={i} className="bullet"><div className="bdot"/><div className="btext" style={{fontSize:12}}>{b}</div><CopyBtn text={b} showToast={showToast}/></div>
                      ))}
                    </div>
                  ))}
                </div>
              )}

              <div className="ob-yn-row">
                {[["yes","✓  Resume is tailored","yes"],["no","✗  Using generic resume","no"]].map(([val,lbl,cls])=>(
                  <button key={val} className={`ob-yn-btn ${cls} ${ans.resumeRephrased===val?"sel":""}`} onClick={()=>setA("resumeRephrased",val)}>{lbl}</button>
                ))}
              </div>
              {ans.resumeRephrased === "no" && <div className="ob-inline-note"><strong>Before you submit:</strong> Use the prompt above to get a tailored version in under 5 minutes. It's worth it.</div>}
            </div>
          )}

          {/* ── STEP 6: Cover Letter / CV ── */}
          {currentStep === "cv" && (
            <div className="ob-card">
              <div className="ob-step-label">Step 7 of {STEPS.length} — Cover Letter</div>
              <div className="ob-card-title">Did you write a tailored cover letter?</div>
              <div className="ob-card-sub">A targeted cover letter (3 short paragraphs, not a novel) still matters for most roles. Skip if the application doesn't ask for one.</div>

              {jForm.jd && (
                <div style={{marginBottom:20}}>
                  <div style={{fontSize:12,fontWeight:700,color:"var(--t3)",letterSpacing:".6px",textTransform:"uppercase",marginBottom:8}}>Cover letter AI prompt</div>
                  <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
                    <div className="ob-ai-prompt" style={{flex:1}}>{cvPrompt}</div>
                    <CopyBtn text={cvPrompt} showToast={showToast} />
                  </div>
                  <div style={{fontSize:12,color:"var(--t3)",marginTop:8}}>Copy ↑ → paste into AI → add 1-2 of your best achievements → generate</div>
                </div>
              )}

              <div className="ob-yn-row">
                {[["yes","✓  Cover letter written","yes"],["no","✗  Not required / skipped","no"]].map(([val,lbl,cls])=>(
                  <button key={val} className={`ob-yn-btn ${cls} ${ans.cvRephrased===val?"sel":""}`} onClick={()=>setA("cvRephrased",val)}>{lbl}</button>
                ))}
              </div>
            </div>
          )}

          {/* ── STEP 7: Final Checklist ── */}
          {currentStep === "checklist" && (
            <div className="ob-card">
              <div className="ob-step-label">Step 8 of {STEPS.length} — Final Checks</div>
              <div className="ob-card-title">Final quality checklist</div>
              <div className="ob-card-sub">Check everything you've completed. Be honest — these are the small things that separate good applications from great ones.</div>
              <div className="ob-checklist">
                {CHECKLIST.map(item=>{
                  const checked = !!ans.checklist[item.key];
                  return (
                    <div key={item.key} className={`ob-check-item${checked?" checked":""}`} onClick={()=>toggleCheck(item.key)}>
                      <div className="ob-check-box">{checked && "✓"}</div>
                      <div className="ob-check-text">
                        <div className="ob-check-title">{item.title}</div>
                        <div className="ob-check-desc">{item.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{fontSize:13,color:"var(--t2)",textAlign:"center"}}>
                {Object.values(ans.checklist).filter(Boolean).length} / {CHECKLIST.length} completed
              </div>
            </div>
          )}

          {/* ── STEP 8: Summary / Complete ── */}
          {currentStep === "summary" && (
            <div className="ob-card">
              <div className="ob-step-label">Step 9 of {STEPS.length} — Ready to Apply</div>
              <div className="ob-card-title">Application Summary</div>
              <div className="ob-card-sub">Here's everything you've done to prepare. Once you submit this, the job will appear in your Applied column.</div>

              <div className="ob-summary" style={{marginBottom:20}}>
                <div style={{fontWeight:700,fontSize:14,marginBottom:10}}>{jForm.title} — {jForm.company}</div>
                {[
                  { ico: ans.recruiterContacted==="yes"?"✅":"⬜", label:"Contacted recruiter", done: ans.recruiterContacted==="yes" },
                  { ico: ans.jdRead==="yes"?"✅":"⬜",             label:"Read job description", done: ans.jdRead==="yes" },
                  { ico: ans.jdSimplified==="yes"?"✅":"⬜",        label:"Simplified JD with AI", done: ans.jdSimplified==="yes" },
                  { ico: jdKw.length>0?"✅":"⬜",                   label:`Skill match: ${matchScore}% (${matchedKw.length}/${jdKw.length} keywords)`, done: jdKw.length>0 },
                  { ico: ans.resumeRephrased==="yes"?"✅":"⬜",      label:"Tailored resume", done: ans.resumeRephrased==="yes" },
                  { ico: ans.cvRephrased==="yes"?"✅":"⬜",          label:"Cover letter written", done: ans.cvRephrased==="yes" },
                  { ico:"📋",                                        label:`Final checklist: ${Object.values(ans.checklist).filter(Boolean).length}/${CHECKLIST.length} items`, done:true },
                ].map((r,i) => (
                  <div key={i} className="ob-summary-row">
                    <span className="ob-summary-ico">{r.ico}</span>
                    <span style={{color:r.done?"var(--text)":"var(--t3)"}}>{r.label}</span>
                  </div>
                ))}
              </div>

              {Object.values(ans.checklist).filter(Boolean).length < CHECKLIST.length && (
                <div className="ob-inline-note" style={{marginBottom:16}}>
                  <strong>Heads up:</strong> You have {CHECKLIST.length - Object.values(ans.checklist).filter(Boolean).length} unchecked items. Go back if you want to complete them — or submit anyway.
                </div>
              )}

              <div style={{fontSize:13,color:"var(--t2)",marginBottom:20,textAlign:"center"}}>
                Clicking "Submit Application" will add this to your <strong>Applied</strong> column and save all your onboarding data.
              </div>
            </div>
          )}

          {/* Navigation */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:16,paddingTop:16,borderTop:"1px solid var(--border)"}}>
      <button className="btn" onClick={back} disabled={step===0}>← Back</button>
      
      <div style={{fontSize:12,color:"var(--t3)",fontFamily:"var(--mono)"}}>
        {step+1} / {STEPS.length}
      </div>

      {currentStep === "summary" ? (
        <button className="btn btn-primary" onClick={finishOnboarding} disabled={saving || !jForm.title.trim() || !jForm.company.trim()}>
          {saving ? "Saving…" : "✓ Submit Application →"}
        </button>
      ) : (
        <button className="btn btn-primary" onClick={next} disabled={!canNext()}>
          {step === 0 && (!jForm.title.trim() || !jForm.company.trim()) ? "Enter title & company" : "Next →"}
        </button>
      )}
    </div>
        </div>
        </div>
      </div>
  );
}

/* ─── ARCHIVE ────────────────────────────────────────────────────────── */
function Archive({ uid, jobs, showToast }) {
  const archived = jobs.filter(j => j.archived || j.status === "declined");
  async function restore(j) { await fsUpd(uid,"jobs",j.id,{archived:false,status:"applied"}); showToast("Restored"); }
  async function permDel(id) { await fsDel(uid,"jobs",id); showToast("Permanently deleted"); }
  return (
    <div className="page-scroll">
      <div className="ph">
        <div className="ph-title">Archive</div>
        <div className="ph-sub">{archived.length} closed or declined application{archived.length!==1?"s":""}</div>
      </div>
      <div className="page-body">
        {archived.length === 0 && <div className="empty"><div className="empty-ico">🗂</div><p>Archive is empty — pipeline is clean.</p></div>}
        {archived.map(j => (
          <div key={j.id} style={{background:"var(--s2)",border:"1px solid var(--border)",borderRadius:"var(--r)",padding:"13px 16px",marginBottom:8,display:"flex",alignItems:"center",gap:12}}>
            <div style={{flex:1}}>
              <div style={{fontWeight:700,fontSize:14}}>{j.title}</div>
              <div style={{fontSize:12,color:"var(--t2)"}}>{j.company}</div>
            </div>
            <button className="btn btn-sm" onClick={() => restore(j)}>Restore</button>
            <button className="btn-icon" style={{color:"var(--t3)"}} onClick={() => permDel(j.id)} title="Delete permanently">🗑</button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── ROOT APP ───────────────────────────────────────────────────────── */
export default function App() {
  const [user,  setUser]  = useState(undefined);
  const [page,  setPage]  = useState("dashboard");
  const [toast, setToast] = useState(null);

  useEffect(() => { return onAuthStateChanged(auth, u => setUser(u)); }, []);

  const uid         = user?.uid || null;
  const jobs        = useCol(uid, "jobs");
  const experiences = useCol(uid, "experiences");

  const showToast = (msg, type="ok") => setToast({ msg, type });

  const remindTotal = jobs.reduce((n, j) =>
    n + (j.contacts||[]).filter(c => remindStatus(c)==="due").length, 0);

  const ini = user?.displayName
    ? initials(user.displayName)
    : (user?.email?.[0]||"?").toUpperCase();

  if (user === undefined) return <><style>{STYLES}</style><div className="loading"><div className="spinner"/></div></>;
  if (!user)             return <><style>{STYLES}</style><AuthPage showToast={showToast}/>{toast && <Toast {...toast} onClose={() => setToast(null)}/>}</>;

  const NAV = [
    { key:"dashboard",  label:"Dashboard",          ico:"⊞" },
    { key:"tracker",    label:"Application Tracker", ico:"📋" },
    { key:"experience", label:"Experience Bank",     ico:"⚡" },
    { key:"analytics",  label:"Analytics",           ico:"◎" },
    { key:"profile",    label:"Master Profile",      ico:"👤" },
    { key:"archive",    label:"Archive",             ico:"🗂" },
  ];
  // Onboarding launched from AppTracker inline — no separate nav needed

  return (
    <>
      <style>{STYLES}</style>
      <div className="shell">
        <aside className="sidebar">
          <div className="logo">
            <div className="logo-mark">C</div>
            <div className="logo-text">CareerOS</div>
          </div>
          <div className="nav-sec">Workspace</div>
          {NAV.map(n => (
            <button key={n.key} className={`nav-btn${page===n.key?" on":""}`} onClick={() => setPage(n.key)}>
              <span className="nav-ico">{n.ico}</span>
              {n.label}
              {n.key === "dashboard" && remindTotal > 0 && <span className="nav-badge">{remindTotal}</span>}
            </button>
          ))}
          <div className="user-row">
            <div className="ava">{ini}</div>
            <div className="user-name">{user.displayName || user.email}</div>
            <button className="signout" onClick={() => signOut(auth)} title="Sign out">⎋</button>
          </div>
        </aside>

        <main className="main">
          {page === "dashboard"  && <Dashboard   uid={uid} jobs={jobs} experiences={experiences} showToast={showToast} />}
          {page === "tracker"    && <AppTracker  uid={uid} jobs={jobs} experiences={experiences} showToast={showToast} />}
          {page === "experience" && <ExpBank     uid={uid} experiences={experiences} showToast={showToast} />}
          {page === "analytics"  && <Analytics   jobs={jobs} />}
          {page === "profile"    && <MasterProfile uid={uid} showToast={showToast} />}
          {page === "archive"    && <Archive     uid={uid} jobs={jobs} showToast={showToast} />}
        </main>
      </div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </>
  );
}