import { NextRequest, NextResponse } from "next/server";

const INFO_PAGES_VERSION = "20260711a";

export function redirectToStaticPage(
  request: NextRequest,
  pathname: "/privacy.html" | "/delete-account.html" | "/support.html",
) {
  const url = new URL(request.url);
  url.pathname = pathname;
  if (!url.searchParams.has("v")) {
    url.searchParams.set("v", INFO_PAGES_VERSION);
  }

  return NextResponse.redirect(url, 307);
}
