import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { API_BASE_URL } from "@/lib/api";
import { SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS } from "@/lib/session";

const fetchProfile = async (token) => {
  const response = await fetch(`${API_BASE_URL}/user/profile/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.message || "Unable to load profile");
  }

  return data;
};

const noStoreJson = (body, init = {}) =>
  NextResponse.json(body, {
    ...init,
    headers: {
      "Cache-Control": "no-store, max-age=0",
      ...(init.headers || {}),
    },
  });

export async function POST(request) {
  const body = await request.json();
  const payload = {
    ...body,
    role: "student",
  };
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    return noStoreJson(
      { message: data?.message || "Registration failed" },
      { status: response.status },
    );
  }

  const token = data?.token;

  if (!token) {
    return noStoreJson({ message: "Registration token missing" }, { status: 500 });
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, SESSION_COOKIE_OPTIONS);

  const profile = await fetchProfile(token);

  return noStoreJson({ user: profile });
}
