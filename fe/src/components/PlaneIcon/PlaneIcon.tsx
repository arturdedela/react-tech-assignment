type PlaneIconProps = {
  color: string;
};

export const PlaneIcon = ({ color }: PlaneIconProps) => (
  <span
    className="grid size-9 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/5"
    style={{ color }}
  >
    <svg className="size-6 rotate-45" viewBox="0 0 24 24" fill="currentColor">
      <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z" />
    </svg>
  </span>
);
