// @vitest-environment jsdom
import { cleanup, renderHook } from "@testing-library/react";
import type { Map } from "maplibre-gl";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useSelectedPlaneFocus } from "./useSelectedPlaneFocus";

const plane = { id: "plane-1", longitude: 19, latitude: 47 };

function setup(pitch = 60) {
  const flyTo = vi.fn();
  const getPitch = vi.fn(() => pitch);
  const map = { flyTo, getPitch } as unknown as Map;
  return { map, flyTo };
}

describe("useSelectedPlaneFocus", () => {
  afterEach(cleanup);

  it("focuses the selected plane using longitude before latitude", () => {
    const { map, flyTo } = setup();
    renderHook(() => useSelectedPlaneFocus({ map, selectedPlane: plane }));

    expect(flyTo).toHaveBeenCalledExactlyOnceWith({
      center: [19, 47],
      zoom: 8,
      pitch: 60,
      offset: [0, -250],
    });
  });

  it("refocuses for a new plane ID but not position updates", () => {
    const { map, flyTo } = setup();
    const { rerender } = renderHook(
      ({ selectedPlane }) => useSelectedPlaneFocus({ map, selectedPlane }),
      { initialProps: { selectedPlane: plane } },
    );

    rerender({ selectedPlane: { ...plane, longitude: 20, latitude: 48 } });
    expect(flyTo).toHaveBeenCalledTimes(1);

    rerender({ selectedPlane: { id: "plane-2", longitude: 21, latitude: 49 } });
    expect(flyTo).toHaveBeenCalledTimes(2);
    expect(flyTo).toHaveBeenLastCalledWith(expect.objectContaining({ center: [21, 49] }));
  });

  it("does nothing without a map or selected plane", () => {
    const { map, flyTo } = setup();
    renderHook(() => useSelectedPlaneFocus({ map: null, selectedPlane: plane }));
    renderHook(() => useSelectedPlaneFocus({ map, selectedPlane: null }));
    expect(flyTo).not.toHaveBeenCalled();
  });
});
