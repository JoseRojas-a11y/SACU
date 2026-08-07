/**
 * SACU Theme Abstraction
 * Centralized theme tokens based on catalog design palette
 */
export const theme = {
  colors: {
    primary: 'var(--theme-primary)', // #8300ca
    primaryHover: 'var(--theme-primary-hover)', // #901bcf
    primaryDark: 'var(--theme-primary-dark)', // #6e00aa
    accent: 'var(--theme-accent)', // #cc6dfe
    accentBright: 'var(--theme-accent-bright)', // #9b0be8
    purpleText: 'var(--theme-purple-text)', // #9539c7
    purpleGlow: 'var(--theme-purple-glow)', // rgba(204, 109, 254, 0.6)
    purpleBg: 'var(--theme-purple-bg)', // rgba(131, 0, 202, 0.08)

    darkBg: 'var(--theme-dark-bg)', // #1b0222
    textMain: 'var(--theme-text-main)', // #191c1e
    textSecondary: 'var(--theme-text-secondary)', // #5c647a
    textMuted: 'var(--theme-text-muted)', // #cbd5e1

    bgMain: 'var(--theme-bg-main)', // #f7f9fb
    surface: 'var(--theme-surface)', // #ffffff
    surfaceSubtle: 'var(--theme-surface-subtle)', // #f2f4f6

    border: 'var(--theme-border)', // #e2e8f0
    borderSubtle: 'var(--theme-border-subtle)', // #f1f5f9
    borderPurple: 'var(--theme-border-purple)', // rgba(185, 0, 202, 0.3)
  },
  fonts: {
    sans: 'var(--font-sans)',
    mono: 'var(--font-mono)',
  },
} as const

export type Theme = typeof theme
