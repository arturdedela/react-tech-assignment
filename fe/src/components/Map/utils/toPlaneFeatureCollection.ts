import type { PlaneBasic } from "../../../types";
import type { PlaneFeatureCollection } from "../types";

export const toPlaneFeatureCollection = (planes: PlaneBasic[]): PlaneFeatureCollection => {
  return {
    type: "FeatureCollection",
    features: planes.map((plane) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [plane.longitude, plane.latitude],
      },
      properties: {
        planeId: plane.id,
        color: plane.color,
        altitude: plane.altitude,
      },
    })),
  };
};
