import { describe, expect, it } from '@jest/globals';
import { textStyleOverride } from './textStyleOverride';

describe('textStyleOverride', () => {
  it('returns an empty array when no override is given', () => {
    expect(textStyleOverride(undefined)).toEqual([]);
  });

  it('returns an empty array for an override with no set fields', () => {
    expect(textStyleOverride({})).toEqual([]);
  });

  it('includes only fontFamily when only fontFamily is set', () => {
    expect(textStyleOverride({ fontFamily: 'Poppins' })).toEqual([
      { fontFamily: 'Poppins' },
    ]);
  });

  it('includes only fontSize when only fontSize is set', () => {
    expect(textStyleOverride({ fontSize: 20 })).toEqual([{ fontSize: 20 }]);
  });

  it('includes both when both are set', () => {
    expect(textStyleOverride({ fontFamily: 'Poppins', fontSize: 20 })).toEqual([
      { fontFamily: 'Poppins' },
      { fontSize: 20 },
    ]);
  });

  it('never emits an explicit undefined value for either field', () => {
    for (const entry of textStyleOverride({
      fontFamily: undefined,
      fontSize: undefined,
    })) {
      expect(Object.values(entry)).not.toContain(undefined);
    }
  });
});
