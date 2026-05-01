/**
 * Shared utilities used by landing.js, country.js, and the future map.
 * Exposed as a single global `RS` namespace.
 */
window.RS = {
  /**
   * Format an ISO date (YYYY-MM-DD) as e.g. "April 2026".
   * Returns the input unchanged if it can't be parsed.
   */
  formatDate(iso) {
    if (!iso) return '';
    const m = String(iso).match(/^(\d{4})-(\d{2})/);
    if (!m) return iso;
    const months = ['January','February','March','April','May','June',
                    'July','August','September','October','November','December'];
    return `${months[parseInt(m[2], 10) - 1]} ${m[1]}`;
  },

  /** Human label for a region key. */
  regionLabel(region) {
    if (region === 'mideast') return 'Middle East';
    if (region === 'africa')  return 'Africa';
    if (region === 'eurasia') return 'Eurasia';
    return region || '';
  }
};
