/** Load non-critical font subsets after first paint. */
export function loadDeferredFonts(): void {
  const run = () => {
    void import('@fontsource/space-grotesk/latin-ext-700.css');
    void import('@fontsource/space-grotesk/latin-500.css');
    void import('@fontsource/space-grotesk/latin-600.css');
    void import('@fontsource/space-grotesk/latin-ext-500.css');
    void import('@fontsource/space-grotesk/latin-ext-600.css');
  };

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(run, { timeout: 2000 });
  } else {
    setTimeout(run, 1);
  }
}
