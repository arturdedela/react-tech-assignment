export type StatusPanelStatus = "connecting" | "open" | "closed" | "error";

export interface StatusPanelConnection {
  label: string;
  status: StatusPanelStatus;
}

interface StatusPanelProps {
  connections?: StatusPanelConnection[];
}

const statusContent: Record<StatusPanelStatus, { className: string; text: string }> = {
  connecting: { className: "text-amber-400", text: "Connecting" },
  open: { className: "text-green-400", text: "Connected" },
  closed: { className: "text-red-400", text: "Disconnected" },
  error: { className: "text-red-400", text: "Connection error" },
};

export const StatusPanel = ({
  connections = [{ label: "Aircraft positions", status: "connecting" }],
}: StatusPanelProps) => {
  return (
    <aside
      className="shrink-0 overflow-hidden rounded-xl border border-white/15 bg-slate-950/80 p-3 pb-2 shadow-xl backdrop-blur-sm"
      aria-label="Data connection status"
    >
      <div className="text-xs font-bold tracking-widest text-slate-400 uppercase">
        Live connections
      </div>
      <div className="mt-1 divide-y divide-white/10">
        {connections.map(({ label, status }) => {
          const displayStatus = statusContent[status];

          return (
            <div className="flex min-h-7 items-center gap-4" key={label}>
              <span
                className="min-w-0 flex-1 truncate text-xs font-medium text-slate-200"
                title={label}
              >
                {label}
              </span>
              <div
                className={`flex shrink-0 items-center gap-2 text-xs font-semibold ${displayStatus.className}`}
                role="status"
                aria-live="polite"
                aria-label={`${label}: ${displayStatus.text}`}
              >
                <span
                  className="relative size-2 shrink-0 rounded-full bg-current"
                  aria-hidden="true"
                >
                  {(status === "connecting" || status === "open") && (
                    <span className="absolute inset-0 animate-ping rounded-full bg-current opacity-75 motion-reduce:animate-none" />
                  )}
                </span>
                <span>{displayStatus.text}</span>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};
