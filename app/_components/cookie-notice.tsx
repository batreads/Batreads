"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const NOTICE_VERSION = "ga4-v1";
const PREFERENCE_COOKIE = "batreads_cookie_preference";
const PREFERENCE_MAX_AGE = 60 * 60 * 24 * 180;
const GA_ID = "G-8JDPRM1WFL";
const ANALYTICS_HOST = "www.batreads.com";
export const OPEN_COOKIE_PREFERENCES = "batreads:open-cookie-preferences";

let analyticsStarted = false;

type CookieChoice = "accepted" | "rejected";
type SavedPreference = {
  choice: CookieChoice;
  date: string;
  version: string;
};

type AnalyticsWindow = Window & {
  dataLayer?: IArguments[];
  gtag?: (...args: unknown[]) => void;
};

function currentPreference(): SavedPreference | null {
  const value = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(`${PREFERENCE_COOKIE}=`))
    ?.slice(PREFERENCE_COOKIE.length + 1);

  if (!value) return null;

  try {
    const preference = JSON.parse(decodeURIComponent(value)) as SavedPreference;
    return (
      preference.version === NOTICE_VERSION &&
      (preference.choice === "accepted" || preference.choice === "rejected") &&
      Number.isFinite(Date.parse(preference.date))
    ) ? preference : null;
  } catch {
    return null;
  }
}

function startAnalytics() {
  if (analyticsStarted || location.hostname !== ANALYTICS_HOST) return;
  analyticsStarted = true;
  const analyticsWindow = window as AnalyticsWindow;

  analyticsWindow.dataLayer = analyticsWindow.dataLayer || [];
  analyticsWindow.gtag = function () {
    analyticsWindow.dataLayer?.push(arguments);
  };
  analyticsWindow.gtag("consent", "default", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  analyticsWindow.gtag("consent", "update", { analytics_storage: "granted" });
  analyticsWindow.gtag("js", new Date());
  analyticsWindow.gtag("config", GA_ID);

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);
}

function clearAnalyticsCookies() {
  const hostname = location.hostname;
  const domains = ["", `; Domain=${hostname}`];
  if (hostname === "batreads.com" || hostname.endsWith(".batreads.com")) {
    domains.push("; Domain=batreads.com");
  }

  for (const cookie of document.cookie.split("; ")) {
    const name = cookie.split("=")[0];
    if (!/^_ga(?:_|$)/.test(name)) continue;
    for (const domain of domains) {
      document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax${domain}`;
    }
  }
}

export function CookieNotice() {
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const preference = currentPreference();
    setVisible(!preference);
    setReady(true);
    if (preference?.choice === "accepted") startAnalytics();

    function openPreferences() {
      setVisible(true);
      requestAnimationFrame(() => headingRef.current?.focus());
    }

    window.addEventListener(OPEN_COOKIE_PREFERENCES, openPreferences);
    return () => window.removeEventListener(OPEN_COOKIE_PREFERENCES, openPreferences);
  }, []);

  function save(choice: CookieChoice) {
    const analyticsWasActive = analyticsStarted;
    const preference: SavedPreference = {
      choice,
      date: new Date().toISOString(),
      version: NOTICE_VERSION,
    };
    const secure = location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${PREFERENCE_COOKIE}=${encodeURIComponent(JSON.stringify(preference))}; Path=/; Max-Age=${PREFERENCE_MAX_AGE}; SameSite=Lax${secure}`;
    setVisible(false);
    if (choice === "accepted") startAnalytics();
    if (choice === "rejected") {
      if (analyticsWasActive) {
        (window as AnalyticsWindow).gtag?.("consent", "update", { analytics_storage: "denied" });
      }
      clearAnalyticsCookies();
      if (analyticsWasActive) location.reload();
    }
  }

  if (!ready || !visible) return null;

  return (
    <section className="cookie-notice" aria-labelledby="cookie-notice-title">
      <div className="cookie-notice-inner">
        <div className="cookie-notice-copy">
          <h2 id="cookie-notice-title" ref={headingRef} tabIndex={-1}>Cookies en Batreads</h2>
          <p>
            Solo si pulsas «Aceptar», Google Analytics 4 instalará cookies para medir las visitas
            y las páginas consultadas. Si pulsas «Rechazar», no cargaremos Analytics.
            Guardamos tu elección y puedes cambiarla desde el pie de página. Consulta la{" "}
            <Link href="/politica-de-cookies">política de cookies</Link>.
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
