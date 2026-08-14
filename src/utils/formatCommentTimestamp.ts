const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const TWO_HOURS_MS = 2 * HOUR_MS;

function isSameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isYesterday(date: Date, now: Date): boolean {
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  return isSameCalendarDay(date, yesterday);
}

/**
 * Formats a comment timestamp the way an Instagram-style feed would:
 * - < 1 min: "Just now"
 * - < 1 hour: "N min ago"
 * - <= 2 hours: "N hour(s) ago"
 * - same day, > 2 hours: device-locale clock time (e.g. "5:40 PM")
 * - yesterday: "Yesterday"
 * - older: device-locale date, in the viewer's own timezone
 */
export function formatCommentTimestamp(
  createdAt: Date | string | number,
  now: Date = new Date()
): string {
  const date = createdAt instanceof Date ? createdAt : new Date(createdAt);
  const diffMs = Math.max(0, now.getTime() - date.getTime());

  if (diffMs < MINUTE_MS) {
    return 'Just now';
  }

  if (diffMs < HOUR_MS) {
    const minutes = Math.floor(diffMs / MINUTE_MS);
    return `${minutes} min ago`;
  }

  if (diffMs <= TWO_HOURS_MS) {
    const hours = Math.round(diffMs / HOUR_MS);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }

  if (isSameCalendarDay(date, now)) {
    return new Intl.DateTimeFormat(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  }

  if (isYesterday(date, now)) {
    return 'Yesterday';
  }

  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}
