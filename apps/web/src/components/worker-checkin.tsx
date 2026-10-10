"use client";

import { useEffect, useState } from "react";
import { CheckCircle, Droplets, HeartHandshake, Clock } from "lucide-react";

type Checkin = {
  id: string;
  waterAvailable: boolean;
  restTaken: boolean;
  needsHelp: boolean;
  createdAt: string;
};

const STORAGE_KEY = "heatshield-checkins";

export default function WorkerCheckin() {
  const [waterAvailable, setWaterAvailable] = useState(true);
  const [restTaken, setRestTaken] = useState(false);
  const [needsHelp, setNeedsHelp] = useState(false);
  const [records, setRecords] = useState<Checkin[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setRecords(JSON.parse(stored) as Checkin[]);
    } catch {
      setRecords([]);
    }
  }, []);

  function submitCheckin() {
    const record: Checkin = {
      id: crypto.randomUUID(),
      waterAvailable,
      restTaken,
      needsHelp,
      createdAt: new Date().toISOString(),
    };
    const updated = [record, ...records];
    setRecords(updated);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setSaved(true);
    } catch {
      setSaved(false);
    }
  }

  const helpCount = records.filter((r) => r.needsHelp).length;
  const restCount = records.filter((r) => r.restTaken).length;
  const waterCount = records.filter((r) => r.waterAvailable).length;

  return (
    <>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <HeartHandshake className="text-orange-600" size={22} />
          <h2 className="text-lg font-bold">Worker safety check-in</h2>
        </div>

        <p className="mt-2 text-sm text-slate-600">
          Record your current safety conditions. This demo saves records in this
          browser only; it does not alert an employer or emergency service.
        </p>

        <div className="mt-5 space-y-4">
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={waterAvailable}
              onChange={(e) => setWaterAvailable(e.target.checked)}
              className="size-4 accent-orange-600"
            />
            Drinking water is available
          </label>

          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={restTaken}
              onChange={(e) => setRestTaken(e.target.checked)}
              className="size-4 accent-orange-600"
            />
            I have taken a rest break
          </label>

          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={needsHelp}
              onChange={(e) => setNeedsHelp(e.target.checked)}
              className="size-4 accent-orange-600"
            />
            I need assistance
          </label>

          <button
            onClick={submitCheckin}
            className="w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white hover:bg-slate-700"
          >
            Submit safety check-in
          </button>

          {saved && (
            <p
              role="status"
              className="flex items-center gap-2 text-sm text-emerald-700"
            >
              <CheckCircle size={17} />
              Check-in saved successfully.
            </p>
          )}
        </div>

        <div className="mt-6 border-t border-slate-200 pt-5">
          <h3 className="font-semibold">Check-in metrics</h3>

          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Metric label="Total check-ins" value={records.length} />
            <Metric label="Water available" value={waterCount} />
            <Metric label="Rest taken" value={restCount} />
            <Metric label="Need assistance" value={helpCount} />
          </div>

          <p className="mt-3 flex items-center gap-1 text-xs text-slate-500">
            <Clock size={13} />
            Counts are local to this browser and can include repeat submissions.
          </p>
        </div>
      </section>
    </>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}
