"use client";

import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useState,
  type ReactNode,
} from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  type MotionValue,
  type PanInfo,
} from "framer-motion";
import { Heart, X, Star, MapPin } from "lucide-react";
import type { Profile, SwipeAction } from "@/lib/types";
import {
  SWIPE_COMMIT_THRESHOLD,
  SUPER_LIKE_THRESHOLD,
  SWIPE_FLYOUT_DISTANCE,
} from "@/lib/constants";
import {
  CocukBadge,
  InterestChip,
  NiyetBadge,
  VerifiedBadge,
} from "./ProfileBadges";

/** Imperative handle so parent controls (buttons) can trigger a swipe. */
export interface SwipeCardHandle {
  swipe: (action: SwipeAction) => void;
}

interface SwipeCardProps {
  profile: Profile;
  /** Only the top card is interactive; stacked cards are inert + scaled down. */
  active: boolean;
  /** Depth in the stack (0 = top) — drives the peek/scale effect. */
  offset: number;
  onSwipe: (action: SwipeAction, profile: Profile) => void;
}

const actionToDirection: Record<SwipeAction, { x: number; y: number }> = {
  pass: { x: -SWIPE_FLYOUT_DISTANCE, y: 0 },
  like: { x: SWIPE_FLYOUT_DISTANCE, y: 0 },
  super: { x: 0, y: -SWIPE_FLYOUT_DISTANCE },
};

/** Colored overlay stamp shown while dragging (LIKE / NOPE / SÜPER). */
function Stamp({
  label,
  color,
  rotate,
  style,
}: {
  label: string;
  color: string;
  rotate: number;
  style: { opacity: MotionValue<number> };
}) {
  return (
    <motion.div
      style={style}
      className="pointer-events-none absolute top-8 z-20"
    >
      <span
        className="rounded-lg border-4 px-4 py-1.5 text-3xl font-extrabold uppercase tracking-widest"
        style={{ color, borderColor: color, transform: `rotate(${rotate}deg)` }}
      >
        {label}
      </span>
    </motion.div>
  );
}

export const SwipeCard = forwardRef<SwipeCardHandle, SwipeCardProps>(
  function SwipeCard({ profile, active, offset, onSwipe }, ref) {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const [leaving, setLeaving] = useState(false);
    const [photoIndex, setPhotoIndex] = useState(0);

    // Rotate the card slightly as it is dragged sideways.
    const rotate = useTransform(x, [-300, 0, 300], [-14, 0, 14]);

    // Overlay stamp opacities derived from drag position.
    const likeOpacity = useTransform(x, [20, 130], [0, 1]);
    const passOpacity = useTransform(x, [-20, -130], [0, 1]);
    const superOpacity = useTransform(y, [-40, -140], [0, 1]);

    const commit = useCallback(
      (action: SwipeAction) => {
        if (leaving) return;
        setLeaving(true);
        const target = actionToDirection[action];
        animate(x, target.x, { duration: 0.35, ease: "easeOut" });
        animate(y, target.y, {
          duration: 0.35,
          ease: "easeOut",
          onComplete: () => onSwipe(action, profile),
        });
      },
      [leaving, onSwipe, profile, x, y],
    );

    function handleDragEnd(_: unknown, info: PanInfo) {
      const { offset: o, velocity } = info;
      const flungUp =
        o.y < -SUPER_LIKE_THRESHOLD && Math.abs(o.y) > Math.abs(o.x);

      if (flungUp) {
        commit("super");
      } else if (o.x > SWIPE_COMMIT_THRESHOLD || velocity.x > 700) {
        commit("like");
      } else if (o.x < -SWIPE_COMMIT_THRESHOLD || velocity.x < -700) {
        commit("pass");
      } else {
        // Snap back to center.
        animate(x, 0, { type: "spring", stiffness: 500, damping: 40 });
        animate(y, 0, { type: "spring", stiffness: 500, damping: 40 });
      }
    }

    useImperativeHandle(ref, () => ({ swipe: commit }), [commit]);

    // Stacked cards sit slightly behind and below the active one.
    const stackScale = 1 - offset * 0.05;
    const stackTranslateY = offset * 14;

    function cyclePhoto(e: React.MouseEvent) {
      if (!active || profile.photos.length < 2) return;
      const bounds = e.currentTarget.getBoundingClientRect();
      const tappedRight = e.clientX - bounds.left > bounds.width / 2;
      setPhotoIndex((i) => {
        const n = profile.photos.length;
        return tappedRight ? (i + 1) % n : (i - 1 + n) % n;
      });
    }

    return (
      <motion.div
        className="absolute inset-0"
        style={{
          x,
          y,
          rotate: active ? rotate : 0,
          zIndex: 10 - offset,
        }}
        drag={active && !leaving}
        dragElastic={0.6}
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        onDragEnd={handleDragEnd}
        initial={false}
        animate={{
          scale: active ? 1 : stackScale,
          y: active ? 0 : stackTranslateY,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="relative h-full w-full select-none overflow-hidden rounded-[1.75rem] border border-white/[0.07] bg-kuytu-card shadow-card ring-1 ring-inset ring-white/[0.04]">
          {/* Photo (with a warm gradient fallback while it loads / if absent) */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-kuytu-rose-deep via-kuytu-card to-kuytu-bg-deep bg-cover bg-center"
            style={{ backgroundImage: `url(${profile.photos[photoIndex]})` }}
            onClick={cyclePhoto}
          />

          {/* Photo progress indicators */}
          {profile.photos.length > 1 && (
            <div className="absolute left-4 right-4 top-3 z-20 flex gap-1.5">
              {profile.photos.map((_, i) => (
                <span
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    i === photoIndex
                      ? "bg-kuytu-gold shadow-[0_0_8px_rgba(229,184,128,0.6)]"
                      : "bg-white/25"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Legibility gradient — warm, deep at the base so text pops. */}
          <div className="absolute inset-0 bg-gradient-to-t from-kuytu-bg-deep via-kuytu-bg-deep/35 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent" />

          {/* Drag stamps */}
          {active && (
            <>
              <Stamp
                label="Beğen"
                color="#5BBF97"
                rotate={-14}
                style={{ opacity: likeOpacity }}
              />
              <div className="absolute right-0 top-0">
                <Stamp
                  label="Geç"
                  color="#E57373"
                  rotate={14}
                  style={{ opacity: passOpacity }}
                />
              </div>
              <motion.div
                style={{ opacity: superOpacity }}
                className="pointer-events-none absolute inset-x-0 top-24 z-20 flex justify-center"
              >
                <span
                  className="flex items-center gap-2 rounded-xl border-4 px-4 py-1.5 text-2xl font-extrabold uppercase tracking-widest"
                  style={{ color: "#8AB4E8", borderColor: "#8AB4E8" }}
                >
                  <Star size={22} fill="#8AB4E8" /> Süper
                </span>
              </motion.div>
            </>
          )}

          {/* Profile content — frosted panel so text reads over any photo. */}
          <div className="absolute inset-x-0 bottom-0 z-10 p-3">
            <div className="flex flex-col gap-3 rounded-[1.4rem] border border-white/[0.08] bg-black/25 p-4 backdrop-blur-md">
              <div className="flex items-end justify-between gap-2">
                <div>
                  <h2 className="flex items-center gap-2 font-serif text-[1.9rem] font-semibold leading-tight text-kuytu-text">
                    {profile.name}
                    <span className="font-sans text-2xl font-light text-kuytu-text/75">
                      {profile.age}
                    </span>
                    {profile.verified && <VerifiedBadge size={22} />}
                  </h2>
                  <p className="mt-1 flex items-center gap-1 text-sm text-kuytu-text/70">
                    <MapPin size={13} className="text-kuytu-gold/80" />
                    {profile.location} · {profile.distanceKm} km
                  </p>
                </div>
              </div>

              {/* Structured badges */}
              <div className="flex flex-wrap gap-2">
                <NiyetBadge niyet={profile.niyet} />
                <CocukBadge durum={profile.cocukDurumu} />
              </div>

              {/* Bio prompt — a single highlighted prompt keeps the card calm. */}
              {profile.prompts[0] && (
                <div className="rounded-2xl border border-kuytu-gold/15 bg-kuytu-gold/[0.06] p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-kuytu-gold/80">
                    {profile.prompts[0].prompt}
                  </p>
                  <p className="mt-1 text-sm text-kuytu-text/90">
                    {profile.prompts[0].answer}
                  </p>
                </div>
              )}

              {/* Interests */}
              <div className="flex flex-wrap gap-1.5">
                {profile.interests.slice(0, 4).map((tag) => (
                  <InterestChip key={tag} label={tag} />
                ))}
              </div>
            </div>
          </div>

          {/* Decorative Pass/Like affordance icons implied by stamps above.
              Buttons live outside the card in ActionButtons. */}
          <Heart className="hidden" aria-hidden />
          <X className="hidden" aria-hidden />
        </div>
      </motion.div>
    );
  },
);
