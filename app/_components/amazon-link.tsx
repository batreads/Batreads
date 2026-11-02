"use client";

import { useEffect, useState, type ComponentProps } from "react";
import { localizeAmazonUrl } from "@/lib/amazon-marketplace";

let countryRequest: Promise<string | null> | undefined;

function visitorCountry() {
  // Share one request across all links and client-side navigations. No cookies,
  // external IP service or browser location permission are needed.
  return countryRequest ??= fetch("/api/visitor-country", { cache: "no-store" })
    .then(async (response) => {
      if (!response.ok) return null;
      const data = await response.json();
      return typeof data.country === "string" ? data.country : null;
    })
    .catch(() => null);
}

export function AmazonLink({ href, search, children, ...props }: Omit<ComponentProps<"a">, "href"> & {
  href: string;
  search: string;
}) {
  const [country, setCountry] = useState<string | null>(null);
  useEffect(() => {
    let mounted = true;
    visitorCountry().then((value) => { if (mounted) setCountry(value); });
    return () => { mounted = false; };
  }, []);

  // Keep a real external anchor so new tabs, keyboard navigation and GA4's
  // outbound-click measurement continue to work with the selected destination.
  const destination = localizeAmazonUrl(href, country, search);
  return <a {...props} href={destination}
    title={destination !== href ? `Buscar en ${new URL(destination).hostname}` : props.title}>
    {children}
  </a>;
}
