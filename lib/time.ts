/** Short Turkish relative timestamps for chat/list rows. */
export function formatRelativeTime(epochMs: number): string {
  const diff = Date.now() - epochMs;
  const min = Math.floor(diff / 60_000);

  if (min < 1) return "şimdi";
  if (min < 60) return `${min} dk`;

  const hours = Math.floor(min / 60);
  if (hours < 24) return `${hours} sa`;

  const days = Math.floor(hours / 24);
  if (days === 1) return "dün";
  if (days < 7) return `${days} gün`;

  return new Date(epochMs).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
  });
}

/** Clock time (HH:MM) for message bubbles. */
export function formatClock(epochMs: number): string {
  return new Date(epochMs).toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
