"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import {
  ICEBREAKER_QUESTIONS,
  MAX_PROMPTS,
} from "@/lib/profileOptions";
import type { ProfilePrompt } from "@/lib/types";

/**
 * Add / edit / remove up to three icebreaker prompt Q&As. Controlled: reports
 * the full list on every change.
 */
export function PromptsEditor({
  value,
  onChange,
}: {
  value: ProfilePrompt[];
  onChange: (next: ProfilePrompt[]) => void;
}) {
  const [picking, setPicking] = useState(false);

  const usedIds = new Set(value.map((p) => p.questionId));
  const available = ICEBREAKER_QUESTIONS.filter((q) => !usedIds.has(q.id));
  const canAdd = value.length < MAX_PROMPTS && available.length > 0;

  function addQuestion(id: string, text: string) {
    onChange([...value, { questionId: id, questionText: text, answerText: "" }]);
    setPicking(false);
  }

  function setAnswer(index: number, answerText: string) {
    onChange(value.map((p, i) => (i === index ? { ...p, answerText } : p)));
  }

  function remove(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-3">
      {value.map((p, i) => (
        <div
          key={p.questionId}
          className="rounded-b-2xl rounded-t-[1.5rem] border border-kuytu-border bg-kuytu-card-raised p-3.5"
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-bold text-kuytu-accent-deep">
              {p.questionText}
            </p>
            <button
              type="button"
              aria-label="Soruyu kaldır"
              onClick={() => remove(i)}
              className="shrink-0 text-kuytu-muted transition-colors hover:text-kuytu-pass"
            >
              <X size={16} />
            </button>
          </div>
          <textarea
            value={p.answerText}
            onChange={(e) => setAnswer(i, e.target.value)}
            rows={2}
            maxLength={300}
            placeholder="Cevabını yaz…"
            className="mt-2 w-full resize-none rounded-xl border border-kuytu-border bg-kuytu-card px-3 py-2 text-sm text-kuytu-text placeholder:text-kuytu-muted focus:border-kuytu-accent focus:outline-none focus:ring-1 focus:ring-kuytu-accent/40"
          />
        </div>
      ))}

      {canAdd && !picking && (
        <button
          type="button"
          onClick={() => setPicking(true)}
          className="flex items-center justify-center gap-2 rounded-full border border-dashed border-kuytu-accent/60 py-3 text-sm font-bold text-kuytu-accent-deep transition-colors hover:bg-kuytu-accent/5"
        >
          <Plus size={17} /> Soru ekle ({value.length}/{MAX_PROMPTS})
        </button>
      )}

      {picking && (
        <div className="flex flex-col gap-2 rounded-2xl border border-kuytu-border bg-kuytu-card p-3">
          <p className="pb-1 text-xs font-bold uppercase tracking-wide text-kuytu-muted">
            Bir soru seç
          </p>
          {available.map((q) => (
            <button
              key={q.id}
              type="button"
              onClick={() => addQuestion(q.id, q.text)}
              className="rounded-xl border border-kuytu-border px-3 py-2.5 text-left text-sm font-medium text-kuytu-text transition-colors hover:border-kuytu-accent hover:bg-kuytu-accent/5"
            >
              {q.text}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPicking(false)}
            className="pt-1 text-xs font-semibold text-kuytu-muted"
          >
            Vazgeç
          </button>
        </div>
      )}
    </div>
  );
}
