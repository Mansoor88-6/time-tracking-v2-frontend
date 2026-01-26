import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page") || "1";
  const limit = searchParams.get("limit") || "10";
  const search = searchParams.get("search") || "";
  const sortBy = searchParams.get("sortBy") || "user_id";
  const sortOrder = searchParams.get("sortOrder") || "ASC";

  try {
    const res = await fetch(
      `${BASE_URL}/users?page=${encodeURIComponent(
        page
      )}&limit=${encodeURIComponent(limit)}&search=${encodeURIComponent(
        search
      )}&sortBy=${encodeURIComponent(sortBy)}&sortOrder=${encodeURIComponent(
        sortOrder
      )}`,
      { headers: { "Content-Type": "application/json" } }
    );
    if (!res.ok) throw new Error("Failed to fetch data");

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Unable to fetch data" },
      { status: 500 }
    );
  }
}
