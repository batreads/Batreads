import { NextResponse } from "next/server";
import { getLatestListPage } from "@/lib/notion";

export async function GET(request: Request) {
  const latest = await getLatestListPage();
  return NextResponse.redirect(new URL(latest?.path ?? "/listas", request.url));
}
