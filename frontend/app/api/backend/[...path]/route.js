import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { API_BASE_URL } from "@/lib/api";
import { SESSION_COOKIE_NAME } from "@/lib/session";

const forwardRequest = async (request, { params }) => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const resolvedParams = await params;
  const pathSegments = resolvedParams?.path;

  if (!Array.isArray(pathSegments) || pathSegments.length === 0) {
    return NextResponse.json({ message: "Invalid backend path" }, { status: 400 });
  }

  const path = pathSegments.join("/");
  const url = `${API_BASE_URL}/${path}${request.nextUrl.search}`;
  const init = {
    method: request.method,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    const body = await request.arrayBuffer();
    init.body = body.byteLength > 0 ? body : undefined;
    const contentType = request.headers.get("content-type");
    if (contentType) {
      init.headers["Content-Type"] = contentType;
    }
  }

  const response = await fetch(url, init);
  const text = await response.text();

  return new NextResponse(text, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("content-type") || "application/json",
    },
  });
};

export const GET = forwardRequest;
export const POST = forwardRequest;
export const PUT = forwardRequest;
export const DELETE = forwardRequest;
