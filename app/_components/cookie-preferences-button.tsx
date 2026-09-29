"use client";

import { OPEN_COOKIE_PREFERENCES } from "./cookie-notice";

export function CookiePreferencesButton() {
  return (
    <button
      className="site-footer-preferences"
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_COOKIE_PREFERENCES))}
    >
      Cambiar preferencias de cookies
    </button>
  );
}
