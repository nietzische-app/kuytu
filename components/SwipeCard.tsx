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
import { VerifiedBadge } from "./ProfileBadges";

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
        <div className="flex h-full w-full select-none flex-col overflow-hidden rounded-[1.5rem] border border-kuytu-border bg-kuytu-card shadow-card">
          {/* Photo */}
          <div className="relative flex-1 overflow-hidden">
            <div
              className="absolute inset-0 bg-kuytu-bg-deep bg-cover bg-center"
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
                      i === photoIndex ? "bg-white" : "bg-white/40"
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Verified pill on the photo */}
            {profile.verified && (
              <div className="absolute left-3 top-3 z-20 flex items-center gap-1 rounded-full bg-black/45 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-md">
                <VerifiedBadge size={14} />
                Doğrulanmış
              </div>
            )}

            {/* Drag stamps */}
            {active && (
              <>
                <Stamp
                  label="Beğen"
                  color="#22B07D"
                  rotate={-14}
                  style={{ opacity: likeOpacity }}
                />
                <div className="absolute right-0 top-0">
                  <Stamp
                    label="Geç"
                    color="#F0576F"
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
                    style={{ color: "#3E90E0", borderColor: "#3E90E0" }}
                  >
                    <Star size={22} fill="#3E90E0" /> Süper
                  </span>
                </motion.div>
              </>
            )}
          </div>

          {/* White footer — name / age + like affordance (image_4 style) */}
          <div className="flex items-center justify-between gap-3 px-5 py-4">
            <div className="min-w-0">
              <h2 className="flex items-center gap-1.5 text-2xl font-extrabold leading-tight text-kuytu-text">
                <span className="truncate">{profile.name}</span>
                <span className="font-bold text-kuytu-text/80">
                  {profile.age}
                </span>
              </h2>
              <p className="mt-0.5 flex items-center gap-1 text-sm text-kuytu-muted">
                <MapPin size={13} className="text-kuytu-accent" />
                {profile.location} · {profile.distanceKm} km
              </p>
            </div>
            {active && (
              <button
                type="button"
                aria-label="Beğen"
                onClick={() => commit("like")}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-kuytu-border text-kuytu-accent transition-colors hover:border-kuytu-accent hover:bg-kuytu-accent/10"
              >
                <Heart size={22} strokeWidth={2.4} />
              </button>
            )}
          </div>
          <X className="hidden" aria-hidden />
        </div>
      </motion.div>
    );
  },
);
