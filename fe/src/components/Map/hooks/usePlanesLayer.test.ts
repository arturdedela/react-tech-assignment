// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react";
import type { Map } from "maplibre-gl";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { PlaneBasic } from "../../../types";
import type { PlaneFeatureCollection } from "../types";
import { toPlaneFeatureCollection } from "../utils/toPlaneFeatureCollection";
import { usePlanesLayer } from "./usePlanesLayer";

const planes: PlaneBasic[] = [
  { id: "plane-1", longitude: 19, latitude: 47, altitude: 1000, color: "red" },
];

// Model only source availability, image loading, and events used by this hook.
function createMap() {
  const image = { data: { width: 1, height: 1, data: new Uint8ClampedArray(4) } };
  let resolveImage!: (loadedImage: typeof image) => void;
  const pendingImage = new Promise<typeof image>((resolve) => {
    resolveImage = resolve;
  });
  const canvas = document.createElement("canvas");
  const listeners = new globalThis.Map<string, (event: unknown) => void>();
  let data: PlaneFeatureCollection | undefined;
  const source = {
    setData: vi.fn((next: PlaneFeatureCollection) => {
      data = next;
    }),
  };
  const map = {
    loadImage: vi.fn(() => pendingImage),
    addImage: vi.fn(),
    removeImage: vi.fn(),
    addSource: vi.fn((_id: string, options: { data: PlaneFeatureCollection }) => {
      data = options.data;
    }),
    getSource: vi.fn(() => (data ? source : undefined)),
    removeSource: vi.fn(() => {
      data = undefined;
    }),
    addLayer: vi.fn(),
    removeLayer: vi.fn(),
    setFilter: vi.fn(),
    getCanvas: vi.fn(() => canvas),
    on: vi.fn((event: string, _layer: string, handler: (event: unknown) => void) => {
      listeners.set(event, handler);
    }),
    off: vi.fn((event: string, _layer: string, handler: (event: unknown) => void) => {
      if (listeners.get(event) === handler) listeners.delete(event);
    }),
  };
  return {
    map,
    source,
    canvas,
    image,
    getData: () => data,
    emit: (event: string, payload: unknown = {}) => {
      act(() => listeners.get(event)?.(payload));
    },
    finishLoading: async () => {
      await act(async () => {
        resolveImage(image);
        await pendingImage;
      });
    },
  };
}

function setup() {
  const mock = createMap();
  const options = {
    map: mock.map as unknown as Map,
    planeIconUrl: "/plane.png",
    planes,
    hiddenPlaneId: null as string | null,
    onPlaneClick: vi.fn(),
  };
  const hook = renderHook(usePlanesLayer, { initialProps: options });
  return { ...mock, ...hook, options };
}

describe("usePlanesLayer", () => {
  afterEach(cleanup);

  it("creates the source and layer only after the icon loads", async () => {
    const { map, image, finishLoading } = setup();
    expect(map.loadImage).toHaveBeenCalledExactlyOnceWith("/plane.png");
    expect(map.addImage).not.toHaveBeenCalled();
    expect(map.addSource).not.toHaveBeenCalled();
    expect(map.addLayer).not.toHaveBeenCalled();

    await finishLoading();

    expect(map.addImage).toHaveBeenCalledExactlyOnceWith("plane-icon", image.data, { sdf: true });
    expect(map.addSource).toHaveBeenCalledExactlyOnceWith(
      "planes-source",
      expect.objectContaining({ type: "geojson" }),
    );
    expect(map.addLayer).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ id: "planes-layer", source: "planes-source", type: "symbol" }),
    );
  });

  it("populates the source with planes available before the icon loads", async () => {
    const { finishLoading, getData } = setup();
    await finishLoading();
    expect(getData()).toEqual(toPlaneFeatureCollection(planes));
  });

  it("updates source data when planes change", async () => {
    const { finishLoading, rerender, options, getData, map } = setup();
    await finishLoading();
    const updatedPlanes = [{ ...planes[0]!, longitude: 20 }];

    rerender({ ...options, planes: updatedPlanes });

    expect(getData()).toEqual(toPlaneFeatureCollection(updatedPlanes));
    expect(map.addSource).toHaveBeenCalledTimes(1);
    expect(map.addLayer).toHaveBeenCalledTimes(1);
  });

  it("handles valid plane clicks and ignores missing or invalid features", async () => {
    const { finishLoading, emit, options } = setup();
    await finishLoading();
    for (const payload of [
      {},
      { features: [] },
      { features: [{ type: "Feature", geometry: null, properties: null }] },
      { features: [{ type: "Feature", geometry: null, properties: {} }] },
    ]) {
      emit("click", payload);
    }
    expect(options.onPlaneClick).not.toHaveBeenCalled();

    emit("click", { features: toPlaneFeatureCollection(planes).features });
    expect(options.onPlaneClick).toHaveBeenCalledExactlyOnceWith("plane-1");
  });

  it("uses the latest click callback after rerendering", async () => {
    const { finishLoading, emit, options, rerender, map } = setup();
    await finishLoading();
    const onPlaneClick = vi.fn();
    rerender({ ...options, onPlaneClick });

    emit("click", { features: toPlaneFeatureCollection(planes).features });

    expect(onPlaneClick).toHaveBeenCalledExactlyOnceWith("plane-1");
    expect(options.onPlaneClick).not.toHaveBeenCalled();
    expect(map.addLayer).toHaveBeenCalledTimes(1);
  });

  it("hides the selected plane and clears the filter when selection is removed", async () => {
    const { finishLoading, rerender, options, map } = setup();
    await finishLoading();
    rerender({ ...options, hiddenPlaneId: "plane-1" });
    expect(map.setFilter).toHaveBeenLastCalledWith("planes-layer", [
      "!=",
      ["get", "planeId"],
      "plane-1",
    ]);

    rerender({ ...options, hiddenPlaneId: null });
    expect(map.setFilter).toHaveBeenLastCalledWith("planes-layer", null);
  });

  it("changes the cursor on mouse enter and leave", async () => {
    const { finishLoading, emit, canvas } = setup();
    await finishLoading();
    emit("mouseenter");
    expect(canvas.style.cursor).toBe("pointer");
    emit("mouseleave");
    expect(canvas.style.cursor).toBe("");
  });

  it("removes listeners, layer, source, and image on cleanup", async () => {
    const { finishLoading, unmount, map, emit, options } = setup();
    await finishLoading();
    unmount();

    expect(map.off).toHaveBeenCalledTimes(3);
    for (const [event, layer, handler] of map.on.mock.calls) {
      expect(map.off).toHaveBeenCalledWith(event, layer, handler);
    }
    expect(map.removeLayer).toHaveBeenCalledExactlyOnceWith("planes-layer");
    expect(map.removeSource).toHaveBeenCalledExactlyOnceWith("planes-source");
    expect(map.removeImage).toHaveBeenCalledExactlyOnceWith("plane-icon");
    emit("click", { features: toPlaneFeatureCollection(planes).features });
    expect(options.onPlaneClick).not.toHaveBeenCalled();
  });

  it("does not add resources when the icon finishes loading after unmount", async () => {
    const { unmount, finishLoading, map } = setup();
    unmount();
    await finishLoading();

    expect(map.addImage).not.toHaveBeenCalled();
    expect(map.addSource).not.toHaveBeenCalled();
    expect(map.addLayer).not.toHaveBeenCalled();
  });
});
