// src/components/Login.jsx
import { useState } from "react";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth, googleProvider } from "../firebase/config";

const Logo = () => (
  <svg width="72" height="72" viewBox="0 0 90 90" fill="none">
    <defs>
      <linearGradient id="logoBg" x1="0" y1="0" x2="90" y2="90" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#4f46e5"/>
        <stop offset="50%" stopColor="#6366f1"/>
        <stop offset="100%" stopColor="#818cf8"/>
      </linearGradient>
    </defs>
    <circle cx="45" cy="45" r="38" fill="url(#logoBg)"/>
    <rect x="18" y="22" width="44" height="30" rx="8" fill="white" opacity="0.95"/>
    <polygon points="26,52 20,62 34,52" fill="white" opacity="0.95"/>
    <rect x="24" y="30" width="28" height="3.5" rx="1.75" fill="#6366f1" opacity="0.9"/>
    <rect x="24" y="37" width="22" height="3" rx="1.5" fill="#a5b4fc" opacity="0.8"/>
    <rect x="24" y="43" width="16" height="3" rx="1.5" fill="#c7d2fe" opacity="0.7"/>
    <line x1="52" y1="56" x2="68" y2="40" stroke="white" strokeWidth="3.5" strokeLinecap="round"/>
    <circle cx="69" cy="39" r="3.5" fill="#fbbf24"/>
  </svg>
);

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);

export default function Login() {
  const [modo, setModo] = useState("login"); // "login" | "cadastro"
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  const mensagemErro = (code) => {
    const msgs = {
      "auth/user-not-found": "Usuário não encontrado.",
      "auth/wrong-password": "Senha incorreta.",
      "auth/email-already-in-use": "Este e-mail já está cadastrado.",
      "auth/weak-password": "Senha muito fraca (mínimo 6 caracteres).",
      "auth/invalid-email": "E-mail inválido.",
      "auth/popup-closed-by-user": "Login cancelado.",
      "auth/invalid-credential": "E-mail ou senha incorretos.",
    };
    return msgs[code] || "Ocorreu um erro. Tente novamente.";
  };

  const loginGoogle = async () => {
    setErro(""); setLoading(true);
    try { await signInWithPopup(auth, googleProvider); }
    catch (e) { setErro(mensagemErro(e.code)); }
    setLoading(false);
  };

  const loginEmail = async () => {
    setErro(""); setLoading(true);
    try {
      if (modo === "login") {
        await signInWithEmailAndPassword(auth, email, senha);
      } else {
        await createUserWithEmailAndPassword(auth, email, senha);
      }
    } catch (e) { setErro(mensagemErro(e.code)); }
    setLoading(false);
  };

  const inp = {
    width: "100%", padding: "11px 14px", borderRadius: 10,
    border: "1.5px solid #e2e8f0", fontSize: 14, outline: "none",
    fontFamily: "inherit", boxSizing: "border-box", color: "#0f172a",
  };

  return (
    <div style={{
      minHeight: "100vh", background: "linear-gradient(135deg,#060d1f 0%,#0f1f3d 50%,#1a1040 100%)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      fontFamily: "'Inter',system-ui,sans-serif",
    }}>
      <div style={{
        background: "#fff", borderRadius: 20, padding: "40px 36px", width: "100%",
        maxWidth: 400, boxShadow: "0 8px 48px rgba(0,0,0,0.4)",
      }}>
        {/* Logo e título */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
            <Logo />
          </div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#0f172a" }}>
            Criador de Legendas IA
          </h1>
          <p style={{ margin: "6px 0 0", color: "#64748b", fontSize: 14 }}>
            {modo === "login" ? "Entre na sua conta" : "Crie sua conta grátis"}
          </p>
        </div>

        {/* Botão Google */}
        <button onClick={loginGoogle} disabled={loading} style={{
          width: "100%", padding: "12px 16px", borderRadius: 10,
          border: "1.5px solid #e2e8f0", background: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
          color: "#374151", marginBottom: 20, transition: "background 0.15s",
        }}
          onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
          onMouseLeave={e => e.currentTarget.style.background = "#fff"}>
          <GoogleIcon />
          Continuar com Google
        </button>

        {/* Divisor */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
          <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>ou com e-mail</span>
          <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
        </div>

        {/* Formulário */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input type="email" placeholder="seu@email.com" value={email}
            onChange={e => setEmail(e.target.value)} style={inp} />
          <input type="password" placeholder="Senha" value={senha}
            onChange={e => setSenha(e.target.value)} style={inp}
            onKeyDown={e => e.key === "Enter" && loginEmail()} />

          {erro && (
            <div style={{
              background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8,
              padding: "10px 14px", color: "#dc2626", fontSize: 13,
            }}>{erro}</div>
          )}

          <button onClick={loginEmail} disabled={loading || !email || !senha} style={{
            padding: "13px", borderRadius: 10, border: "none",
            background: loading || !email || !senha ? "#c7d2fe" : "#4f46e5",
            color: "#fff", fontWeight: 700, fontSize: 15,
            cursor: loading || !email || !senha ? "not-allowed" : "pointer",
            transition: "background 0.15s",
          }}>
            {loading ? "Aguarde..." : modo === "login" ? "Entrar" : "Criar conta"}
          </button>
        </div>

        {/* Trocar modo */}
        <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "#64748b" }}>
          {modo === "login" ? "Não tem conta? " : "Já tem conta? "}
          <button onClick={() => { setModo(modo === "login" ? "cadastro" : "login"); setErro(""); }}
            style={{ background: "none", border: "none", color: "#4f46e5", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
            {modo === "login" ? "Cadastre-se grátis" : "Fazer login"}
          </button>
        </p>

        {/* Info plano */}
        <div style={{
          marginTop: 16, padding: "10px 14px", background: "#f0fdf4",
          borderRadius: 10, border: "1px solid #bbf7d0", fontSize: 12, color: "#166534",
          textAlign: "center",
        }}>
          ✅ Plano grátis: 5 legendas por dia
        </div>
      </div>
    </div>
  );
}
