export function GET(request: Request) {
  const value = request.headers.get("x-vercel-ip-country")
    ?? (process.env.NODE_ENV === "development" ? process.env.AMAZON_DEV_COUNTRY : undefined);
  const country = value && /^[A-Z]{2}$/i.test(value) ? value.toUpperCase() : null;
  return Response.json({ country }, {
    headers: { "Cache-Control": "private, no-store", "Vary": "x-vercel-ip-country" },
  });
}
