export const GREETINGS = {
  morning: [
    "Good morning.",
    "Morning — fresh mind, hard problems.",
    "Early start. The Trove approves.",
    "Good morning. Add something worth keeping.",
  ],
  afternoon: [
    "Good afternoon.",
    "Back at it.",
    "Afternoon — a good time for a solve.",
    "Welcome back to your Trove.",
  ],
  evening: [
    "Good evening.",
    "Evening session — make it count.",
    "Good evening. One more, or call it here.",
    "The Trove kept everything safe.",
  ],
} as const;

function dayOfYear(d: Date): number {
  return Math.floor(
    (d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86_400_000,
  );
}

export function greeting(now: Date = new Date()): string {
  const h = now.getHours();
  const bucket =
    h < 12 ? GREETINGS.morning : h < 17 ? GREETINGS.afternoon : GREETINGS.evening;
  return bucket[dayOfYear(now) % bucket.length];
}
