"use client";

import { useState } from "react";
import { useLang } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";

export default function LoginPageClient() {
  const { t, lang, setLang } = useLang();
  const supabase = createClient();
  const [mode, setMode] = useState<"magic" | "password">("magic");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  const inputStyle: React.CSSProperties = {
    border: "1px solid var(--border)",
    borderRadius: "0.6rem",
    padding: "0.6rem 0.8rem",
    background: "var(--surface)",
    fontSize: "0.95rem",
    width: "100%",
  };

  const sendMagicLink = async () => {
    setStatus("sending");
    setMessage("");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setStatus("error");
      setMessage(error.message);
    } else {
      setStatus("sent");
    }
  };

  const signInPassword = async () => {
    setStatus("sending");
    setMessage("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setStatus("error");
      setMessage(error.message);
    } else {
      window.location.href = "/dashboard";
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm flex flex-col gap-5">
        <div className="text-center">
          <span className="flex items-center justify-center gap-2 font-bold text-lg" style={{ color: "var(--green-900)" }}>
            <span style={{ width: 30, height: 30, borderRadius: 9, background: "linear-gradient(135deg, var(--green-500), var(--green-900))", display: "inline-block" }} />
            {t("app.name")}
          </span>
          <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>{t("app.tagline")}</p>
        </div>

        <div className="card p-6 flex flex-col gap-4">
          <h1 className="font-bold text-lg" style={{ color: "var(--green-900)" }}>{t("auth.signIn")}</h1>

          {status === "sent" ? (
            <div className="rounded-lg p-3 text-sm" style={{ background: "var(--green-100)", color: "var(--green-900)" }}>
              {t("auth.magicSent")}
            </div>
          ) : (
            <>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted)" }}>{t("auth.email")}</span>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} placeholder="you@email.com" />
              </label>

              {mode === "password" && (
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted)" }}>{t("auth.password")}</span>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
                </label>
              )}

              {message && <p className="text-sm" style={{ color: "#9b2226" }}>{message}</p>}

              <button
                className="btn btn-primary"
                disabled={status === "sending" || !email}
                onClick={mode === "magic" ? sendMagicLink : signInPassword}
              >
                {status === "sending" ? "…" : mode === "magic" ? t("auth.sendMagic") : t("auth.signIn")}
              </button>

              <button
                className="text-xs underline"
                style={{ color: "var(--muted)" }}
                onClick={() => { setMode(mode === "magic" ? "password" : "magic"); setStatus("idle"); setMessage(""); }}
              >
                {mode === "magic" ? t("auth.usePassword") : t("auth.useMagic")}
              </button>
            </>
          )}
        </div>

        <button onClick={() => setLang(lang === "en" ? "es" : "en")} className="text-xs underline mx-auto" style={{ color: "var(--muted)" }}>
          {t("nav.language")}
        </button>
      </div>
    </div>
  );
}
