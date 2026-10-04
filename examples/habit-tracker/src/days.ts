// A day is a local calendar date stored as text, for example "2026-10-04".
// It is fixed at the moment of the tap, so a done day stays done after travel.
export type Day = string;

const pad = (n: number) => String(n).padStart(2, '0');

export const localDay = (now: Date = new Date()): Day =>
  `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

// Day arithmetic runs in UTC so that daylight saving changes cannot skip or repeat a day.
export const previousDay = (day: Day): Day => {
  const [y, m, d] = day.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d - 1)).toISOString().slice(0, 10);
};

export const isDay = (value: unknown): value is Day => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
};

const daysBetween = (earlier: Day, later: Day): number => (Date.parse(later) - Date.parse(earlier)) / 86_400_000;

// A forgiven miss must be at least this many days from the next forgiven miss.
export const FORGIVE_EVERY = 7;

export type Streak = { count: number; forgiven: number };

// Done days in the current run, ending today. If today is not done yet, the run is
// counted from yesterday, so it does not read as broken before the day ends.
// A single missed day is bridged when the day before it was done and no other
// bridged miss lies within FORGIVE_EVERY days. Bridged days do not add to the count.
export const streak = (doneDays: ReadonlySet<Day>, today: Day): Streak => {
  let day = doneDays.has(today) ? today : previousDay(today);
  let count = 0;
  let forgiven = 0;
  let lastForgiven: Day | null = null;
  for (;;) {
    if (doneDays.has(day)) {
      count++;
    } else {
      const allowed = lastForgiven === null || daysBetween(day, lastForgiven) >= FORGIVE_EVERY;
      if (!allowed || !doneDays.has(previousDay(day))) break;
      forgiven++;
      lastForgiven = day;
    }
    day = previousDay(day);
  }
  // A bridge needs done days on both sides. With none after it, it is not a streak yet.
  return count === 0 ? { count: 0, forgiven: 0 } : { count, forgiven };
};
