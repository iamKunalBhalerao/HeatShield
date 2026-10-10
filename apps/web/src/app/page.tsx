"use client";

import { useState } from "react";
import {
  MapPin,
  Sun,
  ThermometerSun,
  Droplets,
  Clock,
  ShieldCheck,
  LocateFixed,
  LoaderCircle,
  Wind,
} from "lucide-react";
import { assessHeat } from "@/lib/heat-safety";
import WorkerCheckin from "@/components/worker-checkin";

type Weather = {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    wind_speed_10m: number;
    time: string;
  };
  units: Record<string, string>;
  timezone: string;
};

export default function Home() {
  const [location, setLocation] = useState("Your location");
  const [weather, setWeather] = useState<Weather | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function loadWeather(latitude: number, longitude: number) {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `/api/weather?latitude=${latitude}&longitude=${longitude}`,
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to load weather.");
      }

      setWeather(data);
      setLocation(`${latitude.toFixed(3)}, ${longitude.toFixed(3)}`);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to load weather.",
      );
    } finally {
      setLoading(false);
    }
  }

  function detectLocation() {
    setMessage("");

    if (!navigator.geolocation) {
      setMessage("Location is unavailable. Please try another browser.");
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        void loadWeather(coords.latitude, coords.longitude);
      },
      () => {
        setLoading(false);
        setMessage(
          "Location permission was denied or unavailable. Allow location access and try again.",
        );
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000,
      },
    );
  }

  const current = weather?.current;
  const assessment = current ? assessHeat(current.apparent_temperature) : null;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-orange-100 p-2 text-orange-600">
              <Sun size={23} />
            </div>
            <span className="text-xl font-bold">HeatShield</span>
          </div>
          <span className="text-sm text-slate-500">Heat safety assistant</span>
        </div>
      </header>

      <div className="mx-auto max-w-5xl space-y-6 px-5 py-8">
        <section>
          <p className="text-sm font-semibold text-orange-600">
            PROTECT YOURSELF FROM EXTREME HEAT
          </p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            Know the heat.
            <br />
            Stay safer.
          </h1>
          <p className="mt-3 max-w-xl text-slate-600">
            Get local weather information and practical safety guidance before
            and during your outdoor shift.
          </p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <MapPin size={19} className="text-orange-600" />
            <h2 className="font-semibold">Your location</h2>
          </div>

          <p className="mt-2 text-sm text-slate-500">{location}</p>

          <button
            onClick={detectLocation}
            disabled={loading}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-60"
          >
            {loading ? (
              <LoaderCircle className="animate-spin" size={17} />
            ) : (
              <LocateFixed size={17} />
            )}
            {loading ? "Getting weather..." : "Use my current location"}
          </button>

          {message && (
            <p role="alert" className="mt-3 text-sm text-red-600">
              {message}
            </p>
          )}
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-orange-500 p-5 text-white shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm">Local heat conditions</span>
              <ThermometerSun size={23} />
            </div>

            <p className="mt-5 text-3xl font-bold">
              {current ? `${Math.round(current.apparent_temperature)}°C` : "--"}
            </p>

            <p className="mt-2 text-sm text-orange-50">
              {current
                ? `Air temperature: ${current.temperature_2m}°C`
                : "Detect your location to get started."}
            </p>

            {current && (
              <p className="mt-2 text-xs text-orange-50">
                Apparent temperature · {weather?.timezone}
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-emerald-600" size={22} />
              <h2 className="font-semibold">Heat-safety guidance</h2>
            </div>

            {assessment ? (
              <>
                <h3 className="mt-4 text-lg font-bold">{assessment.title}</h3>

                <p className="mt-2 text-sm text-slate-600">
                  {assessment.message}
                </p>

                <ul className="mt-4 space-y-3">
                  {assessment.actions.map((action) => (
                    <li key={action} className="flex gap-2 text-sm">
                      <ShieldCheck
                        size={18}
                        className="shrink-0 text-emerald-600"
                      />
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>

                <p className="mt-4 text-xs text-slate-500">
                  Preliminary guidance based on apparent temperature, not an
                  official heat warning.
                </p>
              </>
            ) : (
              <p className="mt-3 text-sm text-slate-600">
                Detect your location to receive weather-based guidance.
              </p>
            )}
          </div>
        </section>

        {current && (
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Metric
              icon={<ThermometerSun size={20} />}
              label="Air temperature"
              value={`${current.temperature_2m}°C`}
            />
            <Metric
              icon={<Droplets size={20} />}
              label="Humidity"
              value={`${current.relative_humidity_2m}%`}
            />
            <Metric
              icon={<Wind size={20} />}
              label="Wind speed"
              value={`${current.wind_speed_10m} km/h`}
            />
          </section>
        )}

        {current && weather && (
          <p className="text-xs text-slate-500">
            Weather time: {current.time} ({weather.timezone}). Forecast data may
            not reflect exact street-level conditions.
          </p>
        )}

        <WorkerCheckin />

        <footer className="pb-4 text-center text-xs text-slate-500">
          HeatShield provides safety guidance, not a medical diagnosis. Follow
          official warnings.
        </footer>
      </div>
    </main>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="text-orange-600">{icon}</div>
      <p className="mt-3 text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-bold">{value}</p>
    </div>
  );
}
