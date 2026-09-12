import { describe, expect, it } from "vitest";
import { toPlaneFeatureCollection } from "./toPlaneFeatureCollection";

describe("toPlaneFeatureCollection", () => {
  it("returns an empty feature collection for no planes", () => {
    expect(toPlaneFeatureCollection([])).toEqual({ type: "FeatureCollection", features: [] });
  });

  it("converts multiple planes with correct coordinate order and properties", () => {
    expect(
      toPlaneFeatureCollection([
        { id: "plane-1", longitude: 19, latitude: 47, altitude: 1000, color: "red" },
        { id: "plane-2", longitude: -73, latitude: 40, altitude: 2000, color: "blue" },
      ]),
    ).toEqual({
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: { type: "Point", coordinates: [19, 47] },
          properties: { planeId: "plane-1", altitude: 1000, color: "red" },
        },
        {
          type: "Feature",
          geometry: { type: "Point", coordinates: [-73, 40] },
          properties: { planeId: "plane-2", altitude: 2000, color: "blue" },
        },
      ],
    });
  });
});
