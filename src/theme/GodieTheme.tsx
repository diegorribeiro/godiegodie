import { createContext, useContext } from 'react';

export type GodieTheme = {
  backgroundColor: string;
  /** Simple black/light-or-white split for now — see docs/ARCHITECTURE.md. */
  textColor: string;
  isDark: boolean;
};

export const DEFAULT_LIGHT_BACKGROUND = '#ffffff';
/** Matches Instagram's own dark-mode background. */
export const DEFAULT_DARK_BACKGROUND = '#000000';

const DEFAULT_THEME: GodieTheme = {
  backgroundColor: DEFAULT_LIGHT_BACKGROUND,
  textColor: '#000000',
  isDark: false,
};

export const GodieThemeContext = createContext<GodieTheme>(DEFAULT_THEME);

/** Internal — components read colors from here instead of each computing their own. */
export function useGodieTheme(): GodieTheme {
  return useContext(GodieThemeContext);
}
