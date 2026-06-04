"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { PageHeader } from "@/components/ui";

export default function ProfilePage() {
  const { t, viewer, lang, updateVolunteer } = useStore();

  const [name, setName] = useState(viewer?.name ?? "");
  const [langPref, setLangPref] = useState<"en" | "es">(
    viewer?.languagePref ?? lang,
  );
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");

  if (!viewer) return null;

  const dirty =
    name.trim() !== viewer.name || langPref !== viewer.languagePref;

  const handleSave = async () => {
    if (!dirty) return;
    setStatus("saving");
    await updateVolunteer(viewer.id, {
      name: name.trim(),
      languagePref: langPref,
    });
    setStatus("saved");
    setTimeout(() => setStatus("idle"), 2000);
  };

  return (
    <div className="flex flex-col gap-6 max-w-md">
      <PageHeader title={t("profile.title")} subtitle={t("profile.subtitle")} />

      <section className="card p-5 flex flex-col gap-5">
        {/* Name */}
        <div className="flex flex-col gap-1.5">
          <label
            className="text-sm font-medium"
            style={{ color: "var(--text)" }}
          >
            {t("profile.name")}
          </label>
          <input
            className="input"
            value={name}
            placeholder={t("profile.namePlaceholder")}
            onChange={(e) => {
              setName(e.target.value);
              setStatus("idle");
            }}
          />
        </div>

        {/* Language */}
        <div className="flex flex-col gap-1.5">
          <label
            className="text-sm font-medium"
            style={{ color: "var(--text)" }}
          >
            {t("profile.language")}
          </label>
          <div className="flex gap-2">
            {(["en", "es"] as const).map((l) => (
              <button
                key={l}
                onClick={() => {
                  setLangPref(l);
                  setStatus("idle");
                }}
                className="btn flex-1"
                style={{
                  background:
                    langPref === l ? "var(--green-100)" : "var(--surface-alt)",
                  color:
                    langPref === l ? "var(--green-900)" : "var(--muted)",
                  border:
                    langPref === l
                      ? "1.5px solid var(--green-500)"
                      : "1.5px solid var(--border)",
                  fontWeight: langPref === l ? 600 : 400,
                }}
              >
                {t(`profile.lang.${l}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Save */}
        <button
          className="btn btn-primary"
          disabled={!dirty || status === "saving"}
          onClick={handleSave}
        >
          {status === "saving"
            ? t("profile.saving")
            : status === "saved"
              ? t("profile.saved")
              : t("profile.save")}
        </button>
      </section>

      {/* Read-only info */}
      <section className="card p-5 flex flex-col gap-3">
        <p
          className="text-xs uppercase tracking-wider font-semibold"
          style={{ color: "var(--muted)" }}
        >
          Account
        </p>
        <div className="flex justify-between text-sm">
          <span style={{ color: "var(--muted)" }}>Role</span>
          <span style={{ color: "var(--text)", fontWeight: 500 }}>
            {viewer.role.replace(/_/g, " ")}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span style={{ color: "var(--muted)" }}>Zone</span>
          <span style={{ color: "var(--text)", fontWeight: 500 }}>
            {viewer.zone ?? "—"}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span style={{ color: "var(--muted)" }}>Stars</span>
          <span style={{ color: "var(--text)", fontWeight: 500 }}>
            {viewer.currentStars}★
          </span>
        </div>
      </section>
    </div>
  );
}
