"use client";

import { useEffect, useState } from "react";
import {
  Check,
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
  UserCog,
  WifiOff,
} from "lucide-react";
import { fetchMe, switchAccount, updateMe } from "@/lib/api";
import type { DemoAccount, MeProfile, Niyet } from "@/lib/types";
import { VerifiedBadge } from "./ProfileBadges";

const NIYET_OPTIONS: Niyet[] = [
  "Ciddi İlişki",
  "Uzun Vadeli",
  "Arkadaşlık",
  "Henüz Emin Değilim",
];

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
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <h2 className="flex items-center gap-2 pb-1 text-sm font-semibold text-white">
        <UserCog size={16} className="text-kuytu-gold" />
        Test hesabı değiştir
      </h2>
      <p className="pb-3 text-xs text-white/50">
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
                ? "border-kuytu-gold/40 bg-kuytu-gold/10"
                : "border-white/10 hover:bg-white/[0.05]"
            }`}
          >
            <div
              className="h-9 w-9 shrink-0 rounded-full bg-cover bg-center ring-1 ring-white/15"
              style={{
                backgroundImage: a.photo ? `url(${a.photo})` : undefined,
              }}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{a.name}</p>
              <p className="text-xs text-white/50">
                {a.gender === "kadın" ? "Kadın" : "Erkek"}
              </p>
            </div>
            {switching === a.id ? (
              <Loader2 size={16} className="animate-spin text-kuytu-gold" />
            ) : a.active ? (
              <span className="text-[11px] font-semibold text-kuytu-gold">
                Aktif
              </span>
            ) : (
              <RefreshCw size={15} className="text-white/40" />
            )}
          </button>
        ))}
      </div>
    </section>
  );
}

/** Edit bio, intention (Niyet) and photos. */
function ProfileEditor({
  me,
  onSaved,
}: {
  me: MeProfile;
  onSaved: (next: MeProfile) => void;
}) {
  const [bio, setBio] = useState(me.bio);
  const [intention, setIntention] = useState<Niyet>(me.intention);
  const [photos, setPhotos] = useState<string[]>(me.photos);
  const [newPhoto, setNewPhoto] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const dirty =
    bio !== me.bio ||
    intention !== me.intention ||
    JSON.stringify(photos) !== JSON.stringify(me.photos);

  function addPhoto() {
    const url = newPhoto.trim();
    if (!url || photos.length >= 6) return;
    setPhotos((p) => [...p, url]);
    setNewPhoto("");
  }

  async function save() {
    setSaving(true);
    setErr(null);
    setSaved(false);
    try {
      const next = await updateMe({ bio, intention, photos });
      onSaved(next);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Kaydedilemedi");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="flex flex-col gap-5">
      {/* Photos */}
      <div>
        <label className="pb-2 block text-sm font-semibold text-white">
          Fotoğraflar
        </label>
        <div className="grid grid-cols-3 gap-2">
          {photos.map((url, i) => (
            <div
              key={`${url}-${i}`}
              className="relative aspect-[3/4] overflow-hidden rounded-xl bg-cover bg-center ring-1 ring-white/10"
              style={{ backgroundImage: `url(${url})` }}
            >
              <button
                type="button"
                aria-label="Fotoğrafı kaldır"
                onClick={() => setPhotos((p) => p.filter((_, idx) => idx !== i))}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
        {photos.length < 6 && (
          <div className="mt-2 flex gap-2">
            <input
              value={newPhoto}
              onChange={(e) => setNewPhoto(e.target.value)}
              placeholder="Fotoğraf URL'si ekle"
              className="min-w-0 flex-1 rounded-xl border border-white/10 bg-kuytu-black-elevated px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-kuytu-gold/50 focus:outline-none"
            />
            <button
              type="button"
              onClick={addPhoto}
              aria-label="Ekle"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 text-kuytu-gold"
            >
              <Plus size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Intention */}
      <div>
        <label
          htmlFor="intention"
          className="pb-2 block text-sm font-semibold text-white"
        >
          Niyet
        </label>
        <select
          id="intention"
          value={intention}
          onChange={(e) => setIntention(e.target.value as Niyet)}
          className="w-full rounded-xl border border-white/10 bg-kuytu-black-elevated px-3 py-2.5 text-sm text-white focus:border-kuytu-gold/50 focus:outline-none"
        >
          {NIYET_OPTIONS.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      {/* Bio */}
      <div>
        <label
          htmlFor="bio"
          className="pb-2 block text-sm font-semibold text-white"
        >
          Hakkında
        </label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          maxLength={500}
          className="w-full resize-none rounded-xl border border-white/10 bg-kuytu-black-elevated px-3 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-kuytu-gold/50 focus:outline-none"
          placeholder="Kendinden kısaca bahset…"
        />
        <p className="pt-1 text-right text-[11px] text-white/40">
          {bio.length}/500
        </p>
      </div>

      {err && <p className="text-sm text-kuytu-pass">{err}</p>}

      <button
        type="button"
        onClick={save}
        disabled={!dirty || saving}
        className="flex items-center justify-center gap-2 rounded-full bg-kuytu-gold py-3 text-base font-semibold text-kuytu-black transition-opacity disabled:opacity-40"
      >
        {saving ? (
          <Loader2 size={18} className="animate-spin" />
        ) : saved ? (
          <>
            <Check size={18} /> Kaydedildi
          </>
        ) : (
          "Değişiklikleri Kaydet"
        )}
      </button>
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

  async function handleSwitch(id: string) {
    setSwitching(id);
    try {
      await switchAccount(id);
      // Reload so every screen picks up the new identity from the cookie.
      window.location.reload();
    } catch {
      setSwitching(null);
    }
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
        <WifiOff className="text-kuytu-pass" size={36} />
        <p className="max-w-xs text-sm text-white/60">{error}</p>
      </div>
    );
  }

  if (!me) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="animate-spin text-kuytu-gold" size={32} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 px-4 pb-8">
      {/* Identity header */}
      <div className="flex items-center gap-4 pt-2">
        <div
          className="h-20 w-20 shrink-0 rounded-full bg-cover bg-center ring-2 ring-kuytu-gold/40"
          style={{
            backgroundImage: me.photos[0] ? `url(${me.photos[0]})` : undefined,
          }}
        />
        <div>
          <h1 className="flex items-center gap-2 font-serif text-2xl font-semibold text-white">
            {me.name}, {me.age}
            {me.verified && <VerifiedBadge size={20} />}
          </h1>
          <p className="text-sm text-white/55">
            {me.gender === "kadın" ? "Kadın" : "Erkek"}
            {me.city ? ` · ${me.city}` : ""}
          </p>
        </div>
      </div>

      <AccountSwitcher
        accounts={accounts}
        onSwitch={handleSwitch}
        switching={switching}
      />

      <ProfileEditor me={me} onSaved={setMe} />
    </div>
  );
}
