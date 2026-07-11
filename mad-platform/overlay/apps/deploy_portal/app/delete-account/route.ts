import { NextRequest } from "next/server";
import { redirectToStaticPage } from "../static-page";

export function GET(request: NextRequest) {
  return redirectToStaticPage(request, "/delete-account.html");
}
