import "./StatusPanel.css";

export type StatusPanelStatus = "connecting" | "open" | "closed" | "error";

export interface StatusPanelConnection {
  label: string;
  status: StatusPanelStatus;
}

interface StatusPanelProps {
  connections?: StatusPanelConnection[];
}

const statusContent: Record<
  StatusPanelStatus,
  { className: "connecting" | "open" | "closed"; text: string }
> = {
  connecting: { className: "connecting", text: "Connecting" },
  open: { className: "open", text: "Connected" },
  closed: { className: "closed", text: "Disconnected" },
  error: { className: "closed", text: "Connection error" },
};

export const StatusPanel = ({
  connections = [{ label: "Aircraft positions", status: "connecting" }],
}: StatusPanelProps) => {
  return (
    <aside className="status-panel" aria-label="Data connection status">
      <div className="status-panel__header">Live connections</div>
      <div className="status-panel__connections">
        {connections.map(({ label, status }) => {
          const displayStatus = statusContent[status];

          return (
            <div className="status-panel__connection" key={label}>
              <span className="status-panel__label" title={label}>
                {label}
              </span>
              <div
                className={`status-panel__state status-panel__state--${displayStatus.className}`}
                role="status"
                aria-live="polite"
                aria-label={`${label}: ${displayStatus.text}`}
              >
                <span className="status-panel__indicator" aria-hidden="true" />
                <span>{displayStatus.text}</span>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};
