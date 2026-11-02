const stores: Record<string, string> = {
  ES: "www.amazon.es", MX: "www.amazon.com.mx", US: "www.amazon.com",
  CA: "www.amazon.ca", BR: "www.amazon.com.br", GB: "www.amazon.co.uk",
  DE: "www.amazon.de", AT: "www.amazon.de", FR: "www.amazon.fr",
  IT: "www.amazon.it", PT: "www.amazon.es", IE: "www.amazon.ie",
  NL: "www.amazon.nl", BE: "www.amazon.com.be", SE: "www.amazon.se",
  PL: "www.amazon.pl", AU: "www.amazon.com.au", JP: "www.amazon.co.jp",
  IN: "www.amazon.in", SG: "www.amazon.sg", AE: "www.amazon.ae",
  SA: "www.amazon.sa", TR: "www.amazon.com.tr", EG: "www.amazon.eg",
};

// These countries have no local Amazon store. Amazon.com is a fallback,
// not a guarantee of shipping or Kindle availability in the visitor's country.
for (const country of ["AR", "BO", "CL", "CO", "CR", "CU", "DO", "EC", "SV", "GT", "HN", "NI", "PA", "PY", "PE", "PR", "UY", "VE"]) {
  stores[country] = "www.amazon.com";
}

export function localizeAmazonUrl(href: string, country: string | null, search: string): string {
  const host = country ? stores[country.toUpperCase()] : undefined;
  if (!host || !search.trim()) return href;
  let original: URL;
  try {
    original = new URL(href);
  } catch {
    return href;
  }
  const hostname = original.hostname.replace(/^www\./, "");
  const amazonHosts = new Set(Object.values(stores).map((store) => store.replace(/^www\./, "")));
  if (!amazonHosts.has(hostname) && hostname !== "amzn.to") return href;
  if (hostname === host.replace(/^www\./, "")) return href;

  // ASINs, author IDs and affiliate tags cannot safely be copied across stores.
  const destination = new URL(`https://${host}/s`);
  destination.searchParams.set("k", search.trim());
  destination.searchParams.set("i", "stripbooks");
  return destination.toString();
}
