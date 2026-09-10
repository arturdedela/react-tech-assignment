import type { PlaneDetailed } from "../../types";
import "./DetailsPopup.css";

type DetailsPopupProps = {
  planeDetails: PlaneDetailed;
};

const statusLabels: Record<PlaneDetailed["status"], string> = {
  departed: "Departed",
  enroute: "En route",
  cruising: "Cruising",
  landing: "Landing",
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

export function DetailsPopup({ planeDetails }: DetailsPopupProps) {
  console.log({ planeDetails });
  const plane = planeDetails;
  const duration = Math.max(0, Math.floor(plane.flightDuration));
  const occupancy =
    plane.maxPassengers > 0
      ? Math.min(100, Math.max(0, (plane.numberOfPassengers / plane.maxPassengers) * 100))
      : 0;
  const heading = ((Math.round(plane.heading) % 360) + 360) % 360;
  const verticalSpeed = Math.round(plane.verticalSpeed * 10) / 10;

  return (
    <div className="details-popup">
      <header className="details-popup__header">
        <div className="details-popup__identity">
          <span className="details-popup__plane-mark" style={{ color: plane.color }}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z" />
            </svg>
          </span>
          <div>
            <h2>{plane.flightNumber}</h2>
            <p>{plane.airline}</p>
          </div>
        </div>
        <span className={`details-popup__status details-popup__status--${plane.status}`}>
          <span />
          {statusLabels[plane.status]}
        </span>
      </header>

      <section className="details-popup__route">
        <div>
          <span className="details-popup__label">From</span>
          <strong>{plane.origin.airport}</strong>
          <span className="details-popup__city">{plane.origin.city}</span>
        </div>
        <span className="details-popup__route-line">→</span>
        <div>
          <span className="details-popup__label">To</span>
          <strong>{plane.destination.airport}</strong>
          <span className="details-popup__city">{plane.destination.city}</span>
        </div>
      </section>

      <dl className="details-popup__timing">
        <div>
          <dt>Flight duration</dt>
          <dd>
            {Math.floor(duration / 60)}h {duration % 60}m
          </dd>
        </div>
        <div>
          <dt>Estimated arrival · UTC</dt>
          <dd>{arrivalFormat.format(plane.estimatedArrival)}</dd>
        </div>
      </dl>

      <dl className="details-popup__telemetry">
        <div>
          <dt>Altitude</dt>
          <dd>
            {integerFormat.format(plane.altitude)} <span>m</span>
          </dd>
        </div>
        <div>
          <dt>Speed</dt>
          <dd>
            {integerFormat.format(plane.speed)} <span>m/s</span>
          </dd>
        </div>
        <div>
          <dt>Heading</dt>
          <dd>{heading}°</dd>
        </div>
        <div>
          <dt>Vertical speed</dt>
          <dd>
            {verticalSpeed > 0 ? "+" : ""}
            {verticalSpeed.toFixed(1)} <span>m/s</span>
          </dd>
        </div>
      </dl>

      <dl className="details-popup__facts">
        <div>
          <dt>Aircraft</dt>
          <dd>{plane.model}</dd>
        </div>
        <div>
          <dt>Registration</dt>
          <dd>{plane.registration}</dd>
        </div>
        <div>
          <dt>Latitude</dt>
          <dd>
            {Math.abs(plane.latitude).toFixed(4)}° {plane.latitude < 0 ? "S" : "N"}
          </dd>
        </div>
        <div>
          <dt>Longitude</dt>
          <dd>
            {Math.abs(plane.longitude).toFixed(4)}° {plane.longitude < 0 ? "W" : "E"}
          </dd>
        </div>
      </dl>

      <section className="details-popup__passengers">
        <div>
          <span className="details-popup__label">Passengers</span>
          <span>
            <strong>{integerFormat.format(plane.numberOfPassengers)}</strong> /{" "}
            {integerFormat.format(plane.maxPassengers)}
          </span>
        </div>
        <meter min={0} max={100} value={occupancy}>
          {Math.round(occupancy)}%
        </meter>
      </section>

      <footer className="details-popup__footer">
        <span>Aircraft ID</span>
        <span>{plane.id}</span>
      </footer>
    </div>
  );
}
