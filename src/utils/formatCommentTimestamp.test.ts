import { describe, expect, it } from '@jest/globals';
import { formatCommentTimestamp } from './formatCommentTimestamp';

const NOW = new Date('2026-08-13T17:40:00');

describe('formatCommentTimestamp', () => {
  it('returns "Just now" for timestamps under a minute old', () => {
    expect(formatCommentTimestamp(new Date('2026-08-13T17:39:30'), NOW)).toBe(
      'Just now'
    );
  });

  it('returns "N min ago" for timestamps under an hour old', () => {
    expect(formatCommentTimestamp(new Date('2026-08-13T17:10:00'), NOW)).toBe(
      '30 min ago'
    );
  });

  it('returns "1 hour ago" (singular) at the one hour mark', () => {
    expect(formatCommentTimestamp(new Date('2026-08-13T16:40:00'), NOW)).toBe(
      '1 hour ago'
    );
  });

  it('returns "2 hours ago" (plural) at the two hour mark', () => {
    expect(formatCommentTimestamp(new Date('2026-08-13T15:40:00'), NOW)).toBe(
      '2 hours ago'
    );
  });

  it('returns a clock time for the same day beyond two hours', () => {
    expect(formatCommentTimestamp(new Date('2026-08-13T05:40:00'), NOW)).toBe(
      new Intl.DateTimeFormat(undefined, {
        hour: 'numeric',
        minute: '2-digit',
      }).format(new Date('2026-08-13T05:40:00'))
    );
  });

  it('returns "Yesterday" for a timestamp on the previous calendar day', () => {
    expect(formatCommentTimestamp(new Date('2026-08-12T23:59:00'), NOW)).toBe(
      'Yesterday'
    );
  });

  it('returns a localized date for anything older than yesterday', () => {
    const date = new Date('2026-08-01T10:00:00');
    expect(formatCommentTimestamp(date, NOW)).toBe(
      new Intl.DateTimeFormat(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(date)
    );
  });

  it('clamps future timestamps (clock skew) to "Just now" instead of going negative', () => {
    expect(formatCommentTimestamp(new Date('2026-08-13T17:45:00'), NOW)).toBe(
      'Just now'
    );
  });
});
