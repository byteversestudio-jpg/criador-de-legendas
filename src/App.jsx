import { useState, useRef, useCallback, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase/config";
import Login from "./components/Login";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

// ─── Estilos CSS ─────────────────────────────────────────────────────────────
const STYLE = `
@keyframes scalePop{0%{transform:scale(1)}40%{transform:scale(0.88)}100%{transform:scale(1)}}
@keyframes float0{0%,100%{transform:translateY(0px) rotate(0deg)}50%{transform:translateY(-8px) rotate(3deg)}}
@keyframes float1{0%,100%{transform:translateY(0px)}50%{transform:translateY(-6px) rotate(-2deg)}}
@keyframes float2{0%,100%{transform:translateY(0px)}50%{transform:translateY(-10px) rotate(2deg)}}
@keyframes float3{0%,100%{transform:translateY(0px)}50%{transform:translateY(-5px) rotate(-3deg)}}
@keyframes float4{0%,100%{transform:translateY(0px)}50%{transform:translateY(-9px) rotate(1deg)}}
@keyframes float5{0%,100%{transform:translateY(0px)}50%{transform:translateY(-7px) rotate(-1deg)}}
@keyframes float6{0%,100%{transform:translateY(0px)}50%{transform:translateY(-11px) rotate(2deg)}}
@keyframes float7{0%,100%{transform:translateY(0px)}50%{transform:translateY(-4px) rotate(-2deg)}}
@keyframes float8{0%,100%{transform:translateY(0px)}50%{transform:translateY(-8px) rotate(3deg)}}
@keyframes float9{0%,100%{transform:translateY(0px)}50%{transform:translateY(-6px) rotate(-1deg)}}
@keyframes float10{0%,100%{transform:translateY(0px)}50%{transform:translateY(-9px)}}
@keyframes float11{0%,100%{transform:translateY(0px)}50%{transform:translateY(-5px)}}
@keyframes float12{0%,100%{transform:translateY(0px)}50%{transform:translateY(-7px)}}
@keyframes float13{0%,100%{transform:translateY(0px)}50%{transform:translateY(-6px)}}
@keyframes float14{0%,100%{transform:translateY(0px)}50%{transform:translateY(-8px)}}
@keyframes logoGlow{0%,100%{filter:drop-shadow(0 0 8px rgba(99,102,241,0.6))}50%{filter:drop-shadow(0 0 18px rgba(99,102,241,0.9))}}
@keyframes logoPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}
.chip-btn:active{animation:scalePop 0.25s ease forwards}
.img-thumb:hover .img-overlay{opacity:1!important}
`;

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const ICONS={
  pencil:<svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  camera:<svg viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  imageText:<svg viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/><line x1="16" y1="3" x2="16" y2="7"/><line x1="14" y1="5" x2="18" y2="5"/></svg>,
  laugh:<svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M8 13s1.5 3 4 3 4-3 4-3"/><line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="3"/><line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="3"/></svg>,
  star:<svg viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
  heart:<svg viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  briefcase:<svg viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>,
  pray:<svg viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round"><path d="M18 11V8a6 6 0 0 0-12 0v3"/><path d="M6 11c0 3.31 2.69 6 6 6s6-2.69 6-6"/><path d="M12 17v4"/><path d="M8 21h8"/></svg>,
  church:<svg viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round"><path d="M12 2v4M10 4h4"/><path d="M5 10h14l2 11H3L5 10z"/><rect x="9" y="14" width="6" height="7"/></svg>,
  feather:<svg viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round"><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/><line x1="16" y1="8" x2="2" y2="22"/><line x1="17" y1="15" x2="9" y2="15"/></svg>,
  teddy:<svg viewBox="0 0 24 24" fill="none" stroke="#f472b6" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="13" r="6"/><circle cx="6" cy="7" r="3"/><circle cx="18" cy="7" r="3"/><circle cx="10" cy="12" r="1" fill="#f472b6"/><circle cx="14" cy="12" r="1" fill="#f472b6"/><path d="M9 16c1 1 5 1 6 0"/></svg>,
  cross:<svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="2" x2="12" y2="22"/><line x1="5" y1="8" x2="19" y2="8"/></svg>,
  chef:<svg viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round"><path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6z"/><line x1="6" y1="17" x2="18" y2="17"/></svg>,
  smirk:<svg viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M8 15s2-1 4-1 4 1 4 1"/><line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="3"/><line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="3"/></svg>,
  dumbbell:<svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round"><line x1="6" y1="5" x2="6" y2="19"/><line x1="18" y1="5" x2="18" y2="19"/><line x1="6" y1="12" x2="18" y2="12"/><rect x="2" y="8" width="4" height="8" rx="1"/><rect x="18" y="8" width="4" height="8" rx="1"/></svg>,
  clock:<svg viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  music:<svg viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>,
  eye:<svg viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  book:<svg viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  minimize:<svg viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="12" x2="16" y2="12"/></svg>,
  story:<svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>,
  instagram:<svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round"><defs><linearGradient id="ig2" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stopColor="#f09433"/><stop offset="50%" stopColor="#dc2743"/><stop offset="100%" stopColor="#bc1888"/></linearGradient></defs><rect x="2" y="2" width="20" height="20" rx="5" stroke="url(#ig2)"/><circle cx="12" cy="12" r="5" stroke="url(#ig2)"/><circle cx="17.5" cy="6.5" r="1" fill="#dc2743" stroke="none"/></svg>,
  twitter:<svg viewBox="0 0 24 24" fill="#000"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
  linkedin:<svg viewBox="0 0 24 24" fill="#0077b5"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>,
  tiktok:<svg viewBox="0 0 24 24" fill="#000"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/></svg>,
  youtube:<svg viewBox="0 0 24 24" fill="#ff0000"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>,
  short:<svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="12" y2="12"/></svg>,
  medium:<svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="14" y2="15"/></svg>,
  large:<svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="14" y2="18"/></svg>,
  custom:<svg viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>,
  unlock:<svg viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>,
  family:<svg viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round"><circle cx="9" cy="7" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M2 21v-2a6 6 0 0 1 12 0v2"/><path d="M17 21v-2a4 4 0 0 0-2-.85"/></svg>,
  child:<svg viewBox="0 0 24 24" fill="none" stroke="#f472b6" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M8 21v-1a4 4 0 0 1 8 0v1"/><path d="M6 21h12"/></svg>,
  teen:<svg viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M6 21v-1a6 6 0 0 1 12 0v1"/></svg>,
  adult:<svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a8 8 0 0 1 16 0v1"/><line x1="12" y1="14" x2="12" y2="18"/></svg>,
  copy:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  check:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>,
  check2:<svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>,
  refresh:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>,
  upload:<svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  wand:<svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M15 4V2m0 14v-2M8 9H2m14 0h-2M4.22 4.22l1.42 1.42m8.28 8.28 1.42 1.42M4.22 19.78l1.42-1.42M18.36 5.64l-1.42 1.42"/><path d="m3 21 9-9"/><path d="M12.5 8.5l3 3"/></svg>,
  grammar:<svg viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round"><path d="M12 20h9"/><path d="M4 6h16M4 12h10"/><circle cx="6" cy="18" r="2"/></svg>,
  hash:<svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>,
  at:<svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"/></svg>,
  globe:<svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  sparkle:<svg viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>,
  chatbubble:<svg viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  tag:<svg viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
  zap:<svg viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  plus:<svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  images:<svg viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round"><rect x="2" y="6" width="16" height="13" rx="2"/><path d="M22 4H8"/><path d="M6 2h12a2 2 0 0 1 2 2v12"/><circle cx="8" cy="11" r="1.5"/><path d="M18 19l-4-4-3 3-2-2-3 3"/></svg>,
  history:<svg viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round"><path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/><path d="M12 7v5l4 2"/></svg>,
  logout:<svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  user:<svg viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
};

const Icon=({name,size=16})=>(
  <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:size,height:size,flexShrink:0}}>
    {ICONS[name]||null}
  </span>
);

// ─── Dados ────────────────────────────────────────────────────────────────────
const BANNER_ITEMS=[
  {icon:"instagram",x:"3%",y:"10%",s:32,a:"float0",d:"0s"},
  {icon:"tiktok",x:"10%",y:"62%",s:28,a:"float1",d:"0.4s"},
  {icon:"youtube",x:"81%",y:"8%",s:32,a:"float2",d:"0.8s"},
  {icon:"linkedin",x:"87%",y:"58%",s:28,a:"float3",d:"0.2s"},
  {icon:"twitter",x:"74%",y:"76%",s:24,a:"float4",d:"1s"},
  {icon:"pencil",x:"18%",y:"74%",s:26,a:"float5",d:"0.6s"},
  {icon:"feather",x:"61%",y:"72%",s:24,a:"float6",d:"1.2s"},
  {icon:"chatbubble",x:"2%",y:"42%",s:26,a:"float8",d:"0.7s"},
  {icon:"hash",x:"78%",y:"34%",s:22,a:"float9",d:"1.4s"},
  {icon:"sparkle",x:"86%",y:"44%",s:20,a:"float10",d:"0.9s"},
  {icon:"at",x:"14%",y:"30%",s:20,a:"float11",d:"0.5s"},
  {icon:"globe",x:"4%",y:"76%",s:22,a:"float12",d:"1.1s"},
  {icon:"zap",x:"66%",y:"10%",s:18,a:"float13",d:"0.2s"},
  {icon:"tag",x:"75%",y:"60%",s:20,a:"float14",d:"1.3s"},
];

const HASHTAG_PILLS=[
  {txt:"#legenda",left:"8%",top:"6%",bg:"#3b82f6",a:"float2",shadow:"rgba(59,130,246,0.5)"},
  {txt:"#caption",left:"72%",top:"28%",bg:"#8b5cf6",a:"float4",shadow:"rgba(139,92,246,0.5)"},
  {txt:"#post",left:"5%",top:"54%",bg:"#10b981",a:"float6",shadow:"rgba(16,185,129,0.5)"},
  {txt:"#viral",left:"68%",top:"74%",bg:"#f59e0b",a:"float8",shadow:"rgba(245,158,11,0.5)"},
  {txt:"#IA",left:"28%",top:"82%",bg:"#6366f1",a:"float0",shadow:"rgba(99,102,241,0.5)"},
  {txt:"#conteúdo",left:"50%",top:"6%",bg:"#ec4899",a:"float3",shadow:"rgba(236,72,153,0.5)"},
];

const ESTILOS=[
  {value:"engracado",label:"Engraçado",icon:"laugh",religioso:false,instrucao:"Use humor leve, piadas e emojis divertidos."},
  {value:"inspiracional",label:"Inspiracional",icon:"star",religioso:false,instrucao:"Use frases motivacionais, de superação e esperança."},
  {value:"romantico",label:"Romântico",icon:"heart",religioso:false,instrucao:"Use linguagem afetiva, poética e apaixonada."},
  {value:"profissional",label:"Profissional",icon:"briefcase",religioso:false,instrucao:"Use linguagem corporativa, formal e objetiva."},
  {value:"religioso",label:"Religioso",icon:"pray",religioso:true,instrucao:"Cite passagens bíblicas no formato litúrgico: Jo 3, 16 — Sl 22(23), 1 — Rm 8, 28."},
  {value:"liturgico",label:"Litúrgico",icon:"church",religioso:true,instrucao:"Linguagem litúrgica católica. Citações: Jo 16, 1-10 — Sl 94(95), 1."},
  {value:"solene",label:"Solene",icon:"feather",religioso:true,instrucao:"Linguagem formal, digna e séria. Citações: Ecl 3, 1-8 — Is 40, 31 — Ap 21, 1-5."},
  {value:"infantil",label:"Infantil",icon:"teddy",religioso:false,instrucao:"Linguagem simples, alegre e acessível para crianças."},
  {value:"infantil_religioso",label:"Infantil Religioso",icon:"cross",religioso:true,instrucao:"Linguagem infantil com base na Bíblia. Citações: Jo 3, 16 — Mt 19, 14."},
  {value:"culinaria",label:"Culinária",icon:"chef",religioso:false,instrucao:"Linguagem apetitosa e sensorial. Aromas, texturas, sabores."},
  {value:"sarcastico",label:"Sarcástico / Irônico",icon:"smirk",religioso:false,instrucao:"Use ironia inteligente e sarcasmo leve."},
  {value:"fitness",label:"Motivacional Fitness",icon:"dumbbell",religioso:false,instrucao:"Frases de impacto, energia alta, incentive movimento e disciplina."},
  {value:"nostalgico",label:"Nostálgico",icon:"clock",religioso:false,instrucao:"Use linguagem que evoca memórias afetivas e saudade."},
  {value:"poetico",label:"Poético / Lírico",icon:"music",religioso:false,instrucao:"Use linguagem poética rica em metáforas e lirismo."},
  {value:"misterioso",label:"Misterioso",icon:"eye",religioso:false,instrucao:"Linguagem enigmática que instiga curiosidade."},
  {value:"educativo",label:"Educativo",icon:"book",religioso:false,instrucao:"Linguagem clara, didática e informativa."},
  {value:"minimalista",label:"Minimalista",icon:"minimize",religioso:false,instrucao:"Mínimo de palavras para o máximo de impacto."},
  {value:"storytelling",label:"Storytelling",icon:"story",religioso:false,instrucao:"Conte uma história curta e envolvente com início, meio e fim."},
];

const REDES=[
  {value:"instagram",label:"Instagram",icon:"instagram",youtube:false},
  {value:"twitter",label:"Twitter / X",icon:"twitter",youtube:false},
  {value:"linkedin",label:"LinkedIn",icon:"linkedin",youtube:false},
  {value:"tiktok",label:"TikTok",icon:"tiktok",youtube:false},
  {value:"youtube_video",label:"YT Vídeo",icon:"youtube",youtube:true},
  {value:"youtube_shorts",label:"YT Shorts",icon:"youtube",youtube:true},
  {value:"youtube_live",label:"YT Transmissão",icon:"youtube",youtube:true},
];

const TAMANHOS=[
  {value:"curta",label:"Curta",icon:"short",desc:"até 100"},
  {value:"media",label:"Média",icon:"medium",desc:"100–300"},
  {value:"grande",label:"Grande",icon:"large",desc:"300–600"},
  {value:"caracteres",label:"Personalizado",icon:"custom",desc:"definir nº"},
];

const CLASSIFICACOES=[
  {value:"livre",label:"Livre",icon:"unlock",instrucao:"Sem restrição de público."},
  {value:"geral",label:"Geral",icon:"family",instrucao:"Adequado para todos os públicos."},
  {value:"infantil",label:"Infantil",icon:"child",instrucao:"100% para crianças. Sem referências adultas."},
  {value:"jovem",label:"Jovem",icon:"teen",instrucao:"Para adolescentes. Moderno, sem conteúdo adulto."},
  {value:"adulto",label:"Adulto",icon:"adult",instrucao:"Para adultos. Sofisticado e direto."},
];

const MODOS=[
  {value:"texto",label:"Descrição",icon:"pencil"},
  {value:"foto",label:"Foto(s)",icon:"camera"},
  {value:"ambos",label:"Foto(s) + Desc",icon:"imageText"},
];

const isYT=v=>v&&v.startsWith("youtube");
const hasYT=arr=>arr.some(v=>isYT(v));

// ─── Componentes auxiliares ───────────────────────────────────────────────────
const Chip=({label,icon,active,onClick,color="#1e40af"})=>(
  <button className="chip-btn" onClick={onClick} style={{
    display:"inline-flex",alignItems:"center",gap:6,padding:"7px 13px",borderRadius:8,cursor:"pointer",
    border:`1.5px solid ${active?color:"#e2e8f0"}`,
    background:active?color:"#fff",color:active?"#fff":"#64748b",
    fontWeight:500,fontSize:13,transition:"background 0.15s,border 0.15s",whiteSpace:"nowrap",outline:"none",
  }}>
    {icon&&<Icon name={icon} size={15}/>}
    {label}
    {active&&<span style={{marginLeft:3,opacity:0.75,fontSize:10}}>✕</span>}
  </button>
);

const Section=({label,hint,children})=>(
  <div style={{marginBottom:22}}>
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
      <p style={{margin:0,fontWeight:600,fontSize:11,color:"#94a3b8",textTransform:"uppercase",letterSpacing:"0.07em"}}>{label}</p>
      {hint&&<span style={{fontSize:10,color:"#94a3b8",background:"#f1f5f9",borderRadius:6,padding:"2px 7px",fontWeight:500}}>{hint}</span>}
    </div>
    {children}
  </div>
);

const InfoBox=({color="#1e40af",bg="#eff6ff",border="#bfdbfe",children})=>(
  <div style={{marginTop:10,padding:"9px 13px",background:bg,borderRadius:8,fontSize:12,color,borderLeft:`3px solid ${border}`,lineHeight:1.5}}>{children}</div>
);

// ─── Banner ───────────────────────────────────────────────────────────────────
const Banner=({user,usos,limite,onLogout,onHistorico})=>(
  <div style={{position:"relative",width:"100%",height:300,background:"linear-gradient(135deg,#060d1f 0%,#0f1f3d 40%,#1a1040 70%,#060d1f 100%)",borderRadius:"16px 16px 0 0",overflow:"hidden"}}>
    <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",opacity:0.4}} preserveAspectRatio="none">
      {[0,1,2,3,4,5,6,7,8].map(i=><line key={"v"+i} x1={`${i*12.5}%`} y1="0" x2={`${i*12.5}%`} y2="100%" stroke="#6366f1" strokeWidth="0.5" strokeDasharray="3 8"/>)}
      {[0,1,2,3,4,5,6].map(i=><line key={"h"+i} x1="0" y1={`${i*16.6}%`} x2="100%" y2={`${i*16.6}%`} stroke="#6366f1" strokeWidth="0.5" strokeDasharray="3 8"/>)}
    </svg>
    <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:360,height:360,background:"radial-gradient(circle,rgba(99,102,241,0.18) 0%,rgba(99,102,241,0.06) 50%,transparent 75%)",borderRadius:"50%",pointerEvents:"none"}}/>
    {BANNER_ITEMS.map((it,i)=>(
      <div key={i} style={{position:"absolute",left:it.x,top:it.y,width:it.s,height:it.s,animation:`${it.a} ${2.6+i*0.18}s ease-in-out ${it.d} infinite`,filter:"drop-shadow(0 2px 10px rgba(0,0,0,0.6))",opacity:0.88}}>
        <Icon name={it.icon} size={it.s}/>
      </div>
    ))}
    {HASHTAG_PILLS.map((b,i)=>(
      <div key={i} style={{position:"absolute",left:b.left,top:b.top,animation:`${b.a} ${3+i*0.3}s ease-in-out infinite`,padding:"4px 10px",borderRadius:20,background:b.bg,boxShadow:`0 4px 14px ${b.shadow}`,fontSize:11,fontWeight:700,color:"#fff",letterSpacing:"0.04em",pointerEvents:"none",whiteSpace:"nowrap"}}>{b.txt}</div>
    ))}
    {/* Conteúdo central */}
    <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:10}}>
      <svg width="72" height="72" viewBox="0 0 90 90" fill="none" style={{animation:"logoGlow 3s ease-in-out infinite,logoPulse 3s ease-in-out infinite"}}>
        <defs>
          <linearGradient id="logoBg" x1="0" y1="0" x2="90" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#4f46e5"/><stop offset="50%" stopColor="#6366f1"/><stop offset="100%" stopColor="#818cf8"/>
          </linearGradient>
          <linearGradient id="logoShine" x1="0" y1="0" x2="90" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="rgba(255,255,255,0.25)"/><stop offset="100%" stopColor="rgba(255,255,255,0)"/>
          </linearGradient>
          <linearGradient id="wand1" x1="20" y1="20" x2="55" y2="55" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fff"/><stop offset="100%" stopColor="#c7d2fe"/>
          </linearGradient>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#4f46e5" floodOpacity="0.5"/>
          </filter>
        </defs>
        <circle cx="45" cy="45" r="38" fill="url(#logoBg)" filter="url(#shadow)"/>
        <circle cx="45" cy="45" r="38" fill="url(#logoShine)"/>
        <rect x="18" y="22" width="44" height="30" rx="8" fill="white" opacity="0.95"/>
        <polygon points="26,52 20,62 34,52" fill="white" opacity="0.95"/>
        <rect x="24" y="30" width="28" height="3.5" rx="1.75" fill="#6366f1" opacity="0.9"/>
        <rect x="24" y="37" width="22" height="3" rx="1.5" fill="#a5b4fc" opacity="0.8"/>
        <rect x="24" y="43" width="16" height="3" rx="1.5" fill="#c7d2fe" opacity="0.7"/>
        <line x1="52" y1="56" x2="68" y2="40" stroke="url(#wand1)" strokeWidth="3.5" strokeLinecap="round"/>
        <circle cx="69" cy="39" r="3.5" fill="#fbbf24"/>
      </svg>
      <div style={{textAlign:"center"}}>
        <h1 style={{margin:0,fontSize:22,fontWeight:800,color:"#fff",textShadow:"0 2px 12px rgba(0,0,0,0.4)"}}>Criador de Legendas IA</h1>
        <p style={{margin:"4px 0 0",fontSize:13,color:"#a5b4fc"}}>Gere legendas perfeitas para todas as redes</p>
      </div>
      {/* Barra de uso */}
      {usos !== null && (
        <div style={{background:"rgba(255,255,255,0.1)",borderRadius:20,padding:"4px 14px",fontSize:11,color:"#e0e7ff",backdropFilter:"blur(6px)",border:"1px solid rgba(255,255,255,0.15)"}}>
          ⚡ {usos}/{limite} legendas hoje
        </div>
      )}
    </div>
    {/* Controles do usuário */}
    <div style={{position:"absolute",top:12,right:12,display:"flex",gap:8}}>
      <button onClick={onHistorico} title="Histórico" style={{background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:8,padding:"6px 10px",cursor:"pointer",color:"#fff",display:"flex",alignItems:"center",gap:5,fontSize:12,fontWeight:600,backdropFilter:"blur(4px)"}}>
        <Icon name="history" size={14}/>Histórico
      </button>
      <button onClick={onLogout} title="Sair" style={{background:"rgba(239,68,68,0.15)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:8,padding:"6px 10px",cursor:"pointer",color:"#fca5a5",display:"flex",alignItems:"center",gap:5,fontSize:12,fontWeight:600,backdropFilter:"blur(4px)"}}>
        <Icon name="logout" size={14}/>Sair
      </button>
    </div>
    {/* Avatar usuário */}
    <div style={{position:"absolute",top:12,left:12,display:"flex",alignItems:"center",gap:8,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:10,padding:"5px 10px",backdropFilter:"blur(4px)"}}>
      {user?.photoURL
        ? <img src={user.photoURL} alt="avatar" style={{width:22,height:22,borderRadius:"50%",objectFit:"cover"}}/>
        : <Icon name="user" size={18}/>
      }
      <span style={{fontSize:11,color:"#e0e7ff",fontWeight:600,maxWidth:120,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
        {user?.displayName || user?.email?.split("@")[0] || "Usuário"}
      </span>
    </div>
  </div>
);

// ─── Modal Histórico ──────────────────────────────────────────────────────────
const ModalHistorico=({historico,onClose,onUsar})=>(
  <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
    <div style={{background:"#fff",borderRadius:16,maxWidth:560,width:"100%",maxHeight:"80vh",overflow:"hidden",display:"flex",flexDirection:"column",boxShadow:"0 8px 48px rgba(0,0,0,0.5)"}}>
      <div style={{padding:"20px 24px",borderBottom:"1px solid #f1f5f9",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <h2 style={{margin:0,fontSize:17,fontWeight:800,color:"#0f172a",display:"flex",alignItems:"center",gap:8}}>
          <Icon name="history" size={18}/>Histórico de Legendas
        </h2>
        <button onClick={onClose} style={{background:"#f1f5f9",border:"none",borderRadius:8,padding:"6px 12px",cursor:"pointer",fontWeight:700,color:"#64748b"}}>✕</button>
      </div>
      <div style={{overflowY:"auto",padding:20,flex:1}}>
        {!historico.length && <p style={{color:"#94a3b8",textAlign:"center",marginTop:32}}>Nenhuma legenda gerada ainda.</p>}
        {historico.map((h,i)=>(
          <div key={h.id||i} style={{border:"1px solid #e2e8f0",borderRadius:12,padding:16,marginBottom:12}}>
            <p style={{margin:"0 0 8px",fontSize:11,color:"#94a3b8"}}>{h.criadoEm?.toDate?.()?.toLocaleString("pt-BR")||"Recente"}</p>
            <p style={{margin:"0 0 10px",fontSize:13,color:"#0f172a",lineHeight:1.5,fontStyle:"italic"}}>"{h.legendas?.[0]?.texto?.substring(0,120)}..."</p>
            <button onClick={()=>onUsar(h.legendas)} style={{background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:8,padding:"5px 12px",cursor:"pointer",fontSize:12,fontWeight:600,color:"#1e40af"}}>
              Usar estas legendas
            </button>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ─── App Principal ─────────────────────────────────────────────────────────────
export default function AppWrapper() {
  const [user, setUser] = useState(undefined); // undefined = carregando

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => setUser(u || null));
  }, []);

  if (user === undefined) {
    return (
      <div style={{minHeight:"100vh",background:"#0f172a",display:"flex",alignItems:"center",justifyContent:"center"}}>
        <div style={{color:"#6366f1",fontSize:16,fontWeight:600}}>Carregando...</div>
      </div>
    );
  }

  if (!user) return <Login />;
  return <App user={user} />;
}

function App({ user }) {
  const [modo, setModo] = useState("texto");
  const [descricao, setDescricao] = useState("");
  const [imagens, setImagens] = useState([]);
  const [estilos, setEstilos] = useState([]);
  const [redes, setRedes] = useState([]);
  const [classes, setClasses] = useState([]);
  const [usarCIC, setUsarCIC] = useState(null);
  const [citCIC, setCitCIC] = useState("");
  const [tamanho, setTamanho] = useState("");
  const [nChars, setNChars] = useState("");
  const [legendas, setLegendas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copiado, setCopiado] = useState(null);
  const [erro, setErro] = useState("");
  const [grammarIdx, setGrammarIdx] = useState(null);
  const [grammarResult, setGrammarResult] = useState({});
  const [grammarLoading, setGrammarLoading] = useState(false);
  const [usos, setUsos] = useState(null);
  const [limite, setLimite] = useState(5);
  const [historico, setHistorico] = useState([]);
  const [showHistorico, setShowHistorico] = useState(false);
  const fileRef = useRef(null);

  const estilosObj = ESTILOS.filter(e => estilos.includes(e.value));
  const religioso = estilosObj.some(e => e.religioso);

  // ── Pegar token do usuário para autenticar no backend ──
  const getToken = async () => {
    return await user.getIdToken();
  };

  // ── Buscar uso do dia ao carregar ──
  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        const res = await fetch(`${API_URL}/uso`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        setUsos(data.usos);
        setLimite(data.limite);
      } catch {}
    })();
  }, []);

  // ── Buscar histórico ──
  const buscarHistorico = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/historico`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setHistorico(data.historico || []);
    } catch {}
    setShowHistorico(true);
  };

  const detectOrientation = useCallback((src, id) => {
    const img = new Image();
    img.onload = () => {
      const r = img.naturalWidth / img.naturalHeight;
      const orient = r > 1.1 ? "landscape" : r < 0.9 ? "portrait" : "square";
      setImagens(prev => prev.map(im => im.id === id ? { ...im, orient } : im));
    };
    img.src = src;
  }, []);

  const handleImgs = e => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const aceitos = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (files.some(f => !aceitos.includes(f.type))) { setErro("Use apenas JPG, PNG, GIF ou WEBP."); return; }
    const disponiveis = 10 - imagens.length;
    if (disponiveis <= 0) { setErro("Limite de 10 imagens atingido."); return; }
    setErro("");
    files.slice(0, disponiveis).forEach(f => {
      const id = Date.now() + Math.random();
      const r = new FileReader();
      r.onload = ev => {
        const res = ev.target.result;
        setImagens(prev => [...prev, { id, b64: res.split(",")[1], prev: res, tipo: f.type, orient: "landscape" }]);
        detectOrientation(res, id);
      };
      r.readAsDataURL(f);
    });
    if (fileRef.current) fileRef.current.value = "";
  };

  const remImg = id => setImagens(prev => prev.filter(im => im.id !== id));
  const toggleEstilo = v => setEstilos(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]);
  const toggleRede = v => setRedes(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]);
  const toggleClasse = v => setClasses(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]);
  const toggleTamanho = v => { setTamanho(p => { const n = p === v ? "" : v; if (n !== "caracteres") setNChars(""); return n; }); };
  const toggleCIC = v => setUsarCIC(p => p === v ? null : v);

  const tamInstr = () => {
    if (tamanho === "curta") return "Máx 100 caracteres.";
    if (tamanho === "media") return "Entre 100 e 300 caracteres.";
    if (tamanho === "grande") return "Entre 300 e 600 caracteres.";
    if (tamanho === "caracteres") return `Aproximadamente ${parseInt(nChars, 10)} caracteres.`;
    return "";
  };

  const cicInstr = () => {
    if (!religioso) return "";
    if (usarCIC === false) return "NÃO use CIC. Priorize passagens bíblicas e salmos no formato litúrgico.";
    if (usarCIC === true) return citCIC.trim() ? `Inclua: "${citCIC.trim()}". Combine com passagens bíblicas.` : "Inclua citações do CIC com passagens bíblicas.";
    return "";
  };

  const validar = () => {
    if (modo === "texto" && !descricao.trim()) return "Escreva uma descrição.";
    if (modo === "foto" && imagens.length === 0) return "Envie pelo menos 1 imagem.";
    if (modo === "ambos" && (imagens.length === 0 || !descricao.trim())) return "Envie imagem(ns) e escreva a descrição.";
    if (estilos.length === 0) return "Selecione pelo menos 1 estilo.";
    if (religioso && usarCIC === null) return "Informe se deseja incluir citação do CIC.";
    if (redes.length === 0) return "Selecione pelo menos 1 rede social.";
    if (!tamanho) return "Selecione o tamanho.";
    if (classes.length === 0) return "Selecione pelo menos 1 classificação do público.";
    if (tamanho === "caracteres") { const n = parseInt(nChars, 10); if (!nChars || isNaN(n) || n < 10 || n > 5000) return "Caracteres: entre 10 e 5000."; }
    return null;
  };

  const gerar = async () => {
    const e = validar(); if (e) { setErro(e); return; }
    setErro(""); setLoading(true); setLegendas([]); setGrammarResult({}); setGrammarIdx(null);

    const redesSel = redes.map(v => REDES.find(r => r.value === v)?.label || v).join(", ");
    const classesSel = classes.map(v => CLASSIFICACOES.find(c => c.value === v)?.label || v).join(", ");
    const estilosSel = estilosObj.map(e => e.label).join(", ");
    const estilosInstr = estilosObj.map(e => e.instrucao).join(" | ");
    const classesInstr = classes.map(v => CLASSIFICACOES.find(c => c.value === v)?.instrucao || "").join(" ");
    const ytAtivo = hasYT(redes);
    const nImgs = imagens.length;
    const ctx = modo === "foto"
      ? `Analise ${nImgs > 1 ? `as ${nImgs} imagens enviadas em conjunto` : "a imagem enviada"} e crie 1 legenda para o conjunto.`
      : modo === "ambos"
        ? `Analise ${nImgs > 1 ? `as ${nImgs} imagens enviadas em conjunto` : "a imagem"} e considere também: "${descricao}"`
        : `Descrição: "${descricao}"`;

    const prompt = `Você é especialista em conteúdo para redes sociais com profundo conhecimento da Bíblia e do CIC.
CONTEXTO: ${ctx}
REDES: ${redesSel} | ESTILOS: ${estilosSel} | PÚBLICO: ${classesSel} | TAMANHO: ${tamInstr()}
INSTRUÇÃO DE ESTILO: ${estilosInstr}
${religioso ? `CIC: ${cicInstr()}` : ""}
PÚBLICO: ${classesInstr}
${ytAtivo ? `Para redes YouTube gere "titulo" (SEO máx 100 chars) e "descricao_yt" (2-4 parágrafos). Para demais redes deixe como "".` : `Campos "titulo" e "descricao_yt" deixe como "".`}
Gere 3 opções de legenda combinando todos os estilos e otimizando para todas as redes (${redesSel}).
Campo "texto" com emojis e hashtags no final. TAMANHO: ${tamInstr()}.
Retorne SOMENTE JSON puro sem markdown:
{"legendas":[{"titulo":"","descricao_yt":"","texto":""},{"titulo":"","descricao_yt":"","texto":""},{"titulo":"","descricao_yt":"","texto":""}]}`;

    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/gerar-legenda`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ prompt, imagens: imagens.length > 0 ? imagens : undefined }),
      });

      if (res.status === 429) {
        const data = await res.json();
        setErro(data.erro || "Limite diário atingido.");
        setLoading(false);
        return;
      }

      if (!res.ok) throw new Error(`Erro ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data.legendas) || !data.legendas.length) throw new Error("Estrutura inválida");
      setLegendas(data.legendas);
      setUsos(data.usos);
      setLimite(data.limite);
    } catch (err) { setErro("Erro ao gerar: " + err.message); }
    setLoading(false);
  };

  const verificarGramatica = async (texto, idx) => {
    if (!texto?.trim()) return;
    setGrammarIdx(idx); setGrammarLoading(true); setGrammarResult(r => ({ ...r, [idx]: null }));
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/verificar-gramatica`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ texto }),
      });
      const data = await res.json();
      setGrammarResult(r => ({ ...r, [idx]: data }));
    } catch (e) {
      setGrammarResult(r => ({ ...r, [idx]: { status: "erro", resumo: "Erro ao verificar.", itens: [], textoCorrigido: "" } }));
    }
    setGrammarLoading(false);
  };

  const copiar = (txt, idx) => {
    if (!txt) return;
    navigator.clipboard.writeText(txt).catch(() => {});
    setCopiado(idx); setTimeout(() => setCopiado(null), 2000);
  };

  const copiarTudo = (l, i) => {
    const p = [];
    if (l.titulo?.trim()) p.push(`TÍTULO:\n${l.titulo}`);
    if (l.descricao_yt?.trim()) p.push(`DESCRIÇÃO:\n${l.descricao_yt}`);
    if (l.texto?.trim()) p.push(`LEGENDA:\n${l.texto}`);
    if (!p.length) return;
    navigator.clipboard.writeText(p.join("\n\n")).catch(() => {});
    setCopiado("all_" + i); setTimeout(() => setCopiado(null), 2000);
  };

  const ytAtivo = hasYT(redes);
  const inp = { width: "100%", borderRadius: 8, border: "1.5px solid #e2e8f0", padding: "10px 14px", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit", background: "#fff", color: "#0f172a", transition: "border 0.15s" };

  const CopyBtn = ({ txt, idx }) => {
    const ok = copiado === idx;
    return (
      <button className="chip-btn" onClick={() => copiar(txt, idx)} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 6, border: "none", background: ok ? "#10b981" : "#f1f5f9", color: ok ? "#fff" : "#64748b", fontWeight: 600, fontSize: 11, cursor: "pointer" }}>
        <Icon name={ok ? "check" : "copy"} size={12} />{ok ? "Copiado" : ""}
      </button>
    );
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", padding: "24px 16px", fontFamily: "'Inter',system-ui,sans-serif" }}>
      <style>{STYLE}</style>
      {showHistorico && <ModalHistorico historico={historico} onClose={() => setShowHistorico(false)} onUsar={(l) => { setLegendas(l); setShowHistorico(false); }} />}
      <div style={{ maxWidth: 660, margin: "0 auto" }}>
        <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 32px rgba(0,0,0,0.3)", marginBottom: 20 }}>
          <Banner user={user} usos={usos} limite={limite} onLogout={() => signOut(auth)} onHistorico={buscarHistorico} />
          <div style={{ padding: 28 }}>

            {/* Contexto */}
            <Section label="Contexto">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {MODOS.map(m => (
                  <Chip key={m.value} label={m.label} icon={m.icon} active={modo === m.value}
                    onClick={() => { setModo(m.value); setImagens([]); }} color="#1e40af" />
                ))}
              </div>
            </Section>

            {/* Imagens */}
            {(modo === "foto" || modo === "ambos") && (
              <Section label="Imagens" hint={`${imagens.length}/10`}>
                {imagens.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                    {imagens.map((im, idx) => (
                      <div key={im.id} className="img-thumb" style={{ position: "relative", width: 80, height: 80, borderRadius: 8, overflow: "hidden", border: "1.5px solid #bfdbfe", flexShrink: 0, cursor: "default" }}>
                        <img src={im.prev} alt={`img${idx + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        <div className="img-overlay" style={{ position: "absolute", inset: 0, background: "rgba(15,23,42,0.5)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.2s" }}>
                          <button onClick={() => remImg(im.id)} style={{ background: "#ef4444", border: "none", borderRadius: "50%", width: 26, height: 26, color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                        </div>
                        <span style={{ position: "absolute", bottom: 2, left: 3, background: "rgba(15,23,42,0.75)", color: "#fff", fontSize: 9, borderRadius: 4, padding: "1px 5px", fontWeight: 700 }}>{idx + 1}</span>
                      </div>
                    ))}
                    {imagens.length < 10 && (
                      <div onClick={() => fileRef.current?.click()} style={{ width: 80, height: 80, borderRadius: 8, border: "1.5px dashed #bfdbfe", background: "#eff6ff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", gap: 3, flexShrink: 0 }}>
                        <Icon name="plus" size={20} />
                        <span style={{ fontSize: 9, color: "#64748b", fontWeight: 600 }}>Adicionar</span>
                      </div>
                    )}
                  </div>
                )}
                {imagens.length === 0 && (
                  <div onClick={() => fileRef.current?.click()} style={{ border: "1.5px dashed #bfdbfe", borderRadius: 10, padding: "22px 16px", textAlign: "center", cursor: "pointer", background: "#eff6ff" }}>
                    <Icon name="images" size={28} />
                    <p style={{ margin: "8px 0 2px", color: "#1e40af", fontWeight: 600, fontSize: 13 }}>Clique para selecionar imagens</p>
                    <p style={{ margin: 0, color: "#64748b", fontSize: 12 }}>JPG, PNG, GIF ou WEBP · mín. 1 · máx. 10 imagens</p>
                  </div>
                )}
                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" multiple onChange={handleImgs} style={{ display: "none" }} />
                {imagens.length > 0 && (
                  <div style={{ marginTop: 6, padding: "6px 10px", background: "#eff6ff", borderRadius: 8, fontSize: 12, color: "#1e40af", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                    <Icon name="check2" size={14} />
                    {imagens.length} imagem{imagens.length > 1 ? "ns" : ""} carregada{imagens.length > 1 ? "s" : ""}
                  </div>
                )}
              </Section>
            )}

            {/* Descrição */}
            {(modo === "texto" || modo === "ambos") && (
              <Section label={modo === "ambos" ? "Descrição complementar" : "Descrição"}>
                <textarea value={descricao} onChange={e => setDescricao(e.target.value)}
                  placeholder={modo === "ambos" ? "Ex: Foto após a missa, celebrando com a família..." : "Ex: Foto na praia ao pôr do sol com amigos..."}
                  rows={3} style={{ ...inp, resize: "vertical" }}
                  onFocus={e => e.target.style.border = "1.5px solid #3b82f6"}
                  onBlur={e => e.target.style.border = "1.5px solid #e2e8f0"} />
              </Section>
            )}

            {/* Estilo */}
            <Section label="Estilo de legenda" hint="múltipla seleção">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {ESTILOS.map(e => (
                  <Chip key={e.value} label={e.label} icon={e.icon} active={estilos.includes(e.value)}
                    onClick={() => toggleEstilo(e.value)} color="#1e40af" />
                ))}
              </div>
              {estilosObj.length > 0 && (
                <InfoBox>
                  {estilosObj.map((e, i) => (
                    <span key={e.value} style={{ display: "block", marginBottom: i < estilosObj.length - 1 ? 4 : 0 }}>
                      <strong>{e.label}:</strong> {e.instrucao}
                    </span>
                  ))}
                </InfoBox>
              )}
            </Section>

            {/* CIC */}
            {religioso && (
              <Section label="Catecismo da Igreja Católica (CIC)">
                <div style={{ background: "#fffbeb", border: "1.5px solid #fde68a", borderRadius: 10, padding: 16 }}>
                  <p style={{ margin: "0 0 12px", fontSize: 13, color: "#78350f", fontWeight: 500 }}>Deseja incluir citação do CIC?</p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <Chip label="Sim, incluir CIC" active={usarCIC === true} onClick={() => toggleCIC(true)} color="#b45309" />
                    <Chip label="Não, só passagens bíblicas" active={usarCIC === false} onClick={() => toggleCIC(false)} color="#64748b" />
                  </div>
                  {usarCIC === true && (
                    <div style={{ marginTop: 12 }}>
                      <p style={{ margin: "0 0 6px", fontSize: 12, color: "#78350f", fontWeight: 500 }}>Citação do CIC (opcional):</p>
                      <textarea value={citCIC} onChange={e => setCitCIC(e.target.value)}
                        placeholder='Ex: "A fé é a garantia dos bens que se esperam..." (CIC 146)'
                        rows={2} style={{ ...inp, fontSize: 13 }}
                        onFocus={e => e.target.style.border = "1.5px solid #f59e0b"}
                        onBlur={e => e.target.style.border = "1.5px solid #e2e8f0"} />
                    </div>
                  )}
                  {usarCIC === false && <InfoBox color="#166534" bg="#f0fdf4" border="#22c55e">📜 A IA priorizará passagens bíblicas no formato litúrgico.</InfoBox>}
                </div>
              </Section>
            )}

            {/* Rede social */}
            <Section label="Rede social" hint="múltipla seleção">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {REDES.map(r => (
                  <Chip key={r.value} label={r.label} icon={r.icon} active={redes.includes(r.value)}
                    onClick={() => toggleRede(r.value)} color="#4f46e5" />
                ))}
              </div>
              {ytAtivo && <InfoBox>Para YouTube serão gerados <strong>Título</strong>, <strong>Descrição</strong> e <strong>Legenda</strong>.</InfoBox>}
              {redes.length > 1 && <InfoBox color="#4f46e5" bg="#eef2ff" border="#c7d2fe">✨ A IA otimizará a legenda para as {redes.length} redes selecionadas.</InfoBox>}
            </Section>

            {/* Classificação */}
            <Section label="Classificação do público" hint="múltipla seleção">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {CLASSIFICACOES.map(c => (
                  <Chip key={c.value} label={c.label} icon={c.icon} active={classes.includes(c.value)}
                    onClick={() => toggleClasse(c.value)} color="#0f766e" />
                ))}
              </div>
            </Section>

            {/* Tamanho */}
            <Section label="Tamanho da legenda">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {TAMANHOS.map(t => (
                  <Chip key={t.value} label={`${t.label} · ${t.desc}`} icon={t.icon} active={tamanho === t.value}
                    onClick={() => toggleTamanho(t.value)} color="#b45309" />
                ))}
              </div>
              {tamanho === "caracteres" && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
                  <input type="number" min="10" max="5000" value={nChars}
                    onChange={e => setNChars(e.target.value.replace(/\D/g, ""))}
                    placeholder="Ex: 150"
                    style={{ width: 110, borderRadius: 8, border: "1.5px solid #e2e8f0", padding: "8px 12px", fontSize: 14, outline: "none", fontFamily: "inherit" }} />
                  <span style={{ fontSize: 13, color: "#64748b" }}>caracteres (10–5000)</span>
                </div>
              )}
            </Section>

            {/* Alerta de limite */}
            {usos !== null && usos >= limite && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontSize: 13, color: "#dc2626", fontWeight: 600 }}>
                ⚠️ Você atingiu o limite de {limite} legendas hoje. Volte amanhã!
              </div>
            )}

            {erro && <div style={{ color: "#ef4444", fontSize: 13, marginBottom: 16, background: "#fef2f2", padding: "10px 14px", borderRadius: 8 }}>⚠️ {erro}</div>}

            <button className="chip-btn" onClick={gerar} disabled={loading || (usos !== null && usos >= limite)}
              style={{ width: "100%", padding: "13px", borderRadius: 10, border: "none", background: loading || (usos !== null && usos >= limite) ? "#93c5fd" : "#1e40af", color: "#fff", fontWeight: 700, fontSize: 15, cursor: loading || (usos !== null && usos >= limite) ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "background 0.2s" }}>
              <Icon name="wand" size={17} />
              {loading ? "Gerando legendas..." : "Gerar Legendas"}
            </button>
          </div>
        </div>

        {/* Resultados */}
        {legendas.length > 0 && (
          <div>
            <p style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, textAlign: "center", marginBottom: 14 }}>Legendas geradas</p>
            {legendas.map((l, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: 14, padding: 20, marginBottom: 12, boxShadow: "0 2px 16px rgba(0,0,0,0.15)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <span style={{ fontWeight: 700, fontSize: 11, color: "#1e40af", background: "#dbeafe", padding: "4px 12px", borderRadius: 6, letterSpacing: "0.05em" }}>OPÇÃO {i + 1}</span>
                  <button className="chip-btn" onClick={() => copiarTudo(l, i)}
                    style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 13px", borderRadius: 8, border: "none", background: copiado === "all_" + i ? "#10b981" : "#1e40af", color: "#fff", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
                    <Icon name={copiado === "all_" + i ? "check" : "copy"} size={13} />
                    {copiado === "all_" + i ? "Copiado!" : "Copiar Tudo"}
                  </button>
                </div>

                {ytAtivo && l.titulo?.trim() && (
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontWeight: 600, fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>Título</span>
                      <CopyBtn txt={l.titulo} idx={"t" + i} />
                    </div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", margin: 0, lineHeight: 1.5, background: "#f8fafc", padding: "10px 12px", borderRadius: 8 }}>{l.titulo}</p>
                  </div>
                )}

                {ytAtivo && l.descricao_yt?.trim() && (
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontWeight: 600, fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>Descrição</span>
                      <CopyBtn txt={l.descricao_yt} idx={"d" + i} />
                    </div>
                    <p style={{ fontSize: 13, color: "#334155", margin: 0, lineHeight: 1.7, background: "#f8fafc", padding: "10px 12px", borderRadius: 8, whiteSpace: "pre-wrap" }}>{l.descricao_yt}</p>
                  </div>
                )}

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontWeight: 600, fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      {ytAtivo ? "Legenda / Caption" : "Legenda"}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 11, color: "#94a3b8" }}>{l.texto?.length || 0} chars</span>
                      <CopyBtn txt={l.texto} idx={i} />
                    </div>
                  </div>
                  <p style={{ fontSize: 14, color: "#334155", lineHeight: 1.75, margin: 0, whiteSpace: "pre-wrap", background: "#f8fafc", padding: "10px 12px", borderRadius: 8 }}>{l.texto}</p>
                </div>

                <div style={{ marginTop: 12 }}>
                  <button className="chip-btn" onClick={() => verificarGramatica(l.texto, i)}
                    disabled={grammarLoading && grammarIdx === i}
                    style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 13px", borderRadius: 8, border: "1.5px solid #e2e8f0", background: "#fff", color: "#8b5cf6", fontWeight: 600, fontSize: 12, cursor: grammarLoading && grammarIdx === i ? "not-allowed" : "pointer" }}>
                    <Icon name="grammar" size={14} />
                    {grammarLoading && grammarIdx === i ? "Verificando..." : "Verificar gramática"}
                  </button>

                  {grammarResult[i] && (
                    <div style={{ marginTop: 10, background: grammarResult[i].status === "ok" ? "#f0fdf4" : "#fefce8", border: `1.5px solid ${grammarResult[i].status === "ok" ? "#bbf7d0" : "#fde68a"}`, borderRadius: 10, padding: 14 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: grammarResult[i].itens?.length > 0 ? 10 : 0 }}>
                        <Icon name={grammarResult[i].status === "ok" ? "check2" : "grammar"} size={16} />
                        <span style={{ fontWeight: 700, fontSize: 13, color: grammarResult[i].status === "ok" ? "#166534" : "#92400e" }}>{grammarResult[i].resumo}</span>
                      </div>
                      {grammarResult[i].itens?.length > 0 && (
                        <div style={{ marginBottom: 10 }}>
                          {grammarResult[i].itens.map((it, j) => (
                            <div key={j} style={{ marginBottom: 8, padding: "8px 10px", background: "rgba(255,255,255,0.7)", borderRadius: 8, fontSize: 12 }}>
                              <span style={{ fontWeight: 700, color: "#b45309", textTransform: "uppercase", fontSize: 10, letterSpacing: "0.05em" }}>{it.tipo}</span>
                              <p style={{ margin: "3px 0 2px", color: "#374151" }}>⚠️ {it.problema}</p>
                              <p style={{ margin: 0, color: "#166534" }}>✅ {it.sugestao}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      {grammarResult[i].textoCorrigido?.trim() && grammarResult[i].textoCorrigido !== l.texto && (
                        <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: 10, marginTop: 4 }}>
                          <p style={{ margin: "0 0 6px", fontWeight: 600, fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Texto corrigido</p>
                          <p style={{ margin: 0, fontSize: 13, color: "#0f172a", lineHeight: 1.65, background: "#fff", padding: "8px 10px", borderRadius: 8, whiteSpace: "pre-wrap" }}>{grammarResult[i].textoCorrigido}</p>
                          <button className="chip-btn" onClick={() => copiar(grammarResult[i].textoCorrigido, "gc" + i)}
                            style={{ marginTop: 8, display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 7, border: "none", background: copiado === "gc" + i ? "#10b981" : "#1e40af", color: "#fff", fontWeight: 600, fontSize: 11, cursor: "pointer" }}>
                            <Icon name={copiado === "gc" + i ? "check" : "copy"} size={12} />
                            {copiado === "gc" + i ? "Copiado!" : "Copiar texto corrigido"}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            <button className="chip-btn" onClick={gerar}
              style={{ width: "100%", padding: "12px", borderRadius: 10, border: "1.5px solid rgba(255,255,255,0.12)", background: "transparent", color: "#64748b", fontWeight: 600, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#64748b"; }}>
              <Icon name="refresh" size={15} />
              Gerar novas opções
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
