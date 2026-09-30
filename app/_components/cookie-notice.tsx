"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

// Change this version when GA4 is enabled so today's choice cannot authorize it.
const NOTICE_VERSION = "before-ga4-v1";
const PREFERENCE_COOKIE = "batreads_cookie_preference";
const PREFERENCE_MAX_AGE = 60 * 60 * 24 * 180;
export const OPEN_COOKIE_PREFERENCES = "batreads:open-cookie-preferences";

type CookieChoice = "accepted" | "rejected";
type SavedPreference = {
  choice: CookieChoice;
  date: string;
  version: string;
};

function hasCurrentPreference() {
  const value = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(`${PREFERENCE_COOKIE}=`))
    ?.slice(PREFERENCE_COOKIE.length + 1);

  if (!value) return false;

  try {
    const preference = JSON.parse(decodeURIComponent(value)) as SavedPreference;
    return (
      preference.version === NOTICE_VERSION &&
      (preference.choice === "accepted" || preference.choice === "rejected") &&
      Number.isFinite(Date.parse(preference.date))
    );
  } catch {
    return false;
  }
}

export function CookieNotice() {
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    setVisible(!hasCurrentPreference());
    setReady(true);

    function openPreferences() {
      setVisible(true);
      requestAnimationFrame(() => headingRef.current?.focus());
    }

    window.addEventListener(OPEN_COOKIE_PREFERENCES, openPreferences);
    return () => window.removeEventListener(OPEN_COOKIE_PREFERENCES, openPreferences);
  }, []);

  function save(choice: CookieChoice) {
    const preference: SavedPreference = {
      choice,
      date: new Date().toISOString(),
      version: NOTICE_VERSION,
    };
    const secure = location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${PREFERENCE_COOKIE}=${encodeURIComponent(JSON.stringify(preference))}; Path=/; Max-Age=${PREFERENCE_MAX_AGE}; SameSite=Lax${secure}`;
    setVisible(false);
  }

  if (!ready || !visible) return null;

  return (
    <section className="cookie-notice" aria-labelledby="cookie-notice-title">
      <div className="cookie-notice-inner">
        <div className="cookie-notice-copy">
          <h2 id="cookie-notice-title" ref={headingRef} tabIndex={-1}>Cookies en Batreads</h2>
          <p>
            Ahora no usamos cookies propias de analítica. Tenemos previsto incorporar Google Analytics 4.
            Tu elección de hoy solo guarda una preferencia; volveremos a preguntarte antes de activarlo.
            Consulta la <Link href="/politica-de-cookies">política de cookies</Link>.
          </p>
        </div>
        <div className="cookie-notice-actions">
          <button type="button" onClick={() => save("rejected")}>Rechazar</button>
          <button type="button" onClick={() => save("accepted")}>Aceptar</button>
        </div>
      </div>
    </section>
  );
}
