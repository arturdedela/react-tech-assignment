import type { PlaneDetailed } from "../../types";
import "./DetailsPopup.css";

type DetailsPopupProps = {
  planeDetails: PlaneDetailed;
};

const statusContent: Record<PlaneDetailed["status"], { label: string; className: string }> = {
  departed: { label: "Departed", className: "text-violet-300" },
  enroute: { label: "En route", className: "text-sky-300" },
  cruising: { label: "Cruising", className: "text-emerald-300" },
  landing: { label: "Landing", className: "text-amber-300" },
};

const integerFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const arrivalFormat = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
  timeZone: "UTC",
});

export function DetailsPopup({ planeDetails: plane }: DetailsPopupProps) {
  const duration = Math.max(0, Math.floor(plane.flightDuration));
  const occupancy =
    plane.maxPassengers > 0
      ? Math.min(100, Math.max(0, (plane.numberOfPassengers / plane.maxPassengers) * 100))
      : 0;
  const heading = ((Math.round(plane.heading) % 360) + 360) % 360;
  const verticalSpeed = Math.round(plane.verticalSpeed * 10) / 10;
  const status = statusContent[plane.status];
  const telemetry = [
    { label: "Altitude", value: integerFormat.format(plane.altitude), unit: "m" },
    { label: "Speed", value: integerFormat.format(plane.speed), unit: "m/s" },
    { label: "Heading", value: `${heading}°` },
    {
      label: "Vertical speed",
      value: `${verticalSpeed > 0 ? "+" : ""}${verticalSpeed.toFixed(1)}`,
      unit: "m/s",
    },
  ];
  const facts = [
    { label: "Aircraft", value: plane.model },
    { label: "Registration", value: plane.registration },
    {
      label: "Latitude",
      value: `${Math.abs(plane.latitude).toFixed(4)}° ${plane.latitude < 0 ? "S" : "N"}`,
    },
    {
      label: "Longitude",
      value: `${Math.abs(plane.longitude).toFixed(4)}° ${plane.longitude < 0 ? "W" : "E"}`,
    },
  ];

  return (
    <div className="w-80 max-w-full overflow-y-auto overscroll-contain rounded-xl p-4 text-xs leading-normal wrap-anywhere text-slate-200">
      <header className="flex flex-wrap items-center gap-2.5">
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <span
            className="grid size-9 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/5"
            style={{ color: plane.color }}
          >
            <svg
              className="size-6 rotate-45"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z" />
            </svg>
          </span>
          <div className="min-w-0">
            <h2 className="text-xl font-semibold leading-tight tracking-tight text-slate-50">
              {plane.flightNumber}
            </h2>
            <p className="mt-1 text-slate-400">{plane.airline}</p>
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-1 rounded-full border border-current px-2 py-1 font-semibold whitespace-nowrap ${status.className}`}
        >
          <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
          {status.label}
        </span>
      </header>

      <section className="mt-5 flex items-center gap-3">
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="font-medium text-slate-400">From</span>
          <strong className="text-3xl font-semibold tracking-tight text-slate-50">
            {plane.origin.airport}
          </strong>
          <span className="text-slate-300">{plane.origin.city}</span>
        </div>
        <span className="text-3xl text-slate-500" aria-hidden="true">
          →
        </span>
        <div className="flex min-w-0 flex-1 flex-col text-right">
          <span className="font-medium text-slate-400">To</span>
          <strong className="text-3xl font-semibold tracking-tight text-slate-50">
            {plane.destination.airport}
          </strong>
          <span className="text-slate-300">{plane.destination.city}</span>
        </div>
      </section>

      <dl className="my-4 grid grid-cols-2 gap-3">
        <div>
          <dt className="font-medium text-slate-400">Flight duration</dt>
          <dd className="mt-1 font-semibold">
            {Math.floor(duration / 60)}h {duration % 60}m
          </dd>
        </div>
        <div className="text-right">
          <dt className="font-medium text-slate-400">Estimated arrival · UTC</dt>
          <dd className="mt-1 font-semibold">{arrivalFormat.format(plane.estimatedArrival)}</dd>
        </div>
      </dl>

      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-white/10 bg-white/10">
        {telemetry.map(({ label, value, unit }) => (
          <div className="bg-slate-950/60 px-3 py-2.5" key={label}>
            <dt className="font-medium text-slate-400">{label}</dt>
            <dd className="mt-1 text-lg font-semibold text-slate-50">
              {value}
              {unit && <span className="text-xs font-normal text-slate-400"> {unit}</span>}
            </dd>
          </div>
        ))}
      </dl>

      <dl className="mt-4 grid gap-2">
        {facts.map(({ label, value }) => (
          <div className="flex items-baseline justify-between gap-3" key={label}>
            <dt className="shrink-0 font-medium text-slate-400">{label}</dt>
            <dd className="min-w-0 text-right">{value}</dd>
          </div>
        ))}
      </dl>

      <section className="mt-4 border-t border-white/10 pt-3">
        <div className="flex justify-between gap-3 text-slate-400">
          <span className="font-medium">Passengers</span>
          <span>
            <strong className="font-semibold text-slate-200">
              {integerFormat.format(plane.numberOfPassengers)}
            </strong>{" "}
            / {integerFormat.format(plane.maxPassengers)}
          </span>
        </div>
        <meter
          className="passenger-meter mt-2 block h-1.5 w-full appearance-none overflow-hidden rounded-sm border-0 bg-white/10"
          min={0}
          max={100}
          value={occupancy}
          aria-label="Passenger occupancy"
        >
          {Math.round(occupancy)}%
        </meter>
      </section>

      <footer className="mt-4 flex justify-between gap-3 text-slate-400">
        <span>Aircraft ID</span>
        <span>{plane.id}</span>
      </footer>
    </div>
  );
}
