import { useState, type ReactNode } from "react";

type SidebarProps = {
  children: ReactNode;
};

export const Sidebar = ({ children }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const toggleLabel = isCollapsed ? "Show sidebar" : "Hide sidebar";

  return (
    <div
      className={`pointer-events-none fixed top-5 left-5 z-10 w-64 max-w-[calc(100vw-4rem)] transition-transform duration-200 ease-out motion-reduce:transition-none ${
        isCollapsed ? "-translate-x-[calc(100%+1.25rem)]" : "translate-x-0"
      }`}
    >
      <div
        inert={isCollapsed}
        className="pointer-events-auto flex max-h-[calc(100dvh-2.5rem)] flex-col gap-3"
      >
        {children}
      </div>
      <button
        type="button"
        onClick={() => setIsCollapsed((collapsed) => !collapsed)}
        title={toggleLabel}
        className="pointer-events-auto absolute top-0 left-full ml-2 grid h-9 w-8 cursor-pointer place-items-center rounded-lg border border-white/15 bg-slate-950/80 text-slate-300 shadow-xl backdrop-blur-sm transition-colors hover:bg-slate-800/95 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300 motion-reduce:transition-none"
      >
        <span className="sr-only">{toggleLabel}</span>
        <svg
          className={`size-4 ${isCollapsed ? "rotate-180" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m14 6-6 6 6 6" />
        </svg>
      </button>
    </div>
  );
};
