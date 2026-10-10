import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const latitude = Number(searchParams.get("latitude"));
  const longitude = Number(searchParams.get("longitude"));

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return NextResponse.json(
      { error: "Valid latitude and longitude are required." },
      { status: 400 },
    );
  }

  try {
    const params = new URLSearchParams({
      latitude: String(latitude),
      longitude: String(longitude),
      current:
        "temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m",
      timezone: "auto",
    });

    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?${params}`,
      { signal: AbortSignal.timeout(8000) },
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch weather data." },
        { status: 500 },
      );
    }
    const data = await response.json();
    return NextResponse.json({
      current: data.current,
      units: data.current_units,
      timezone: data.timezone,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred while fetching weather data." },
      { status: 500 },
    );
  }
}
