"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Loader2, Sparkles } from "lucide-react";
import { fetchMe, updateMe } from "@/lib/api";
import { computeCompletion } from "@/lib/completion";
import {
  ALCOHOL_OPTIONS,
  EDUCATION_OPTIONS,
  PETS_OPTIONS,
  SMOKING_OPTIONS,
  ZODIAC_SIGNS,
} from "@/lib/profileOptions";
import type { MeProfile, Niyet, ProfilePrompt } from "@/lib/types";
import { CompletionMeter } from "./CompletionMeter";
import { ChipSelect } from "./LifestyleChips";
import { PromptsEditor } from "./PromptsEditor";
import { PhotoManager } from "@/app/(app)/profile/PhotoManager";

const NIYET_OPTIONS: Niyet[] = [
  "Ciddi İlişki",
  "Uzun Vadeli",
  "Arkadaşlık",
  "Henüz Emin Değilim",
];

type Gender = "kadın" | "erkek";

function GenderToggle({
  value,
  onChange,
}: {
  value: Gender | null;
  onChange: (g: Gender) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {(["kadın", "erkek"] as Gender[]).map((g) => (
        <button
          key={g}
          type="button"
          onClick={() => onChange(g)}
          className={`rounded-xl border py-3 text-sm font-bold capitalize transition-colors ${
            value === g
              ? "border-kuytu-accent bg-kuytu-accent/15 text-kuytu-accent-deep"
              : "border-kuytu-border bg-kuytu-card text-kuytu-text/70"
          }`}
        >
          {g === "kadın" ? "Kadın" : "Erkek"}
        </button>
      ))}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block pb-2 text-sm font-bold text-kuytu-text">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-kuytu-border bg-kuytu-card px-3 py-2.5 text-sm text-kuytu-text placeholder:text-kuytu-muted focus:border-kuytu-accent focus:outline-none focus:ring-1 focus:ring-kuytu-accent/40";

export function Onboarding() {
  const router = useRouter();
  const [me, setMe] = useState<MeProfile | null>(null);
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1 (mandatory)
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<Gender | null>(null);
  const [targetGender, setTargetGender] = useState<Gender | null>(null);
  const [intention, setIntention] = useState<Niyet | null>(null);

  // Step 3 (optional)
  const [jobTitle, setJobTitle] = useState("");
  const [education, setEducation] = useState<string | null>(null);
  const [height, setHeight] = useState("");
  const [zodiac, setZodiac] = useState<string | null>(null);
  const [smoking, setSmoking] = useState<string | null>(null);
  const [alcohol, setAlcohol] = useState<string | null>(null);
  const [pets, setPets] = useState<string | null>(null);
  const [prompts, setPrompts] = useState<ProfilePrompt[]>([]);

  useEffect(() => {
    fetchMe()
      .then(({ me }) => {
        setMe(me);
        setName(me.name);
        setAge(String(me.age));
        setGender(me.gender);
        setTargetGender(me.targetGender);
        setIntention(me.intention);
        setJobTitle(me.jobTitle ?? "");
        setEducation(me.education);
        setHeight(me.height ? String(me.height) : "");
        setZodiac(me.zodiac);
        setSmoking(me.smoking);
        setAlcohol(me.alcohol);
        setPets(me.pets);
        setPrompts(me.prompts);
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  // Live completion preview from local state.
  const livePct = useMemo(
    () =>
      computeCompletion({
        photos: me?.photos ?? [],
        bio: me?.bio ?? "",
        jobTitle,
        education,
        height: height ? Number(height) : null,
        zodiac,
        smoking,
        alcohol,
        pets,
        interests: [],
        prompts,
      }),
    [me, jobTitle, education, height, zodiac, smoking, alcohol, pets, prompts],
  );

  const step1Valid =
    name.trim().length > 0 &&
    Number(age) >= 18 &&
    Number(age) <= 99 &&
    gender !== null &&
    targetGender !== null &&
    intention !== null;

  async function saveStep1() {
    if (!step1Valid) return;
    setSaving(true);
    setError(null);
    try {
      const next = await updateMe({
        name: name.trim(),
        age: Number(age),
        gender: gender!,
        targetGender: targetGender!,
        intention: intention!,
      });
      setMe(next);
      setStep(2);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kaydedilemedi");
    } finally {
      setSaving(false);
    }
  }

  async function finish() {
    setSaving(true);
    setError(null);
    try {
      await updateMe({
        jobTitle: jobTitle.trim() || null,
        education,
        height: height ? Number(height) : null,
        zodiac,
        smoking,
        alcohol,
        pets,
        prompts,
      });
      router.push("/discover");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kaydedilemedi");
      setSaving(false);
    }
  }

  if (!me) {
    return (
      <div className="flex flex-1 items-center justify-center">
        {error ? (
          <p className="px-8 text-center text-sm text-kuytu-muted">{error}</p>
        ) : (
          <Loader2 className="animate-spin text-kuytu-accent" size={32} />
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col px-5 pb-8">
      {/* Header */}
      <header className="pt-4">
        <div className="flex items-center gap-3">
          {step > 1 && (
            <button
              type="button"
              aria-label="Geri"
              onClick={() => setStep((s) => s - 1)}
              className="text-kuytu-text transition-colors hover:text-kuytu-accent"
            >
              <ChevronLeft size={24} />
            </button>
          )}
          <div className="flex flex-1 gap-1.5">
            {[1, 2, 3].map((s) => (
              <span
                key={s}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  s <= step ? "bg-kuytu-accent" : "bg-kuytu-bg-deep"
                }`}
              />
            ))}
          </div>
        </div>
        <div className="mt-4">
          <CompletionMeter value={livePct} compact />
        </div>
      </header>

      <div className="flex-1 pt-6">
        {step === 1 && (
          <div className="flex flex-col gap-5">
            <div>
              <h1 className="text-2xl font-extrabold text-kuytu-text">
                Hadi başlayalım
              </h1>
              <p className="mt-1 text-sm text-kuytu-muted">
                30 saniyede temel bilgilerini gir.
              </p>
            </div>
            <Field label="İsim">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Adın"
                className={inputCls}
              />
            </Field>
            <Field label="Yaş">
              <input
                value={age}
                onChange={(e) => setAge(e.target.value.replace(/\D/g, ""))}
                inputMode="numeric"
                placeholder="Yaşın"
                className={inputCls}
              />
            </Field>
            <Field label="Cinsiyet">
              <GenderToggle value={gender} onChange={setGender} />
            </Field>
            <Field label="Kiminle tanışmak istersin?">
              <GenderToggle value={targetGender} onChange={setTargetGender} />
            </Field>
            <Field label="Niyet">
              <ChipSelect
                options={NIYET_OPTIONS}
                value={intention}
                onChange={(v) => setIntention((v as Niyet) ?? intention)}
                allowClear={false}
              />
            </Field>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-kuytu-text">
                Bir fotoğraf ekle
              </h1>
              <p className="mt-1 text-sm text-kuytu-muted">
                İlk fotoğrafın ana profil fotoğrafın olur. İstersen bu adımı
                atlayabilirsin.
              </p>
            </div>
            <PhotoManager photos={me.photos} onPersisted={setMe} />
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-2xl font-extrabold text-kuytu-text">
                Profilini derinleştir
              </h1>
              <p className="mt-1 text-sm text-kuytu-muted">
                Opsiyonel — ama seni daha iyi anlatır.
              </p>
            </div>

            <Field label="Meslek">
              <input
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder='Örn: "Mimarlık"'
                className={inputCls}
              />
            </Field>
            <Field label="Boy (cm)">
              <input
                value={height}
                onChange={(e) => setHeight(e.target.value.replace(/\D/g, ""))}
                inputMode="numeric"
                placeholder="Örn: 172"
                className={inputCls}
              />
            </Field>
            <Field label="Eğitim">
              <ChipSelect
                options={EDUCATION_OPTIONS}
                value={education}
                onChange={setEducation}
              />
            </Field>
            <Field label="Burç">
              <ChipSelect
                options={ZODIAC_SIGNS}
                value={zodiac}
                onChange={setZodiac}
              />
            </Field>
            <Field label="Sigara">
              <ChipSelect
                options={SMOKING_OPTIONS}
                value={smoking}
                onChange={setSmoking}
              />
            </Field>
            <Field label="Alkol">
              <ChipSelect
                options={ALCOHOL_OPTIONS}
                value={alcohol}
                onChange={setAlcohol}
              />
            </Field>
            <Field label="Evcil Hayvan">
              <ChipSelect options={PETS_OPTIONS} value={pets} onChange={setPets} />
            </Field>
            <Field label="Buz kırıcı sorular">
              <PromptsEditor value={prompts} onChange={setPrompts} />
            </Field>
          </div>
        )}
      </div>

      {error && <p className="pb-2 text-sm text-kuytu-pass">{error}</p>}

      {/* Footer actions */}
      <div className="flex items-center gap-3 pt-4">
        {step > 1 && (
          <button
            type="button"
            onClick={() => (step === 3 ? finish() : setStep((s) => s + 1))}
            className="flex-1 rounded-full border border-kuytu-border py-3.5 text-sm font-bold text-kuytu-muted transition-colors hover:text-kuytu-text"
          >
            Atla
          </button>
        )}
        {step === 1 && (
          <button
            type="button"
            onClick={saveStep1}
            disabled={!step1Valid || saving}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-grad-gold py-3.5 text-base font-bold text-kuytu-text shadow-glow-gold transition-transform active:scale-[0.98] disabled:opacity-40 disabled:shadow-none"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : "Devam"}
          </button>
        )}
        {step === 2 && (
          <button
            type="button"
            onClick={() => setStep(3)}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-grad-gold py-3.5 text-base font-bold text-kuytu-text shadow-glow-gold transition-transform active:scale-[0.98]"
          >
            <Sparkles size={18} /> Profilini Derinleştir
          </button>
        )}
        {step === 3 && (
          <button
            type="button"
            onClick={finish}
            disabled={saving}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-grad-gold py-3.5 text-base font-bold text-kuytu-text shadow-glow-gold transition-transform active:scale-[0.98] disabled:opacity-40"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : "Tamamla"}
          </button>
        )}
      </div>
    </div>
  );
}
