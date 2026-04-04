import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS } from "@/lib/session";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);

  const response = NextResponse.json(
    { ok: true },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );

  response.cookies.set(SESSION_COOKIE_NAME, "", {
    ...SESSION_COOKIE_OPTIONS,
    expires: new Date(0),
    maxAge: 0,
  });

  return response;
}
