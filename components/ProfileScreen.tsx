"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Check,
  ChevronDown,
  Info,
  Loader2,
  MapPin,
  RefreshCw,
  Sparkles,
  UserCog,
  WifiOff,
} from "lucide-react";
import { fetchMe, switchAccount, updateMe, type ProfilePatch } from "@/lib/api";
import { completionTips } from "@/lib/completion";
import {
  ALCOHOL_OPTIONS,
  EDUCATION_OPTIONS,
  PETS_OPTIONS,
  SMOKING_OPTIONS,
  ZODIAC_SIGNS,
} from "@/lib/profileOptions";
import type { DemoAccount, MeProfile, Niyet, ProfilePrompt } from "@/lib/types";
import { PhotoManager } from "@/app/(app)/profile/PhotoManager";
import { VerifiedBadge } from "./ProfileBadges";
import { CompletionMeter } from "./CompletionMeter";
import { ChipSelect } from "./LifestyleChips";
import { PromptsEditor } from "./PromptsEditor";

const NIYET_OPTIONS: Niyet[] = [
  "Ciddi İlişki",
  "Uzun Vadeli",
  "Arkadaşlık",
  "Henüz Emin Değilim",
];

const inputCls =
  "w-full rounded-xl border border-kuytu-border bg-kuytu-card-raised px-3 py-2.5 text-sm text-kuytu-text placeholder:text-kuytu-muted focus:border-kuytu-accent focus:outline-none focus:ring-1 focus:ring-kuytu-accent/40";

/** Collapsible accordion section. */
function Section({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="overflow-hidden rounded-3xl border border-kuytu-border bg-kuytu-card shadow-soft">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3.5 text-left"
      >
        <span className="font-extrabold text-kuytu-text">{title}</span>
        <ChevronDown
          size={20}
          className={`text-kuytu-muted transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="border-t border-kuytu-border p-4">{children}</div>}
    </section>
  );
}

function SaveButton({
  onClick,
  saving,
  saved,
  disabled,
}: {
  onClick: () => void;
  saving: boolean;
  saved: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || saving}
      className="flex items-center justify-center gap-2 rounded-full bg-grad-gold py-3 text-sm font-bold text-kuytu-text shadow-glow-gold transition-transform active:scale-[0.98] disabled:opacity-40 disabled:shadow-none"
    >
      {saving ? (
        <Loader2 size={16} className="animate-spin" />
      ) : saved ? (
        <>
          <Check size={16} /> Kaydedildi
        </>
      ) : (
        "Kaydet"
      )}
    </button>
  );
}

/** 1 — Temel Bilgiler: bio, niyet, meslek, eğitim, boy. */
function BasicInfoSection({
  me,
  persist,
}: {
  me: MeProfile;
  persist: (patch: ProfilePatch) => Promise<void>;
}) {
  const [bio, setBio] = useState(me.bio);
  const [intention, setIntention] = useState<Niyet>(me.intention);
  const [jobTitle, setJobTitle] = useState(me.jobTitle ?? "");
  const [education, setEducation] = useState<string | null>(me.education);
  const [height, setHeight] = useState(me.height ? String(me.height) : "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    await persist({
      bio,
      intention,
      jobTitle: jobTitle.trim() || null,
      education,
      height: height ? Number(height) : null,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="block pb-2 text-sm font-bold text-kuytu-text">
          Hakkında
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          maxLength={500}
          placeholder="Kendinden kısaca bahset…"
          className={`${inputCls} resize-none`}
        />
      </div>
      <div>
        <label className="block pb-2 text-sm font-bold text-kuytu-text">
          Niyet
        </label>
        <ChipSelect
          options={NIYET_OPTIONS}
          value={intention}
          onChange={(v) => setIntention((v as Niyet) ?? intention)}
          allowClear={false}
        />
      </div>
      <div>
        <label className="block pb-2 text-sm font-bold text-kuytu-text">
          Meslek
        </label>
        <input
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          placeholder='Örn: "Mimarlık"'
          className={inputCls}
        />
      </div>
      <div>
        <label className="block pb-2 text-sm font-bold text-kuytu-text">
          Boy (cm)
        </label>
        <input
          value={height}
          onChange={(e) => setHeight(e.target.value.replace(/\D/g, ""))}
          inputMode="numeric"
          placeholder="Örn: 172"
          className={inputCls}
        />
      </div>
      <div>
        <label className="block pb-2 text-sm font-bold text-kuytu-text">
          Eğitim
        </label>
        <ChipSelect
          options={EDUCATION_OPTIONS}
          value={education}
          onChange={setEducation}
        />
      </div>
      <SaveButton onClick={save} saving={saving} saved={saved} />
    </div>
  );
}

/** 2 — Yaşam Tarzı: quick-tap chips (auto-save on change). */
function LifestyleSection({
  me,
  persist,
}: {
  me: MeProfile;
  persist: (patch: ProfilePatch) => Promise<void>;
}) {
  const rows: [string, readonly string[], keyof ProfilePatch, string | null][] = [
    ["Sigara", SMOKING_OPTIONS, "smoking", me.smoking],
    ["Alkol", ALCOHOL_OPTIONS, "alcohol", me.alcohol],
    ["Evcil Hayvan", PETS_OPTIONS, "pets", me.pets],
    ["Burç", ZODIAC_SIGNS, "zodiac", me.zodiac],
  ];
  return (
    <div className="flex flex-col gap-4">
      {rows.map(([label, options, field, current]) => (
        <div key={label}>
          <label className="block pb-2 text-sm font-bold text-kuytu-text">
            {label}
          </label>
          <ChipSelect
            options={options}
            value={current}
            onChange={(v) => void persist({ [field]: v } as ProfilePatch)}
          />
        </div>
      ))}
      <p className="text-xs text-kuytu-muted">
        Rozetlere dokunduğunda otomatik kaydedilir.
      </p>
    </div>
  );
}

/** 3 — Buz Kırıcı Kartlar: prompts. */
function PromptsSection({
  me,
  persist,
}: {
  me: MeProfile;
  persist: (patch: ProfilePatch) => Promise<void>;
}) {
  const [prompts, setPrompts] = useState<ProfilePrompt[]>(me.prompts);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    await persist({ prompts });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="flex flex-col gap-4">
      <PromptsEditor value={prompts} onChange={setPrompts} />
      <SaveButton onClick={save} saving={saving} saved={saved} />
    </div>
  );
}

/** Demo identity switcher — lets us test the women-first rule from both sides. */
function AccountSwitcher({
  accounts,
  onSwitch,
  switching,
}: {
  accounts: DemoAccount[];
  onSwitch: (id: string) => void;
  switching: string | null;
}) {
  return (
    <section className="rounded-3xl border border-kuytu-border bg-kuytu-card p-4 shadow-soft">
      <h2 className="flex items-center gap-2 pb-1 text-sm font-bold text-kuytu-text">
        <UserCog size={16} className="text-kuytu-accent" />
        Test hesabı değiştir
      </h2>
      <p className="pb-3 text-xs text-kuytu-muted">
        Kadın ve erkek hesaplar arasında geçiş yaparak &quot;önce kadın&quot;
        kuralını test edin.
      </p>
      <div className="flex flex-col gap-1.5">
        {accounts.map((a) => (
          <button
            key={a.id}
            type="button"
            disabled={a.active || switching !== null}
            onClick={() => onSwitch(a.id)}
            className={`flex items-center gap-3 rounded-xl border px-3 py-2 text-left transition-colors ${
              a.active
                ? "border-kuytu-accent/40 bg-kuytu-accent/10"
                : "border-kuytu-border bg-kuytu-card-raised/40 hover:bg-kuytu-card-raised"
            }`}
          >
            <div
              className="h-9 w-9 shrink-0 rounded-full bg-kuytu-bg-deep bg-cover bg-center ring-1 ring-kuytu-border"
              style={{ backgroundImage: a.photo ? `url(${a.photo})` : undefined }}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-kuytu-text">
                {a.name}
              </p>
              <p className="text-xs text-kuytu-muted">
                {a.gender === "kadın" ? "Kadın" : "Erkek"}
              </p>
            </div>
            {switching === a.id ? (
              <Loader2 size={16} className="animate-spin text-kuytu-accent" />
            ) : a.active ? (
              <span className="text-[11px] font-bold text-kuytu-accent-deep">
                Aktif
              </span>
            ) : (
              <RefreshCw size={15} className="text-kuytu-muted" />
            )}
          </button>
        ))}
      </div>
    </section>
  );
}

export function ProfileScreen() {
  const [me, setMe] = useState<MeProfile | null>(null);
  const [accounts, setAccounts] = useState<DemoAccount[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [switching, setSwitching] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchMe()
      .then(({ me, accounts }) => {
        if (cancelled) return;
        setMe(me);
        setAccounts(accounts);
      })
      .catch((e: Error) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, []);

  async function persist(patch: ProfilePatch) {
    const next = await updateMe(patch);
    setMe(next);
  }

  async function handleSwitch(id: string) {
    setSwitching(id);
    try {
      await switchAccount(id);
      window.location.reload();
    } catch {
      setSwitching(null);
    }
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
        <WifiOff className="text-kuytu-pass" size={36} />
        <p className="max-w-xs text-sm text-kuytu-muted">{error}</p>
      </div>
    );
  }

  if (!me) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="animate-spin text-kuytu-accent" size={32} />
      </div>
    );
  }

  const tips = completionTips({
    photos: me.photos,
    bio: me.bio,
    jobTitle: me.jobTitle,
    education: me.education,
    height: me.height,
    zodiac: me.zodiac,
    smoking: me.smoking,
    alcohol: me.alcohol,
    pets: me.pets,
    interests: [],
    prompts: me.prompts,
  });

  return (
    <div className="flex flex-col gap-5 px-4 pb-8">
      {/* Identity header */}
      <div className="flex items-center gap-4 pt-2">
        <div
          className="h-20 w-20 shrink-0 rounded-full bg-kuytu-bg-deep bg-cover bg-center ring-2 ring-kuytu-accent/50 shadow-[0_0_14px_rgba(212,163,115,0.35)]"
          style={{
            backgroundImage: me.photos[0] ? `url(${me.photos[0]})` : undefined,
          }}
        />
        <div className="min-w-0">
          <h1 className="flex items-center gap-2 text-2xl font-extrabold text-kuytu-text">
            {me.name}, {me.age}
            {me.verified && <VerifiedBadge size={20} />}
          </h1>
          {me.city && (
            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-kuytu-card-raised px-2.5 py-1 text-xs font-semibold text-kuytu-text/70">
              <MapPin size={12} className="text-kuytu-accent" />
              {me.city}
            </span>
          )}
        </div>
      </div>

      {/* Completion card */}
      <div className="rounded-3xl border border-kuytu-border bg-kuytu-card p-4 shadow-soft">
        <CompletionMeter value={me.profileCompletion} />
        {tips.length > 0 && (
          <ul className="mt-3 flex flex-col gap-1.5">
            {tips.map((t) => (
              <li
                key={t}
                className="flex items-center gap-2 text-sm text-kuytu-muted"
              >
                <Info size={14} className="shrink-0 text-kuytu-accent" />
                {t}
              </li>
            ))}
          </ul>
        )}
        {me.profileCompletion < 100 && (
          <Link
            href="/onboarding"
            className="mt-3 flex items-center justify-center gap-2 rounded-full border border-kuytu-accent/40 bg-kuytu-accent/5 py-2.5 text-sm font-bold text-kuytu-accent-deep transition-colors hover:bg-kuytu-accent/10"
          >
            <Sparkles size={16} /> Adım adım tamamla
          </Link>
        )}
      </div>

      <PhotoManager photos={me.photos} onPersisted={setMe} />

      <Section title="Temel Bilgiler" defaultOpen>
        <BasicInfoSection me={me} persist={persist} />
      </Section>
      <Section title="Yaşam Tarzı">
        <LifestyleSection me={me} persist={persist} />
      </Section>
      <Section title="Buz Kırıcı Kartlar">
        <PromptsSection me={me} persist={persist} />
      </Section>

      <AccountSwitcher
        accounts={accounts}
        onSwitch={handleSwitch}
        switching={switching}
      />
    </div>
  );
}
