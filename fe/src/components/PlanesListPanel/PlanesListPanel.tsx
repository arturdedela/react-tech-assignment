import type { PlaneBasic } from "../../types";
import { PlaneIcon } from "../PlaneIcon/PlaneIcon";

type PlanesListPanelProps = {
  planes: PlaneBasic[];
  selectedPlaneId: string | null;
  onPlaneSelect: (planeId: string) => void;
};

export const PlanesListPanel = ({
  planes,
  selectedPlaneId,
  onPlaneSelect,
}: PlanesListPanelProps) => {
  return (
    <section className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-white/15 bg-slate-950/80 shadow-xl backdrop-blur-sm">
      <header className="flex shrink-0 items-center justify-between border-b border-white/10 px-3 py-3">
        <h2 className="text-xs font-bold tracking-widest text-slate-400 uppercase">Aircraft</h2>
        <span className="rounded-md bg-white/5 px-2 py-0.5 text-xs font-semibold text-slate-300 tabular-nums">
          {planes.length}
        </span>
      </header>
      <ul className="min-h-0 space-y-2 overflow-y-auto overscroll-contain p-2 [scrollbar-color:#475569_transparent] [scrollbar-width:thin]">
        {planes.map((plane) => {
          const isSelected = plane.id === selectedPlaneId;

          return (
            <li key={plane.id}>
              <button
                type="button"
                onClick={() => onPlaneSelect(plane.id)}
                className={`flex w-full cursor-pointer items-center gap-2 rounded-lg border p-2 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300 motion-reduce:transition-none ${
                  isSelected
                    ? "border-sky-300/50 bg-sky-300/10 hover:bg-sky-300/15"
                    : "border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/10"
                }`}
              >
                <PlaneIcon color={plane.color} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="truncate text-xs font-semibold text-slate-100"
                      title={plane.id}
                    >
                      {plane.id}
                    </span>
                    {isSelected && (
                      <span className="text-[10px] font-medium text-sky-300">Selected</span>
                    )}
                  </div>
                  <div className="mt-1 flex justify-between gap-2 text-[10px] text-slate-400 tabular-nums">
                    <span title="Longitude" className="whitespace-nowrap">
                      {Math.abs(plane.longitude).toFixed(4)}° {plane.longitude < 0 ? "W" : "E"}
                    </span>
                    <span title="Latitude" className="whitespace-nowrap">
                      {Math.abs(plane.latitude).toFixed(4)}° {plane.latitude < 0 ? "S" : "N"}
                    </span>
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
      {planes.length === 0 && (
        <p className="px-4 pb-5 pt-2 text-center text-xs text-slate-400">No aircraft to display.</p>
      )}
    </section>
  );
};
