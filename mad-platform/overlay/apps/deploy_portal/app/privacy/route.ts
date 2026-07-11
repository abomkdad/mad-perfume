import { NextRequest } from "next/server";
import { redirectToStaticPage } from "../static-page";

export function GET(request: NextRequest) {
  return redirectToStaticPage(request, "/privacy.html");
}
