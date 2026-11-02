/* Theme flow: follow the device's light/dark setting until the visitor toggles. A toggle to the opposite of
   the device is saved; toggling back to match the device clears it, so the site follows the device again.
   The first-paint script in app/layout.tsx applies the same rule and tracks device changes live. */
export type Theme = 'light' | 'dark'

export const systemTheme = (): Theme => (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')

export function chooseTheme(next: Theme) {
  document.documentElement.setAttribute('data-theme', next)
  try {
    if (next === systemTheme()) localStorage.removeItem('theme')
    else localStorage.setItem('theme', next)
  } catch { /* Without storage the choice still applies for this visit. */ }
}
