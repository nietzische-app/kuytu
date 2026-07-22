"use client";

import { useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Loader2,
  Star,
  Trash2,
} from "lucide-react";
import { updateMe } from "@/lib/api";
import { useUploadThing } from "@/lib/uploadthing";
import type { MeProfile } from "@/lib/types";

const MAX_SLOTS = 6;
const ACCEPT = "image/png,image/jpeg,image/jpg,image/webp";

interface PhotoManagerProps {
  photos: string[];
  /** Called after a successful persist so the parent can sync `me`. */
  onPersisted: (me: MeProfile) => void;
}

/**
 * Bumble-style 6-slot photo grid with Uploadthing uploads, delete, and
 * reordering. Every mutation is persisted to `photos[]` via `PATCH /api/me`
 * and synced back to the parent immediately.
 */
export function PhotoManager({ photos, onPersisted }: PhotoManagerProps) {
  const [items, setItems] = useState<string[]>(photos);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { startUpload, isUploading } = useUploadThing("profileImage", {
    onClientUploadComplete: (res) => {
      const urls = res.map((f) => f.serverData?.url ?? f.ufsUrl ?? f.url);
      persist([...items, ...urls].slice(0, MAX_SLOTS));
    },
    onUploadError: (e) => setError(e.message || "Yükleme başarısız oldu."),
  });

  /** Writes the new order/set to the DB and syncs the parent. */
  async function persist(next: string[]) {
    setItems(next);
    setSaving(true);
    setError(null);
    try {
      const me = await updateMe({ photos: next });
      onPersisted(me);
      setItems(me.photos);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  }

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = ""; // allow re-picking the same file
    const room = MAX_SLOTS - items.length;
    if (files.length === 0 || room <= 0) return;
    void startUpload(files.slice(0, room));
  }

  function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    void persist(next);
  }

  function remove(index: number) {
    void persist(items.filter((_, i) => i !== index));
  }

  const firstEmpty = items.length; // index of the first empty slot
  const busy = isUploading || saving;

  return (
    <section>
      <div className="flex items-center justify-between pb-2">
        <label className="text-sm font-bold text-kuytu-text">Fotoğraflar</label>
        <span className="flex items-center gap-1.5 text-xs text-kuytu-muted">
          {busy && <Loader2 size={13} className="animate-spin text-kuytu-accent" />}
          {items.length}/{MAX_SLOTS}
        </span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple
        hidden
        onChange={onPick}
      />

      <div className="grid grid-cols-3 gap-2.5">
        {Array.from({ length: MAX_SLOTS }).map((_, i) => {
          const url = items[i];

          // Filled slot
          if (url) {
            return (
              <div
                key={`${url}-${i}`}
                className="group relative aspect-[3/4] overflow-hidden rounded-2xl border border-kuytu-border bg-kuytu-bg-deep bg-cover bg-center shadow-soft"
                style={{ backgroundImage: `url(${url})` }}
              >
                {/* Primary badge on slot #1 ("Ana Profil Fotoğrafı") */}
                {i === 0 && (
                  <span
                    title="Ana Profil Fotoğrafı"
                    className="absolute left-1.5 top-1.5 z-10 inline-flex items-center gap-1 rounded-full bg-grad-gold px-2 py-0.5 text-[10px] font-bold text-kuytu-text shadow-glow-gold"
                  >
                    <Star size={10} fill="currentColor" /> Ana
                  </span>
                )}

                {/* Delete */}
                <button
                  type="button"
                  aria-label="Fotoğrafı kaldır"
                  onClick={() => remove(i)}
                  disabled={busy}
                  className="absolute right-1.5 top-1.5 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-md transition-colors hover:bg-kuytu-pass disabled:opacity-50"
                >
                  <Trash2 size={14} />
                </button>

                {/* Reorder arrows */}
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-black/55 to-transparent p-1.5">
                  <button
                    type="button"
                    aria-label="Sola taşı"
                    onClick={() => move(i, -1)}
                    disabled={i === 0 || busy}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-kuytu-text shadow-sm transition-opacity disabled:opacity-0"
                  >
                    <ChevronLeft size={16} strokeWidth={2.6} />
                  </button>
                  <button
                    type="button"
                    aria-label="Sağa taşı"
                    onClick={() => move(i, 1)}
                    disabled={i === items.length - 1 || busy}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-kuytu-text shadow-sm transition-opacity disabled:opacity-0"
                  >
                    <ChevronRight size={16} strokeWidth={2.6} />
                  </button>
                </div>
              </div>
            );
          }

          // First empty slot while uploading → spinner
          const showSpinner = isUploading && i === firstEmpty;

          // Empty slot
          return (
            <button
              key={`empty-${i}`}
              type="button"
              aria-label="Fotoğraf ekle"
              onClick={() => !busy && inputRef.current?.click()}
              disabled={busy}
              className="flex aspect-[3/4] items-center justify-center rounded-2xl border-2 border-dashed border-kuytu-border bg-kuytu-card-raised text-kuytu-muted transition-colors hover:border-kuytu-accent hover:text-kuytu-accent disabled:cursor-not-allowed"
            >
              {showSpinner ? (
                <Loader2 size={22} className="animate-spin text-kuytu-accent" />
              ) : (
                <ImagePlus size={22} />
              )}
            </button>
          );
        })}
      </div>

      <p className="pt-2 text-xs text-kuytu-muted">
        İlk fotoğraf profilinde ana fotoğraf olarak görünür. Sıralamak için okları
        kullan. (PNG/JPG/WEBP, maks. 4MB)
      </p>
      {error && <p className="pt-1 text-xs text-kuytu-pass">{error}</p>}
    </section>
  );
}
