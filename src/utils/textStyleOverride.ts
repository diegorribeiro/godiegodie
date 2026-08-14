import type { TextStyle } from 'react-native';
import type { TextStyleOverride } from '../types';

/**
 * Turns an optional { fontFamily?, fontSize? } override into style-array
 * entries, without ever including an explicit `undefined` value. RN's style
 * flattening does an Object.assign-like merge, so a spread `{ fontSize:
 * undefined }` would silently overwrite (and blank out) a component's own
 * default — this keeps that bug out of every call site that uses it.
 */
export function textStyleOverride(
  override?: Partial<TextStyleOverride>
): TextStyle[] {
  const style: TextStyle[] = [];

  if (override?.fontFamily != null) {
    style.push({ fontFamily: override.fontFamily });
  }
  if (override?.fontSize != null) {
    style.push({ fontSize: override.fontSize });
  }

  return style;
}
