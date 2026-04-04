import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { API_BASE_URL } from "@/lib/api";
import { SESSION_COOKIE_NAME } from "@/lib/session";

const noStoreJson = (body, init = {}) =>
  NextResponse.json(body, {
    ...init,
    headers: {
      "Cache-Control": "no-store, max-age=0",
      ...(init.headers || {}),
    },
  });

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return noStoreJson({ message: "Unauthorized" }, { status: 401 });
  }

  const response = await fetch(`${API_BASE_URL}/user/profile/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    cookieStore.delete(SESSION_COOKIE_NAME);
    return noStoreJson(
      { message: data?.message || "Unauthorized" },
      { status: response.status },
    );
  }

  return noStoreJson(data);
}
