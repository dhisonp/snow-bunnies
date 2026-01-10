import { NextResponse } from "next/server";
import { getResortHistory } from "@/lib/services/open-meteo";
import resortsData from "@/lib/data/resorts.json";
import { type Resort } from "@/lib/types/resort";

const resorts = resortsData as Resort[];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const resortId = searchParams.get("resortId");
  const daysParam = searchParams.get("days") || "2";

  if (!resortId) {
    return NextResponse.json({ error: "Missing resortId" }, { status: 400 });
  }

  const resort = resorts.find((r) => r.id === resortId);
  if (!resort) {
    return NextResponse.json({ error: "Resort not found" }, { status: 404 });
  }

  const days = parseInt(daysParam, 10);
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - days);

  // End date is yesterday
  const endDate = new Date(today);
  endDate.setDate(today.getDate() - 1);

  const formatDate = (d: Date) => d.toISOString().split("T")[0];

  try {
    const history = await getResortHistory(
      resort.coordinates.lat,
      resort.coordinates.lon,
      formatDate(startDate),
      formatDate(endDate)
    );

    return NextResponse.json({ history });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch history" },
      { status: 500 }
    );
  }
}
